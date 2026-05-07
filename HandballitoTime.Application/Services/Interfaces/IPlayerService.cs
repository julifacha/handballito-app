using HandballitoTime.Application.Dtos.Players;

namespace HandballitoTime.Application.Services.Interfaces
{
    public interface IPlayerService
    {
        Task<PlayerDto> AddPlayerAsync(CreatePlayerDto dto);
        Task<PlayerDto?> UpdatePlayerAsync(Guid id, UpdatePlayerDto dto);
        Task<PlayerDto?> GetPlayerAsync(Guid id);
        Task<List<PlayerDto>> ListPlayersAsync();
        Task<PlayerStatsDto?> GetPlayerStatsAsync(Guid id);
    }
}