namespace HandballitoTime.Domain.Entities
{
    public class Player
    {
        public Guid Id { get; set; }
        public string Name { get; set; } = default!;
        public ICollection<Team> Teams { get; set; } = new List<Team>();
    }
}