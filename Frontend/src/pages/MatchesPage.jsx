import { useState, useEffect, useMemo } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { Skeleton, Loader, Collapse, TextInput, Select } from '@mantine/core';
import { notifications } from '@mantine/notifications';
import { apiService } from '../api/apiService';
import PlayerAvatar from '../components/PlayerAvatar';
import './MatchesPage.css';

function MatchesPage() {
  const [matches, setMatches] = useState([]);
  const [players, setPlayers] = useState([]);
  const [locations, setLocations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [deletingId, setDeletingId] = useState(null);
  const [settingResultId, setSettingResultId] = useState(null);
  const [search, setSearch] = useState('');
  const [resultFilter, setResultFilter] = useState('all');
  const [highlightedId, setHighlightedId] = useState(null);
  const [searchParams] = useSearchParams();
  const [formData, setFormData] = useState({
    date: '',
    locationId: '',
    whiteTeamPlayers: [],
    blackTeamPlayers: [],
  });

  useEffect(() => {
    fetchMatches();
    fetchPlayers();
    fetchLocations();
  }, []);

  useEffect(() => {
    const targetId = searchParams.get('highlight');
    if (!targetId || loading) return;
    if (!matches.some(m => m.id === targetId)) return;

    const el = document.querySelector(`[data-match-id="${targetId}"]`);
    if (!el) return;

    el.scrollIntoView({ behavior: 'smooth', block: 'center' });
    setHighlightedId(targetId);
    const timeout = setTimeout(() => setHighlightedId(null), 2000);
    return () => clearTimeout(timeout);
  }, [searchParams, matches, loading]);

  const filteredMatches = useMemo(() => {
    let result = matches;

    if (search.trim()) {
      const term = search.toLowerCase();
      result = result.filter(match => {
        const allPlayerIds = [
          ...(match.whiteTeam.playerIds || []),
          ...(match.blackTeam.playerIds || []),
        ];
        return allPlayerIds.some(pid => {
          const player = players.find(p => p.id === pid);
          return player && player.name.toLowerCase().includes(term);
        });
      });
    }

    if (resultFilter === 'pending') {
      result = result.filter(m => !m.winnerTeamId && !m.isDraw);
    } else if (resultFilter === 'decided') {
      result = result.filter(m => m.winnerTeamId || m.isDraw);
    } else if (resultFilter === 'draw') {
      result = result.filter(m => m.isDraw);
    }

    return result;
  }, [matches, players, search, resultFilter]);

  const fetchMatches = async () => {
    setLoading(true);
    try {
      const data = await apiService.getMatches();
      setMatches(data);
    } catch (err) {
      notifications.show({ title: 'Error', message: err.message || 'Error al cargar los partidos', color: 'red' });
    } finally {
      setLoading(false);
    }
  };

  const fetchPlayers = async () => {
    try {
      const data = await apiService.getPlayers();
      setPlayers(data);
    } catch (err) {
      console.error('Error fetching players:', err);
    }
  };

  const fetchLocations = async () => {
    try {
      const data = await apiService.getLocations();
      setLocations(data);
    } catch (err) {
      console.error('Error fetching locations:', err);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const togglePlayerInTeam = (playerId, team) => {
    setFormData(prev => {
      const teamKey = team === 'white' ? 'whiteTeamPlayers' : 'blackTeamPlayers';
      const otherTeamKey = team === 'white' ? 'blackTeamPlayers' : 'whiteTeamPlayers';

      const otherTeam = prev[otherTeamKey].filter(id => id !== playerId);
      const currentTeam = prev[teamKey].includes(playerId)
        ? prev[teamKey].filter(id => id !== playerId)
        : [...prev[teamKey], playerId];

      return {
        ...prev,
        [teamKey]: currentTeam,
        [otherTeamKey]: otherTeam,
      };
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.date) {
      notifications.show({ title: 'Error', message: 'La fecha es requerida', color: 'red' });
      return;
    }

    if (!formData.locationId) {
      notifications.show({ title: 'Error', message: 'La cancha es requerida', color: 'red' });
      return;
    }

    if (formData.whiteTeamPlayers.length === 0 && formData.blackTeamPlayers.length === 0) {
      notifications.show({ title: 'Error', message: 'Al menos un jugador debe ser asignado a un equipo', color: 'red' });
      return;
    }

    setSubmitting(true);
    try {
      await apiService.createMatch({
        date: formData.date,
        locationId: formData.locationId,
        whiteTeamPlayerIds: formData.whiteTeamPlayers,
        blackTeamPlayerIds: formData.blackTeamPlayers,
      });
      setFormData({
        date: '',
        locationId: '',
        whiteTeamPlayers: [],
        blackTeamPlayers: [],
      });
      setShowForm(false);
      notifications.show({ title: 'Listo', message: 'Partido creado exitosamente', color: 'green' });
      fetchMatches();
    } catch (err) {
      notifications.show({ title: 'Error', message: err.message || 'Error al crear el partido', color: 'red' });
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('¿Estás seguro de que deseas eliminar este partido?')) {
      return;
    }

    setDeletingId(id);
    try {
      await apiService.deleteMatch(id);
      notifications.show({ title: 'Listo', message: 'Partido eliminado', color: 'green' });
      fetchMatches();
    } catch (err) {
      notifications.show({ title: 'Error', message: err.message || 'Error al eliminar el partido', color: 'red' });
    } finally {
      setDeletingId(null);
    }
  };

  const setMatchResult = async (matchId, winnerTeamId, isDraw) => {
    setSettingResultId(matchId);
    try {
      const match = matches.find(m => m.id === matchId);
      await apiService.updateMatch(matchId, {
        date: match.date,
        winnerTeamId: isDraw ? null : winnerTeamId,
        isDraw: isDraw,
        locationId: null,
        whiteTeamPlayerIds: match.whiteTeam.playerIds,
        blackTeamPlayerIds: match.blackTeam.playerIds,
      });
      notifications.show({ title: 'Listo', message: 'Resultado registrado', color: 'green' });
      fetchMatches();
    } catch (err) {
      notifications.show({ title: 'Error', message: err.message || 'Error al actualizar el resultado', color: 'red' });
    } finally {
      setSettingResultId(null);
    }
  };

  const getPlayerName = (playerId) => {
    const player = players.find(p => p.id === playerId);
    if (!player) return 'Desconocido';
    return player.nickname ? `${player.name} "${player.nickname}"` : player.name;
  };

  const formatDate = (dateString) => {
    if (!dateString) return '-';
    const [year, month, day] = dateString.split('-');
    const date = new Date(year, month - 1, day);
    return date.toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  return (
    <div className="matches-page">
      <div className="page-header">
        <Link to="/" className="back-button">← Volver al Inicio</Link>
        <h1>Creación de Partidos</h1>
      </div>

      <div className="page-content">
        <div className="action-bar">
          <button
            className="primary-button"
            onClick={() => setShowForm(!showForm)}
          >
            {showForm ? 'Cancelar' : '+ Crear Nuevo Partido'}
          </button>
        </div>

        <Collapse in={showForm}>
          <div className="form-container">
            <h2>Crear Nuevo Partido</h2>
            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label htmlFor="date">Fecha *</label>
                <input
                  type="date"
                  id="date"
                  name="date"
                  value={formData.date}
                  onChange={handleInputChange}
                  required
                />
              </div>

              <div className="form-group">
                <label htmlFor="locationId">Cancha *</label>
                <select
                  id="locationId"
                  name="locationId"
                  value={formData.locationId}
                  onChange={handleInputChange}
                  required
                >
                  <option value="">Selecciona una cancha</option>
                  {locations.map((location) => (
                    <option key={location.id} value={location.id}>
                      {location.name} {location.city ? `- ${location.city}` : ''}
                    </option>
                  ))}
                </select>
              </div>

              <div className="teams-section">
                <div className="team-container">
                  <h3>Equipo Blanco</h3>
                  <div className="players-list">
                    {players.length === 0 ? (
                      <p className="no-players">No hay jugadores disponibles. Crea jugadores primero.</p>
                    ) : (
                      players.map((player) => (
                        <label key={player.id} className="player-checkbox">
                          <input
                            type="checkbox"
                            checked={formData.whiteTeamPlayers.includes(player.id)}
                            onChange={() => togglePlayerInTeam(player.id, 'white')}
                          />
                          <span>{player.name}</span>
                        </label>
                      ))
                    )}
                  </div>
                  <div className="team-summary">
                    Seleccionados: {formData.whiteTeamPlayers.length} jugador(es)
                  </div>
                </div>

                <div className="team-container">
                  <h3>Equipo Negro</h3>
                  <div className="players-list">
                    {players.length === 0 ? (
                      <p className="no-players">No hay jugadores disponibles. Crea jugadores primero.</p>
                    ) : (
                      players.map((player) => (
                        <label key={player.id} className="player-checkbox">
                          <input
                            type="checkbox"
                            checked={formData.blackTeamPlayers.includes(player.id)}
                            onChange={() => togglePlayerInTeam(player.id, 'black')}
                          />
                          <span>{player.name}</span>
                        </label>
                      ))
                    )}
                  </div>
                  <div className="team-summary">
                    Seleccionados: {formData.blackTeamPlayers.length} jugador(es)
                  </div>
                </div>
              </div>

              <button type="submit" className="submit-button" disabled={submitting}>
                {submitting ? <Loader size="xs" color="white" /> : 'Crear Partido'}
              </button>
            </form>
          </div>
        </Collapse>

        <div className="matches-list">
          <h2>Lista de Partidos</h2>

          {!loading && matches.length > 0 && (
            <div className="filter-bar">
              <TextInput
                placeholder="Buscar por jugador..."
                value={search}
                onChange={(e) => setSearch(e.currentTarget.value)}
                className="filter-search"
              />
              <Select
                placeholder="Filtrar resultado"
                value={resultFilter}
                onChange={setResultFilter}
                data={[
                  { value: 'all', label: 'Todos' },
                  { value: 'pending', label: 'Pendientes' },
                  { value: 'decided', label: 'Decididos' },
                  { value: 'draw', label: 'Empates' },
                ]}
                className="filter-select"
                allowDeselect={false}
              />
            </div>
          )}

          {loading ? (
            <div className="skeleton-grid">
              {[...Array(3)].map((_, i) => (
                <Skeleton key={i} height={200} radius="md" />
              ))}
            </div>
          ) : filteredMatches.length === 0 ? (
            <div className="empty-state">
              {matches.length === 0 ? (
                <>
                  <div className="empty-icon">⚽</div>
                  <p>No se encontraron partidos</p>
                  <button className="primary-button" onClick={() => setShowForm(true)}>
                    + Crear primer partido
                  </button>
                </>
              ) : (
                <p>No se encontraron partidos con los filtros aplicados</p>
              )}
            </div>
          ) : (
            <div className="matches-grid">
              {filteredMatches.map((match) => (
                <div
                  key={match.id}
                  data-match-id={match.id}
                  className={`match-card ${highlightedId === match.id ? 'highlighted' : ''}`}
                >
                  <div className="match-header">
                    <h3>
                      {formatDate(match.date)}
                      {match.isDraw && <span className="draw-badge">Empate</span>}
                    </h3>
                    <button
                      className="delete-button"
                      onClick={() => handleDelete(match.id)}
                      disabled={deletingId === match.id}
                    >
                      {deletingId === match.id ? <Loader size="xs" color="white" /> : 'Eliminar'}
                    </button>
                  </div>
                  <div className="match-details">
                    <p><strong>Cancha:</strong> {match.locationName}</p>
                    <div className="match-teams">
                      <div className={`team-info ${!match.isDraw && match.winnerTeamId === match.whiteTeam.id ? 'team-winner' : ''} ${match.isDraw ? 'team-draw' : ''}`}>
                        <strong>
                          Equipo Blanco
                          {!match.isDraw && match.winnerTeamId === match.whiteTeam.id && <span className="winner-badge">W</span>}
                        </strong>
                        {match.whiteTeam.playerIds && match.whiteTeam.playerIds.length > 0 ? (
                          <ul>
                            {match.whiteTeam.playerIds.map((playerId) => (
                              <li key={playerId} className="team-player-item"><PlayerAvatar player={players.find(p => p.id === playerId)} size={20} />{getPlayerName(playerId)}</li>
                            ))}
                          </ul>
                        ) : (
                          <p>No hay jugadores asignados</p>
                        )}
                      </div>
                      <div className={`team-info ${!match.isDraw && match.winnerTeamId === match.blackTeam.id ? 'team-winner' : ''} ${match.isDraw ? 'team-draw' : ''}`}>
                        <strong>
                          Equipo Negro
                          {!match.isDraw && match.winnerTeamId === match.blackTeam.id && <span className="winner-badge">W</span>}
                        </strong>
                        {match.blackTeam.playerIds && match.blackTeam.playerIds.length > 0 ? (
                          <ul>
                            {match.blackTeam.playerIds.map((playerId) => (
                              <li key={playerId} className="team-player-item"><PlayerAvatar player={players.find(p => p.id === playerId)} size={20} />{getPlayerName(playerId)}</li>
                            ))}
                          </ul>
                        ) : (
                          <p>No hay jugadores asignados</p>
                        )}
                      </div>
                    </div>
                    {!match.winnerTeamId && !match.isDraw && (
                      <div className="result-actions">
                        {settingResultId === match.id ? (
                          <Loader size="sm" color="blue" />
                        ) : (
                          <>
                            <button onClick={() => setMatchResult(match.id, match.whiteTeam.id, false)}>Blanco gana</button>
                            <button onClick={() => setMatchResult(match.id, match.blackTeam.id, false)}>Negro gana</button>
                            <button onClick={() => setMatchResult(match.id, null, true)}>Empate</button>
                          </>
                        )}
                      </div>
                    )}
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

export default MatchesPage;
