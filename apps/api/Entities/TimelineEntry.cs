using ValentinRSM.Api.Enums;

namespace ValentinRSM.Api.Entities;

/// <summary>
/// Chronologisches Ereignis; gehört immer einer <see cref="Company"/>.
/// Optional einem <see cref="Contact"/> derselben Firma zugeordnet.
/// </summary>
public class TimelineEntry
{
    public Guid Id { get; set; }
    public Guid CompanyId { get; set; }
    public Company Company { get; set; } = null!;

    public Guid? ContactId { get; set; }
    public Contact? Contact { get; set; }

    public TimelineEntryType Type { get; set; }
    public TimelineSource Source { get; set; }
    public string Title { get; set; } = string.Empty;
    public string Content { get; set; } = string.Empty;
    public DateTimeOffset OccurredAt { get; set; }
    public DateTimeOffset CreatedAt { get; set; }
    public DateTimeOffset UpdatedAt { get; set; }
}
