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
            .Select(p => new PlayerRankingDto
            {
                PlayerId = p.Id,
                PlayerName = p.Name,
                Value = p.Games,
                WinRate = p.Games > 0 ? Math.Round((double)p.Wins / p.Games * 100, 1) : 0,
                Draws = p.Draws
            })
            .ToList();

        var mostWins = allPlayers
            .OrderByDescending(p => p.Wins)
            .Select(p => new PlayerRankingDto
            {
                PlayerId = p.Id,
                PlayerName = p.Name,
                Value = p.Wins,
                WinRate = p.Games > 0 ? Math.Round((double)p.Wins / p.Games * 100, 1) : 0,
                Draws = p.Draws
            })
            .ToList();

        var bestWinRate = allPlayers
            .Where(p => p.Games >= MinGamesForWinRate)
            .OrderByDescending(p => (double)p.Wins / p.Games)
            .Select(p => new PlayerRankingDto
            {
                PlayerId = p.Id,
                PlayerName = p.Name,
                Value = p.Games,
                WinRate = Math.Round((double)p.Wins / p.Games * 100, 1),
                Draws = p.Draws
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
            .ToList();

        // Elo ratings from stored PlayerElo records
        var playerElos = await _db.Set<Domain.Entities.PlayerElo>()
            .Include(e => e.Player)
            .ToListAsync();

        var eloRatings = playerElos
            .Where(e => allPlayers.Any(p => p.Id == e.PlayerId))
            .OrderByDescending(e => e.CurrentElo)
            .Select(e =>
            {
                var playerData = allPlayers.First(p => p.Id == e.PlayerId);
                return new PlayerEloDto
                {
                    PlayerId = e.PlayerId,
                    PlayerName = e.Player.Name,
                    Elo = e.CurrentElo,
                    GamesPlayed = playerData.Games,
                    HighestElo = e.HighestElo,
                    LowestElo = e.LowestElo
                };
            })
            .ToList();

        return new LeaderboardDto
        {
            MostGames = mostGames,
            MostWins = mostWins,
            BestWinRate = bestWinRate,
            CurrentStreaks = currentStreaks,
            EloRatings = eloRatings
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
        // Skip matches with no result yet
        if (!match.IsDraw && match.WinnerTeamId == null) return;

        var isWinner = match.WinnerTeamId == team.Id;

        foreach (var player in team.Players)
        {
            if (!playerStats.TryGetValue(player.Id, out var data))
            {
                data = new PlayerData { Id = player.Id, Name = player.Name };
                playerStats[player.Id] = data;
            }

            data.Games++;
            if (isWinner) data.Wins++;
            else if (match.IsDraw) data.Draws++;
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

            if (!match.IsDraw && match.WinnerTeamId == null) continue; // no result yet, skip

            string result;
            if (match.IsDraw)
            {
                result = "E";
            }
            else
            {
                var playerTeam = onWhite ? match.WhiteTeam : match.BlackTeam;
                result = match.WinnerTeamId == playerTeam.Id ? "W" : "L";
            }

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
        public int Draws { get; set; }
    }

    private class PairData
    {
        public string Player1Name { get; set; } = default!;
        public string Player2Name { get; set; } = default!;
        public int GamesPlayed { get; set; }
        public int Wins { get; set; }
        public double WinRate { get; set; }
    }

    public async Task<HeadToHeadDto?> GetHeadToHeadAsync(Guid player1Id, Guid player2Id)
    {
        var player1 = await _db.Players.FindAsync(player1Id);
        var player2 = await _db.Players.FindAsync(player2Id);
        if (player1 == null || player2 == null) return null;

        var matches = await _db.Matches
            .Include(m => m.WhiteTeam).ThenInclude(t => t.Players)
            .Include(m => m.BlackTeam).ThenInclude(t => t.Players)
            .Include(m => m.Location)
            .OrderByDescending(m => m.Date)
            .ToListAsync();

        int p1Wins = 0, p2Wins = 0, draws = 0;
        var recentMatches = new List<HeadToHeadMatchDto>();

        foreach (var match in matches)
        {
            if (!match.IsDraw && match.WinnerTeamId == null) continue;

            var p1OnWhite = match.WhiteTeam.Players.Any(p => p.Id == player1Id);
            var p1OnBlack = match.BlackTeam.Players.Any(p => p.Id == player1Id);
            var p2OnWhite = match.WhiteTeam.Players.Any(p => p.Id == player2Id);
            var p2OnBlack = match.BlackTeam.Players.Any(p => p.Id == player2Id);

            if (!p1OnWhite && !p1OnBlack) continue;
            if (!p2OnWhite && !p2OnBlack) continue;

            // Must be on opposite teams
            var p1Team = p1OnWhite ? match.WhiteTeam : match.BlackTeam;
            var p2Team = p2OnWhite ? match.WhiteTeam : match.BlackTeam;
            if (p1Team.Id == p2Team.Id) continue;

            string result;
            if (match.IsDraw)
            {
                draws++;
                result = "Draw";
            }
            else if (match.WinnerTeamId == p1Team.Id)
            {
                p1Wins++;
                result = "Win";
            }
            else
            {
                p2Wins++;
                result = "Loss";
            }

            recentMatches.Add(new HeadToHeadMatchDto
            {
                MatchId = match.Id,
                Date = match.Date,
                LocationName = match.Location.Name,
                Result = result
            });
        }

        var totalGames = p1Wins + p2Wins + draws;
        if (totalGames == 0) return null;

        return new HeadToHeadDto
        {
            Player1Id = player1Id,
            Player1Name = player1.Name,
            Player2Id = player2Id,
            Player2Name = player2.Name,
            Player1Wins = p1Wins,
            Player2Wins = p2Wins,
            Draws = draws,
            TotalGames = totalGames,
            Player1WinRate = Math.Round((double)p1Wins / totalGames * 100, 1),
            Player2WinRate = Math.Round((double)p2Wins / totalGames * 100, 1),
            RecentMatches = recentMatches
        };
    }
}
