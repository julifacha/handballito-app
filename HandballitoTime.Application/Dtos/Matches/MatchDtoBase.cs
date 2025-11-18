namespace HandballitoTime.Application.Dtos.Matches
{
    public abstract class MatchDtoBase
    {
        public DateOnly Date { get; set; }
        public Guid? WinnerTeamId { get; set; }
    }
}
