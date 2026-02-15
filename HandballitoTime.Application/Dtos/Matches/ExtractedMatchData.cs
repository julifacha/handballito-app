namespace HandballitoTime.Application.Dtos.Matches;

public class ExtractedMatchData
{
    public string Date { get; set; } = default!;
    public string LocationName { get; set; } = default!;
    public string? WinnerTeamName { get; set; }
    public List<string> WhiteTeamPlayerNames { get; set; } = new();
    public List<string> BlackTeamPlayerNames { get; set; } = new();
}
