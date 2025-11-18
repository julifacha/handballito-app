using HandballitoTime.Application.Dtos.Teams;

namespace HandballitoTime.Application.Dtos.Matches
{
    public class CreateMatchDto : MatchDtoBase
    {
        public Guid LocationId { get; set; }
        public List<Guid> WhiteTeamPlayerIds { get; set; } = new();
        public List<Guid> BlackTeamPlayerIds { get; set; } = new();
    }
}