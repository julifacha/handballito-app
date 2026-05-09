namespace HandballitoTime.Domain.Entities
{
    public class PlayerElo
    {
        public Guid Id { get; set; }
        public Guid PlayerId { get; set; }
        public Player Player { get; set; } = default!;
        public int CurrentElo { get; set; } = 1500;
        public int HighestElo { get; set; } = 1500;
        public int LowestElo { get; set; } = 1500;
    }
}
