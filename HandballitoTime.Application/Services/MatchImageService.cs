using System.Text.RegularExpressions;
using FuzzySharp;
using HandballitoTime.Application.Dtos.Matches;
using HandballitoTime.Application.Extensions.Mapping;
using HandballitoTime.Application.Services.Interfaces;
using HandballitoTime.Domain.Entities;
using HandballitoTime.Infrastructure;
using Microsoft.EntityFrameworkCore;

namespace HandballitoTime.Application.Services;

public partial class MatchImageService : IMatchImageService
{
    private readonly HandballitoDbContext _db;
    private const int FuzzyMatchThreshold = 80;

    public MatchImageService(HandballitoDbContext db)
    {
        _db = db;
    }

    public async Task<CreateMatchFromImageResultDto> CreateMatchFromTextAsync(string text)
    {
        var extractedData = ParseText(text);
        return await CreateMatchFromExtractedDataAsync(extractedData);
    }

    private async Task<CreateMatchFromImageResultDto> CreateMatchFromExtractedDataAsync(ExtractedMatchData extractedData)
    {
        if (!DateOnly.TryParseExact(extractedData.Date, ["yyyy-MM-dd", "dd/MM/yyyy"], out var matchDate))
            throw new ArgumentException($"Could not parse date '{extractedData.Date}'.");

        var location = await ResolveLocationAsync(extractedData.LocationName);

        var createdPlayerNames = new List<string>();
        var whiteTeamPlayers = await ResolvePlayersAsync(extractedData.WhiteTeamPlayerNames, createdPlayerNames);
        var blackTeamPlayers = await ResolvePlayersAsync(extractedData.BlackTeamPlayerNames, createdPlayerNames);

        var whiteTeam = new Team
        {
            Id = Guid.NewGuid(),
            Players = whiteTeamPlayers
        };

        var blackTeam = new Team
        {
            Id = Guid.NewGuid(),
            Players = blackTeamPlayers
        };

        Guid? winnerTeamId = extractedData.WinnerTeamName?.ToLowerInvariant() switch
        {
            "negro" => blackTeam.Id,
            "blanco" => whiteTeam.Id,
            _ => null
        };

        var match = new Domain.Entities.Match
        {
            Id = Guid.NewGuid(),
            Date = matchDate,
            LocationId = location.Id,
            Location = location,
            WhiteTeamId = whiteTeam.Id,
            BlackTeamId = blackTeam.Id,
            WhiteTeam = whiteTeam,
            BlackTeam = blackTeam,
            WinnerTeamId = winnerTeamId
        };

        _db.Matches.Add(match);
        await _db.SaveChangesAsync();

        return new CreateMatchFromImageResultDto
        {
            Match = match.ToDto(),
            CreatedPlayers = createdPlayerNames,
            ExtractedData = extractedData
        };
    }

    private static ExtractedMatchData ParseText(string text)
    {
        var lines = text
            .Split('\n', StringSplitOptions.RemoveEmptyEntries)
            .Select(l => l.Trim())
            .Where(l => l.Length > 0)
            .ToList();

        if (lines.Count < 3)
            throw new ArgumentException("Text must have at least a header line, a team labels line, and one player line.");

        // Line 1: "CUM 15/02/2026" → location + date
        var firstLine = lines[0];
        var dateMatch = DatePattern().Match(firstLine);
        if (!dateMatch.Success)
            throw new ArgumentException($"Could not find a date (DD/MM/YYYY) in the first line: '{firstLine}'.");

        var locationName = firstLine[..dateMatch.Index].Trim();
        var date = dateMatch.Value;
        var afterDate = firstLine[(dateMatch.Index + dateMatch.Length)..].Trim();
        var winnerTeamName = string.IsNullOrWhiteSpace(afterDate) ? null : afterDate;

        // Line 2: "Negro         Blanco" or "Blanco         Negro" → determine column order
        var headerParts = MultipleSpaces().Split(lines[1])
            .Select(h => h.Trim().ToLowerInvariant())
            .Where(h => h.Length > 0)
            .ToList();

        if (headerParts.Count < 2)
            throw new ArgumentException($"Could not parse team headers from line: '{lines[1]}'.");

        var leftIsBlack = headerParts[0] == "negro";

        // Lines 3+: "Chris.          Guchy" → player pairs
        var leftTeamNames = new List<string>();
        var rightTeamNames = new List<string>();

        for (var i = 2; i < lines.Count; i++)
        {
            var parts = MultipleSpaces().Split(lines[i])
                .Select(CleanPlayerName)
                .Where(p => p.Length > 0)
                .ToList();

            if (parts.Count >= 2)
            {
                leftTeamNames.Add(parts[0]);
                rightTeamNames.Add(parts[1]);
            }
            else if (parts.Count == 1)
            {
                leftTeamNames.Add(parts[0]);
            }
        }

        return new ExtractedMatchData
        {
            Date = date,
            LocationName = locationName,
            WinnerTeamName = winnerTeamName,
            BlackTeamPlayerNames = leftIsBlack ? leftTeamNames : rightTeamNames,
            WhiteTeamPlayerNames = leftIsBlack ? rightTeamNames : leftTeamNames
        };
    }

    private static string CleanPlayerName(string name)
    {
        return name.Trim().Trim('.').Trim();
    }

    private async Task<Location> ResolveLocationAsync(string locationName)
    {
        var locations = await _db.Locations.ToListAsync();

        var exact = locations.FirstOrDefault(
            l => l.Name.Equals(locationName, StringComparison.OrdinalIgnoreCase));
        if (exact != null) return exact;

        var bestMatch = locations
            .Select(l => new { Location = l, Score = Fuzz.Ratio(l.Name.ToLowerInvariant(), locationName.ToLowerInvariant()) })
            .OrderByDescending(x => x.Score)
            .FirstOrDefault();

        if (bestMatch != null && bestMatch.Score >= FuzzyMatchThreshold)
            return bestMatch.Location;

        throw new KeyNotFoundException(
            $"Location '{locationName}' not found. Please create the location first.");
    }

    private async Task<List<Player>> ResolvePlayersAsync(List<string> playerNames, List<string> createdPlayerNames)
    {
        var allPlayers = await _db.Players.ToListAsync();
        var resolved = new List<Player>();

        foreach (var name in playerNames)
        {
            var exact = allPlayers.FirstOrDefault(
                p => p.Name.Equals(name, StringComparison.OrdinalIgnoreCase));
            if (exact != null)
            {
                resolved.Add(exact);
                continue;
            }

            var bestMatch = allPlayers
                .Select(p => new { Player = p, Score = Fuzz.Ratio(p.Name.ToLowerInvariant(), name.ToLowerInvariant()) })
                .OrderByDescending(x => x.Score)
                .FirstOrDefault();

            if (bestMatch != null && bestMatch.Score >= FuzzyMatchThreshold)
            {
                resolved.Add(bestMatch.Player);
                continue;
            }

            var newPlayer = new Player
            {
                Id = Guid.NewGuid(),
                Name = name
            };
            _db.Players.Add(newPlayer);
            allPlayers.Add(newPlayer);
            resolved.Add(newPlayer);
            createdPlayerNames.Add(name);
        }

        return resolved;
    }

    [GeneratedRegex(@"\d{1,2}/\d{1,2}/\d{4}")]
    private static partial Regex DatePattern();

    [GeneratedRegex(@"\s{2,}")]
    private static partial Regex MultipleSpaces();
}
