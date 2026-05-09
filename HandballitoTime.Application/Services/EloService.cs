using HandballitoTime.Application.Dtos.Players;
using HandballitoTime.Application.Services.Interfaces;
using HandballitoTime.Domain.Entities;
using HandballitoTime.Infrastructure;
using Microsoft.EntityFrameworkCore;

namespace HandballitoTime.Application.Services;

public class EloService : IEloService
{
    private readonly HandballitoDbContext _db;
    private const double KFactor = 32.0;
    private const double StartingElo = 1500.0;

    public EloService(HandballitoDbContext db)
    {
        _db = db;
    }

    public async Task RecalculateAllAsync()
    {
        var matches = await LoadResolvedMatchesAsync();
        var eloRatings = ReplayAllMatches(matches);

        var existingRecords = await _db.Set<PlayerElo>().ToDictionaryAsync(e => e.PlayerId);

        foreach (var (playerId, data) in eloRatings)
        {
            if (existingRecords.TryGetValue(playerId, out var record))
            {
                record.CurrentElo = (int)Math.Round(data.Elo);
                record.HighestElo = data.HighestElo;
                record.LowestElo = data.LowestElo;
            }
            else
            {
                _db.Set<PlayerElo>().Add(new PlayerElo
                {
                    Id = Guid.NewGuid(),
                    PlayerId = playerId,
                    CurrentElo = (int)Math.Round(data.Elo),
                    HighestElo = data.HighestElo,
                    LowestElo = data.LowestElo
                });
            }
        }

        // Reset players who no longer have matches
        foreach (var record in existingRecords.Values)
        {
            if (!eloRatings.ContainsKey(record.PlayerId))
            {
                record.CurrentElo = (int)StartingElo;
                record.HighestElo = (int)StartingElo;
                record.LowestElo = (int)StartingElo;
            }
        }

        await _db.SaveChangesAsync();
    }

    public async Task<List<EloHistoryPointDto>> GetPlayerEloHistoryAsync(Guid playerId)
    {
        var matches = await LoadResolvedMatchesAsync();
        var eloRatings = new Dictionary<Guid, double>();
        var history = new List<EloHistoryPointDto>();

        foreach (var match in matches)
        {
            EnsurePlayersExist(match, eloRatings);

            var (whiteDelta, blackDelta) = ComputeDeltas(match, eloRatings);

            foreach (var p in match.WhiteTeam.Players)
                eloRatings[p.Id] += whiteDelta;
            foreach (var p in match.BlackTeam.Players)
                eloRatings[p.Id] += blackDelta;

            var isInMatch = match.WhiteTeam.Players.Any(p => p.Id == playerId)
                         || match.BlackTeam.Players.Any(p => p.Id == playerId);

            if (isInMatch)
            {
                history.Add(new EloHistoryPointDto
                {
                    Date = match.Date,
                    Elo = (int)Math.Round(eloRatings[playerId])
                });
            }
        }

        return history;
    }

    private Dictionary<Guid, EloData> ReplayAllMatches(List<Match> matches)
    {
        var eloRatings = new Dictionary<Guid, EloData>();

        foreach (var match in matches)
        {
            // Ensure all players exist in the dictionary
            foreach (var player in match.WhiteTeam.Players.Concat(match.BlackTeam.Players))
            {
                if (!eloRatings.ContainsKey(player.Id))
                {
                    eloRatings[player.Id] = new EloData();
                }
            }

            var eloLookup = eloRatings.ToDictionary(kv => kv.Key, kv => kv.Value.Elo);
            var (whiteDelta, blackDelta) = ComputeDeltas(match, eloLookup);

            foreach (var player in match.WhiteTeam.Players)
            {
                var data = eloRatings[player.Id];
                data.Elo += whiteDelta;
                var rounded = (int)Math.Round(data.Elo);
                if (rounded > data.HighestElo) data.HighestElo = rounded;
                if (rounded < data.LowestElo) data.LowestElo = rounded;
            }

            foreach (var player in match.BlackTeam.Players)
            {
                var data = eloRatings[player.Id];
                data.Elo += blackDelta;
                var rounded = (int)Math.Round(data.Elo);
                if (rounded > data.HighestElo) data.HighestElo = rounded;
                if (rounded < data.LowestElo) data.LowestElo = rounded;
            }
        }

        return eloRatings;
    }

    private static (double WhiteDelta, double BlackDelta) ComputeDeltas(
        Match match,
        Dictionary<Guid, double> eloRatings)
    {
        var whiteTeamElo = match.WhiteTeam.Players.Count > 0
            ? match.WhiteTeam.Players.Average(p => eloRatings[p.Id])
            : StartingElo;
        var blackTeamElo = match.BlackTeam.Players.Count > 0
            ? match.BlackTeam.Players.Average(p => eloRatings[p.Id])
            : StartingElo;

        var expectedWhite = 1.0 / (1.0 + Math.Pow(10, (blackTeamElo - whiteTeamElo) / 400.0));
        var expectedBlack = 1.0 - expectedWhite;

        double actualWhite, actualBlack;
        if (match.IsDraw)
        {
            actualWhite = 0.5;
            actualBlack = 0.5;
        }
        else
        {
            actualWhite = match.WinnerTeamId == match.WhiteTeamId ? 1.0 : 0.0;
            actualBlack = 1.0 - actualWhite;
        }

        return (KFactor * (actualWhite - expectedWhite), KFactor * (actualBlack - expectedBlack));
    }

    private static void EnsurePlayersExist(Match match, Dictionary<Guid, double> eloRatings)
    {
        foreach (var player in match.WhiteTeam.Players.Concat(match.BlackTeam.Players))
        {
            eloRatings.TryAdd(player.Id, StartingElo);
        }
    }

    private async Task<List<Match>> LoadResolvedMatchesAsync()
    {
        return await _db.Matches
            .Include(m => m.WhiteTeam).ThenInclude(t => t.Players)
            .Include(m => m.BlackTeam).ThenInclude(t => t.Players)
            .Where(m => m.IsDraw || m.WinnerTeamId != null)
            .OrderBy(m => m.Date)
            .ThenBy(m => m.Id)
            .ToListAsync();
    }

    private class EloData
    {
        public double Elo { get; set; } = StartingElo;
        public int HighestElo { get; set; } = (int)StartingElo;
        public int LowestElo { get; set; } = (int)StartingElo;
    }
}
