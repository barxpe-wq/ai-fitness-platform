# Contributing

## Local setup

```bash
npm install
npm run prisma:migrate --workspace apps/api
npm run prisma:seed --workspace apps/api
npm run dev
```

## Tests

```bash
npm run test:api
npm run test:web
```

## Pull requests

- Keep changes focused and document behavior changes.
- Add or update tests for new functionality.
- Ensure `npm run lint` and `npm run typecheck` pass.
