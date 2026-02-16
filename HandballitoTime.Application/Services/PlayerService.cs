using HandballitoTime.Application.Dtos.Players;
using HandballitoTime.Application.Extensions.Mapping;
using HandballitoTime.Application.Services.Interfaces;
using HandballitoTime.Domain.Entities;
using HandballitoTime.Infrastructure;
using Microsoft.EntityFrameworkCore;

namespace HandballitoTime.Application.Services
{
    public class PlayerService : IPlayerService
    {
        private readonly HandballitoDbContext _db;

        public PlayerService(HandballitoDbContext db)
        {
            _db = db;
        }

        public async Task<PlayerDto> AddPlayerAsync(CreatePlayerDto dto)
        {
            var player = new Player
            {
                Id = Guid.NewGuid(),
                Name = dto.Name
            };
            _db.Players.Add(player);
            await _db.SaveChangesAsync();
            return player.ToDto();
        }

        public async Task<PlayerDto?> GetPlayerAsync(Guid id)
        {
            var player = await _db.Players.FindAsync(id);

            if (player == null)
                return null;
            
            return player.ToDto();
        }

        public async Task<List<PlayerDto>> ListPlayersAsync()
        {
            var players = await _db.Players.ToListAsync();

            return players.Select(p => p.ToDto()).ToList();
        }

        public async Task<PlayerStatsDto?> GetPlayerStatsAsync(Guid playerId)
        {
            var player = await _db.Players.FindAsync(playerId);
            if (player == null) return null;

            var matches = await _db.Matches
                .Include(m => m.WhiteTeam).ThenInclude(t => t.Players)
                .Include(m => m.BlackTeam).ThenInclude(t => t.Players)
                .Include(m => m.Location)
                .Where(m => m.WhiteTeam.Players.Any(p => p.Id == playerId)
                          || m.BlackTeam.Players.Any(p => p.Id == playerId))
                .OrderByDescending(m => m.Date)
                .ToListAsync();

            int wins = 0, losses = 0, draws = 0;
            var teammateCounter = new Dictionary<Guid, (string Name, int Count)>();
            var recentMatches = new List<PlayerMatchDto>();

            foreach (var match in matches)
            {
                var onWhite = match.WhiteTeam.Players.Any(p => p.Id == playerId);
                var playerTeam = onWhite ? match.WhiteTeam : match.BlackTeam;
                var opponentTeam = onWhite ? match.BlackTeam : match.WhiteTeam;

                string result;
                if (match.WinnerTeamId == null)
                {
                    draws++;
                    result = "Draw";
                }
                else if (match.WinnerTeamId == playerTeam.Id)
                {
                    wins++;
                    result = "Win";
                }
                else
                {
                    losses++;
                    result = "Loss";
                }

                recentMatches.Add(new PlayerMatchDto
                {
                    MatchId = match.Id,
                    Date = match.Date,
                    LocationName = match.Location.Name,
                    TeamColor = onWhite ? "White" : "Black",
                    TeammateNames = playerTeam.Players
                        .Where(p => p.Id != playerId)
                        .Select(p => p.Name)
                        .ToList(),
                    OpponentNames = opponentTeam.Players
                        .Select(p => p.Name)
                        .ToList(),
                    Result = result
                });

                foreach (var teammate in playerTeam.Players.Where(p => p.Id != playerId))
                {
                    if (teammateCounter.TryGetValue(teammate.Id, out var existing))
                        teammateCounter[teammate.Id] = (existing.Name, existing.Count + 1);
                    else
                        teammateCounter[teammate.Id] = (teammate.Name, 1);
                }
            }

            var totalGames = matches.Count;

            return new PlayerStatsDto
            {
                Id = player.Id,
                Name = player.Name,
                TotalGames = totalGames,
                Wins = wins,
                Losses = losses,
                Draws = draws,
                WinRate = totalGames > 0 ? Math.Round((double)wins / totalGames * 100, 1) : 0,
                RecentMatches = recentMatches,
                TopTeammates = teammateCounter
                    .OrderByDescending(kv => kv.Value.Count)
                    .Take(5)
                    .Select(kv => new TeammateDto
                    {
                        PlayerId = kv.Key,
                        PlayerName = kv.Value.Name,
                        GamesPlayedTogether = kv.Value.Count
                    })
                    .ToList()
            };
        }
    }
}