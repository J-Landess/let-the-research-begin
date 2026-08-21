# 🛠️ Local Development Guide

## Quick Start

### Option 1: Use Production Backend (Easiest)
Your frontend is already configured to use the production backend at Render.

```bash
cd frontend
npm start
```

The app will run at `http://localhost:3000` and connect to `https://wiseman-api-gpfp.onrender.com`.

**CORS Status**: ✅ Working - Production backend allows `http://localhost:3000`

---

### Option 2: Run Full Local Stack
Run both frontend and backend locally.

#### 1. Start Local Postgres
```bash
docker run --name wiseman-pg -e POSTGRES_PASSWORD=postgres -e POSTGRES_DB=wiseman -p 5432:5432 -d postgres:16
```
Point `backend/.env` at `postgresql://postgres:postgres@localhost:5432/wiseman` (see `backend/env.example`), then apply schema migrations:

```bash
cd backend
./venv/bin/alembic upgrade head
```

#### 2. Start Local Backend
```bash
cd backend
source venv/bin/activate  # On Windows: venv\Scripts\activate
uvicorn main:app --reload
```
Backend runs at: `http://localhost:8000`

#### 3. Start Local Frontend
In a new terminal:
```bash
cd frontend
# Make sure .env has: REACT_APP_API_URL=http://localhost:8000
npm start
```
Frontend runs at: `http://localhost:3000`

**CORS Status**: ✅ Working - Local backend allows `http://localhost:3000`

---

## Configuration Files

### Frontend `.env` (in `WebApp/frontend/`)
```bash
# For local backend development:
REACT_APP_API_URL=http://localhost:8000

# For production backend:
REACT_APP_API_URL=https://wiseman-api-gpfp.onrender.com
```

### Backend CORS (in `WebApp/backend/main.py`)
Currently configured to allow:
- ✅ `http://localhost:3000` (local dev)
- ✅ `https://wiseman.vercel.app` (production)
- ✅ `https://*.vercel.app` (all Vercel previews)

---

## Troubleshooting

### Frontend can't connect to backend
1. **Check `.env` file**: Make sure `REACT_APP_API_URL` is correct
2. **Check backend is running**: Visit `http://localhost:8000/docs` to verify
3. **Clear browser cache**: Hard refresh (Cmd+Shift+R / Ctrl+Shift+R)
4. **Check console**: Open browser dev tools for CORS errors

### CORS errors in browser console
If you see errors like:
```
Access to XMLHttpRequest at '...' from origin 'http://localhost:3000' has been blocked by CORS policy
```

**Solutions**:
- Verify backend CORS configuration includes `http://localhost:3000`
- Check that backend is actually running
- Clear browser cache and restart server

### Backend not responding
```bash
# Check if backend is running
curl http://localhost:8000/

# Check logs
cd backend
tail -f /tmp/backend.log
```

---

## Testing Status

✅ **Production Backend** (Render):
- URL: https://wiseman-api-gpfp.onrender.com
- CORS for localhost:3000: Working
- Response time: ~200-300ms
- Status: Online

✅ **Local Backend**:
- URL: http://localhost:8000
- CORS for localhost:3000: Working
- Status: Needs to be started manually

✅ **API Endpoints Tested**:
- POST /register - Working
- POST /login - Working
- GET /me - Working (requires auth)
- GET /docs - Working
- OPTIONS (preflight) - Working

---

## Environment Variables

### Backend (WebApp/backend/)
Create `backend/.env`:
```env
SECRET_KEY=your-secret-key-here-change-this-in-production
ALGORITHM=HS256
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/wiseman
ENVIRONMENT=development
FRONTEND_URL=http://localhost:3000
```

### Frontend (WebApp/frontend/)
Already configured:
- `.env` - Use this for current setup
- `.env.local` - For local overrides (git-ignored)

---

## Common Commands

```bash
# Start backend
cd backend && source venv/bin/activate && uvicorn main:app --reload

# Start frontend
cd frontend && npm start

# Check what's running
lsof -i :3000 -i :8000

# Kill processes
pkill -f uvicorn  # Kill backend
lsof -ti :3000 | xargs kill  # Kill frontend
```

