using Microsoft.EntityFrameworkCore;
using ResearchLms.Content.Api.Middlewares;
using ResearchLms.Content.Application;
using ResearchLms.Content.Infrastructure;
using ResearchLms.Content.Infrastructure.Data;
using Microsoft.AspNetCore.Authentication.JwtBearer;

var builder = WebApplication.CreateBuilder(args);

builder.Services.AddControllers();
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();

builder.Services.AddAuthentication(JwtBearerDefaults.AuthenticationScheme)
    .AddJwtBearer(options =>
    {
        options.Authority = builder.Configuration["Jwt:Authority"];
        options.Audience = builder.Configuration["Jwt:Audience"];
    });

builder.Services.AddAuthorization();

builder.Services.AddContentApplication();
builder.Services.AddContentInfrastructure(builder.Configuration);

var app = builder.Build();

using (var scope = app.Services.CreateScope())
{
    var context = scope.ServiceProvider.GetRequiredService<ContentDbContext>();
    var env = Environment.GetEnvironmentVariable("ASPNETCORE_ENVIRONMENT") ?? "Production";
    if (env != "Testing" && context.Database.IsRelational())
        await context.Database.MigrateAsync();
    else
        await context.Database.EnsureCreatedAsync();
}

if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

app.UseAuthentication();
app.UseAuthorization();

app.UseMiddleware<ExceptionHandlingMiddleware>();
app.MapControllers();

app.Run();

public partial class ContentProgram { }
