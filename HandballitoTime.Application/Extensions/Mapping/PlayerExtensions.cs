namespace HandballitoTime.Application.Extensions.Mapping
{
    public static class PlayerExtensions
    {
        public static Dtos.Players.PlayerDto ToDto(this Domain.Entities.Player player)
        {
            return new Dtos.Players.PlayerDto
            {
                Id = player.Id,
                Name = player.Name,
            };
        }
    }
}
