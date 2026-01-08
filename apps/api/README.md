# API

## Dev

```bash
npm run dev --workspace apps/api
```

## Quick auth test

Get token:

```bash
curl -s -X POST http://localhost:4000/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"trainer@demo.com","password":"Demo1234!"}'
```

Use token with clients:

```bash
curl -s http://localhost:4000/clients \
  -H "Authorization: Bearer <token>"
```
