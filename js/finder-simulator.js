/**
 * Finder Camera Viewfinder Simulator
 * Simulates a realistic iOS / smartphone camera scanning a pet tag in 0.4 seconds.
 * Synthesizes Apple-style scan chimes natively via Web Audio API.
 * Strict: 0 Unicode emojis across all DOM templates.
 */

(function() {
  'use strict';

  let audioCtx = null;
  let scanTimer = null;
  let autoOpenTimer = null;
  let isScanning = false;

  const FinderSimulator = {
    modal: null,
    reticle: null,
    banner: null,
    profileSheet: null,
    laserBeam: null,
    activePet: null,

    init() {
      this.modal = document.getElementById('finderSimulatorModal');
      if (!this.modal) return;

      this.reticle = document.getElementById('finderReticle');
      this.banner = document.getElementById('finderScanBanner');
      this.profileSheet = document.getElementById('finderProfileSheet');
      this.laserBeam = document.getElementById('finderLaserBeam');

      // Close on backdrop click or ESC key
      this.modal.addEventListener('click', (e) => {
        if (e.target === this.modal || e.target.classList.contains('finder-backdrop-close')) {
          this.close();
        }
      });

      document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && this.modal && this.modal.classList.contains('active')) {
          this.close();
        }
      });
    },

    getAudioContext() {
      if (!audioCtx) {
        const AudioContextClass = window.AudioContext || window.webkitAudioContext;
        if (AudioContextClass) {
          audioCtx = new AudioContextClass();
        }
      }
      if (audioCtx && audioCtx.state === 'suspended') {
        audioCtx.resume();
      }
      return audioCtx;
    },

    /**
     * Synthesizes an authentic Apple-style dual-tone camera scan chime
     * Tone 1: 880Hz (A5), Tone 2: 1760Hz (A6) with smooth exponential decay.
     */
    playScanChime() {
      try {
        const ctx = this.getAudioContext();
        if (!ctx) return;

        const now = ctx.currentTime;
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();

        osc.type = 'sine';
        osc.frequency.setValueAtTime(880, now);
        osc.frequency.setValueAtTime(1760, now + 0.07);

        gain.gain.setValueAtTime(0.001, now);
        gain.gain.exponentialRampToValueAtTime(0.18, now + 0.02);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.28);

        osc.connect(gain);
        gain.connect(ctx.destination);

        osc.start(now);
        osc.stop(now + 0.30);
      } catch (err) {
        // Audio synthesis fallback (silent)
      }
    },

    /**
     * Synthesizes a soft camera shutter click
     */
    playShutterSound() {
      try {
        const ctx = this.getAudioContext();
        if (!ctx) return;

        const now = ctx.currentTime;
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();

        osc.type = 'triangle';
        osc.frequency.setValueAtTime(320, now);
        osc.frequency.exponentialRampToValueAtTime(80, now + 0.05);

        gain.gain.setValueAtTime(0.14, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.06);

        osc.connect(gain);
        gain.connect(ctx.destination);

        osc.start(now);
        osc.stop(now + 0.07);
      } catch (err) {
        // Silent fallback
      }
    },

    open(petCode = 'luna-7x29') {
      if (!this.modal) this.init();
      if (!this.modal) return;

      // Resume audio context on user gesture
      this.getAudioContext();

      // Retrieve pet data
      if (window.Store && typeof window.Store.getPetByCode === 'function') {
        this.activePet = window.Store.getPetByCode(petCode) || window.Store.getPets()[0];
      } else {
        this.activePet = {
          name: 'Luna',
          species: 'cat',
          breed: 'Domestic Shorthair',
          sex: 'Female',
          age: '3 years old',
          avatarCustom: 'images/pet-luna.png',
          isLost: false,
          owner: {
            name: 'Sarah Miller',
            phone: '(555) 234-5678',
            email: 'sarah@example.com',
            showPhone: true
          }
        };
      }

      this.populateProfileSheet();

      // Show modal
      this.modal.classList.add('active');
      document.body.style.overflow = 'hidden';

      // Start scan sequence
      this.startScanSequence();
    },

    startScanSequence() {
      this.resetVisuals();
      isScanning = true;

      // Reticle scanning state
      if (this.reticle) {
        this.reticle.classList.remove('locked');
        this.reticle.classList.add('scanning');
      }
      if (this.laserBeam) {
        this.laserBeam.classList.add('active');
      }

      // Exactly 0.4 seconds (400ms) to scan and lock natively
      scanTimer = setTimeout(() => {
        if (!isScanning) return;
        this.triggerScanSuccess();
      }, 420);
    },

    triggerScanSuccess() {
      isScanning = false;

      // 1. Lock reticle and play camera chime
      if (this.reticle) {
        this.reticle.classList.remove('scanning');
        this.reticle.classList.add('locked');
      }
      if (this.laserBeam) {
        this.laserBeam.classList.remove('active');
      }

      this.playScanChime();

      // 2. Drop the iOS Safari banner from Dynamic Island
      if (this.banner) {
        this.banner.classList.add('visible');
      }

      // 3. Auto slide up the profile sheet after user sees the notification banner
      autoOpenTimer = setTimeout(() => {
        this.showProfileSheet();
      }, 1050);
    },

    showProfileSheet() {
      if (this.profileSheet) {
        this.profileSheet.classList.add('open');
      }
      if (this.banner) {
        this.banner.classList.remove('visible');
      }
    },

    hideProfileSheet() {
      if (this.profileSheet) {
        this.profileSheet.classList.remove('open');
      }
    },

    resetVisuals() {
      clearTimeout(scanTimer);
      clearTimeout(autoOpenTimer);
      isScanning = false;

      if (this.reticle) {
        this.reticle.classList.remove('scanning', 'locked');
      }
      if (this.laserBeam) {
        this.laserBeam.classList.remove('active');
      }
      if (this.banner) {
        this.banner.classList.remove('visible');
      }
      this.hideProfileSheet();
    },

    restartScan() {
      this.playShutterSound();
      this.resetVisuals();
      setTimeout(() => {
        this.startScanSequence();
      }, 120);
    },

    close() {
      this.resetVisuals();
      if (this.modal) {
        this.modal.classList.remove('active');
      }
      document.body.style.overflow = '';
    },

    populateProfileSheet() {
      if (!this.profileSheet || !this.activePet) return;

      const pet = this.activePet;
      const petName = pet.name || 'Luna';
      const ownerName = (pet.owner && pet.owner.name) || 'Sarah Miller';
      const ownerPhone = (pet.owner && pet.owner.phone) || '(555) 234-5678';
      const breed = pet.breed || 'Domestic Shorthair';
      const sex = pet.sex || 'Female';
      const age = pet.age || '3 years old';
      const avatarSrc = pet.avatarCustom || (petName.toLowerCase() === 'luna' ? 'images/pet-luna.png' : `images/species-${pet.species || 'cat'}.png`);

      const content = document.getElementById('finderSheetContent');
      if (!content) return;

      const iconPaw = window.AppIcons ? window.AppIcons.get('paw') : '';
      const iconPhone = window.AppIcons ? window.AppIcons.get('phone') : '';
      const iconPin = window.AppIcons ? window.AppIcons.get('pin') : '';
      const iconCheck = window.AppIcons ? window.AppIcons.get('checkCircle') : '';
      const iconShield = window.AppIcons ? window.AppIcons.get('lock') : '';

      content.innerHTML = `
        <div class="finder-sheet-header">
          <div class="finder-sheet-pill-tag">
            <span class="sheet-status-dot"></span>
            <span>TAG ACTIVE · ENCRYPTED CLOUD PROFILE</span>
          </div>
        </div>

        <div class="finder-sheet-pet-hero">
          <div class="finder-sheet-avatar-wrap">
            <img src="${avatarSrc}" alt="${petName}" class="finder-sheet-avatar-img" />
          </div>
          <div class="finder-sheet-hero-text">
            <h3 class="finder-sheet-name">${petName}</h3>
            <div class="finder-sheet-meta">${breed} · ${sex} · ${age}</div>
            <div class="finder-sheet-badge-safe">${iconCheck} Safe & Registered Companion</div>
          </div>
        </div>

        <div class="finder-sheet-actions">
          <button type="button" class="btn btn-primary finder-action-btn" onclick="FinderSimulator.simulateCall('${ownerPhone}')">
            ${iconPhone} Call Owner (${ownerName})
          </button>
          <button type="button" class="btn btn-secondary finder-action-btn" onclick="FinderSimulator.simulateSendGps()">
            ${iconPin} Share Current GPS Location
          </button>
        </div>

        <div class="finder-sheet-details">
          <div class="finder-detail-row">
            <span class="detail-label">Distinguishing Traits:</span>
            <span class="detail-val">${pet.distinguishingFeatures || 'Friendly, green eyes, wearing a pink collar'}</span>
          </div>
          <div class="finder-detail-row">
            <span class="detail-label">Emergency Medical:</span>
            <span class="detail-val">${pet.medicalNotes || 'Microchipped, all core vaccinations up to date'}</span>
          </div>
          <div class="finder-detail-row">
            <span class="detail-label">Privacy Shield:</span>
            <span class="detail-val">${iconShield} Protected by Owner Relay Protocol</span>
          </div>
        </div>
      `;
    },

    simulateCall(phone) {
      this.playShutterSound();
      if (window.App && typeof window.App.showToast === 'function') {
        window.App.showToast(`Connecting to ${phone}... (Simulated call placed)`);
      } else {
        alert(`Connecting call to ${phone}... (Simulated action)`);
      }
    },

    simulateSendGps() {
      this.playScanChime();
      if (window.App && typeof window.App.showToast === 'function') {
        window.App.showToast('Street-level GPS coordinates (37.7749° N, 122.4194° W) securely relayed to Sarah!');
      } else {
        alert('Street-level GPS coordinates (37.7749° N, 122.4194° W) securely relayed to Sarah!');
      }
    }
  };

  // Expose globally
  window.FinderSimulator = FinderSimulator;

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => FinderSimulator.init());
  } else {
    FinderSimulator.init();
  }
})();
