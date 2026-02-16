using HandballitoTime.Application.Dtos.Stats;

namespace HandballitoTime.Application.Services.Interfaces;

public interface IStatsService
{
    Task<LeaderboardDto> GetLeaderboardAsync();
    Task<MatchStatsDto> GetMatchStatsAsync();
}
