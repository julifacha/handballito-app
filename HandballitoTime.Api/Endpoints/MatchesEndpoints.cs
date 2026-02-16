using HandballitoTime.Application.Dtos.Matches;
using HandballitoTime.Application.Services.Interfaces;

namespace HandballitoTime.Api.Endpoints;

public static class MatchesEndpoints
{
    public static RouteGroupBuilder MapMatchesEndpoints(this IEndpointRouteBuilder routes)
    {
        var group = routes.MapGroup("/api/matches");

        group.MapPost("/", async (IMatchService service, CreateMatchDto dto) =>
        {
            var match = await service.AddMatchAsync(dto);
            return Results.Created($"/api/matches/{match.Id}", match);
        });

        group.MapPut("/{id:guid}", async (IMatchService service, Guid id, UpdateMatchDto dto) =>
        {
            var match = await service.UpdateMatchAsync(id, dto);
            return match is null ? Results.NotFound() : Results.Ok(match);
        });

        group.MapGet("/{id:guid}", async (IMatchService service, Guid id) =>
        {
            var match = await service.GetMatchAsync(id);
            return match is null ? Results.NotFound() : Results.Ok(match);
        });

        group.MapGet("/", async (IMatchService service) =>
        {
            var matches = await service.ListMatchesAsync();
            return Results.Ok(matches);
        });

        group.MapPost("/from-text", async (IMatchService service, CreateMatchFromTextDto dto) =>
        {
            if (string.IsNullOrWhiteSpace(dto.Text))
                return Results.BadRequest("Text is required.");

            try
            {
                var result = await service.CreateMatchFromTextAsync(dto.Text);
                return Results.Created($"/api/matches/{result.Match.Id}", result);
            }
            catch (KeyNotFoundException ex)
            {
                return Results.BadRequest(ex.Message);
            }
            catch (ArgumentException ex)
            {
                return Results.BadRequest(ex.Message);
            }
        });

        return group;
    }
}