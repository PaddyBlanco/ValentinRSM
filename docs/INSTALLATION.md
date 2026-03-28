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

- **`NEXT_PUBLIC_API_URL`** – für den **Browser** die URL der API. Bei Standard-Compose: `http://localhost:8080` (siehe Ports in `docker-compose.yml`).

> **Sicherheit:** `.env` ist in `.gitignore` und gehört **nicht** ins Repository.

### 3.3 Stack starten

```powershell
docker compose up --build
```

Beim ersten Mal werden Images gebaut; das kann einige Minuten dauern.

**Entwicklung:** Statt `up` könnt ihr `docker compose watch` nutzen — bei Änderungen unter `apps/api` und `apps/web` werden die betroffenen Images neu gebaut und die Container neu gestartet (ohne `node_modules`/`.next` bzw. `bin`/`obj` zu triggern).

### 3.4 Prüfen

Nach dem Start (SQL Server braucht oft **20–60 Sekunden**, bis er Anfragen annimmt):

- **Web:** http://localhost:3000  
- **API Health:** http://localhost:8080/health  
- **n8n:** http://localhost:5678  
- **SQL Server:** Host `localhost`, Port `1433`, Login `sa`, Passwort wie `MSSQL_SA_PASSWORD` in `.env`  

Die Startseite der Web-App zeigt den Status von `/health` an. Wenn dort zunächst „nicht erreichbar“ steht: kurz warten, API-Container prüfen (`docker compose logs api`), erneut laden.

**Öffentlicher Betrieb:** Für eine **HTTPS-URL** (Domain, Reverse-Proxy) `AUTH_URL`, `NEXT_PUBLIC_API_URL`, Entra-Umleitungs-URIs und `AllowedOrigins` in der API anpassen — siehe `.env.example` und Abschnitt 4.5.

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

Die Verbindungszeile **nicht** mit echtem Passwort ins Repository legen. In **`apps/api/appsettings.json`** ist **keine** `ConnectionStrings:DefaultConnection` mehr eingetragen; beim Start ohne Konfiguration meldet die API einen klaren Fehler.

**Beispiel-ConnectionString** (SQL Server lokal oder Docker-Port 1433, Platzhalter für das SA-Passwort):

```text
Server=localhost,1433;Database=ValentinRSM;User Id=sa;Password=<IHR_SA_PASSWORT>;TrustServerCertificate=True;MultipleActiveResultSets=true
```

`<IHR_SA_PASSWORT>` durch euer echtes Passwort ersetzen (z. B. wie `MSSQL_SA_PASSWORD` in der Root-**`.env`** bei Docker).

**Variante A – User Secrets** (empfohlen für `dotnet run` im Ordner `apps/api`; Zeichenkette in **eine** Zeile, Anführungszeichen wie unten):

```powershell
cd apps/api
dotnet user-secrets set "ConnectionStrings:DefaultConnection" "Server=localhost,1433;Database=ValentinRSM;User Id=sa;Password=<IHR_SA_PASSWORT>;TrustServerCertificate=True;MultipleActiveResultSets=true"
```

**Variante B – Umgebungsvariable** (PowerShell, nur aktuelle Sitzung):

```powershell
$env:ConnectionStrings__DefaultConnection="Server=localhost,1433;Database=ValentinRSM;User Id=sa;Password=<IHR_SA_PASSWORT>;TrustServerCertificate=True;MultipleActiveResultSets=true"
cd apps/api
dotnet run
```

**Docker Compose:** Die API erhält die Verbindung über **`ConnectionStrings__DefaultConnection`** aus der Root-**`.env`** (siehe `docker-compose.yml`); dort muss das Passwort zur SQL-Instanz passen.

### 4.5 Microsoft Entra ID (Anmeldung)

Die Web-App nutzt **Auth.js** mit dem Provider **Microsoft Entra ID**; die API kann **JWT Bearer** (Microsoft.Identity.Web) erzwingen. Überblick und Azure-Schritte: [PLAN_ENTRA_AZURE.md](PLAN_ENTRA_AZURE.md).

#### Umleitungs-URI (Redirect) – Web-App-Registrierung, damit der Login zurückkommt

Nach dem Microsoft-Login leitet Entra den Browser auf eine **feste Callback-URL** eurer Next.js-App. Diese URL muss in Entra **eingetragen** sein – sonst schlägt der Login mit einem Redirect-Fehler fehl.

**Wo ihr das im Portal findet**

1. [Microsoft Entra Admin Center](https://entra.microsoft.com/) öffnen.  
2. **App-Registrierungen** → die **Web-Client-App** auswählen (z. B. **ValentinRSM Web** – nicht die API-App).  
3. Linkes Menü: **Authentifizierung**.  
4. Plattform **Web** hinzufügen oder bearbeiten (falls noch nicht vorhanden).  
5. Bereich **Umleitungs-URIs** / **Redirect URIs**.

**Was ihr eintragt**

- **Lokal / Test auf dem eigenen Rechner** (Docker oder `npm run dev`, Port 3000): **genau eine Zeile:**

  ```text
  http://localhost:3000/api/auth/callback/microsoft-entra-id
  ```

- **Später im Internet (Produktion):** **zusätzlich** eine **zweite** Zeile mit der öffentlichen HTTPS-Adresse eurer Web-App, z. B.:

  ```text
  https://<ihre-domain.de>/api/auth/callback/microsoft-entra-id
  ```

  (Host und Port müssen zur echten URL passen; der Pfad `/api/auth/callback/microsoft-entra-id` ist bei Auth.js mit dem Microsoft-Entra-ID-Provider vorgegeben.)

**Speichern** (oben oder unten im Blatt **Speichern** klicken – sonst gehen die URIs verloren).

**Passend zur Umgebungsvariable `AUTH_URL`:** `AUTH_URL` ist die **Basis-URL** der Web-App **ohne** diesen Pfad – z. B. `http://localhost:3000` lokal und `https://ihre-domain.de` in Produktion. Sie muss zur jeweils genutzten Redirect-Basis passieren.

Ausführlicher Entra-Überblick (Gruppe, Zuweisung, Variablen): [ENTRA_GRUPPE_ANMELDUNG.md](ENTRA_GRUPPE_ANMELDUNG.md).

---

**Minimal (lokal, ohne Microsoft-Konto):** API `Auth:Mode` auf `None` lassen (Standard in `appsettings.Development.json` / `appsettings.json`). Im Web **`AUTH_DISABLED=true`** setzen (siehe `.env.example` und `apps/web/.env.local.example`) – dann entfällt die Anmeldung; die API akzeptiert Aufrufe ohne `Authorization`-Header.

**Mit Entra:** In Azure zwei App-Registrierungen (geschützte **API** mit „API veröffentlichen“ / Scope z. B. `access_as_user`; **Web-Client** mit den Umleitungs-URIs wie oben). Web-Umgebung: `AUTH_SECRET`, `AUTH_URL`, `AUTH_MICROSOFT_ENTRA_ID_ID`, `AUTH_MICROSOFT_ENTRA_ID_SECRET`, `AUTH_MICROSOFT_ENTRA_ID_ISSUER` (z. B. `https://login.microsoftonline.com/<TENANT_ID>/v2.0` ohne Slash am Ende), `AUTH_API_SCOPE` (delegierter Scope für die API). API: `Auth:Mode=Entra` und `AzureAd`-Werte (`TenantId`, `ClientId` der API-App, `Audience` passend zum Token). **Wer sich anmelden darf**, legen Sie im **Microsoft Entra Admin Center** fest (Unternehmens-App / **Benutzer und Gruppen** zuweisen, ggf. dynamische Gruppe für Mitglieder, Conditional Access) – die Web-App **vertraut** einem erfolgreichen OAuth-Login und führt **keine** zusätzliche E-Mail-Allowlist aus.

**Clientgeheimnis (App „ValentinRSM Web“):** Clientgeheimnisse laufen in Entra ab. Das für **`AUTH_MICROSOFT_ENTRA_ID_SECRET`** genutzte Geheimnis dieser Registrierung ist bis **28.03.2028** gültig. Vor Ablauf unter **App-Registrierungen → ValentinRSM Web → Zertifikate und Geheimnisse** ein **neues** Clientgeheimnis anlegen, den Wert in `.env` / Hosting (**`AUTH_MICROSOFT_ENTRA_ID_SECRET`**) setzen und das alte Geheimnis nach der Umstellung entfernen.

**Schritt-für-Schritt (nur eine Gruppe, Zuweisung in Entra):** [ENTRA_GRUPPE_ANMELDUNG.md](ENTRA_GRUPPE_ANMELDUNG.md)

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
