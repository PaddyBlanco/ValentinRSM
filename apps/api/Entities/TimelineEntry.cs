using ValentinRSM.Api.Enums;

namespace ValentinRSM.Api.Entities;

/// <summary>
/// Chronologisches Ereignis; gehört immer einem Kontakt (Firma über <see cref="Contact.CompanyId"/>).
/// </summary>
public class TimelineEntry
{
    public Guid Id { get; set; }
    public Guid ContactId { get; set; }
    public Contact Contact { get; set; } = null!;

    public TimelineEntryType Type { get; set; }
    public TimelineSource Source { get; set; }
    public string Title { get; set; } = string.Empty;
    public string Content { get; set; } = string.Empty;
    public DateTimeOffset OccurredAt { get; set; }
    public DateTimeOffset CreatedAt { get; set; }
    public DateTimeOffset UpdatedAt { get; set; }
}
