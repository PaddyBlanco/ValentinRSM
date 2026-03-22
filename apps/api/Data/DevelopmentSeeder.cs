using Microsoft.EntityFrameworkCore;
using ValentinRSM.Api.Entities;
using ValentinRSM.Api.Enums;

namespace ValentinRSM.Api.Data;

/// <summary>
/// Idempotente Demo-Daten nur für Development (leere DB).
/// Feste GUIDs für reproduzierbare Umgebungen; FKs: Company → Contact → TimelineEntry.
/// </summary>
public static class DevelopmentSeeder
{
    public static async Task SeedAsync(ValentinRsmDbContext db, CancellationToken ct = default)
    {
        if (await db.Companies.AsNoTracking().AnyAsync(ct))
            return;

        var t0 = DateTimeOffset.UtcNow;

        var companies = new[]
        {
            (Id: Guid.Parse("a1000000-0000-4000-8000-000000000001"), Name: "Acme Trading GmbH", Type: "Kunde", Status: CompanyStatus.Active, Color: "#2563eb", Notes: "Hauptkunde, QBR vierteljährlich."),
            (Id: Guid.Parse("a1000000-0000-4000-8000-000000000002"), Name: "Nordbank AG", Type: "Bank", Status: CompanyStatus.InFocus, Color: "#0d9488", Notes: "Kreditlinie 2025 verhandeln."),
            (Id: Guid.Parse("a1000000-0000-4000-8000-000000000003"), Name: "TechParts SE", Type: "Lieferant", Status: CompanyStatus.Active, Color: "#ca8a04", Notes: null),
            (Id: Guid.Parse("a1000000-0000-4000-8000-000000000004"), Name: "Müller & Partner Beratung", Type: "Berater", Status: CompanyStatus.Dormant, Color: "#64748b", Notes: "Projekt 2024 abgeschlossen."),
            (Id: Guid.Parse("a1000000-0000-4000-8000-000000000005"), Name: "Global Invest S.à r.l.", Type: "Investor", Status: CompanyStatus.Active, Color: "#7c3aed", Notes: "Board-Meetings."),
            (Id: Guid.Parse("a1000000-0000-4000-8000-000000000006"), Name: "Hafenlogistik Nord", Type: "Partner", Status: CompanyStatus.Active, Color: "#ea580c", Notes: null),
            (Id: Guid.Parse("a1000000-0000-4000-8000-000000000007"), Name: "Steuerkanzlei Klein", Type: "Berater", Status: CompanyStatus.Active, Color: null, Notes: "Jahresabschluss."),
            (Id: Guid.Parse("a1000000-0000-4000-8000-000000000008"), Name: "Alte Werft KG", Type: "Kunde", Status: CompanyStatus.Archived, Color: "#94a3b8", Notes: "Vertrag ausgelaufen."),
            (Id: Guid.Parse("a1000000-0000-4000-8000-000000000009"), Name: "CloudNine SaaS Inc.", Type: "Partner", Status: CompanyStatus.InFocus, Color: "#db2777", Notes: "API-Integration."),
            (Id: Guid.Parse("a1000000-0000-4000-8000-00000000000a"), Name: "Regionalbau GmbH", Type: "Kunde", Status: CompanyStatus.Active, Color: "#16a34a", Notes: "Baustelle Nord."),
        };

        var companyEntities = companies.Select(c => new Company
        {
            Id = c.Id,
            Name = c.Name,
            Type = c.Type,
            Status = c.Status,
            AccentColor = c.Color,
            Notes = c.Notes,
            CreatedAt = t0.AddDays(-120),
            UpdatedAt = t0,
        }).ToList();

        db.Companies.AddRange(companyEntities);

        var contacts = new List<Contact>();
        var timelines = new List<TimelineEntry>();

        void AddContact(Guid id, Guid companyId, string first, string last, string? email, string? phone,
            string? role, int createdDaysAgo)
        {
            var created = t0.AddDays(-createdDaysAgo);
            contacts.Add(new Contact
            {
                Id = id,
                CompanyId = companyId,
                FirstName = first,
                LastName = last,
                Email = email,
                Phone = phone,
                RoleTitle = role,
                KnowsFrom = "Konferenz 2024",
                CapabilityNote = role != null ? $"Schwerpunkt: {role}" : null,
                Notes = null,
                CreatedAt = created,
                UpdatedAt = created,
            });
        }

        void AddTimeline(Guid id, Guid contactId, TimelineEntryType type, TimelineSource source,
            string title, string content, int occurredDaysAgo)
        {
            var occurred = t0.AddDays(-occurredDaysAgo).AddHours(-(occurredDaysAgo % 7));
            var created = occurred.AddMinutes(5);
            timelines.Add(new TimelineEntry
            {
                Id = id,
                ContactId = contactId,
                Type = type,
                Source = source,
                Title = title,
                Content = content,
                OccurredAt = occurred,
                CreatedAt = created,
                UpdatedAt = created,
            });
        }

        var c = 0;
        Guid NextC() => Guid.Parse($"b2000000-0000-4000-8000-{c++:x12}");
        var ev = 0;
        Guid NextE() => Guid.Parse($"c3000000-0000-4000-8000-{ev++:x12}");

        // Acme — 4 Kontakte, viele Events
        var acme = companies[0].Id;
        AddContact(NextC(), acme, "Anna", "Schmidt", "anna.schmidt@acme.example", "+49 40 1111", "Geschäftsführung", 90);
        AddContact(NextC(), acme, "Tom", "Weber", "tom.weber@acme.example", null, "Einkauf", 60);
        AddContact(NextC(), acme, "Lisa", "König", "lisa@acme.example", "+49 40 2222", null, 45);
        AddContact(NextC(), acme, "Jan", "Hoffmann", null, "+49 40 3333", "IT", 14);

        var acmeC0 = contacts[^4].Id;
        var acmeC1 = contacts[^3].Id;
        var acmeC2 = contacts[^2].Id;
        var acmeC3 = contacts[^1].Id;

        AddTimeline(NextE(), acmeC0, TimelineEntryType.Email, TimelineSource.Email,
            "Re: Rahmenvertrag 2026", "Hallo Anna, angehängt der Entwurf …", 3);
        AddTimeline(NextE(), acmeC0, TimelineEntryType.MeetingNote, TimelineSource.Manual,
            "Workshop Strategie", "Teilnehmer: GF, Sales. Nächste Schritte: Pilot Q2.", 10);
        AddTimeline(NextE(), acmeC1, TimelineEntryType.CallSummary, TimelineSource.Manual,
            "Telefonat Lieferantenbonus", "Kurzprotokoll: 2 % Skonto bei Vorkasse besprochen.", 7);
        AddTimeline(NextE(), acmeC2, TimelineEntryType.ManualNote, TimelineSource.Manual,
            "Intern: Pricing", "Wettbewerber X unterboten uns bei SKU 12.", 18);
        AddTimeline(NextE(), acmeC3, TimelineEntryType.ResearchNote, TimelineSource.Research,
            "Marktscan UK", "Drei Wettbewerber identifiziert, Quellen in Anhang.", 25);

        // Nordbank — 3 Kontakte
        var bank = companies[1].Id;
        AddContact(NextC(), bank, "Claudia", "Richter", "claudia.richter@nordbank.example", "+49 89 1000", "Relationship Manager", 100);
        AddContact(NextC(), bank, "Stefan", "Bauer", "stefan.b@nordbank.example", null, "Kreditrisiko", 40);
        AddContact(NextC(), bank, "Nora", "Lorenz", "nora.l@nordbank.example", "+49 89 2000", null, 20);

        var bankC0 = contacts[^3].Id;
        AddTimeline(NextE(), bankC0, TimelineEntryType.Email, TimelineSource.ForwardedEmail,
            "Zinsbindung Optionen", "Sehr geehrte Damen und Herren, zu Ihrer Anfrage …", 5);
        AddTimeline(NextE(), bankC0, TimelineEntryType.MeetingNote, TimelineSource.Manual,
            "Termin Filiale Hamburg", "Covenant-Review, keine Abweichungen.", 12);

        // TechParts — 2
        var tp = companies[2].Id;
        AddContact(NextC(), tp, "Marco", "Silva", "marco@techparts.example", "+351 21 000", "Vertrieb EU", 70);
        AddContact(NextC(), tp, "Elena", "Varga", "elena@techparts.example", null, null, 30);
        AddTimeline(NextE(), contacts[^2].Id, TimelineEntryType.Email, TimelineSource.Email,
            "Lieferschein #4492", "Ware versandt, Tracking: …", 2);

        // Müller — 1 (ruhend)
        var m = companies[3].Id;
        AddContact(NextC(), m, "Frank", "Müller", "frank@mueller-partner.example", null, "Inhaber", 200);
        AddTimeline(NextE(), contacts[^1].Id, TimelineEntryType.ManualNote, TimelineSource.Manual,
            "Letzter Kontakt", "Kein Bedarf bis Q3, Follow-up Winter.", 90);

        // Global Invest — 3
        var gi = companies[4].Id;
        AddContact(NextC(), gi, "James", "Cole", "j.cole@globalinvest.example", "+1 212 555 0100", "Partner", 80);
        AddContact(NextC(), gi, "Sofia", "Martinez", "sofia@globalinvest.example", null, "Analyst", 50);
        AddContact(NextC(), gi, "Oliver", "Neumann", "oliver@globalinvest.example", "+49 69 9000", null, 22);
        AddTimeline(NextE(), contacts[^3].Id, TimelineEntryType.MeetingNote, TimelineSource.Manual,
            "Due Diligence Call", "Finanzmodell besprochen, Datenraum geöffnet.", 8);
        AddTimeline(NextE(), contacts[^2].Id, TimelineEntryType.ResearchNote, TimelineSource.Research,
            "Sector note: Logistics", "Kurzstudie 12 Seiten.", 15);

        // Hafenlogistik — 2
        var hl = companies[5].Id;
        AddContact(NextC(), hl, "Kai", "Petersen", "kai@hafenlogistik.example", "+49 40 7777", "Operations", 55);
        AddContact(NextC(), hl, "Ute", "Fischer", "ute@hafenlogistik.example", null, "Disposition", 33);
        AddTimeline(NextE(), contacts[^2].Id, TimelineEntryType.CallSummary, TimelineSource.Manual,
            "Slot Kapazität Q2", "Zusätzliche Stellplätze möglich ab 15.4.", 6);

        // Steuerkanzlei — 2
        var sk = companies[6].Id;
        AddContact(NextC(), sk, "Petra", "Klein", "petra@steuer-klein.example", "+49 221 100", "Steuerberaterin", 95);
        AddContact(NextC(), sk, "Dirk", "Sommer", "dirk@steuer-klein.example", null, "Associate", 44);
        AddTimeline(NextE(), contacts[^2].Id, TimelineEntryType.Email, TimelineSource.Email,
            "Umsatzsteuer-Voranmeldung", "Bitte Belege bis Freitag hochladen.", 4);

        // Alte Werft — 1 archiviert
        var aw = companies[7].Id;
        AddContact(NextC(), aw, "Ralf", "Groß", "ralf@altewerft.example", null, "ehem. GF", 400);
        AddTimeline(NextE(), contacts[^1].Id, TimelineEntryType.ManualNote, TimelineSource.System,
            "Archiv-Hinweis", "Projekt beendet, keine aktiven Tickets.", 300);

        // CloudNine — 3
        var cn = companies[8].Id;
        AddContact(NextC(), cn, "Priya", "Shah", "priya@cloudnine.example", "+1 415 555 0199", "Product", 35);
        AddContact(NextC(), cn, "Leo", "Park", "leo@cloudnine.example", null, "Engineering", 28);
        AddContact(NextC(), cn, "Mira", "Öztürk", "mira@cloudnine.example", "+49 30 4444", "CSM", 11);
        AddTimeline(NextE(), contacts[^3].Id, TimelineEntryType.Email, TimelineSource.BotEmail,
            "Webhook test OK", "Automatischer Test der Sandbox-API erfolgreich.", 1);
        AddTimeline(NextE(), contacts[^2].Id, TimelineEntryType.MeetingNote, TimelineSource.Manual,
            "Integration Review", "OAuth-Scopes finalisiert.", 9);
        AddTimeline(NextE(), contacts[^1].Id, TimelineEntryType.ManualNote, TimelineSource.Plaud,
            "Slack: Release-Termin", "Go-live vorgeschlagen für KW14.", 2);

        // Regionalbau — 4
        var rb = companies[9].Id;
        AddContact(NextC(), rb, "Hans", "Becker", "hans@regionalbau.example", "+49 511 888", "Bauleiter", 66);
        AddContact(NextC(), rb, "Ines", "Wolf", "ines@regionalbau.example", null, "Architektin", 48);
        AddContact(NextC(), rb, "Yusuf", "Demir", "yusuf@regionalbau.example", "+49 511 999", null, 31);
        AddContact(NextC(), rb, "Petra", "Wagner", "petra.w@regionalbau.example", null, "Einkauf", 19);
        AddTimeline(NextE(), contacts[^4].Id, TimelineEntryType.MeetingNote, TimelineSource.Manual,
            "Baustellenbegehung", "Mängelliste an Subunternehmer versendet.", 5);
        AddTimeline(NextE(), contacts[^3].Id, TimelineEntryType.Email, TimelineSource.Email,
            "Termin Rohbau", "Montag 08:00 Uhr Treffpunkt Tor 2.", 12);
        AddTimeline(NextE(), contacts[^2].Id, TimelineEntryType.CallSummary, TimelineSource.Manual,
            "Abstimmung Statik", "Freigabe für Deckenplatten erteilt.", 20);
        AddTimeline(NextE(), contacts[^1].Id, TimelineEntryType.ResearchNote, TimelineSource.Research,
            "Zulassung Behörde", "Antragsnummer und Fristen dokumentiert.", 27);

        db.Contacts.AddRange(contacts);
        db.TimelineEntries.AddRange(timelines);
        await db.SaveChangesAsync(ct);
    }
}
