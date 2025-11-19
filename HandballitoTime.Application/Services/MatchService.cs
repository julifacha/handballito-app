using HandballitoTime.Application.Dtos.Matches;
using HandballitoTime.Application.Extensions.Mapping;
using HandballitoTime.Application.Services.Interfaces;
using HandballitoTime.Domain.Entities;
using HandballitoTime.Infrastructure;
using Microsoft.EntityFrameworkCore;

namespace HandballitoTime.Application.Services
{
    public class MatchService : IMatchService
    {
        private readonly HandballitoDbContext _db;

        public MatchService(HandballitoDbContext db)
        {
            _db = db;
        }

        public async Task<MatchDto> AddMatchAsync(CreateMatchDto dto)
        {
            // validate location exists
            var location = await _db.Locations.FindAsync(dto.LocationId);
            if (location == null)
            {
                throw new Exception("Invalid location ID.");
            }

            // validate player ids exist
            var players = await _db.Players
                .Where(p => dto.WhiteTeamPlayerIds.Contains(p.Id) || dto.BlackTeamPlayerIds.Contains(p.Id))
                .ToListAsync();

            if (players.Count != dto.WhiteTeamPlayerIds.Count + dto.BlackTeamPlayerIds.Count)
            {
                throw new Exception("One or more player IDs are invalid.");
            }

            var whiteTeam = new Team
            {
                Id = Guid.NewGuid(),
                Players = players.Where(p => dto.WhiteTeamPlayerIds.Contains(p.Id)).ToList()
            };

            var blackTeam = new Team
            {
                Id = Guid.NewGuid(),
                Players = players.Where(p => dto.BlackTeamPlayerIds.Contains(p.Id)).ToList()
            };

            // Create match
            var match = new Match
            {
                Id = Guid.NewGuid(),
                Date = dto.Date,
                LocationId = dto.LocationId,
                WhiteTeamId = whiteTeam.Id,
                BlackTeamId = blackTeam.Id,
                WhiteTeam = whiteTeam,
                BlackTeam = blackTeam
            };

            _db.Matches.Add(match);
            await _db.SaveChangesAsync();
            return match.ToDto();
        }

        public async Task<MatchDto?> UpdateMatchAsync(Guid matchId, UpdateMatchDto dto)
        {
            // validate location exists
            var location = await _db.Locations.FindAsync(dto.LocationId);
            if (location == null)
            {
                throw new Exception("Invalid location ID.");
            }

            // validate player ids exist
            var players = await _db.Players
                .Where(p => dto.WhiteTeamPlayerIds.Contains(p.Id) || dto.BlackTeamPlayerIds.Contains(p.Id))
                .ToListAsync();

            if (players.Count != dto.WhiteTeamPlayerIds.Count + dto.BlackTeamPlayerIds.Count)
            {
                throw new Exception("One or more player IDs are invalid.");
            }

            var match = await _db.Matches
                .Include(m => m.WhiteTeam).ThenInclude(t => t.Players)
                .Include(m => m.BlackTeam).ThenInclude(t => t.Players)
                .FirstOrDefaultAsync(m => m.Id == matchId);

            if (match == null) return null;

            match.Date = dto.Date;
            if (dto.LocationId.HasValue)
                match.LocationId = dto.LocationId.Value;
            if (dto.WinnerTeamId.HasValue)
                match.WinnerTeamId = dto.WinnerTeamId;
            
            match.WhiteTeam.Players = players.Where(p => dto.WhiteTeamPlayerIds.Contains(p.Id)).ToList();
            match.BlackTeam.Players = players.Where(p => dto.BlackTeamPlayerIds.Contains(p.Id)).ToList();

            await _db.SaveChangesAsync();
            return match.ToDto();
        }

        public async Task<MatchDto?> GetMatchAsync(Guid id)
        {
            var match = await _db.Matches
                .Include(m => m.WhiteTeam).ThenInclude(t => t.Players)
                .Include(m => m.Location)
                .FirstOrDefaultAsync(m => m.Id == id);

            if (match == null)
                return null;

            return match.ToDto();
        }

        public async Task<List<MatchDto>> ListMatchesAsync()
        {
            var matches = await _db.Matches
                .Include(m => m.WhiteTeam).ThenInclude(t => t.Players)
                .Include(m => m.BlackTeam).ThenInclude(t => t.Players)
                .Include(m => m.Location)
                .ToListAsync();

            return matches.Select(m => m.ToDto()).ToList();
        }
    }
}