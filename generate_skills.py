import json

skills_raw = [
    ("Unreal Engine", "Other Skills", "unrealengine", "#000000"),
    ("Arduino", "Other Skills", "arduino", "#00979D"),
    ("C", "Coding Languages", "c", "#A8B9CC"),
    ("C#", "Coding Languages", "csharp", "#239120"),
    ("C++", "Coding Languages", "cplusplus", "#00599C"),
    ("CSS3", "Frontend", "css3", "#1572B6"),
    ("HTML5", "Frontend", "html5", "#E34F26"),
    ("JavaScript", "Coding Languages", "javascript", "#F7DF1E"),
    ("PHP", "Coding Languages", "php", "#777BB4"),
    ("Python", "Coding Languages", "python", "#3776AB"),
    ("PowerShell", "Coding Languages", "powershell", "#5391FE"),
    ("R", "Coding Languages", "r", "#276DC3"),
    ("TypeScript", "Coding Languages", "typescript", "#3178C6"),
    ("Netlify", "Other Skills", "netlify", "#00C7B7"),
    ("Vercel", "Other Skills", "vercel", "#000000"),
    ("Render", "Other Skills", "render", "#000000"),
    ("AWS", "Other Skills", "amazonaws", "#232F3E"),
    (".Net", "Other Skills", "dotnet", "#512BD4"),
    ("Chart.js", "Frontend", "chartdotjs", "#FF6384"),
    ("Chakra", "Frontend", "chakraui", "#319795"),
    ("Bootstrap", "Frontend", "bootstrap", "#7952B3"),
    ("DaisyUI", "Frontend", "daisyui", "#5A0EF8"),
    ("Django", "Backend", "django", "#092E20"),
    ("Express.js", "Backend", "express", "#000000"),
    ("FastAPI", "Backend", "fastapi", "#009688"),
    ("Fastify", "Backend", "fastify", "#000000"),
    ("Flask", "Backend", "flask", "#000000"),
    ("jQuery", "Frontend", "jquery", "#0769AD"),
    ("JWT", "Backend", "jsonwebtokens", "#000000"),
    ("Next JS", "Frontend", "nextdotjs", "#000000"),
    ("NodeJS", "Backend", "nodedotjs", "#339933"),
    ("Nodemon", "Backend", "nodemon", "#76D04B"),
    ("OpenCV", "Other Skills", "opencv", "#5C3EE8"),
    ("React Query", "Frontend", "reactquery", "#FF4154"),
    ("React Native", "Frontend", "react", "#61DAFB"),
    ("React Router", "Frontend", "reactrouter", "#CA4245"),
    ("React Hook Form", "Frontend", "reacthookform", "#EC5990"),
    ("Redux", "Frontend", "redux", "#764ABC"),
    ("TailwindCSS", "Frontend", "tailwindcss", "#06B6D4"),
    ("Three js", "Frontend", "threedotjs", "#000000"),
    ("WordPress", "Other Skills", "wordpress", "#21759B"),
    ("Vite", "Frontend", "vite", "#646CFF"),
    ("Apache", "Backend", "apache", "#D22128"),
    ("MicrosoftSQLServer", "Backend", "microsoftsqlserver", "#CC292B"),
    ("MongoDB", "Backend", "mongodb", "#47A248"),
    ("MySQL", "Backend", "mysql", "#4479A1"),
    ("Postgres", "Backend", "postgresql", "#4169E1"),
    ("SQLite", "Backend", "sqlite", "#003B57"),
    ("Adobe", "Other Skills", "adobe", "#FF0000"),
    ("Adobe Illustrator", "Other Skills", "adobeillustrator", "#FF9A00"),
    ("Adobe Photoshop", "Other Skills", "adobephotoshop", "#31A8FF"),
    ("Blender", "Other Skills", "blender", "#F5792A"),
    ("Canva", "Other Skills", "canva", "#00C4CC"),
    ("Figma", "Other Skills", "figma", "#F24E1E"),
    ("Sketch Up", "Other Skills", "sketch", "#F7B500"),
    ("Matplotlib", "Other Skills", "pandas", "#11557c"),
    ("NumPy", "Other Skills", "numpy", "#013243"),
    ("Pandas", "Other Skills", "pandas", "#150458"),
    ("Plotly", "Other Skills", "plotly", "#3F4F75"),
    ("scikit-learn", "Other Skills", "scikitlearn", "#F7931E"),
    ("Scipy", "Other Skills", "scipy", "#8CAAEE"),
    ("TensorFlow", "Other Skills", "tensorflow", "#FF6F00"),
    ("Git", "Other Skills", "git", "#F05032"),
    ("GitHub", "Other Skills", "github", "#181717"),
    ("Jira", "Other Skills", "jira", "#0052CC"),
    ("Unity", "Other Skills", "unity", "#000000")
]

def shift_color(hex_str, factor):
    h = hex_str.lstrip('#')
    try:
        r = int(h[0:2], 16)
        g = int(h[2:4], 16)
        b = int(h[4:6], 16)
        return f"#{min(255, int(r*factor)):02x}{min(255, int(g*factor)):02x}{min(255, int(b*factor)):02x}"
    except:
        return "#111111"

out = "const SKILLS: Skill[] = [\n"
for name, cat, slug, original_color in skills_raw:
    # Use a brightened color for neon look if original is black
    color = original_color if original_color != "#000000" else "#ffffff"
    # Ensure color is lowercased for shift_color to work right if missing leading #, 
    # but the inputs all have leading #. Wait, my shift_color expects #...
    # bg_color should be a dark version of the base color
    h = color.lstrip('#')
    try:
        r = int(h[0:2], 16)
        g = int(h[2:4], 16)
        b = int(h[4:6], 16)
        bg_color = f"#{min(255, int(r*0.15)):02x}{min(255, int(g*0.15)):02x}{min(255, int(b*0.15)):02x}"
    except:
        bg_color = "#111111"
        
    level = 75 + (sum(ord(c) for c in name) % 20)
    years = str(1 + (sum(ord(c) for c in name) % 4)) + " yrs"
    
    # SVG URL
    image_file = f"https://cdn.simpleicons.org/{slug}/ffffff"
    fallback_icon = name[0:2]
    
    out += f"    {{ name: '{name}', category: '{cat}', level: {level}, years: '{years}', description: 'Deep proficiency and experience in building robust solutions using {name}.', color: '{color}', bgColor: '{bg_color}', imageFile: '{image_file}', fallbackIcon: '{fallback_icon}' }},\n"
out += "]"

with open("d:/New Projects/AlenJames/alenjames/tmp_skills.ts", "w", encoding="utf-8") as f:
    f.write(out)
