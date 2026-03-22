using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using ValentinRSM.Api.Contracts;
using ValentinRSM.Api.Data;
using ValentinRSM.Api.Entities;
using ValentinRSM.Api.Html;

namespace ValentinRSM.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
public class TimelineEntriesController(ValentinRsmDbContext db) : ControllerBase
{
    [HttpGet]
    public async Task<ActionResult<IReadOnlyList<TimelineEntryResponse>>> List(
        [FromQuery] Guid? companyId,
        [FromQuery] Guid? contactId,
        [FromQuery] int? skip,
        [FromQuery] int? take,
        CancellationToken ct)
    {
        IQueryable<TimelineEntry> q = db.TimelineEntries.AsNoTracking().Include(e => e.Contact);
        if (contactId.HasValue)
            q = q.Where(e => e.ContactId == contactId.Value);
        if (companyId.HasValue)
            q = q.Where(e => e.CompanyId == companyId.Value);

        q = q.OrderByDescending(e => e.OccurredAt);
        if (skip is > 0)
            q = q.Skip(skip.Value);
        if (take is > 0)
            q = q.Take(Math.Min(take.Value, 200));

        var list = await q
            .Select(e => new TimelineEntryResponse(
                e.Id,
                e.CompanyId,
                e.ContactId,
                e.Contact != null ? ($"{e.Contact.FirstName} {e.Contact.LastName}").Trim() : null,
                e.Type,
                e.Source,
                e.Title,
                e.Content,
                e.OccurredAt,
                e.CreatedAt,
                e.UpdatedAt))
            .ToListAsync(ct);
        return Ok(list);
    }

    [HttpGet("{id:guid}")]
    public async Task<ActionResult<TimelineEntryResponse>> Get(Guid id, CancellationToken ct)
    {
        var e = await db.TimelineEntries.AsNoTracking()
            .Include(x => x.Contact)
            .FirstOrDefaultAsync(x => x.Id == id, ct);
        return e is null ? NotFound() : Ok(ToResponse(e));
    }

    [HttpPost]
    public async Task<ActionResult<TimelineEntryResponse>> Create([FromBody] CreateTimelineEntryRequest body, CancellationToken ct)
    {
        var company = await db.Companies.AsNoTracking().FirstOrDefaultAsync(x => x.Id == body.CompanyId, ct);
        if (company is null)
            return BadRequest("CompanyId existiert nicht.");

        Contact? contact = null;
        if (body.ContactId.HasValue)
        {
            contact = await db.Contacts.FirstOrDefaultAsync(x => x.Id == body.ContactId.Value, ct);
            if (contact is null)
                return BadRequest("ContactId existiert nicht.");
            if (contact.CompanyId != body.CompanyId)
                return BadRequest("Kontakt gehört nicht zu dieser Firma.");
        }

        var now = DateTimeOffset.UtcNow;
        var entity = new TimelineEntry
        {
            Id = Guid.NewGuid(),
            CompanyId = body.CompanyId,
            ContactId = body.ContactId,
            Type = body.Type,
            Source = body.Source,
            Title = body.Title.Trim(),
            Content = TimelineHtmlSanitizer.Sanitize(body.Content),
            OccurredAt = body.OccurredAt,
            CreatedAt = now,
            UpdatedAt = now
        };
        db.TimelineEntries.Add(entity);
        await db.SaveChangesAsync(ct);

        entity.Contact = contact;
        return CreatedAtAction(nameof(Get), new { id = entity.Id }, ToResponse(entity));
    }

    [HttpPut("{id:guid}")]
    public async Task<ActionResult<TimelineEntryResponse>> Update(Guid id, [FromBody] UpdateTimelineEntryRequest body,
        CancellationToken ct)
    {
        var entity = await db.TimelineEntries.Include(e => e.Contact).FirstOrDefaultAsync(x => x.Id == id, ct);
        if (entity is null)
            return NotFound();

        entity.Type = body.Type;
        entity.Source = body.Source;
        entity.Title = body.Title.Trim();
        entity.Content = TimelineHtmlSanitizer.Sanitize(body.Content);
        entity.OccurredAt = body.OccurredAt;
        entity.UpdatedAt = DateTimeOffset.UtcNow;
        await db.SaveChangesAsync(ct);
        return Ok(ToResponse(entity));
    }

    [HttpDelete("{id:guid}")]
    public async Task<IActionResult> Delete(Guid id, CancellationToken ct)
    {
        var entity = await db.TimelineEntries.FirstOrDefaultAsync(x => x.Id == id, ct);
        if (entity is null)
            return NotFound();
        db.TimelineEntries.Remove(entity);
        await db.SaveChangesAsync(ct);
        return NoContent();
    }

    private static TimelineEntryResponse ToResponse(TimelineEntry e) =>
        new(
            e.Id,
            e.CompanyId,
            e.ContactId,
            e.Contact != null ? ($"{e.Contact.FirstName} {e.Contact.LastName}").Trim() : null,
            e.Type,
            e.Source,
            e.Title,
            e.Content,
            e.OccurredAt,
            e.CreatedAt,
            e.UpdatedAt);
}
