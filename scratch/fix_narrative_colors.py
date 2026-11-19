import os, re

os.chdir(r'c:\Users\SURA\Desktop\clo attempt')
content = open('clo_system/static/js/teacher_portal.js', encoding='utf-8').read()

# Find the narrativesEl block and replace dynamic color references
# Pattern: the second narrative div uses dynamic gapCLOs.length>0 color
# We replace with pre-computed variables

# Check if already fixed
if 'const hasGap = gapCLOs.length > 0;' in content:
    print('Already fixed.')
else:
    # Find the block starting with "const narrativesEl"
    start_marker = "    const narrativesEl = document.getElementById('rep-narratives');\n    if (narrativesEl) {"
    if start_marker not in content:
        print("Marker not found!")
        # Print surrounding
        idx = content.find("narrativesEl")
        print(repr(content[max(0,idx-5):idx+300]))
    else:
        # Find the end of the if block (closing })
        start = content.find(start_marker)
        # Find the closing of the if block - look for \n    }\n after the innerHTML assignment
        end_search = content.find("\n    }\n\n    // ── Section A:", start)
        if end_search == -1:
            end_search = content.find("\n    }\n", start + 100)
        
        old_block = content[start:end_search + len("\n    }")]
        print("Found block, length:", len(old_block))
        print("First 200:", repr(old_block[:200]))
        
        new_block = """    const narrativesEl = document.getElementById('rep-narratives');
    if (narrativesEl) {
      const hasGap = gapCLOs.length > 0;
      const n2bg    = hasGap ? 'bg-amber-50'      : 'bg-emerald-50';
      const n2bord  = hasGap ? 'border-amber-200'  : 'border-emerald-200';
      const n2head  = hasGap ? 'text-amber-900'    : 'text-emerald-900';
      const n2ico   = hasGap ? 'text-amber-600'    : 'text-emerald-600';
      const n2title = hasGap ? 'Continuous Improvement &amp; Gap Intervention' : 'Accreditation Status: Fully Compliant';
      narrativesEl.innerHTML = `
        <div class="p-4 rounded-xl bg-blue-50 border border-blue-200 space-y-2">
          <div class="font-bold text-blue-900 flex items-center gap-1.5">
            <svg class="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path></svg>
            Executive Attainment Summary
          </div>
          <p class="text-slate-700 leading-relaxed text-xs">${narrative1}</p>
        </div>
        <div class="p-4 rounded-xl ${n2bg} border ${n2bord} space-y-2">
          <div class="font-bold ${n2head} flex items-center gap-1.5">
            <svg class="w-4 h-4 ${n2ico}" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"></path></svg>
            ${n2title}
          </div>
          <p class="text-slate-700 leading-relaxed text-xs">${narrative2}</p>
        </div>
        <div class="p-4 rounded-xl bg-emerald-50 border border-emerald-200 space-y-2">
          <div class="font-bold text-emerald-900 flex items-center gap-1.5">
            <svg class="w-4 h-4 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
            Accreditation Directorate Compliance
          </div>
          <p class="text-slate-700 leading-relaxed text-xs">${narrative3}</p>
        </div>
      `;
    }"""
        
        new_content = content[:start] + new_block + content[end_search + len("\n    }") :]
        open('clo_system/static/js/teacher_portal.js', 'w', encoding='utf-8').write(new_content)
        print('SUCCESS: narrative colors fixed with pre-computed variables')

