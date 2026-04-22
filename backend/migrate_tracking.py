import asyncio
from sqlalchemy import text
from app.core.database import AsyncSessionLocal

async def migrate():
    async with AsyncSessionLocal() as session:
        print("Adding last_price and last_checked columns to user_tracking table...")
        try:
            # Check if columns exist first (optional but safer)
            await session.execute(text("ALTER TABLE user_tracking ADD COLUMN IF NOT EXISTS last_price FLOAT;"))
            await session.execute(text("ALTER TABLE user_tracking ADD COLUMN IF NOT EXISTS last_checked TIMESTAMP WITH TIME ZONE;"))
            await session.commit()
            print("Migration successful!")
        except Exception as e:
            print(f"Migration failed: {e}")

if __name__ == "__main__":
    asyncio.run(migrate())
