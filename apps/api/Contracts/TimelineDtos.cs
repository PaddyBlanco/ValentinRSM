using ValentinRSM.Api.Enums;

namespace ValentinRSM.Api.Contracts;

public record TimelineEntryResponse(
    Guid Id,
    Guid CompanyId,
    Guid? ContactId,
    string? ContactName,
    TimelineEntryType Type,
    TimelineSource Source,
    string Title,
    string Content,
    DateTimeOffset OccurredAt,
    DateTimeOffset CreatedAt,
    DateTimeOffset UpdatedAt);

public record CreateTimelineEntryRequest(
    Guid CompanyId,
    Guid? ContactId,
    TimelineEntryType Type,
    TimelineSource Source,
    string Title,
    string Content,
    DateTimeOffset OccurredAt);

public record UpdateTimelineEntryRequest(
    TimelineEntryType Type,
    TimelineSource Source,
    string Title,
    string Content,
    DateTimeOffset OccurredAt);
