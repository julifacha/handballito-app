import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Skeleton, Loader, Collapse } from '@mantine/core';
import { notifications } from '@mantine/notifications';
import { apiService } from '../api/apiService';
import './LocationsPage.css';

function LocationsPage() {
  const [locations, setLocations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [deletingId, setDeletingId] = useState(null);
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
    try {
      const data = await apiService.getLocations();
      setLocations(data);
    } catch (err) {
      notifications.show({ title: 'Error', message: err.message || 'Error al cargar las canchas', color: 'red' });
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

    if (!formData.name.trim()) {
      notifications.show({ title: 'Error', message: 'El nombre de la cancha es requerido', color: 'red' });
      return;
    }

    setSubmitting(true);
    try {
      await apiService.createLocation(formData);
      setFormData({ name: '', address: '', city: '' });
      setShowForm(false);
      notifications.show({ title: 'Listo', message: 'Cancha creada exitosamente', color: 'green' });
      fetchLocations();
    } catch (err) {
      notifications.show({ title: 'Error', message: err.message || 'Error al crear la cancha', color: 'red' });
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('¿Estás seguro de que deseas eliminar esta cancha?')) {
      return;
    }

    setDeletingId(id);
    try {
      await apiService.deleteLocation(id);
      notifications.show({ title: 'Listo', message: 'Cancha eliminada', color: 'green' });
      fetchLocations();
    } catch (err) {
      notifications.show({ title: 'Error', message: err.message || 'Error al eliminar la cancha', color: 'red' });
    } finally {
      setDeletingId(null);
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

        <Collapse in={showForm}>
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

              <button type="submit" className="submit-button" disabled={submitting}>
                {submitting ? <Loader size="xs" color="white" /> : 'Crear Cancha'}
              </button>
            </form>
          </div>
        </Collapse>

        <div className="locations-list">
          <h2>Lista de Canchas</h2>
          {loading ? (
            <div className="skeleton-table">
              {[...Array(4)].map((_, i) => (
                <Skeleton key={i} height={40} radius="sm" mb="sm" />
              ))}
            </div>
          ) : locations.length === 0 ? (
            <div className="empty-state">
              <div className="empty-icon">📍</div>
              <p>No se encontraron canchas</p>
              <button className="primary-button" onClick={() => setShowForm(true)}>
                + Crear primera cancha
              </button>
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
                          disabled={deletingId === location.id}
                        >
                          {deletingId === location.id ? <Loader size="xs" color="white" /> : 'Eliminar'}
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
