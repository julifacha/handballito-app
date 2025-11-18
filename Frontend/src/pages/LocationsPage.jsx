import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { apiService } from '../api/apiService';
import './LocationsPage.css';

function LocationsPage() {
  const [locations, setLocations] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    address: '',
    city: '',
  });

  useEffect(() => {
    fetchLocations();
  }, []);

  const fetchLocations = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await apiService.getLocations();
      setLocations(data);
    } catch (err) {
      setError(err.message || 'Error al cargar las canchas');
      console.error('Error fetching locations:', err);
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
      setError('El nombre de la cancha es requerido');
      return;
    }

    try {
      await apiService.createLocation(formData);
      setFormData({ name: '', address: '', city: '' });
      setShowForm(false);
      fetchLocations(); // Refresh the list
    } catch (err) {
      setError(err.message || 'Error al crear la cancha');
      console.error('Error creating location:', err);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('¿Estás seguro de que deseas eliminar esta cancha?')) {
      return;
    }

    try {
      await apiService.deleteLocation(id);
      fetchLocations(); // Refresh the list
    } catch (err) {
      setError(err.message || 'Error al eliminar la cancha');
      console.error('Error deleting location:', err);
    }
  };

  return (
    <div className="locations-page">
      <div className="page-header">
        <Link to="/" className="back-button">← Volver al Inicio</Link>
        <h1>Gestión de Canchas</h1>
      </div>

      <div className="page-content">
        <div className="action-bar">
          <button 
            className="primary-button" 
            onClick={() => setShowForm(!showForm)}
          >
            {showForm ? 'Cancelar' : '+ Agregar Nueva Cancha'}
          </button>
        </div>

        {error && (
          <div className="error-message">
            <strong>Error:</strong> {error}
          </div>
        )}

        {showForm && (
          <div className="form-container">
            <h2>Crear Nueva Cancha</h2>
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
                  placeholder="Ingresa el nombre de la cancha"
                />
              </div>

              <div className="form-group">
                <label htmlFor="address">Dirección</label>
                <input
                  type="text"
                  id="address"
                  name="address"
                  value={formData.address}
                  onChange={handleInputChange}
                  placeholder="Ingresa la dirección"
                />
              </div>

              <div className="form-group">
                <label htmlFor="city">Ciudad</label>
                <input
                  type="text"
                  id="city"
                  name="city"
                  value={formData.city}
                  onChange={handleInputChange}
                  placeholder="Ingresa la ciudad"
                />
              </div>

              <button type="submit" className="submit-button">
                Crear Cancha
              </button>
            </form>
          </div>
        )}

        <div className="locations-list">
          <h2>Lista de Canchas</h2>
          {loading ? (
            <div className="loading">Cargando canchas...</div>
          ) : locations.length === 0 ? (
            <div className="empty-state">
              <p>No se encontraron canchas. ¡Crea tu primera cancha!</p>
            </div>
          ) : (
            <div className="table-container">
              <table>
                <thead>
                  <tr>
                    <th>Nombre</th>
                    <th>Dirección</th>
                    <th>Ciudad</th>
                    <th>Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {locations.map((location) => (
                    <tr key={location.id}>
                      <td>{location.name}</td>
                      <td>{location.address || '-'}</td>
                      <td>{location.city || '-'}</td>
                      <td>
                        <button
                          className="delete-button"
                          onClick={() => handleDelete(location.id)}
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

export default LocationsPage;

