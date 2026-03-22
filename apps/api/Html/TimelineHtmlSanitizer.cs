using System.Net;
using System.Text.RegularExpressions;
using AngleSharp.Html.Parser;

namespace ValentinRSM.Api.Html;

/// <summary>
/// Timeline-Inhalt als HTML-Fragment: Whitelist wie im Web (DOMPurify), Defense in Depth beim Speichern.
/// </summary>
public static class TimelineHtmlSanitizer
{
    private static readonly Ganss.Xss.HtmlSanitizer Sanitizer = Create();

    private static Ganss.Xss.HtmlSanitizer Create()
    {
        var s = new Ganss.Xss.HtmlSanitizer();
        s.AllowedTags.Clear();
        foreach (var t in new[]
                 {
                     "p", "br", "strong", "b", "em", "i", "u", "s", "del", "strike",
                     "h1", "h2", "h3", "h4", "ul", "ol", "li", "blockquote",
                     "a", "hr", "code", "pre", "span", "div",
                 })
            s.AllowedTags.Add(t);

        s.AllowedAttributes.Clear();
        foreach (var a in new[] { "class", "href", "target", "rel" })
            s.AllowedAttributes.Add(a);

        s.AllowedSchemes.Clear();
        foreach (var sch in new[] { "http", "https", "mailto" })
            s.AllowedSchemes.Add(sch);

        return s;
    }

    public static string Sanitize(string? html)
    {
        if (string.IsNullOrWhiteSpace(html))
            return "";
        return Sanitizer.Sanitize(html);
    }

    /// <summary>
    /// Nur Text (für Vorschau/Suche); nach Sanitize, damit keine Tags durchrutschen.
    /// </summary>
    public static string ToPlainText(string? html)
    {
        var safe = Sanitize(html);
        if (string.IsNullOrWhiteSpace(safe))
            return "";
        var parser = new HtmlParser();
        var doc = parser.ParseDocument(safe);
        var text = doc.Body?.TextContent ?? "";
        return Regex.Replace(text, @"\s+", " ").Trim();
    }
}
