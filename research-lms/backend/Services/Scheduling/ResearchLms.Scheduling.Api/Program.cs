using Hangfire;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using ResearchLms.Scheduling.Api.Middleware;
using ResearchLms.Scheduling.Application;
using ResearchLms.Scheduling.Infrastructure;
using ResearchLms.Scheduling.Infrastructure.Persistence;
using Serilog;
using System.Text;

var builder = WebApplication.CreateBuilder(args);

builder.Host.UseSerilog((ctx, lc) =>
    lc.ReadFrom.Configuration(ctx.Configuration));

var jwtKey = builder.Configuration["Jwt:Key"]
    ?? throw new InvalidOperationException("JWT Key is not configured.");

builder.Services.AddAuthentication(JwtBearerDefaults.AuthenticationScheme)
    .AddJwtBearer(options =>
    {
        options.TokenValidationParameters = new TokenValidationParameters
        {
            ValidateIssuer = true,
            ValidateAudience = true,
            ValidateLifetime = true,
            ValidateIssuerSigningKey = true,
            ValidIssuer = builder.Configuration["Jwt:Issuer"],
            ValidAudience = builder.Configuration["Jwt:Audience"],
            IssuerSigningKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(jwtKey))
        };
    });

builder.Services.AddAuthorization(options =>
{
    options.AddPolicy("SchedulingAdmin", policy =>
        policy.RequireRole("System Administrator", "Institution Administrator", "Scheduling Manager"));
});

builder.Services.AddControllers()
    .AddJsonOptions(options =>
    {
        options.JsonSerializerOptions.Converters.Add(
            new System.Text.Json.Serialization.JsonStringEnumConverter());
        options.JsonSerializerOptions.PropertyNamingPolicy =
            System.Text.Json.JsonNamingPolicy.CamelCase;
    });

builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();

builder.Services.AddSchedulingApplication();
builder.Services.AddSchedulingInfrastructure(builder.Configuration);

var app = builder.Build();

using (var scope = app.Services.CreateScope())
{
    var context = scope.ServiceProvider.GetRequiredService<SchedulingDbContext>();
    var env = Environment.GetEnvironmentVariable("ASPNETCORE_ENVIRONMENT") ?? "Production";
    if (env != "Testing" && context.Database.IsRelational())
        await context.Database.MigrateAsync();
    else
        await context.Database.EnsureCreatedAsync();
}

app.UseMiddleware<ExceptionHandlingMiddleware>();

var recurringJobs = app.Services.GetRequiredService<IRecurringJobManager>();
recurringJobs.ConfigureRecurringJobs();

app.UseSwagger();
app.UseSwaggerUI();

app.UseAuthentication();
app.UseAuthorization();

app.MapControllers();

app.Run();
