import asyncio
import sys
from pathlib import Path

# Add backend to path
sys.path.append(str(Path(__file__).parent.parent / "backend"))

from app.core.database import engine, Base
from app.models import models  # This imports all models

async def create_tables():
    async with engine.begin() as conn:
        # This will create all tables defined in Base
        await conn.run_sync(Base.metadata.create_all)
    print("[OK] All tables created successfully!")

if __name__ == "__main__":
    asyncio.run(create_tables())