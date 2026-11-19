"""
main.py
Enterprise Higher Education Outcome-Based Education (OBE) & CLO Attainment Platform.
FastAPI Application Entrypoint with Modular Template Partials & Dynamic Rendering.
"""

from fastapi import FastAPI
from fastapi.responses import HTMLResponse, FileResponse, RedirectResponse
from fastapi.staticfiles import StaticFiles
from fastapi.middleware.cors import CORSMiddleware
from jinja2 import Environment, FileSystemLoader
import os

from app.config import settings
from app.database import engine, Base
from app.api import courses, analytics, departments, staffing, freshman
from seed import init_db
from build import build as build_web

# 1. Initialize database & seed
init_db()

# 2. Compile modular template partials and sync assets to web/
build_web()

app = FastAPI(
    title=settings.PROJECT_NAME,
    version=settings.VERSION,
    docs_url="/api/docs",
    redoc_url="/api/redoc"
)

# Enable CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
STATIC_DIR = os.path.join(BASE_DIR, "static")
TEMPLATES_DIR = os.path.join(BASE_DIR, "templates")

# Mount Static Assets Directory
if os.path.exists(STATIC_DIR):
    app.mount("/static", StaticFiles(directory=STATIC_DIR), name="static")
    js_dir = os.path.join(STATIC_DIR, "js")
    if os.path.exists(js_dir):
        app.mount("/js", StaticFiles(directory=js_dir), name="js")
    css_dir = os.path.join(STATIC_DIR, "css")
    if os.path.exists(css_dir):
        app.mount("/css", StaticFiles(directory=css_dir), name="css")

# Include API Routers
app.include_router(courses.router, prefix=settings.API_PREFIX)
app.include_router(analytics.router, prefix=settings.API_PREFIX)
app.include_router(departments.router, prefix=settings.API_PREFIX)
app.include_router(staffing.router, prefix=settings.API_PREFIX)
app.include_router(freshman.router, prefix=settings.API_PREFIX)

# Jinja2 Dynamic Template Engine for instant live-reload on partial edits
jinja_env = Environment(loader=FileSystemLoader(TEMPLATES_DIR), autoescape=False)

@app.get("/", response_class=HTMLResponse)
def serve_dashboard():
    try:
        template = jinja_env.get_template("index.html")
        return template.render()
    except Exception as e:
        web_path = os.path.join(BASE_DIR, "web", "index.html")
        if os.path.exists(web_path):
            with open(web_path, "r", encoding="utf-8") as f:
                return f.read()
        return f"<h1>Error rendering dashboard: {e}</h1>"

@app.get("/syllabus/{course_id}")
def view_syllabus_direct(course_id: str):
    return RedirectResponse(url=f"/?course_id={course_id}&tab=view")

@app.get("/teacher", response_class=HTMLResponse)
@app.get("/teacher.html", response_class=HTMLResponse)
def serve_teacher_portal():
    try:
        template = jinja_env.get_template("teacher.html")
        return template.render()
    except Exception as e:
        web_path = os.path.join(BASE_DIR, "web", "teacher.html")
        if os.path.exists(web_path):
            with open(web_path, "r", encoding="utf-8") as f:
                return f.read()
        return f"<h1>Error rendering teacher portal: {e}</h1>"

@app.get("/health")
def health_check():
    return {"status": "healthy", "version": settings.VERSION, "database": settings.DATABASE_URL.split("://")[0]}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="127.0.0.1", port=8000, reload=True)
