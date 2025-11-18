using HandballitoTime.Application.Dtos.Players;
using HandballitoTime.Application.Services.Interfaces;

namespace HandballitoTime.Api.Endpoints;

public static class PlayersEndpoints
{
    public static RouteGroupBuilder MapPlayersEndpoints(this IEndpointRouteBuilder routes)
    {
        var group = routes.MapGroup("/api/players");

        group.MapPost("/", async (IPlayerService service, CreatePlayerDto dto) =>
        {
            var player = await service.AddPlayerAsync(dto);
            return Results.Created($"/api/players/{player.Id}", player);
        });

        group.MapGet("/{id:guid}", async (IPlayerService service, Guid id) =>
        {
            var player = await service.GetPlayerAsync(id);
            return player is null ? Results.NotFound() : Results.Ok(player);
        });

        group.MapGet("/", async (IPlayerService service) =>
        {
            var players = await service.ListPlayersAsync();
            return Results.Ok(players);
        });

        return group;
    }
}