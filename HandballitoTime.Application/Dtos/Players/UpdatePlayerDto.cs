namespace HandballitoTime.Application.Dtos.Players;

public class UpdatePlayerDto
{
    public string Name { get; set; } = default!;
    public string? Nickname { get; set; }
    public string? AvatarUrl { get; set; }
}
