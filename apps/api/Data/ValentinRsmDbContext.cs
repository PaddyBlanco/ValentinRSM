using Microsoft.EntityFrameworkCore;
using ValentinRSM.Api.Entities;

namespace ValentinRSM.Api.Data;

public class ValentinRsmDbContext(DbContextOptions<ValentinRsmDbContext> options) : DbContext(options)
{
    public DbSet<Company> Companies => Set<Company>();
    public DbSet<Contact> Contacts => Set<Contact>();
    public DbSet<TimelineEntry> TimelineEntries => Set<TimelineEntry>();

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        modelBuilder.Entity<Company>(e =>
        {
            e.ToTable("Companies");
            e.HasKey(x => x.Id);
            e.Property(x => x.Name).HasMaxLength(500).IsRequired();
            e.Property(x => x.Type).HasMaxLength(200).IsRequired();
            e.Property(x => x.AccentColor).HasMaxLength(32);
            e.Property(x => x.Notes).HasMaxLength(8000);
            e.HasIndex(x => x.Name);
            e.HasIndex(x => x.Type);
            e.HasIndex(x => x.Status); // Filter z. B. „aktive Firmen“ in der UI
            e.HasMany(x => x.Contacts)
                .WithOne(x => x.Company)
                .HasForeignKey(x => x.CompanyId)
                .OnDelete(DeleteBehavior.Cascade);
        });

        modelBuilder.Entity<Contact>(e =>
        {
            e.ToTable("Contacts");
            e.HasKey(x => x.Id);
            e.Property(x => x.FirstName).HasMaxLength(200).IsRequired();
            e.Property(x => x.LastName).HasMaxLength(200).IsRequired();
            e.Property(x => x.Email).HasMaxLength(320);
            e.Property(x => x.Phone).HasMaxLength(50);
            e.Property(x => x.RoleTitle).HasMaxLength(200);
            e.Property(x => x.KnowsFrom).HasMaxLength(500);
            e.Property(x => x.CapabilityNote).HasMaxLength(2000);
            e.Property(x => x.Notes).HasMaxLength(8000);
            e.HasIndex(x => new { x.CompanyId, x.CreatedAt }); // Firma + „zuletzt angelegt“ (sort=recent)
            e.HasIndex(x => x.Email).HasFilter("[Email] IS NOT NULL"); // Lookup / später Suche
            e.HasIndex(x => new { x.LastName, x.FirstName });
            e.HasMany(x => x.TimelineEntries)
                .WithOne(x => x.Contact)
                .HasForeignKey(x => x.ContactId)
                .OnDelete(DeleteBehavior.Cascade);
        });

        modelBuilder.Entity<TimelineEntry>(e =>
        {
            e.ToTable("TimelineEntries");
            e.HasKey(x => x.Id);
            e.Property(x => x.Title).HasMaxLength(500).IsRequired();
            e.Property(x => x.Content).IsRequired();
            e.HasIndex(x => new { x.ContactId, x.OccurredAt }); // Timeline pro Kontakt chronologisch
            e.HasIndex(x => x.OccurredAt); // Globale „letzte Ereignisse“
        });
    }
}
