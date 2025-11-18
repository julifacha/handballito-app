namespace HandballitoTime.Domain.Entities
{
    public class Team
    {
        public Guid Id { get; set; }
        public ICollection<Player> Players { get; set; } = new List<Player>();
    }
}