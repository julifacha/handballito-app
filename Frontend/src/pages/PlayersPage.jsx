import { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { Skeleton, Loader, Collapse, TextInput } from '@mantine/core';
import { notifications } from '@mantine/notifications';
import { apiService } from '../api/apiService';
import PlayerAvatar from '../components/PlayerAvatar';
import './PlayersPage.css';

function PlayersPage() {
  const [players, setPlayers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [deletingId, setDeletingId] = useState(null);
  const [search, setSearch] = useState('');
  const [formData, setFormData] = useState({
    name: '',
    nickname: '',
  });
  const [editingPlayer, setEditingPlayer] = useState(null);
  const [showEditForm, setShowEditForm] = useState(false);
  const [editFormData, setEditFormData] = useState({
    name: '',
    nickname: '',
  });

  useEffect(() => {
    fetchPlayers();
  }, []);

  const filteredPlayers = useMemo(() => {
    if (!search.trim()) return players;
    const q = search.toLowerCase();
    return players.filter(p =>
      p.name.toLowerCase().includes(q) ||
      (p.nickname && p.nickname.toLowerCase().includes(q))
    );
  }, [players, search]);

  const fetchPlayers = async () => {
    setLoading(true);
    try {
      const data = await apiService.getPlayers();
      setPlayers(data);
    } catch (err) {
      notifications.show({ title: 'Error', message: err.message || 'Error al cargar los jugadores', color: 'red' });
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
      notifications.show({ title: 'Error', message: 'El nombre del jugador es requerido', color: 'red' });
      return;
    }

    setSubmitting(true);
    try {
      await apiService.createPlayer({
        name: formData.name,
        nickname: formData.nickname || null,
      });
      setFormData({ name: '', nickname: '' });
      setShowForm(false);
      notifications.show({ title: 'Listo', message: 'Jugador creado exitosamente', color: 'green' });
      await fetchPlayers();
    } catch (err) {
      notifications.show({ title: 'Error', message: err.message || 'Error al crear el jugador', color: 'red' });
    } finally {
      setSubmitting(false);
    }
  };

  const handleEditClick = (player) => {
    setEditingPlayer(player);
    setEditFormData({
      name: player.name,
      nickname: player.nickname || '',
    });
    setShowEditForm(true);
  };

  const handleEditInputChange = (e) => {
    const { name, value } = e.target;
    setEditFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();

    if (!editFormData.name.trim()) {
      notifications.show({ title: 'Error', message: 'El nombre del jugador es requerido', color: 'red' });
      return;
    }

    setSubmitting(true);
    try {
      await apiService.updatePlayer(editingPlayer.id, {
        name: editFormData.name,
        nickname: editFormData.nickname || null,
        avatarUrl: editingPlayer.avatarUrl || null,
      });
      setShowEditForm(false);
      setEditingPlayer(null);
      notifications.show({ title: 'Listo', message: 'Jugador actualizado exitosamente', color: 'green' });
      await fetchPlayers();
    } catch (err) {
      notifications.show({ title: 'Error', message: err.message || 'Error al actualizar el jugador', color: 'red' });
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('¿Estás seguro de que deseas eliminar este jugador?')) {
      return;
    }

    setDeletingId(id);
    try {
      await apiService.deletePlayer(id);
      notifications.show({ title: 'Listo', message: 'Jugador eliminado', color: 'green' });
      fetchPlayers();
    } catch (err) {
      notifications.show({ title: 'Error', message: err.message || 'Error al eliminar el jugador', color: 'red' });
    } finally {
      setDeletingId(null);
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

        <Collapse in={showForm}>
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

              <div className="form-group">
                <label htmlFor="nickname">Apodo (opcional)</label>
                <input
                  type="text"
                  id="nickname"
                  name="nickname"
                  value={formData.nickname}
                  onChange={handleInputChange}
                  placeholder="Ej: Nano Banana"
                />
              </div>

              <button type="submit" className="submit-button" disabled={submitting}>
                {submitting ? <Loader size="xs" color="white" /> : 'Crear Jugador'}
              </button>
            </form>
          </div>
        </Collapse>

        <Collapse in={showEditForm}>
          <div className="form-container">
            <h2>Editar Jugador</h2>
            <form onSubmit={handleEditSubmit}>
              <div className="form-group">
                <label htmlFor="edit-name">Nombre *</label>
                <input
                  type="text"
                  id="edit-name"
                  name="name"
                  value={editFormData.name}
                  onChange={handleEditInputChange}
                  required
                  placeholder="Ingresa el nombre del jugador"
                />
              </div>

              <div className="form-group">
                <label htmlFor="edit-nickname">Apodo (opcional)</label>
                <input
                  type="text"
                  id="edit-nickname"
                  name="nickname"
                  value={editFormData.nickname}
                  onChange={handleEditInputChange}
                  placeholder="Ej: Nano Banana"
                />
              </div>

              <div className="form-actions">
                <button type="submit" className="submit-button" disabled={submitting}>
                  {submitting ? <Loader size="xs" color="white" /> : 'Guardar Cambios'}
                </button>
                <button type="button" className="cancel-button" onClick={() => { setShowEditForm(false); setEditingPlayer(null); }}>
                  Cancelar
                </button>
              </div>
            </form>
          </div>
        </Collapse>

        <div className="players-list">
          <h2>Lista de Jugadores</h2>

          {!loading && players.length > 0 && (
            <TextInput
              placeholder="Buscar jugador..."
              value={search}
              onChange={(e) => setSearch(e.currentTarget.value)}
              className="search-input"
              mb="md"
            />
          )}

          {loading ? (
            <div className="skeleton-table">
              {[...Array(5)].map((_, i) => (
                <Skeleton key={i} height={40} radius="sm" mb="sm" />
              ))}
            </div>
          ) : filteredPlayers.length === 0 ? (
            <div className="empty-state">
              {players.length === 0 ? (
                <>
                  <div className="empty-icon">👥</div>
                  <p>No se encontraron jugadores</p>
                  <button className="primary-button" onClick={() => setShowForm(true)}>
                    + Crear primer jugador
                  </button>
                </>
              ) : (
                <p>No se encontraron jugadores con "{search}"</p>
              )}
            </div>
          ) : (
            <div className="table-container">
              <table>
                <thead>
                  <tr>
                    <th>Nombre</th>
                    <th>Apodo</th>
                    <th>Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredPlayers.map((player) => (
                    <tr key={player.id}>
                      <td><Link to={`/players/${player.id}`} className="player-name-cell"><PlayerAvatar player={player} size={28} />{player.name}</Link></td>
                      <td>{player.nickname ? `"${player.nickname}"` : '—'}</td>
                      <td>
                        <button
                          className="edit-button"
                          onClick={() => handleEditClick(player)}
                        >
                          Editar
                        </button>
                        <button
                          className="delete-button"
                          onClick={() => handleDelete(player.id)}
                          disabled={deletingId === player.id}
                        >
                          {deletingId === player.id ? <Loader size="xs" color="white" /> : 'Eliminar'}
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
