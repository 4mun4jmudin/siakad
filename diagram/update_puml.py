import os
import glob
import re

directories = [
    r"F:\sistem\siakad\diagram",
    r"F:\sistem\siakad\diagram\diagram_aktivity"
]

skinparams = """skinparam monochrome true
skinparam shadowing false
skinparam defaultFontName Arial"""

for d in directories:
    for filepath in glob.glob(os.path.join(d, "*.puml")):
        with open(filepath, "r", encoding="utf-8") as f:
            content = f.read()
        
        # We also need to skip if it's not an activity diagram
        # But wait, we can just check if it has "start" and "stop" on lines by themselves
        is_activity = bool(re.search(r'^\s*start\s*$', content, re.MULTILINE)) and bool(re.search(r'^\s*stop\s*$', content, re.MULTILINE))
        
        if is_activity and "@startuml" in content:
            if "skinparam monochrome true" in content:
                continue
                
            lines = content.split('\n')
            new_lines = []
            inserted = False
            
            # Find swimlanes in order of appearance
            swimlanes = []
            for line in lines:
                m = re.match(r'^\s*\|([^|]+)\|\s*$', line)
                if m:
                    sl = m.group(1).strip()
                    if sl not in swimlanes:
                        swimlanes.append(sl)
            
            for i, line in enumerate(lines):
                new_lines.append(line)
                if line.startswith("@startuml") and not inserted:
                    new_lines.append(skinparams)
                    
                    if swimlanes:
                        new_lines.append("")
                        for sl in swimlanes:
                            new_lines.append(f"|{sl}|")
                        new_lines.append("")
                    
                    inserted = True
                    
            with open(filepath, "w", encoding="utf-8") as f:
                f.write('\n'.join(new_lines))
            print(f"Updated {filepath}")
