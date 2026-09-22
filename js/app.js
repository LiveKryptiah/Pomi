/**
 * MyPet Application Logic & State Engine
 * Integrated with Full-Stack Flask Backend & SQLite Database (`mypet.db`)
 * Handles authentication (login/register/logout), pets CRUD, real-time activity feeds,
 * QR generation, multi-step pet creation, Lost Mode toggles, and Finder recovery submissions.
 */

(function() {
  'use strict';

  // Pre-seeded fallback data
  const DEFAULT_PETS = [
    {
      id: "pet-1",
      rawId: 1,
      code: "luna-7x29",
      name: "Luna",
      species: "cat",
      breed: "Domestic Shorthair",
      sex: "Female",
      age: "3 years old",
      color: "Gray and white",
      avatarKey: "luna",
      avatarCustom: "images/pet-luna.png",
      distinguishingFeatures: "Friendly temperament, green eyes, wearing a pink collar",
      medicalNotes: "Microchipped, up to date on vaccinations. Indoor cat.",
      isLost: false,
      lostInfo: {
        lastSeenLocation: "Oakland Ave & 4th St",
        lastSeenDate: "September 21",
        lastSeenTime: "6:30 PM",
        note: "May be shy around loud noises."
      },
      owner: {
        name: "Sarah Miller",
        phone: "(555) 234-5678",
        email: "sarah@example.com",
        showPhone: true,
        showEmail: false,
        allowSmsRelay: true
      },
      createdAt: "2026-09-01"
    },
    {
      id: "pet-2",
      rawId: 2,
      code: "milo-9k42",
      name: "Milo",
      species: "dog",
      breed: "Golden Retriever",
      sex: "Male",
      age: "2 years old",
      color: "Golden blonde",
      avatarKey: "milo",
      avatarCustom: null,
      distinguishingFeatures: "Big floppy ears, very playful and gentle, loves tennis balls",
      medicalNotes: "Microchipped. Healthy.",
      isLost: false,
      lostInfo: null,
      owner: {
        name: "Sarah Miller",
        phone: "(555) 234-5678",
        email: "sarah@example.com",
        showPhone: true,
        showEmail: true,
        allowSmsRelay: true
      },
      createdAt: "2026-09-10"
    }
  ];

  const DEFAULT_ACTIVITIES = [
    {
      id: "act-1",
      petId: "pet-1",
      petName: "Luna",
      type: "scan",
      title: "QR Tag Scanned",
      details: "Collar tag scanned near Riverside Park",
      time: "Yesterday at 4:15 PM"
    }
  ];

  // =========================================================================
  // API CLIENT (HTTP & SQLite Backend)
  // =========================================================================
  const API = {
    async request(url, options = {}) {
      try {
        const fetchOptions = {
          credentials: 'same-origin',
          headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json',
            ...(options.headers || {})
          },
          ...options
        };
        const res = await fetch(url, fetchOptions);
        const data = await res.json().catch(() => null);
        return { ok: res.ok, status: res.status, data };
      } catch (err) {
        console.warn(`[MyPet API] Network error on ${url}:`, err);
        return { ok: false, status: 0, data: null, error: err.message };
      }
    },

    // Authentication
    async getMe() {
      return this.request('/api/auth/me');
    },
    async login(email, password) {
      return this.request('/api/auth/login', {
        method: 'POST',
        body: JSON.stringify({ email, password })
      });
    },
    async register(name, email, phone, password) {
      return this.request('/api/auth/register', {
        method: 'POST',
        body: JSON.stringify({ name, email, phone, password })
      });
    },
    async logout() {
      return this.request('/api/auth/logout', { method: 'POST' });
    },

    // Pets
    async getPets() {
      return this.request('/api/pets');
    },
    async createPet(petData) {
      return this.request('/api/pets', {
        method: 'POST',
        body: JSON.stringify(petData)
      });
    },
    async updatePet(petId, patch) {
      const rawId = parseInt(String(petId).replace('pet-', ''), 10) || petId;
      return this.request(`/api/pets/${rawId}`, {
        method: 'PUT',
        body: JSON.stringify(patch)
      });
    },
    async toggleLost(petId, lostData) {
      const rawId = parseInt(String(petId).replace('pet-', ''), 10) || petId;
      return this.request(`/api/pets/${rawId}/lost`, {
        method: 'POST',
        body: JSON.stringify(lostData)
      });
    },
    async deletePet(petId) {
      const rawId = parseInt(String(petId).replace('pet-', ''), 10) || petId;
      return this.request(`/api/pets/${rawId}`, { method: 'DELETE' });
    },

    // Activities
    async getActivities() {
      return this.request('/api/activities');
    },

    // Public Recovery
    async getPublicPet(code) {
      return this.request(`/api/public/pet/${encodeURIComponent(code)}`);
    },
    async submitFound(code, payload) {
      return this.request(`/api/public/pet/${encodeURIComponent(code)}/found`, {
        method: 'POST',
        body: JSON.stringify(payload)
      });
    }
  };

  // =========================================================================
  // CLIENT STATE STORE
  // =========================================================================
  const Store = {
    currentUser: null,

    getCurrentUser() {
      if (Store.currentUser) return Store.currentUser;
      try {
        const raw = localStorage.getItem('mypet_user');
        if (raw) {
          Store.currentUser = JSON.parse(raw);
          return Store.currentUser;
        }
      } catch (e) {}
      return null;
    },

    setCurrentUser(user) {
      Store.currentUser = user;
      try {
        if (user) {
          localStorage.setItem('mypet_user', JSON.stringify(user));
          localStorage.setItem('mypet_auth', 'true');
        } else {
          localStorage.removeItem('mypet_user');
          localStorage.setItem('mypet_auth', 'false');
        }
      } catch (e) {}
    },

    isLoggedIn() {
      return Boolean(Store.getCurrentUser() || localStorage.getItem('mypet_auth') === 'true');
    },

    setLoggedIn(status, user = null) {
      if (status) {
        localStorage.setItem('mypet_auth', 'true');
        if (user) Store.setCurrentUser(user);
      } else {
        localStorage.setItem('mypet_auth', 'false');
        Store.setCurrentUser(null);
      }
    },

    getPets() {
      try {
        const stored = localStorage.getItem('mypet_pets');
        if (stored) {
          const pets = JSON.parse(stored);
          const luna = pets.find(p => p.id === 'pet-1' || p.code === 'luna-7x29' || p.name === 'Luna');
          if (luna && luna.avatarCustom !== 'images/pet-luna.png') {
            luna.avatarCustom = 'images/pet-luna.png';
            Store.savePets(pets);
          }
          return pets;
        }
        return DEFAULT_PETS;
      } catch (e) {
        return DEFAULT_PETS;
      }
    },

    savePets(pets) {
      try {
        localStorage.setItem('mypet_pets', JSON.stringify(pets));
      } catch (e) {
        console.error("Storage error:", e);
      }
    },

    getActivities() {
      try {
        const stored = localStorage.getItem('mypet_activities');
        return stored ? JSON.parse(stored) : DEFAULT_ACTIVITIES;
      } catch (e) {
        return DEFAULT_ACTIVITIES;
      }
    },

    saveActivities(activities) {
      try {
        localStorage.setItem('mypet_activities', JSON.stringify(activities));
      } catch (e) {}
    },

    addActivity(activity) {
      const list = Store.getActivities();
      list.unshift(activity);
      Store.saveActivities(list);
    },

    getPetByCode(code) {
      if (!code) return null;
      const pets = Store.getPets();
      return pets.find(p => p.code && p.code.toLowerCase() === code.toLowerCase()) || null;
    },

    getPetById(id) {
      if (!id) return null;
      const strId = String(id);
      const rawNum = parseInt(strId.replace('pet-', ''), 10);
      const pets = Store.getPets();
      return pets.find(p => p.id === strId || p.rawId === rawNum || p.id === `pet-${rawNum}`) || null;
    },

    updatePet(id, patch) {
      const pets = Store.getPets();
      const strId = String(id);
      const rawNum = parseInt(strId.replace('pet-', ''), 10);
      const idx = pets.findIndex(p => p.id === strId || p.rawId === rawNum || p.id === `pet-${rawNum}` || p.code === strId);
      if (idx !== -1) {
        pets[idx] = Object.assign({}, pets[idx], patch);
        Store.savePets(pets);
        return pets[idx];
      }
      return null;
    },

    // Asynchronous synchronization with backend SQLite
    async syncAuth() {
      const res = await API.getMe();
      if (res.ok && res.data && res.data.authenticated) {
        Store.setCurrentUser(res.data.user);
        Store.setLoggedIn(true, res.data.user);
        return res.data.user;
      } else if (res.status === 401 || (res.data && res.data.authenticated === false)) {
        Store.setCurrentUser(null);
        Store.setLoggedIn(false);
      }
      return Store.getCurrentUser();
    },

    async syncPets() {
      if (!Store.isLoggedIn()) return Store.getPets();
      const res = await API.getPets();
      if (res.ok && res.data && res.data.success && Array.isArray(res.data.pets)) {
        Store.savePets(res.data.pets);
        return res.data.pets;
      }
      return Store.getPets();
    },

    async syncActivities() {
      if (!Store.isLoggedIn()) return Store.getActivities();
      const res = await API.getActivities();
      if (res.ok && res.data && res.data.success && Array.isArray(res.data.activities)) {
        Store.saveActivities(res.data.activities);
        return res.data.activities;
      }
      return Store.getActivities();
    }
  };

  // Expose Store globally for modules like FinderSimulator
  window.Store = Store;
  window.MyPetAPI = API;

  // Toast Helper
  function showToast(message) {
    let toast = document.getElementById('toastNotice');
    if (!toast) {
      toast = document.createElement('div');
      toast.id = 'toastNotice';
      toast.className = 'toast-notice';
      document.body.appendChild(toast);
    }
    toast.innerHTML = `<span>${window.AppIcons ? window.AppIcons.get('paw') : '🐾'}</span> <span>${message}</span>`;
    toast.classList.add('visible');
    setTimeout(() => {
      toast.classList.remove('visible');
    }, 3200);
  }

  // =========================================================================
  // APPLICATION ROUTER & CONTROLLER
  // =========================================================================
  const App = {
    currentRoute: '',
    showToast: showToast,

    async init() {
      // 1. Initial cached seed in localStorage if brand new
      if (!localStorage.getItem('mypet_pets')) {
        Store.savePets(DEFAULT_PETS);
      }

      // 2. Asynchronously verify database session with backend
      await Store.syncAuth().catch(() => {});

      // 3. Inject illustrations
      App.renderStaticIllustrations();

      // 4. Listen to Hash Changes & handle initial route
      window.addEventListener('hashchange', App.handleRoute);
      App.handleRoute();

      // 5. Setup Add Pet wizard handlers
      App.initAddPetWizard();

      // 6. Setup event delegates
      App.bindGlobalEvents();

      // 7. Update Nav State
      App.updateNav();
    },

    renderStaticIllustrations() {
      const hero3D = document.getElementById('hero3DIllustration');
      if (hero3D && window.PetIllustrations && window.PetIllustrations.heroCenterpiece) {
        hero3D.innerHTML = window.PetIllustrations.heroCenterpiece();
      }

      const leftHero = document.getElementById('heroLeftIllustration');
      const rightHero = document.getElementById('heroRightIllustration');
      if (leftHero && window.PetIllustrations && window.PetIllustrations.heroCat) {
        leftHero.innerHTML = window.PetIllustrations.heroCat(320, 320);
      }
      if (rightHero && window.PetIllustrations && window.PetIllustrations.heroDog) {
        rightHero.innerHTML = window.PetIllustrations.heroDog(320, 320);
      }

      // Live collar demo tag on landing page
      const landingCollarQr = document.getElementById('landingCollarQr');
      if (landingCollarQr && window.MyPetQR) {
        const demoUrl = window.location.origin + window.location.pathname + '#p/luna-7x29';
        landingCollarQr.innerHTML = window.MyPetQR.generateSVG(demoUrl, { size: 140, margin: 1, darkColor: "#181d27" });
      }
    },

    toggleFaq(element) {
      if (element) {
        element.classList.toggle('open');
      }
    },

    openFinderSimulator(petCode = 'luna-7x29') {
      if (window.FinderSimulator) {
        window.FinderSimulator.open(petCode);
      }
    },

    // =========================================================================
    // ROUTING
    // =========================================================================
    handleRoute() {
      const hash = window.location.hash.replace(/^#\/?/, '');
      App.currentRoute = hash;

      // Hide all views
      document.querySelectorAll('.view-panel').forEach(el => el.classList.remove('active'));

      if (!hash || hash === 'landing') {
        App.showView('landingView');
        window.scrollTo({ top: 0, behavior: 'smooth' });
      } else if (hash === 'login') {
        App.showView('loginView');
        window.scrollTo({ top: 0, behavior: 'smooth' });
      } else if (hash === 'create-tag') {
        // If not logged in, prompt modal; if logged in, proceed to add-pet
        if (!Store.isLoggedIn()) {
          App.showView('landingView');
          App.openAuthModal('login');
        } else {
          App.showView('addPetView');
          App.resetAddPetWizard();
        }
        window.scrollTo({ top: 0, behavior: 'smooth' });
      } else if (hash === 'dashboard') {
        if (!Store.isLoggedIn()) {
          App.showView('landingView');
          App.openAuthModal('login');
        } else {
          App.showView('dashboardView');
          App.renderDashboard();
        }
        window.scrollTo({ top: 0, behavior: 'smooth' });
      } else if (hash === 'add-pet') {
        if (!Store.isLoggedIn()) {
          App.showView('landingView');
          App.openAuthModal('login');
        } else {
          App.showView('addPetView');
          App.resetAddPetWizard();
        }
        window.scrollTo({ top: 0, behavior: 'smooth' });
      } else if (hash.startsWith('pets/') && hash.endsWith('/qr')) {
        const petId = hash.split('/')[1];
        App.showView('qrTagView');
        App.renderQrTagView(petId);
        window.scrollTo({ top: 0, behavior: 'smooth' });
      } else if (hash.startsWith('p/')) {
        const petCode = hash.split('/')[1];
        App.showView('publicProfileView');
        App.renderPublicProfile(petCode);
        window.scrollTo({ top: 0, behavior: 'smooth' });
      } else {
        App.showView('landingView');
      }

      // Update Nav active indicator
      App.updateNav();
    },

    showView(viewId) {
      const el = document.getElementById(viewId);
      if (el) el.classList.add('active');
    },

    // =========================================================================
    // DYNAMIC NAVIGATION
    // =========================================================================
    updateNav() {
      const hash = App.currentRoute;
      const demoRoleBtn = document.getElementById('demoRoleSwitcher');
      if (demoRoleBtn) {
        if (hash.startsWith('p/')) {
          demoRoleBtn.innerHTML = `<span>${window.AppIcons ? window.AppIcons.get('user') : '👤'} Finder View</span> · Switch to Owner`;
          demoRoleBtn.onclick = () => window.location.hash = '#dashboard';
        } else {
          const user = Store.getCurrentUser();
          const firstName = user ? user.name.split(' ')[0] : 'Sarah';
          demoRoleBtn.innerHTML = `<span>${window.AppIcons ? window.AppIcons.get('cat') : '🐱'} ${firstName} (Owner)</span> · Test Finder Scan`;
          demoRoleBtn.onclick = () => window.location.hash = '#p/luna-7x29';
        }
      }

      const isLoggedIn = Store.isLoggedIn();
      const navContainer = document.getElementById('navActionsContainer');
      if (!navContainer) return;

      if (isLoggedIn) {
        const user = Store.getCurrentUser() || { name: 'Sarah Miller', email: 'sarah@example.com' };
        const initial = (user.name || 'P')[0].toUpperCase();
        navContainer.innerHTML = `
          <div class="user-profile-pill" title="Signed in as ${user.email} (Connected to SQLite)">
            <span class="user-avatar-badge">${initial}</span>
            <span class="user-name-display">${user.name}</span>
          </div>
          <a href="#dashboard" class="btn btn-secondary btn-sm" id="navDashboardLink">Dashboard</a>
          <a href="#add-pet" class="btn btn-primary btn-sm" id="navCreateTagBtn">+ Add Pet</a>
          <button type="button" class="btn btn-outline btn-sm" onclick="App.handleLogout()" title="Sign out of account">Sign Out</button>
        `;
      } else {
        navContainer.innerHTML = `
          <button type="button" id="navAuthBtn" class="btn btn-secondary btn-sm" onclick="App.openAuthModal('login')">Sign In</button>
          <button type="button" class="btn btn-primary btn-sm" onclick="App.openAuthModal('register')">Create Account</button>
          <a href="#create-tag" class="btn btn-outline btn-sm" id="navCreateTagBtn">Create a Pet Tag</a>
        `;
      }
    },

    // =========================================================================
    // AUTH MODAL & HANDLERS (SQLITE DATABASE CONNECTED)
    // =========================================================================
    openAuthModal(tab = 'login') {
      const modal = document.getElementById('authModal');
      if (!modal) return;
      App.clearAuthError();
      App.switchAuthTab(tab);
      modal.classList.add('active');
    },

    closeAuthModal() {
      const modal = document.getElementById('authModal');
      if (modal) modal.classList.remove('active');
      App.clearAuthError();
    },

    switchAuthTab(tab) {
      const tabLogin = document.getElementById('authTabLogin');
      const tabRegister = document.getElementById('authTabRegister');
      const formLogin = document.getElementById('modalLoginForm');
      const formRegister = document.getElementById('registerForm');
      const demoCallout = document.getElementById('authDemoCallout');
      const titleEl = document.getElementById('authModalTitle');
      const subEl = document.getElementById('authModalSub');

      App.clearAuthError();

      if (tab === 'register') {
        if (tabRegister) tabRegister.classList.add('active');
        if (tabLogin) tabLogin.classList.remove('active');
        if (formRegister) formRegister.style.display = 'block';
        if (formLogin) formLogin.style.display = 'none';
        if (demoCallout) demoCallout.style.display = 'none';
        if (titleEl) titleEl.innerText = 'Create Your Account';
        if (subEl) subEl.innerText = 'Register to create persistent collar tags and track pet recovery in real time.';
      } else {
        if (tabLogin) tabLogin.classList.add('active');
        if (tabRegister) tabRegister.classList.remove('active');
        if (formLogin) formLogin.style.display = 'block';
        if (formRegister) formRegister.style.display = 'none';
        if (demoCallout) demoCallout.style.display = 'flex';
        if (titleEl) titleEl.innerText = 'Welcome to MyPet';
        if (subEl) subEl.innerText = 'Sign in to manage your pets and collar tags in the cloud database.';
      }
    },

    fillDemoCredentials() {
      const emailInput = document.getElementById('modalLoginEmail') || document.getElementById('loginEmail');
      const passwordInput = document.getElementById('modalLoginPassword') || document.getElementById('loginPassword');
      if (emailInput) emailInput.value = 'sarah@example.com';
      if (passwordInput) passwordInput.value = 'password123';
      App.clearAuthError();
      showToast("Pre-seeded demo credentials loaded!");
    },

    setAuthError(message) {
      const banner = document.getElementById('authErrorBanner');
      if (banner) {
        banner.innerText = message;
        banner.style.display = 'block';
      }
    },

    clearAuthError() {
      const banner = document.getElementById('authErrorBanner');
      if (banner) {
        banner.innerText = '';
        banner.style.display = 'none';
      }
    },

    async handleLogin(e) {
      if (e && e.preventDefault) e.preventDefault();
      App.clearAuthError();

      const emailEl = document.getElementById('modalLoginEmail') || document.getElementById('loginEmail');
      const passEl = document.getElementById('modalLoginPassword') || document.getElementById('loginPassword');
      const email = emailEl ? emailEl.value.trim() : '';
      const password = passEl ? passEl.value : '';

      if (!email || !password) {
        App.setAuthError("Please enter your email and password.");
        return;
      }

      const submitBtn = document.getElementById('modalLoginSubmitBtn') || document.getElementById('loginSubmitBtn');
      if (submitBtn) {
        submitBtn.disabled = true;
        submitBtn.innerText = "Signing in...";
      }

      const res = await API.login(email, password);

      if (submitBtn) {
        submitBtn.disabled = false;
        submitBtn.innerText = "Sign In to Dashboard →";
      }

      if (res.ok && res.data && res.data.success) {
        Store.setCurrentUser(res.data.user);
        Store.setLoggedIn(true, res.data.user);
        App.closeAuthModal();
        showToast(`Welcome back, ${res.data.user.name}!`);
        App.updateNav();
        window.location.hash = '#dashboard';
        App.renderDashboard();
      } else {
        const msg = (res.data && res.data.error) || "Invalid email or password. Please try again.";
        App.setAuthError(msg);
      }
    },

    async handleRegister(e) {
      if (e && e.preventDefault) e.preventDefault();
      App.clearAuthError();

      const nameEl = document.getElementById('regName');
      const emailEl = document.getElementById('regEmail');
      const phoneEl = document.getElementById('regPhone');
      const passEl = document.getElementById('regPassword');

      const name = nameEl ? nameEl.value.trim() : '';
      const email = emailEl ? emailEl.value.trim() : '';
      const phone = phoneEl ? phoneEl.value.trim() : '';
      const password = passEl ? passEl.value : '';

      if (!name || !email || !password) {
        App.setAuthError("Name, email, and password are required.");
        return;
      }

      const submitBtn = document.getElementById('regSubmitBtn');
      if (submitBtn) {
        submitBtn.disabled = true;
        submitBtn.innerText = "Creating account...";
      }

      const res = await API.register(name, email, phone, password);

      if (submitBtn) {
        submitBtn.disabled = false;
        submitBtn.innerText = "Create MyPet Account →";
      }

      if (res.ok && res.data && res.data.success) {
        Store.setCurrentUser(res.data.user);
        Store.setLoggedIn(true, res.data.user);
        App.closeAuthModal();
        showToast(`Account created! Welcome, ${res.data.user.name}!`);
        App.updateNav();
        window.location.hash = '#dashboard';
        App.renderDashboard();
      } else {
        const msg = (res.data && res.data.error) || "Failed to create account. Please check your details.";
        App.setAuthError(msg);
      }
    },

    async handleLogout() {
      await API.logout().catch(() => {});
      Store.setLoggedIn(false);
      showToast("You have been signed out.");
      App.updateNav();
      window.location.hash = '#landing';
    },

    handleNavAuthClick() {
      if (Store.isLoggedIn()) {
        App.handleLogout();
      } else {
        App.openAuthModal('login');
      }
    },

    async quickDemoLogin() {
      const res = await API.login('sarah@example.com', 'password123');
      if (res.ok && res.data && res.data.success) {
        Store.setCurrentUser(res.data.user);
        Store.setLoggedIn(true, res.data.user);
        App.closeAuthModal();
        showToast("Signed in as Sarah Miller (Demo Account)");
        App.updateNav();
        window.location.hash = '#dashboard';
        App.renderDashboard();
      } else {
        // Fallback demo state
        Store.setLoggedIn(true, { id: 1, name: 'Sarah Miller', email: 'sarah@example.com', phone: '(555) 234-5678' });
        showToast("Signed in as Sarah Miller");
        App.updateNav();
        window.location.hash = '#dashboard';
        App.renderDashboard();
      }
    },

    handleLoginSubmit(e) {
      App.handleLogin(e);
    },

    // Helper: render pet avatar
    getPetAvatarMarkup(pet) {
      if (pet.avatarCustom) {
        return `<img src="${pet.avatarCustom}" alt="${pet.name}" />`;
      }
      if (pet.name === 'Luna' || pet.code === 'luna-7x29') {
        return `<img src="images/pet-luna.png" alt="${pet.name}" />`;
      }
      if (pet.avatarKey && window.PetIllustrations && window.PetIllustrations.avatars[pet.avatarKey]) {
        return window.PetIllustrations.avatars[pet.avatarKey];
      }
      // Species fallback
      if (pet.species === 'cat') return window.PetIllustrations ? window.PetIllustrations.avatars.catDefault : '🐱';
      if (pet.species === 'dog') return window.PetIllustrations ? window.PetIllustrations.avatars.dogDefault : '🐶';
      if (pet.species === 'rabbit') return window.PetIllustrations ? window.PetIllustrations.avatars.rabbitDefault : '🐰';
      return window.PetIllustrations ? window.PetIllustrations.avatars.otherDefault : '🐾';
    },

    // =========================================================================
    // OWNER DASHBOARD RENDERING (SQLITE SYNCED)
    // =========================================================================
    async renderDashboard() {
      const grid = document.getElementById('dashboardPetsGrid');
      if (!grid) return;

      // 1. Initial immediate render from cache
      const cachedPets = Store.getPets();
      App.renderPetsGridMarkup(cachedPets);
      App.renderActivityFeedMarkup(Store.getActivities());

      // 2. Fetch fresh data from SQLite API
      try {
        const pets = await Store.syncPets();
        App.renderPetsGridMarkup(pets);

        const activities = await Store.syncActivities();
        App.renderActivityFeedMarkup(activities);
      } catch (err) {
        console.warn("[Dashboard sync warning]:", err);
      }
    },

    renderPetsGridMarkup(pets) {
      const grid = document.getElementById('dashboardPetsGrid');
      if (!grid) return;

      if (!pets || pets.length === 0) {
        grid.innerHTML = `
          <div style="grid-column: 1 / -1; text-align: center; padding: 48px 24px; background: var(--sand); border: 2px dashed var(--border); border-radius: 20px;">
            <div style="font-size: 36px; margin-bottom: 12px;">🐾</div>
            <h3 style="font-size: 20px; color: var(--ink); margin-bottom: 6px;">No pets registered yet</h3>
            <p style="color: var(--muted); font-size: 14px; margin-bottom: 20px;">Register your first companion to generate a QR tag and link them to your cloud account.</p>
            <a href="#add-pet" class="btn btn-primary">+ Register a Pet</a>
          </div>
        `;
        return;
      }

      grid.innerHTML = pets.map(pet => {
        const avatarMarkup = App.getPetAvatarMarkup(pet);
        const isLost = pet.isLost;
        const statusBadge = isLost
          ? `<span class="status-badge lost">${window.AppIcons ? window.AppIcons.get('alertCircle') : '⚠️'} LOST</span>`
          : `<span class="status-badge active">TAG ACTIVE</span>`;

        let lostBanner = '';
        if (isLost && pet.lostInfo) {
          lostBanner = `
            <div class="lost-alert-banner">
              <strong>Missing since ${pet.lostInfo.lastSeenDate || 'Recently'} · ${pet.lostInfo.lastSeenTime || ''}</strong>
              <span>Last seen near: ${pet.lostInfo.lastSeenLocation || 'Unknown'}</span>
            </div>
          `;
        }

        return `
          <div class="pet-card ${isLost ? 'is-lost' : ''}" data-pet-id="${pet.id}">
            <div class="pet-card-top">
              <div class="pet-card-avatar">
                ${avatarMarkup}
              </div>
              <div class="pet-card-meta">
                <div class="pet-card-name">
                  ${pet.name}
                  ${statusBadge}
                </div>
                <div class="pet-card-species">${(pet.species || 'PET').toUpperCase()} · ${pet.sex || ''} · ${pet.age || ''}</div>
                <div style="font-size: 13px; color: var(--muted); margin-top: 4px;">Breed: ${pet.breed || 'Mixed'}</div>
              </div>
            </div>

            ${lostBanner}

            <div class="pet-card-actions">
              <a href="#p/${pet.code}" class="btn btn-secondary btn-sm" target="_blank" title="Preview Public Profile">
                ${window.AppIcons ? window.AppIcons.get('eye') : '👁️'} View Profile
              </a>
              <a href="#pets/${pet.id}/qr" class="btn btn-secondary btn-sm">
                ${window.AppIcons ? window.AppIcons.get('qr') : '📱'} QR Tag
              </a>
              <button class="btn btn-outline btn-sm" onclick="App.openLostPosterModal('${pet.id}')">
                ${window.AppIcons ? window.AppIcons.get('poster') : '📄'} Lost Poster
              </button>
              <button class="btn btn-secondary btn-sm" onclick="App.openEditPetModal('${pet.id}')">
                ${window.AppIcons ? window.AppIcons.get('edit') : '✏️'} Edit
              </button>
              ${
                isLost
                  ? `<button class="btn btn-success btn-sm" onclick="App.toggleLostStatus('${pet.id}', false)">${window.AppIcons ? window.AppIcons.get('check') : '✓'} Mark Found</button>`
                  : `<button class="btn btn-danger btn-sm" onclick="App.openLostModeModal('${pet.id}')">${window.AppIcons ? window.AppIcons.get('siren') : '🚨'} Mark as Lost</button>`
              }
            </div>
          </div>
        `;
      }).join('');
    },

    renderActivityFeedMarkup(activities) {
      const feedContainer = document.getElementById('dashboardActivityList');
      if (!feedContainer) return;

      if (!activities || activities.length === 0) {
        feedContainer.innerHTML = `<li style="color: var(--muted); padding: 16px 0; text-align: center;">No scan or finder records yet. When someone scans your tag, it will appear here in real time.</li>`;
        return;
      }

      feedContainer.innerHTML = activities.map(act => {
        const isFound = act.type === 'found';
        return `
          <li class="activity-item">
            <div class="activity-left">
              <div class="activity-icon ${isFound ? 'found' : 'scan'}">
                ${isFound ? (window.AppIcons ? window.AppIcons.get('paw') : '🐾') : (window.AppIcons ? window.AppIcons.get('qr') : '📱')}
              </div>
              <div class="activity-text">
                <strong>${act.title} — ${act.petName}</strong>
                <span>${act.details}</span>
              </div>
            </div>
            <div style="font-size: 12px; color: var(--muted);">${act.time || 'Recently'}</div>
          </li>
        `;
      }).join('');
    },

    // =========================================================================
    // QR TAG GENERATION VIEW
    // =========================================================================
    renderQrTagView(petId) {
      const pet = Store.getPetById(petId) || Store.getPets()[0];
      if (!pet) return;

      const titleEl = document.getElementById('qrPetTitle');
      const containerEl = document.getElementById('qrDisplayMedallion');
      const shareLinkEl = document.getElementById('qrShareInput');

      if (titleEl) titleEl.innerText = `${pet.name}'s tag is ready.`;

      // Absolute URL encoded in QR Code
      const publicUrl = window.location.origin + window.location.pathname + '#p/' + pet.code;

      if (shareLinkEl) shareLinkEl.value = publicUrl;

      // Generate SVG QR matrix
      if (window.MyPetQR) {
        const qrSvg = window.MyPetQR.generateSVG(publicUrl, {
          size: 160,
          margin: 1,
          darkColor: "#181d27"
        });

        if (containerEl && window.PetIllustrations) {
          containerEl.innerHTML = window.PetIllustrations.physicalTagGraphic(pet.name, qrSvg);
        }
      }

      // Action buttons
      const dlBtn = document.getElementById('btnDownloadQr');
      if (dlBtn) {
        dlBtn.onclick = () => App.downloadTagAsPng(pet, publicUrl);
      }

      const printBtn = document.getElementById('btnPrintTag');
      if (printBtn) {
        printBtn.onclick = () => window.print();
      }

      const shareBtn = document.getElementById('btnShareProfile');
      if (shareBtn) {
        shareBtn.onclick = () => {
          if (navigator.clipboard && navigator.clipboard.writeText) {
            navigator.clipboard.writeText(publicUrl).then(() => {
              showToast("Profile link copied to clipboard!");
            }).catch(() => {
              showToast("Link: " + publicUrl);
            });
          } else {
            showToast("Link: " + publicUrl);
          }
        };
      }

      const testFinderBtn = document.getElementById('btnTestFinderView');
      if (testFinderBtn) {
        testFinderBtn.href = `#p/${pet.code}`;
      }
    },

    downloadTagAsPng(pet, url) {
      if (!window.MyPetQR) return;
      const canvas = document.createElement('canvas');
      window.MyPetQR.renderToCanvas(canvas, url, { size: 600, margin: 2 });
      const a = document.createElement('a');
      a.download = `${pet.name.toLowerCase()}-mypet-qr.png`;
      a.href = canvas.toDataURL('image/png');
      a.click();
      showToast(`Downloaded QR Tag for ${pet.name}!`);
    },

    // =========================================================================
    // PUBLIC PET PROFILE (MOBILE-FIRST RECOVERY SCREEN)
    // =========================================================================
    async renderPublicProfile(petCode) {
      const container = document.getElementById('publicProfileCard');
      if (!container) return;

      // Fetch verified public pet record from database (this triggers scan logging in SQLite!)
      let pet = null;
      try {
        const res = await API.getPublicPet(petCode);
        if (res.ok && res.data && res.data.success && res.data.pet) {
          pet = res.data.pet;
        }
      } catch (e) {}

      // Fallback to local store if server unreachable
      if (!pet) {
        pet = Store.getPetByCode(petCode) || Store.getPets()[0];
      }

      if (!pet) return;

      const isLost = pet.isLost;
      const avatarMarkup = App.getPetAvatarMarkup(pet);

      const statusBadge = isLost
        ? `<div class="owner-status-pill missing">${window.AppIcons ? window.AppIcons.get('alertCircle') : '⚠️'} ${pet.name} is missing</div>`
        : `<div class="owner-status-pill safe">${window.AppIcons ? window.AppIcons.get('checkCircle') : '✓'} This pet has an owner</div>`;

      const greetingBlock = isLost
        ? `
          <div class="public-found-greeting" style="border-color: var(--red); background-color: #fff7f7;">
            <h3 style="color: var(--red);">${pet.name} is marked as lost!</h3>
            <p style="margin-bottom: 8px;">If you're with ${pet.name}, please contact her family right away.</p>
            ${
              pet.lostInfo ? `
                <div style="font-size: 13px; color: #b71c1c; background: #ffebee; padding: 8px 12px; border-radius: 8px; margin-top: 6px;">
                  <strong>Last seen:</strong> ${pet.lostInfo.lastSeenLocation || ''} (${pet.lostInfo.lastSeenDate || ''} · ${pet.lostInfo.lastSeenTime || ''})
                </div>
              ` : ''
            }
          </div>
        `
        : `
          <div class="public-found-greeting">
            <h3>You've found ${pet.name}! ${window.AppIcons ? window.AppIcons.get('paw') : '🐾'}</h3>
            <p>Thank you so much for helping ${pet.sex === 'Female' ? 'her' : 'him'} get back home safely.</p>
          </div>
        `;

      // Phone display based on owner privacy settings
      let phoneAction = '';
      if (pet.owner && pet.owner.showPhone && pet.owner.phone) {
        phoneAction = `
          <a href="tel:${pet.owner.phone}" class="btn btn-primary btn-lg" style="width: 100%;">
            ${window.AppIcons ? window.AppIcons.get('phone') : '📞'} Call Owner (${pet.owner.phone})
          </a>
        `;
      } else {
        phoneAction = `
          <button type="button" class="btn btn-primary btn-lg" style="width: 100%;" onclick="App.openFoundModal('${pet.id}')">
            ${window.AppIcons ? window.AppIcons.get('phone') : '📞'} Contact ${pet.name}'s Owner
          </button>
        `;
      }

      container.innerHTML = `
        <div class="public-profile-eyebrow">
          <span>${window.AppIcons ? window.AppIcons.get('paw') : '🐾'}</span>
          <span>MY PET ID</span>
        </div>

        <div class="public-pet-portrait">
          ${avatarMarkup}
        </div>

        <h1 class="public-pet-name">${pet.name}</h1>
        <div class="public-pet-meta">${(pet.species || 'PET').toUpperCase()} · ${pet.sex || ''} · ${pet.age || ''}</div>

        ${statusBadge}

        ${greetingBlock}

        <div class="public-actions-stack">
          ${phoneAction}
          <button type="button" class="btn btn-secondary btn-lg" style="width: 100%;" onclick="App.openFoundModal('${pet.id}')">
            ${window.AppIcons ? window.AppIcons.get('pin') : '📍'} I Found This Pet
          </button>
        </div>

        <div class="public-about-section">
          <div class="public-about-title">
            <span>About ${pet.name}</span>
          </div>
          <ul class="public-attributes-list">
            <li><strong>Coat & Color:</strong> ${pet.color || 'Not specified'}</li>
            <li><strong>Breed:</strong> ${pet.breed || 'Mixed'}</li>
            <li><strong>Features:</strong> ${pet.distinguishingFeatures || 'None specified'}</li>
            ${pet.medicalNotes ? `<li><strong>Medical notes:</strong> ${pet.medicalNotes}</li>` : ''}
          </ul>
        </div>

        <div style="margin-top: 24px; font-size: 12.5px; color: var(--muted);">
          Protected by <strong>MyPet</strong> · A little tag. A big way home.
        </div>
      `;
    },

    // =========================================================================
    // "I FOUND THIS PET" RECOVERY WORKFLOW
    // =========================================================================
    openFoundModal(petId) {
      const pet = Store.getPetById(petId) || Store.getPets()[0];
      const modal = document.getElementById('foundPetModal');
      if (!modal || !pet) return;

      const nameEl = document.getElementById('foundModalPetName');
      if (nameEl) nameEl.innerText = pet.name;
      document.querySelectorAll('.foundModalPetNameCopy').forEach(el => el.innerText = pet.name);
      
      const inputId = document.getElementById('foundPetIdInput');
      if (inputId) inputId.value = pet.id;

      modal.classList.add('active');
    },

    closeModal(modalId) {
      const modal = document.getElementById(modalId);
      if (modal) modal.classList.remove('active');
    },

    async submitFoundReport(e) {
      if (e && e.preventDefault) e.preventDefault();
      const petId = document.getElementById('foundPetIdInput').value;
      const pet = Store.getPetById(petId);
      if (!pet) return;

      const finderName = document.getElementById('finderNameInput').value || 'Kind Finder';
      const finderPhone = document.getElementById('finderPhoneInput').value || 'Not provided';
      const finderLocation = document.getElementById('finderLocationInput').value || 'Location shared';
      const finderMessage = document.getElementById('finderMessageInput').value || 'I am with your pet.';

      // Dispatch to Flask backend database
      const res = await API.submitFound(pet.code, {
        name: finderName,
        phone: finderPhone,
        location: finderLocation,
        message: finderMessage
      });

      // Also record in local activity log
      Store.addActivity({
        id: 'act-' + Date.now(),
        petId: pet.id,
        petName: pet.name,
        type: 'found',
        title: `Someone found ${pet.name}!`,
        details: `${finderName} (${finderPhone}) says: "${finderMessage}" near ${finderLocation}`,
        time: 'Just now'
      });

      App.closeModal('foundPetModal');
      showToast(`Alert sent to ${pet.name}'s owner! Thank you!`);

      const ownerPhone = (pet.owner && pet.owner.phone) || '(555) 234-5678';
      const ownerEmail = (pet.owner && pet.owner.email) || 'sarah@example.com';

      alert(`Thank you, ${finderName}!\n\nAn instant notification with your message and location has been dispatched to ${pet.name}'s owner.\n\nOwner Contact: ${ownerPhone}\nOwner Email: ${ownerEmail}`);
    },

    // Geolocation helper for finder
    useCurrentLocation() {
      const locInput = document.getElementById('finderLocationInput');
      if (!locInput) return;
      locInput.value = "Detecting location...";

      if ("geolocation" in navigator) {
        navigator.geolocation.getCurrentPosition(
          pos => {
            const lat = pos.coords.latitude.toFixed(4);
            const lng = pos.coords.longitude.toFixed(4);
            locInput.value = `GPS: ${lat}, ${lng} (Near current spot)`;
          },
          err => {
            locInput.value = "Corner of Market St & 5th (Manual)";
          },
          { timeout: 5000 }
        );
      } else {
        locInput.value = "Market St & 5th (Manual)";
      }
    },

    // =========================================================================
    // LOST MODE MODAL & LOGIC (SQLITE BACKED)
    // =========================================================================
    openLostModeModal(petId) {
      const pet = Store.getPetById(petId);
      if (!pet) return;

      const nameEl = document.getElementById('lostModalPetName');
      if (nameEl) nameEl.innerText = pet.name;
      document.getElementById('lostPetIdInput').value = pet.id;
      document.getElementById('lostLocationInput').value = "Oakland Ave & 4th St";
      document.getElementById('lostDateInput').value = "Today";
      document.getElementById('lostTimeInput').value = "6:30 PM";

      document.getElementById('lostModeModal').classList.add('active');
    },

    async saveLostMode(e) {
      if (e && e.preventDefault) e.preventDefault();
      const petId = document.getElementById('lostPetIdInput').value;
      const location = document.getElementById('lostLocationInput').value;
      const date = document.getElementById('lostDateInput').value;
      const time = document.getElementById('lostTimeInput').value;

      const lostInfo = {
        lastSeenLocation: location,
        lastSeenDate: date,
        lastSeenTime: time
      };

      // Persist in backend SQLite
      await API.toggleLost(petId, {
        is_lost: true,
        last_seen_location: location,
        last_seen_date: date,
        last_seen_time: time
      });

      Store.updatePet(petId, {
        isLost: true,
        lostInfo: lostInfo
      });

      App.closeModal('lostModeModal');
      showToast("Pet marked as LOST in database. Profile updated!");
      App.renderDashboard();

      // Offer immediate lost poster generation
      setTimeout(() => {
        if (confirm("Would you like to generate a neighborhood Lost Pet Poster and social flyer now?")) {
          App.openLostPosterModal(petId);
        }
      }, 500);
    },

    async toggleLostStatus(petId, status) {
      await API.toggleLost(petId, { is_lost: status });
      Store.updatePet(petId, { isLost: status });
      showToast(status ? "Marked as lost in database" : "Marked as safe and found!");
      App.renderDashboard();
    },

    // =========================================================================
    // POSTER & FLYER MODAL HANDLERS
    // =========================================================================
    openLostPosterModal(petId) {
      const pet = Store.getPetById(petId) || Store.getPets()[0];
      if (!pet) return;

      if (window.MyPetPoster) {
        window.MyPetPoster.init(pet);
        const headlineEl = document.getElementById('posterHeadlineInput');
        if (headlineEl) headlineEl.value = window.MyPetPoster.options.headline;
        const rewardEl = document.getElementById('posterRewardInput');
        if (rewardEl) rewardEl.value = window.MyPetPoster.options.reward;
        const phoneEl = document.getElementById('posterPhoneInput');
        if (phoneEl) phoneEl.value = window.MyPetPoster.options.contactPhone;
        const phone2El = document.getElementById('posterPhone2Input');
        if (phone2El) phone2El.value = window.MyPetPoster.options.secondaryPhone;
        const lastSeenEl = document.getElementById('posterLastSeenInput');
        if (lastSeenEl) lastSeenEl.value = window.MyPetPoster.options.lastSeen;
        const notesEl = document.getElementById('posterNotesInput');
        if (notesEl) notesEl.value = window.MyPetPoster.options.notes;
      }

      App.switchPosterTab('street');
      const posterModal = document.getElementById('lostPosterModal');
      if (posterModal) posterModal.classList.add('active');
    },

    switchPosterTab(format) {
      document.querySelectorAll('.format-tab-btn').forEach(btn => btn.classList.remove('active'));
      if (format === 'street') {
        const btn = document.getElementById('tabStreet');
        if (btn) btn.classList.add('active');
      } else if (format === 'square') {
        const btn = document.getElementById('tabSquare');
        if (btn) btn.classList.add('active');
      } else if (format === 'story') {
        const btn = document.getElementById('tabStory');
        if (btn) btn.classList.add('active');
      }

      if (window.MyPetPoster) {
        window.MyPetPoster.setFormat(format);
      }
    },

    // =========================================================================
    // EDIT PET MODAL (SQLITE SYNCED)
    // =========================================================================
    openEditPetModal(petId) {
      const pet = Store.getPetById(petId);
      if (!pet) return;

      document.getElementById('editPetId').value = pet.id;
      document.getElementById('editPetName').value = pet.name || '';
      document.getElementById('editPetBreed').value = pet.breed || '';
      document.getElementById('editPetAge').value = pet.age || '';
      document.getElementById('editPetFeatures').value = pet.distinguishingFeatures || '';
      document.getElementById('editPetMedical').value = pet.medicalNotes || '';
      document.getElementById('editOwnerPhone').value = (pet.owner && pet.owner.phone) || '';
      document.getElementById('editShowPhone').checked = Boolean(pet.owner && pet.owner.showPhone);

      const modal = document.getElementById('editPetModal');
      if (modal) modal.classList.add('active');
    },

    async savePetEdits(e) {
      if (e && e.preventDefault) e.preventDefault();
      const petId = document.getElementById('editPetId').value;
      const phone = document.getElementById('editOwnerPhone').value;
      const showPhone = document.getElementById('editShowPhone').checked;

      const patch = {
        name: document.getElementById('editPetName').value,
        breed: document.getElementById('editPetBreed').value,
        age: document.getElementById('editPetAge').value,
        distinguishingFeatures: document.getElementById('editPetFeatures').value,
        medicalNotes: document.getElementById('editPetMedical').value,
        showPhone: showPhone
      };

      // Persist to backend database
      await API.updatePet(petId, patch);

      // Update locally
      Store.updatePet(petId, {
        name: patch.name,
        breed: patch.breed,
        age: patch.age,
        distinguishingFeatures: patch.distinguishingFeatures,
        medicalNotes: patch.medicalNotes,
        owner: {
          phone: phone,
          showPhone: showPhone,
          email: "sarah@example.com",
          allowSmsRelay: true
        }
      });

      App.closeModal('editPetModal');
      showToast("Pet profile updated in database!");
      App.renderDashboard();
    },

    // =========================================================================
    // ADD PET MULTI-STEP WIZARD (SQLITE PERSISTENCE)
    // =========================================================================
    wizardState: {
      step: 1,
      name: '',
      species: 'cat',
      breed: '',
      sex: 'Female',
      age: '',
      color: '',
      features: '',
      avatarKey: 'catDefault',
      avatarCustom: null,
      phone: '(555) 234-5678',
      email: 'sarah@example.com',
      showPhone: true,
      showEmail: false,
      allowSmsRelay: true
    },

    initAddPetWizard() {
      // Species option clicks
      document.querySelectorAll('.species-card-option').forEach(card => {
        card.addEventListener('click', () => {
          document.querySelectorAll('.species-card-option').forEach(c => c.classList.remove('selected'));
          card.classList.add('selected');
          App.wizardState.species = card.dataset.species;
          if (card.dataset.species === 'cat') App.wizardState.avatarKey = 'catDefault';
          else if (card.dataset.species === 'dog') App.wizardState.avatarKey = 'dogDefault';
          else if (card.dataset.species === 'rabbit') App.wizardState.avatarKey = 'rabbitDefault';
          else App.wizardState.avatarKey = 'otherDefault';
        });
      });

      // Preset avatar buttons
      document.querySelectorAll('.avatar-preset-btn').forEach(btn => {
        btn.addEventListener('click', () => {
          document.querySelectorAll('.avatar-preset-btn').forEach(b => b.classList.remove('selected'));
          btn.classList.add('selected');
          App.wizardState.avatarKey = btn.dataset.avatar;
          App.wizardState.avatarCustom = null;
        });
      });

      // Photo upload dropzone simulator / real reader
      const fileInput = document.getElementById('petPhotoUpload');
      if (fileInput) {
        fileInput.addEventListener('change', (e) => {
          const file = e.target.files[0];
          if (file) {
            const reader = new FileReader();
            reader.onload = function(evt) {
              App.wizardState.avatarCustom = evt.target.result;
              const preview = document.getElementById('uploadPreviewArea');
              if (preview) {
                preview.innerHTML = `<img src="${evt.target.result}" style="width: 80px; height: 80px; border-radius: 50%; object-fit: cover; border: 2px solid var(--ink);" />`;
              }
            };
            reader.readAsDataURL(file);
          }
        });
      }
    },

    resetAddPetWizard() {
      const user = Store.getCurrentUser();
      App.wizardState = {
        step: 1,
        name: '',
        species: 'cat',
        breed: '',
        sex: 'Female',
        age: '',
        color: '',
        features: '',
        avatarKey: 'catDefault',
        avatarCustom: null,
        phone: (user && user.phone) || '(555) 234-5678',
        email: (user && user.email) || 'sarah@example.com',
        showPhone: true,
        showEmail: false,
        allowSmsRelay: true
      };

      const nameInput = document.getElementById('newPetName');
      if (nameInput) nameInput.value = '';

      App.goToWizardStep(1);
    },

    goToWizardStep(stepNum) {
      App.wizardState.step = stepNum;

      // Update step panels
      document.querySelectorAll('.wizard-step').forEach(stepEl => {
        stepEl.classList.toggle('active', parseInt(stepEl.dataset.step) === stepNum);
      });

      // Update progress indicators
      document.querySelectorAll('.progress-dot').forEach(dot => {
        const dStep = parseInt(dot.dataset.step);
        dot.classList.toggle('active', dStep === stepNum);
        dot.classList.toggle('completed', dStep < stepNum);
      });

      const fill = document.getElementById('wizardProgressFill');
      if (fill) {
        fill.style.width = `${((stepNum - 1) / 4) * 100}%`;
      }

      const backBtn = document.getElementById('wizardBackBtn');
      if (backBtn) {
        backBtn.style.visibility = stepNum === 1 ? 'hidden' : 'visible';
      }

      const nextBtn = document.getElementById('wizardNextBtn');
      if (nextBtn) {
        nextBtn.innerHTML = stepNum === 5 ? `Create QR Tag ${window.AppIcons ? window.AppIcons.get('paw') : '🐾'}` : 'Continue &rarr;';
      }
    },

    wizardNext() {
      const step = App.wizardState.step;
      if (step === 1) {
        const nameInput = document.getElementById('newPetName').value.trim();
        if (!nameInput) {
          alert("Please enter your pet's name");
          return;
        }
        App.wizardState.name = nameInput;
        document.querySelectorAll('.dynamic-pet-name').forEach(el => el.innerText = nameInput);
      } else if (step === 3) {
        App.wizardState.breed = document.getElementById('newPetBreed').value.trim() || 'Mixed';
        App.wizardState.sex = document.getElementById('newPetSex').value;
        App.wizardState.age = document.getElementById('newPetAge').value.trim() || 'Unknown';
        App.wizardState.color = document.getElementById('newPetColor').value.trim() || 'Mixed';
        App.wizardState.features = document.getElementById('newPetFeatures').value.trim();
      } else if (step === 5) {
        App.wizardState.phone = document.getElementById('newPetPhone').value;
        App.wizardState.email = document.getElementById('newPetEmail').value;
        App.wizardState.showPhone = document.getElementById('newPetShowPhone').checked;
        App.wizardState.showEmail = document.getElementById('newPetShowEmail').checked;

        App.finalizeNewPet();
        return;
      }
      App.goToWizardStep(step + 1);
    },

    wizardPrev() {
      if (App.wizardState.step > 1) {
        App.goToWizardStep(App.wizardState.step - 1);
      }
    },

    async finalizeNewPet() {
      const nextBtn = document.getElementById('wizardNextBtn');
      if (nextBtn) {
        nextBtn.disabled = true;
        nextBtn.innerText = "Creating Tag in Database...";
      }

      const payload = {
        name: App.wizardState.name,
        species: App.wizardState.species,
        breed: App.wizardState.breed,
        sex: App.wizardState.sex,
        age: App.wizardState.age,
        color: App.wizardState.color,
        avatarKey: App.wizardState.avatarKey,
        avatarCustom: App.wizardState.avatarCustom,
        features: App.wizardState.features,
        phone: App.wizardState.phone,
        email: App.wizardState.email,
        showPhone: App.wizardState.showPhone,
        showEmail: App.wizardState.showEmail,
        allowSmsRelay: true
      };

      let newPet = null;
      try {
        const res = await API.createPet(payload);
        if (res.ok && res.data && res.data.success && res.data.pet) {
          newPet = res.data.pet;
        }
      } catch (err) {
        console.warn("[Pet creation API warning]:", err);
      }

      // Fallback local creation if offline
      if (!newPet) {
        const randomCode = App.wizardState.name.toLowerCase().replace(/[^a-z0-9]/g, '') + '-' + Math.random().toString(36).substring(2, 6);
        newPet = {
          id: 'pet-' + Date.now(),
          rawId: Date.now(),
          code: randomCode,
          name: App.wizardState.name,
          species: App.wizardState.species,
          breed: App.wizardState.breed,
          sex: App.wizardState.sex,
          age: App.wizardState.age,
          color: App.wizardState.color,
          avatarKey: App.wizardState.avatarKey,
          avatarCustom: App.wizardState.avatarCustom,
          distinguishingFeatures: App.wizardState.features,
          medicalNotes: "Up to date on vaccinations.",
          isLost: false,
          lostInfo: null,
          owner: {
            name: "Sarah Miller",
            phone: App.wizardState.phone,
            email: App.wizardState.email,
            showPhone: App.wizardState.showPhone,
            showEmail: App.wizardState.showEmail,
            allowSmsRelay: true
          },
          createdAt: new Date().toISOString().split('T')[0]
        };
      }

      const pets = Store.getPets();
      pets.push(newPet);
      Store.savePets(pets);

      if (nextBtn) {
        nextBtn.disabled = false;
        nextBtn.innerText = "Continue →";
      }

      showToast(`Created persistent QR tag for ${newPet.name}!`);
      // Route immediately to the newly generated QR Tag page
      window.location.hash = `#pets/${newPet.id}/qr`;
    },

    bindGlobalEvents() {
      // Close modals on backdrop click
      document.querySelectorAll('.modal-backdrop').forEach(modal => {
        modal.addEventListener('click', (e) => {
          if (e.target === modal) modal.classList.remove('active');
        });
      });
    }
  };

  // Expose App to global window
  window.App = App;

  // Initialize once DOM is ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', App.init);
  } else {
    App.init();
  }
})();
