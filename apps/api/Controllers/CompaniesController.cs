using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using ValentinRSM.Api.Contracts;
using ValentinRSM.Api.Data;
using ValentinRSM.Api.Entities;

namespace ValentinRSM.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
public class CompaniesController(ValentinRsmDbContext db) : ControllerBase
{
    [HttpGet]
    public async Task<ActionResult<IReadOnlyList<CompanyResponse>>> List(CancellationToken ct)
    {
        var list = await db.Companies.AsNoTracking()
            .OrderBy(c => c.Name)
            .Select(c => ToResponse(c))
            .ToListAsync(ct);
        return Ok(list);
    }

    [HttpGet("{id:guid}")]
    public async Task<ActionResult<CompanyResponse>> Get(Guid id, CancellationToken ct)
    {
        var c = await db.Companies.AsNoTracking().FirstOrDefaultAsync(x => x.Id == id, ct);
        return c is null ? NotFound() : Ok(ToResponse(c));
    }

    [HttpPost]
    public async Task<ActionResult<CompanyResponse>> Create([FromBody] CreateCompanyRequest body, CancellationToken ct)
    {
        var now = DateTimeOffset.UtcNow;
        var entity = new Company
        {
            Id = Guid.NewGuid(),
            Name = body.Name.Trim(),
            Type = body.Type.Trim(),
            Status = body.Status,
            AccentColor = string.IsNullOrWhiteSpace(body.AccentColor) ? null : body.AccentColor.Trim(),
            Notes = string.IsNullOrWhiteSpace(body.Notes) ? null : body.Notes.Trim(),
            CreatedAt = now,
            UpdatedAt = now
        };
        db.Companies.Add(entity);
        await db.SaveChangesAsync(ct);
        return CreatedAtAction(nameof(Get), new { id = entity.Id }, ToResponse(entity));
    }

    [HttpPut("{id:guid}")]
    public async Task<ActionResult<CompanyResponse>> Update(Guid id, [FromBody] UpdateCompanyRequest body, CancellationToken ct)
    {
        var entity = await db.Companies.FirstOrDefaultAsync(x => x.Id == id, ct);
        if (entity is null)
            return NotFound();

        entity.Name = body.Name.Trim();
        entity.Type = body.Type.Trim();
        entity.Status = body.Status;
        entity.AccentColor = string.IsNullOrWhiteSpace(body.AccentColor) ? null : body.AccentColor.Trim();
        entity.Notes = string.IsNullOrWhiteSpace(body.Notes) ? null : body.Notes.Trim();
        entity.UpdatedAt = DateTimeOffset.UtcNow;
        await db.SaveChangesAsync(ct);
        return Ok(ToResponse(entity));
    }

    [HttpDelete("{id:guid}")]
    public async Task<IActionResult> Delete(Guid id, CancellationToken ct)
    {
        var entity = await db.Companies.FirstOrDefaultAsync(x => x.Id == id, ct);
        if (entity is null)
            return NotFound();
        db.Companies.Remove(entity);
        await db.SaveChangesAsync(ct);
        return NoContent();
    }

    private static CompanyResponse ToResponse(Company c) =>
        new(c.Id, c.Name, c.Type, c.Status, c.AccentColor, c.Notes, c.CreatedAt, c.UpdatedAt);
}
