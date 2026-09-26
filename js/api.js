/**
 * MyPet API Client
 * Facilitates RESTful communication with the Python Flask & SQLite backend.
 * Provides live synchronization for pets, health vaults, activities, and physical tag orders.
 */

(function(root) {
  'use strict';

  const API_BASE = '/api';

  const ApiClient = {
    isServerAvailable: true,

    async request(endpoint, options = {}) {
      const url = `${API_BASE}${endpoint}`;
      const defaultHeaders = {
        'Accept': 'application/json',
        'Content-Type': 'application/json'
      };

      try {
        const response = await fetch(url, {
          ...options,
          headers: {
            ...defaultHeaders,
            ...(options.headers || {})
          }
        });

        if (!response.ok) {
          const errData = await response.json().catch(() => ({}));
          throw new Error(errData.error || `HTTP ${response.status}: ${response.statusText}`);
        }

        ApiClient.isServerAvailable = true;
        return await response.json();
      } catch (err) {
        console.warn(`[ApiClient] Request to ${endpoint} failed:`, err.message);
        throw err;
      }
    },

    // =========================================================================
    // SYSTEM & DATABASE HEALTH
    // =========================================================================
    async checkDatabaseHealth() {
      try {
        const res = await ApiClient.request('/health');
        ApiClient.isServerAvailable = true;
        return res;
      } catch (err) {
        ApiClient.isServerAvailable = false;
        return { connected: false, error: err.message };
      }
    },

    // =========================================================================
    // AUTHENTICATION
    // =========================================================================
    async login(email, password) {
      return await ApiClient.request('/auth/login', {
        method: 'POST',
        body: JSON.stringify({ email, password })
      });
    },

    async register(name, email, password, phone = '') {
      return await ApiClient.request('/auth/register', {
        method: 'POST',
        body: JSON.stringify({ name, email, password, phone })
      });
    },

    async getCurrentUser() {
      try {
        return await ApiClient.request('/auth/me');
      } catch (e) {
        return { authenticated: false, user: null };
      }
    },

    async logout() {
      try {
        return await ApiClient.request('/auth/logout', { method: 'POST' });
      } catch (e) {
        return { success: true };
      }
    },

    // =========================================================================
    // PETS
    // =========================================================================
    async getPets() {
      return await ApiClient.request('/pets');
    },

    async getPet(idOrCode) {
      return await ApiClient.request(`/pets/${encodeURIComponent(idOrCode)}`);
    },

    async getPetPassport(idOrCode) {
      return await ApiClient.request(`/pets/${encodeURIComponent(idOrCode)}/passport`);
    },

    async createPet(petData) {
      return await ApiClient.request('/pets', {
        method: 'POST',
        body: JSON.stringify(petData)
      });
    },

    async updatePet(id, patch) {
      return await ApiClient.request(`/pets/${encodeURIComponent(id)}`, {
        method: 'PUT',
        body: JSON.stringify(patch)
      });
    },

    async deletePet(id) {
      return await ApiClient.request(`/pets/${encodeURIComponent(id)}`, {
        method: 'DELETE'
      });
    },

    // =========================================================================
    // SCANS & COMMUNITY RECOVERY
    // =========================================================================
    async recordScan(petCode, location = 'Mobile Viewfinder') {
      return await ApiClient.request(`/pets/code/${encodeURIComponent(petCode)}/scan`, {
        method: 'POST',
        body: JSON.stringify({ location })
      });
    },

    async sendLocation(petCode, locData) {
      return await ApiClient.request(`/pets/code/${encodeURIComponent(petCode)}/location`, {
        method: 'POST',
        body: JSON.stringify(locData)
      });
    },

    async getRadarData(petId) {
      return await ApiClient.request(`/pets/${encodeURIComponent(petId)}/radar`);
    },

    async broadcastNeighborhoodAlert(petId) {
      return await ApiClient.request(`/pets/${encodeURIComponent(petId)}/broadcast-alert`, {
        method: 'POST'
      });
    },

    async reportFound(petCode, reportData) {
      return await ApiClient.request(`/pets/code/${encodeURIComponent(petCode)}/report-found`, {
        method: 'POST',
        body: JSON.stringify(reportData)
      });
    },

    async getActivities() {
      return await ApiClient.request('/activities');
    },

    // =========================================================================
    // PHYSICAL TAG SHOP & ORDERS
    // =========================================================================
    async getOrders() {
      return await ApiClient.request('/orders');
    },

    async createOrder(orderData) {
      return await ApiClient.request('/orders', {
        method: 'POST',
        body: JSON.stringify(orderData)
      });
    },

    // =========================================================================
    // ANONYMOUS FINDER <-> OWNER DIRECT CHAT & PHOTO RELAY
    // =========================================================================
    async initFinderChat(petCode, finderSessionId, finderName) {
      return await ApiClient.request(`/pets/code/${encodeURIComponent(petCode)}/chat/init`, {
        method: 'POST',
        body: JSON.stringify({ finderSessionId, finderName })
      });
    },

    async getChatMessages(threadId) {
      return await ApiClient.request(`/chats/${encodeURIComponent(threadId)}/messages`);
    },

    async sendChatMessage(threadId, messageData) {
      return await ApiClient.request(`/chats/${encodeURIComponent(threadId)}/messages`, {
        method: 'POST',
        body: JSON.stringify(messageData)
      });
    },

    async markChatRead(threadId, role = 'owner') {
      return await ApiClient.request(`/chats/${encodeURIComponent(threadId)}/read`, {
        method: 'POST',
        body: JSON.stringify({ role })
      });
    },

    async getOwnerChats() {
      return await ApiClient.request('/owner/chats');
    },

    async getUnreadChatCount() {
      return await ApiClient.request('/owner/unread-chats');
    }
  };

  root.ApiClient = ApiClient;
})(typeof window !== 'undefined' ? window : this);
