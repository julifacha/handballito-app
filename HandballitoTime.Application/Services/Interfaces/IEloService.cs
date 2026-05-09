using HandballitoTime.Application.Dtos.Players;

namespace HandballitoTime.Application.Services.Interfaces;

public interface IEloService
{
    Task RecalculateAllAsync();
    Task<List<EloHistoryPointDto>> GetPlayerEloHistoryAsync(Guid playerId);
}
