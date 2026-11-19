import os
os.chdir(r'c:\Users\SURA\Desktop\clo attempt')
content = open('clo_system/web/index.html', encoding='utf-8').read()
checks = ['hasGap', 'gradeDist', 'scatter', 'SECTION 2', 'KPI', 'Blob', 'SECTION 5', 'SECTION 6']
for c in checks:
    idx = content.find(c)
    if idx >= 0:
        print(f'FOUND "{c}" at {idx}: {repr(content[idx:idx+80])}')
    else:
        print(f'MISS  "{c}"')

