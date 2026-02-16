import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { apiService } from '../api/apiService';
import './PlayersPage.css';

function PlayersPage() {
  const [players, setPlayers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
  });

  useEffect(() => {
    fetchPlayers();
  }, []);

  const fetchPlayers = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await apiService.getPlayers();
      setPlayers(data);
    } catch (err) {
      setError(err.message || 'Error al cargar los jugadores');
      console.error('Error fetching players:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    
    if (!formData.name.trim()) {
      setError('El nombre del jugador es requerido');
      return;
    }

    try {
      await apiService.createPlayer(formData);
      setFormData({ name: '' });
      setShowForm(false);
      await fetchPlayers(); // Refresh the list
    } catch (err) {
      setError(err.message || 'Error al crear el jugador');
      console.error('Error creating player:', err);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('¿Estás seguro de que deseas eliminar este jugador?')) {
      return;
    }

    try {
      await apiService.deletePlayer(id);
      fetchPlayers(); // Refresh the list
    } catch (err) {
      setError(err.message || 'Error al eliminar el jugador');
      console.error('Error deleting player:', err);
    }
  };

  return (
    <div className="players-page">
      <div className="page-header">
        <Link to="/" className="back-button">← Volver al Inicio</Link>
        <h1>Gestión de Jugadores</h1>
      </div>

      <div className="page-content">
        <div className="action-bar">
          <button 
            className="primary-button" 
            onClick={() => setShowForm(!showForm)}
          >
            {showForm ? 'Cancelar' : '+ Agregar Nuevo Jugador'}
          </button>
        </div>

        {error && (
          <div className="error-message">
            <strong>Error:</strong> {error}
          </div>
        )}

        {showForm && (
          <div className="form-container">
            <h2>Crear Nuevo Jugador</h2>
            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label htmlFor="name">Nombre *</label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  required
                  placeholder="Ingresa el nombre del jugador"
                />
              </div>

              <button type="submit" className="submit-button">
                Crear Jugador
              </button>
            </form>
          </div>
        )}

        <div className="players-list">
          <h2>Lista de Jugadores</h2>
          {loading ? (
            <div className="loading">Cargando jugadores...</div>
          ) : players.length === 0 ? (
            <div className="empty-state">
              <p>No se encontraron jugadores. ¡Crea tu primer jugador!</p>
            </div>
          ) : (
            <div className="table-container">
              <table>
                <thead>
                  <tr>
                    <th>Nombre</th>
                    <th>Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {players.map((player) => (
                    <tr key={player.id}>
                      <td><Link to={`/players/${player.id}`}>{player.name}</Link></td>
                      <td>
                        <button
                          className="delete-button"
                          onClick={() => handleDelete(player.id)}
                        >
                          Eliminar
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default PlayersPage;

