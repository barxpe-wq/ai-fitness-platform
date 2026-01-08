# HTTP Examples

## Login

```bash
curl -s -X POST http://localhost:4000/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"trainer@demo.com","password":"Demo1234!"}'
```

## GET /me

```bash
curl -s http://localhost:4000/auth/me \
  -H "Authorization: Bearer <token>"
```

## GET /clients

```bash
curl -s http://localhost:4000/clients \
  -H "Authorization: Bearer <token>"
```

## POST /clients

```bash
curl -s -X POST http://localhost:4000/clients \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <token>" \
  -d '{"email":"client3@demo.com","tempPassword":"Temp1234!","firstName":"Ewa","lastName":"Nowak"}'
```

## GET /clients/:id

```bash
curl -s http://localhost:4000/clients/<clientProfileId> \
  -H "Authorization: Bearer <token>"
```

## PATCH /clients/:id

```bash
curl -s -X PATCH http://localhost:4000/clients/<clientProfileId> \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <token>" \
  -d '{"firstName":"Ewa","lastName":"Kowalska"}'
```

## Plans + Check-ins (manual flow)

Get clientId from clients list:

```bash
curl -s http://localhost:4000/clients \
  -H "Authorization: Bearer <token>"
```

## GET plans list

```bash
curl -s http://localhost:4000/clients/<clientProfileId>/plans \
  -H "Authorization: Bearer <token>"
```

## POST plan

```bash
curl -s -X POST http://localhost:4000/clients/<clientProfileId>/plans \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <token>" \
  -d '{"title":"Base Strength","notes":"3x/week"}'
```

## PATCH plan

```bash
curl -s -X PATCH http://localhost:4000/plans/<planId> \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <token>" \
  -d '{"title":"Base Strength v2","notes":null}'
```

## DELETE plan

```bash
curl -s -X DELETE http://localhost:4000/plans/<planId> \
  -H "Authorization: Bearer <token>"
```

## GET checkins list

```bash
curl -s http://localhost:4000/clients/<clientProfileId>/checkins \
  -H "Authorization: Bearer <token>"
```

## POST checkin

```bash
curl -s -X POST http://localhost:4000/clients/<clientProfileId>/checkins \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <token>" \
  -d '{"date":"2025-01-05","weightKg":82.4,"waistCm":84,"notes":"Good sleep"}'
```

## PATCH checkin

```bash
curl -s -X PATCH http://localhost:4000/checkins/<checkinId> \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <token>" \
  -d '{"weightKg":81.9,"notes":null}'
```

## DELETE checkin

```bash
curl -s -X DELETE http://localhost:4000/checkins/<checkinId> \
  -H "Authorization: Bearer <token>"
```
