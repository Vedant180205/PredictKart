import asyncio
import uuid
from datetime import datetime, timedelta
from sqlalchemy import text
from app.core.database import SessionLocal
from app.models.models import UpcomingSale

async def populate_sales():
    db = SessionLocal()
    try:
        # Create table if it doesn't exist (SQLAlchemy usually does this, but for ARRAY type we might need a manual push if not using migrations)
        # However, I'll just use the session to add objects.
        
        # Define some 2026 sales
        sales_data = [
            {
                "sale_name": "Republic Day Sale",
                "platform": "amazon",
                "start_date": datetime(2026, 1, 15),
                "end_date": datetime(2026, 1, 20),
                "categories": ["electronics", "fashion", "home"],
                "confidence": "high",
                "year": 2026
            },
            {
                "sale_name": "Big Saving Days",
                "platform": "flipkart",
                "start_date": datetime(2026, 3, 10),
                "end_date": datetime(2026, 3, 15),
                "categories": ["electronics", "fashion"],
                "confidence": "high",
                "year": 2026
            },
            {
                "sale_name": "Prime Day 2026",
                "platform": "amazon",
                "start_date": datetime(2026, 7, 12),
                "end_date": datetime(2026, 7, 13),
                "categories": ["all"],
                "confidence": "medium",
                "year": 2026
            },
            {
                "sale_name": "Big Billion Days",
                "platform": "flipkart",
                "start_date": datetime(2026, 10, 5),
                "end_date": datetime(2026, 10, 10),
                "categories": ["all"],
                "confidence": "high",
                "year": 2026
            },
            {
                "sale_name": "Great Indian Festival",
                "platform": "amazon",
                "start_date": datetime(2026, 10, 5),
                "end_date": datetime(2026, 10, 12),
                "categories": ["all"],
                "confidence": "high",
                "year": 2026
            },
            {
                "sale_name": "Holi Sale",
                "platform": "myntra",
                "start_date": datetime(2026, 3, 20),
                "end_date": datetime(2026, 3, 25),
                "categories": ["fashion"],
                "confidence": "medium",
                "year": 2026
            },
            {
                "sale_name": "Black Friday Sale",
                "platform": "amazon",
                "start_date": datetime(2026, 11, 27),
                "end_date": datetime(2026, 11, 30),
                "categories": ["electronics", "fashion"],
                "confidence": "high",
                "year": 2026
            }
        ]
        
        for data in sales_data:
            # Check if exists
            result = await db.execute(text("SELECT id FROM upcoming_sales WHERE sale_name = :name AND platform = :platform"), {"name": data["sale_name"], "platform": data["platform"]})
            if not result.scalar():
                sale = UpcomingSale(
                    id=uuid.uuid4(),
                    **data
                )
                db.add(sale)
        
        await db.commit()
        print("Upcoming sales populated successfully!")
    except Exception as e:
        print(f"Error populating sales: {e}")
        await db.rollback()
    finally:
        await db.close()

if __name__ == "__main__":
    asyncio.run(populate_sales())
