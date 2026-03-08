# Push to GitHub

## One-time setup

### 1. Create a GitHub Personal Access Token (PAT)

1. Open **GitHub** → **Settings** → **Developer settings** → **Personal access tokens** → **Tokens (classic)**.
2. **Generate new token (classic)**.
3. Name it (e.g. `OGU push`) and enable scope **`repo`**.
4. Generate and **copy the token** (starts with `ghp_`). You won’t see it again.

### 2. Set the token (choose one)

**Option A – This terminal only (PowerShell)**  
```powershell
$env:GITHUB_TOKEN = "ghp_yourPasteTokenHere"
```

**Option B – Permanent (Windows)**  
- Start → “Environment variables” → Edit “User variables” → New:  
  Name: `GITHUB_TOKEN`, Value: `ghp_yourPasteTokenHere`

**Option C – No env var**  
- Run the script and paste the token when it asks.

### 3. Add GitHub as remote (if needed)

If you haven’t linked this folder to GitHub yet:

```powershell
cd c:\Users\R\Desktop\OGU_Offline_Site\OGU_Offline_Site
git init
git remote add origin https://github.com/YOUR_USERNAME/YOUR_REPO_NAME.git
```

Replace `YOUR_USERNAME` and `YOUR_REPO_NAME` with your GitHub user and repo.

## Push changes

From the project root:

**Python (recommended):**
```powershell
python scripts/push_to_github.py
```

With a custom commit message:
```powershell
python scripts/push_to_github.py "Your commit message here"
```

**Node.js:**
```powershell
npm run push
node scripts/push-to-github.js "Your commit message here"
```

The script will:

1. Stage all changes (`git add .`)
2. Commit with the given message (or a default one)
3. Push to the current branch (e.g. `main`) using your token for auth

Do **not** commit your token or put it in any file that is pushed to GitHub.
