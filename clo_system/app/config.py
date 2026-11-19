"""
app/config.py
System Configuration and Database Connection settings.
Can switch seamlessly between local SQLite and remote production PostgreSQL/MySQL.
"""

import os
from pydantic import BaseModel

BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
DATA_DIR = os.path.join(BASE_DIR, "data")
os.makedirs(DATA_DIR, exist_ok=True)

# Default to SQLite file for local zero-configuration execution.
# To connect to a real PostgreSQL database server, simply set the environment variable:
# export DATABASE_URL="postgresql://user:password@localhost:5432/obe_analytics"
DEFAULT_SQLITE_URL = f"sqlite:///{os.path.join(DATA_DIR, 'obe_platform.db')}"

class Settings(BaseModel):
    PROJECT_NAME: str = "Enterprise Higher Education CLO/OBE Analytics Platform"
    VERSION: str = "2.0.0"
    API_PREFIX: str = "/api/v1"
    DATABASE_URL: str = os.getenv("DATABASE_URL", DEFAULT_SQLITE_URL)
    DEBUG: bool = True

settings = Settings()

