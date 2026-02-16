import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  BarChart, Bar, LineChart, Line,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell
} from 'recharts';
import { apiService } from '../api/apiService';
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
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await apiService.getMatchStats();
      setData(result);
    } catch (err) {
      setError(err.message || 'Error al cargar las estadisticas');
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div className="stats-page"><div className="loading">Cargando...</div></div>;
  if (error) return <div className="stats-page"><div className="error-message">{error}</div></div>;
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
      </div>
    </div>
  );
}

export default StatsPage;
