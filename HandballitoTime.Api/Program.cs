using HandballitoTime.Api.Configuration;
using HandballitoTime.Api.Endpoints;
using HandballitoTime.Application.Dtos.Locations;
using HandballitoTime.Application.Dtos.Matches;
using HandballitoTime.Application.Dtos.Players;
using HandballitoTime.Application.Dtos.Stats;
using HandballitoTime.Application.Services;
using HandballitoTime.Application.Services.Interfaces;
using HandballitoTime.Infrastructure;
using Microsoft.AspNetCore.Routing.Constraints;
using Microsoft.EntityFrameworkCore;
using System.Text.Json.Serialization;
using Telegram.Bot;

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
builder.Services.AddScoped<IStatsService, StatsService>();

// Telegram bot
builder.Services.Configure<TelegramOptions>(builder.Configuration.GetSection("Telegram"));
var telegramToken = builder.Configuration.GetSection("Telegram")["BotToken"];
if (!string.IsNullOrEmpty(telegramToken))
{
    builder.Services.AddSingleton<ITelegramBotClient>(new TelegramBotClient(telegramToken));
}

// Add CORS policy
builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowFrontend", policy =>
    {
        policy.WithOrigins("http://localhost:3000", "https://handballito-app.vercel.app")
              .AllowAnyHeader()
              .AllowAnyMethod();
    });
});

builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();
builder.Services.AddControllers();

var app = builder.Build();

// Use CORS policy
app.UseCors("AllowFrontend");

app.UseSwagger();
app.UseSwaggerUI();

app.MapControllers();
app.MapMatchesEndpoints();
app.MapPlayersEndpoints();
app.MapLocationsEndpoints();
app.MapTelegramEndpoints();
app.MapStatsEndpoints();

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

// Register Telegram webhook on startup
var tgWebhookUrl = app.Configuration.GetSection("Telegram")["WebhookUrl"];
if (!string.IsNullOrEmpty(telegramToken) && !string.IsNullOrEmpty(tgWebhookUrl))
{
    var bot = app.Services.GetRequiredService<ITelegramBotClient>();
    var secretToken = app.Configuration.GetSection("Telegram")["SecretToken"];

    var webhookUrl = $"{tgWebhookUrl.TrimEnd('/')}/api/telegram/webhook";
    await bot.SetWebhook(
        url: webhookUrl,
        secretToken: secretToken);
}

await app.RunAsync();


[JsonSerializable(typeof(CreateMatchDto))]
[JsonSerializable(typeof(UpdateMatchDto))]
[JsonSerializable(typeof(MatchDto))]
[JsonSerializable(typeof(CreateMatchFromTextDto))]
[JsonSerializable(typeof(CreateMatchFromImageResultDto))]
[JsonSerializable(typeof(ExtractedMatchData))]
[JsonSerializable(typeof(CreatePlayerDto))]
[JsonSerializable(typeof(PlayerDto))]
[JsonSerializable(typeof(PlayerStatsDto))]
[JsonSerializable(typeof(PlayerMatchDto))]
[JsonSerializable(typeof(TeammateDto))]
[JsonSerializable(typeof(LeaderboardDto))]
[JsonSerializable(typeof(PlayerRankingDto))]
[JsonSerializable(typeof(PlayerStreakDto))]
[JsonSerializable(typeof(MatchStatsDto))]
[JsonSerializable(typeof(PairStatsDto))]
[JsonSerializable(typeof(MonthlyGamesDto))]
[JsonSerializable(typeof(LocationStatsDto))]
[JsonSerializable(typeof(CreateLocationDto))]
[JsonSerializable(typeof(UpdateLocationDto))]
[JsonSerializable(typeof(LocationDto))]
internal partial class AppJsonSerializerContext : JsonSerializerContext
{
}
