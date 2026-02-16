using System.Text.Json;
using HandballitoTime.Api.Configuration;
using HandballitoTime.Application.Dtos.Matches;
using HandballitoTime.Application.Services.Interfaces;
using Microsoft.Extensions.Options;
using Telegram.Bot;
using Telegram.Bot.Types;

namespace HandballitoTime.Api.Endpoints;

public static class TelegramEndpoints
{
    public static RouteGroupBuilder MapTelegramEndpoints(this IEndpointRouteBuilder routes)
    {
        var group = routes.MapGroup("/api/telegram");

        group.MapPost("/webhook", async (
            HttpContext ctx,
            IMatchService matchService,
            IOptions<TelegramOptions> telegramOptions,
            ITelegramBotClient botClient) =>
        {
            var options = telegramOptions.Value;

            var headerSecret = ctx.Request.Headers["X-Telegram-Bot-Api-Secret-Token"].FirstOrDefault();
            if (!string.IsNullOrEmpty(options.SecretToken) && headerSecret != options.SecretToken)
                return Results.Unauthorized();

            Update? update;
            try
            {
                using var reader = new StreamReader(ctx.Request.Body);
                var body = await reader.ReadToEndAsync();
                update = JsonSerializer.Deserialize<Update>(body, JsonBotAPI.Options);
            }
            catch
            {
                return Results.Ok();
            }

            if (update?.Message?.Text is not { } text)
                return Results.Ok();

            var chatId = update.Message.Chat.Id;

            try
            {
                var result = await matchService.CreateMatchFromTextAsync(text);
                var reply = FormatMatchReply(result);
                await botClient.SendMessage(chatId, reply);
            }
            catch (Exception ex) when (ex is KeyNotFoundException or ArgumentException)
            {
                await botClient.SendMessage(chatId, $"Error: {ex.Message}");
            }
            catch (Exception ex)
            {
                await botClient.SendMessage(chatId, $"Unexpected error: {ex.Message}");
            }

            return Results.Ok();
        });

        return group;
    }

    private static string FormatMatchReply(CreateMatchFromImageResultDto result)
    {
        var match = result.Match;
        var data = result.ExtractedData;

        var lines = new List<string> { "Match created!" };
        lines.Add("");
        lines.Add($"Date: {match.Date:dd/MM/yyyy}");
        lines.Add($"Location: {match.LocationName}");

        if (data.WinnerTeamName != null)
            lines.Add($"Winner: {data.WinnerTeamName}");

        lines.Add("");
        lines.Add($"Blanco: {string.Join(", ", data.WhiteTeamPlayerNames)}");
        lines.Add($"Negro: {string.Join(", ", data.BlackTeamPlayerNames)}");

        if (result.CreatedPlayers.Count > 0)
        {
            lines.Add("");
            lines.Add($"New players created: {string.Join(", ", result.CreatedPlayers)}");
        }

        return string.Join("\n", lines);
    }
}
