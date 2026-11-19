/**
 * state.js
 * Central Application State for OBE Platform
 */

const State = {
  // Institutional entities with offline-resilient defaults
  colleges: [
    { id: 'col_freshman_dbu', name: 'College of Freshman Studies', dean_name: 'Dr. Girma Abebe', university_name: 'Debre Berhan University', is_freshman_college: 1 },
    { id: 'col_computing_dbu', name: 'College of Computing & Technology', dean_name: 'Dr. Tamirat Desta', university_name: 'Debre Berhan University', is_freshman_college: 0 },
    { id: 'col_natural_dbu', name: 'College of Natural & Computational Sciences', dean_name: 'Dr. Bekele Tadesse', university_name: 'Debre Berhan University', is_freshman_college: 0 },
    { id: 'col_health_dbu', name: 'College of Health Sciences', dean_name: 'Dr. Hiwot Teshome', university_name: 'Debre Berhan University', is_freshman_college: 0 },
    { id: 'col_business_dbu', name: 'College of Business & Economics', dean_name: 'Dr. Solomon Kassa', university_name: 'Debre Berhan University', is_freshman_college: 0 }
  ],
  departments: [
    { id: 'dept_freshman_common', name: 'Freshman Common Studies Division', code: 'FCS101', head_name: 'Dr. Girma Abebe', college_id: 'col_freshman_dbu' },
    { id: 'dept_data_science', name: 'Department of Data Science', code: 'DS01', head_name: 'Dr. Adimias W', college_id: 'col_computing_dbu' },
    { id: 'dept_software_eng', name: 'Department of Software Engineering', code: 'SE01', head_name: 'Ato Dawit K', college_id: 'col_computing_dbu' },
    { id: 'dept_computer_science', name: 'Department of Computer Science', code: 'CS01', head_name: 'W/ro Tigist B', college_id: 'col_computing_dbu' },
    { id: 'dept_statistics', name: 'Department of Statistics', code: 'STAT01', head_name: 'Dr. Almaz G', college_id: 'col_natural_dbu' },
    { id: 'dept_mathematics', name: 'Department of Mathematics', code: 'MATH01', head_name: 'Dr. Kassahun T', college_id: 'col_natural_dbu' },
    { id: 'dept_physics', name: 'Department of Physics', code: 'PHYS01', head_name: 'Dr. Yonas M', college_id: 'col_natural_dbu' }
  ],
  courses: [
    // Degree-granting department courses
    // Department of Data Science Courses (Restored Official Curriculum)
    {"id": "course_stat4092", "code": "Stat4092", "title": "Operations Research and Optimization", "department_id": "dept_data_science", "academic_year": "Year 4", "semester": "Semester II", "stream": "Common", "credit_hours": 3, "lecture_hours": 40, "lab_hours": 20, "tutorial_hours": 15, "prerequisites": "Basic knowledge of calculus, linear algebra, python", "description": "This course provides a comprehensive introduction to Operations Research (OR) and optimization techniques within the context of Data Science. Students will learn how to formulate and solve complex decision-making problems, optimize processes, and apply mathematical models to real-world data-driven scenarios. Covers: Linear programming (Algebraic and Simplex methods); Sensitivity analysis; Duality theory; Transportation problem; Queuing Theory; Game Theory; Classical Optimization Techniques.", "course_aims": "Enable students to apply linear programming, transportation algorithms, queuing systems, game theory, and classical optimization methods to solve complex industrial and data science problems.", "instructor_name": "Dr. Adimias W (PhD)", "status": "Published", "direct_weight_pct": 80.0, "indirect_weight_pct": 20.0, "program_name": "B.Sc in Data Science", "course_category": "Core", "independent_hours": 30, "assessment_hours": 15, "total_notional_hours": 120, "corequisites": "None", "textbooks": "Taha, H.A. (2006). Operations Research: An Introduction (8th edition). Prentice-Hall, India, New Delhi.", "reference_books": "Carter, M.W. and Price, C.C. (2000). Operations Research: A Practical Introduction CRC.\nRavindran, A., Phillips, D.T. and Solberg, J.J. (1987). Operations Research: Principles and Practice. (2nd edition). Wiley.\nND Vohra, Quantitative Techniques in Management, Tata McGraw Hill, 4th Edition, 2011.\nJ. K. Sharma, Operations Research Theory and Applications, Macmillan, 5th Edition, 2012.\nHiller F.S, Liberman G.J, Introduction to Operations Research, 10th Edition McGraw Hill, 2017.\nRavindran A., Philip D.T., and Solberg J.J., Operations Research, John Wiley, 2nd Edition 2007.", "teaching_strategy": "The main teaching method will be Lecture, Problem-based learning (PBL), Lab sessions, individual and group assignments, and cooperative learning supported by tutorial sessions. The students will be expected to perform presentations and self-learning exercises on operations research.", "clos": [{"id": "stat4092_clo1", "code": "CLO1", "description": "Explain the fundamentals of operations research (OR) and optimization techniques.", "blooms_level": "Understanding", "passing_score_pct": 60.0, "target_attainment_pct": 70.0, "teaching_method": "Lecture, Problem-based learning (PBL), Lab sessions & Python Solver", "assessment_methods": "Assignments (Optimization Problems), In-class Quizzes, Midterm Examination, Comprehensive Final Examination", "plo_mappings": [{"plo_id": "plo1", "correlation_weight": 2}]}, {"id": "stat4092_clo2", "code": "CLO2", "description": "Apply linear programming techniques to optimize resources.", "blooms_level": "Applying", "passing_score_pct": 60.0, "target_attainment_pct": 70.0, "teaching_method": "Lecture, Problem-based learning (PBL), Lab sessions & Python Solver", "assessment_methods": "Assignments (Optimization Problems), Midterm Examination, Comprehensive Final Examination", "plo_mappings": [{"plo_id": "plo1", "correlation_weight": 2}, {"plo_id": "plo2", "correlation_weight": 2}]}, {"id": "stat4092_clo3", "code": "CLO3", "description": "Analyze problems under the general class of transportation problems.", "blooms_level": "Analyzing", "passing_score_pct": 60.0, "target_attainment_pct": 70.0, "teaching_method": "Lecture, Problem-based learning (PBL), Lab sessions & Python Solver", "assessment_methods": "Midterm Examination, Comprehensive Final Examination", "plo_mappings": [{"plo_id": "plo2", "correlation_weight": 2}, {"plo_id": "plo3", "correlation_weight": 2}]}, {"id": "stat4092_clo4", "code": "CLO4", "description": "Analyze the queuing model for effective customer satisfaction.", "blooms_level": "Analyzing", "passing_score_pct": 60.0, "target_attainment_pct": 70.0, "teaching_method": "Lecture, Problem-based learning (PBL), Lab sessions & Python Solver", "assessment_methods": "Comprehensive Final Examination", "plo_mappings": [{"plo_id": "plo3", "correlation_weight": 2}]}, {"id": "stat4092_clo5", "code": "CLO5", "description": "Describe the basic concepts of decision making under competitive situations (Game Theory).", "blooms_level": "Understanding", "passing_score_pct": 60.0, "target_attainment_pct": 70.0, "teaching_method": "Lecture, Problem-based learning (PBL), Lab sessions & Python Solver", "assessment_methods": "In-class Quizzes, Comprehensive Final Examination", "plo_mappings": [{"plo_id": "plo4", "correlation_weight": 2}]}, {"id": "stat4092_clo6", "code": "CLO6", "description": "Apply classical optimization techniques to optimize complex systems.", "blooms_level": "Applying", "passing_score_pct": 60.0, "target_attainment_pct": 70.0, "teaching_method": "Lecture, Problem-based learning (PBL), Lab sessions & Python Solver", "assessment_methods": "Comprehensive Final Examination", "plo_mappings": [{"plo_id": "plo5", "correlation_weight": 2}]}], "chapters": [{"id": "stat4092_ch_1", "chapter_number": 1, "title": "Chapter 1: Introduction", "content": "Meaning of OR, General nature of OR, Major phases of an OR project, Classification of problems in OR, Structure of OR mathematical models.", "mapped_clos": "CLO1", "teaching_methods": "Lecture, Tutorial"}, {"id": "stat4092_ch_2", "chapter_number": 2, "title": "Chapter 2: Linear Programming", "content": "Linear Programming problem (LPP), Graphical method of solution of LPPs with two variables, Simplex method of solution of LPPs, Tableau Form: The general case, Greater than or equal to constraints, Equality Constraints, Eliminating negative right hand side values; Solving a minimization problem, Special Cases: Infeasibility, Unboundedness, Alternative optimal solutions, Degeneracy, Duality in LP. Lab contents: Apply Excel Solver, Python to solve Linear Programming.", "mapped_clos": "CLO2", "teaching_methods": "Lecture, Tutorial, hands-on activity using optimization tools and software"}, {"id": "stat4092_ch_3", "chapter_number": 3, "title": "Chapter 3: Transportation Problem", "content": "General linear programming model of the transportation problem; Balancing transportation tableau; Starting basic solutions (north – west corner method, least cost method, VAM); Optimality test; Transportation algorithm; degeneracy, perturbation a degenerate basic feasible solution. Lab contents: Illustrate all transportation problem techniques in python.", "mapped_clos": "CLO3", "teaching_methods": "Lecture, interactive discussions, Tutorial"}, {"id": "stat4092_ch_4", "chapter_number": 4, "title": "Chapter 4: Queuing Theory", "content": "Structure of waiting line system: The single channel waiting line, The process of arrivals, The distributions of service times, Queue discipline, Steady state operation; Single channel Waiting Line Model With Poison Arrival and Exponential Service Time; Multiple Channel Waiting Line Model with Poison Arrival and Exponential Service Times: Operating Characteristics and Their Interpretation.", "mapped_clos": "CLO4", "teaching_methods": "Lecture, Tutorial, interactive discussions"}, {"id": "stat4092_ch_5", "chapter_number": 5, "title": "Chapter 5: Introduction to Game Theory", "content": "Introduction; Definitions of some common terms; Two person zero sum games; Maximin-Minimax Principle; Games without saddle points-Mixed strategies; Reducing the game problem to LPP; Fundamental theorem of games.", "mapped_clos": "CLO5", "teaching_methods": "Lecture, Tutorial"}, {"id": "stat4092_ch_6", "chapter_number": 6, "title": "Chapter 6: Introduction to Classical Optimization Techniques", "content": "Unconstrained problems, Necessary and sufficient conditions, Newton Raphson method; Constrained problems, Equality constraints - Kuhn-Tucker conditions. Lab contents: apply Optimization Techniques in python.", "mapped_clos": "CLO6", "teaching_methods": "Lecture, interactive discussions, hands-on activity"}], "assessments": [{"id": "stat4092_asm1", "name": "Assignments (Optimization Problems)", "assessment_type": "Assignment", "total_marks": 20.0, "course_weight_pct": 20.0, "clo_allocations": [{"clo_id": "stat4092_clo1", "allocated_marks": 5.0}, {"clo_id": "stat4092_clo2", "allocated_marks": 5.0}]}, {"id": "stat4092_asm2", "name": "In-class Quizzes", "assessment_type": "Quiz", "total_marks": 15.0, "course_weight_pct": 15.0, "clo_allocations": [{"clo_id": "stat4092_clo1", "allocated_marks": 8.0}, {"clo_id": "stat4092_clo5", "allocated_marks": 7.0}]}, {"id": "stat4092_asm3", "name": "Midterm Examination", "assessment_type": "Midterm_Exam", "total_marks": 15.0, "course_weight_pct": 15.0, "clo_allocations": [{"clo_id": "stat4092_clo1", "allocated_marks": 5.0}, {"clo_id": "stat4092_clo2", "allocated_marks": 5.0}, {"clo_id": "stat4092_clo3", "allocated_marks": 5.0}]}, {"id": "stat4092_asm4", "name": "Comprehensive Final Examination", "assessment_type": "Final_Exam", "total_marks": 50.0, "course_weight_pct": 50.0, "clo_allocations": [{"clo_id": "stat4092_clo2", "allocated_marks": 41.0}, {"clo_id": "stat4092_clo3", "allocated_marks": 10.0}, {"clo_id": "stat4092_clo4", "allocated_marks": 10.0}, {"clo_id": "stat4092_clo5", "allocated_marks": 10.0}, {"clo_id": "stat4092_clo6", "allocated_marks": 10.0}, {"clo_id": "stat4092_clo1", "allocated_marks": 5.0}]}]},
    {"id": "course_cosc1012", "code": "CoSc1012", "title": "Computer Programming I", "department_id": "dept_data_science", "academic_year": "Year 1", "semester": "Semester I", "stream": "Common", "credit_hours": 3, "lecture_hours": 3, "lab_hours": 2, "tutorial_hours": 0, "prerequisites": "Department Prerequisites", "description": "Foundational programming principles, algorithms, control structures, data structures, and problem-solving using C++ / Python.", "course_aims": "Provide essential competence in accordance with the national curriculum.", "instructor_name": "Department Academic Staff", "status": "Published", "direct_weight_pct": 80.0, "indirect_weight_pct": 20.0, "program_name": "B.Sc in Data Science", "course_category": "Core", "independent_hours": 30, "assessment_hours": 15, "total_notional_hours": 120, "corequisites": "None", "textbooks": "", "reference_books": "", "teaching_strategy": "", "clos": [{"id": "course_cosc1012_clo_1", "code": "CLO1", "description": "Explain procedural programming paradigms, memory allocation, and basic algorithms.", "blooms_level": "Understanding", "passing_score_pct": 60.0, "target_attainment_pct": 70.0, "teaching_method": "Lecture & Laboratory Sessions", "assessment_methods": "", "plo_mappings": []}, {"id": "course_cosc1012_clo_2", "code": "CLO2", "description": "Develop and debug structured programs applying conditional logic and loops.", "blooms_level": "Applying", "passing_score_pct": 60.0, "target_attainment_pct": 70.0, "teaching_method": "Lecture & Laboratory Sessions", "assessment_methods": "", "plo_mappings": []}, {"id": "course_cosc1012_clo_3", "code": "CLO3", "description": "Implement modular functions, parameter passing, and array manipulations.", "blooms_level": "Applying", "passing_score_pct": 60.0, "target_attainment_pct": 70.0, "teaching_method": "Lecture & Laboratory Sessions", "assessment_methods": "", "plo_mappings": []}], "chapters": [], "assessments": [{"id": "course_cosc1012_mid", "name": "Midterm Exam", "assessment_type": "Midterm_Exam", "total_marks": 30.0, "course_weight_pct": 30.0, "clo_allocations": []}, {"id": "course_cosc1012_assign", "name": "Assignments & Labs", "assessment_type": "Assignment", "total_marks": 20.0, "course_weight_pct": 20.0, "clo_allocations": []}, {"id": "course_cosc1012_fin", "name": "Final Examination", "assessment_type": "Final_Exam", "total_marks": 50.0, "course_weight_pct": 50.0, "clo_allocations": []}]},
    {"id": "course_math2021", "code": "Math2021", "title": "Calculus for Data Science", "department_id": "dept_data_science", "academic_year": "Year 1", "semester": "Semester II", "stream": "Common", "credit_hours": 3, "lecture_hours": 3, "lab_hours": 2, "tutorial_hours": 0, "prerequisites": "Department Prerequisites", "description": "Differential and integral calculus with specific applications to continuous data models, rates of change, and gradient methods.", "course_aims": "Provide essential competence in accordance with the national curriculum.", "instructor_name": "Department Academic Staff", "status": "Published", "direct_weight_pct": 80.0, "indirect_weight_pct": 20.0, "program_name": "B.Sc in Data Science", "course_category": "Core", "independent_hours": 30, "assessment_hours": 15, "total_notional_hours": 120, "corequisites": "None", "textbooks": "", "reference_books": "", "teaching_strategy": "", "clos": [{"id": "course_math2021_clo_1", "code": "CLO1", "description": "Understand limits, continuity, and differentiation of single and multivariable functions.", "blooms_level": "Understanding", "passing_score_pct": 60.0, "target_attainment_pct": 70.0, "teaching_method": "Lecture & Laboratory Sessions", "assessment_methods": "", "plo_mappings": []}, {"id": "course_math2021_clo_2", "code": "CLO2", "description": "Compute partial derivatives and gradients used in optimization algorithms.", "blooms_level": "Applying", "passing_score_pct": 60.0, "target_attainment_pct": 70.0, "teaching_method": "Lecture & Laboratory Sessions", "assessment_methods": "", "plo_mappings": []}, {"id": "course_math2021_clo_3", "code": "CLO3", "description": "Evaluate definite and improper integrals in probability density calculations.", "blooms_level": "Evaluating", "passing_score_pct": 60.0, "target_attainment_pct": 70.0, "teaching_method": "Lecture & Laboratory Sessions", "assessment_methods": "", "plo_mappings": []}], "chapters": [], "assessments": [{"id": "course_math2021_mid", "name": "Midterm Exam", "assessment_type": "Midterm_Exam", "total_marks": 30.0, "course_weight_pct": 30.0, "clo_allocations": []}, {"id": "course_math2021_assign", "name": "Assignments & Labs", "assessment_type": "Assignment", "total_marks": 20.0, "course_weight_pct": 20.0, "clo_allocations": []}, {"id": "course_math2021_fin", "name": "Final Examination", "assessment_type": "Final_Exam", "total_marks": 50.0, "course_weight_pct": 50.0, "clo_allocations": []}]},
    {"id": "course_math2031", "code": "Math2031", "title": "Linear Algebra I", "department_id": "dept_data_science", "academic_year": "Year 2", "semester": "Semester I", "stream": "Common", "credit_hours": 3, "lecture_hours": 3, "lab_hours": 2, "tutorial_hours": 0, "prerequisites": "Department Prerequisites", "description": "Vector spaces, matrices, determinants, systems of linear equations, eigenvalues, eigenvectors, and singular value decomposition.", "course_aims": "Provide essential competence in accordance with the national curriculum.", "instructor_name": "Department Academic Staff", "status": "Published", "direct_weight_pct": 80.0, "indirect_weight_pct": 20.0, "program_name": "B.Sc in Data Science", "course_category": "Core", "independent_hours": 30, "assessment_hours": 15, "total_notional_hours": 120, "corequisites": "None", "textbooks": "", "reference_books": "", "teaching_strategy": "", "clos": [{"id": "course_math2031_clo_1", "code": "CLO1", "description": "Solve systems of linear equations using Gaussian elimination and matrix inverses.", "blooms_level": "Applying", "passing_score_pct": 60.0, "target_attainment_pct": 70.0, "teaching_method": "Lecture & Laboratory Sessions", "assessment_methods": "", "plo_mappings": []}, {"id": "course_math2031_clo_2", "code": "CLO2", "description": "Analyze linear transformations, vector subspaces, bases, and dimensions.", "blooms_level": "Analyzing", "passing_score_pct": 60.0, "target_attainment_pct": 70.0, "teaching_method": "Lecture & Laboratory Sessions", "assessment_methods": "", "plo_mappings": []}, {"id": "course_math2031_clo_3", "code": "CLO3", "description": "Compute eigenvalues, eigenvectors, and spectral decompositions for dimensionality reduction.", "blooms_level": "Analyzing", "passing_score_pct": 60.0, "target_attainment_pct": 70.0, "teaching_method": "Lecture & Laboratory Sessions", "assessment_methods": "", "plo_mappings": []}], "chapters": [], "assessments": [{"id": "course_math2031_mid", "name": "Midterm Exam", "assessment_type": "Midterm_Exam", "total_marks": 30.0, "course_weight_pct": 30.0, "clo_allocations": []}, {"id": "course_math2031_assign", "name": "Assignments & Labs", "assessment_type": "Assignment", "total_marks": 20.0, "course_weight_pct": 20.0, "clo_allocations": []}, {"id": "course_math2031_fin", "name": "Final Examination", "assessment_type": "Final_Exam", "total_marks": 50.0, "course_weight_pct": 50.0, "clo_allocations": []}]},
    {"id": "course_dasc2021", "code": "DaSc2021", "title": "Introduction to Data Science", "department_id": "dept_data_science", "academic_year": "Year 2", "semester": "Semester II", "stream": "Common", "credit_hours": 3, "lecture_hours": 3, "lab_hours": 2, "tutorial_hours": 0, "prerequisites": "Department Prerequisites", "description": "Overview of the data science lifecycle: data acquisition, exploratory data analysis, data wrangling, visualization, and basic modeling.", "course_aims": "Provide essential competence in accordance with the national curriculum.", "instructor_name": "Department Academic Staff", "status": "Published", "direct_weight_pct": 80.0, "indirect_weight_pct": 20.0, "program_name": "B.Sc in Data Science", "course_category": "Core", "independent_hours": 30, "assessment_hours": 15, "total_notional_hours": 120, "corequisites": "None", "textbooks": "", "reference_books": "", "teaching_strategy": "", "clos": [{"id": "course_dasc2021_clo_1", "code": "CLO1", "description": "Describe the stages of data science lifecycle and ethical responsibilities.", "blooms_level": "Understanding", "passing_score_pct": 60.0, "target_attainment_pct": 70.0, "teaching_method": "Lecture & Laboratory Sessions", "assessment_methods": "", "plo_mappings": []}, {"id": "course_dasc2021_clo_2", "code": "CLO2", "description": "Perform data cleaning, imputation, and feature transformations using pandas and numpy.", "blooms_level": "Applying", "passing_score_pct": 60.0, "target_attainment_pct": 70.0, "teaching_method": "Lecture & Laboratory Sessions", "assessment_methods": "", "plo_mappings": []}, {"id": "course_dasc2021_clo_3", "code": "CLO3", "description": "Create communicative statistical visualizations to extract patterns from raw data.", "blooms_level": "Creating", "passing_score_pct": 60.0, "target_attainment_pct": 70.0, "teaching_method": "Lecture & Laboratory Sessions", "assessment_methods": "", "plo_mappings": []}], "chapters": [], "assessments": [{"id": "course_dasc2021_mid", "name": "Midterm Exam", "assessment_type": "Midterm_Exam", "total_marks": 30.0, "course_weight_pct": 30.0, "clo_allocations": []}, {"id": "course_dasc2021_assign", "name": "Assignments & Labs", "assessment_type": "Assignment", "total_marks": 20.0, "course_weight_pct": 20.0, "clo_allocations": []}, {"id": "course_dasc2021_fin", "name": "Final Examination", "assessment_type": "Final_Exam", "total_marks": 50.0, "course_weight_pct": 50.0, "clo_allocations": []}]},
    {"id": "course_dasc4061", "code": "DaSc4061", "title": "Introduction to Bayesian Statistics", "department_id": "dept_data_science", "academic_year": "Year 4", "semester": "Semester I", "stream": "Common", "credit_hours": 3, "lecture_hours": 3, "lab_hours": 2, "tutorial_hours": 0, "prerequisites": "Department Prerequisites", "description": "Bayesian probability theory, prior and posterior distributions, conjugate priors, MCMC sampling, and Bayesian inference for data science.", "course_aims": "Provide essential competence in accordance with the national curriculum.", "instructor_name": "Department Academic Staff", "status": "Published", "direct_weight_pct": 80.0, "indirect_weight_pct": 20.0, "program_name": "B.Sc in Data Science", "course_category": "Core", "independent_hours": 30, "assessment_hours": 15, "total_notional_hours": 120, "corequisites": "None", "textbooks": "", "reference_books": "", "teaching_strategy": "", "clos": [{"id": "course_dasc4061_clo_1", "code": "CLO1", "description": "Formulate Bayes theorem and interpret prior vs. posterior probabilistic beliefs.", "blooms_level": "Understanding", "passing_score_pct": 60.0, "target_attainment_pct": 70.0, "teaching_method": "Lecture & Laboratory Sessions", "assessment_methods": "", "plo_mappings": []}, {"id": "course_dasc4061_clo_2", "code": "CLO2", "description": "Apply conjugate priors to analytical posterior inference problems.", "blooms_level": "Applying", "passing_score_pct": 60.0, "target_attainment_pct": 70.0, "teaching_method": "Lecture & Laboratory Sessions", "assessment_methods": "", "plo_mappings": []}, {"id": "course_dasc4061_clo_3", "code": "CLO3", "description": "Construct Markov Chain Monte Carlo (MCMC) computational sampling models.", "blooms_level": "Creating", "passing_score_pct": 60.0, "target_attainment_pct": 70.0, "teaching_method": "Lecture & Laboratory Sessions", "assessment_methods": "", "plo_mappings": []}], "chapters": [], "assessments": [{"id": "course_dasc4061_mid", "name": "Midterm Exam", "assessment_type": "Midterm_Exam", "total_marks": 30.0, "course_weight_pct": 30.0, "clo_allocations": []}, {"id": "course_dasc4061_assign", "name": "Assignments & Labs", "assessment_type": "Assignment", "total_marks": 20.0, "course_weight_pct": 20.0, "clo_allocations": []}, {"id": "course_dasc4061_fin", "name": "Final Examination", "assessment_type": "Final_Exam", "total_marks": 50.0, "course_weight_pct": 50.0, "clo_allocations": []}]},
    {"id": "course_ds302", "code": "DS302", "title": "Machine Learning for Data Science", "department_id": "dept_data_science", "academic_year": "Year 3", "semester": "Semester I", "stream": "Common", "credit_hours": 4, "lecture_hours": 40, "lab_hours": 20, "tutorial_hours": 15, "prerequisites": "Linear Algebra (Math2031), Calculus (Math2021), Python (CoSc1012)", "description": "Supervised, unsupervised, and deep learning paradigms with practical Python pipelines, model evaluation, and diagnostics.", "course_aims": "Equip students with theoretical and applied mastery of machine learning algorithms.", "instructor_name": "Dr. Selamawit Tadesse (PhD)", "status": "Published", "direct_weight_pct": 80.0, "indirect_weight_pct": 20.0, "program_name": "B.Sc in Data Science", "course_category": "Core", "independent_hours": 30, "assessment_hours": 15, "total_notional_hours": 120, "corequisites": "None", "textbooks": "Bishop, C. M. (2006). Pattern Recognition and Machine Learning. Springer.\nHastie, T., Tibshirani, R., & Friedman, J. (2009). The Elements of Statistical Learning. Springer.", "reference_books": "Goodfellow, I., Bengio, Y., & Courville, A. (2016). Deep Learning. MIT Press.\nMurphy, K. P. (2022). Probabilistic Machine Learning: An Introduction. MIT Press.\nGéron, A. (2019). Hands-On Machine Learning with Scikit-Learn, Keras, and TensorFlow. O'Reilly Media.", "teaching_strategy": "Instructional methods integrate interactive theory lectures with hands-on coding labs in Jupyter environments, weekly algorithmic problem-solving assignments, and a semester-long capstone predictive modeling project.", "clos": [{"id": "ds302_clo1", "code": "CLO1", "description": "Demonstrate conceptual understanding of core ML paradigms (supervised, unsupervised, reinforcement).", "blooms_level": "Understanding", "passing_score_pct": 60.0, "target_attainment_pct": 70.0, "teaching_method": "Lecture & Lab", "assessment_methods": "", "plo_mappings": []}, {"id": "ds302_clo2", "code": "CLO2", "description": "Implement and configure supervised regression, classification, and ensemble algorithms in Python.", "blooms_level": "Applying", "passing_score_pct": 60.0, "target_attainment_pct": 70.0, "teaching_method": "Lecture & Lab", "assessment_methods": "", "plo_mappings": []}, {"id": "ds302_clo3", "code": "CLO3", "description": "Analyze datasets using unsupervised algorithms (K-Means clustering and PCA dimensionality reduction).", "blooms_level": "Analyzing", "passing_score_pct": 60.0, "target_attainment_pct": 70.0, "teaching_method": "Lecture & Lab", "assessment_methods": "", "plo_mappings": []}, {"id": "ds302_clo4", "code": "CLO4", "description": "Critically evaluate model performance and tune hyperparameters via cross-validation.", "blooms_level": "Evaluating", "passing_score_pct": 60.0, "target_attainment_pct": 70.0, "teaching_method": "Lecture & Lab", "assessment_methods": "", "plo_mappings": []}, {"id": "ds302_clo5", "code": "CLO5", "description": "Architect an end-to-end Machine Learning pipeline addressing fairness, leakage, and deployment constraints.", "blooms_level": "Creating", "passing_score_pct": 60.0, "target_attainment_pct": 70.0, "teaching_method": "Lecture & Lab", "assessment_methods": "", "plo_mappings": []}], "chapters": [{"id": "ds302_ch_1", "chapter_number": 1, "title": "Chapter 1: Foundations of Machine Learning & Learning Paradigms", "content": "Supervised vs. unsupervised vs. reinforcement paradigms, inductive bias, PAC learning, bias-variance trade-off.", "mapped_clos": "CLO1", "teaching_methods": "Lecture, Tutorial"}, {"id": "ds302_ch_2", "chapter_number": 2, "title": "Chapter 2: Supervised Learning Algorithms", "content": "Linear and logistic regression, Support Vector Machines (SVM), Decision Trees, Random Forests, XGBoost.", "mapped_clos": "CLO2", "teaching_methods": "Lecture, Lab Sessions in Python"}, {"id": "ds302_ch_3", "chapter_number": 3, "title": "Chapter 3: Unsupervised Learning & Dimensionality Reduction", "content": "K-Means clustering, hierarchical clustering, DBSCAN, Principal Component Analysis (PCA).", "mapped_clos": "CLO3", "teaching_methods": "Lecture, Interactive Jupyter Labs"}, {"id": "ds302_ch_4", "chapter_number": 4, "title": "Chapter 4: Model Evaluation & Hyperparameter Optimization", "content": "Cross-validation protocols, ROC-AUC, F1-score, confusion matrices, grid search.", "mapped_clos": "CLO4", "teaching_methods": "Lecture, Guided Problem Sessions"}, {"id": "ds302_ch_5", "chapter_number": 5, "title": "Chapter 5: Production ML Pipelines & Ethics", "content": "Feature pipelines, data leakage prevention, model serving, fairness metrics, algorithmic bias.", "mapped_clos": "CLO5", "teaching_methods": "Lecture, Capstone Lab Project"}], "assessments": [{"id": "ds302_asm1", "name": "Assignments (Coding & Theory)", "assessment_type": "Assignment", "total_marks": 20.0, "course_weight_pct": 20.0, "clo_allocations": [{"clo_id": "ds302_clo1", "allocated_marks": 5.0}, {"clo_id": "ds302_clo2", "allocated_marks": 15.0}]}, {"id": "ds302_asm2", "name": "Quizzes & Lab Checkpoints", "assessment_type": "Quiz", "total_marks": 15.0, "course_weight_pct": 15.0, "clo_allocations": [{"clo_id": "ds302_clo1", "allocated_marks": 15.0}]}, {"id": "ds302_asm3", "name": "Midterm Examination", "assessment_type": "Midterm_Exam", "total_marks": 15.0, "course_weight_pct": 15.0, "clo_allocations": [{"clo_id": "ds302_clo1", "allocated_marks": 5.0}, {"clo_id": "ds302_clo2", "allocated_marks": 10.0}]}, {"id": "ds302_asm4", "name": "Comprehensive Final Examination", "assessment_type": "Final_Exam", "total_marks": 50.0, "course_weight_pct": 50.0, "clo_allocations": [{"clo_id": "ds302_clo3", "allocated_marks": 15.0}, {"clo_id": "ds302_clo4", "allocated_marks": 15.0}, {"clo_id": "ds302_clo5", "allocated_marks": 20.0}]}]},

    // Department of Software Engineering
    {"id": "crs_se201", "code": "SE201", "title": "Object-Oriented Software Engineering", "department_id": "dept_software_eng", "academic_year": "Year 2", "semester": "Semester I", "credit_hours": 4, "lecture_hours": 3, "lab_hours": 2, "program_name": "B.Sc in Software Engineering", "status": "Published"},

    // College Common Core Courses (Freshman Semester II - Handled directly by Colleges)
    // 1. College of Computing & Technology (Semester II)
    { id: 'crs_cosc1012', code: 'CoSc1012', title: 'Computer Programming II (OOP & Data Structures)', college_id: 'col_computing_dbu', department_id: 'college_common_col_computing_dbu', is_college_common: true, academic_year: 'Year 1', semester: 'Semester II', credit_hours: 4, lecture_hours: 3, lab_hours: 2, program_name: 'Computing Common Core (Semester II)', status: 'Published', description: 'Object-oriented programming, classes, objects, inheritance, polymorphism, and basic data structures.' },
    { id: 'crs_math1022', code: 'Math1022', title: 'Discrete Mathematics and Combinatorics', college_id: 'col_computing_dbu', department_id: 'college_common_col_computing_dbu', is_college_common: true, academic_year: 'Year 1', semester: 'Semester II', credit_hours: 3, lecture_hours: 3, lab_hours: 0, program_name: 'Computing Common Core (Semester II)', status: 'Published', description: 'Set theory, propositional logic, relations, graphs, trees, and combinatorics for computational disciplines.' },
    { id: 'crs_ece1012', code: 'ECE1012', title: 'Digital Logic and Computer Systems', college_id: 'col_computing_dbu', department_id: 'college_common_col_computing_dbu', is_college_common: true, academic_year: 'Year 1', semester: 'Semester II', credit_hours: 3, lecture_hours: 2, lab_hours: 2, program_name: 'Computing Common Core (Semester II)', status: 'Published', description: 'Boolean algebra, logic gates, combinational and sequential circuit design, and CPU micro-architecture.' },

    // 2. College of Natural & Computational Sciences (Semester II)
    { id: 'crs_phys1012', code: 'Phys1012', title: 'General Physics II (Electricity, Magnetism & Optics)', college_id: 'col_natural_dbu', department_id: 'college_common_col_natural_dbu', is_college_common: true, academic_year: 'Year 1', semester: 'Semester II', credit_hours: 4, lecture_hours: 3, lab_hours: 2, program_name: 'Natural Sciences Common Core (Semester II)', status: 'Published', description: 'Electromagnetism, circuits, Maxwell equations, geometric optics, and modern wave physics.' },
    { id: 'crs_stat1012', code: 'Stat1012', title: 'Introduction to Probability and Statistics', college_id: 'col_natural_dbu', department_id: 'college_common_col_natural_dbu', is_college_common: true, academic_year: 'Year 1', semester: 'Semester II', credit_hours: 3, lecture_hours: 3, lab_hours: 0, program_name: 'Natural Sciences Common Core (Semester II)', status: 'Published', description: 'Probability axioms, random variables, probability distributions, estimation, and hypothesis testing.' },
    
    // Natural Science Stream Freshman Courses
    { id: 'crs_math1011', code: 'Math1011', title: 'Mathematics for Natural Sciences', department_id: 'dept_freshman_common', academic_year: 'Year 1', semester: 'Semester I', credit_hours: 4, lecture_hours: 3, lab_hours: 0, stream: 'Natural Science', program_name: 'Common University Foundation', status: 'Published', description: 'Calculus, vectors, systems of linear equations, matrices, and analytical geometry for science and engineering disciplines.', chapters: [{ id: 'ch_math1011_1', chapter_number: 1, title: 'Chapter 1: Vectors and Analytic Geometry' }, { id: 'ch_math1011_2', chapter_number: 2, title: 'Chapter 2: Matrices and Linear Systems' }, { id: 'ch_math1011_3', chapter_number: 3, title: 'Chapter 3: Limits and Differential Calculus' }], clos: [{ id: 'clo_math1011_1', code: 'CLO1', description: 'Apply vector operations and geometric transformations.' }, { id: 'clo_math1011_2', code: 'CLO2', description: 'Solve systems of linear equations using matrix algebra.' }, { id: 'clo_math1011_3', code: 'CLO3', description: 'Calculate derivatives and apply optimization techniques.' }] },
    { id: 'crs_phys1011', code: 'Phys1011', title: 'General Physics', department_id: 'dept_freshman_common', academic_year: 'Year 1', semester: 'Semester I', credit_hours: 4, lecture_hours: 3, lab_hours: 2, stream: 'Natural Science', program_name: 'Common University Foundation', status: 'Published', description: 'Mechanics, kinematics, Newton laws of motion, work, energy, oscillations, and wave motion with laboratory practicals.', chapters: [{ id: 'ch_phys1011_1', chapter_number: 1, title: 'Chapter 1: Kinematics and Dynamics' }, { id: 'ch_phys1011_2', chapter_number: 2, title: 'Chapter 2: Work, Energy and Momentum' }, { id: 'ch_phys1011_3', chapter_number: 3, title: 'Chapter 3: Oscillations and Fluid Mechanics' }], clos: [{ id: 'clo_phys1011_1', code: 'CLO1', description: 'Formulate classical mechanical equations of motion.' }, { id: 'clo_phys1011_2', code: 'CLO2', description: 'Conduct laboratory experiments verifying conservation laws.' }] },
    { id: 'crs_cosc1011', code: 'CoSc1011', title: 'Introduction to Computing', department_id: 'dept_freshman_common', academic_year: 'Year 1', semester: 'Semester I', credit_hours: 3, lecture_hours: 2, lab_hours: 2, stream: 'Natural Science', program_name: 'Common University Foundation', status: 'Published', description: 'Fundamentals of computer architecture, operating systems, problem-solving algorithms, and structured programming.', chapters: [{ id: 'ch_cosc1011_1', chapter_number: 1, title: 'Chapter 1: Computer Systems & Architecture' }, { id: 'ch_cosc1011_2', chapter_number: 2, title: 'Chapter 2: Algorithms and Flowcharts' }, { id: 'ch_cosc1011_3', chapter_number: 3, title: 'Chapter 3: Structured Programming Basics' }], clos: [{ id: 'clo_cosc1011_1', code: 'CLO1', description: 'Identify computer hardware and software components.' }, { id: 'clo_cosc1011_2', code: 'CLO2', description: 'Design structured algorithms and pseudocode solutions.' }] },
    { id: 'crs_chem1012', code: 'Chem1012', title: 'General Chemistry', department_id: 'dept_freshman_common', academic_year: 'Year 1', semester: 'Semester I', credit_hours: 4, lecture_hours: 3, lab_hours: 2, stream: 'Natural Science', program_name: 'Common University Foundation', status: 'Published', description: 'Fundamental principles of general chemistry, atomic structure, chemical bonding, stoichiometry, and thermochemistry.', chapters: [{ id: 'ch_chem1012_1', chapter_number: 1, title: 'Chapter 1: Atomic Structure and Periodicity' }, { id: 'ch_chem1012_2', chapter_number: 2, title: 'Chapter 2: Chemical Bonding and Molecular Geometry' }, { id: 'ch_chem1012_3', chapter_number: 3, title: 'Chapter 3: Stoichiometry and Equilibrium' }], clos: [{ id: 'clo_chem1012_1', code: 'CLO1', description: 'Explain chemical bonding models and molecular structures.' }, { id: 'clo_chem1012_2', code: 'CLO2', description: 'Calculate stoichiometric yields and reaction equilibria.' }] },
    { id: 'crs_math1012', code: 'Math1012', title: 'Applied Mathematics II', department_id: 'dept_freshman_common', academic_year: 'Year 1', semester: 'Semester I', credit_hours: 4, lecture_hours: 3, lab_hours: 0, stream: 'Natural Science', program_name: 'Common University Foundation', status: 'Published', description: 'Applied mathematics, differential calculus, integration techniques, applications of integrals, and series approximations.', chapters: [{ id: 'ch_math1012_1', chapter_number: 1, title: 'Chapter 1: Integration Methods and Techniques' }, { id: 'ch_math1012_2', chapter_number: 2, title: 'Chapter 2: Differential Equations and Modeling' }], clos: [{ id: 'clo_math1012_1', code: 'CLO1', description: 'Compute definite and indefinite integrals.' }, { id: 'clo_math1012_2', code: 'CLO2', description: 'Solve first-order differential equations.' }] },

    // Social Science Stream Freshman Courses
    { id: 'crs_math1013', code: 'Math1013', title: 'Mathematics for Social Sciences', department_id: 'dept_freshman_common', academic_year: 'Year 1', semester: 'Semester I', credit_hours: 3, lecture_hours: 3, lab_hours: 0, stream: 'Social Science', program_name: 'Common University Foundation', status: 'Published', description: 'Mathematics for social sciences, functions, matrices, basic probability, financial mathematics, and linear models.', chapters: [{ id: 'ch_math1013_1', chapter_number: 1, title: 'Chapter 1: Linear Functions and Graphs' }, { id: 'ch_math1013_2', chapter_number: 2, title: 'Chapter 2: Financial Mathematics and Annuities' }], clos: [{ id: 'clo_math1013_1', code: 'CLO1', description: 'Analyze linear and non-linear economic models.' }, { id: 'clo_math1013_2', code: 'CLO2', description: 'Calculate compound interest and loan amortizations.' }] },
    { id: 'crs_gees1012', code: 'GeES1012', title: 'Geography of Ethiopia and the Horn', department_id: 'dept_freshman_common', academic_year: 'Year 1', semester: 'Semester I', credit_hours: 3, lecture_hours: 3, lab_hours: 0, stream: 'Social Science', program_name: 'Common University Foundation', status: 'Published', description: 'Physical geography, climatic zones, demographic characteristics, and natural resources of Ethiopia and the Horn.', chapters: [{ id: 'ch_gees1012_1', chapter_number: 1, title: 'Chapter 1: Physiography and Climate of the Horn' }, { id: 'ch_gees1012_2', chapter_number: 2, title: 'Chapter 2: Population, Resources and Settlement' }], clos: [{ id: 'clo_gees1012_1', code: 'CLO1', description: 'Describe drainage basins, topography, and climate patterns.' }, { id: 'clo_gees1012_2', code: 'CLO2', description: 'Evaluate natural resource management and conservation policies.' }] },
    { id: 'crs_hist1012', code: 'Hist1012', title: 'History of Ethiopia and the Horn', department_id: 'dept_freshman_common', academic_year: 'Year 1', semester: 'Semester I', credit_hours: 3, lecture_hours: 3, lab_hours: 0, stream: 'Social Science', program_name: 'Common University Foundation', status: 'Published', description: 'History of Ethiopia and the Horn, political transitions, social structures, cultural heritage, and modern national developments.', chapters: [{ id: 'ch_hist1012_1', chapter_number: 1, title: 'Chapter 1: Ancient Civilizations and States' }, { id: 'ch_hist1012_2', chapter_number: 2, title: 'Chapter 2: Modern State Formation and Sovereignty' }], clos: [{ id: 'clo_hist1012_1', code: 'CLO1', description: 'Trace historical state formations in the Horn of Africa.' }, { id: 'clo_hist1012_2', code: 'CLO2', description: 'Analyze diplomatic treaties and national resistance movements.' }] },
    { id: 'crs_anth1012', code: 'Anth1012', title: 'Social Anthropology', department_id: 'dept_freshman_common', academic_year: 'Year 1', semester: 'Semester I', credit_hours: 3, lecture_hours: 3, lab_hours: 0, stream: 'Social Science', program_name: 'Common University Foundation', status: 'Published', description: 'Human cultural diversity, kinship systems, societal institutions, cultural evolution, and social anthropology fundamentals.', chapters: [{ id: 'ch_anth1012_1', chapter_number: 1, title: 'Chapter 1: Concepts of Culture and Society' }, { id: 'ch_anth1012_2', chapter_number: 2, title: 'Chapter 2: Kinship, Marriage and Social Organization' }], clos: [{ id: 'clo_anth1012_1', code: 'CLO1', description: 'Interpret cultural patterns and social institutions.' }, { id: 'clo_anth1012_2', code: 'CLO2', description: 'Demonstrate cross-cultural empathy and ethnographic awareness.' }] },
    { id: 'crs_econ1011', code: 'Econ1011', title: 'Introduction to Economics', department_id: 'dept_freshman_common', academic_year: 'Year 1', semester: 'Semester I', credit_hours: 3, lecture_hours: 3, lab_hours: 0, stream: 'Social Science', program_name: 'Common University Foundation', status: 'Published', description: 'Microeconomics and macroeconomics principles, supply and demand dynamics, market equilibria, and national economic aggregates.', chapters: [{ id: 'ch_econ1011_1', chapter_number: 1, title: 'Chapter 1: Supply, Demand and Market Mechanisms' }, { id: 'ch_econ1011_2', chapter_number: 2, title: 'Chapter 2: National Income, Inflation and Employment' }], clos: [{ id: 'clo_econ1011_1', code: 'CLO1', description: 'Determine market equilibrium and elasticity coefficients.' }, { id: 'clo_econ1011_2', code: 'CLO2', description: 'Interpret macroeconomic indicators and fiscal monetary policy.' }] },
    { id: 'crs_gltr1012', code: 'GlTr1012', title: 'Global Trends', department_id: 'dept_freshman_common', academic_year: 'Year 1', semester: 'Semester I', credit_hours: 3, lecture_hours: 3, lab_hours: 0, stream: 'Social Science', program_name: 'Common University Foundation', status: 'Published', description: 'Contemporary world politics, globalization dynamics, international governance, diplomacy, and global development issues.', chapters: [{ id: 'ch_gltr1012_1', chapter_number: 1, title: 'Chapter 1: International Relations and Sovereignty' }, { id: 'ch_gltr1012_2', chapter_number: 2, title: 'Chapter 2: Globalization, Trade and Development' }], clos: [{ id: 'clo_gltr1012_1', code: 'CLO1', description: 'Assess contemporary global geopolitical dynamics.' }, { id: 'clo_gltr1012_2', code: 'CLO2', description: 'Examine international multilateral organizations and treaties.' }] },

    // Common to Both Streams
    { id: 'crs_enla1011', code: 'EnLa1011', title: 'Communicative English Language Skills I', department_id: 'dept_freshman_common', academic_year: 'Year 1', semester: 'Semester I', credit_hours: 3, lecture_hours: 3, lab_hours: 0, stream: 'Common', program_name: 'Common University Foundation', status: 'Published', description: 'Communicative English Language Skills focusing on reading comprehension, vocabulary expansion, oral presentation, and academic communication.', chapters: [{ id: 'ch_enla1011_1', chapter_number: 1, title: 'Chapter 1: Academic Reading and Lexical Expansion' }, { id: 'ch_enla1011_2', chapter_number: 2, title: 'Chapter 2: Oral Communication and Discussion Skills' }], clos: [{ id: 'clo_enla1011_1', code: 'CLO1', description: 'Extract key arguments from complex academic texts.' }, { id: 'clo_enla1011_2', code: 'CLO2', description: 'Deliver structured oral presentations using formal academic register.' }] },
    { id: 'crs_gees1011', code: 'GeES1011', title: 'Critical Thinking and Logic', department_id: 'dept_freshman_common', academic_year: 'Year 1', semester: 'Semester I', credit_hours: 3, lecture_hours: 3, lab_hours: 0, stream: 'Common', program_name: 'Common University Foundation', status: 'Published', description: 'Critical thinking, argumentation logic, deductive and inductive reasoning, fallacies, and decision-making.', chapters: [{ id: 'ch_gees1011_1', chapter_number: 1, title: 'Chapter 1: Logical Reasoning and Argument Structure' }, { id: 'ch_gees1011_2', chapter_number: 2, title: 'Chapter 2: Formal and Informal Fallacies' }], clos: [{ id: 'clo_gees1011_1', code: 'CLO1', description: 'Construct sound deductive and inductive arguments.' }, { id: 'clo_gees1011_2', code: 'CLO2', description: 'Identify and refute informal logical fallacies in persuasive speech.' }] },
    { id: 'crs_enla1012', code: 'EnLa1012', title: 'Basic Writing Skills', department_id: 'dept_freshman_common', academic_year: 'Year 1', semester: 'Semester I', credit_hours: 3, lecture_hours: 3, lab_hours: 0, stream: 'Common', program_name: 'Common University Foundation', status: 'Published', description: 'Basic academic writing, paragraph unity and coherence, essay development, thesis formulation, and formal style.', chapters: [{ id: 'ch_enla1012_1', chapter_number: 1, title: 'Chapter 1: Sentence Variety and Mechanics' }, { id: 'ch_enla1012_2', chapter_number: 2, title: 'Chapter 2: Paragraph Unity, Coherence and Essay Structure' }], clos: [{ id: 'clo_enla1012_1', code: 'CLO1', description: 'Compose well-structured academic paragraphs with topic sentences.' }, { id: 'clo_enla1012_2', code: 'CLO2', description: 'Formulate defensible thesis statements and develop multi-paragraph essays.' }] },
    { id: 'crs_psyc1012', code: 'Psyc1012', title: 'General Psychology', department_id: 'dept_freshman_common', academic_year: 'Year 1', semester: 'Semester I', credit_hours: 3, lecture_hours: 3, lab_hours: 0, stream: 'Common', program_name: 'Common University Foundation', status: 'Published', description: 'Scientific study of human behavior, cognitive processes, personality development, learning theories, and mental wellbeing.', chapters: [{ id: 'ch_psyc1012_1', chapter_number: 1, title: 'Chapter 1: Foundations of Psychological Science' }, { id: 'ch_psyc1012_2', chapter_number: 2, title: 'Chapter 2: Learning, Memory and Cognition' }], clos: [{ id: 'clo_psyc1012_1', code: 'CLO1', description: 'Differentiate major psychological perspectives and methodologies.' }, { id: 'clo_psyc1012_2', code: 'CLO2', description: 'Apply principles of operant and classical conditioning to human learning.' }] }
  ],
  plos: (function() {
    try {
      if (typeof localStorage !== 'undefined') {
        const cached = localStorage.getItem('obe_plos');
        if (cached) {
          const parsed = JSON.parse(cached);
          if (Array.isArray(parsed) && parsed.length > 0) return parsed;
        }
      }
    } catch (e) {}
    return [
      { id: 'plo1', code: 'PLO1', title: 'Computing & Mathematical Foundations', description: 'Apply mathematical foundations, algorithmic principles, and theory in modeling.' },
      { id: 'plo2', code: 'PLO2', title: 'Problem Analysis & Optimization', description: 'Identify, formulate, and analyze complex data science and optimization problems.' },
      { id: 'plo3', code: 'PLO3', title: 'Design & Implementation', description: 'Design solutions and implement algorithms meeting specified stakeholder requirements.' },
      { id: 'plo4', code: 'PLO4', title: 'Modern Tool Usage & Modeling', description: 'Apply modern techniques, skills, and data engineering/optimization tools.' },
      { id: 'plo5', code: 'PLO5', title: 'Communication & Teamwork', description: 'Communicate technical concepts effectively with diverse audiences.' },
      { id: 'plo6', code: 'PLO6', title: 'Professional Ethics & Governance', description: 'Apply ethical principles and commit to professional ethics, data privacy, and governance.' }
    ];
  })(),

  // Faculty & Staffing
  instructors: [
    {
      id: "inst_adimias_w",
      full_name: "Dr. Adimias W (PhD)",
      email: "adimias.w@dbu.edu.et",
      phone: "+251 91 142 8890",
      department_id: "dept_data_science",
      academic_rank: "Associate Professor",
      highest_degree: "Ph.D. in Operations Research & Optimization",
      alma_mater: "Addis Ababa University",
      specializations: "Operations Research, Linear Programming, Simplex Method, Optimization Algorithms, Queuing Theory, Transportation Problem, Mathematical Modeling",
      avatar_initials: "AW",
      max_teaching_load: 12,
      current_teaching_load: 4,
      bio: "Associate Professor of Operations Research with over 15 years of academic leadership. Specializes in combinatorial optimization, linear programming, and stochastic systems.",
      office_location: "Block 4, Room 302"
    },
    {
      id: "inst_selamawit_t",
      full_name: "Dr. Selamawit Tadesse (PhD)",
      email: "selamawit.t@dbu.edu.et",
      phone: "+251 92 334 1122",
      department_id: "dept_data_science",
      academic_rank: "Assistant Professor",
      highest_degree: "Ph.D. in Artificial Intelligence & Machine Learning",
      alma_mater: "Addis Ababa University / Politecnico di Milano",
      specializations: "Machine Learning, Deep Learning, Natural Language Processing, Supervised Learning, Computer Vision, Neural Networks",
      avatar_initials: "ST",
      max_teaching_load: 12,
      current_teaching_load: 6,
      bio: "Assistant Professor focusing on deep learning architectures, automated medical diagnostics, and supervised statistical learning algorithms.",
      office_location: "Block 4, Room 305"
    },
    {
      id: "inst_almaz_g",
      full_name: "Almaz Getachew (MSc)",
      email: "almaz.g@dbu.edu.et",
      phone: "+251 91 556 7788",
      department_id: "dept_data_science",
      academic_rank: "Senior Lecturer",
      highest_degree: "M.Sc. in Applied Statistics & Probability",
      alma_mater: "Hawassa University",
      specializations: "Applied Statistics, Queuing Theory, Probability Distributions, Stochastic Modeling, Statistical Inference, Regression Analysis",
      avatar_initials: "AG",
      max_teaching_load: 14,
      current_teaching_load: 8,
      bio: "Senior academic instructor with extensive teaching records in probability theory, waiting-line modeling, and applied industrial statistics.",
      office_location: "Block 4, Room 210"
    },
    {
      id: "inst_yared_m",
      full_name: "Prof. Yared Mengistu (PhD)",
      email: "yared.mengistu@dbu.edu.et",
      phone: "+251 91 223 9900",
      department_id: "dept_data_science",
      academic_rank: "Full Professor",
      highest_degree: "Ph.D. in Computational Mathematics & Numerical Optimization",
      alma_mater: "University of Cape Town",
      specializations: "Nonlinear Optimization, Newton-Raphson, Kuhn-Tucker Conditions, Game Theory, Algorithm Design, Duality in Optimization",
      avatar_initials: "YM",
      max_teaching_load: 10,
      current_teaching_load: 3,
      bio: "Full Professor of Computational Mathematics with 20+ journal publications in convex and non-convex optimization and game-theoretic equilibrium models.",
      office_location: "Block 1, Dean Executive Suite"
    },
    {
      id: "inst_dawit_a",
      full_name: "Dawit Abebe (MSc)",
      email: "dawit.a@dbu.edu.et",
      phone: "+251 94 887 6655",
      department_id: "dept_data_science",
      academic_rank: "Lecturer",
      highest_degree: "M.Sc. in Software Engineering & Cloud Systems",
      alma_mater: "Bahir Dar University",
      specializations: "Software Architecture, Cloud Computing, Full-Stack Web Development, DevOps, Mobile Applications, RESTful APIs, Python Programming, Computer Programming",
      avatar_initials: "DA",
      max_teaching_load: 14,
      current_teaching_load: 10,
      bio: "Lecturer in software systems, modern web microservices, and containerized deployment pipelines.",
      office_location: "Block 4, Room 112"
    },
    {
      id: "inst_rahel_k",
      full_name: "Rahel Kassa (MA)",
      email: "rahel.k@dbu.edu.et",
      phone: "+251 91 334 5566",
      department_id: "dept_freshman_common",
      academic_rank: "Senior Lecturer",
      highest_degree: "M.A. in English Language Teaching & Applied Linguistics",
      alma_mater: "Addis Ababa University",
      specializations: "Communicative English, Basic Writing Skills, Applied Linguistics, Academic Reading, Language Skills, Grammar",
      avatar_initials: "RK",
      max_teaching_load: 14,
      current_teaching_load: 4,
      bio: "Senior Lecturer in Communicative English Language Skills with 10+ years teaching foundation writing and spoken English.",
      office_location: "Block 2, Room 204"
    },
    {
      id: "inst_biruk_a",
      full_name: "Dr. Biruk Assefa (PhD)",
      email: "biruk.a@dbu.edu.et",
      phone: "+251 92 112 3344",
      department_id: "dept_freshman_common",
      academic_rank: "Associate Professor",
      highest_degree: "Ph.D. in Applied Physics & Mechanics",
      alma_mater: "Addis Ababa University",
      specializations: "General Physics, Classical Mechanics, Electromagnetism, Optics, Thermodynamics, Modern Physics, Quantum Physics",
      avatar_initials: "BA",
      max_teaching_load: 12,
      current_teaching_load: 4,
      bio: "Associate Professor of Physics specializing in mechanics, wave optics, and physics laboratory demonstration.",
      office_location: "Block 3, Room 108"
    },
    {
      id: "inst_bethlehem_g",
      full_name: "Dr. Bethlehem Girma (PhD)",
      email: "bethlehem.g@dbu.edu.et",
      phone: "+251 93 445 6677",
      department_id: "dept_freshman_common",
      academic_rank: "Assistant Professor",
      highest_degree: "Ph.D. in Physical & Inorganic Chemistry",
      alma_mater: "Addis Ababa University",
      specializations: "General Chemistry, Chemical Kinetics, Organic Chemistry, Chemical Bonding, Thermodynamics, Electrochemistry",
      avatar_initials: "BG",
      max_teaching_load: 12,
      current_teaching_load: 4,
      bio: "Assistant Professor of Chemistry with expertise in chemical reactions, solution chemistry, and atomic structures.",
      office_location: "Block 3, Room 215"
    },
    {
      id: "inst_solomon_d",
      full_name: "Dr. Solomon Desta (PhD)",
      email: "solomon.d@dbu.edu.et",
      phone: "+251 91 778 9900",
      department_id: "dept_freshman_common",
      academic_rank: "Assistant Professor",
      highest_degree: "Ph.D. in Social Anthropology & Cultural Studies",
      alma_mater: "Addis Ababa University",
      specializations: "Social Anthropology, Cultural Diversity, Ethnography, Human Evolution, Indigenous Knowledge, Ethiopian Cultures",
      avatar_initials: "SD",
      max_teaching_load: 12,
      current_teaching_load: 4,
      bio: "Anthropologist and ethnographer exploring multiculturalism, Ethiopian social heritage, and inter-ethnic harmony.",
      office_location: "Block 2, Room 310"
    },
    {
      id: "inst_kassahun_m",
      full_name: "Kassahun Mengistu (MSc)",
      email: "kassahun.m@dbu.edu.et",
      phone: "+251 92 667 8899",
      department_id: "dept_freshman_common",
      academic_rank: "Senior Lecturer",
      highest_degree: "M.Sc. in Applied Economics & Development Policy",
      alma_mater: "Hawassa University",
      specializations: "Introduction to Economics, Microeconomics, Macroeconomics, Market Structures, Critical Thinking, Logic, Development Policy",
      avatar_initials: "KM",
      max_teaching_load: 14,
      current_teaching_load: 6,
      bio: "Lecturer in micro/macro economics, financial institutions, and critical analytical thinking.",
      office_location: "Block 2, Room 102"
    },
    {
      id: "inst_hanna_w",
      full_name: "Hanna Wolde (MA)",
      email: "hanna.w@dbu.edu.et",
      phone: "+251 94 332 1100",
      department_id: "dept_freshman_common",
      academic_rank: "Lecturer",
      highest_degree: "M.A. in Educational Psychology & Inclusiveness",
      alma_mater: "Addis Ababa University",
      specializations: "General Psychology, Inclusiveness, Cognitive Science, Human Learning, Mental Health, Special Needs Education",
      avatar_initials: "HW",
      max_teaching_load: 14,
      current_teaching_load: 4,
      bio: "Lecturer in psychology and inclusiveness, focusing on disability awareness, student counseling, and learning cognitive frameworks.",
      office_location: "Block 2, Room 118"
    },
    {
      id: "inst_chala_b",
      full_name: "Dr. Chala Beyene (PhD)",
      email: "chala.b@dbu.edu.et",
      phone: "+251 91 998 7766",
      department_id: "dept_freshman_common",
      academic_rank: "Associate Professor",
      highest_degree: "Ph.D. in Earth Sciences & Geoinformatics",
      alma_mater: "Addis Ababa University",
      specializations: "Geography of Ethiopia, Earth Sciences, Physical Geography, Climate Systems, GIS, Natural Resource Management",
      avatar_initials: "CB",
      max_teaching_load: 12,
      current_teaching_load: 4,
      bio: "Geographer and GIS researcher focusing on the physical and socio-economic geography of the Horn of Africa.",
      office_location: "Block 3, Room 304"
    }
  ],

  // Student Batches & Roster State
  currentCourseRoster: [],
  availableBatches: ['2015', '2016', '2017', '2018'],
  selectedBatch: '2015',
  selectedSection: 'ALL',

  // Current selections
  selectedCollege: null,
  selectedDepartment: null,
  activeCourse: null,

  // UI Modes & Filters
  currentStage: 'colleges', // 'colleges' | 'departments' | 'courses' | 'course-studio'
  currentStudioMode: 'view', // 'edit' | 'view'
  currentEditTab: 'spec',   // 'spec' | 'chapters' | 'clos' | 'blueprint' | 'staffing'
  selectedYearFilter: 'ALL',
  selectedSemFilter: 'ALL',

  // Bloom's taxonomy definitions
  bloomsTaxonomy: [
    { name: "Remembering", color: "bg-blue-100 text-blue-800 border-blue-200" },
    { name: "Understanding", color: "bg-cyan-100 text-cyan-800 border-cyan-200" },
    { name: "Applying", color: "bg-emerald-100 text-emerald-800 border-emerald-200" },
    { name: "Analyzing", color: "bg-amber-100 text-amber-800 border-amber-200" },
    { name: "Evaluating", color: "bg-purple-100 text-purple-800 border-purple-200" },
    { name: "Creating", color: "bg-rose-100 text-rose-800 border-rose-200" }
  ],

  savePLOsLocally() {
    try {
      if (typeof localStorage !== 'undefined' && Array.isArray(State.plos)) {
        localStorage.setItem('obe_plos', JSON.stringify(State.plos));
      }
    } catch (e) {
      console.warn('Could not save PLOs to localStorage:', e);
    }
  },

  loadPLOsLocally() {
    try {
      if (typeof localStorage !== 'undefined') {
        const cached = localStorage.getItem('obe_plos');
        if (cached) {
          const parsed = JSON.parse(cached);
          if (Array.isArray(parsed) && parsed.length > 0) {
            State.plos = parsed;
            return parsed;
          }
        }
      }
    } catch (e) {
      console.warn('Could not load PLOs from localStorage:', e);
    }
    return null;
  },

  showToast(message) {
    const t = document.getElementById('toast');
    const msgEl = document.getElementById('toast-message');
    if (!t || !msgEl) return;
    msgEl.innerText = message;
    t.classList.remove('opacity-0', 'pointer-events-none');
    setTimeout(() => t.classList.add('opacity-0', 'pointer-events-none'), 3500);
  },

  async loadAllData() {
    State.loadPLOsLocally();

    try {
      const [colleges, departments, courses, plos, instructors] = await Promise.all([
        API.getColleges(),
        API.getDepartments(),
        API.getCourses(),
        API.getPLOs().catch(err => {
          console.warn('Could not fetch PLOs from API, using fallback defaults/cache:', err);
          return null;
        }),
        API.getInstructors().catch(err => {
          console.warn('Could not fetch instructors from API, using default faculty:', err);
          return null;
        })
      ]);
      if (colleges && colleges.length > 0) State.colleges = colleges;
      if (departments && departments.length > 0) State.departments = departments;
      if (courses && courses.length > 0) State.courses = courses;

      if (instructors && instructors.length > 0) {
        State.instructors = instructors;
      }

      if (plos && plos.length > 0) {
        const merged = [...plos];
        (State.plos || []).forEach(localP => {
          const exists = merged.some(m => 
            (m.id && m.id === localP.id) || 
            (m.code && m.code.toUpperCase() === localP.code.toUpperCase())
          );
          if (!exists) {
            merged.push(localP);
          }
        });
        State.plos = merged;
        State.savePLOsLocally();
      }

      const errBanner = document.getElementById('connection-error-banner');
      if (errBanner) errBanner.classList.add('hidden');
    } catch (e) {
      console.warn('Running in offline/local storage mode:', e);
      const errBanner = document.getElementById('connection-error-banner');
      if (errBanner) errBanner.classList.remove('hidden');
    }
  }
};
