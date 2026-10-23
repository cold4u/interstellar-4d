#!/usr/bin/env bash
# ==============================================================================
# INTERSTELLAR 4D - GITHUB DEPLOYMENT SCRIPT
# ==============================================================================

set -e

DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$DIR"

echo "=========================================================="
echo "🌌 INTERSTELLAR 4D // GITHUB PAGES DEPLOYMENT HELPER"
echo "=========================================================="

# 1. Initialize git if needed
if [ ! -d ".git" ]; then
    echo "[+] Initializing git repository..."
    git init
    git branch -M main
fi

# 2. Add all files
echo "[+] Staging files..."
git add .

# 3. Commit
if git diff --cached --quiet; then
    echo "[i] No new changes to commit."
else
    echo "[+] Committing files..."
    git commit -m "Initialize Interstellar 4D Tesseract with Hans Zimmer BGM"
fi

# 4. Check Remote
CURRENT_REMOTE=$(git remote get-url origin 2>/dev/null || echo "")

if [ -z "$CURRENT_REMOTE" ]; then
    echo ""
    echo "----------------------------------------------------------"
    echo "Step 1: Create a repository on GitHub (e.g. 'interstellar-4d')"
    echo "        Link: https://github.com/new"
    echo "----------------------------------------------------------"
    echo ""
    read -p "Enter your GitHub username: " GH_USER
    read -p "Enter your GitHub repository name [interstellar-4d]: " GH_REPO
    GH_REPO=${GH_REPO:-interstellar-4d}

    if [ -n "$GH_USER" ]; then
        REMOTE_URL="https://github.com/${GH_USER}/${GH_REPO}.git"
        echo "[+] Adding remote origin: $REMOTE_URL"
        git remote add origin "$REMOTE_URL"
        echo "[+] Pushing to GitHub..."
        git push -u origin main
        echo ""
        echo "=========================================================="
        echo "🎉 SUCCESS! Your repository is uploaded."
        echo "To view your live website on GitHub Pages:"
        echo "1. Go to: https://github.com/${GH_USER}/${GH_REPO}/settings/pages"
        echo "2. Under 'Source', select 'GitHub Actions' (or 'Deploy from a branch' -> main)"
        echo "3. Your site will be live at: https://${GH_USER}.github.io/${GH_REPO}/"
        echo "=========================================================="
    else
        echo "No username provided. Run 'git remote add origin <URL>' and 'git push -u origin main' whenever you are ready."
    fi
else
    echo "[+] Existing remote found: $CURRENT_REMOTE"
    echo "[+] Pushing latest changes to origin main..."
    git push -u origin main
    echo "=========================================================="
    echo "🚀 Updated changes pushed to GitHub!"
    echo "=========================================================="
fi
