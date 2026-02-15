namespace HandballitoTime.Application.Dtos.Matches;

public class CreateMatchFromImageResultDto
{
    public MatchDto Match { get; set; } = default!;
    public List<string> CreatedPlayers { get; set; } = new();
    public ExtractedMatchData ExtractedData { get; set; } = default!;
}
