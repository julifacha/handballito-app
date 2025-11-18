using HandballitoTime.Application.Dtos.Locations;
using HandballitoTime.Application.Services.Interfaces;

namespace HandballitoTime.Api.Endpoints;

public static class LocationsEndpoints
{
    public static RouteGroupBuilder MapLocationsEndpoints(this IEndpointRouteBuilder routes)
    {
        var group = routes.MapGroup("/api/locations");

        group.MapPost("/", async (ILocationService service, CreateLocationDto dto) =>
        {
            var location = await service.AddLocationAsync(dto);
            return Results.Created($"/api/locations/{location.Id}", location);
        });

        group.MapPut("/{id:guid}", async (ILocationService service, Guid id, UpdateLocationDto dto) =>
        {
            try
            {
                var location = await service.UpdateLocationAsync(id, dto);
                return Results.Ok(location);
            }
            catch (KeyNotFoundException)
            {
                return Results.NotFound();
            }
        });

        group.MapGet("/{id:guid}", async (ILocationService service, Guid id) =>
        {
            var location = await service.GetLocationAsync(id);
            return location is null ? Results.NotFound() : Results.Ok(location);
        });

        group.MapGet("/", async (ILocationService service) =>
        {
            var locations = await service.ListLocationsAsync();
            return Results.Ok(locations);
        });

        return group;
    }
}