namespace HandballitoTime.Application.Dtos.Players;

public class PlayerStatsDto
{
    public Guid Id { get; set; }
    public string Name { get; set; } = default!;
    public int TotalGames { get; set; }
    public int Wins { get; set; }
    public int Losses { get; set; }
    public int Draws { get; set; }
    public double WinRate { get; set; }
    public List<PlayerMatchDto> RecentMatches { get; set; } = new();
    public List<TeammateDto> TopTeammates { get; set; } = new();
}

public class PlayerMatchDto
{
    public Guid MatchId { get; set; }
    public DateOnly Date { get; set; }
    public string LocationName { get; set; } = default!;
    public string TeamColor { get; set; } = default!;
    public List<string> TeammateNames { get; set; } = new();
    public List<string> OpponentNames { get; set; } = new();
    public string Result { get; set; } = default!;
}

public class TeammateDto
{
    public Guid PlayerId { get; set; }
    public string PlayerName { get; set; } = default!;
    public int GamesPlayedTogether { get; set; }
}
