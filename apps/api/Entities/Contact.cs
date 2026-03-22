namespace ValentinRSM.Api.Entities;

public class Contact
{
    public Guid Id { get; set; }
    public Guid CompanyId { get; set; }
    public Company Company { get; set; } = null!;

    public string FirstName { get; set; } = string.Empty;
    public string LastName { get; set; } = string.Empty;
    public string? Email { get; set; }
    public string? Phone { get; set; }
    public string? RoleTitle { get; set; }
    public string? KnowsFrom { get; set; }
    public string? CapabilityNote { get; set; }
    public string? Notes { get; set; }
    public DateTimeOffset CreatedAt { get; set; }
    public DateTimeOffset UpdatedAt { get; set; }

    public ICollection<TimelineEntry> TimelineEntries { get; set; } = new List<TimelineEntry>();
}
