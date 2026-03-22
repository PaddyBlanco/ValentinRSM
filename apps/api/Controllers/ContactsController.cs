using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using ValentinRSM.Api.Contracts;
using ValentinRSM.Api.Data;
using ValentinRSM.Api.Entities;

namespace ValentinRSM.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
public class ContactsController(ValentinRsmDbContext db) : ControllerBase
{
    [HttpGet]
    public async Task<ActionResult<IReadOnlyList<ContactResponse>>> List(
        [FromQuery] Guid? companyId,
        [FromQuery] int? take,
        [FromQuery] string? sort,
        CancellationToken ct)
    {
        var q = db.Contacts.AsNoTracking();
        if (companyId.HasValue)
            q = q.Where(x => x.CompanyId == companyId.Value);

        var recent = string.Equals(sort, "recent", StringComparison.OrdinalIgnoreCase);
        q = recent
            ? q.OrderByDescending(x => x.CreatedAt)
            : q.OrderBy(x => x.LastName).ThenBy(x => x.FirstName);
        if (take is > 0)
            q = q.Take(Math.Min(take.Value, 200));

        var list = await q
            .Select(x => ToResponse(x))
            .ToListAsync(ct);
        return Ok(list);
    }

    [HttpGet("{id:guid}")]
    public async Task<ActionResult<ContactResponse>> Get(Guid id, CancellationToken ct)
    {
        var c = await db.Contacts.AsNoTracking().FirstOrDefaultAsync(x => x.Id == id, ct);
        return c is null ? NotFound() : Ok(ToResponse(c));
    }

    [HttpPost]
    public async Task<ActionResult<ContactResponse>> Create([FromBody] CreateContactRequest body, CancellationToken ct)
    {
        var companyExists = await db.Companies.AnyAsync(x => x.Id == body.CompanyId, ct);
        if (!companyExists)
            return BadRequest("CompanyId existiert nicht.");

        var now = DateTimeOffset.UtcNow;
        var entity = new Contact
        {
            Id = Guid.NewGuid(),
            CompanyId = body.CompanyId,
            FirstName = body.FirstName.Trim(),
            LastName = body.LastName.Trim(),
            Email = string.IsNullOrWhiteSpace(body.Email) ? null : body.Email.Trim(),
            Phone = string.IsNullOrWhiteSpace(body.Phone) ? null : body.Phone.Trim(),
            RoleTitle = string.IsNullOrWhiteSpace(body.RoleTitle) ? null : body.RoleTitle.Trim(),
            KnowsFrom = string.IsNullOrWhiteSpace(body.KnowsFrom) ? null : body.KnowsFrom.Trim(),
            CapabilityNote = string.IsNullOrWhiteSpace(body.CapabilityNote) ? null : body.CapabilityNote.Trim(),
            Notes = string.IsNullOrWhiteSpace(body.Notes) ? null : body.Notes.Trim(),
            CreatedAt = now,
            UpdatedAt = now
        };
        db.Contacts.Add(entity);
        await db.SaveChangesAsync(ct);
        return CreatedAtAction(nameof(Get), new { id = entity.Id }, ToResponse(entity));
    }

    [HttpPut("{id:guid}")]
    public async Task<ActionResult<ContactResponse>> Update(Guid id, [FromBody] UpdateContactRequest body, CancellationToken ct)
    {
        var entity = await db.Contacts.FirstOrDefaultAsync(x => x.Id == id, ct);
        if (entity is null)
            return NotFound();

        entity.FirstName = body.FirstName.Trim();
        entity.LastName = body.LastName.Trim();
        entity.Email = string.IsNullOrWhiteSpace(body.Email) ? null : body.Email.Trim();
        entity.Phone = string.IsNullOrWhiteSpace(body.Phone) ? null : body.Phone.Trim();
        entity.RoleTitle = string.IsNullOrWhiteSpace(body.RoleTitle) ? null : body.RoleTitle.Trim();
        entity.KnowsFrom = string.IsNullOrWhiteSpace(body.KnowsFrom) ? null : body.KnowsFrom.Trim();
        entity.CapabilityNote = string.IsNullOrWhiteSpace(body.CapabilityNote) ? null : body.CapabilityNote.Trim();
        entity.Notes = string.IsNullOrWhiteSpace(body.Notes) ? null : body.Notes.Trim();
        entity.UpdatedAt = DateTimeOffset.UtcNow;
        await db.SaveChangesAsync(ct);
        return Ok(ToResponse(entity));
    }

    [HttpDelete("{id:guid}")]
    public async Task<IActionResult> Delete(Guid id, CancellationToken ct)
    {
        var entity = await db.Contacts.FirstOrDefaultAsync(x => x.Id == id, ct);
        if (entity is null)
            return NotFound();
        db.Contacts.Remove(entity);
        await db.SaveChangesAsync(ct);
        return NoContent();
    }

    private static ContactResponse ToResponse(Contact c) =>
        new(c.Id, c.CompanyId, c.FirstName, c.LastName, c.Email, c.Phone, c.RoleTitle, c.KnowsFrom, c.CapabilityNote,
            c.Notes, c.CreatedAt, c.UpdatedAt);
}
