"""
build.py
Ultra-fast compiler that compiles modular template partials into web/index.html
and synchronizes modular static assets.
Allows editing individual component files easily while keeping standalone builds instant.
"""

import os
import shutil
import time
from jinja2 import Environment, FileSystemLoader

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
TEMPLATES_DIR = os.path.join(BASE_DIR, "templates")
STATIC_DIR = os.path.join(BASE_DIR, "static")
WEB_DIR = os.path.join(BASE_DIR, "web")

def build():
    start_time = time.time()
    os.makedirs(WEB_DIR, exist_ok=True)

    # 1. Compile Jinja2 Templates into web/
    env = Environment(loader=FileSystemLoader(TEMPLATES_DIR), autoescape=False)
    for tmpl_name in ["index.html", "teacher.html"]:
        tmpl_file = os.path.join(TEMPLATES_DIR, tmpl_name)
        if os.path.exists(tmpl_file):
            t = env.get_template(tmpl_name)
            out_path = os.path.join(WEB_DIR, tmpl_name)
            with open(out_path, "w", encoding="utf-8") as f:
                f.write(t.render())

    # 2. Synchronize static/css and static/js into web/
    shutil.copytree(STATIC_DIR, WEB_DIR, dirs_exist_ok=True)

    elapsed_ms = (time.time() - start_time) * 1000
    print(f"✨ Successfully compiled modular components in {elapsed_ms:.1f}ms -> {WEB_DIR}")

if __name__ == "__main__":
    build()

