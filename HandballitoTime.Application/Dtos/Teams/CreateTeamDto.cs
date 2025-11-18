namespace HandballitoTime.Application.Dtos.Teams
{
    public class CreateTeamDto
    {
        public Guid Id { get; set; }
        public string Name { get; set; } = default!;
        public List<Guid> PlayerIds { get; set; } = new();
    }
}
