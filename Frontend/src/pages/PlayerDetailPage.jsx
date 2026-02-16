import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { apiService } from '../api/apiService';
import './PlayerDetailPage.css';

function PlayerDetailPage() {
  const { id } = useParams();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchPlayerStats();
  }, [id]);

  const fetchPlayerStats = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await apiService.getPlayerStats(id);
      setStats(data);
    } catch (err) {
      setError(err.message || 'Error al cargar las estadisticas del jugador');
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return '-';
    const [year, month, day] = dateString.split('-');
    return `${day}/${month}/${year}`;
  };

  const getResultClass = (result) => {
    switch (result) {
      case 'Win': return 'result-win';
      case 'Loss': return 'result-loss';
      case 'Draw': return 'result-draw';
      default: return '';
    }
  };

  const getResultLabel = (result) => {
    switch (result) {
      case 'Win': return 'Victoria';
      case 'Loss': return 'Derrota';
      case 'Draw': return 'Empate';
      default: return result;
    }
  };

  if (loading) return <div className="player-detail-page"><div className="loading">Cargando...</div></div>;
  if (error) return <div className="player-detail-page"><div className="error-message">{error}</div></div>;
  if (!stats) return null;

  return (
    <div className="player-detail-page">
      <div className="page-header">
        <Link to="/players" className="back-button">← Volver a Jugadores</Link>
        <h1>{stats.name}</h1>
      </div>

      <div className="page-content">
        <div className="stats-grid">
          <div className="stat-card">
            <div className="stat-value">{stats.totalGames}</div>
            <div className="stat-label">Partidos</div>
          </div>
          <div className="stat-card stat-win">
            <div className="stat-value">{stats.wins}</div>
            <div className="stat-label">Victorias</div>
          </div>
          <div className="stat-card stat-loss">
            <div className="stat-value">{stats.losses}</div>
            <div className="stat-label">Derrotas</div>
          </div>
          <div className="stat-card stat-draw">
            <div className="stat-value">{stats.draws}</div>
            <div className="stat-label">Empates</div>
          </div>
          <div className="stat-card">
            <div className="stat-value">{stats.winRate}%</div>
            <div className="stat-label">% Victorias</div>
          </div>
        </div>

        {stats.topTeammates.length > 0 && (
          <div className="section">
            <h2>Companeros Mas Frecuentes</h2>
            <div className="teammates-list">
              {stats.topTeammates.map((tm) => (
                <div key={tm.playerId} className="teammate-item">
                  <Link to={`/players/${tm.playerId}`} className="teammate-name">
                    {tm.playerName}
                  </Link>
                  <span className="teammate-count">
                    {tm.gamesPlayedTogether} {tm.gamesPlayedTogether === 1 ? 'partido' : 'partidos'} juntos
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="section">
          <h2>Historial de Partidos</h2>
          {stats.recentMatches.length === 0 ? (
            <div className="empty-state">
              <p>No se encontraron partidos para este jugador.</p>
            </div>
          ) : (
            <div className="match-history">
              {stats.recentMatches.map((match) => (
                <div key={match.matchId} className="history-card">
                  <div className="history-header">
                    <span className="history-date">{formatDate(match.date)}</span>
                    <span className={`result-badge ${getResultClass(match.result)}`}>
                      {getResultLabel(match.result)}
                    </span>
                  </div>
                  <div className="history-details">
                    <span className="history-location">{match.locationName}</span>
                    <span className="history-team">
                      Equipo {match.teamColor === 'White' ? 'Blanco' : 'Negro'}
                    </span>
                  </div>
                  <div className="history-players">
                    <div className="history-teammates">
                      <strong>Companeros:</strong> {match.teammateNames.join(', ') || '-'}
                    </div>
                    <div className="history-opponents">
                      <strong>Rivales:</strong> {match.opponentNames.join(', ') || '-'}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default PlayerDetailPage;
