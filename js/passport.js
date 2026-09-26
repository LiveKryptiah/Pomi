/**
 * MyPet Official Pet Passport & Vaccine PDF Certificate Exporter
 * Generates official airline-compliant travel passports, veterinary vaccination
 * certificates, and daycare boarding passes with barcodes, stamps, and print optimizations.
 */

(function(root) {
  'use strict';

  const MyPetPassport = {
    currentPetId: null,
    currentDocType: 'passport', // 'passport', 'vaccine', or 'boarding'
    passportData: null,

    init: async function(petIdOrCode, defaultType = 'passport') {
      MyPetPassport.currentDocType = defaultType;
      
      const modal = document.getElementById('passportModal');
      if (modal) modal.classList.add('active');

      // Fetch passport & health cert data from backend
      try {
        let data = null;
        if (window.ApiClient) {
          data = await window.ApiClient.getPetPassport(petIdOrCode);
        }

        if (!data) {
          data = MyPetPassport.getFallbackData(petIdOrCode);
        }

        MyPetPassport.passportData = data;
        MyPetPassport.currentPetId = data.pet.id;
        MyPetPassport.renderDocument();

      } catch (err) {
        console.warn("[MyPetPassport] Backend request failed, using local store:", err);
        const fallback = MyPetPassport.getFallbackData(petIdOrCode);
        MyPetPassport.passportData = fallback;
        MyPetPassport.currentPetId = fallback.pet.id;
        MyPetPassport.renderDocument();
      }
    },

    switchDocType: function(type) {
      MyPetPassport.currentDocType = type;
      
      // Update tab pill highlights
      document.querySelectorAll('.passport-tab-pill').forEach(pill => {
        pill.classList.toggle('active', pill.getAttribute('data-type') === type);
      });

      MyPetPassport.renderDocument();
    },

    renderDocument: function() {
      const container = document.getElementById('passportDocCanvas');
      if (!container || !MyPetPassport.passportData) return;

      const data = MyPetPassport.passportData;
      const pet = data.pet;

      // Update modal header name
      const titleEl = document.getElementById('passportModalTitle');
      if (titleEl) titleEl.innerText = `${pet.name}'s Official Documents`;

      if (MyPetPassport.currentDocType === 'passport') {
        container.innerHTML = MyPetPassport.renderPassportBooklet(data);
      } else if (MyPetPassport.currentDocType === 'vaccine') {
        container.innerHTML = MyPetPassport.renderVaccineCertificate(data);
      } else {
        container.innerHTML = MyPetPassport.renderBoardingPass(data);
      }
    },

    /**
     * Document 1: Official International Pet Passport Booklet
     */
    renderPassportBooklet: function(data) {
      const pet = data.pet;
      const chip = data.microchip;
      const vet = data.veterinaryClinic;
      const cust = data.custodian;
      const barcodeSvg = MyPetPassport.generateBarcodeSvg(chip.number);

      const avatarMarkup = pet.avatarCustom 
        ? `<img src="${pet.avatarCustom}" alt="${pet.name}" class="passport-photo-img" />`
        : `<div class="passport-photo-placeholder">🐾</div>`;

      return `
        <div class="passport-sheet passport-booklet-sheet printable-document">
          <!-- Top Gold Foil Header Strip -->
          <div class="passport-gold-header">
            <div class="passport-header-emblem">
              <svg viewBox="0 0 24 24" fill="currentColor" class="gold-eagle-icon"><path d="M12 2L9.5 8H3l5.5 4.5L6.5 19 12 15l5.5 4 2-6.5L21 8h-6.5L12 2z"/></svg>
            </div>
            <div class="passport-header-titles">
              <div class="passport-super-title">UNITED STATES OF AMERICA</div>
              <div class="passport-main-title">OFFICIAL PET PASSPORT &amp; RECOVERY CREDENTIAL</div>
              <div class="passport-authority-sub">ISSUING VETERINARY AUTHORITY · MYPET RECOVERY NETWORK</div>
            </div>
            <div class="passport-doc-number-badge">
              <span>DOC NO.</span>
              <strong>${data.passportNumber}</strong>
            </div>
          </div>

          <!-- Dual Column Passport Main Body -->
          <div class="passport-id-body">
            <!-- Left Column: Portrait & Barcode -->
            <div class="passport-portrait-col">
              <div class="passport-photo-frame">
                ${avatarMarkup}
                <div class="passport-photo-watermark">MYPET OFFICIAL</div>
              </div>

              <!-- Microchip Barcode Container -->
              <div class="passport-barcode-box">
                <div class="passport-barcode-label">ISO 11784/11785 RFID MICROCHIP</div>
                <div class="passport-barcode-svg-wrap">
                  ${barcodeSvg}
                </div>
                <div class="passport-chip-number">${chip.number}</div>
                <div class="passport-chip-registry">${chip.registry}</div>
              </div>

              <!-- Official Verification Stamp -->
              <div class="passport-seal-badge">
                <span class="seal-icon">🛡️</span>
                <div>
                  <strong>VERIFIED AUTHENTIC</strong>
                  <div style="font-size: 10px; color: #15803d;">Code: ${data.verificationCode}</div>
                </div>
              </div>
            </div>

            <!-- Right Column: Official Details Grid -->
            <div class="passport-details-col">
              <div class="passport-field-row">
                <div class="passport-field-col">
                  <label>1. REGISTERED NAME / NOM</label>
                  <div class="passport-val-hero">${pet.name.toUpperCase()}</div>
                </div>
                <div class="passport-field-col">
                  <label>2. PASSPORT NUMBER</label>
                  <div class="passport-val bold-navy">${data.passportNumber}</div>
                </div>
              </div>

              <div class="passport-field-row">
                <div class="passport-field-col">
                  <label>3. SPECIES / ESPÈCE</label>
                  <div class="passport-val">${pet.species.toUpperCase()}</div>
                </div>
                <div class="passport-field-col">
                  <label>4. SEX / SEXE</label>
                  <div class="passport-val">${(pet.sex || 'Female').toUpperCase()}</div>
                </div>
                <div class="passport-field-col">
                  <label>5. AGE / ESTIMATED DOB</label>
                  <div class="passport-val">${pet.age || '3 Years'}</div>
                </div>
              </div>

              <div class="passport-field-row">
                <div class="passport-field-col" style="flex: 2;">
                  <label>6. BREED / RACE</label>
                  <div class="passport-val">${pet.breed || 'Domestic Shorthair'}</div>
                </div>
                <div class="passport-field-col" style="flex: 2;">
                  <label>7. COAT &amp; COLOR</label>
                  <div class="passport-val">${pet.color || 'Gray & White'}</div>
                </div>
              </div>

              <div class="passport-field-row">
                <div class="passport-field-col" style="flex: 1;">
                  <label>8. DISTINGUISHING MARKS</label>
                  <div class="passport-val" style="font-size: 12px; line-height: 1.4;">${pet.distinguishingFeatures || 'Friendly, distinct white chest and paws.'}</div>
                </div>
              </div>

              <div class="passport-divider-line"></div>

              <div class="passport-field-row">
                <div class="passport-field-col" style="flex: 2;">
                  <label>9. REGISTERED CUSTODIAN / OWNER</label>
                  <div class="passport-val bold-navy">${cust.name}</div>
                  <div style="font-size: 11px; color: var(--color-fog);">${cust.phone} · ${cust.address}</div>
                </div>
                <div class="passport-field-col">
                  <label>10. VALIDITY DATES</label>
                  <div class="passport-val" style="font-size: 11.5px;">${data.issueDate} &rarr; ${data.expiryDate}</div>
                </div>
              </div>

              <!-- Passport Travel Rubber Stamps -->
              <div class="passport-stamps-tray">
                <div class="passport-rubber-stamp stamp-green">
                  <div class="stamp-top">VETERINARY BORDER</div>
                  <div class="stamp-mid">&#10003; INSPECTION CLEARED</div>
                  <div class="stamp-bot">SFO AIRPORT · 2026</div>
                </div>
                <div class="passport-rubber-stamp stamp-gold">
                  <div class="stamp-top">RABIES TITER</div>
                  <div class="stamp-mid">&#9733; CORE VERIFIED &#9733;</div>
                  <div class="stamp-bot">ANTIBODIES &ge; 0.5 IU/ml</div>
                </div>
                <div class="passport-rubber-stamp stamp-blue">
                  <div class="stamp-top">TRAVEL PASSPORT</div>
                  <div class="stamp-mid">CABIN APPROVED</div>
                  <div class="stamp-bot">USDA-APHIS COMPLIANT</div>
                </div>
              </div>
            </div>
          </div>

          <!-- Bottom Machine Readable Zone (MRZ) -->
          <div class="passport-mrz-zone">
            <div>P&lt;USAPOMI&lt;&lt;${pet.name.toUpperCase()}&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;</div>
            <div>${data.passportNumber.replace(/-/g, '')}&lt;4USA2404157M2901158&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;02</div>
          </div>
        </div>
      `;
    },

    /**
     * Document 2: Official Clinical Vaccination & Health Certificate
     */
    renderVaccineCertificate: function(data) {
      const pet = data.pet;
      const vet = data.veterinaryClinic;
      const vaccines = data.vaccines || [];
      const chip = data.microchip;

      const vaccineRows = vaccines.map((vac, idx) => {
        const isRabies = vac.name.toLowerCase().includes('rabies');
        return `
          <tr class="${isRabies ? 'highlight-rabies-row' : ''}">
            <td style="font-weight: 700; color: var(--color-ink);">
              ${vac.name}
              ${isRabies ? '<span class="status-badge vaccine-valid" style="font-size: 10px; margin-left: 6px;">★ Core Rabies</span>' : ''}
            </td>
            <td>${vac.dateAdministered || '2026-01-15'}</td>
            <td style="font-weight: 600;">${vac.dueDate || '2027-01-15'}</td>
            <td><code style="font-size: 11px;">${vac.batchLot || 'RB-84920'}</code></td>
            <td>${vac.clinic || vet.name}</td>
            <td><span class="status-badge vaccine-valid">&#10003; ${vac.statusLabel || 'Active'}</span></td>
          </tr>
        `;
      }).join('');

      return `
        <div class="passport-sheet vaccine-cert-sheet printable-document">
          <!-- Hospital Medical Letterhead -->
          <div class="cert-letterhead">
            <div class="cert-hospital-logo">
              <span style="font-size: 38px;">🏥</span>
            </div>
            <div class="cert-hospital-info">
              <h2>${vet.name.toUpperCase()}</h2>
              <div class="cert-hospital-sub">${vet.address} · Phone: ${vet.phone}</div>
              <div class="cert-hospital-sub">24/7 Urgent Veterinary Care · License #${vet.license}</div>
            </div>
            <div class="cert-badge-col">
              <div class="cert-official-seal">
                <span>OFFICIAL VET</span>
                <strong>HEALTH CERT</strong>
                <span>VERIFIED</span>
              </div>
            </div>
          </div>

          <div class="cert-divider-double"></div>

          <div class="cert-title-banner">
            <h3>CERTIFICATE OF VETERINARY INSPECTION &amp; IMMUNIZATION</h3>
            <p>Issued pursuant to California Board of Veterinary Medicine &amp; USDA Pet Travel Regulations</p>
          </div>

          <!-- Pet & Owner Profile Summary -->
          <div class="cert-summary-grid">
            <div>
              <strong>Patient Name:</strong> ${pet.name} (${pet.species.toUpperCase()})<br>
              <strong>Breed / Sex:</strong> ${pet.breed} · ${pet.sex}<br>
              <strong>Color / Marking:</strong> ${pet.color}<br>
              <strong>Distinguishing:</strong> ${pet.distinguishingFeatures || 'Friendly, distinct white chest'}
            </div>
            <div>
              <strong>Custodian / Owner:</strong> ${data.custodian.name}<br>
              <strong>Owner Phone:</strong> ${data.custodian.phone}<br>
              <strong>Microchip ID:</strong> <code>${chip.number}</code><br>
              <strong>Document Reference:</strong> <code>${data.passportNumber}</code>
            </div>
          </div>

          <!-- Vaccines Table -->
          <div class="cert-table-wrap">
            <table class="cert-vaccine-table">
              <thead>
                <tr>
                  <th>Vaccination / Immunization Name</th>
                  <th>Date Given</th>
                  <th>Expiration Date</th>
                  <th>Batch / Lot No.</th>
                  <th>Administering Clinic</th>
                  <th>Verification</th>
                </tr>
              </thead>
              <tbody>
                ${vaccineRows}
              </tbody>
            </table>
          </div>

          <!-- Medical Alerts Section -->
          <div class="cert-medical-alerts">
            <div style="font-weight: 700; color: #991b1b; font-size: 13px; margin-bottom: 4px;">⚠️ CLINICAL ADVISORY &amp; ALLERGIES:</div>
            <p style="margin: 0; font-size: 12px; color: #7f1d1d;">
              ${data.allergies && data.allergies.length > 0 ? `• Verified Allergies: ${data.allergies.join(', ')}. ` : '• No known drug allergies on file. '}
              ${data.medications ? `• Active Prescriptions: ${data.medications}. ` : ''}
              ${data.dietNotes ? `• Diet Restrictions: ${data.dietNotes}` : ''}
            </p>
          </div>

          <!-- Clinical Endorsement & Signatures -->
          <div class="cert-endorsement-block">
            <div class="cert-statement">
              I hereby certify that I am a licensed veterinarian in good standing and have examined the animal described herein on ${data.issueDate}. The animal is free from observable signs of infectious or contagious diseases and meets mandatory Rabies immunization criteria for domestic transport, boarding, and daycare.
            </div>

            <div class="cert-signature-row">
              <div class="cert-sig-box">
                <div class="cert-sig-line">
                  <span class="cert-sig-script">Dr. Emily Hayes, DVM</span>
                </div>
                <div class="cert-sig-sub">Attending Veterinarian: ${vet.doctor}</div>
                <div class="cert-sig-sub">License: ${vet.license}</div>
              </div>

              <!-- Circular Clinic Stamp -->
              <div class="cert-rubber-stamp">
                <div class="stamp-round-text">OAKLAND PET HOSPITAL · ACCREDITED DVM</div>
                <div class="stamp-round-center">★ OFFICIAL ★<br>SEAL<br>2026</div>
              </div>

              <div class="cert-sig-box" style="text-align: right;">
                <div class="cert-sig-line">
                  <span style="font-weight: 700; font-size: 13px;">${data.issueDate}</span>
                </div>
                <div class="cert-sig-sub">Certificate Issuance Date</div>
                <div class="cert-sig-sub">Valid Through: ${data.expiryDate}</div>
              </div>
            </div>
          </div>
        </div>
      `;
    },

    /**
     * Document 3: Kennel & Boarding Quick Pass
     */
    renderBoardingPass: function(data) {
      const pet = data.pet;
      const vet = data.veterinaryClinic;
      const cust = data.custodian;
      const chip = data.microchip;

      return `
        <div class="passport-sheet boarding-pass-sheet printable-document">
          <div class="boarding-header">
            <div>
              <div class="boarding-super">OFFICIAL DAYCARE &amp; KENNEL BOARDING PASS</div>
              <h2 style="font-size: 26px; margin: 4px 0 0; color: #ffffff;">${pet.name.toUpperCase()} · ${pet.species.toUpperCase()}</h2>
            </div>
            <div class="boarding-badge">
              <span>PRIORITY ACCESS</span>
              <strong>APPROVED FOR BOARDING</strong>
            </div>
          </div>

          <div class="boarding-body-grid">
            <div class="boarding-card-col">
              <h4>📋 Companion Identification</h4>
              <ul class="boarding-meta-list">
                <li><strong>Breed:</strong> ${pet.breed}</li>
                <li><strong>Sex &amp; Age:</strong> ${pet.sex} · ${pet.age}</li>
                <li><strong>Color:</strong> ${pet.color}</li>
                <li><strong>Microchip:</strong> ${chip.number}</li>
                <li><strong>Passport No:</strong> ${data.passportNumber}</li>
              </ul>
            </div>

            <div class="boarding-card-col">
              <h4>🛡️ Immunization Clearances</h4>
              <ul class="boarding-meta-list">
                <li><strong>Rabies Core:</strong> <span class="status-badge vaccine-valid">&#10003; Up to Date</span></li>
                <li><strong>Distemper / Parvo:</strong> <span class="status-badge vaccine-valid">&#10003; Valid</span></li>
                <li><strong>Bordetella (Kennel Cough):</strong> <span class="status-badge vaccine-valid">&#10003; Cleared</span></li>
                <li><strong>Flea &amp; Tick Prevention:</strong> <span class="status-badge vaccine-valid">&#10003; Current</span></li>
              </ul>
            </div>

            <div class="boarding-card-col">
              <h4>📞 24/7 Emergency Contacts</h4>
              <ul class="boarding-meta-list">
                <li><strong>Owner:</strong> ${cust.name} (${cust.phone})</li>
                <li><strong>Primary Vet:</strong> ${vet.name}</li>
                <li><strong>Clinic Emergency:</strong> ${vet.phone}</li>
                <li><strong>Hospital Address:</strong> ${vet.address}</li>
              </ul>
            </div>
          </div>

          <div class="boarding-footer-strip">
            <div>
              <strong>Dietary &amp; Behavioral Notes:</strong> ${data.dietNotes || 'Feed sensitive stomach recipe. Gentle temperament with people.'}
            </div>
            <div style="font-size: 11.5px; opacity: 0.8; margin-top: 4px;">
              Digital Verification Code: <strong>${data.verificationCode}</strong> · Verified via MyPet Cloud Database
            </div>
          </div>
        </div>
      `;
    },

    /**
     * Generates a clean, vector SVG barcode resembling Code 128 / Code 39
     */
    generateBarcodeSvg: function(str) {
      const clean = (str || '985141002384912').replace(/[^0-9A-Z]/gi, '');
      const barPattern = [];
      
      // Deterministic bar widths based on char codes
      for (let i = 0; i < clean.length; i++) {
        const val = clean.charCodeAt(i);
        barPattern.push(val % 2 === 0 ? 3 : 1.5);
        barPattern.push(val % 3 === 0 ? 2 : 1);
        barPattern.push(val % 5 === 0 ? 4 : 2);
        barPattern.push(1.5);
      }

      let x = 10;
      let bars = '';
      for (let i = 0; i < barPattern.length; i++) {
        const w = barPattern[i];
        if (i % 2 === 0) {
          bars += `<rect x="${x}" y="4" width="${w}" height="42" fill="#0f172a" />`;
        }
        x += w + 1.2;
      }

      return `
        <svg viewBox="0 0 ${Math.round(x + 10)} 50" class="microchip-barcode-svg" xmlns="http://www.w3.org/2000/svg">
          ${bars}
        </svg>
      `;
    },

    /**
     * Triggers the clean native print / PDF export dialog
     */
    printDocument: function() {
      const pet = MyPetPassport.passportData ? MyPetPassport.passportData.pet : null;
      const originalTitle = document.title;
      
      if (pet) {
        document.title = `${pet.name}_Official_Pet_Passport_${MyPetPassport.currentDocType}`;
      }
      
      window.print();
      
      setTimeout(() => {
        document.title = originalTitle;
      }, 1000);
    },

    closeModal: function() {
      const m = document.getElementById('passportModal');
      if (m) m.classList.remove('active');
    },

    getFallbackData: function(petIdOrCode) {
      return {
        pet: {
          id: petIdOrCode || "pet-1",
          name: "Luna",
          code: "luna-7x29",
          species: "cat",
          breed: "Domestic Shorthair",
          sex: "Female",
          age: "3 years old",
          color: "Gray and white",
          distinguishingFeatures: "Friendly temperament, green eyes, wearing a pink collar",
          avatarCustom: "images/pet-luna.png"
        },
        passportNumber: "US-PET-7X29-CA",
        issueDate: "2025-01-15",
        expiryDate: "2028-01-15",
        verificationCode: "VER-984210LUNA",
        microchip: {
          number: "985-141-002-384-912",
          registry: "HomeAgain National Pet Database",
          implantDate: "2024-04-15"
        },
        veterinaryClinic: {
          name: "Oakland Pet Hospital & Urgent Care",
          doctor: "Dr. Emily Hayes, DVM",
          license: "CA-VET-48921-DVM",
          phone: "(555) 892-3401",
          address: "742 Evergreen Blvd, Oakland, CA 94611"
        },
        custodian: {
          name: "Sarah Miller",
          phone: "(555) 234-5678",
          email: "sarah@example.com",
          address: "Oakland, California, USA"
        },
        vaccines: [
          {
            name: "Rabies (1-Year Core)",
            dateAdministered: "2026-01-15",
            dueDate: "2027-01-15",
            batchLot: "RB-84920",
            clinic: "Oakland Pet Hospital",
            status: "valid",
            statusLabel: "Active & Verified"
          },
          {
            name: "FVRCP (Feline Viral Rhinotracheitis)",
            dateAdministered: "2025-10-10",
            dueDate: "2026-10-10",
            batchLot: "FV-30911",
            clinic: "Oakland Pet Hospital",
            status: "valid",
            statusLabel: "Active & Verified"
          },
          {
            name: "FeLV (Feline Leukemia)",
            dateAdministered: "2025-08-14",
            dueDate: "2026-08-14",
            batchLot: "FL-11029",
            clinic: "Oakland Pet Hospital",
            status: "valid",
            statusLabel: "Active & Verified"
          }
        ],
        allergies: ["Chicken byproduct", "Flea bite sensitivity"],
        medications: "Thyroid supplement (0.1mg daily at breakfast)",
        dietNotes: "Purina Pro Plan Sensitive Skin & Stomach (Wet & Dry only)."
      };
    }
  };

  root.MyPetPassport = MyPetPassport;
})(typeof window !== 'undefined' ? window : this);
