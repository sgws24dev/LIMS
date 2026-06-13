namespace ResearchLms.Infrastructure.Auth;

public class JwtSettings
{
    public const string SectionName = "Jwt";
    public string Secret { get; set; } = "ThisIsADevelopmentSecretKeyThatIsAtLeast32Characters!";
    public string Issuer { get; set; } = "ResearchLms";
    public string Audience { get; set; } = "ResearchLms.Api";
    public int ExpirationInMinutes { get; set; } = 60;
    public int RefreshTokenExpiryInDays { get; set; } = 7;
}
