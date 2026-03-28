# Anmeldung nur für eine Entra-Gruppe

Nur **Mitglieder eurer Gruppe** sollen sich bei ValentinRSM anmelden können. Das steuert ihr **ausschließlich in Microsoft Entra** (Zuweisung zur App). Die ValentinRSM-Web-App enthält **keine** Gruppen-ID – sie vertraut dem erfolgreichen Login.

---

## Teil A: Microsoft Entra Admin Center

### A.1 Gruppe (habt ihr schon)

**Pfad:** **Identität** → **Gruppen** → eure Gruppe  
Dort Mitgliederverwaltung (Benutzer in die Gruppe aufnehmen).

### A.2 Unternehmens-App des **Web-Clients** (Login-Gate)

Die Anmeldung läuft über die App-Registrierung, deren **Client-ID** ihr in `AUTH_MICROSOFT_ENTRA_ID_ID` eintragt (siehe Teil B). Für genau **diese** Anwendung stellt ihr die Zuweisung ein.

**So findet ihr die Unternehmens-App:**

1. [Microsoft Entra Admin Center](https://entra.microsoft.com/)  
2. **Anwendungen** → **Unternehmensanwendungen**  
3. In der Suche den **Anzeigenamen** eurer **Web-/Client-App-Registrierung** eingeben (oder die **Anwendungs-ID (Client)** aus der App-Registrierung suchen – je nach Portal oft über „Anwendungs-ID“ filterbar).

**Tipp:** In **App-Registrierungen** → eure **Client-App** → Übersicht → Link **„Verwaltete Anwendung im lokalen Verzeichnis“** öffnet dieselbe Unternehmens-App.

**Einstellungen:**

1. **Eigenschaften**  
   - **Benutzerzuweisung erforderlich?** → **Ja**  
     (Wenn „Nein“, kann jeder im Mandant die Anmeldeseite nutzen – dann greift eure Gruppenzuweisung nicht als Sperre.)

2. **Benutzer und Gruppen**  
   - **Benutzer/Gruppe zuweisen**  
   - **Gruppe** auswählen (eure Gruppe), Rolle z. B. „Standardzugriff“ / Default, **Zuweisen** speichern.

**Ergebnis:** Nur Benutzer, die (direkt oder über die Gruppe) dieser Unternehmens-App zugewiesen sind, erhalten ein Token und können den OAuth-Login abschließen. Alle anderen sehen einen Fehler von Microsoft (kein Zugriff auf die App).

### A.3 API-App (optional, gleiche Idee)

Wenn die **API** eigene **geschützte Zuweisungen** nutzt (selten nötig bei reiner Web-App + delegiertem Scope), gibt es eine **zweite** Unternehmens-App zur **API-App-Registrierung**. Für das übliche Setup reicht die **Zuweisung am Web-Client** (A.2).

### A.4 Wo ihr die Werte **ablesen** (für Teil B)

| Was ihr braucht | Wo im Portal |
|-----------------|--------------|
| **Verzeichnis-ID (Tenant-ID)** | **Microsoft Entra ID** → **Übersicht** → **Verzeichnis-ID** |
| **Client-ID (Web-Login)** | **App-Registrierungen** → **Client-App** (Next.js) → **Anwendungs-ID (Client)** |
| **Geheimnis (Client Secret)** | Dieselbe App-Registrierung → **Zertifikate und Geheimnisse** → **Neues Clientgeheimnis** |
| **Issuer-URL** | `https://login.microsoftonline.com/<VERZEICHNIS-ID>/v2.0/` |
| **API – Anwendungs-ID (Client)** | **App-Registrierungen** → **API-App** → **Anwendungs-ID (Client)** |
| **API – Audience** | API-App → **Eine API verfügbar machen** → **Anwendungs-ID-URI** und Scope z. B. `access_as_user` → Audience ist oft `api://<API-APP-ID>` oder der vollständige Scope-URI je nach Konfiguration |
| **Scope für `AUTH_API_SCOPE`** | Form `api://<API-APP-ID>/access_as_user` (an eure **Expose**-Einstellung anpassen) |

Die **Gruppen-Object-ID** tragt ihr **nicht** in ValentinRSM ein – die Gruppe wirkt nur über die **Zuweisung** in A.2.

---

## Teil B: Werte in der App eintragen

### B.1 Web-App (Next.js) – Umgebungsvariablen

Datei je nach Setup: **`.env`** (Docker im Projektroot), **`apps/web/.env.local`** (lokal), oder eure Hosting-Umgebung (Container App, App Service, …).

| Variable | Inhalt |
|----------|--------|
| `AUTH_SECRET` | Zufällige lange Zeichenkette (z. B. `openssl rand -base64 32`) – **Auth.js** |
| `AUTH_URL` | Öffentliche Basis-URL der Web-App, z. B. `http://localhost:3000` lokal oder `https://eure-domain.de` in Produktion |
| `AUTH_MICROSOFT_ENTRA_ID_ID` | **Client-ID** der **Web-Client-App-Registrierung** (siehe A.4) |
| `AUTH_MICROSOFT_ENTRA_ID_SECRET` | **Clientgeheimnis** dieser App-Registrierung |
| `AUTH_MICROSOFT_ENTRA_ID_ISSUER` | `https://login.microsoftonline.com/<TENANT-ID>/v2.0` (ohne `/` am Ende; sonst OIDC „issuer mismatch“) |
| `AUTH_API_SCOPE` | Delegierter Scope zur API, z. B. `api://<API-APP-ID>/access_as_user` |
| `NEXT_PUBLIC_API_URL` | URL der ValentinRSM-API für den Browser (z. B. `http://localhost:8080`) |

**Umleitungs-URI (Redirect)** – **App-Registrierungen** → **Web-Client-App** → **Authentifizierung** → Plattform **Web** → **Umleitungs-URIs**:

- Lokal: `http://localhost:3000/api/auth/callback/microsoft-entra-id`
- Produktion: zusätzlich `https://<eure-domain>/api/auth/callback/microsoft-entra-id`

Im Portal **Speichern**. Details und `AUTH_URL`: [INSTALLATION.md](INSTALLATION.md) Abschnitt **4.5** („Umleitungs-URI“).

`AUTH_DISABLED` nur für **Entwicklung ohne Login** auf `true` setzen – **nicht** mit echtem Entra-Betrieb für die Gruppenregel.

### B.2 API (ASP.NET) – JWT prüfen

Wenn die API Anfragen mit **Bearer-Token** absichern soll:

| Konfiguration | Inhalt |
|---------------|--------|
| `Auth:Mode` | `Entra` (in `appsettings` / Umgebung: `Auth__Mode`) |
| `AzureAd:TenantId` | Verzeichnis-ID (Tenant) |
| `AzureAd:ClientId` | **Anwendungs-ID (Client)** der **API-App-Registrierung** (nicht die der Web-Client-App) |
| `AzureAd:Audience` | Erwartete Audience im Token (z. B. `api://…` wie unter API **Expose** konfiguriert) |

Bei **Docker** siehe Projekt-`.env` / `docker-compose`: u. a. `AUTH_API_MODE=Entra`, `AZURE_AD_TENANT_ID`, `AZURE_AD_API_CLIENT_ID`, `AZURE_AD_API_AUDIENCE`.

---

## Kurz-Checkliste

1. Unternehmens-App des **Web-Clients**: **Benutzerzuweisung erforderlich = Ja**  
2. Dieselbe App: **Gruppe** (und ggf. Admins) **zugewiesen**  
3. Web-`.env`: Tenant, Client-ID, Secret, Issuer, Scope, `AUTH_URL`, `AUTH_SECRET`, API-URL  
4. API: `Entra` + `AzureAd` wie oben  
5. Redirect-URI und ggf. **API-Berechtigungen** der Client-App auf die API (delegierter Scope) sind in Entra korrekt  

Wenn etwas nicht klappt: zuerst prüfen, ob der betroffene Benutzer **in der Gruppe** und der Gruppe die **Unternehmens-App zugewiesen** ist; dann Client-ID/Secret und Issuer gegen die **Client-App-Registrierung** vergleichen.
