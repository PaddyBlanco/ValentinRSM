# ValentinRSM – Projektkontext

Zentrale Referenz für Domäne, MVP, Stack und Phasenplan. Bei fachlichen oder architektonischen Fragen zuerst hier prüfen.

## Überblick

ValentinRSM ist ein internes Relationship-Management-System für **2 interne Nutzer**. Es ist **kein SaaS**, kein öffentliches Produkt und kein generisches CRM.

Das System ist das **zentrale Betriebswerkzeug** für die Verwaltung von:

- Firmen
- Kontakten
- Beziehungen
- Kommunikationshistorie
- Notizen
- Bot-/Automations-Eingängen

**Fokus:** Firmen als Primärobjekt und eine **chronologische Timeline** pro Kontakt/Firma.

## Fachliches Ziel

Das System soll ermöglichen:

- Firmen zentral zu verwalten
- Kontakte **genau einer Firma** zuzuordnen
- relevante Kommunikation **chronologisch** sichtbar zu machen
- **vollständige E-Mails** zu speichern
- Meetingnotizen und Telefonzusammenfassungen **manuell** in die Timeline zu übernehmen
- neue Kontakte/Firmen über **Bot-/Mail-Automationen** vorzuschlagen oder anzulegen
- eine **starke Volltextsuche** über Firmen, Kontakte und Timeline-Inhalte bereitzustellen

## Wichtige fachliche Regeln

### Firma ist das Primärobjekt

Die Beziehung hängt immer an der Firma.

### Kontakt gehört genau einer Firma

Ein Kontakt ist immer genau einer Firma zugeordnet.

### Eine Firma hat genau einen Typ (Freitext)

Der **Typ** ist ein **Freitextfeld** (kein festes Dropdown mit wenigen Enum-Werten). Dort steht z. B. **Kunde**, **Partner**, **Bank**, **Investor**, **Berater** oder beliebige eigene Bezeichnungen – je nach Bedarf, ohne Schema-Anpassung.

### Eine Firma hat eine Kennfarbe (Übersicht)

Jede Firma kann eine **Farbe** (Akzentfarbe) haben, damit sie in **Listen und Übersichten** schneller erkennbar ist (z. B. farbiger Balken oder Punkt neben dem Namen). Die Farbe ist **präsentationsorientiert**, kein Ersatz für Typ oder Status.

### Eine Firma hat genau einen Status

Mögliche Status: **Aktiv**, **Im Blick**, **Ruhend**, **Archiviert**.

### Timeline-Einträge

Timeline-Einträge sind relevante fachliche Ereignisse, z. B.:

- E-Mails
- Meetingprotokolle
- Telefonzusammenfassungen
- manuelle Notizen
- Rechercheeinträge

### Kein WhatsApp in der Timeline

WhatsApp wird **nicht** als Timeline-Element verwendet. WhatsApp dient nur dazu, **Bot-/Automations-Aktionen** auszulösen.

### Statusänderungen sind keine Timeline-Events

Statuswechsel müssen **nicht** als Aktivität in der Timeline erscheinen.

### Timeline-Einträge ohne Kontakt gibt es nicht

Jeder Timeline-Eintrag ist immer **einer Firma** und **einem Kontakt** zugeordnet.

### Freitext-Felder

Sowohl **Firma** als auch **Kontakt** haben jeweils ein eigenes Freitextfeld.

### Bot-Konzept

- Ein Bot ist eine **interne Interaktions- und Automationsschnittstelle**.
- Er ist **kein** eigener Geschäftsobjekttyp und **kein** Timeline-Kanal.
- Der Bot kann über **E-Mail** und später optional **WhatsApp** angesprochen werden.

**Bot v1** soll nur drei Dinge können:

1. Kontakt hinzufügen
2. Firma erkennen oder anlegen
3. E-Mails zuordnen

Der Bot schreibt **nicht direkt** in die Datenbank – er ruft **immer das Backend** auf.

### Suche (Kernfeature)

Die Volltextsuche soll u. a. durchsuchen:

- Firmenname, **Firmen-Typ (Freitext)**, Firmen-Freitext
- Kontakt: Vorname, Nachname, E-Mail, Telefon, Position, „Woher kenne ich ihn“, „Was kann er“, Kontakt-Freitext
- Timeline: Titel, Inhalt
- vollständige E-Mails, Meetingnotizen, Telefonnotizen

Zusätzlich:

- globale Kontaktübersicht
- globale Firmenübersicht
- gute **globale Suche** über alles Relevante

## Technologiestack

| Bereich       | Technologie                                |
| ------------- | ------------------------------------------ |
| Frontend      | Next.js, React, TypeScript                 |
| Backend       | ASP.NET Core Web API, **.NET 10**, EF Core |
| Datenbank     | SQL-Server                                 |
| Automation    | n8n                                        |
| Infrastruktur | Docker, Docker Compose                     |

## Architekturprinzipien

- **Monolith first:** kein Microservice-Setup – ein Backend, ein Frontend, eine Datenbank.
- **Modulare Struktur im Monolith:** logische Module z. B. Companies, Contacts, Timeline, Search, Bot.
- **API-first:** n8n und andere Automationen greifen **nur über die API** zu.
- **Pragmatisch:** kein Overengineering – **kein CQRS**, kein Event-Bus, kein Kubernetes, keine komplizierte Rollenmatrix in v1.

## MVP-Scope

### Muss in v1 enthalten sein

- Firmen anlegen / bearbeiten / anzeigen
- Kontakte anlegen / bearbeiten / anzeigen
- Kontakt immer einer Firma zuordnen
- Firma mit **Typ (Freitext)**, **Status** und optionaler **Kennfarbe**
- Freitext bei Firma und Kontakt
- Timeline-Einträge anlegen / anzeigen
- E-Mails vollständig speichern
- Meeting- und Telefonnotizen als Timeline-Einträge
- globale Suche
- globale Kontaktübersicht
- globale Firmenübersicht
- Bot-Endpunkte für: Kontakt hinzufügen, Firma erkennen/anlegen, E-Mail zuordnen

### Nicht Teil von v1

- Aufgabenmanagement
- Mehrbenutzer-Rollenmodell im Detail
- externe Portale
- WhatsApp als echter Kommunikationskanal in der Timeline
- Datei-/Anhangsmanagement im großen Stil
- SaaS-/Mandantenfähigkeit
- komplexe Audit-Historie

## Erste Domänenobjekte

### Company

Repräsentiert eine Firma.

**Felder grob:** Id, Name, **Type** (Freitext, z. B. „Kunde“, „Partner“, „Bank“, „Investor“), **Status** (fest: Aktiv / Im Blick / Ruhend / Archiviert), **AccentColor** (optional, z. B. CSS-Hex `#RRGGBB` für Listen/Übersicht), Notes, CreatedAt, UpdatedAt

### Contact

Repräsentiert eine Person.

**Felder grob:** Id, CompanyId, FirstName, LastName, Email, Phone, RoleTitle, KnowsFrom, CapabilityNote, Notes, CreatedAt, UpdatedAt

### TimelineEntry

Repräsentiert ein chronologisches Ereignis.

**Felder grob:** Id, CompanyId, ContactId, Type, Source, Title, Content, OccurredAt, CreatedAt, UpdatedAt

### Erste Timeline-Typen (v1)

Email, MeetingNote, CallSummary, ManualNote, ResearchNote

### Erste Source-Typen (v1)

Manual, Email, BotEmail, ForwardedEmail, Plaud, Research, System

## Erste Screens

Fokus auf wenige klare Screens:

- Firmenübersicht
- Kontaktübersicht
- Firmen-Detailseite
- Kontakt-Detailseite
- Globale Suche

**Firmen-Detailseite:** Name, Typ (Freitext), Status, Kennfarbe, Freitext, zugeordnete Kontakte, Timeline

**Firmenübersicht:** Typ und **Farbe** nutzen, um Einträge **auf einen Blick** zu unterscheiden (z. B. farbiges Label oder Indikator pro Zeile).

**Kontakt-Detailseite:** Stammdaten, Firma, Freitext, Timeline

## UX-Prinzipien

- schlicht, schnell, **suchzentriert**
- mobil gut benutzbar
- keine überladene Oberfläche
- Fokus auf **Lesen, Finden und schnelles Erfassen**
- **Firmenfarbe** in Listen nutzen, um Firmen **visuell** schneller zu scannen (ohne die Oberfläche zu überladen)

## Entwicklungsreihenfolge

| Phase | Inhalt                                          |
| ----- | ----------------------------------------------- |
| **1** | Projektstruktur und Docker-Basis                |
| **2** | Backend + Datenbank + erste Migration           |
| **3** | Frontend-Grundgerüst, erste Listen/Detailseiten |
| **4** | Timeline und globale Suche                      |
| **5** | Bot-/n8n-Endpunkte                              |

## Erste technische Schritte

1. Monorepo-Struktur anlegen
2. Docker Compose für: `web`, `api`, `db`, `n8n`
3. .NET API initialisieren
4. Next.js App initialisieren
5. SQL Server anbinden
6. erste Entities + Migration
7. erste CRUD-Endpunkte
8. erste Screens bauen

## Wichtige Umsetzungsregel

Wenn etwas unklar ist, **lieber schlicht und wartbar** lösen. Das Projekt soll **schnell produktiv** werden und nicht in Architektur-Diskussionen stecken bleiben.
