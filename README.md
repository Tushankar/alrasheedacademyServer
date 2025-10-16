# Minimal Auth Server

This is a small Express + Mongoose server that provides `POST /api/auth/register` and `POST /api/auth/login` endpoints. It expects a MongoDB connection string in the `MONGODB_URI` environment variable and a `JWT_SECRET`.

Setup (PowerShell)

1. Copy the example env and fill values:

```powershell
cd C:\Users\TUSHANKAR\Desktop\NEXTJS\server
copy .env.example .env
# Edit .env to set MONGODB_URI and JWT_SECRET
notepad .env
```

2. Install dependencies:

```powershell
npm install
```

3. Start server:

```powershell
npm run dev
```

4. Test endpoints (curl examples):

Register:

```powershell
curl -X POST http://localhost:4000/api/auth/register -H "Content-Type: application/json" -d '{"name":"Alice","email":"alice@example.com","password":"secret123"}'
```

Login:

```powershell
curl -X POST http://localhost:4000/api/auth/login -H "Content-Type: application/json" -d '{"email":"alice@example.com","password":"secret123"}'
```

Security note: Do not commit real credentials to the repository. Keep the `.env` file local and out of source control.
