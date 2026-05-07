import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Skeleton } from '@mantine/core';
import { notifications } from '@mantine/notifications';
import { apiService } from '../api/apiService';
import './PlayerDetailPage.css';

function PlayerDetailPage() {
  const { id } = useParams();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchPlayerStats();
  }, [id]);

  const fetchPlayerStats = async () => {
    setLoading(true);
    try {
      const data = await apiService.getPlayerStats(id);
      setStats(data);
    } catch (err) {
      notifications.show({ title: 'Error', message: err.message || 'Error al cargar las estadisticas del jugador', color: 'red' });
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
      case 'Pending': return 'result-pending';
      default: return '';
    }
  };

  const getResultLabel = (result) => {
    switch (result) {
      case 'Win': return 'Victoria';
      case 'Loss': return 'Derrota';
      case 'Draw': return 'Empate';
      case 'Pending': return 'Sin resultado';
      default: return result;
    }
  };

  if (loading) {
    return (
      <div className="player-detail-page">
        <div className="page-header">
          <Link to="/players" className="back-button">← Volver a Jugadores</Link>
          <Skeleton height={36} width="30%" />
        </div>
        <div className="page-content">
          <div className="stats-grid">
            {[...Array(5)].map((_, i) => (
              <Skeleton key={i} height={80} radius="md" />
            ))}
          </div>
          <div className="section">
            <Skeleton height={28} width="40%" mb="md" />
            {[...Array(3)].map((_, i) => (
              <Skeleton key={i} height={60} radius="md" mb="sm" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (!stats) return null;

  return (
    <div className="player-detail-page">
      <div className="page-header">
        <Link to="/players" className="back-button">← Volver a Jugadores</Link>
        <div className="player-header">
          {stats.avatarUrl ? (
            <img src={stats.avatarUrl} alt={stats.nickname || stats.name} className="player-avatar" />
          ) : (
            <div className="player-avatar-placeholder">
              {(stats.nickname || stats.name).charAt(0).toUpperCase()}
            </div>
          )}
          <div className="player-header-info">
            <h1>{stats.name}{stats.nickname && ` "${stats.nickname}"`}</h1>
          </div>
        </div>
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
                  <div className="teammate-stats">
                    <span className="teammate-count">
                      {tm.gamesPlayedTogether} {tm.gamesPlayedTogether === 1 ? 'partido' : 'partidos'}
                    </span>
                    <span className="teammate-record">
                      <span className="rec-win">{tm.wins}V</span>
                      {' / '}
                      <span className="rec-draw">{tm.draws}E</span>
                      {' / '}
                      <span className="rec-loss">{tm.losses}D</span>
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="section">
          <h2>Historial de Partidos</h2>
          {stats.recentMatches.length === 0 ? (
            <div className="empty-state">
              <div className="empty-icon">⚽</div>
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
