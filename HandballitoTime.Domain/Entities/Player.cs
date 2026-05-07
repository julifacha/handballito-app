namespace HandballitoTime.Domain.Entities
{
    public class Player
    {
        public Guid Id { get; set; }
        public string Name { get; set; } = default!;
        public string? Nickname { get; set; }
        public string? AvatarUrl { get; set; }
        public ICollection<Team> Teams { get; set; } = new List<Team>();
    }
}