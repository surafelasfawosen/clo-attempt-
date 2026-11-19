# Enterprise Higher Education OBE & CLO Attainment Analytics Platform

A production-ready **Outcome-Based Education (OBE)** and **Course Learning Outcome (CLO) Attainment Analytics Framework** designed with a professional, modular architecture where every HTML view, CSS stylesheet, and JavaScript controller is divided into small, single-responsibility files for instant editing.

---

## Clean Modular Architecture & Folder Structure

No monolithic files. Every feature is isolated in its own dedicated file:

```
clo_system/
├── app/                             # BACKEND PYTHON APPLICATION
│   ├── config.py                    # Environment configuration
│   ├── database.py                  # SQLAlchemy Engine & SessionLocal
│   ├── models/                      # Relational ORM Models
│   │   ├── institution.py           # College -> Department -> Program
│   │   ├── curriculum.py            # Course -> CourseChapter -> CLO -> PLO -> Mapping
│   │   ├── assessment.py            # Assessment Instruments & CLO Allocations
│   │   ├── student.py               # Students, Enrollments & Exam Marksheets
│   │   └── survey.py                # 5-Stakeholder Indirect Survey Sessions
│   ├── schemas/                     # Pydantic v2 schemas
│   ├── services/                    # Business & Export Services
│   │   ├── course_service.py        # Course & CLO CRUD operations
│   │   ├── docx_exporter.py         # Real Microsoft Word (.docx) syllabus generator
│   │   └── analytics_service.py     # 80/20 Attainment math engine
│   └── api/                         # REST API Controllers
│       ├── courses.py               # /api/v1/courses & /courses/{id}/export/docx
│       ├── analytics.py             # /api/v1/analytics/courses/{id}
│       └── departments.py           # /api/v1/colleges & /departments
│
├── templates/                       # MODULAR HTML PARTIALS (Divided by Feature)
│   ├── index.html                   # Master layout shell (~70 lines)
│   ├── layout/                      # Navigation & Shell
│   │   ├── sidebar.html             # Vertical taskbar navigation (~40 lines)
│   │   ├── header.html              # Dynamic breadcrumb bar (~15 lines)
│   │   └── banner.html              # Server connection alert (~10 lines)
│   ├── stages/                      # Step-by-Step Curriculum Workflow
│   │   ├── 1_colleges.html          # Stage 1: Colleges management (~20 lines)
│   │   ├── 2_departments.html       # Stage 2: Department directory (~20 lines)
│   │   ├── 3_courses.html           # Stage 3: Chronological courses list (~45 lines)
│   │   └── 4_studio/                # Stage 4: Course Studio & Sub-Tabs
│   │       ├── header.html          # Studio header, mode toggle & action buttons
│   │       ├── tabs_bar.html        # 4 Editing sub-tabs strip
│   │       ├── tab_spec.html        # Tab 1: Course Specification Form
│   │       ├── tab_chapters.html    # Tab 2: Chapters editor (Only Chapter, No Module)
│   │       ├── tab_clos.html        # Tab 3: CLO Studio editor
│   │       ├── tab_blueprint.html   # Tab 4: Assessment Blueprint Table
│   │       └── tab_dossier.html     # View: Official University Syllabus
│   ├── modals/                      # Popups & Dialogs
│   │   ├── college_modal.html       # Add/Edit College modal
│   │   ├── department_modal.html    # Add/Edit Department modal
│   │   └── course_modal.html        # Add Course modal with templates
│   └── components/                  # Global UI Fragments
│       ├── toast.html               # Toast alerts
│       └── scripts.html             # Script tags loader
│
├── static/                          # MODULAR FRONTEND ASSETS
│   ├── css/                         # MODULAR CSS (Divided by Purpose)
│   │   ├── main.css                 # Base typography (15px) & reset
│   │   ├── layout.css               # Sidebar, header, scrollbars
│   │   ├── studio.css               # Studio tabs, chapter card frames
│   │   ├── dossier.css              # Official syllabus letterhead & tables
│   │   ├── print.css                # Dedicated @media print optimizations
│   │   └── styles.css               # Master bundle importing all CSS
│   └── js/                          # MODULAR CONTROLLERS
│       ├── api.js                   # REST API client & docx downloader
│       ├── state.js                 # Reactive state store
│       ├── app.js                   # App lifecycle & router
│       └── components/              # Stage UI Controllers
│           ├── sidebar.js           # Sidebar & breadcrumb renderer
│           ├── colleges.js          # Colleges cards & modals
│           ├── departments.js       # Department cards & modals
│           ├── courses.js           # Chronological Year 1-4 grid
│           ├── studio.js            # Studio tabs & chapter editor
│           └── dossier.js           # Syllabus dossier & Word export
│
├── web/                             # COMPILED STANDALONE DISTRIBUTION
│   ├── index.html                   # Built HTML (instant double-click opening)
│   ├── css/                         # Modular CSS files
│   └── js/                          # Modular JS files
│
├── build.py                         # 30ms Instant Compiler (templates -> web/index.html)
├── main.py                          # FastAPI Server (auto-compiles & live-renders)
├── seed.py                          # Initial curriculum seeder (Stat4092, DS302)
├── run.bat                          # Windows 1-click launcher
└── test_system.py                   # Automated verification test suite
```

---

## Why This Architecture Makes Editing Fast

1. **Targeted Editing:** To change any specific part of the system, you open just that single small file:
   - Edit Chapters tab: `templates/stages/4_studio/tab_chapters.html` (~15 lines).
   - Edit Studio Header / Toggle: `templates/stages/4_studio/header.html` (~35 lines).
   - Edit Course Modal: `templates/modals/course_modal.html` (~45 lines).
   - Edit Print rules: `static/css/print.css` (~45 lines).
   - Edit Syllabus formatting: `static/css/dossier.css` (~25 lines).
2. **Instant Live-Reload:** When running with `python main.py`, the server renders template partials dynamically. Edits appear immediately upon refreshing the page.
3. **Ultra-Fast Compiler (`build.py`):** Compiles the modular partials into `web/index.html` in under 50ms, ensuring standalone `file:///` mode is always up-to-date.
