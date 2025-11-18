using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace HandballitoTime.Application.Dtos.Locations
{
    public abstract class LocationDtoBase
    {
        public string Name { get; set; } = default!;
        public string? Address { get; set; }
    }
}
