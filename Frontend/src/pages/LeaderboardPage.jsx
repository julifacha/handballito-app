import { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { Skeleton, TextInput } from '@mantine/core';
import { notifications } from '@mantine/notifications';
import { apiService } from '../api/apiService';
import PlayerAvatar from '../components/PlayerAvatar';
import './LeaderboardPage.css';

function LeaderboardPage() {
  const [data, setData] = useState(null);
  const [playerMap, setPlayerMap] = useState({});
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [result, players] = await Promise.all([
        apiService.getLeaderboard(),
        apiService.getPlayers(),
      ]);
      setData(result);
      const map = {};
      players.forEach(p => { map[p.id] = p; });
      setPlayerMap(map);
    } catch (err) {
      notifications.show({ title: 'Error', message: err.message || 'Error al cargar el leaderboard', color: 'red' });
    } finally {
      setLoading(false);
    }
  };

  const getDisplayName = (playerId, playerName) => {
    const player = playerMap[playerId];
    if (player?.nickname) return `${playerName} "${player.nickname}"`;
    return playerName;
  };

  const filterByName = (list) => {
    if (!list) return [];
    const ranked = list.map((p, i) => ({ ...p, originalRank: i + 1 }));
    if (!search.trim()) return ranked;
    const q = search.toLowerCase();
    return ranked.filter(p =>
      p.playerName.toLowerCase().includes(q) ||
      (playerMap[p.playerId]?.nickname && playerMap[p.playerId].nickname.toLowerCase().includes(q))
    );
  };

  const filteredData = useMemo(() => {
    if (!data) return null;
    return {
      mostGames: filterByName(data.mostGames),
      mostWins: filterByName(data.mostWins),
      bestWinRate: filterByName(data.bestWinRate),
      currentStreaks: filterByName(data.currentStreaks),
      eloRatings: filterByName(data.eloRatings || []),
    };
  }, [data, search]);

  const SkeletonTable = () => (
    <div className="leaderboard-section">
      <Skeleton height={28} width="40%" mb="md" />
      <div className="table-container">
        {[...Array(5)].map((_, i) => (
          <Skeleton key={i} height={36} radius="sm" mb="xs" />
        ))}
      </div>
    </div>
  );

  if (loading) {
    return (
      <div className="leaderboard-page">
        <div className="page-header">
          <Link to="/" className="back-button">← Volver al Inicio</Link>
          <h1>Leaderboard</h1>
        </div>
        <div className="page-content">
          <div className="leaderboard-grid">
            <SkeletonTable />
            <SkeletonTable />
            <SkeletonTable />
            <SkeletonTable />
          </div>
        </div>
      </div>
    );
  }

  if (!data) return null;

  return (
    <div className="leaderboard-page">
      <div className="page-header">
        <Link to="/" className="back-button">← Volver al Inicio</Link>
        <h1>Leaderboard</h1>
      </div>

      <div className="page-content">
        <TextInput
          placeholder="Buscar jugador..."
          value={search}
          onChange={(e) => setSearch(e.currentTarget.value)}
          className="search-input"
          mb="lg"
        />

        <div className="leaderboard-grid">
          {/* Most Games */}
          <div className="leaderboard-section">
            <h2>Mas Partidos</h2>
            <div className="table-container">
              <table>
                <thead>
                  <tr>
                    <th>#</th>
                    <th>Jugador</th>
                    <th>Partidos</th>
                    <th>Emp.</th>
                    <th>% Vic.</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredData.mostGames.length === 0 ? (
                    <tr><td colSpan={5} className="empty-cell">Sin resultados</td></tr>
                  ) : filteredData.mostGames.map((p) => (
                    <tr key={p.playerId} className={p.originalRank <= 3 ? `rank-${p.originalRank}` : ''}>
                      <td className="rank">{p.originalRank}</td>
                      <td><Link to={`/players/${p.playerId}`} className="player-name-cell"><PlayerAvatar player={playerMap[p.playerId]} size={24} />{getDisplayName(p.playerId, p.playerName)}</Link></td>
                      <td className="value">{p.value}</td>
                      <td className="secondary">{p.draws}</td>
                      <td className="secondary">{p.winRate}%</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Most Wins */}
          <div className="leaderboard-section">
            <h2>Mas Victorias</h2>
            <div className="table-container">
              <table>
                <thead>
                  <tr>
                    <th>#</th>
                    <th>Jugador</th>
                    <th>Victorias</th>
                    <th>Emp.</th>
                    <th>% Vic.</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredData.mostWins.length === 0 ? (
                    <tr><td colSpan={5} className="empty-cell">Sin resultados</td></tr>
                  ) : filteredData.mostWins.map((p) => (
                    <tr key={p.playerId} className={p.originalRank <= 3 ? `rank-${p.originalRank}` : ''}>
                      <td className="rank">{p.originalRank}</td>
                      <td><Link to={`/players/${p.playerId}`} className="player-name-cell"><PlayerAvatar player={playerMap[p.playerId]} size={24} />{getDisplayName(p.playerId, p.playerName)}</Link></td>
                      <td className="value">{p.value}</td>
                      <td className="secondary">{p.draws}</td>
                      <td className="secondary">{p.winRate}%</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Best Win Rate */}
          <div className="leaderboard-section">
            <h2>Mejor % Victorias</h2>
            <p className="section-note">Minimo 5 partidos</p>
            <div className="table-container">
              <table>
                <thead>
                  <tr>
                    <th>#</th>
                    <th>Jugador</th>
                    <th>% Vic.</th>
                    <th>Partidos</th>
                    <th>Emp.</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredData.bestWinRate.length === 0 ? (
                    <tr><td colSpan={5} className="empty-cell">Sin resultados</td></tr>
                  ) : filteredData.bestWinRate.map((p) => (
                    <tr key={p.playerId} className={p.originalRank <= 3 ? `rank-${p.originalRank}` : ''}>
                      <td className="rank">{p.originalRank}</td>
                      <td><Link to={`/players/${p.playerId}`} className="player-name-cell"><PlayerAvatar player={playerMap[p.playerId]} size={24} />{getDisplayName(p.playerId, p.playerName)}</Link></td>
                      <td className="value">{p.winRate}%</td>
                      <td className="secondary">{p.value}</td>
                      <td className="secondary">{p.draws}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Current Streaks */}
          <div className="leaderboard-section">
            <h2>Rachas Actuales</h2>
            <div className="table-container">
              <table>
                <thead>
                  <tr>
                    <th>#</th>
                    <th>Jugador</th>
                    <th>Racha</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredData.currentStreaks.length === 0 ? (
                    <tr><td colSpan={3} className="empty-cell">Sin rachas activas</td></tr>
                  ) : filteredData.currentStreaks.map((s) => (
                    <tr key={s.playerId} className={s.originalRank <= 3 ? `rank-${s.originalRank}` : ''}>
                      <td className="rank">{s.originalRank}</td>
                      <td><Link to={`/players/${s.playerId}`} className="player-name-cell"><PlayerAvatar player={playerMap[s.playerId]} size={24} />{getDisplayName(s.playerId, s.playerName)}</Link></td>
                      <td>
                        <span className={`streak-badge ${s.streakType === 'W' ? 'streak-win' : s.streakType === 'E' ? 'streak-draw' : 'streak-loss'}`}>
                          {s.streakCount}{s.streakType === 'W' ? 'V' : s.streakType === 'E' ? 'E' : 'D'}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Elo Rating */}
          <div className="leaderboard-section">
            <h2>Rating Elo</h2>
            <div className="table-container">
              <table>
                <thead>
                  <tr>
                    <th>#</th>
                    <th>Jugador</th>
                    <th>Elo</th>
                    <th>Partidos</th>
                    <th>Max / Min</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredData.eloRatings.length === 0 ? (
                    <tr><td colSpan={5} className="empty-cell">Sin resultados</td></tr>
                  ) : filteredData.eloRatings.map((p) => (
                    <tr key={p.playerId} className={p.originalRank <= 3 ? `rank-${p.originalRank}` : ''}>
                      <td className="rank">{p.originalRank}</td>
                      <td><Link to={`/players/${p.playerId}`} className="player-name-cell"><PlayerAvatar player={playerMap[p.playerId]} size={24} />{getDisplayName(p.playerId, p.playerName)}</Link></td>
                      <td className="value">{p.elo}</td>
                      <td className="secondary">{p.gamesPlayed}</td>
                      <td className="secondary">{p.highestElo} / {p.lowestElo}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default LeaderboardPage;
