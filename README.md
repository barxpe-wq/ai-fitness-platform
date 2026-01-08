# AI Fitness Platform

**Full-stack AI-powered fitness & nutrition platform** — kompleksowe rozwiązanie łączące frontend, backend, bazę danych i machine learning.

---

## 🚀 Overview

Ta aplikacja to przykład profesjonalnego projektu portfolio, pokazującego moje umiejętności jako **Senior Full-Stack Developer & Machine Learning Engineer**.

Platforma oferuje:

- Kompletny **Web UI** z logowaniem, dashboardem trenera i CRUD klientów.
- **REST API** z autoryzacją JWT i RBAC (role: ADMIN, TRAINER, CLIENT).
- **PostgreSQL** jako trwała warstwa danych.
- **Machine Learning**: model przewidujący wagę na podstawie check-inów.
- Oddzielny serwis ML (FastAPI) do inferencji.
- **Testy automatyczne** (unit, integration, E2E).
- **Docker & CI Ready**.

---

## 📌 Features

### Backend (API)

- Authentication (JWT + role based access control)
- CRUD: clients, plans, check-ins
- Validation (Zod)
- Proxy do ML inference
- Testy backend (Vitest + Supertest)

### Frontend (Web)

- Next.js (App Router)
- Login, Dashboard
- Clients list & details
- Add / Edit / Delete plans & check-ins
- Playwright E2E tests

### Machine Learning

- Synthetic data generation
- Feature engineering
- Model training with scikit-learn
- Saved artifact (`model.pkl`)
- FastAPI service for predictions

### DevOps / Quality

- Docker Compose (PostgreSQL + ML inference)
- Lint & TypeScript type safety
- CI (GitHub Actions config skeleton provided)

---

## 🧠 Architecture

```mermaid
flowchart LR
  subgraph Web
    NextJS[Next.js Frontend]
  end

  subgraph API
    ExpressAPI[Express API]
    Prisma[Prisma ORM]
  end

  subgraph ML
    FastAPI[FastAPI ML Service]
    Model[model.pkl]
  end

  NextJS -->|HTTP (Bearer JWT)| ExpressAPI
  ExpressAPI -->|Prisma client| PostgreSQL[(PostgreSQL)]
  ExpressAPI -->|HTTP| FastAPI
  FastAPI -->|Uses model| Model
