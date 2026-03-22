namespace ValentinRSM.Api.Contracts;

public record ContactResponse(
    Guid Id,
    Guid CompanyId,
    string FirstName,
    string LastName,
    string? Email,
    string? Phone,
    string? RoleTitle,
    string? KnowsFrom,
    string? CapabilityNote,
    string? Notes,
    DateTimeOffset CreatedAt,
    DateTimeOffset UpdatedAt);

public record CreateContactRequest(
    Guid CompanyId,
    string FirstName,
    string LastName,
    string? Email,
    string? Phone,
    string? RoleTitle,
    string? KnowsFrom,
    string? CapabilityNote,
    string? Notes);

public record UpdateContactRequest(
    string FirstName,
    string LastName,
    string? Email,
    string? Phone,
    string? RoleTitle,
    string? KnowsFrom,
    string? CapabilityNote,
    string? Notes);
