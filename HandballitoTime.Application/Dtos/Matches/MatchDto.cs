using HandballitoTime.Application.Dtos.Teams;

namespace HandballitoTime.Application.Dtos.Matches
{
    public class MatchDto : MatchDtoBase
    {
        public Guid Id { get; set; }
        public string LocationName { get; set; } = default!;
        public TeamDto WhiteTeam { get; set; } = default!;
        public TeamDto BlackTeam { get; set; } = default!;
    }
}
