import asyncio
import sys
from pathlib import Path
sys.path.append(str(Path(__file__).parent.parent / "backend"))

from app.core.database import engine
from sqlalchemy import text

async def add_column():
    async with engine.begin() as conn:
        await conn.execute(text("ALTER TABLE products ADD COLUMN IF NOT EXISTS image_url TEXT"))
    print("[OK] Added image_url column.")

if __name__ == "__main__":
    asyncio.run(add_column())
