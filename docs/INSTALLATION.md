# Installationsanleitung ValentinRSM

Diese Anleitung beschreibt, wie du ValentinRSM auf deinem Rechner einrichtest – mit **Docker Compose** (empfohlen) oder **ohne Docker** für die reine Entwicklung.

---

## 1. Voraussetzungen

- **Git** – zum Klonen des Repositories ([git-scm.com](https://git-scm.com/))
- **.NET SDK 10** – API bauen und ausführen ([dotnet.microsoft.com/download](https://dotnet.microsoft.com/download)); `dotnet --version` sollte mit `10.` beginnen
- **Node.js** (LTS oder aktuell) – Web-Frontend ([nodejs.org](https://nodejs.org/)), inklusive `npm`
- **Docker Desktop** – nur für die **Docker-Variante** (SQL Server, API, Web, n8n per Compose); unter Windows ist das **WSL2**-Backend empfohlen

Optional, wenn du **ohne Docker** entwickelst:

- **SQL Server** (Developer/Express oder andere Instanz), per TCP erreichbar (typisch Port **1433**).

---

## 2. Repository bereitstellen

```powershell
git clone https://github.com/PaddyBlanco/ValentinRSM.git
cd ValentinRSM
```

(Remote-URL bei Bedarf an euer Repository anpassen.)

---

## 3. Variante A: Installation mit Docker Compose (empfohlen)

### 3.1 Docker Desktop

1. [Docker Desktop](https://www.docker.com/products/docker-desktop/) installieren und starten.
2. Warten, bis die Engine läuft (Icon in der Taskleiste „läuft“).
3. Im Terminal prüfen: `docker version` – Client **und** Server sollten antworten.

### 3.2 Umgebungsdatei

Im **Projektroot** (Ordner mit `docker-compose.yml`):

```powershell
copy .env.example .env
```

Datei **`.env`** bearbeiten:

- **`MSSQL_SA_PASSWORD`** – starkes Passwort setzen. Es muss den **SQL-Server-Regeln** genügen (Länge, Groß-/Kleinbuchstaben, Zahlen/Sonderzeichen). Dieses Passwort nutzen später `sa` und die Verbindungszeile der API im Container.

- **`NEXT_PUBLIC_API_URL`** – für den **Browser** die URL der API. Bei Standard-Compose:

  `http://localhost:8080`

  (Nicht ändern, solange ihr die Ports in `docker-compose.yml` nicht anpasst.)

> **Sicherheit:** `.env` ist in `.gitignore` und gehört **nicht** ins Repository.

### 3.3 Stack starten

```powershell
docker compose up --build
```

Beim ersten Mal werden Images gebaut; das kann einige Minuten dauern.

### 3.4 Prüfen

Nach dem Start (SQL Server braucht oft **20–60 Sekunden**, bis er Anfragen annimmt):

- **Web:** http://localhost:3000  
- **API Health:** http://localhost:8080/health  
- **n8n:** http://localhost:5678  
- **SQL Server:** Host `localhost`, Port `1433`, Login `sa`, Passwort wie `MSSQL_SA_PASSWORD` in `.env`  

Die Startseite der Web-App zeigt den Status von `/health` an. Wenn dort zunächst „nicht erreichbar“ steht: kurz warten, API-Container prüfen (`docker compose logs api`), erneut laden.

### 3.5 Stack beenden

Im Terminal: `Strg+C`. Optional Container entfernen:

```powershell
docker compose down
```

Datenbank-Daten liegen im Volume `sqlserver_data` und bleiben erhalten, bis ihr `docker compose down -v` ausführt.

---

## 4. Variante B: Ohne Docker (API + Web lokal)

Hier startet ihr **API** und **Web** mit `dotnet`/`npm`. Eine **SQL Server-Instanz** muss separat laufen (lokal installiert oder Remote), wenn ihr schon Datenbankfunktionen nutzt. Für einen reinen API-/Web-Check ohne DB reicht die API ohne DB-Verbindung, sobald keine DB-Zugriffe in der Anwendung erzwungen werden.

### 4.1 API

```powershell
cd apps/api
dotnet restore
dotnet run
```

Standard-URL laut `Properties/launchSettings.json`, z. B.:

- http://localhost:5112/health

### 4.2 Web

Neues Terminal:

```powershell
cd apps/web
npm install
npm run dev
```

Standard: http://localhost:3000

### 4.3 API-Adresse für das Web

Wenn die API **nicht** unter `http://localhost:8080` läuft, setzt ihr für das Web die öffentliche API-URL:

**Windows (PowerShell, nur aktuelle Sitzung):**

```powershell
$env:NEXT_PUBLIC_API_URL="http://localhost:5112"
npm run dev
```

Oder dauerhaft z. B. eine Datei **`apps/web/.env.local`** (nicht committen):

```env
NEXT_PUBLIC_API_URL=http://localhost:5112
```

### 4.4 SQL Server-Verbindung (lokal)

Tragt die Verbindung in **`apps/api/appsettings.json`** (oder `appsettings.Development.json` / User-Secrets) unter `ConnectionStrings:DefaultConnection` ein, z. B.:

`Server=localhost,1433;Database=ValentinRSM;User Id=sa;Password=...;TrustServerCertificate=True;MultipleActiveResultSets=true`

---

## 5. Build prüfen (optional)

```powershell
# Im Projektroot
dotnet build ValentinRSM.slnx

cd apps/web
npm run build
```

## 5.1 Datenbank-Migrationen (API)

Die API nutzt **EF Core** mit **SQL Server**. Migrationen liegen unter `apps/api/Data/Migrations`.

- **Automatisch:** In **Development** wendet die API beim Start `Migrate` an (Docker-Compose setzt `ASPNETCORE_ENVIRONMENT=Development` für die API).
- **Manuell:** Mit laufendem SQL Server und gesetztem Connection String:

```powershell
cd apps/api
dotnet ef database update
```

Neue Migration nach Änderungen am Modell:

```powershell
cd apps/api
dotnet ef migrations add BeschreibungDerAenderung
```


---

## 6. Häufige Probleme

- **`error during connect` / Pipe zu Docker**  
  Docker Desktop ist nicht gestartet oder die Engine läuft nicht – Docker starten und erneut versuchen.

- **SQL Server im Container startet nicht oder Login schlägt fehl**  
  Passwort in `.env` zu schwach oder Sonderzeichen falsch escaped – neues starkes Passwort setzen, Compose neu starten.

- **Web zeigt „API: nicht erreichbar“**  
  Falsche `NEXT_PUBLIC_API_URL`, API noch nicht oben, oder CORS – API muss die Origin des Web-Frontends erlauben (siehe `apps/api/appsettings.json`, `AllowedOrigins`).

- **Port bereits belegt**  
  In `docker-compose.yml` die Mappings `8080:8080`, `3000:3000`, `1433:1433`, `5678:5678` anpassen oder den blockierenden Prozess beenden.

- **API bricht beim Start ab (Migration / Datenbank)**  
  SQL Server nicht erreichbar, falsches Passwort im Connection String oder DB noch nicht bereit – Verbindung testen, ggf. `dotnet ef database update` in `apps/api` ausführen, wenn ihr nicht mit `Development`/Auto-Migrate arbeitet.

---

## 7. Weitere Dokumentation

- [PROJECT_CONTEXT.md](PROJECT_CONTEXT.md) – Fachkonzept und MVP  
- [README.md](../README.md) – Kurzüberblick im Repository-Root
