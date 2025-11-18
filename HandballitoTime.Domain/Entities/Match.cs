namespace HandballitoTime.Domain.Entities
{
    public class Match
    {
        public Guid Id { get; set; }
        public DateOnly Date { get; set; }

        public Guid WhiteTeamId { get; set; }
        public Team WhiteTeam { get; set; } = default!;

        public Guid BlackTeamId { get; set; }
        public Team BlackTeam { get; set; } = default!;

        public Guid? WinnerTeamId { get; set; }
        public Team? WinnerTeam { get; set; }

        public Guid LocationId { get; set; }
        public Location Location { get; set; } = default!;
    }
}