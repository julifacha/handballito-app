using HandballitoTime.Application.Dtos.Matches;

namespace HandballitoTime.Application.Extensions.Mapping
{
    public static class MatchExtensions
    {
        public static MatchDto ToDto(this Domain.Entities.Match match)
        {
            return new MatchDto
            {
                Id = match.Id,
                Date = match.Date,
                LocationName = match.Location.Name,
                WhiteTeam = match.WhiteTeam.ToDto(),
                BlackTeam = match.BlackTeam.ToDto(),
                WinnerTeamId = match.WinnerTeamId
            };
        }
    }
}
