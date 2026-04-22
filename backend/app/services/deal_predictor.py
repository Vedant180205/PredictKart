import os
import groq
from typing import Dict, Any, List
from datetime import datetime, timedelta
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func, and_
from app.models.models import Product, PriceHistory, UpcomingSale

groq_client = groq.Groq(api_key=os.getenv("GROQ_API_KEY"))
MODEL = "llama-3.1-8b-instant"

async def get_relevant_upcoming_sales(db: AsyncSession, product_title: str, product_specs: dict = None) -> List[Dict[str, Any]]:
    """Fetch upcoming sales relevant to the product."""
    today = datetime.utcnow()
    # Get all active sales starting from today or currently running
    result = await db.execute(
        select(UpcomingSale).where(
            and_(
                UpcomingSale.is_active == True,
                UpcomingSale.end_date >= today
            )
        ).order_by(UpcomingSale.start_date)
    )
    all_sales = result.scalars().all()
    
    # Simple category detection from product title
    product_lower = product_title.lower()
    detected_categories = set()
    keywords = {
        "electronics": ["laptop", "phone", "mobile", "tablet", "camera", "tv", "electronics", "headphone", "earbud", "smartwatch"],
        "fashion": ["shirt", "dress", "jeans", "jacket", "fashion", "shoe", "clothing", "apparel", "watch"],
        "home": ["sofa", "bed", "table", "chair", "home", "furniture", "kitchen", "appliance", "fridge", "oven"]
    }
    
    for cat, kws in keywords.items():
        if any(kw in product_lower for kw in kws):
            detected_categories.add(cat)
    
    # If product_specs contains category, add it
    if product_specs and product_specs.get("category"):
        detected_categories.add(product_specs.get("category").lower())
    
    # If no category detected, assume "all"
    if not detected_categories:
        detected_categories.add("all")
    
    relevant = []
    for sale in all_sales:
        # If sale categories include "all" or any detected category, it's relevant
        sale_cats = set([c.lower() for c in sale.categories]) if sale.categories else set(["all"])
        if "all" in sale_cats or sale_cats.intersection(detected_categories):
            relevant.append({
                "name": sale.sale_name,
                "platform": sale.platform,
                "start_date": sale.start_date.isoformat(),
                "end_date": sale.end_date.isoformat(),
                "confidence": sale.confidence
            })
    return relevant

def format_sales_text(sales: List[Dict[str, Any]]) -> str:
    if not sales:
        return "No upcoming sales events are currently scheduled."
    lines = []
    for sale in sales:
        start = datetime.fromisoformat(sale["start_date"]).strftime("%b %d")
        end = datetime.fromisoformat(sale["end_date"]).strftime("%b %d")
        lines.append(f"- {sale['name']} on {sale['platform']}: {start} – {end} (confidence: {sale['confidence']})")
    return "\n".join(lines)


async def get_product_price_history(db: AsyncSession, product_id: str, days: int = 30) -> List[Dict[str, Any]]:
    """Fetch price history for the last `days` days."""
    cutoff = datetime.utcnow() - timedelta(days=days)
    result = await db.execute(
        select(PriceHistory)
        .where(PriceHistory.product_id == product_id, PriceHistory.timestamp >= cutoff)
        .order_by(PriceHistory.timestamp)
    )
    history = result.scalars().all()
    return [{"timestamp": h.timestamp.isoformat(), "price": h.price} for h in history]

def calculate_price_stats(history: List[Dict[str, Any]], current_price: float) -> Dict[str, Any]:
    """Calculate basic statistics from price history."""
    if not history:
        return {"lowest": current_price, "average": current_price, "highest": current_price, "drop_percent": 0}
    prices = [h["price"] for h in history]
    lowest = min(prices)
    average = sum(prices) / len(prices)
    highest = max(prices)
    drop_percent = ((highest - current_price) / highest) * 100 if highest > 0 else 0
    return {
        "lowest": lowest,
        "average": average,
        "highest": highest,
        "drop_percent": drop_percent
    }

def format_price_history_text(history: List[Dict[str, Any]], max_entries: int = 10) -> str:
    """Format recent price history as a readable string."""
    if not history:
        return "No price history available."
    # Show last `max_entries` entries
    recent = history[-max_entries:]
    lines = []
    for entry in recent:
        dt = datetime.fromisoformat(entry["timestamp"]).strftime("%b %d")
        lines.append(f"- {dt}: ₹{entry['price']:.2f}")
    return "\n".join(lines)

async def generate_deal_report(db: AsyncSession, product_id: str) -> Dict[str, Any]:
    """Generate a buying report using Groq."""
    # Fetch product
    product_result = await db.execute(select(Product).where(Product.id == product_id))
    product = product_result.scalar_one_or_none()
    if not product:
        raise ValueError("Product not found")
    
    # Fetch price history
    history = await get_product_price_history(db, product_id)
    stats = calculate_price_stats(history, product.current_price)
    history_text = format_price_history_text(history)
    
    # Get upcoming sales
    upcoming_sales = await get_relevant_upcoming_sales(db, product.title, product.specifications)
    sales_text = format_sales_text(upcoming_sales)
    
    # Build enhanced prompt
    prompt = f"""You are a deal analysis expert. Analyze the following product and its price history, and consider upcoming sales events. Answer with a JSON object containing:
- "score": integer 0-100
- "recommendation": "Buy now", "Wait", or "Avoid"
- "reasoning": a short, helpful explanation (2-3 sentences) that mentions upcoming sales if relevant.

Product: {product.title}
Current price: ₹{product.current_price:.2f}
Lowest price ever recorded: ₹{stats['lowest']:.2f}
Average price over last 30 days: ₹{stats['average']:.2f}
Price drop from highest: {stats['drop_percent']:.1f}%

Recent price history:
{history_text}

Upcoming sales events:
{sales_text}

If an upcoming sale is relevant and likely to offer a better price, recommend waiting and mention which sale. If the current price is already excellent, recommend buying now. Return ONLY valid JSON.
"""
    
    try:
        chat_completion = groq_client.chat.completions.create(
            messages=[{"role": "user", "content": prompt}],
            model=MODEL,
            temperature=0.3,
            max_tokens=400,
            response_format={"type": "json_object"}
        )
        import json
        result = json.loads(chat_completion.choices[0].message.content)
        # Ensure all keys exist
        return {
            "score": result.get("score", 50),
            "recommendation": result.get("recommendation", "Wait"),
            "reasoning": result.get("reasoning", "Not enough data to decide."),
            "current_price": product.current_price,
            "lowest_price": stats["lowest"],
            "average_price": stats["average"],
            "upcoming_sales": upcoming_sales
        }
    except Exception as e:
        raise Exception(f"Groq analysis failed: {str(e)}")
