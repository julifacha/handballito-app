namespace HandballitoTime.Domain.Entities
{
    public class Location
    {
        public Guid Id { get; set; }
        public string Name { get; set; } = default!;
        public string? Address { get; set; }
        public ICollection<Match> Matches { get; set; } = new List<Match>();
    }
}