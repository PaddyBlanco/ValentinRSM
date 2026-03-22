using ValentinRSM.Api.Enums;

namespace ValentinRSM.Api.Entities;

public class Company
{
    public Guid Id { get; set; }
    public string Name { get; set; } = string.Empty;
    /// <summary>Freitext, z. B. Kunde, Partner, Bank, Investor.</summary>
    public string Type { get; set; } = string.Empty;
    public CompanyStatus Status { get; set; } = CompanyStatus.Active;
    /// <summary>Optional, z. B. #RRGGBB.</summary>
    public string? AccentColor { get; set; }
    public string? Notes { get; set; }
    public DateTimeOffset CreatedAt { get; set; }
    public DateTimeOffset UpdatedAt { get; set; }

    public ICollection<Contact> Contacts { get; set; } = new List<Contact>();
    public ICollection<TimelineEntry> TimelineEntries { get; set; } = new List<TimelineEntry>();
}
