using HandballitoTime.Application.Dtos.Players;
using HandballitoTime.Application.Extensions.Mapping;
using HandballitoTime.Application.Services.Interfaces;
using HandballitoTime.Domain.Entities;
using HandballitoTime.Infrastructure;
using Microsoft.EntityFrameworkCore;

namespace HandballitoTime.Application.Services
{
    public class PlayerService : IPlayerService
    {
        private readonly HandballitoDbContext _db;

        public PlayerService(HandballitoDbContext db)
        {
            _db = db;
        }

        public async Task<PlayerDto> AddPlayerAsync(CreatePlayerDto dto)
        {
            var player = new Player
            {
                Id = Guid.NewGuid(),
                Name = dto.Name
            };
            _db.Players.Add(player);
            await _db.SaveChangesAsync();
            return player.ToDto();
        }

        public async Task<PlayerDto?> GetPlayerAsync(Guid id)
        {
            var player = await _db.Players.FindAsync(id);

            if (player == null)
                return null;
            
            return player.ToDto();
        }

        public async Task<List<PlayerDto>> ListPlayersAsync()
        {
            var players = await _db.Players.ToListAsync();

            return players.Select(p => p.ToDto()).ToList();
        }
    }
}