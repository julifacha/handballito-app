using HandballitoTime.Application.Dtos.Matches;

namespace HandballitoTime.Application.Services.Interfaces;

public interface IMatchImageService
{
    Task<CreateMatchFromImageResultDto> CreateMatchFromTextAsync(string text);
}
