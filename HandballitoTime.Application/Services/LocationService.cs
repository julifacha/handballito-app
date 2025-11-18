using HandballitoTime.Application.Dtos.Locations;
using HandballitoTime.Application.Extensions.Mapping;
using HandballitoTime.Application.Services.Interfaces;
using HandballitoTime.Domain.Entities;
using HandballitoTime.Infrastructure;
using Microsoft.EntityFrameworkCore;

namespace HandballitoTime.Application.Services
{
    public class LocationService : ILocationService
    {
        private readonly HandballitoDbContext _db;

        public LocationService(HandballitoDbContext db)
        {
            _db = db;
        }

        public async Task<LocationDto> AddLocationAsync(CreateLocationDto dto)
        {
            var location = new Location
            {
                Id = Guid.NewGuid(),
                Name = dto.Name,
                Address = dto.Address
            };
            _db.Locations.Add(location);
            await _db.SaveChangesAsync();
            return location.ToDto();
        }

        public async Task<LocationDto> UpdateLocationAsync(Guid id, UpdateLocationDto dto)
        {
            var location = await _db.Locations.FindAsync(id);
            if (location == null)
                throw new KeyNotFoundException("Location not found");

            location.Name = dto.Name;
            location.Address = dto.Address;
            await _db.SaveChangesAsync();
            return location.ToDto();
        }

        public async Task<LocationDto?> GetLocationAsync(Guid id)
        {
            var location = await _db.Locations.FindAsync(id);
            return location == null ? null : location.ToDto();
        }

        public async Task<List<LocationDto>> ListLocationsAsync()
        {
            return await _db.Locations
                .Select(l => l.ToDto())
                .ToListAsync();
        }
    }
}
