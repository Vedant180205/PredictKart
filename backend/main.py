import os
import json
from typing import Optional, List, Dict, Any
from groq import Groq
from urllib.parse import quote
from fastapi import FastAPI, Depends, HTTPException, status
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func
from datetime import datetime, timedelta
from app.core.database import get_db, AsyncSessionLocal
from app.models.models import User, Product, PriceHistory, UserTracking, Alert
from app.schemas.user import UserCreate, UserResponse, UserLogin
from app.core.security import hash_password, verify_password
from app.services.scraperapi import scrape_and_parse_product
from app.services.serpapi import search_google_shopping as serp_search_google_shopping
from app.services.flipkart_search import search_flipkart
from app.services.amazon_search import search_amazon
from apscheduler.schedulers.asyncio import AsyncIOScheduler

app = FastAPI(title="Prerdict Cart API", version="1.0")

CATEGORY_TO_SITES = {
    "electronics": ["amazon", "flipkart"],
    "clothing": ["amazon", "flipkart", "myntra", "ajio"],
    "books": ["amazon", "flipkart"],
    "home": ["amazon", "flipkart"],
    "toys": ["amazon", "flipkart"],
    "grocery": ["amazon", "flipkart"],
    "other": ["amazon", "flipkart"],  # fallback
}

# Allow Next.js frontend to call the backend
origins = [
    "http://localhost:3000",
    "http://127.0.0.1:3000",
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/")
async def root():
    return {"message": "Prerdict Cart API is running"}

@app.get("/api/ping")
async def ping():
    return {"status": "alive"}

@app.get("/health")
async def health_check(db: AsyncSession = Depends(get_db)):
    try:
        await db.execute("SELECT 1")
        return {"status": "ok", "database": "connected"}
    except Exception as e:
        return {"status": "error", "database": str(e)}

@app.post("/signup", response_model=UserResponse, status_code=status.HTTP_201_CREATED)
async def signup(user_data: UserCreate, db: AsyncSession = Depends(get_db)):
    # Check if user already exists
    existing_user = await db.execute(select(User).where(User.email == user_data.email))
    if existing_user.scalar_one_or_none():
        raise HTTPException(status_code=400, detail="Email already registered")
    
    # Create new user
    new_user = User(
        email=user_data.email,
        hashed_password=hash_password(user_data.password),
        full_name=user_data.full_name,
    )
    db.add(new_user)
    await db.commit()
    await db.refresh(new_user)
    return new_user

@app.post("/login", response_model=UserResponse)
async def login(user_data: UserLogin, db: AsyncSession = Depends(get_db)):
    user = await db.execute(select(User).where(User.email == user_data.email))
    user = user.scalar_one_or_none()
    
    if not user or not verify_password(user_data.password, user.hashed_password):
        raise HTTPException(status_code=401, detail="Invalid email or password")
        
    return user

@app.post("/api/compare")
async def compare_product(url: str, db: AsyncSession = Depends(get_db)):
    # Check cache
    existing = await db.execute(select(Product).where(Product.url == url))
    product = existing.scalar_one_or_none()
    
    # Cache logic: if less than 24h old, return cached data
    if product and product.last_checked and (datetime.utcnow() - product.last_checked.replace(tzinfo=None)) < timedelta(hours=24):
        return {
            "id": product.id,
            "title": product.title,
            "current_price": product.current_price,
            "platform": product.platform,
            "image_url": product.image_url,
            "short_description": product.short_description,
            "full_description": product.full_description,
            "specifications": product.specifications,
            "rating": product.rating,
            "reviews_count": product.reviews_count,
            "url": product.url
        }
    
    try:
        # Fetch fresh data using ScraperAPI
        data = await scrape_and_parse_product(url)
        
        if product:
            # Update existing product
            product.title = data["title"]
            product.current_price = data["current_price"]
            product.image_url = data["image_url"]
            product.short_description = data["short_description"]
            product.full_description = data["full_description"]
            product.specifications = data["specifications"]
            product.rating = data["rating"]
            product.reviews_count = data["reviews_count"]
            product.last_checked = datetime.utcnow()
        else:
            # Create new product
            product = Product(
                url=url,
                title=data["title"],
                platform=data["platform"],
                current_price=data["current_price"],
                currency="INR",
                image_url=data["image_url"],
                short_description=data["short_description"],
                full_description=data["full_description"],
                specifications=data["specifications"],
                rating=data["rating"],
                reviews_count=data["reviews_count"],
                last_checked=datetime.utcnow()
            )
            db.add(product)
            await db.flush()
        
        # Add price history entry
        price_history = PriceHistory(
            product_id=product.id,
            price=data["current_price"]
        )
        db.add(price_history)
        await db.commit()
        await db.refresh(product)
        
        return {
            "id": product.id,
            "title": product.title,
            "current_price": product.current_price,
            "platform": product.platform,
            "image_url": product.image_url,
            "short_description": product.short_description,
            "full_description": product.full_description,
            "specifications": product.specifications,
            "rating": product.rating,
            "reviews_count": product.reviews_count,
            "url": product.url
        }
    except Exception as e:
        await db.rollback()
        raise HTTPException(status_code=400, detail=str(e))
    finally:
        pass

# Initialize Groq client
groq_client = Groq(api_key=os.getenv("GROQ_API_KEY"))

# Define a simple tool
tools = [
    {
        "type": "function",
        "function": {
            "name": "get_current_time",
            "description": "Get the current date and time",
            "parameters": {
                "type": "object",
                "properties": {},
                "required": [],
            },
        },
    },
    {
        "type": "function",
        "function": {
            "name": "search_product",
            "description": "Search for a product across e-commerce sites",
            "parameters": {
                "type": "object",
                "properties": {
                    "product_name": {
                        "type": "string",
                        "description": "The name of the product to search for"
                    },
                    "max_price": {
                        "type": "number",
                        "description": "Maximum price (optional)"
                    },
                    "preferred_sites": {
                        "type": "array",
                        "items": {"type": "string"},
                        "description": "List of preferred e-commerce sites (amazon, flipkart, myntra)"
                    }
                },
                "required": ["product_name"],
            },
        },
    },
    {
        "type": "function",
        "function": {
            "name": "generate_search_url",
            "description": "Generate a search URL for a given product on a specific e-commerce site",
            "parameters": {
                "type": "object",
                "properties": {
                    "product_name": {
                        "type": "string",
                        "description": "The product name to search for"
                    },
                    "site": {
                        "type": "string",
                        "enum": ["amazon", "flipkart", "myntra"],
                        "description": "The e-commerce site"
                    }
                },
                "required": ["product_name", "site"],
            },
        },
    }
]

async def execute_tool_call(tool_call):
    func_name = tool_call.function.name
    args = json.loads(tool_call.function.arguments)
    
    if func_name == "get_current_time":
        return {"current_time": datetime.now().isoformat()}
    
    elif func_name == "search_product":
        return {
            "tool": "search_product",
            "params": args,
            "message": f"Will search for '{args.get('product_name')}' with filters: max_price={args.get('max_price')}, sites={args.get('preferred_sites')}"
        }
    
    elif func_name == "generate_search_url":
        product = args.get("product_name")
        site = args.get("site")
        # Simple URL generation (actual encoding will come later)
        if site == "amazon":
            url = f"https://www.amazon.in/s?k={product.replace(' ', '+')}"
        elif site == "flipkart":
            url = f"https://www.flipkart.com/search?q={product.replace(' ', '%20')}"
        elif site == "myntra":
            url = f"https://www.myntra.com/{product.replace(' ', '-')}"
        else:
            url = None
        return {
            "tool": "generate_search_url",
            "site": site,
            "url": url
        }
    
    else:
        return {"error": f"Unknown tool: {func_name}"}

@app.post("/ai/search")
async def ai_search(request: dict):
    query = request.get("query")
    if not query:
        raise HTTPException(status_code=400, detail="Missing 'query' field")
    
    try:
        response = groq_client.chat.completions.create(
            model="llama-3.1-8b-instant",
            messages=[
                {"role": "system", "content": "You are a helpful e-commerce assistant. Use tools when appropriate."},
                {"role": "user", "content": query}
            ],
            tools=tools,
            tool_choice="auto",
        )
        
        message = response.choices[0].message
        if message.tool_calls:
            # Execute the first tool call (simplified)
            tool_call = message.tool_calls[0]
            result = await execute_tool_call(tool_call)
            return {"tool_called": tool_call.function.name, "result": result}
        else:
            return {"response": message.content}
    
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/api/classify-product")
async def classify_product(title: str):
    """Use Groq to classify product into a category."""
    prompt = f"Classify the following product into one of these categories: electronics, clothing, books, home, toys, grocery, other. Return only the category name.\n\nProduct: {title}"
    response = groq_client.chat.completions.create(
        model="llama-3.1-8b-instant",
        messages=[{"role": "user", "content": prompt}],
        temperature=0,
    )
    category = response.choices[0].message.content.strip().lower()
    if category not in CATEGORY_TO_SITES:
        category = "other"
    return {"category": category, "sites": CATEGORY_TO_SITES.get(category, [])}

@app.post("/api/ai-assistant")
async def ai_assistant(request: dict, db: AsyncSession = Depends(get_db)):
    query = request.get("query")
    product_id = request.get("product_id")
    offers = request.get("offers")  # list of dicts

    if not query:
        raise HTTPException(status_code=400, detail="Missing 'query' field")

    product = None
    if product_id:
        # Use simple string ID check or integer if stored as such
        # Based on models, product.id might be UUID or string
        result = await db.execute(select(Product).where(Product.id == product_id))
        product_row = result.scalar_one_or_none()
        if product_row:
            product = {
                "id": str(product_row.id),
                "title": product_row.title,
                "current_price": product_row.current_price,
                "specifications": product_row.specifications or {}
            }

    try:
        from app.services.ai_assistant import get_ai_answer
        answer = await get_ai_answer(query, product, offers)
        return {"answer": answer}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))



@app.post("/api/google-shopping-search")
async def google_shopping_search(request: dict):
    product = request.get("product")
    if not product:
        raise HTTPException(status_code=400, detail="Missing 'product' field")
    results = await search_google_shopping(product, max_results=10)
    return {"product": product, "results": results}

@app.post("/api/cross-compare")
async def cross_compare(
    product_title: str, 
    source_platform: Optional[str] = None, 
    source_url: Optional[str] = None, 
    source_price: Optional[float] = None,
    db: AsyncSession = Depends(get_db)
):
    """Cross-compare product prices across platforms using ScraperAPI and SerpAPI."""
    try:
        offers = []
        
        # 0. Add source product if provided
        if source_platform and source_url and source_price:
            offers.append({
                "platform": source_platform.capitalize(),
                "price": f"₹{source_price:,.2f}",
                "url": source_url,
                "title": product_title
            })

        # Determine which platform to search directly
        # If source is Amazon (or unspecified), search Flipkart
        # If source is Flipkart, search Amazon
        platforms_to_search = []
        if source_platform == "flipkart":
            platforms_to_search = ["amazon"]
        elif source_platform == "amazon":
            platforms_to_search = ["flipkart"]
        else:
            # Fallback for old calls: try both
            platforms_to_search = ["flipkart", "amazon"]

        # 1. Fetch direct data via ScraperAPI
        for platform in platforms_to_search:
            try:
                if platform == "flipkart":
                    data = await search_flipkart(product_title)
                else:
                    data = await search_amazon(product_title)
                    
                if data and data.get("price"):
                    offers.append({
                        "platform": platform.capitalize(),
                        "price": f"₹{data['price']:,.2f}",
                        "url": data["url"],
                        "title": data.get("title", "N/A")
                    })
            except Exception as e:
                print(f"{platform.capitalize()} search failed: {e}")
            
        # 2. Add a direct Google Search link for broader comparison
        search_query = quote(product_title)
        google_search_url = f"https://www.google.com/search?q={search_query}&tbm=shop"
        
        offers.append({
            "platform": "Google Search",
            "price": "Check All Stores",
            "url": google_search_url,
            "title": f"Compare '{product_title}' across 50+ stores"
        })
            
        return {"offers": offers}
    except Exception as e:
        print(f"Error in cross_compare: {e}")
        return {"offers": [], "error": str(e)}

# Mock Auth Dependency
async def get_current_user(db: AsyncSession = Depends(get_db)):
    # In a real app, this would verify a JWT
    # For now, we'll return the ID of the first user in the DB, or a fixed one for testing
    try:
        result = await db.execute(select(User))
        user = result.scalars().first()
        if not user:
            # Create a default user if none exists
            user = User(email="test@example.com", hashed_password="mock", full_name="Test User")
            db.add(user)
            await db.commit()
            await db.refresh(user)
        return user.id
    except Exception as e:
        print(f"Auth error: {e}")
        # Return a fixed UUID or raise if preferred
        # Let's try to return a valid UUID for a mock user if DB fails
        # But raising is safer for debugging
        raise HTTPException(status_code=500, detail="Database error in auth")

@app.post("/api/track")
async def track_product(request: dict, db: AsyncSession = Depends(get_db), user_id: str = Depends(get_current_user)):
    product_id = request.get("product_id")
    target_price = request.get("target_price")
    if not product_id or target_price is None:
        raise HTTPException(status_code=400, detail="Missing product_id or target_price")
    
    # Check if already tracking
    existing = await db.execute(
        select(UserTracking).where(UserTracking.user_id == user_id, UserTracking.product_id == product_id)
    )
    track = existing.scalar_one_or_none()
    if track:
        # Update target price
        track.target_price = target_price
        track.is_active = True
    else:
        track = UserTracking(
            user_id=user_id,
            product_id=product_id,
            target_price=target_price,
            is_active=True
        )
        db.add(track)
    await db.commit()
    return {"message": "Product tracked successfully"}

@app.get("/api/user-tracking")
async def get_user_tracking(db: AsyncSession = Depends(get_db), user_id: str = Depends(get_current_user)):
    result = await db.execute(
        select(UserTracking, Product)
        .join(Product, UserTracking.product_id == Product.id)
        .where(UserTracking.user_id == user_id, UserTracking.is_active == True)
        .order_by(UserTracking.id.desc()) # Assuming ID is sortable or use a created_at
    )
    items = []
    for track, product in result:
        items.append({
            "tracking_id": str(track.id),
            "product_id": str(product.id),
            "title": product.title,
            "target_price": track.target_price,
            "last_price": track.last_price,
            "current_price": product.current_price,
            "last_checked": track.last_checked.isoformat() if track.last_checked else None,
            "product_url": product.url,
            "image_url": product.image_url,
            "platform": product.platform
        })
    return {"tracked": items}

@app.get("/api/recent-tracking")
async def get_recent_tracking(db: AsyncSession = Depends(get_db), user_id: str = Depends(get_current_user)):
    result = await db.execute(
        select(UserTracking, Product)
        .join(Product, UserTracking.product_id == Product.id)
        .where(UserTracking.user_id == user_id)
        .order_by(UserTracking.id.desc())
        .limit(4)
    )
    items = []
    for track, product in result:
        # Calculate mock drop for visual interest
        drop = product.current_price * 0.05
        items.append({
            "id": str(product.id),
            "name": product.title,
            "price": f"₹{product.current_price:,.0f}",
            "drop": f"↓ ₹{drop:,.0f}",
            "img": product.image_url or "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=400&q=80",
            "platform": product.platform.capitalize(),
            "category": "Electronics" if "phone" in product.title.lower() or "laptop" in product.title.lower() else "General",
            "categoryColor": "bg-blue-100 text-blue-700" if "phone" in product.title.lower() else "bg-gray-100 text-gray-700",
            "dropColor": "text-green-600"
        })
    return items

@app.post("/api/update-track/{tracking_id}")
async def update_track(tracking_id: str, db: AsyncSession = Depends(get_db), user_id: str = Depends(get_current_user)):
    # Get the tracking record
    result = await db.execute(
        select(UserTracking).where(UserTracking.id == tracking_id, UserTracking.user_id == user_id)
    )
    track = result.scalar_one_or_none()
    if not track:
        raise HTTPException(status_code=404, detail="Tracking not found")
    
    # Get the product
    product_result = await db.execute(select(Product).where(Product.id == track.product_id))
    product = product_result.scalar_one_or_none()
    if not product:
        raise HTTPException(status_code=404, detail="Product not found")
    
    # Fetch current price using ScraperAPI
    try:
        product_data = await scrape_and_parse_product(product.url)
        current_price = product_data["current_price"]
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to fetch price: {str(e)}")
    
    # Update tracking record
    track.last_price = current_price
    track.last_checked = datetime.utcnow()
    await db.commit()
    
    message = None
    if current_price <= track.target_price:
        message = f"Price dropped! Current: ₹{current_price}, Target: ₹{track.target_price}"
    else:
        message = f"Current price ₹{current_price} is still above your target ₹{track.target_price}"
    
    return {
        "last_price": current_price,
        "last_checked": track.last_checked.isoformat(),
        "message": message
    }

@app.get("/api/user-stats")
async def get_user_stats(db: AsyncSession = Depends(get_db), user_id: str = Depends(get_current_user)):
    # Count active trackers
    track_count = await db.execute(
        select(func.count(UserTracking.id)).where(UserTracking.user_id == user_id, UserTracking.is_active == True)
    )
    active_trackers = track_count.scalar() or 0
    
    # Count triggered alerts
    alert_count = await db.execute(
        select(func.count(Alert.id)).where(Alert.user_id == user_id)
    )
    alerts_triggered = alert_count.scalar() or 0

    # Get last tracker update time
    last_update_res = await db.execute(
        select(func.max(UserTracking.last_checked)).where(UserTracking.user_id == user_id)
    )
    last_update = last_update_res.scalar()
    
    # Count alerts triggered today
    today_start = datetime.utcnow().replace(hour=0, minute=0, second=0, microsecond=0)
    today_alerts_res = await db.execute(
        select(func.count(Alert.id)).where(Alert.user_id == user_id, Alert.sent_at >= today_start)
    )
    alerts_today = today_alerts_res.scalar() or 0

    # Calculate "Total Saved" (Mock logic: sum of differences for triggered alerts)
    total_saved = alerts_triggered * 450.0 
    
    return {
        "active_trackers": active_trackers,
        "alerts_triggered": alerts_triggered,
        "total_saved": total_saved,
        "last_tracker_update": last_update.isoformat() if last_update else None,
        "alerts_today": alerts_today,
        "scans_today": active_trackers * 2 # Mocking scans for now
    }

from app.services.deal_predictor import generate_deal_report

@app.post("/api/deal-report")
async def deal_report(request: dict, db: AsyncSession = Depends(get_db)):
    product_id = request.get("product_id")
    if not product_id:
        raise HTTPException(status_code=400, detail="Missing product_id")
    try:
        report = await generate_deal_report(db, product_id)
        return report
    except ValueError as e:
        raise HTTPException(status_code=404, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/api/product/{product_id}/price-history")
async def get_price_history(product_id: str, db: AsyncSession = Depends(get_db)):
    result = await db.execute(
        select(PriceHistory).where(PriceHistory.product_id == product_id)
        .order_by(PriceHistory.timestamp)
    )
    history = result.scalars().all()
    return [{"timestamp": h.timestamp.isoformat(), "price": h.price} for h in history]

@app.post("/api/alerts")
async def set_price_alert(
    user_id: str, product_id: str, target_price: float,
    db: AsyncSession = Depends(get_db)
):
    alert = UserTracking(
        user_id=user_id,
        product_id=product_id,
        target_price=target_price,
        is_active=True
    )
    db.add(alert)
    await db.commit()
    return {"message": "Alert set"}

@app.get("/api/alerts/{user_id}")
async def get_user_alerts(user_id: str, db: AsyncSession = Depends(get_db)):
    result = await db.execute(
        select(UserTracking).where(UserTracking.user_id == user_id, UserTracking.is_active == True)
    )
    alerts = result.scalars().all()
    alert_list = []
    for alert in alerts:
        prod_res = await db.execute(select(Product).where(Product.id == alert.product_id))
        product = prod_res.scalar_one_or_none()
        alert_list.append({
            "id": alert.id,
            "product_id": alert.product_id,
            "product_title": product.title if product else "Unknown Product",
            "image_url": product.image_url if product else None,
            "target_price": alert.target_price,
            "current_price": product.current_price if product else None,
            "is_active": alert.is_active
        })
    return alert_list

# Background Job for Price Alerts
async def check_price_alerts():
    print("Running scheduled check_price_alerts...")
    async with AsyncSessionLocal() as session:
        result = await session.execute(select(UserTracking).where(UserTracking.is_active == True))
        alerts = result.scalars().all()
        for alert in alerts:
            prod_res = await session.execute(select(Product).where(Product.id == alert.product_id))
            product = prod_res.scalar_one_or_none()
            if product and product.current_price and product.current_price <= alert.target_price:
                # Mock email by printing to console
                print(f"ALERT: email to user {alert.user_id} - product {product.title} is now ₹{product.current_price}")
                alert.is_active = False
                session.add(alert)
        await session.commit()

scheduler = AsyncIOScheduler()
scheduler.add_job(check_price_alerts, 'interval', hours=6)

@app.on_event("startup")
async def startup_event():
    scheduler.start()

@app.on_event("shutdown")
async def shutdown_event():
    scheduler.shutdown()