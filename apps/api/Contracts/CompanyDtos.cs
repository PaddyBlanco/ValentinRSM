using ValentinRSM.Api.Enums;

namespace ValentinRSM.Api.Contracts;

public record CompanyResponse(
    Guid Id,
    string Name,
    string Type,
    CompanyStatus Status,
    string? AccentColor,
    string? Notes,
    DateTimeOffset CreatedAt,
    DateTimeOffset UpdatedAt);

public record CreateCompanyRequest(
    string Name,
    string Type,
    CompanyStatus Status,
    string? AccentColor,
    string? Notes);

public record UpdateCompanyRequest(
    string Name,
    string Type,
    CompanyStatus Status,
    string? AccentColor,
    string? Notes);

/// <summary>Firmen mit Status Aktiv/Im Blick, sortiert nach letzter Timeline-Aktivität.</summary>
public record CompanyRecentActivityResponse(
    Guid Id,
    string Name,
    string Type,
    CompanyStatus Status,
    string? AccentColor,
    DateTimeOffset LastTimelineAt);
