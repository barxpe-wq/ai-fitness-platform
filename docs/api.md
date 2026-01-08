# API Summary

All protected routes require `Authorization: Bearer <token>`.

## Auth

- `POST /auth/login`
- `GET /auth/me`

## Clients

- `GET /clients`
- `POST /clients`
- `GET /clients/:id`
- `PATCH /clients/:id`

## Plans

- `GET /clients/:clientId/plans`
- `POST /clients/:clientId/plans`
- `PATCH /plans/:id`
- `DELETE /plans/:id`

## Check-ins

- `GET /clients/:clientId/checkins`
- `POST /clients/:clientId/checkins`
- `PATCH /checkins/:id`
- `DELETE /checkins/:id`

## ML

- `GET /ml/health`
- `POST /ml/predict-weight`
