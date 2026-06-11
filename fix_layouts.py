import re

def add_normalize(filepath):
    with open(filepath, 'r', encoding='utf-8') as f:
        content = f.read()

    normalize_func = '''
function normalizeLogoUrl(url) {
  if (!url) return null;
  if (url.startsWith('http://') || url.startsWith('https://') || url.startsWith('/')) return url;
  return `/storage/${url.replace(/^\/+/, '')}`;
}
'''
    if 'normalizeLogoUrl' not in content:
        # insert after imports
        content = re.sub(r'(import .*?;?\n)+', lambda m: m.group(0) + normalize_func, content, count=1)
        
    return content

# OrangTuaLayout
ot_path = 'f:/sistem/siakad/resources/js/Layouts/OrangTuaLayout.jsx'
ot_content = add_normalize(ot_path)
# Fix Brand logo
ot_content = re.sub(
    r'const logoUrl = app\?\.logo_url \|\| null;',
    r'const rawLogo = app?.logo_url || null;\n  const logoUrl = normalizeLogoUrl(rawLogo);',
    ot_content
)
with open(ot_path, 'w', encoding='utf-8') as f:
    f.write(ot_content)

# SiswaLayout
siswa_path = 'f:/sistem/siakad/resources/js/Layouts/SiswaLayout.jsx'
siswa_content = add_normalize(siswa_path)

# Fix logo
siswa_content = re.sub(
    r'const logoUrl = pengaturan\?\.logo_url \|\| "https://ui-avatars\.com[^"]+";',
    r'const rawLogo = pengaturan?.logo_url || app?.logo_url;\n  const logoUrl = normalizeLogoUrl(rawLogo) || "https://ui-avatars.com/api/?name=S&background=0ea5e9&color=fff";',
    siswa_content
)

# Fix user avatar (if missing)
# Wait, user avatar is `user?.foto_profil ? '/storage/' + ...` which is okay if it exists.
# We will just write it back.
with open(siswa_path, 'w', encoding='utf-8') as f:
    f.write(siswa_content)

print("Fixed layouts")
