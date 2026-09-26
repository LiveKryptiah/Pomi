/**
 * MyPet Physical Tag Studio & Customizer
 * Interactive 3D flip preview (Front: QR Code / Back: Laser Engraving),
 * Shapes, Materials, Collar preview matching, and Mock Order Checkout.
 */

(function(root) {
  'use strict';

  const DEFAULT_ORDERS = [
    {
      id: "ord-8492",
      petId: "pet-1",
      petName: "Luna",
      shape: "round",
      material: "enamel",
      hardware: "brass",
      collar: "pink",
      engravingLine1: "LUNA",
      engravingLine2: "(555) 234-5678",
      engravingPhrase: "I'm microchipped & loved",
      totalPrice: "$16.00",
      status: "in_production", // 'in_production' | 'quality_check' | 'shipped'
      trackingNumber: "MP-USPS-89240192",
      orderDate: "September 24, 2026",
      estimatedDelivery: "September 28, 2026",
      shippingAddress: "742 Evergreen Terrace, Springfield, OR"
    }
  ];

  const MyPetTagStudio = {
    currentPet: null,
    isFlipped: false,
    state: {
      shape: 'round', // 'round' | 'shield' | 'hexagon' | 'bone'
      material: 'enamel', // 'enamel' | 'brass' | 'obsidian' | 'rosegold' | 'glow'
      hardware: 'brass', // 'silver' | 'brass' | 'black'
      collar: 'pink', // 'pink' | 'leather' | 'olive' | 'navy'
      engravingLine1: '',
      engravingLine2: '',
      engravingPhrase: "I'm microchipped & loved",
      price: 16.00
    },

    init: function(pet) {
      MyPetTagStudio.currentPet = pet;
      MyPetTagStudio.isFlipped = false;
      MyPetTagStudio.state.engravingLine1 = pet.name.toUpperCase();
      MyPetTagStudio.state.engravingLine2 = pet.owner.phone || '(555) 234-5678';
      MyPetTagStudio.state.engravingPhrase = "I'm microchipped & loved";
      
      // Default collar color preference based on pet
      if (pet.species === 'dog') {
        MyPetTagStudio.state.collar = 'leather';
        MyPetTagStudio.state.shape = 'bone';
        MyPetTagStudio.state.material = 'brass';
      } else {
        MyPetTagStudio.state.collar = 'pink';
        MyPetTagStudio.state.shape = 'round';
        MyPetTagStudio.state.material = 'enamel';
      }

      MyPetTagStudio.syncInputControls();
      MyPetTagStudio.renderPreview();
    },

    syncInputControls: function() {
      // Shape buttons
      document.querySelectorAll('.shape-opt-btn').forEach(btn => {
        btn.classList.toggle('active', btn.dataset.shape === MyPetTagStudio.state.shape);
      });

      // Material buttons
      document.querySelectorAll('.material-opt-btn').forEach(btn => {
        btn.classList.toggle('active', btn.dataset.material === MyPetTagStudio.state.material);
      });

      // Hardware buttons
      document.querySelectorAll('.hardware-opt-btn').forEach(btn => {
        btn.classList.toggle('active', btn.dataset.hardware === MyPetTagStudio.state.hardware);
      });

      // Collar buttons
      document.querySelectorAll('.collar-opt-btn').forEach(btn => {
        btn.classList.toggle('active', btn.dataset.collar === MyPetTagStudio.state.collar);
      });

      // Text inputs
      const line1Input = document.getElementById('engraveLine1Input');
      if (line1Input) line1Input.value = MyPetTagStudio.state.engravingLine1;

      const line2Input = document.getElementById('engraveLine2Input');
      if (line2Input) line2Input.value = MyPetTagStudio.state.engravingLine2;

      const phraseInput = document.getElementById('engravePhraseInput');
      if (phraseInput) phraseInput.value = MyPetTagStudio.state.engravingPhrase;
    },

    setShape: function(shape) {
      MyPetTagStudio.state.shape = shape;
      MyPetTagStudio.syncInputControls();
      MyPetTagStudio.renderPreview();
    },

    setMaterial: function(material) {
      MyPetTagStudio.state.material = material;
      MyPetTagStudio.syncInputControls();
      MyPetTagStudio.renderPreview();
    },

    setHardware: function(hardware) {
      MyPetTagStudio.state.hardware = hardware;
      MyPetTagStudio.syncInputControls();
      MyPetTagStudio.renderPreview();
    },

    setCollar: function(collar) {
      MyPetTagStudio.state.collar = collar;
      MyPetTagStudio.syncInputControls();
      MyPetTagStudio.renderPreview();
    },

    updateEngraving: function(key, val) {
      MyPetTagStudio.state[key] = val;
      MyPetTagStudio.renderPreview();
    },

    toggleFlip: function() {
      MyPetTagStudio.isFlipped = !MyPetTagStudio.isFlipped;
      const cardEl = document.getElementById('tag3dCard');
      if (cardEl) {
        cardEl.classList.toggle('is-flipped', MyPetTagStudio.isFlipped);
      }
      const flipBtn = document.getElementById('btnTagFlip');
      if (flipBtn) {
        flipBtn.innerHTML = MyPetTagStudio.isFlipped 
          ? `🔄 Flip to Front (QR Code)` 
          : `🔄 Flip to Back (Engraving)`;
      }
    },

    renderPreview: function() {
      const pet = MyPetTagStudio.currentPet;
      if (!pet) return;

      const publicUrl = window.location.origin + window.location.pathname + '#p/' + pet.code;
      
      // QR Code for front face
      const qrSvg = window.MyPetQR.generateSVG(publicUrl, {
        size: 130,
        margin: 1,
        darkColor: MyPetTagStudio.getQrColor()
      });

      // Update collar strap background
      const strapEl = document.getElementById('collarStrapPreview');
      if (strapEl) {
        strapEl.className = `collar-strap strap-${MyPetTagStudio.state.collar}`;
      }

      // Update split ring hardware finish
      const ringEl = document.getElementById('tagSplitRingPreview');
      if (ringEl) {
        ringEl.className = `tag-split-ring ring-${MyPetTagStudio.state.hardware}`;
      }

      // Update 3D card classes (shape & material)
      const cardEl = document.getElementById('tag3dCard');
      if (cardEl) {
        cardEl.className = `tag-3d-card shape-${MyPetTagStudio.state.shape} material-${MyPetTagStudio.state.material} ${MyPetTagStudio.isFlipped ? 'is-flipped' : ''}`;
      }

      // Front Face HTML
      const frontTarget = document.getElementById('tagFaceFront');
      if (frontTarget) {
        frontTarget.innerHTML = `
          <div class="tag-face-content front-content">
            <div class="tag-eyelet-hole ring-${MyPetTagStudio.state.hardware}"></div>
            <div class="tag-face-header">
              <span class="tag-paw-icon">🐾</span>
              <span class="tag-title-text">MyPet</span>
            </div>
            <div class="tag-qr-wrapper">
              ${qrSvg}
            </div>
            <div class="tag-face-petname">${pet.name.toUpperCase()}</div>
            <div class="tag-face-caption">Scan to reach family</div>
          </div>
        `;
      }

      // Back Face HTML (Laser Engraved)
      const backTarget = document.getElementById('tagFaceBack');
      if (backTarget) {
        backTarget.innerHTML = `
          <div class="tag-face-content back-content">
            <div class="tag-eyelet-hole ring-${MyPetTagStudio.state.hardware}"></div>
            <div class="engraved-shield-icon">🛡️</div>
            <div class="engraved-petname">${MyPetTagStudio.state.engravingLine1 || pet.name.toUpperCase()}</div>
            <div class="engraved-phone">${MyPetTagStudio.state.engravingLine2 || pet.owner.phone}</div>
            <div class="engraved-phrase">${MyPetTagStudio.state.engravingPhrase}</div>
            <div class="engraved-url">mypet.app/p/${pet.code}</div>
          </div>
        `;
      }
    },

    getQrColor: function() {
      // Obsidian has high contrast dark background
      if (MyPetTagStudio.state.material === 'obsidian') {
        return '#ffffff';
      }
      return '#121212';
    },

    // =========================================================================
    // CHECKOUT & ORDER DISPATCH
    // =========================================================================
    openCheckoutModal: function() {
      const pet = MyPetTagStudio.currentPet;
      if (!pet) return;

      document.getElementById('checkoutPetName').innerText = pet.name;
      document.getElementById('checkoutSummaryText').innerText = 
        `${pet.name}'s Custom ${MyPetTagStudio.capitalize(MyPetTagStudio.state.shape)} Tag (${MyPetTagStudio.capitalize(MyPetTagStudio.state.material)})`;
      document.getElementById('checkoutPriceText').innerText = `$${MyPetTagStudio.state.price.toFixed(2)} USD (Free Shipping)`;

      document.getElementById('tagCheckoutModal').classList.add('active');
    },

    submitOrder: function(e) {
      e.preventDefault();
      const pet = MyPetTagStudio.currentPet;
      if (!pet) return;

      const recipientName = document.getElementById('shipNameInput').value.trim() || pet.owner.name;
      const street = document.getElementById('shipAddressInput').value.trim() || '123 Meadow Lane';
      const city = document.getElementById('shipCityInput').value.trim() || 'Portland';
      const postal = document.getElementById('shipPostalInput').value.trim() || '97201';
      const fullAddress = `${street}, ${city} ${postal}`;

      const newOrder = {
        id: "ord-" + Math.floor(1000 + Math.random() * 9000),
        petId: pet.id,
        petName: pet.name,
        shape: MyPetTagStudio.state.shape,
        material: MyPetTagStudio.state.material,
        hardware: MyPetTagStudio.state.hardware,
        collar: MyPetTagStudio.state.collar,
        engravingLine1: MyPetTagStudio.state.engravingLine1,
        engravingLine2: MyPetTagStudio.state.engravingLine2,
        engravingPhrase: MyPetTagStudio.state.engravingPhrase,
        totalPrice: `$${MyPetTagStudio.state.price.toFixed(2)}`,
        status: "in_production",
        trackingNumber: "MP-PRIORITY-" + Math.floor(10000000 + Math.random() * 90000000),
        orderDate: new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' }),
        estimatedDelivery: new Date(Date.now() + 4 * 24 * 60 * 60 * 1000).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' }),
        shippingAddress: fullAddress
      };

      const orders = MyPetTagStudio.getOrders();
      orders.unshift(newOrder);
      MyPetTagStudio.saveOrders(orders);

      // Persist to Python SQLite Database
      if (window.ApiClient) {
        window.ApiClient.createOrder(newOrder).then(() => {
          if (window.App && typeof window.App.checkDatabaseHealth === 'function') {
            window.App.checkDatabaseHealth();
          }
        }).catch(err => {
          console.warn("[TagStudio] Order save error:", err);
        });
      }

      // Close checkout and studio modals
      if (window.App && typeof window.App.closeModal === 'function') {
        window.App.closeModal('tagCheckoutModal');
        window.App.closeModal('tagStudioModal');
        window.App.showToast(`Order confirmed for ${pet.name}'s Tag! Saved to SQLite database. 🎉`);
      }

      // Refresh dashboard if active
      if (window.App && typeof window.App.renderDashboard === 'function') {
        window.App.renderDashboard();
      }

      alert(`🎉 Order Confirmed!\n\nThank you, ${recipientName}!\n\n${pet.name}'s custom ${newOrder.material} tag is now queued for precision laser engraving in SQLite.\n\nTracking Number: ${newOrder.trackingNumber}\nEstimated Delivery: ${newOrder.estimatedDelivery}\n\nYou can track production in your Owner Dashboard at any time.`);
    },

    syncWithBackend: async function() {
      if (!window.ApiClient) return;
      try {
        const orders = await window.ApiClient.getOrders();
        if (Array.isArray(orders) && orders.length > 0) {
          MyPetTagStudio.saveOrders(orders);
          if (window.App && typeof window.App.renderOrdersTracker === 'function') {
            window.App.renderOrdersTracker();
          }
        }
      } catch (e) {}
    },

    getOrders: function() {
      try {
        const stored = localStorage.getItem('mypet_orders');
        return stored ? JSON.parse(stored) : DEFAULT_ORDERS;
      } catch (e) {
        return DEFAULT_ORDERS;
      }
    },

    saveOrders: function(orders) {
      try {
        localStorage.setItem('mypet_orders', JSON.stringify(orders));
      } catch (e) {}
    },

    capitalize: function(str) {
      return str.charAt(0).toUpperCase() + str.slice(1);
    }
  };

  root.MyPetTagStudio = MyPetTagStudio;
})(typeof window !== "undefined" ? window : this);
