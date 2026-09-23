/**
 * MyPet Application Logic & State Engine
 * Handles routing, localStorage persistence, QR generation, multi-step pet creation,
 * Lost Mode toggles, and Finder recovery submissions.
 */

(function() {
  'use strict';

  // Pre-seeded initial data matching user prompt specifications
  const DEFAULT_PETS = [
    {
      id: "pet-1",
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

  // State Store
  const Store = {
    getPets: function() {
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
    savePets: function(pets) {
      try {
        localStorage.setItem('mypet_pets', JSON.stringify(pets));
      } catch (e) {
        console.error("Storage error:", e);
      }
    },
    getActivities: function() {
      try {
        const stored = localStorage.getItem('mypet_activities');
        return stored ? JSON.parse(stored) : DEFAULT_ACTIVITIES;
      } catch (e) {
        return DEFAULT_ACTIVITIES;
      }
    },
    addActivity: function(activity) {
      const list = Store.getActivities();
      list.unshift(activity);
      try {
        localStorage.setItem('mypet_activities', JSON.stringify(list));
      } catch (e) {}
    },
    getPetByCode: function(code) {
      const pets = Store.getPets();
      return pets.find(p => p.code.toLowerCase() === code.toLowerCase()) || null;
    },
    getPetById: function(id) {
      const pets = Store.getPets();
      return pets.find(p => p.id === id) || null;
    },
    updatePet: function(id, patch) {
      const pets = Store.getPets();
      const idx = pets.findIndex(p => p.id === id);
      if (idx !== -1) {
        pets[idx] = Object.assign({}, pets[idx], patch);
        Store.savePets(pets);
        return pets[idx];
      }
      return null;
    },
    isLoggedIn: function() {
      return localStorage.getItem('mypet_auth') === 'true';
    },
    setLoggedIn: function(status) {
      localStorage.setItem('mypet_auth', status ? 'true' : 'false');
    }
  };

  // Toast Helper
  function showToast(message) {
    let toast = document.getElementById('toastNotice');
    if (!toast) {
      toast = document.createElement('div');
      toast.id = 'toastNotice';
      toast.className = 'toast-notice';
      document.body.appendChild(toast);
    }
    toast.innerHTML = `<span>${window.AppIcons ? window.AppIcons.get('paw') : ''}</span> <span>${message}</span>`;
    toast.classList.add('visible');
    setTimeout(() => {
      toast.classList.remove('visible');
    }, 3200);
  }

  // Application Router & Views
  const App = {
    currentRoute: '',
    
    init: function() {
      // Ensure initial seed in storage
      if (!localStorage.getItem('mypet_pets')) {
        Store.savePets(DEFAULT_PETS);
      }
      if (!localStorage.getItem('mypet_activities')) {
        Store.savePets(DEFAULT_PETS);
      }

      // Inject SVGs into hero and how-it-works
      App.renderStaticIllustrations();

      // Listen to Hash Changes
      window.addEventListener('hashchange', App.handleRoute);
      App.handleRoute();

      // Setup Add Pet wizard handlers
      App.initAddPetWizard();

      // Setup event delegates
      App.bindGlobalEvents();
    },

    renderStaticIllustrations: function() {
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

      // How it works cards now use custom illustration assets (step-create.png, step-tag.png, step-reunite.png)

      // Live collar demo tag on landing page
      const landingCollarQr = document.getElementById('landingCollarQr');
      if (landingCollarQr && window.MyPetQR) {
        const demoUrl = window.location.origin + window.location.pathname + '#p/luna-7x29';
        landingCollarQr.innerHTML = window.MyPetQR.generateSVG(demoUrl, { size: 140, margin: 1, darkColor: "#181d27" });
      }
    },

    toggleFaq: function(element) {
      if (element) {
        element.classList.toggle('open');
      }
    },

    openFinderSimulator: function(petCode = 'luna-7x29') {
      if (window.FinderSimulator) {
        window.FinderSimulator.open(petCode);
      }
    },

    handleRoute: function() {
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
        // When creating a pet tag: show login form if not logged in; after login route to dashboard
        if (!Store.isLoggedIn()) {
          App.showView('loginView');
        } else {
          App.showView('dashboardView');
          App.renderDashboard();
        }
        window.scrollTo({ top: 0, behavior: 'smooth' });
      } else if (hash === 'dashboard') {
        if (!Store.isLoggedIn()) {
          App.showView('loginView');
        } else {
          App.showView('dashboardView');
          App.renderDashboard();
        }
        window.scrollTo({ top: 0, behavior: 'smooth' });
      } else if (hash === 'add-pet') {
        if (!Store.isLoggedIn()) {
          App.showView('loginView');
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

    showView: function(viewId) {
      const el = document.getElementById(viewId);
      if (el) el.classList.add('active');
    },

    updateNav: function() {
      const hash = App.currentRoute;
      const demoRoleBtn = document.getElementById('demoRoleSwitcher');
      if (demoRoleBtn) {
        if (hash.startsWith('p/')) {
          demoRoleBtn.innerHTML = `<span>${window.AppIcons.get('user')} Finder View</span> · Switch to Owner`;
          demoRoleBtn.onclick = () => window.location.hash = '#dashboard';
        } else {
          demoRoleBtn.innerHTML = `<span>${window.AppIcons.get('cat')} Sarah (Owner)</span> · Test Finder Scan`;
          demoRoleBtn.onclick = () => window.location.hash = '#p/luna-7x29';
        }
      }

      const isLoggedIn = Store.isLoggedIn();
      const navDashboardLink = document.getElementById('navDashboardLink');
      if (navDashboardLink) {
        navDashboardLink.style.display = isLoggedIn ? 'inline-flex' : 'none';
      }

      const navAuthBtn = document.getElementById('navAuthBtn');
      if (navAuthBtn) {
        navAuthBtn.innerText = isLoggedIn ? 'Log Out' : 'Sign In';
        navAuthBtn.title = isLoggedIn ? 'Sign out of owner account' : 'Sign in to owner account';
      }
    },

    handleLoginSubmit: function(e) {
      if (e && e.preventDefault) e.preventDefault();
      const emailInput = document.getElementById('loginEmail');
      const email = emailInput ? emailInput.value.trim() : 'sarah@example.com';
      Store.setLoggedIn(true);
      showToast(`Welcome back! Signed in as ${email || 'Sarah Miller'}`);
      App.updateNav();
      window.location.hash = '#dashboard';
    },

    quickDemoLogin: function() {
      Store.setLoggedIn(true);
      showToast("Signed in as Sarah Miller (Demo Owner)");
      App.updateNav();
      window.location.hash = '#dashboard';
    },

    logout: function() {
      Store.setLoggedIn(false);
      showToast("You have been signed out.");
      App.updateNav();
      window.location.hash = '#landing';
    },

    toggleNavAuth: function() {
      if (Store.isLoggedIn()) {
        App.logout();
      } else {
        window.location.hash = '#login';
      }
    },

    // Helper: render pet avatar
    getPetAvatarMarkup: function(pet) {
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
      if (pet.species === 'cat') return window.PetIllustrations.avatars.catDefault;
      if (pet.species === 'dog') return window.PetIllustrations.avatars.dogDefault;
      if (pet.species === 'rabbit') return window.PetIllustrations.avatars.rabbitDefault;
      return window.PetIllustrations.avatars.otherDefault;
    },

    // =========================================================================
    // OWNER DASHBOARD RENDERING
    // =========================================================================
    renderDashboard: function() {
      const pets = Store.getPets();
      const grid = document.getElementById('dashboardPetsGrid');
      if (!grid) return;

      grid.innerHTML = pets.map(pet => {
        const avatarMarkup = App.getPetAvatarMarkup(pet);
        const isLost = pet.isLost;
        const statusBadge = isLost
          ? `<span class="status-badge lost">${window.AppIcons.get('alertCircle')} LOST</span>`
          : `<span class="status-badge active">TAG ACTIVE</span>`;

        let lostBanner = '';
        if (isLost && pet.lostInfo) {
          lostBanner = `
            <div class="lost-alert-banner">
              <strong>Missing since ${pet.lostInfo.lastSeenDate} · ${pet.lostInfo.lastSeenTime}</strong>
              <span>Last seen near: ${pet.lostInfo.lastSeenLocation}</span>
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
                <div class="pet-card-species">${pet.species.toUpperCase()} · ${pet.sex} · ${pet.age}</div>
                <div style="font-size: 13px; color: var(--muted); margin-top: 4px;">Breed: ${pet.breed}</div>
              </div>
            </div>

            ${lostBanner}

            <div class="pet-card-actions">
              <a href="#p/${pet.code}" class="btn btn-secondary btn-sm" target="_blank" title="Preview Public Profile">
                ${window.AppIcons.get('eye')} View Profile
              </a>
              <a href="#pets/${pet.id}/qr" class="btn btn-secondary btn-sm">
                ${window.AppIcons.get('qr')} QR Tag
              </a>
              <button class="btn btn-outline btn-sm" onclick="App.openLostPosterModal('${pet.id}')">
                ${window.AppIcons.get('poster')} Lost Poster
              </button>
              <button class="btn btn-secondary btn-sm" onclick="App.openEditPetModal('${pet.id}')">
                ${window.AppIcons.get('edit')} Edit
              </button>
              ${
                isLost
                  ? `<button class="btn btn-success btn-sm" onclick="App.toggleLostStatus('${pet.id}', false)">${window.AppIcons.get('check')} Mark Found</button>`
                  : `<button class="btn btn-danger btn-sm" onclick="App.openLostModeModal('${pet.id}')">${window.AppIcons.get('siren')} Mark as Lost</button>`
              }
            </div>
          </div>
        `;
      }).join('');

      // Render Dashboard Activity Log
      App.renderActivityFeed();
    },

    renderActivityFeed: function() {
      const feedContainer = document.getElementById('dashboardActivityList');
      if (!feedContainer) return;
      const activities = Store.getActivities();

      if (activities.length === 0) {
        feedContainer.innerHTML = `<li style="color: var(--muted); padding: 12px 0;">No recent activity yet. When someone scans your tag, it will appear here.</li>`;
        return;
      }

      feedContainer.innerHTML = activities.map(act => {
        const isFound = act.type === 'found';
        return `
          <li class="activity-item">
            <div class="activity-left">
              <div class="activity-icon ${isFound ? 'found' : 'scan'}">
                ${isFound ? window.AppIcons.get('paw') : window.AppIcons.get('qr')}
              </div>
              <div class="activity-text">
                <strong>${act.title} — ${act.petName}</strong>
                <span>${act.details}</span>
              </div>
            </div>
            <div style="font-size: 12px; color: var(--muted);">${act.time}</div>
          </li>
        `;
      }).join('');
    },

    // =========================================================================
    // QR TAG GENERATION VIEW
    // =========================================================================
    renderQrTagView: function(petId) {
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
      const qrSvg = window.MyPetQR.generateSVG(publicUrl, {
        size: 160,
        margin: 1,
        darkColor: "#181d27"
      });

      if (containerEl && window.PetIllustrations) {
        containerEl.innerHTML = window.PetIllustrations.physicalTagGraphic(pet.name, qrSvg);
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
          navigator.clipboard.writeText(publicUrl).then(() => {
            showToast("Profile link copied to clipboard!");
          }).catch(() => {
            showToast("Link: " + publicUrl);
          });
        };
      }

      const testFinderBtn = document.getElementById('btnTestFinderView');
      if (testFinderBtn) {
        testFinderBtn.href = `#p/${pet.code}`;
      }
    },

    downloadTagAsPng: function(pet, url) {
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
    renderPublicProfile: function(petCode) {
      const pet = Store.getPetByCode(petCode) || Store.getPets()[0];
      const container = document.getElementById('publicProfileCard');
      if (!container || !pet) return;

      const isLost = pet.isLost;
      const avatarMarkup = App.getPetAvatarMarkup(pet);

      const statusBadge = isLost
        ? `<div class="owner-status-pill missing">${window.AppIcons.get('alertCircle')} ${pet.name} is missing</div>`
        : `<div class="owner-status-pill safe">${window.AppIcons.get('checkCircle')} This pet has an owner</div>`;

      const greetingBlock = isLost
        ? `
          <div class="public-found-greeting" style="border-color: var(--red); background-color: #fff7f7;">
            <h3 style="color: var(--red);">${pet.name} is marked as lost!</h3>
            <p style="margin-bottom: 8px;">If you're with ${pet.name}, please contact her family right away.</p>
            ${
              pet.lostInfo ? `
                <div style="font-size: 13px; color: #b71c1c; background: #ffebee; padding: 8px 12px; border-radius: 8px; margin-top: 6px;">
                  <strong>Last seen:</strong> ${pet.lostInfo.lastSeenLocation} (${pet.lostInfo.lastSeenDate} · ${pet.lostInfo.lastSeenTime})
                </div>
              ` : ''
            }
          </div>
        `
        : `
          <div class="public-found-greeting">
            <h3>You've found ${pet.name}! ${window.AppIcons.get('paw')}</h3>
            <p>Thank you so much for helping ${pet.sex === 'Female' ? 'her' : 'him'} get back home safely.</p>
          </div>
        `;

      // Phone display based on owner privacy settings
      let phoneAction = '';
      if (pet.owner.showPhone && pet.owner.phone) {
        phoneAction = `
          <a href="tel:${pet.owner.phone}" class="btn btn-primary btn-lg" style="width: 100%;">
            ${window.AppIcons.get('phone')} Call Owner (${pet.owner.phone})
          </a>
        `;
      } else {
        phoneAction = `
          <button class="btn btn-primary btn-lg" style="width: 100%;" onclick="App.openFoundModal('${pet.id}')">
            ${window.AppIcons.get('phone')} Contact ${pet.name}'s Owner
          </button>
        `;
      }

      container.innerHTML = `
        <div class="public-profile-eyebrow">
          <span>${window.AppIcons.get('paw')}</span>
          <span>MY PET ID</span>
        </div>

        <div class="public-pet-portrait">
          ${avatarMarkup}
        </div>

        <h1 class="public-pet-name">${pet.name}</h1>
        <div class="public-pet-meta">${pet.species.toUpperCase()} · ${pet.sex} · ${pet.age}</div>

        ${statusBadge}

        ${greetingBlock}

        <div class="public-actions-stack">
          ${phoneAction}
          <button class="btn btn-secondary btn-lg" style="width: 100%;" onclick="App.openFoundModal('${pet.id}')">
            ${window.AppIcons.get('pin')} I Found This Pet
          </button>
        </div>

        <div class="public-about-section">
          <div class="public-about-title">
            <span>About ${pet.name}</span>
          </div>
          <ul class="public-attributes-list">
            <li><strong>Coat & Color:</strong> ${pet.color}</li>
            <li><strong>Breed:</strong> ${pet.breed}</li>
            <li><strong>Features:</strong> ${pet.distinguishingFeatures || 'None specified'}</li>
            ${pet.medicalNotes ? `<li><strong>Medical notes:</strong> ${pet.medicalNotes}</li>` : ''}
          </ul>
        </div>

        <div style="margin-top: 24px; font-size: 12.5px; color: var(--muted);">
          Protected by <strong>MyPet</strong> · A little tag. A big way home.
        </div>
      `;

      // Record automated scan activity in the background
      Store.addActivity({
        id: 'act-' + Date.now(),
        petId: pet.id,
        petName: pet.name,
        type: 'scan',
        title: 'QR Tag Scanned',
        details: 'Someone accessed ' + pet.name + '\'s public profile',
        time: 'Just now'
      });
    },

    // =========================================================================
    // "I FOUND THIS PET" RECOVERY MODAL & WORKFLOW
    // =========================================================================
    openFoundModal: function(petId) {
      const pet = Store.getPetById(petId) || Store.getPets()[0];
      const modal = document.getElementById('foundPetModal');
      if (!modal || !pet) return;

      document.getElementById('foundModalPetName').innerText = pet.name;
      document.querySelectorAll('.foundModalPetNameCopy').forEach(el => el.innerText = pet.name);
      document.getElementById('foundPetIdInput').value = pet.id;
      modal.classList.add('active');
    },

    closeModal: function(modalId) {
      const modal = document.getElementById(modalId);
      if (modal) modal.classList.remove('active');
    },

    submitFoundReport: function(e) {
      e.preventDefault();
      const petId = document.getElementById('foundPetIdInput').value;
      const pet = Store.getPetById(petId);
      if (!pet) return;

      const finderName = document.getElementById('finderNameInput').value || 'Kind Finder';
      const finderPhone = document.getElementById('finderPhoneInput').value || 'Not provided';
      const finderLocation = document.getElementById('finderLocationInput').value || 'Location shared';
      const finderMessage = document.getElementById('finderMessageInput').value || 'I am with your pet.';

      // Add to activity log for owner
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

      // Show reunion confirmation step
      alert(`Thank you, ${finderName}!\n\nAn instant notification with your message and location has been dispatched to ${pet.name}'s owner.\n\nOwner Contact: ${pet.owner.phone}\nOwner Email: ${pet.owner.email}`);
    },

    // Geolocation helper for finder
    useCurrentLocation: function() {
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
    // LOST MODE MODAL & LOGIC
    // =========================================================================
    openLostModeModal: function(petId) {
      const pet = Store.getPetById(petId);
      if (!pet) return;

      document.getElementById('lostModalPetName').innerText = pet.name;
      document.getElementById('lostPetIdInput').value = pet.id;
      document.getElementById('lostLocationInput').value = "Oakland Ave & 4th St";
      document.getElementById('lostDateInput').value = "Today";
      document.getElementById('lostTimeInput').value = "6:30 PM";

      document.getElementById('lostModeModal').classList.add('active');
    },

    saveLostMode: function(e) {
      e.preventDefault();
      const petId = document.getElementById('lostPetIdInput').value;
      const location = document.getElementById('lostLocationInput').value;
      const date = document.getElementById('lostDateInput').value;
      const time = document.getElementById('lostTimeInput').value;

      Store.updatePet(petId, {
        isLost: true,
        lostInfo: {
          lastSeenLocation: location,
          lastSeenDate: date,
          lastSeenTime: time
        }
      });

      App.closeModal('lostModeModal');
      showToast("Pet marked as LOST. Profile updated!");
      App.renderDashboard();

      // Offer immediate lost poster generation
      setTimeout(() => {
        if (confirm("Would you like to generate a neighborhood Lost Pet Poster and social flyer now?")) {
          App.openLostPosterModal(petId);
        }
      }, 500);
    },

    toggleLostStatus: function(petId, status) {
      Store.updatePet(petId, { isLost: status });
      showToast(status ? "Marked as lost" : "Marked as safe and found!");
      App.renderDashboard();
    },

    // =========================================================================
    // POSTER & FLYER MODAL HANDLERS
    // =========================================================================
    openLostPosterModal: function(petId) {
      const pet = Store.getPetById(petId) || Store.getPets()[0];
      if (!pet) return;

      if (window.MyPetPoster) {
        window.MyPetPoster.init(pet);
        // Pre-fill inputs
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
      document.getElementById('lostPosterModal').classList.add('active');
    },

    switchPosterTab: function(format) {
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
    // EDIT PET MODAL
    // =========================================================================
    openEditPetModal: function(petId) {
      const pet = Store.getPetById(petId);
      if (!pet) return;

      document.getElementById('editPetId').value = pet.id;
      document.getElementById('editPetName').value = pet.name;
      document.getElementById('editPetBreed').value = pet.breed;
      document.getElementById('editPetAge').value = pet.age;
      document.getElementById('editPetFeatures').value = pet.distinguishingFeatures;
      document.getElementById('editPetMedical').value = pet.medicalNotes || '';
      document.getElementById('editOwnerPhone').value = pet.owner.phone;
      document.getElementById('editShowPhone').checked = pet.owner.showPhone;

      document.getElementById('editPetModal').classList.add('active');
    },

    savePetEdits: function(e) {
      e.preventDefault();
      const petId = document.getElementById('editPetId').value;
      const patch = {
        name: document.getElementById('editPetName').value,
        breed: document.getElementById('editPetBreed').value,
        age: document.getElementById('editPetAge').value,
        distinguishingFeatures: document.getElementById('editPetFeatures').value,
        medicalNotes: document.getElementById('editPetMedical').value,
        owner: {
          phone: document.getElementById('editOwnerPhone').value,
          showPhone: document.getElementById('editShowPhone').checked,
          email: "sarah@example.com",
          allowSmsRelay: true
        }
      };

      Store.updatePet(petId, patch);
      App.closeModal('editPetModal');
      showToast("Pet profile updated!");
      App.renderDashboard();
    },

    // =========================================================================
    // ADD PET MULTI-STEP WIZARD (5 STEPS)
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

    initAddPetWizard: function() {
      // Species option clicks
      document.querySelectorAll('.species-card-option').forEach(card => {
        card.addEventListener('click', () => {
          document.querySelectorAll('.species-card-option').forEach(c => c.classList.remove('selected'));
          card.classList.add('selected');
          App.wizardState.species = card.dataset.species;
          // Set default avatar for species
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

    resetAddPetWizard: function() {
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
        phone: '(555) 234-5678',
        email: 'sarah@example.com',
        showPhone: true,
        showEmail: false,
        allowSmsRelay: true
      };
      App.goToWizardStep(1);
    },

    goToWizardStep: function(stepNum) {
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

      // Update back button visibility
      const backBtn = document.getElementById('wizardBackBtn');
      if (backBtn) {
        backBtn.style.visibility = stepNum === 1 ? 'hidden' : 'visible';
      }

      // Next / finish button text
      const nextBtn = document.getElementById('wizardNextBtn');
      if (nextBtn) {
        nextBtn.innerHTML = stepNum === 5 ? `Create QR Tag ${window.AppIcons.get('paw')}` : 'Continue &rarr;';
      }
    },

    wizardNext: function() {
      const step = App.wizardState.step;
      if (step === 1) {
        const nameInput = document.getElementById('newPetName').value.trim();
        if (!nameInput) {
          alert("Please enter your pet's name");
          return;
        }
        App.wizardState.name = nameInput;
        // Update name in subsequent steps
        document.querySelectorAll('.dynamic-pet-name').forEach(el => el.innerText = nameInput);
      } else if (step === 3) {
        App.wizardState.breed = document.getElementById('newPetBreed').value.trim() || 'Mixed';
        App.wizardState.sex = document.getElementById('newPetSex').value;
        App.wizardState.age = document.getElementById('newPetAge').value.trim() || 'Unknown';
        App.wizardState.color = document.getElementById('newPetColor').value.trim() || 'Mixed';
        App.wizardState.features = document.getElementById('newPetFeatures').value.trim();
      } else if (step === 5) {
        // Finalize pet creation
        App.wizardState.phone = document.getElementById('newPetPhone').value;
        App.wizardState.email = document.getElementById('newPetEmail').value;
        App.wizardState.showPhone = document.getElementById('newPetShowPhone').checked;
        App.wizardState.showEmail = document.getElementById('newPetShowEmail').checked;

        App.finalizeNewPet();
        return;
      }
      App.goToWizardStep(step + 1);
    },

    wizardPrev: function() {
      if (App.wizardState.step > 1) {
        App.goToWizardStep(App.wizardState.step - 1);
      }
    },

    finalizeNewPet: function() {
      const pets = Store.getPets();
      const randomCode = App.wizardState.name.toLowerCase().replace(/[^a-z0-9]/g, '') + '-' + Math.random().toString(36).substring(2, 6);
      const newPet = {
        id: 'pet-' + Date.now(),
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
        medicalNotes: "Up to date on vaccines.",
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

      pets.push(newPet);
      Store.savePets(pets);

      showToast(`Created QR tag for ${newPet.name}!`);
      // Route immediately to the newly generated QR Tag page
      window.location.hash = `#pets/${newPet.id}/qr`;
    },

    bindGlobalEvents: function() {
      // Close modals on backdrop click
      document.querySelectorAll('.modal-backdrop').forEach(modal => {
        modal.addEventListener('click', (e) => {
          if (e.target === modal) modal.classList.remove('active');
        });
      });
    }
  };

  // Expose to window
  window.App = App;

  // Initialize once DOM is ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', App.init);
  } else {
    App.init();
  }
})();
