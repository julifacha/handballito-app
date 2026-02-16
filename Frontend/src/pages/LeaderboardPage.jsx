import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { apiService } from '../api/apiService';
import './LeaderboardPage.css';

function LeaderboardPage() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchLeaderboard();
  }, []);

  const fetchLeaderboard = async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await apiService.getLeaderboard();
      setData(result);
    } catch (err) {
      setError(err.message || 'Error al cargar el leaderboard');
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div className="leaderboard-page"><div className="loading">Cargando...</div></div>;
  if (error) return <div className="leaderboard-page"><div className="error-message">{error}</div></div>;
  if (!data) return null;

  return (
    <div className="leaderboard-page">
      <div className="page-header">
        <Link to="/" className="back-button">← Volver al Inicio</Link>
        <h1>Leaderboard</h1>
      </div>

      <div className="page-content">
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
                    <th>% Vic.</th>
                  </tr>
                </thead>
                <tbody>
                  {data.mostGames.map((p, i) => (
                    <tr key={p.playerId}>
                      <td className="rank">{i + 1}</td>
                      <td><Link to={`/players/${p.playerId}`}>{p.playerName}</Link></td>
                      <td className="value">{p.value}</td>
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
                    <th>% Vic.</th>
                  </tr>
                </thead>
                <tbody>
                  {data.mostWins.map((p, i) => (
                    <tr key={p.playerId}>
                      <td className="rank">{i + 1}</td>
                      <td><Link to={`/players/${p.playerId}`}>{p.playerName}</Link></td>
                      <td className="value">{p.value}</td>
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
            <p className="section-note">Minimo 3 partidos</p>
            <div className="table-container">
              <table>
                <thead>
                  <tr>
                    <th>#</th>
                    <th>Jugador</th>
                    <th>% Vic.</th>
                    <th>Partidos</th>
                  </tr>
                </thead>
                <tbody>
                  {data.bestWinRate.map((p, i) => (
                    <tr key={p.playerId}>
                      <td className="rank">{i + 1}</td>
                      <td><Link to={`/players/${p.playerId}`}>{p.playerName}</Link></td>
                      <td className="value">{p.winRate}%</td>
                      <td className="secondary">{p.value}</td>
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
                  {data.currentStreaks.length === 0 ? (
                    <tr><td colSpan={3} className="empty-cell">Sin rachas activas</td></tr>
                  ) : data.currentStreaks.map((s, i) => (
                    <tr key={s.playerId}>
                      <td className="rank">{i + 1}</td>
                      <td><Link to={`/players/${s.playerId}`}>{s.playerName}</Link></td>
                      <td>
                        <span className={`streak-badge ${s.streakType === 'W' ? 'streak-win' : 'streak-loss'}`}>
                          {s.streakCount}{s.streakType === 'W' ? 'V' : 'D'}
                        </span>
                      </td>
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
