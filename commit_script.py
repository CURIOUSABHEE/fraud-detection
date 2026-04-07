import subprocess
import os

os.chdir(r"D:\rebel\Projects\Mini Project 2026")

# Stage the file
result1 = subprocess.run(["git", "add", "README.md"], capture_output=True, text=True)
print("Add output:", result1.stdout, result1.stderr)

# Commit the changes
result2 = subprocess.run([
    "git", "commit", 
    "-m", 
    "docs: remove support and roadmap sections from README\n\nCo-authored-by: Copilot <223556219+Copilot@users.noreply.github.com>"
], capture_output=True, text=True)
print("Commit output:", result2.stdout, result2.stderr)
print("Return code:", result2.returncode)
