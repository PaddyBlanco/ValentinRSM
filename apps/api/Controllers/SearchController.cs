using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using ValentinRSM.Api.Contracts;
using ValentinRSM.Api.Data;
using ValentinRSM.Api.Html;

namespace ValentinRSM.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
public class SearchController(ValentinRsmDbContext db) : ControllerBase
{
    private const int MinQueryLength = 2;
    private const int DefaultLimit = 25;
    private const int MaxLimit = 80;

    /// <summary>
    /// Volltextsuche (LIKE) über Firmenname/Typ/Notizen, Kontakt-Stammdaten, Timeline Titel/Inhalt.
    /// </summary>
    [HttpGet]
    public async Task<ActionResult<SearchResponse>> Search([FromQuery] string? q, [FromQuery] int? take,
        CancellationToken ct)
    {
        var raw = q?.Trim() ?? "";
        if (raw.Length < MinQueryLength)
        {
            return Ok(new SearchResponse(raw, [], [], []));
        }

        var limit = Math.Clamp(take ?? DefaultLimit, 1, MaxLimit);

        var companies = await db.Companies.AsNoTracking()
            .Where(c =>
                c.Name.Contains(raw) ||
                c.Type.Contains(raw) ||
                (c.Notes != null && c.Notes.Contains(raw)))
            .OrderBy(c => c.Name)
            .Take(limit)
            .Select(c => new SearchCompanyHit(c.Id, c.Name, c.Type, c.Status, c.AccentColor))
            .ToListAsync(ct);

        var contacts = await db.Contacts.AsNoTracking()
            .Where(c =>
                c.FirstName.Contains(raw) ||
                c.LastName.Contains(raw) ||
                (c.Email != null && c.Email.Contains(raw)) ||
                (c.Phone != null && c.Phone.Contains(raw)) ||
                (c.RoleTitle != null && c.RoleTitle.Contains(raw)) ||
                (c.KnowsFrom != null && c.KnowsFrom.Contains(raw)) ||
                (c.CapabilityNote != null && c.CapabilityNote.Contains(raw)) ||
                (c.Notes != null && c.Notes.Contains(raw)))
            .OrderBy(c => c.LastName).ThenBy(c => c.FirstName)
            .Take(limit)
            .Select(c => new SearchContactHit(
                c.Id,
                c.CompanyId,
                c.Company.Name,
                c.FirstName,
                c.LastName,
                c.Email))
            .ToListAsync(ct);

        var timelineRows = await db.TimelineEntries.AsNoTracking()
            .Include(e => e.Contact)
            .Include(e => e.Company)
            .Where(e => e.Title.Contains(raw) || e.Content.Contains(raw))
            .OrderByDescending(e => e.OccurredAt)
            .Take(limit)
            .ToListAsync(ct);

        var timeline = timelineRows.Select(e =>
        {
            string? contactName = null;
            if (e.Contact != null)
                contactName = $"{e.Contact.FirstName} {e.Contact.LastName}".Trim();
            return new SearchTimelineHit(
                e.Id,
                e.CompanyId,
                e.Company.Name,
                e.ContactId,
                contactName,
                e.Title,
                Preview(TimelineHtmlSanitizer.ToPlainText(e.Content)),
                e.OccurredAt,
                e.Type,
                e.Source);
        }).ToList();

        return Ok(new SearchResponse(raw, companies, contacts, timeline));
    }

    private static string Preview(string plainText, int max = 220)
    {
        var s = plainText.ReplaceLineEndings(" ").Trim();
        if (s.Length <= max) return s;
        return s[..max] + "…";
    }
}
