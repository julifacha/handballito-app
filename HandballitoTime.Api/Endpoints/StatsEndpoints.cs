using HandballitoTime.Application.Services.Interfaces;

namespace HandballitoTime.Api.Endpoints;

public static class StatsEndpoints
{
    public static RouteGroupBuilder MapStatsEndpoints(this IEndpointRouteBuilder routes)
    {
        var group = routes.MapGroup("/api/stats");

        group.MapGet("/leaderboard", async (IStatsService service) =>
        {
            var leaderboard = await service.GetLeaderboardAsync();
            return Results.Ok(leaderboard);
        });

        group.MapGet("/matches", async (IStatsService service) =>
        {
            var stats = await service.GetMatchStatsAsync();
            return Results.Ok(stats);
        });

        return group;
    }
}
