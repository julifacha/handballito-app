using HandballitoTime.Application.Dtos.Matches;

namespace HandballitoTime.Application.Services.Interfaces
{
    public interface IMatchService
    {
        Task<MatchDto> AddMatchAsync(CreateMatchDto dto);
        Task<MatchDto> UpdateMatchAsync(Guid id, UpdateMatchDto dto);
        Task<MatchDto?> GetMatchAsync(Guid id);
        Task<List<MatchDto>> ListMatchesAsync();
        Task<CreateMatchFromImageResultDto> CreateMatchFromTextAsync(string text);
    }
}