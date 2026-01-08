# Architecture

## System overview

```mermaid
flowchart LR
  web[apps/web] --> api[apps/api]
  api --> postgres[(Postgres)]
  api --> ml_api[ml_api]
  ml_api --> model[(ML artifacts)]
```

## Runtime services

```mermaid
flowchart TB
  subgraph Runtime
    web
    api
    postgres
    ml_api
  end

  web --> api
  api --> postgres
  api --> ml_api
```

## Notes

- Web uses JWT stored in localStorage (MVP).
- API enforces RBAC for trainer/admin roles.
- ML inference happens via HTTP to the FastAPI service.
