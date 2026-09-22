/**
 * MyPet Lost Pet Poster & Social Flyer Generator
 * Generates 8.5x11 printable neighborhood flyers with tear-off tabs,
 * and renders 1080x1080 / 1080x1920 social graphics via HTML Canvas.
 */

(function(root) {
  'use strict';

  const MyPetPoster = {
    currentPet: null,
    format: 'street', // 'street' | 'square' | 'story'
    options: {
      headline: 'MISSING PET',
      reward: '$250 REWARD',
      contactPhone: '(555) 234-5678',
      secondaryPhone: '',
      lastSeen: 'Oakland Ave & 4th St',
      notes: 'Very friendly, may be timid. Needs daily medication. Please do not chase.'
    },

    init: function(pet) {
      MyPetPoster.currentPet = pet;
      const isDog = pet.species === 'dog';
      MyPetPoster.options.headline = `MISSING ${pet.species.toUpperCase()}`;
      MyPetPoster.options.reward = '$250 REWARD';
      MyPetPoster.options.contactPhone = pet.owner.phone || '(555) 234-5678';
      MyPetPoster.options.secondaryPhone = '';
      MyPetPoster.options.lastSeen = (pet.lostInfo && pet.lostInfo.lastSeenLocation) 
        ? pet.lostInfo.lastSeenLocation 
        : 'Oakland Ave & 4th St';
      MyPetPoster.options.notes = pet.distinguishingFeatures || 'Friendly, loves treats. Please contact owner if seen.';

      MyPetPoster.renderPreview();
    },

    setFormat: function(format) {
      MyPetPoster.format = format;
      MyPetPoster.renderPreview();
    },

    updateOption: function(key, value) {
      MyPetPoster.options[key] = value;
      MyPetPoster.renderPreview();
    },

    renderPreview: function() {
      const previewContainer = document.getElementById('posterPreviewTarget');
      if (!previewContainer || !MyPetPoster.currentPet) return;

      if (MyPetPoster.format === 'street') {
        previewContainer.innerHTML = MyPetPoster.generateStreetPosterHTML();
      } else if (MyPetPoster.format === 'square') {
        previewContainer.innerHTML = MyPetPoster.generateSocialSquareHTML();
      } else if (MyPetPoster.format === 'story') {
        previewContainer.innerHTML = MyPetPoster.generateSocialStoryHTML();
      }
    },

    // 8.5x11 Printable Street Poster with Tear-Off Tabs
    generateStreetPosterHTML: function() {
      const pet = MyPetPoster.currentPet;
      const opts = MyPetPoster.options;
      const publicUrl = window.location.origin + window.location.pathname + '#p/' + pet.code;

      const qrSvg = window.MyPetQR.generateSVG(publicUrl, {
        size: 130,
        margin: 1,
        darkColor: "#121212"
      });

      const microQrSvg = window.MyPetQR.generateSVG(publicUrl, {
        size: 38,
        margin: 0,
        darkColor: "#121212"
      });

      // Tear-off tabs (8 tabs across)
      let tabsHtml = '';
      for (let i = 0; i < 8; i++) {
        tabsHtml += `
          <div class="poster-tear-tab">
            <div class="tear-tab-content">
              <span class="tear-tab-title">MISSING ${pet.name.toUpperCase()}</span>
              <span class="tear-tab-phone">${opts.contactPhone}</span>
              ${opts.secondaryPhone ? `<span class="tear-tab-phone">${opts.secondaryPhone}</span>` : ''}
              <div class="tear-tab-qr">${microQrSvg}</div>
            </div>
          </div>
        `;
      }

      const avatarMarkup = window.App ? window.App.getPetAvatarMarkup(pet) : '';

      return `
        <div class="poster-sheet printable-poster-target">
          <!-- Top Emergency Warning Banner -->
          <div class="poster-header-banner">
            <h1 class="poster-headline">${opts.headline}</h1>
          </div>

          <!-- Pet Identity & Reward Badge -->
          <div class="poster-sub-banner">
            <span class="poster-pet-name">${pet.name.toUpperCase()}</span>
            ${opts.reward ? `<span class="poster-reward-badge">${opts.reward}</span>` : ''}
          </div>

          <!-- Main Content Grid -->
          <div class="poster-main-grid">
            <div class="poster-photo-box">
              ${avatarMarkup}
            </div>

            <div class="poster-details-box">
              <div class="poster-detail-item">
                <strong>Species / Breed:</strong>
                <span>${pet.species.toUpperCase()} · ${pet.breed}</span>
              </div>
              <div class="poster-detail-item">
                <strong>Color & Coat:</strong>
                <span>${pet.color} · ${pet.sex}</span>
              </div>
              <div class="poster-detail-item">
                <strong>Last Seen:</strong>
                <span class="highlight-last-seen">${opts.lastSeen}</span>
              </div>
              <div class="poster-detail-item">
                <strong>Key Details:</strong>
                <span>${opts.notes}</span>
              </div>
            </div>
          </div>

          <!-- Call to Action & Large Scannable QR -->
          <div class="poster-callout-row">
            <div class="poster-phone-action">
              <div class="call-owner-label">IF SEEN OR FOUND, PLEASE CALL OR TEXT:</div>
              <div class="poster-phone-digits">${opts.contactPhone}</div>
              ${opts.secondaryPhone ? `<div class="poster-phone-alt">Alt: ${opts.secondaryPhone}</div>` : ''}
            </div>

            <div class="poster-qr-group">
              <div class="poster-qr-graphic">${qrSvg}</div>
              <div class="poster-qr-label">SCAN WITH PHONE CAMERA TO VIEW FULL PROFILE & GPS ALERT</div>
            </div>
          </div>

          <!-- Perforated Tear-off line -->
          <div class="poster-perforation-line">
            <span>${window.AppIcons ? window.AppIcons.get('scissors') : ''} TEAR OFF A NUMBER BELOW</span>
          </div>

          <!-- Tear-off Tabs -->
          <div class="poster-tear-tabs-grid">
            ${tabsHtml}
          </div>
        </div>
      `;
    },

    // 1080x1080 Instagram / Social Media Square
    generateSocialSquareHTML: function() {
      const pet = MyPetPoster.currentPet;
      const opts = MyPetPoster.options;
      const publicUrl = window.location.origin + window.location.pathname + '#p/' + pet.code;
      const qrSvg = window.MyPetQR.generateSVG(publicUrl, { size: 100, margin: 1 });
      const avatarMarkup = window.App ? window.App.getPetAvatarMarkup(pet) : '';

      return `
        <div class="social-card social-square">
          <div class="social-badge-row">
            <span class="social-urgent-pill">${window.AppIcons ? window.AppIcons.get('siren') : ''} URGENT: PLEASE SHARE</span>
            ${opts.reward ? `<span class="social-reward-pill">${opts.reward}</span>` : ''}
          </div>

          <h2 class="social-headline">${opts.headline}: ${pet.name.toUpperCase()}</h2>

          <div class="social-content-row">
            <div class="social-avatar-wrap">
              ${avatarMarkup}
            </div>
            <div class="social-info-list">
              <div><strong>Species:</strong> ${pet.breed} (${pet.color})</div>
              <div><strong>Last Seen:</strong> <span style="color: var(--red); font-weight: 700;">${opts.lastSeen}</span></div>
              <div><strong>Notes:</strong> ${opts.notes}</div>
            </div>
          </div>

          <div class="social-footer-bar">
            <div class="social-phone-block">
              <span>CALL / TEXT IMMEDIATELY:</span>
              <strong>${opts.contactPhone}</strong>
            </div>
            <div class="social-qr-block">
              ${qrSvg}
              <small>Scan to View Profile</small>
            </div>
          </div>
        </div>
      `;
    },

    // 9:16 Mobile Story format
    generateSocialStoryHTML: function() {
      const pet = MyPetPoster.currentPet;
      const opts = MyPetPoster.options;
      const publicUrl = window.location.origin + window.location.pathname + '#p/' + pet.code;
      const qrSvg = window.MyPetQR.generateSVG(publicUrl, { size: 120, margin: 1 });
      const avatarMarkup = window.App ? window.App.getPetAvatarMarkup(pet) : '';

      return `
        <div class="social-card social-story">
          <div class="social-badge-row" style="justify-content: center;">
            <span class="social-urgent-pill" style="font-size: 14px; padding: 6px 16px;">${window.AppIcons ? window.AppIcons.get('siren') : ''} PLEASE SHARE THIS STORY</span>
          </div>

          <h1 class="social-headline" style="font-size: 28px; text-align: center; margin: 16px 0 6px;">
            ${opts.headline}
          </h1>
          <div style="font-size: 24px; font-weight: 800; color: var(--ink); text-align: center; margin-bottom: 12px;">
            ${pet.name.toUpperCase()}
          </div>

          <div class="social-avatar-wrap" style="width: 140px; height: 140px; margin: 0 auto 16px;">
            ${avatarMarkup}
          </div>

          ${opts.reward ? `<div style="text-align: center; margin-bottom: 16px;"><span class="social-reward-pill" style="font-size: 16px; padding: 6px 18px;">${opts.reward}</span></div>` : ''}

          <div class="social-info-list" style="background: var(--sand); padding: 16px; border-radius: 16px; border: 1.5px solid var(--border); font-size: 14px;">
            <div><strong>Breed:</strong> ${pet.breed}</div>
            <div><strong>Color:</strong> ${pet.color} · ${pet.sex}</div>
            <div><strong>Last Seen:</strong> <span style="color: var(--red); font-weight: 700;">${opts.lastSeen}</span></div>
            <div><strong>Traits:</strong> ${opts.notes}</div>
          </div>

          <div style="text-align: center; margin-top: 24px;">
            <div style="font-size: 13px; font-weight: 700; color: var(--muted); margin-bottom: 4px;">PLEASE CONTACT OWNER:</div>
            <div style="font-size: 24px; font-weight: 800; color: var(--red);">${opts.contactPhone}</div>
          </div>

          <div style="display: flex; flex-direction: column; align-items: center; justify-content: center; margin-top: 20px;">
            ${qrSvg}
            <span style="font-size: 11px; font-weight: 700; color: var(--muted); margin-top: 6px;">Scan to report location or safe status</span>
          </div>
        </div>
      `;
    },

    // Print the Street Poster directly via browser dialog
    printPoster: function() {
      // Ensure street format is rendered in preview target before printing
      MyPetPoster.setFormat('street');
      setTimeout(() => {
        window.print();
      }, 150);
    },

    // Export Social Flyer as PNG
    downloadFlyerAsPng: function() {
      const pet = MyPetPoster.currentPet;
      const opts = MyPetPoster.options;
      const isStory = MyPetPoster.format === 'story';
      const width = isStory ? 1080 : 1080;
      const height = isStory ? 1920 : 1080;

      const canvas = document.createElement('canvas');
      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext('2d');

      // Background warm cream
      ctx.fillStyle = "#fbfaf9";
      ctx.fillRect(0, 0, width, height);

      // Border inset
      ctx.lineWidth = 14;
      ctx.strokeStyle = "#121212";
      ctx.strokeRect(20, 20, width - 40, height - 40);

      // Top Red Banner
      ctx.fillStyle = "#ff2b3a";
      ctx.fillRect(27, 27, width - 54, isStory ? 160 : 140);

      // Headline text
      ctx.fillStyle = "#ffffff";
      ctx.font = `bold ${isStory ? 76 : 70}px Inter, sans-serif`;
      ctx.textAlign = "center";
      ctx.fillText(opts.headline, width / 2, isStory ? 135 : 120);

      // Pet Name
      ctx.fillStyle = "#121212";
      ctx.font = "800 84px Inter, sans-serif";
      ctx.fillText(pet.name.toUpperCase(), width / 2, isStory ? 280 : 250);

      // Reward Banner if set
      if (opts.reward) {
        ctx.fillStyle = "#ffcd6c";
        const rwWidth = 520;
        ctx.fillRect((width - rwWidth) / 2, isStory ? 320 : 280, rwWidth, 60);
        ctx.strokeStyle = "#121212";
        ctx.lineWidth = 4;
        ctx.strokeRect((width - rwWidth) / 2, isStory ? 320 : 280, rwWidth, 60);
        ctx.fillStyle = "#121212";
        ctx.font = "bold 34px Inter, sans-serif";
        ctx.fillText(opts.reward, width / 2, isStory ? 362 : 322);
      }

      // Details Box
      const boxY = isStory ? 440 : 380;
      const boxHeight = isStory ? 600 : 380;
      ctx.fillStyle = "#ffffff";
      ctx.fillRect(60, boxY, width - 120, boxHeight);
      ctx.strokeStyle = "#e5d5c3";
      ctx.lineWidth = 6;
      ctx.strokeRect(60, boxY, width - 120, boxHeight);

      // Draw detail texts
      ctx.textAlign = "left";
      ctx.fillStyle = "#121212";
      ctx.font = "bold 38px Inter, sans-serif";
      ctx.fillText(`Species / Breed:  ${pet.species.toUpperCase()} · ${pet.breed}`, 100, boxY + 80);
      ctx.fillText(`Color & Coat:  ${pet.color} · ${pet.sex}`, 100, boxY + 160);
      
      ctx.fillStyle = "#ff2b3a";
      ctx.fillText(`Last Seen:  ${opts.lastSeen}`, 100, boxY + 240);

      ctx.fillStyle = "#474645";
      ctx.font = "500 32px Inter, sans-serif";
      ctx.fillText(`Notes:  ${opts.notes}`, 100, boxY + 320);

      // Bottom Phone Callout
      const footerY = isStory ? 1160 : 820;
      ctx.fillStyle = "#121212";
      ctx.fillRect(60, footerY, width - 120, 160);

      ctx.textAlign = "center";
      ctx.fillStyle = "#ffffff";
      ctx.font = "bold 30px Inter, sans-serif";
      ctx.fillText("IF SEEN OR FOUND, CALL / TEXT IMMEDIATELY:", width / 2, footerY + 55);

      ctx.fillStyle = "#ffcd6c";
      ctx.font = "800 62px Inter, sans-serif";
      ctx.fillText(opts.contactPhone, width / 2, footerY + 128);

      // Download triggered
      const a = document.createElement('a');
      a.download = `lost-${pet.name.toLowerCase()}-${MyPetPoster.format}-flyer.png`;
      a.href = canvas.toDataURL('image/png');
      a.click();

      if (window.App && typeof window.App.showToast === 'function') {
        window.App.showToast("Downloaded flyer graphic!");
      }
    },

    // 1-Click Social Media Caption Generator
    copySocialCaption: function() {
      const pet = MyPetPoster.currentPet;
      const opts = MyPetPoster.options;
      const publicUrl = window.location.origin + window.location.pathname + '#p/' + pet.code;

      const caption = 
`MISSING PET ALERT: PLEASE SHARE

Our beloved ${pet.species}, ${pet.name.toUpperCase()}, is missing!

Last Seen: ${opts.lastSeen}
Description: ${pet.breed}, ${pet.color}, ${pet.sex}, ${pet.age}
Key Traits: ${opts.notes}
${opts.reward ? `Reward: ${opts.reward}\n` : ''}
IF SEEN PLEASE CALL OR TEXT: ${opts.contactPhone}
Live Status & GPS Alert: ${publicUrl}

Please share with local groups in the neighborhood. Thank you for helping bring ${pet.name} home!
#LostPet #Missing${pet.species.toUpperCase()} #PetRecovery #MyPet`;

      navigator.clipboard.writeText(caption).then(() => {
        alert("Social media caption copied to clipboard!\n\nReady to paste into Instagram, Facebook, Nextdoor, or WhatsApp.");
      }).catch(() => {
        prompt("Copy caption below:", caption);
      });
    }
  };

  root.MyPetPoster = MyPetPoster;
})(typeof window !== "undefined" ? window : this);
