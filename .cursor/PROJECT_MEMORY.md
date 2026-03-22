# Project Memory

**Vollständiger Grundplan:** [docs/PROJECT_CONTEXT.md](../docs/PROJECT_CONTEXT.md)  
**Installation:** [docs/INSTALLATION.md](../docs/INSTALLATION.md)

## Architecture Constraints

- **Internes RM-System** für 2 Nutzer – kein SaaS, kein generisches CRM.
- **Monolith:** ein Backend (ASP.NET Core / .NET 10), ein Frontend (Next.js), eine DB (**SQL Server**, lokal z. B. per Docker-Image); Docker Compose; n8n nur via **API**.
- **Primärobjekt Firma;** Kontakt gehört **genau einer** Firma; Firma hat **Typ (Freitext)** und **Status** (fest); optional **Kennfarbe** für Listen/Übersichten.
- **Timeline:** chronologisch; jeder Eintrag hat **Firma + Kontakt**; kein WhatsApp in der Timeline; Statuswechsel **keine** Timeline-Events.
- **Bot v1:** nur Kontakt hinzufügen, Firma erkennen/anlegen, E-Mail zuordnen; **nur Backend**, keine direkte DB.
- **Suche** ist Kernfeature (Volltext über Stammdaten + Timeline inkl. E-Mails/Notizen).

## Coding Conventions

- Siehe entstehende Projektstandards; Stack: TypeScript/React/Next.js, C#/EF Core.
- API-first für Automationen; **kein** CQRS/Event-Bus/K8s in v1 ohne triftigen Grund.

## Common Pitfalls

- WhatsApp als Timeline-Kanal oder Bot als eigenes Domänenobjekt – **falsch** laut Kontext.
- Timeline ohne Kontakt oder Microservices „für später“ – **vermeiden**.

## Docker nach Phasenende

Am Ende **jeder abgeschlossenen Phase** (nicht nach jedem kleinen Commit):

1. **`docker-compose.yml`** – Services, Ports, `environment` (z. B. `NEXT_PUBLIC_API_URL`, `API_INTERNAL_URL` für Web) prüfen.
2. **`apps/api/Dockerfile`** / **`apps/web/Dockerfile`** – Pfade, Build-Args, Runtime-Env an aktuelle Apps anpassen.
3. **`.env.example`** – neue/ geänderte Variablen dokumentieren.
4. **Build verifizieren:** im Repo-Root `docker compose build` oder `docker compose up --build` bis ohne Fehler.

## Build / Test Commands

- **Docker (gesamter Stack):** `copy .env.example .env` (Passwort setzen), dann im Repo-Root `docker compose up --build`
- **API lokal:** `cd apps/api` → `dotnet run` → Health z. B. http://localhost:5112/health
- **Web lokal:** `cd apps/web` → `npm install` → `npm run dev`
- **API Build:** `dotnet build ValentinRSM.slnx`
- **Web Build:** `cd apps/web` → `npm run build`
- **EF-Migrationen:** `cd apps/api` → `dotnet ef database update` (Tool: `dotnet tool install -g dotnet-ef`); neue Migration: `dotnet ef migrations add Name`

## Durable Lessons

- Nur **wiederverwendbare**, projektrelevante Erkenntnisse – nicht jeden Ad-hoc-Fund.
- **Git:** Commits nach sinnvollen Einheiten; **`git push` zum Remote vorzugsweise nach abgeschlossenen Projektphasen** (nicht zwingend nach jedem kleinen Commit), sofern nicht anders angegeben.
