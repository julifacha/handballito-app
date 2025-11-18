using HandballitoTime.Application.Dtos.Teams;

namespace HandballitoTime.Application.Extensions.Mapping
{
    public static class TeamExtensions
    {
        public static TeamDto ToDto(this Domain.Entities.Team team)
        {
            return new TeamDto
            {
                Id = team.Id,
                PlayerIds = team.Players.Select(p => p.Id).ToList()
            };
        }
    }
}
