#!/usr/bin/env python3
import subprocess
import sys
import os

os.chdir(r"D:\rebel\Projects\Mini Project 2026")

try:
    # Add file
    print("Adding README.md to git...")
    subprocess.run(["git", "add", "README.md"], check=True)
    
    # Commit with trailer
    print("Creating commit...")
    subprocess.run([
        "git", "commit",
        "-m", "docs: remove support and roadmap sections from README",
        "--trailer", "Co-authored-by:Copilot <223556219+Copilot@users.noreply.github.com>"
    ], check=True)
    
    # Show result
    print("\nCommit successful! Latest commit:")
    result = subprocess.run(["git", "log", "--oneline", "-1"], capture_output=True, text=True, check=True)
    print(result.stdout)
    
except subprocess.CalledProcessError as e:
    print(f"Error: {e}", file=sys.stderr)
    sys.exit(1)
except Exception as e:
    print(f"Exception: {e}", file=sys.stderr)
    sys.exit(1)
