"""
seed.py
Database Initialization & Real Curriculum Seed Script.
Seeds institutional hierarchy, exact courses, exact chapters/units from SQC ad.docx, and CLO mappings.
"""

import sys
import os

sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from app.database import engine, SessionLocal, Base
from app.models.institution import College, Department, Program
from app.models.curriculum import Course, CourseChapter, CLO, PLO, CLOPLOMapping
from app.models.assessment import AssessmentInstrument, AssessmentCLOAllocation

def init_db():
    print("🛠️ Initializing database tables...")
    Base.metadata.create_all(bind=engine)

    db = SessionLocal()
    try:
        # Check if chapters are already seeded for Stat4092
        c_stat = db.query(Course).filter(Course.code == "Stat4092").first()
        if c_stat and len(c_stat.chapters) > 0:
            print("ℹ️ Chapters already seeded for Stat4092. Skipping chapter seed.")
            return

        print("🌱 Seeding chapters/units for Stat4092 (Operations Research / SQC document)...")
        if c_stat:
            # Seed 6 exact chapters from Table 4 of SQC ad.docx
            sqc_chapters = [
                (1, "Chapter 1: Introduction", 
                 "Meaning of OR, General nature of OR, Major phases of an OR project, Classification of problems in OR, Structure of OR mathematical models.",
                 "CLO1", "Lecture, Tutorial"),
                
                (2, "Chapter 2: Linear Programming", 
                 "Linear Programming problem (LPP), Graphical method of solution of LPPs with two variables, Simplex method of solution of LPPs, Tableau Form: The general case, Greater than or equal to constraints, Equality Constraints, Eliminating negative right hand side values; Solving a minimization problem, Special Cases: Infeasibility, Unboundedness, Alternative optimal solutions, Degeneracy, Duality in LP. Lab contents: Apply Excel Solver, Python to solve Linear Programming.",
                 "CLO2", "Lecture, Tutorial, hands-on activity using optimization tools and software"),
                
                (3, "Chapter 3: Transportation Problem", 
                 "General linear programming model of the transportation problem; Balancing transportation tableau; Starting basic solutions (north – west corner method, least cost method, VAM); Optimality test; Transportation algorithm; degeneracy, perturbation a degenerate basic feasible solution. Lab contents: Illustrate all transportation problem techniques in python.",
                 "CLO3", "Lecture, interactive discussions, Tutorial"),
                
                (4, "Chapter 4: Queuing Theory", 
                 "Structure of waiting line system: The single channel waiting line, The process of arrivals, The distributions of service times, Queue discipline, Steady state operation; Single channel Waiting Line Model With Poison Arrival and Exponential Service Time; Multiple Channel Waiting Line Model with Poison Arrival and Exponential Service Times: Operating Characteristics and Their Interpretation.",
                 "CLO4", "Lecture, Tutorial, interactive discussions"),
                
                (5, "Chapter 5: Introduction to Game Theory", 
                 "Introduction; Definitions of some common terms; Two person zero sum games; Maximin-Minimax Principle; Games without saddle points-Mixed strategies; Reducing the game problem to LPP; Fundamental theorem of games.",
                 "CLO5", "Lecture, Tutorial"),
                
                (6, "Chapter 6: Introduction to Classical Optimization Techniques", 
                 "Unconstrained problems, Necessary and sufficient conditions, Newton Raphson method; Constrained problems, Equality constraints - Kuhn-Tucker conditions. Lab contents: apply Optimization Techniques in python.",
                 "CLO6", "Lecture, interactive discussions, hands-on activity")
            ]

            db.query(CourseChapter).filter(CourseChapter.course_id == c_stat.id).delete()
            for ch_num, title, content, clos, methods in sqc_chapters:
                ch = CourseChapter(
                    id=f"stat4092_ch_{ch_num}",
                    course_id=c_stat.id,
                    chapter_number=ch_num,
                    title=title,
                    content=content,
                    mapped_clos=clos,
                    teaching_methods=methods
                )
                db.add(ch)

        # Seed chapters for DS302 (Machine Learning)
        c_ds = db.query(Course).filter(Course.code == "DS302").first()
        if c_ds and len(c_ds.chapters) == 0:
            print("🌱 Seeding chapters for DS302 (Machine Learning)...")
            ml_chapters = [
                (1, "Chapter 1: Introduction to Machine Learning & Paradigms",
                 "Definition of learning, supervised vs. unsupervised vs. reinforcement paradigms, inductive bias, PAC learning, bias-variance trade-off.",
                 "CLO1", "Lecture, Tutorial"),
                
                (2, "Chapter 2: Supervised Learning Algorithms",
                 "Linear and logistic regression, Support Vector Machines (SVM), Decision Trees, Random Forests, Gradient Boosted Trees (XGBoost), regularization (L1/L2).",
                 "CLO2", "Lecture, Lab Sessions in Python"),
                
                (3, "Chapter 3: Unsupervised Learning & Dimensionality Reduction",
                 "K-Means clustering, hierarchical clustering, DBSCAN density-based clustering, Principal Component Analysis (PCA), t-SNE.",
                 "CLO3", "Lecture, Interactive Jupyter Labs"),
                
                (4, "Chapter 4: Model Evaluation & Hyperparameter Optimization",
                 "Cross-validation protocols, ROC-AUC, Precision-Recall, F1-score, confusion matrices, grid search, Bayesian hyperparameter tuning.",
                 "CLO4", "Lecture, Guided Problem Sessions"),
                
                (5, "Chapter 5: End-to-End Production ML Pipelines & Ethics",
                 "Feature pipelines, data leakage prevention, model serving, fairness metrics, algorithmic bias, model explainability (SHAP/LIME).",
                 "CLO5", "Lecture, Capstone Lab Project")
            ]
            for ch_num, title, content, clos, methods in ml_chapters:
                ch = CourseChapter(
                    id=f"ds302_ch_{ch_num}",
                    course_id=c_ds.id,
                    chapter_number=ch_num,
                    title=title,
                    content=content,
                    mapped_clos=clos,
                    teaching_methods=methods
                )
                db.add(ch)

        db.commit()
        print("🎉 Successfully seeded chapters & units!")

    except Exception as e:
        db.rollback()
        print(f"❌ Error during seed: {e}")
        raise e
    finally:
        db.close()

if __name__ == "__main__":
    init_db()
