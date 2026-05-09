namespace HandballitoTime.Application.Dtos.Stats;

// Leaderboard
public class LeaderboardDto
{
    public List<PlayerRankingDto> MostGames { get; set; } = new();
    public List<PlayerRankingDto> MostWins { get; set; } = new();
    public List<PlayerRankingDto> BestWinRate { get; set; } = new();
    public List<PlayerStreakDto> CurrentStreaks { get; set; } = new();
    public List<PlayerEloDto> EloRatings { get; set; } = new();
}

public class PlayerEloDto
{
    public Guid PlayerId { get; set; }
    public string PlayerName { get; set; } = default!;
    public int Elo { get; set; }
    public int GamesPlayed { get; set; }
    public int HighestElo { get; set; }
    public int LowestElo { get; set; }
}

public class PlayerRankingDto
{
    public Guid PlayerId { get; set; }
    public string PlayerName { get; set; } = default!;
    public int Value { get; set; }
    public double WinRate { get; set; }
    public int Draws { get; set; }
}

public class PlayerStreakDto
{
    public Guid PlayerId { get; set; }
    public string PlayerName { get; set; } = default!;
    public string StreakType { get; set; } = default!; // "W", "L", or "E"
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

// Head-to-Head
public class HeadToHeadDto
{
    public Guid Player1Id { get; set; }
    public string Player1Name { get; set; } = default!;
    public Guid Player2Id { get; set; }
    public string Player2Name { get; set; } = default!;
    public int Player1Wins { get; set; }
    public int Player2Wins { get; set; }
    public int Draws { get; set; }
    public int TotalGames { get; set; }
    public double Player1WinRate { get; set; }
    public double Player2WinRate { get; set; }
    public List<HeadToHeadMatchDto> RecentMatches { get; set; } = new();
}

public class HeadToHeadMatchDto
{
    public Guid MatchId { get; set; }
    public DateOnly Date { get; set; }
    public string LocationName { get; set; } = default!;
    public string Result { get; set; } = default!; // "Win", "Loss", "Draw" from Player1's perspective
}
