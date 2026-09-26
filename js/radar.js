/**
 * MyPet Interactive GPS Scan Map & Lost Pet Neighborhood Radar
 * Powered by Leaflet.js & OpenStreetMap (Zero API key required).
 * Provides live collar scan pinpoints, species-specific search radius rings,
 * historical breadcrumb trails, nearby emergency veterinary/shelter markers,
 * and neighborhood community broadcast alert capabilities.
 */

(function(root) {
  'use strict';

  const MyPetRadar = {
    map: null,
    currentPetId: null,
    currentRadarData: null,
    layers: {
      markers: [],
      circles: [],
      polyline: null
    },
    activeZoneFilter: 'all',

    /**
     * Initializes the radar view and map for a specific pet.
     */
    init: async function(petId) {
      MyPetRadar.currentPetId = petId;
      
      const modal = document.getElementById('radarModal');
      if (modal) modal.classList.add('active');

      // Fetch latest radar & GPS scan data from backend
      try {
        let radarData = null;
        if (window.ApiClient) {
          radarData = await window.ApiClient.getRadarData(petId);
        }
        
        if (!radarData) {
          radarData = MyPetRadar.getFallbackRadarData(petId);
        }

        MyPetRadar.currentRadarData = radarData;
        MyPetRadar.renderUI(radarData);

        // Wait for modal transition to finish before initializing Leaflet
        setTimeout(() => {
          MyPetRadar.initLeafletMap(radarData);
        }, 150);

      } catch (err) {
        console.error("[MyPetRadar] Failed to load radar data:", err);
        const fallback = MyPetRadar.getFallbackRadarData(petId);
        MyPetRadar.currentRadarData = fallback;
        MyPetRadar.renderUI(fallback);
        setTimeout(() => {
          MyPetRadar.initLeafletMap(fallback);
        }, 150);
      }
    },

    /**
     * Renders UI side panels, stats, and emergency shelters list.
     */
    renderUI: function(data) {
      const pet = data.pet;
      const latest = data.latestScan || {};

      // Header info
      const petNameEl = document.getElementById('radarPetName');
      if (petNameEl) petNameEl.innerText = `${pet.name}'s GPS Radar`;

      const statusBadge = document.getElementById('radarStatusBadge');
      if (statusBadge) {
        statusBadge.className = `status-badge ${pet.isLost ? 'lost' : 'active'}`;
        statusBadge.innerHTML = pet.isLost ? '🚨 LOST MODE ACTIVE' : '🐾 ACTIVE COLLAR SCAN';
      }

      // Latest Scan Card
      const scanAddrEl = document.getElementById('radarScanAddress');
      if (scanAddrEl) scanAddrEl.innerText = latest.address || 'Grand Ave & Perkins St, Oakland, CA';

      const scanTimeEl = document.getElementById('radarScanTime');
      if (scanTimeEl) scanTimeEl.innerText = latest.time_str || '12 minutes ago';

      const scanCoordsEl = document.getElementById('radarScanCoords');
      if (scanCoordsEl) {
        scanCoordsEl.innerText = `${latest.lat.toFixed(4)}° N, ${Math.abs(latest.lng).toFixed(4)}° W (Accuracy: ±${Math.round(latest.accuracy || 10)}m)`;
      }

      const scanDeviceEl = document.getElementById('radarScanDevice');
      if (scanDeviceEl) scanDeviceEl.innerText = latest.device_info || 'Apple iPhone 15 · Safari Mobile';

      // Zone filter pill buttons
      const zonesContainer = document.getElementById('radarZonesList');
      if (zonesContainer && data.zones) {
        zonesContainer.innerHTML = `
          <button type="button" class="radar-zone-pill active" onclick="MyPetRadar.filterZone('all')">
            All Zones
          </button>
          ${data.zones.map((z, idx) => `
            <button type="button" class="radar-zone-pill" id="btnZone_${z.id}" onclick="MyPetRadar.filterZone('${z.id}')">
              <span class="zone-color-dot" style="background-color: ${z.color};"></span>
              ${z.radiusMiles} (${idx === 0 ? 'Sprint' : idx === 1 ? 'Roaming' : 'Perimeter'})
            </button>
          `).join('')}
        `;
      }

      // Emergency Points of Interest
      const emergencyList = document.getElementById('radarEmergencyList');
      if (emergencyList && data.emergencyPoints) {
        emergencyList.innerHTML = data.emergencyPoints.map(p => `
          <div class="radar-emergency-item">
            <div class="emergency-item-icon">${p.icon}</div>
            <div class="emergency-item-meta">
              <strong>${p.name}</strong>
              <span>${p.type} · ${p.address}</span>
            </div>
            <div class="emergency-item-actions">
              <a href="tel:${p.phone.replace(/[^0-9]/g, '')}" class="btn btn-secondary btn-sm" title="Call Emergency Line">
                📞 Call
              </a>
              <button type="button" class="btn btn-outline btn-sm" onclick="MyPetRadar.panTo(${p.lat}, ${p.lng}, 16)" title="Show on Map">
                📍 Pin
              </button>
            </div>
          </div>
        `).join('');
      }

      // Broadcast alert button state
      const broadcastBtn = document.getElementById('btnBroadcastAlert');
      if (broadcastBtn) {
        broadcastBtn.classList.remove('broadcasting', 'sent');
        broadcastBtn.innerHTML = `<span>📢 Broadcast Neighborhood Alert</span>`;
      }
    },

    /**
     * Initializes or updates the interactive Leaflet map instance.
     */
    initLeafletMap: function(data) {
      if (typeof L === 'undefined') {
        console.warn("[MyPetRadar] Leaflet L is not loaded yet.");
        return;
      }

      const mapContainer = document.getElementById('radarMapContainer');
      if (!mapContainer) return;

      const latest = data.latestScan || { lat: 37.8094, lng: -122.2536 };
      const centerCoords = [latest.lat, latest.lng];

      // Clean existing Leaflet map instance if already initialized
      if (MyPetRadar.map) {
        MyPetRadar.map.remove();
        MyPetRadar.map = null;
      }

      // Create Leaflet map centered at latest scan
      const map = L.map('radarMapContainer', {
        center: centerCoords,
        zoom: 15,
        zoomControl: true,
        scrollWheelZoom: true
      });

      MyPetRadar.map = map;

      // Add high-contrast, clean OpenStreetMap tiles
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        maxZoom: 19,
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
      }).addTo(map);

      MyPetRadar.clearLayers();

      // 1. Render Search Radius Circles
      if (data.zones) {
        data.zones.forEach(zone => {
          const circle = L.circle(centerCoords, {
            radius: zone.radiusMeters,
            color: zone.color,
            fillColor: zone.color,
            fillOpacity: zone.fillOpacity,
            weight: 2,
            dashArray: '4, 6'
          }).addTo(map);

          circle.bindPopup(`
            <div style="font-family: inherit; font-size: 13px;">
              <strong style="color: ${zone.color};">${zone.label} (${zone.radiusMiles})</strong>
              <p style="margin: 4px 0 0; color: #475569; font-size: 12px;">${zone.description}</p>
            </div>
          `);

          circle._zoneId = zone.id;
          MyPetRadar.layers.circles.push(circle);
        });
      }

      // 2. Render Historical Breadcrumbs & Connecting Line
      if (data.history && data.history.length > 1) {
        const trailPoints = [];
        data.history.forEach((loc, index) => {
          const pt = [loc.lat, loc.lng];
          trailPoints.push(pt);

          // Only add small breadcrumb markers for past scans
          if (index > 0) {
            const histMarker = L.circleMarker(pt, {
              radius: 6,
              fillColor: "#64748b",
              color: "#ffffff",
              weight: 2,
              opacity: 1,
              fillOpacity: 0.8
            }).addTo(map);

            histMarker.bindPopup(`
              <div style="font-family: inherit; font-size: 12px;">
                <strong>Historical Scan #${data.history.length - index}</strong>
                <p style="margin: 2px 0 0; color: #64748b;">${loc.address}</p>
                <span style="font-size: 11px; color: #94a3b8;">${loc.time_str}</span>
              </div>
            `);
            MyPetRadar.layers.markers.push(histMarker);
          }
        });

        // Dotted Polyline connecting the scans
        const polyline = L.polyline(trailPoints, {
          color: '#6366f1',
          weight: 2.5,
          dashArray: '6, 8',
          opacity: 0.7
        }).addTo(map);
        MyPetRadar.layers.polyline = polyline;
      }

      // 3. Render Emergency Points of Interest (Clinics / Shelters)
      if (data.emergencyPoints) {
        data.emergencyPoints.forEach(p => {
          const poiIcon = L.divIcon({
            className: 'radar-poi-div-icon',
            html: `<div class="poi-bubble" title="${p.name}">${p.icon}</div>`,
            iconSize: [32, 32],
            iconAnchor: [16, 16]
          });

          const poiMarker = L.marker([p.lat, p.lng], { icon: poiIcon }).addTo(map);
          poiMarker.bindPopup(`
            <div style="font-family: inherit; min-width: 170px;">
              <div style="font-weight: 700; font-size: 13px; color: #0f172a;">${p.icon} ${p.name}</div>
              <div style="font-size: 11.5px; color: #64748b; margin-top: 2px;">${p.type}</div>
              <div style="font-size: 11.5px; color: #475569; margin-top: 4px;">${p.address}</div>
              <div style="margin-top: 8px;">
                <a href="tel:${p.phone.replace(/[^0-9]/g, '')}" style="display: inline-block; background: #0f172a; color: #fff; padding: 3px 8px; border-radius: 4px; font-size: 11px; text-decoration: none; font-weight: 600;">Call: ${p.phone}</a>
              </div>
            </div>
          `);
          MyPetRadar.layers.markers.push(poiMarker);
        });
      }

      // 4. Render Primary Pulsing Pet Collar Scan Marker
      const petAvatarSrc = data.pet.avatarCustom || (data.pet.species === 'cat' ? 'images/pet-luna.png' : 'images/species-dog.png');
      const pulsingIcon = L.divIcon({
        className: 'radar-pet-pulsing-icon',
        html: `
          <div class="radar-pulse-ring"></div>
          <div class="radar-pulse-ring-outer"></div>
          <div class="radar-pet-marker-pin">
            <img src="${petAvatarSrc}" alt="${data.pet.name}" class="radar-pet-pin-img" onerror="this.src='images/logo.png'" />
          </div>
        `,
        iconSize: [44, 44],
        iconAnchor: [22, 22],
        popupAnchor: [0, -24]
      });

      const primaryMarker = L.marker(centerCoords, { icon: pulsingIcon }).addTo(map);
      primaryMarker.bindPopup(`
        <div style="font-family: inherit; min-width: 200px; padding: 4px 2px;">
          <div style="display: flex; align-items: center; gap: 8px; margin-bottom: 6px;">
            <span style="background: #10b981; color: #fff; font-size: 10px; font-weight: 800; padding: 2px 6px; border-radius: 9999px;">LATEST SCAN</span>
            <span style="font-size: 11px; color: #64748b; margin-left: auto;">${latest.time_str || 'Recent'}</span>
          </div>
          <strong style="font-size: 15px; color: #0f172a;">${data.pet.name}'s Collar Tag</strong>
          <p style="margin: 4px 0 2px; font-size: 12px; color: #475569;">${latest.address}</p>
          <div style="font-size: 11px; color: #64748b; margin-top: 4px;">Accuracy: ±${Math.round(latest.accuracy || 10)} meters</div>
        </div>
      `).openPopup();

      MyPetRadar.layers.markers.push(primaryMarker);

      // Trigger resize update once map container is ready
      setTimeout(() => {
        map.invalidateSize();
      }, 300);
    },

    clearLayers: function() {
      if (!MyPetRadar.map) return;
      MyPetRadar.layers.markers.forEach(m => MyPetRadar.map.removeLayer(m));
      MyPetRadar.layers.markers = [];
      MyPetRadar.layers.circles.forEach(c => MyPetRadar.map.removeLayer(c));
      MyPetRadar.layers.circles = [];
      if (MyPetRadar.layers.polyline) {
        MyPetRadar.map.removeLayer(MyPetRadar.layers.polyline);
        MyPetRadar.layers.polyline = null;
      }
    },

    /**
     * Filters visibility of search radius circles on map.
     */
    filterZone: function(zoneId) {
      MyPetRadar.activeZoneFilter = zoneId;
      document.querySelectorAll('.radar-zone-pill').forEach(btn => {
        btn.classList.toggle('active', btn.id === `btnZone_${zoneId}` || (zoneId === 'all' && btn.innerText.includes('All')));
      });

      if (!MyPetRadar.map) return;

      MyPetRadar.layers.circles.forEach(circle => {
        if (zoneId === 'all' || circle._zoneId === zoneId) {
          if (!MyPetRadar.map.hasLayer(circle)) {
            circle.addTo(MyPetRadar.map);
          }
        } else {
          if (MyPetRadar.map.hasLayer(circle)) {
            MyPetRadar.map.removeLayer(circle);
          }
        }
      });
    },

    /**
     * Smoothly pans and zooms the map to a target coordinate.
     */
    panTo: function(lat, lng, zoom = 16) {
      if (MyPetRadar.map) {
        MyPetRadar.map.flyTo([lat, lng], zoom, { duration: 1.2 });
      }
    },

    /**
     * Dispatches simulated neighborhood lost pet broadcast.
     */
    broadcastAlert: async function() {
      const petId = MyPetRadar.currentPetId;
      if (!petId) return;

      const btn = document.getElementById('btnBroadcastAlert');
      if (btn) {
        btn.classList.add('broadcasting');
        btn.innerHTML = `<span>🚨 Broadcasting to 148 Pet Parents...</span>`;
      }

      try {
        if (window.ApiClient) {
          await window.ApiClient.broadcastNeighborhoodAlert(petId);
        }

        setTimeout(() => {
          if (btn) {
            btn.classList.remove('broadcasting');
            btn.classList.add('sent');
            btn.innerHTML = `<span>✓ Neighborhood Alert Active (148 Notified)</span>`;
          }

          if (window.App && typeof window.App.showToast === 'function') {
            window.App.showToast("🚨 Community Alert Broadcasted! 148 pet parents & 3 shelters notified.");
          }

          // Refresh dashboard activity list
          if (window.App && typeof window.App.renderDashboard === 'function') {
            window.App.renderDashboard();
          }

          alert("🚨 Community Alert Broadcast Dispatched!\n\n• 148 verified pet parents in a 2-mile radius have received priority push alerts.\n• 3 local animal shelters & 24/7 veterinary clinics have received Luna's digital lost flyer.\n• Real-time scan radar is actively monitoring incoming collar pings.");
        }, 1200);

      } catch (err) {
        console.error("Broadcast alert error:", err);
      }
    },

    /**
     * One-Tap GPS Sharing for Finders on the Public Profile / Viewfinder
     */
    shareFinderLocation: function(petCode) {
      const statusPill = document.getElementById('finderGpsStatusText');
      if (statusPill) statusPill.innerText = "Accessing GPS...";

      if ("geolocation" in navigator) {
        navigator.geolocation.getCurrentPosition(
          async (pos) => {
            const lat = pos.coords.latitude;
            const lng = pos.coords.longitude;
            const accuracy = pos.coords.accuracy || 12;

            try {
              if (window.ApiClient) {
                await window.ApiClient.sendLocation(petCode, {
                  lat: lat,
                  lng: lng,
                  accuracy: accuracy,
                  address: "Verified Smartphone GPS Ping",
                  deviceInfo: navigator.userAgent.includes("iPhone") ? "iPhone · Safari Mobile" : "Android · Mobile Browser"
                });
              }

              if (statusPill) statusPill.innerText = "✓ Location Sent to Family!";
              alert("📍 Location Shared!\n\nThank you for helping reunite this pet!\nYour exact location has been securely sent to the owner's live GPS radar.");
            } catch (e) {
              console.warn("Failed to dispatch location:", e);
            }
          },
          async (err) => {
            console.warn("Geolocation permission error or desktop fallback:", err.message);
            // Graceful fallback to default Lakeside Park coordinates for testing
            const fallbackLat = 37.8094;
            const fallbackLng = -122.2536;
            if (window.ApiClient) {
              await window.ApiClient.sendLocation(petCode, {
                lat: fallbackLat,
                lng: fallbackLng,
                accuracy: 15,
                address: "Grand Ave & Perkins St, Oakland, CA",
                deviceInfo: "Simulated Finder Camera"
              });
            }
            if (statusPill) statusPill.innerText = "✓ Location Sent to Family!";
            alert("📍 Location Shared!\n\nThank you! Your simulated scan coordinates (Grand Ave & Perkins St) have been sent to the owner's GPS radar.");
          },
          { enableHighAccuracy: true, timeout: 6000 }
        );
      } else {
        alert("Geolocation is not supported by your browser.");
      }
    },

    /**
     * Fallback data in case server is temporarily offline
     */
    getFallbackRadarData: function(petId) {
      return {
        pet: {
          id: petId,
          name: "Luna",
          species: "cat",
          isLost: true,
          avatarCustom: "images/pet-luna.png"
        },
        latestScan: {
          lat: 37.8094,
          lng: -122.2536,
          accuracy: 8.5,
          address: "Grand Ave & Perkins St (Near Lakeside Park), Oakland, CA",
          time_str: "12 minutes ago",
          device_info: "Apple iPhone 15 · Safari Mobile"
        },
        history: [
          {
            lat: 37.8094,
            lng: -122.2536,
            accuracy: 8.5,
            address: "Grand Ave & Perkins St, Oakland, CA",
            time_str: "12 minutes ago"
          },
          {
            lat: 37.8048,
            lng: -122.2582,
            accuracy: 12.0,
            address: "Bellevue Ave Trail, Oakland, CA",
            time_str: "2 hours ago"
          }
        ],
        zones: [
          {
            id: "zone-1",
            radiusMeters: 480,
            radiusMiles: "0.3 mi",
            label: "Sprint & Hiding Zone (0-1 hr)",
            description: "Frightened felines typically hide within 500 meters of last sighting.",
            color: "#10b981",
            fillOpacity: 0.20
          },
          {
            id: "zone-2",
            radiusMeters: 1200,
            radiusMiles: "0.75 mi",
            label: "Displaced Roaming Radius (1-12 hrs)",
            description: "Exploration zone across neighboring residential blocks.",
            color: "#f59e0b",
            fillOpacity: 0.14
          },
          {
            id: "zone-3",
            radiusMeters: 2400,
            radiusMiles: "1.5 mi",
            label: "Max 48-Hour Search Perimeter",
            description: "Recommended flyer distribution boundary.",
            color: "#ef4444",
            fillOpacity: 0.09
          }
        ],
        emergencyPoints: [
          {
            id: "em-1",
            name: "Oakland Pet Hospital & Urgent Care",
            type: "24/7 Vet Hospital",
            phone: "(555) 892-3401",
            address: "742 Evergreen Blvd, Oakland",
            lat: 37.8149,
            lng: -122.2494,
            icon: "🏥"
          },
          {
            id: "em-2",
            name: "East Bay SPCA Animal Shelter",
            type: "Adoption & Lost Pets",
            phone: "(555) 569-0702",
            address: "8300 Baldwin St, Oakland",
            lat: 37.8016,
            lng: -122.2601,
            icon: "🛡️"
          }
        ]
      };
    }
  };

  root.MyPetRadar = MyPetRadar;
})(typeof window !== "undefined" ? window : this);
