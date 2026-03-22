using ValentinRSM.Api.Enums;

namespace ValentinRSM.Api.Contracts;

public record SearchResponse(
    string Query,
    IReadOnlyList<SearchCompanyHit> Companies,
    IReadOnlyList<SearchContactHit> Contacts,
    IReadOnlyList<SearchTimelineHit> TimelineEntries);

public record SearchCompanyHit(
    Guid Id,
    string Name,
    string Type,
    CompanyStatus Status,
    string? AccentColor);

public record SearchContactHit(
    Guid Id,
    Guid CompanyId,
    string CompanyName,
    string FirstName,
    string LastName,
    string? Email);

public record SearchTimelineHit(
    Guid Id,
    Guid CompanyId,
    string CompanyName,
    Guid? ContactId,
    string? ContactName,
    string Title,
    string ContentPreview,
    DateTimeOffset OccurredAt,
    TimelineEntryType Type,
    TimelineSource Source);
