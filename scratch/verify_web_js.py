import os
os.chdir(r'c:\Users\SURA\Desktop\clo attempt')
content = open('clo_system/web/js/teacher_portal.js', encoding='utf-8').read()
checks = ['hasGap', 'gradeDist', 'scatter', 'Blob', 'SECTION 2: KEY', 'SECTION 5:', 'SECTION 6:']
for c in checks:
    idx = content.find(c)
    if idx >= 0:
        line_num = content[:idx].count('\n') + 1
        print(f'FOUND "{c}" in web/js/teacher_portal.js at line {line_num}')
    else:
        print(f'MISS  "{c}" in web/js/teacher_portal.js')

