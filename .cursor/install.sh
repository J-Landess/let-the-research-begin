#!/usr/bin/env bash
# Idempotent Cloud Agent bootstrap for the Wiseman Psychedelics full-stack app.
# Prepares the FastAPI backend (Python venv + deps) and the React frontend
# (npm deps), plus local .env files for development.
set -euo pipefail

REPO_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"

# The FastAPI backend runs in a virtualenv. Ubuntu's system Python ships
# without the ensurepip/venv bits, so make sure the venv package is present.
if ! python3 -c "import ensurepip" >/dev/null 2>&1; then
  sudo apt-get update -qq
  sudo apt-get install -y python3-venv
fi

# ---- Backend -------------------------------------------------------------
cd "$REPO_ROOT/backend"
python3 -m venv venv
./venv/bin/pip install --upgrade pip
./venv/bin/pip install -r requirements.txt

# Local development environment file (never overwrite an existing one).
if [ ! -f .env ]; then
  cat > .env <<'EOF'
SECRET_KEY=dev-local-secret-key-please-change-this-32chars-minimum
ALGORITHM=HS256
DATABASE_URL=sqlite:///./wiseman_psychedelics.db
ENVIRONMENT=development
FRONTEND_URL=http://localhost:3000
EOF
fi

# ---- Frontend ------------------------------------------------------------
cd "$REPO_ROOT/frontend"
npm ci

if [ ! -f .env ]; then
  echo "REACT_APP_API_URL=http://localhost:8000" > .env
fi

echo "Cloud Agent bootstrap complete."
