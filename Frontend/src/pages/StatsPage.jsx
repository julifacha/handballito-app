import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  BarChart, Bar, LineChart, Line,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell
} from 'recharts';
import { Skeleton, Select, Loader } from '@mantine/core';
import { notifications } from '@mantine/notifications';
import { apiService } from '../api/apiService';
import PlayerAvatar from '../components/PlayerAvatar';
import './StatsPage.css';

const CHART_COLORS = {
  primary: '#646cff',
  secondary: '#535bf2',
  green: '#4caf50',
  grid: 'rgba(255, 255, 255, 0.1)',
  text: 'rgba(255, 255, 255, 0.6)',
};

function StatsPage() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [players, setPlayers] = useState([]);
  const [h2hPlayer1, setH2hPlayer1] = useState(null);
  const [h2hPlayer2, setH2hPlayer2] = useState(null);
  const [h2hData, setH2hData] = useState(null);
  const [h2hLoading, setH2hLoading] = useState(false);

  useEffect(() => {
    fetchStats();
    fetchPlayers();
  }, []);

  useEffect(() => {
    if (h2hPlayer1 && h2hPlayer2) {
      fetchHeadToHead();
    } else {
      setH2hData(null);
    }
  }, [h2hPlayer1, h2hPlayer2]);

  const fetchStats = async () => {
    setLoading(true);
    try {
      const result = await apiService.getMatchStats();
      setData(result);
    } catch (err) {
      notifications.show({ title: 'Error', message: err.message || 'Error al cargar las estadisticas', color: 'red' });
    } finally {
      setLoading(false);
    }
  };

  const fetchPlayers = async () => {
    try {
      const result = await apiService.getPlayers();
      setPlayers(result);
    } catch (err) {
      console.error('Error fetching players:', err);
    }
  };

  const fetchHeadToHead = async () => {
    setH2hLoading(true);
    setH2hData(null);
    try {
      const result = await apiService.getHeadToHead(h2hPlayer1, h2hPlayer2);
      setH2hData(result);
    } catch (err) {
      if (err.response?.status !== 404) {
        notifications.show({ title: 'Error', message: 'Error al cargar cabeza a cabeza', color: 'red' });
      }
    } finally {
      setH2hLoading(false);
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return '-';
    const [year, month, day] = dateString.split('-');
    return `${day}/${month}/${year}`;
  };

  const getResultLabel = (result) => {
    switch (result) {
      case 'Win': return 'Victoria';
      case 'Loss': return 'Derrota';
      case 'Draw': return 'Empate';
      default: return result;
    }
  };

  const playerOptions = players.map(p => ({
    value: p.id,
    label: p.nickname ? `${p.name} "${p.nickname}"` : p.name,
  }));

  if (loading) {
    return (
      <div className="stats-page">
        <div className="page-header">
          <Link to="/" className="back-button">← Volver al Inicio</Link>
          <h1>Estadisticas</h1>
        </div>
        <div className="page-content">
          <div className="chart-section">
            <Skeleton height={28} width="30%" mb="md" />
            <Skeleton height={250} radius="md" />
          </div>
          <div className="chart-section">
            <Skeleton height={28} width="30%" mb="md" />
            <Skeleton height={300} radius="md" />
          </div>
          <div className="chart-section">
            <Skeleton height={28} width="30%" mb="md" />
            <Skeleton height={300} radius="md" />
          </div>
        </div>
      </div>
    );
  }

  if (!data) return null;

  const pairData = data.topPairs.map(p => ({
    name: `${p.player1Name} + ${p.player2Name}`,
    winRate: p.winRate,
    games: p.gamesPlayed,
    wins: p.wins,
  }));

  return (
    <div className="stats-page">
      <div className="page-header">
        <Link to="/" className="back-button">← Volver al Inicio</Link>
        <h1>Estadisticas</h1>
      </div>

      <div className="page-content">
        {/* Top Pairs */}
        <div className="chart-section">
          <h2>Mejores Duplas</h2>
          <p className="section-note">Minimo 2 partidos juntos</p>
          {pairData.length === 0 ? (
            <div className="empty-state"><p>No hay suficientes datos aun.</p></div>
          ) : (
            <div className="chart-container">
              <ResponsiveContainer width="100%" height={pairData.length * 50 + 40}>
                <BarChart data={pairData} layout="vertical" margin={{ left: 20, right: 30, top: 5, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke={CHART_COLORS.grid} horizontal={false} />
                  <XAxis type="number" domain={[0, 100]} tick={{ fill: CHART_COLORS.text, fontSize: 12 }} tickFormatter={v => `${v}%`} />
                  <YAxis type="category" dataKey="name" tick={{ fill: CHART_COLORS.text, fontSize: 12 }} width={150} />
                  <Tooltip
                    contentStyle={{ background: '#1a1a2e', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 8 }}
                    labelStyle={{ color: '#fff' }}
                    itemStyle={{ color: '#fff' }}
                    formatter={(value, name, props) => [`${value}% (${props.payload.wins}/${props.payload.games})`, '% Victorias']}
                  />
                  <Bar dataKey="winRate" radius={[0, 4, 4, 0]}>
                    {pairData.map((_, i) => (
                      <Cell key={i} fill={i === 0 ? CHART_COLORS.green : CHART_COLORS.primary} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}
        </div>

        {/* Games Over Time */}
        <div className="chart-section">
          <h2>Partidos por Mes</h2>
          {data.gamesOverTime.length === 0 ? (
            <div className="empty-state"><p>No hay suficientes datos aun.</p></div>
          ) : (
            <div className="chart-container">
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={data.gamesOverTime} margin={{ left: 0, right: 20, top: 5, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke={CHART_COLORS.grid} />
                  <XAxis dataKey="month" tick={{ fill: CHART_COLORS.text, fontSize: 12 }} />
                  <YAxis allowDecimals={false} tick={{ fill: CHART_COLORS.text, fontSize: 12 }} />
                  <Tooltip
                    contentStyle={{ background: '#1a1a2e', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 8 }}
                    labelStyle={{ color: '#fff' }}
                    formatter={(value) => [value, 'Partidos']}
                  />
                  <Line
                    type="monotone"
                    dataKey="gamesCount"
                    stroke={CHART_COLORS.primary}
                    strokeWidth={2}
                    dot={{ fill: CHART_COLORS.primary, r: 4 }}
                    activeDot={{ r: 6 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          )}
        </div>

        {/* Location Breakdown */}
        <div className="chart-section">
          <h2>Partidos por Cancha</h2>
          {data.locationBreakdown.length === 0 ? (
            <div className="empty-state"><p>No hay suficientes datos aun.</p></div>
          ) : (
            <div className="chart-container">
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={data.locationBreakdown} margin={{ left: 0, right: 20, top: 5, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke={CHART_COLORS.grid} />
                  <XAxis dataKey="locationName" tick={{ fill: CHART_COLORS.text, fontSize: 12 }} />
                  <YAxis allowDecimals={false} tick={{ fill: CHART_COLORS.text, fontSize: 12 }} />
                  <Tooltip
                    contentStyle={{ background: '#1a1a2e', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 8 }}
                    labelStyle={{ color: '#fff' }}
                    formatter={(value) => [value, 'Partidos']}
                  />
                  <Bar dataKey="gamesCount" fill={CHART_COLORS.primary} radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}
        </div>

        {/* Head-to-Head */}
        <div className="chart-section">
          <h2>Cabeza a Cabeza</h2>
          <div className="h2h-selectors">
            <Select
              placeholder="Jugador 1"
              value={h2hPlayer1}
              onChange={setH2hPlayer1}
              data={playerOptions.filter(p => p.value !== h2hPlayer2)}
              searchable
              clearable
              className="h2h-select"
            />
            <span className="h2h-vs">VS</span>
            <Select
              placeholder="Jugador 2"
              value={h2hPlayer2}
              onChange={setH2hPlayer2}
              data={playerOptions.filter(p => p.value !== h2hPlayer1)}
              searchable
              clearable
              className="h2h-select"
            />
          </div>

          {h2hLoading && (
            <div className="h2h-loading"><Loader size="sm" color="blue" /></div>
          )}

          {!h2hLoading && h2hPlayer1 && h2hPlayer2 && !h2hData && (
            <div className="empty-state"><p>No se encontraron partidos entre estos jugadores como rivales.</p></div>
          )}

          {h2hData && (
            <div className="h2h-result">
              <div className="h2h-players">
                <div className="h2h-player">
                  <PlayerAvatar player={players.find(p => p.id === h2hData.player1Id)} size={48} />
                  <span className="h2h-player-name">{h2hData.player1Name}</span>
                </div>
                <div className="h2h-score">
                  <span className="h2h-wins">{h2hData.player1Wins}</span>
                  <span className="h2h-draws">{h2hData.draws > 0 ? `${h2hData.draws}E` : ''}</span>
                  <span className="h2h-wins">{h2hData.player2Wins}</span>
                </div>
                <div className="h2h-player">
                  <PlayerAvatar player={players.find(p => p.id === h2hData.player2Id)} size={48} />
                  <span className="h2h-player-name">{h2hData.player2Name}</span>
                </div>
              </div>

              <div className="h2h-bar">
                {h2hData.player1Wins > 0 && (
                  <div className="h2h-bar-p1" style={{ flex: h2hData.player1Wins }}>
                    {h2hData.player1WinRate}%
                  </div>
                )}
                {h2hData.draws > 0 && (
                  <div className="h2h-bar-draw" style={{ flex: h2hData.draws }}>
                    {Math.round(h2hData.draws / h2hData.totalGames * 100)}%
                  </div>
                )}
                {h2hData.player2Wins > 0 && (
                  <div className="h2h-bar-p2" style={{ flex: h2hData.player2Wins }}>
                    {h2hData.player2WinRate}%
                  </div>
                )}
              </div>

              <div className="h2h-total">{h2hData.totalGames} {h2hData.totalGames === 1 ? 'partido' : 'partidos'} como rivales</div>

              {h2hData.recentMatches.length > 0 && (
                <div className="h2h-matches">
                  <h3>Historial</h3>
                  {h2hData.recentMatches.map(m => (
                    <div key={m.matchId} className="h2h-match-item">
                      <span className="h2h-match-date">{formatDate(m.date)}</span>
                      <span className={`h2h-match-result ${m.result === 'Win' ? 'result-win' : m.result === 'Loss' ? 'result-loss' : 'result-draw'}`}>
                        {getResultLabel(m.result)}
                      </span>
                      <span className="h2h-match-location">{m.locationName}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default StatsPage;
