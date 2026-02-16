using HandballitoTime.Application.Dtos.Stats;
using HandballitoTime.Application.Services.Interfaces;
using HandballitoTime.Infrastructure;
using Microsoft.EntityFrameworkCore;

namespace HandballitoTime.Application.Services;

public class StatsService : IStatsService
{
    private readonly HandballitoDbContext _db;
    private const int MinGamesForWinRate = 3;

    public StatsService(HandballitoDbContext db)
    {
        _db = db;
    }

    public async Task<LeaderboardDto> GetLeaderboardAsync()
    {
        var matches = await LoadAllMatchesAsync();

        // Per-player stats
        var playerStats = new Dictionary<Guid, PlayerData>();

        foreach (var match in matches)
        {
            ProcessTeam(match, match.WhiteTeam, match.BlackTeam, playerStats);
            ProcessTeam(match, match.BlackTeam, match.WhiteTeam, playerStats);
        }

        // Build rankings
        var allPlayers = playerStats.Values.ToList();

        var mostGames = allPlayers
            .OrderByDescending(p => p.Games)
            .Take(10)
            .Select(p => new PlayerRankingDto
            {
                PlayerId = p.Id,
                PlayerName = p.Name,
                Value = p.Games,
                WinRate = p.Games > 0 ? Math.Round((double)p.Wins / p.Games * 100, 1) : 0
            })
            .ToList();

        var mostWins = allPlayers
            .OrderByDescending(p => p.Wins)
            .Take(10)
            .Select(p => new PlayerRankingDto
            {
                PlayerId = p.Id,
                PlayerName = p.Name,
                Value = p.Wins,
                WinRate = p.Games > 0 ? Math.Round((double)p.Wins / p.Games * 100, 1) : 0
            })
            .ToList();

        var bestWinRate = allPlayers
            .Where(p => p.Games >= MinGamesForWinRate)
            .OrderByDescending(p => (double)p.Wins / p.Games)
            .Take(10)
            .Select(p => new PlayerRankingDto
            {
                PlayerId = p.Id,
                PlayerName = p.Name,
                Value = p.Games,
                WinRate = Math.Round((double)p.Wins / p.Games * 100, 1)
            })
            .ToList();

        // Streaks: walk each player's matches in date order
        var currentStreaks = new List<PlayerStreakDto>();
        foreach (var player in allPlayers)
        {
            var (streakType, streakCount) = ComputeCurrentStreak(player.Id, matches);
            if (streakCount >= 2)
            {
                currentStreaks.Add(new PlayerStreakDto
                {
                    PlayerId = player.Id,
                    PlayerName = player.Name,
                    StreakType = streakType,
                    StreakCount = streakCount
                });
            }
        }

        currentStreaks = currentStreaks
            .OrderByDescending(s => s.StreakCount)
            .Take(10)
            .ToList();

        return new LeaderboardDto
        {
            MostGames = mostGames,
            MostWins = mostWins,
            BestWinRate = bestWinRate,
            CurrentStreaks = currentStreaks
        };
    }

    public async Task<MatchStatsDto> GetMatchStatsAsync()
    {
        var matches = await LoadAllMatchesAsync();

        // Player pair combinations
        var pairStats = new Dictionary<(Guid, Guid), PairData>();

        foreach (var match in matches)
        {
            ProcessPairs(match, match.WhiteTeam, pairStats);
            ProcessPairs(match, match.BlackTeam, pairStats);
        }

        var topPairs = pairStats.Values
            .Where(p => p.GamesPlayed >= 2)
            .OrderByDescending(p => p.WinRate)
            .ThenByDescending(p => p.GamesPlayed)
            .Take(10)
            .Select(p => new PairStatsDto
            {
                Player1Name = p.Player1Name,
                Player2Name = p.Player2Name,
                GamesPlayed = p.GamesPlayed,
                Wins = p.Wins,
                WinRate = p.WinRate
            })
            .ToList();

        // Games over time (by month)
        var gamesOverTime = matches
            .GroupBy(m => new { m.Date.Year, m.Date.Month })
            .OrderBy(g => g.Key.Year).ThenBy(g => g.Key.Month)
            .Select(g => new MonthlyGamesDto
            {
                Month = $"{g.Key.Month:D2}/{g.Key.Year}",
                GamesCount = g.Count()
            })
            .ToList();

        // Location breakdown
        var locationBreakdown = matches
            .GroupBy(m => m.Location.Name)
            .OrderByDescending(g => g.Count())
            .Select(g => new LocationStatsDto
            {
                LocationName = g.Key,
                GamesCount = g.Count()
            })
            .ToList();

        return new MatchStatsDto
        {
            TopPairs = topPairs,
            GamesOverTime = gamesOverTime,
            LocationBreakdown = locationBreakdown
        };
    }

    private async Task<List<Domain.Entities.Match>> LoadAllMatchesAsync()
    {
        return await _db.Matches
            .Include(m => m.WhiteTeam).ThenInclude(t => t.Players)
            .Include(m => m.BlackTeam).ThenInclude(t => t.Players)
            .Include(m => m.Location)
            .OrderBy(m => m.Date)
            .ToListAsync();
    }

    private static void ProcessTeam(
        Domain.Entities.Match match,
        Domain.Entities.Team team,
        Domain.Entities.Team opponent,
        Dictionary<Guid, PlayerData> playerStats)
    {
        var isWinner = match.WinnerTeamId == team.Id;
        var isDraw = match.WinnerTeamId == null;

        foreach (var player in team.Players)
        {
            if (!playerStats.TryGetValue(player.Id, out var data))
            {
                data = new PlayerData { Id = player.Id, Name = player.Name };
                playerStats[player.Id] = data;
            }

            data.Games++;
            if (isWinner) data.Wins++;
        }
    }

    private static void ProcessPairs(
        Domain.Entities.Match match,
        Domain.Entities.Team team,
        Dictionary<(Guid, Guid), PairData> pairStats)
    {
        var players = team.Players.OrderBy(p => p.Id).ToList();
        var isWinner = match.WinnerTeamId == team.Id;

        for (var i = 0; i < players.Count; i++)
        {
            for (var j = i + 1; j < players.Count; j++)
            {
                var key = (players[i].Id, players[j].Id);
                if (!pairStats.TryGetValue(key, out var data))
                {
                    data = new PairData
                    {
                        Player1Name = players[i].Name,
                        Player2Name = players[j].Name
                    };
                    pairStats[key] = data;
                }

                data.GamesPlayed++;
                if (isWinner) data.Wins++;
                data.WinRate = Math.Round((double)data.Wins / data.GamesPlayed * 100, 1);
            }
        }
    }

    private static (string Type, int Count) ComputeCurrentStreak(
        Guid playerId,
        List<Domain.Entities.Match> matchesDateAsc)
    {
        string? streakType = null;
        var streakCount = 0;

        // Walk from most recent to oldest
        for (var i = matchesDateAsc.Count - 1; i >= 0; i--)
        {
            var match = matchesDateAsc[i];
            var onWhite = match.WhiteTeam.Players.Any(p => p.Id == playerId);
            var onBlack = match.BlackTeam.Players.Any(p => p.Id == playerId);
            if (!onWhite && !onBlack) continue;

            if (match.WinnerTeamId == null) break; // draw breaks streak

            var playerTeam = onWhite ? match.WhiteTeam : match.BlackTeam;
            var result = match.WinnerTeamId == playerTeam.Id ? "W" : "L";

            if (streakType == null)
            {
                streakType = result;
                streakCount = 1;
            }
            else if (result == streakType)
            {
                streakCount++;
            }
            else
            {
                break;
            }
        }

        return (streakType ?? "W", streakCount);
    }

    private class PlayerData
    {
        public Guid Id { get; set; }
        public string Name { get; set; } = default!;
        public int Games { get; set; }
        public int Wins { get; set; }
    }

    private class PairData
    {
        public string Player1Name { get; set; } = default!;
        public string Player2Name { get; set; } = default!;
        public int GamesPlayed { get; set; }
        public int Wins { get; set; }
        public double WinRate { get; set; }
    }
}
