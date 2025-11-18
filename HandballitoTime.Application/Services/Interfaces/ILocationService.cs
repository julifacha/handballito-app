using HandballitoTime.Application.Dtos.Locations;

namespace HandballitoTime.Application.Services.Interfaces
{
    public interface ILocationService
    {
        Task<LocationDto> AddLocationAsync(CreateLocationDto dto);
        Task<LocationDto> UpdateLocationAsync(Guid id, UpdateLocationDto dto);
        Task<LocationDto?> GetLocationAsync(Guid id);
        Task<List<LocationDto>> ListLocationsAsync();
    }
}
