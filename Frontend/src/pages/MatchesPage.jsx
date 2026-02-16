import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { apiService } from '../api/apiService';
import './MatchesPage.css';

function MatchesPage() {
  const [matches, setMatches] = useState([]);
  const [players, setPlayers] = useState([]);
  const [locations, setLocations] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [showForm, setShowForm] = useState(false);
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

  const fetchMatches = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await apiService.getMatches();
      setMatches(data);
    } catch (err) {
      setError(err.message || 'Error al cargar los partidos');
      console.error('Error fetching matches:', err);
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
      
      // Remove from other team if present
      const otherTeam = prev[otherTeamKey].filter(id => id !== playerId);
      
      // Toggle in current team
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
    setError(null);
    
    if (!formData.date) {
      setError('La fecha es requerida');
      return;
    }

    if (!formData.locationId) {
      setError('La cancha es requerida');
      return;
    }

    if (formData.whiteTeamPlayers.length === 0 && formData.blackTeamPlayers.length === 0) {
      setError('Al menos un jugador debe ser asignado a un equipo');
      return;
    }

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
      fetchMatches(); // Refresh the list
    } catch (err) {
      setError(err.message || 'Error al crear el partido');
      console.error('Error creating match:', err);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('¿Estás seguro de que deseas eliminar este partido?')) {
      return;
    }

    try {
      await apiService.deleteMatch(id);
      fetchMatches(); // Refresh the list
    } catch (err) {
      setError(err.message || 'Error al eliminar el partido');
      console.error('Error deleting match:', err);
    }
  };

  const getPlayerName = (playerId) => {
    const player = players.find(p => p.id === playerId);
    return player ? player.name : 'Desconocido';
  };

  const formatDate = (dateString) => {
    if (!dateString) return '-';

    const [year, month, day] = dateString.split('-');
    const date = new Date(year, month - 1, day); // local time

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

        {error && (
          <div className="error-message">
            <strong>Error:</strong> {error}
          </div>
        )}

        {showForm && (
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

              <button type="submit" className="submit-button">
                Crear Partido
              </button>
            </form>
          </div>
        )}

        <div className="matches-list">
          <h2>Lista de Partidos</h2>
          {loading ? (
            <div className="loading">Cargando partidos...</div>
          ) : matches.length === 0 ? (
            <div className="empty-state">
              <p>No se encontraron partidos. ¡Crea tu primer partido!</p>
            </div>
          ) : (
            <div className="matches-grid">
              {matches.map((match) => (
                <div key={match.id} className="match-card">
                  <div className="match-header">
                    <h3>{formatDate(match.date)}</h3>
                    <button
                      className="delete-button"
                      onClick={() => handleDelete(match.id)}
                    >
                      Eliminar
                    </button>
                  </div>
                  <div className="match-details">
                    <p><strong>Cancha:</strong> {match.locationName}</p>
                    <div className="match-teams">
                      <div className={`team-info ${match.winnerTeamId === match.whiteTeam.id ? 'team-winner' : ''}`}>
                        <strong>
                          Equipo Blanco
                          {match.winnerTeamId === match.whiteTeam.id && <span className="winner-badge">W</span>}
                        </strong>
                        {match.whiteTeam.playerIds && match.whiteTeam.playerIds.length > 0 ? (
                          <ul>
                            {match.whiteTeam.playerIds.map((playerId) => (
                              <li key={playerId}>{getPlayerName(playerId)}</li>
                            ))}
                          </ul>
                        ) : (
                          <p>No hay jugadores asignados</p>
                        )}
                      </div>
                      <div className={`team-info ${match.winnerTeamId === match.blackTeam.id ? 'team-winner' : ''}`}>
                        <strong>
                          Equipo Negro
                          {match.winnerTeamId === match.blackTeam.id && <span className="winner-badge">W</span>}
                        </strong>
                        {match.blackTeam.playerIds && match.blackTeam.playerIds.length > 0 ? (
                          <ul>
                            {match.blackTeam.playerIds.map((playerId) => (
                              <li key={playerId}>{getPlayerName(playerId)}</li>
                            ))}
                          </ul>
                        ) : (
                          <p>No hay jugadores asignados</p>
                        )}
                      </div>
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

export default MatchesPage;

