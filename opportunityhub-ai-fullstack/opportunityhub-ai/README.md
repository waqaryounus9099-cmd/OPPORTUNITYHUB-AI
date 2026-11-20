# OpportunityHub AI

A full-stack MVP for discovering jobs and scholarships, managing applications, creating alerts, and accessing AI-assisted career tools.

## Included

- React + Vite frontend with responsive layout and light/dark theme
- Express REST API
- PostgreSQL + Prisma schema and seed data
- JWT authentication and password hashing
- Jobs and scholarships search/filter endpoints
- Saved opportunities and application tracking
- Profile management
- Alert preferences and in-app notifications
- AI provider adapter (mock by default; optional OpenAI-compatible provider)
- Admin overview endpoints
- Docker Compose for PostgreSQL and Redis
- Background worker scaffold for future collectors and alert delivery

## Requirements

- Node.js 20+
- npm 10+
- Docker Desktop (recommended for PostgreSQL and Redis)

## Quick start (Windows PowerShell or Command Prompt)

1. Extract the ZIP and open the `opportunityhub-ai` folder in VS Code.
2. Copy `.env.example` to `.env`.
3. Start the database services:

   ```bash
   docker compose up -d
   ```

4. Install dependencies:

   ```bash
   npm install
   ```

5. Generate Prisma client and create tables:

   ```bash
   npm run db:generate
   npm run db:migrate -- --name init
   ```

6. Add sample opportunities:

   ```bash
   npm run db:seed
   ```

7. Start frontend and backend:

   ```bash
   npm run dev
   ```

8. Open http://localhost:5173

API health check: http://localhost:4000/api/health

## Demo account

The seed script creates:

- Email: `demo@opportunityhub.ai`
- Password: `Opportunity123!`

Change this password and replace all development secrets before deployment.

## Optional AI setup

The default provider is `mock`, so the assistant works without a paid API key.

To enable the OpenAI-compatible provider, set these in `.env`:

```env
AI_PROVIDER="openai"
OPENAI_API_KEY="your-api-key"
OPENAI_MODEL="gpt-4o-mini"
```

Restart the backend after changing environment variables. Never put AI API keys in frontend environment variables.

## Important: real-time data

The sample data is clearly marked as demo content. The collector service is an integration scaffold, not a live feed. To publish real opportunities, configure approved source integrations and respect each source's API terms, rate limits, robots rules, and attribution requirements. Always retain original source and application URLs, timestamps, and verification status.

## Important: production readiness

Before public launch, add HTTPS, managed database backups, secure cookie/session strategy, email provider integration, rate limits tuned for production, audit logging, monitoring, file malware scanning, privacy policy, terms, and security review. Do not expose the admin endpoints publicly without adding role-based admin users and production authorization controls.
