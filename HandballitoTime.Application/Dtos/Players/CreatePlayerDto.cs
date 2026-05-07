namespace HandballitoTime.Application.Dtos.Players
{
    public class CreatePlayerDto
    {
        public string Name { get; set; } = default!;
        public string? Nickname { get; set; }
    }
}