#!/usr/bin/env python3
"""
Push changes to GitHub with optional token authentication.

Setup:
  1. Create a Personal Access Token (PAT) at GitHub:
     Settings → Developer settings → Personal access tokens → Generate new token (classic)
     Enable scope: repo

  2. Set the token (choose one):
     Windows (PowerShell, this session only):
       $env:GITHUB_TOKEN = "ghp_yourTokenHere"
     Windows (permanent): set GITHUB_TOKEN in System Environment Variables
     Or run and paste when prompted:
       python scripts/push_to_github.py

  3. Run: python scripts/push_to_github.py
     Or: python scripts/push_to_github.py "Your commit message"
"""

import os
import subprocess
import sys
from pathlib import Path

REPO_ROOT = Path(__file__).resolve().parent.parent


def run(cmd, capture=False, check=True):
    result = subprocess.run(
        cmd,
        cwd=REPO_ROOT,
        shell=True,
        capture_output=capture,
        text=True,
    )
    if check and result.returncode != 0:
        sys.exit(result.returncode)
    return result


def run_list(args, capture=False, check=True):
    result = subprocess.run(
        args,
        cwd=REPO_ROOT,
        capture_output=capture,
        text=True,
    )
    if check and result.returncode != 0:
        sys.exit(result.returncode)
    return result


def run_out(cmd):
    result = run(cmd, capture=True, check=False)
    return result.stdout.strip() if result.returncode == 0 else ""


def inject_token(url: str, token: str) -> str:
    """https://github.com/user/repo.git -> https://TOKEN@github.com/user/repo.git"""
    if url.startswith("https://") and "@" not in url:
        return url.replace("https://", f"https://{token}@", 1)
    if url.startswith("http://") and "@" not in url:
        return url.replace("http://", f"http://{token}@", 1)
    return url


def do_push(push_url: str) -> None:
    branch = run_out("git rev-parse --abbrev-ref HEAD")
    if not branch or branch == "HEAD":
        branch = "main"

    status = run_out("git status --porcelain")
    if not status:
        print("Nothing to commit. Working tree clean.")
        sys.exit(0)

    print("Staging changes...")
    run_list(["git", "add", "."])

    print("Committing...")
    msg = sys.argv[1] if len(sys.argv) > 1 else "Update OGU site: navbar, message window, assets"
    run_list(["git", "commit", "-m", msg])

    print(f"Pushing to origin/{branch}...")
    run_list(["git", "push", push_url, branch])

    print("\nDone. Changes are on GitHub.")


def main() -> None:
    print("OGU Offline Site — Push to GitHub\n")

    top_level = run_out("git rev-parse --show-toplevel")
    if not top_level or Path(top_level).resolve() != REPO_ROOT:
        print("Not a git repository or not at repo root. Run: git init", file=sys.stderr)
        sys.exit(1)

    remote_url = run_out("git config --get remote.origin.url")
    if not remote_url:
        print(
            'No remote "origin" set. Add it with:\n'
            "  git remote add origin https://github.com/YOUR_USER/OGU_Offline_Site.git",
            file=sys.stderr,
        )
        sys.exit(1)

    token = os.environ.get("GITHUB_TOKEN", "").strip()
    if not token:
        try:
            token = input(
                "GITHUB_TOKEN not set. Paste your GitHub Personal Access Token "
                "(or press Enter to push without token): "
            ).strip()
        except (EOFError, KeyboardInterrupt):
            token = ""

    push_url = inject_token(remote_url, token) if token else remote_url
    do_push(push_url)


if __name__ == "__main__":
    main()
