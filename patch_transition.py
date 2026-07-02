import re

with open("src/app/assessment/page.tsx", "r") as f:
    content = f.read()

# Replace TRANSITION with PARENT_RESULTS everywhere it still exists in JSX logic
content = content.replace('{currentSection === "TRANSITION" ? (', '{currentSection === "PARENT_RESULTS" ? (')
content = content.replace('key="transition"', 'key="parent_results"')
content = content.replace('currentSection !== "TRANSITION"', 'currentSection !== "PARENT_RESULTS"')
content = content.replace('"Transition"', '"Parent Insights"')

with open("src/app/assessment/page.tsx", "w") as f:
    f.write(content)
