using HandballitoTime.Application.Dtos.Locations;

namespace HandballitoTime.Application.Extensions.Mapping
{
    public static class LocationExtensions
    {
        public static LocationDto ToDto(this Domain.Entities.Location location)
        {
            return new LocationDto
            {
                Id = location.Id,
                Name = location.Name,
                Address = location.Address
            };
        }
    }
}
