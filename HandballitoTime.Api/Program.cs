using HandballitoTime.Api.Endpoints;
using HandballitoTime.Application.Dtos.Locations;
using HandballitoTime.Application.Dtos.Matches;
using HandballitoTime.Application.Dtos.Players;
using HandballitoTime.Application.Services;
using HandballitoTime.Application.Services.Interfaces;
using HandballitoTime.Infrastructure;
using Microsoft.AspNetCore.Routing.Constraints;
using Microsoft.EntityFrameworkCore;
using Microsoft.OpenApi;
using System.Text.Json.Serialization;

var builder = WebApplication.CreateSlimBuilder(args);

builder.Services.ConfigureHttpJsonOptions(options =>
{
    options.SerializerOptions.TypeInfoResolverChain.Insert(0, AppJsonSerializerContext.Default);
});

builder.Services.AddDbContext<HandballitoDbContext>(options =>
    options.UseNpgsql(builder.Configuration.GetConnectionString("DefaultConnection")));

builder.Services.Configure<RouteOptions>(options => options.SetParameterPolicy<RegexInlineRouteConstraint>("regex"));

builder.Services.AddScoped<IMatchService, MatchService>();
builder.Services.AddScoped<IPlayerService, PlayerService>();
builder.Services.AddScoped<ILocationService, LocationService>();

// Add CORS policy
builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowLocal3000", policy =>
    {
        policy.WithOrigins("http://localhost:3000")
              .AllowAnyHeader()
              .AllowAnyMethod();
    });
});

builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();
builder.Services.AddControllers();

var app = builder.Build();

// Use CORS policy
app.UseCors("AllowLocal3000");

app.UseSwagger();
app.UseSwaggerUI();

app.MapControllers();
app.MapMatchesEndpoints();
app.MapPlayersEndpoints();
app.MapLocationsEndpoints();

if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI(c =>
    {
        c.SwaggerEndpoint("/swagger/v1/swagger.json", "My Minimal API v1");
    });
}

if (!app.Environment.IsDevelopment())
{
    //Apply migrations at startup
    using (var scope = app.Services.CreateScope())
    {
        var db = scope.ServiceProvider.GetRequiredService<HandballitoDbContext>();
        db.Database.Migrate();
    }
}

app.Run();


[JsonSerializable(typeof(CreateMatchDto))]
[JsonSerializable(typeof(UpdateMatchDto))]
[JsonSerializable(typeof(MatchDto))] // or whatever your output DTO is
[JsonSerializable(typeof(CreatePlayerDto))]
[JsonSerializable(typeof(PlayerDto))]
[JsonSerializable(typeof(CreateLocationDto))]
[JsonSerializable(typeof(UpdateLocationDto))]
[JsonSerializable(typeof(LocationDto))]
internal partial class AppJsonSerializerContext : JsonSerializerContext
{
}
