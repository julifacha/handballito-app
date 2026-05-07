namespace HandballitoTime.Application.Dtos.Players
{
    public class PlayerDto
    {
        public Guid Id { get; set; }
        public string Name { get; set; } = default!;
        public string? Nickname { get; set; }
        public string? AvatarUrl { get; set; }
    }
}
