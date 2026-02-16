import apiClient from './apiClient';

// API service functions for Handballito Time
// Update these endpoints to match your .NET backend

export const apiService = {
  // Players endpoints
  async getPlayers() {
    try {
      const response = await apiClient.get('/players');
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  async getPlayerById(id) {
    try {
      const response = await apiClient.get(`/players/${id}`);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  async createPlayer(player) {
    try {
      const response = await apiClient.post('/players', player);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  async updatePlayer(id, player) {
    try {
      const response = await apiClient.put(`/players/${id}`, player);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  async deletePlayer(id) {
    try {
      const response = await apiClient.delete(`/players/${id}`);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  async getPlayerStats(id) {
    try {
      const response = await apiClient.get(`/players/${id}/stats`);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Locations endpoints
  async getLocations() {
    try {
      const response = await apiClient.get('/locations');
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  async getLocationById(id) {
    try {
      const response = await apiClient.get(`/locations/${id}`);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  async createLocation(location) {
    try {
      const response = await apiClient.post('/locations', location);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  async updateLocation(id, location) {
    try {
      const response = await apiClient.put(`/locations/${id}`, location);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  async deleteLocation(id) {
    try {
      const response = await apiClient.delete(`/locations/${id}`);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Matches endpoints
  async getMatches() {
    try {
      const response = await apiClient.get('/matches');
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  async getMatchById(id) {
    try {
      const response = await apiClient.get(`/matches/${id}`);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  async createMatch(match) {
    try {
      const response = await apiClient.post('/matches', match);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  async updateMatch(id, match) {
    try {
      const response = await apiClient.put(`/matches/${id}`, match);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  async deleteMatch(id) {
    try {
      const response = await apiClient.delete(`/matches/${id}`);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Stats endpoints
  async getLeaderboard() {
    try {
      const response = await apiClient.get('/stats/leaderboard');
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  async getMatchStats() {
    try {
      const response = await apiClient.get('/stats/matches');
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Health check endpoint
  async healthCheck() {
    try {
      const response = await apiClient.get('/health');
      return response.data;
    } catch (error) {
      throw error;
    }
  },
};

