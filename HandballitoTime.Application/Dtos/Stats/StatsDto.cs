namespace HandballitoTime.Application.Dtos.Stats;

// Leaderboard
public class LeaderboardDto
{
    public List<PlayerRankingDto> MostGames { get; set; } = new();
    public List<PlayerRankingDto> MostWins { get; set; } = new();
    public List<PlayerRankingDto> BestWinRate { get; set; } = new();
    public List<PlayerStreakDto> CurrentStreaks { get; set; } = new();
}

public class PlayerRankingDto
{
    public Guid PlayerId { get; set; }
    public string PlayerName { get; set; } = default!;
    public int Value { get; set; }
    public double WinRate { get; set; }
}

public class PlayerStreakDto
{
    public Guid PlayerId { get; set; }
    public string PlayerName { get; set; } = default!;
    public string StreakType { get; set; } = default!; // "W" or "L"
    public int StreakCount { get; set; }
}

// Match Stats
public class MatchStatsDto
{
    public List<PairStatsDto> TopPairs { get; set; } = new();
    public List<MonthlyGamesDto> GamesOverTime { get; set; } = new();
    public List<LocationStatsDto> LocationBreakdown { get; set; } = new();
}

public class PairStatsDto
{
    public string Player1Name { get; set; } = default!;
    public string Player2Name { get; set; } = default!;
    public int GamesPlayed { get; set; }
    public int Wins { get; set; }
    public double WinRate { get; set; }
}

public class MonthlyGamesDto
{
    public string Month { get; set; } = default!;
    public int GamesCount { get; set; }
}

public class LocationStatsDto
{
    public string LocationName { get; set; } = default!;
    public int GamesCount { get; set; }
}
