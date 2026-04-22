import asyncio
import os
from sqlalchemy import text
from app.core.database import AsyncSessionLocal

async def migrate():
    async with AsyncSessionLocal() as session:
        print("Running migration...")
        try:
            # Adding columns if they don't exist
            await session.execute(text("ALTER TABLE products ADD COLUMN IF NOT EXISTS short_description TEXT;"))
            await session.execute(text("ALTER TABLE products ADD COLUMN IF NOT EXISTS full_description TEXT;"))
            await session.execute(text("ALTER TABLE products ADD COLUMN IF NOT EXISTS specifications JSONB;"))
            await session.execute(text("ALTER TABLE products ADD COLUMN IF NOT EXISTS rating FLOAT;"))
            await session.execute(text("ALTER TABLE products ADD COLUMN IF NOT EXISTS reviews_count INTEGER;"))
            await session.commit()
            print("Migration successful!")
        except Exception as e:
            print(f"Migration failed: {e}")
            await session.rollback()

if __name__ == "__main__":
    asyncio.run(migrate())
