/**
 * Geniestudio — 3D Dimensional Illustration Engine
 * Aesthetic: Playful, toy-like, squishy clay renders floating in whitespace.
 * Pastel palette: Lavender (#f1e6ff), Mint (#d3f6e3), Powder Blue (#cce7ff),
 * Peach (#ffd1b8), Solar (#fff2be), and vivid Iris Blue (#0069e0) accents.
 */

const PetIllustrations = {
  // Hero Centerpiece: Floating 3D pets, cloud, collar tag, and envelope in daylight whitespace
  heroCenterpiece: function(width = "100%", height = 300) {
    return `
    <svg viewBox="0 0 680 300" width="${width}" height="${height}" fill="none" xmlns="http://www.w3.org/2000/svg" class="hero-3d-art">
      <defs>
        <!-- Gradients for 3D Clay Lighting -->
        <linearGradient id="cloudGrad" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stop-color="#ffffff"/>
          <stop offset="100%" stop-color="#cce7ff"/>
        </linearGradient>

        <linearGradient id="cloudGradLav" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stop-color="#ffffff"/>
          <stop offset="100%" stop-color="#f1e6ff"/>
        </linearGradient>

        <radialGradient id="catSphere" cx="35%" cy="30%" r="70%">
          <stop offset="0%" stop-color="#ffffff"/>
          <stop offset="45%" stop-color="#f8fafc"/>
          <stop offset="85%" stop-color="#e2e8f0"/>
          <stop offset="100%" stop-color="#cbd5e1"/>
        </radialGradient>

        <radialGradient id="dogSphere" cx="35%" cy="30%" r="70%">
          <stop offset="0%" stop-color="#fffbeb"/>
          <stop offset="50%" stop-color="#fed7aa"/>
          <stop offset="90%" stop-color="#fb923c"/>
          <stop offset="100%" stop-color="#ea580c"/>
        </radialGradient>

        <linearGradient id="irisGrad" x1="11.43%" y1="0%" x2="78.2%" y2="100%">
          <stop offset="0%" stop-color="#479dff"/>
          <stop offset="100%" stop-color="#0069e0"/>
        </linearGradient>

        <linearGradient id="envelopeGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stop-color="#ffffff"/>
          <stop offset="100%" stop-color="#f1e6ff"/>
        </linearGradient>

        <filter id="softShadow" x="-10%" y="-10%" width="130%" height="130%">
          <feDropShadow dx="0" dy="12" stdDeviation="14" flood-color="#0069e0" flood-opacity="0.12"/>
        </filter>

        <filter id="clayShadow" x="-20%" y="-20%" width="140%" height="140%">
          <feDropShadow dx="0" dy="8" stdDeviation="10" flood-color="#0a0d12" flood-opacity="0.08"/>
        </filter>
      </defs>

      <!-- 1. Floating Soft 3D Cloud Left -->
      <g transform="translate(40, 70)" filter="url(#softShadow)">
        <path d="M45 40 C45 20, 65 10, 85 18 C95 8, 120 8, 132 20 C145 15, 165 22, 165 40 C175 42, 182 52, 178 65 C174 76, 162 82, 150 80 L50 80 C32 80, 20 68, 22 52 C24 42, 34 38, 45 40 Z" fill="url(#cloudGrad)"/>
        <!-- Soft highlight -->
        <ellipse cx="90" cy="30" rx="35" ry="12" fill="#ffffff" opacity="0.6"/>
      </g>

      <!-- 2. Floating 3D Envelope with Iris Blue Wax Seal -->
      <g transform="translate(510, 45) rotate(12)" filter="url(#softShadow)">
        <!-- Envelope Body -->
        <rect x="0" y="0" width="110" height="74" rx="16" fill="url(#envelopeGrad)"/>
        <!-- Envelope Flap -->
        <path d="M4 8 L55 46 L106 8" stroke="#ffffff" stroke-width="3" stroke-linecap="round"/>
        <!-- Iris Blue Seal -->
        <circle cx="55" cy="46" r="14" fill="url(#irisGrad)" filter="url(#clayShadow)"/>
        <path d="M51 46 L54 49 L60 43" stroke="#ffffff" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"/>
      </g>

      <!-- 3. Floating 3D Crayon / Heart Doodle -->
      <g transform="translate(110, 195) rotate(-18)">
        <path d="M22 6 C28 -2, 42 2, 44 12 C46 24, 25 38, 22 40 C19 38, -2 24, 0 12 C2 2, 16 -2, 22 6 Z" fill="#ffd1b8" filter="url(#clayShadow)"/>
        <circle cx="16" cy="12" r="3" fill="#ffffff" opacity="0.8"/>
      </g>

      <!-- 4. Floating 3D Sphere / Accent Ball -->
      <circle cx="590" cy="190" r="18" fill="#d3f6e3" filter="url(#clayShadow)"/>
      <ellipse cx="584" cy="184" rx="5" ry="3" fill="#ffffff" opacity="0.7"/>

      <!-- 5. MAIN 3D CHARACTER PAIR (Cat & Dog Clay Renders) -->

      <!-- 3D Dog (Right Side of Center) -->
      <g transform="translate(340, 60)" filter="url(#softShadow)">
        <!-- Dog Body -->
        <ellipse cx="90" cy="155" rx="65" ry="55" fill="url(#dogSphere)"/>
        <!-- Dog Floppy Ear Left -->
        <path d="M45 75 C30 75, 20 105, 28 125 C34 138, 48 135, 52 120 Z" fill="#ea580c"/>
        <!-- Dog Floppy Ear Right -->
        <path d="M125 75 C140 75, 150 105, 142 125 C136 138, 122 135, 118 120 Z" fill="#ea580c"/>
        <!-- Dog Head -->
        <circle cx="85" cy="85" r="48" fill="url(#dogSphere)"/>
        <!-- 3D Muzzle -->
        <ellipse cx="85" cy="98" rx="24" ry="18" fill="#ffffff"/>
        <!-- Cute dimensional Nose -->
        <ellipse cx="85" cy="92" rx="7" ry="5" fill="#0a0d12"/>
        <!-- Soft friendly mouth -->
        <path d="M80 102 C82 106, 88 106, 90 102" stroke="#0a0d12" stroke-width="2.5" stroke-linecap="round" fill="none"/>
        <!-- Friendly Eyes -->
        <circle cx="70" cy="82" r="4.5" fill="#0a0d12"/>
        <circle cx="68.5" cy="80.5" r="1.5" fill="#ffffff"/>
        <circle cx="100" cy="82" r="4.5" fill="#0a0d12"/>
        <circle cx="98.5" cy="80.5" r="1.5" fill="#ffffff"/>
      </g>

      <!-- 3D Cat (Left Side of Center) -->
      <g transform="translate(190, 75)" filter="url(#softShadow)">
        <!-- Cat Body -->
        <ellipse cx="85" cy="140" rx="60" ry="50" fill="url(#catSphere)"/>
        <!-- Cat Ear Left -->
        <path d="M48 65 L40 25 C42 22, 54 28, 62 48 Z" fill="url(#catSphere)"/>
        <path d="M48 55 L45 32 L56 46 Z" fill="#ffd1b8" opacity="0.8"/>
        <!-- Cat Ear Right -->
        <path d="M112 65 L120 25 C118 22, 106 28, 98 48 Z" fill="url(#catSphere)"/>
        <path d="M112 55 L115 32 L104 46 Z" fill="#ffd1b8" opacity="0.8"/>
        <!-- Cat Head -->
        <circle cx="80" cy="75" r="44" fill="url(#catSphere)"/>
        <!-- Highlight curve -->
        <ellipse cx="72" cy="58" rx="20" ry="8" fill="#ffffff" opacity="0.6"/>
        <!-- Cute sleeping / happy eyes -->
        <path d="M60 74 C64 78, 70 78, 74 74" stroke="#0a0d12" stroke-width="2.5" stroke-linecap="round" fill="none"/>
        <path d="M86 74 C90 78, 96 78, 100 74" stroke="#0a0d12" stroke-width="2.5" stroke-linecap="round" fill="none"/>
        <!-- Tiny Peach Nose -->
        <polygon points="78,82 82,82 80,85" fill="#ffd1b8"/>
        <!-- Cheeks -->
        <circle cx="58" cy="82" r="5" fill="#ffd1b8" opacity="0.6"/>
        <circle cx="102" cy="82" r="5" fill="#ffd1b8" opacity="0.6"/>
      </g>

      <!-- 6. Floating 3D QR Tag Medallion (Center Foreground) -->
      <g transform="translate(305, 175)" filter="url(#softShadow)">
        <!-- Connecting Ring -->
        <ellipse cx="35" cy="6" rx="9" ry="12" fill="none" stroke="url(#irisGrad)" stroke-width="4"/>
        <!-- Rounded Pill Medallion -->
        <rect x="0" y="14" width="70" height="85" rx="22" fill="#ffffff"/>
        <rect x="0" y="14" width="70" height="85" rx="22" stroke="url(#irisGrad)" stroke-width="2.5"/>
        
        <!-- Scannable Matrix Minimal Dots -->
        <g transform="translate(14, 28)">
          <rect x="0" y="0" width="12" height="12" rx="3" fill="#181d27"/>
          <rect x="3" y="3" width="6" height="6" rx="1.5" fill="#ffffff"/>
          <rect x="30" y="0" width="12" height="12" rx="3" fill="#181d27"/>
          <rect x="33" y="3" width="6" height="6" rx="1.5" fill="#ffffff"/>
          <rect x="0" y="30" width="12" height="12" rx="3" fill="#181d27"/>
          <rect x="3" y="33" width="6" height="6" rx="1.5" fill="#ffffff"/>
          <rect x="18" y="18" width="8" height="8" rx="2" fill="#0069e0"/>
          <circle cx="34" cy="34" r="3" fill="#181d27"/>
        </g>
        <text x="35" y="88" font-family="'Geist', sans-serif" font-size="8" font-weight="600" fill="#0069e0" text-anchor="middle" letter-spacing="1">MYPET</text>
      </g>
    </svg>
    `;
  },

  // Step 1: 3D Create (Phone profile card with floating avatar)
  step1Create: function() {
    return `
    <svg viewBox="0 0 200 160" width="100%" height="160" fill="none" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <radialGradient id="s1Sphere" cx="30%" cy="30%" r="70%">
          <stop offset="0%" stop-color="#ffffff"/>
          <stop offset="60%" stop-color="#f1e6ff"/>
          <stop offset="100%" stop-color="#e4ccff"/>
        </radialGradient>
        <filter id="s1Shadow" x="-10%" y="-10%" width="125%" height="125%">
          <feDropShadow dx="0" dy="8" stdDeviation="10" flood-color="#7c3aed" flood-opacity="0.08"/>
        </filter>
      </defs>

      <!-- Floating Pastel Background Disk -->
      <circle cx="100" cy="80" r="65" fill="#f1e6ff" opacity="0.6"/>

      <!-- 3D Card / Phone Body -->
      <g transform="translate(55, 20)" filter="url(#s1Shadow)">
        <rect x="0" y="0" width="90" height="120" rx="20" fill="#ffffff"/>
        
        <!-- Dimensional Avatar Bubble -->
        <circle cx="45" cy="42" r="22" fill="url(#s1Sphere)"/>
        <!-- Soft smiling face inside -->
        <circle cx="38" cy="40" r="2.5" fill="#181d27"/>
        <circle cx="52" cy="40" r="2.5" fill="#181d27"/>
        <path d="M42 46 C44 48, 46 48, 48 46" stroke="#181d27" stroke-width="1.8" stroke-linecap="round"/>

        <!-- Form fields pills -->
        <rect x="18" y="74" width="54" height="8" rx="4" fill="#f6f7f8"/>
        <rect x="18" y="86" width="38" height="8" rx="4" fill="#f6f7f8"/>
        
        <!-- Charcoal Pill Button -->
        <rect x="18" y="100" width="54" height="12" rx="6" fill="#181d27"/>
      </g>

      <!-- Floating Pencil / Wand -->
      <g transform="translate(138, 50) rotate(24)">
        <rect x="0" y="0" width="10" height="34" rx="5" fill="#ffd1b8"/>
        <polygon points="0,34 10,34 5,42" fill="#181d27"/>
      </g>
    </svg>
    `;
  },

  // Step 2: 3D Tag (Dimensional pet collar with iris blue QR medallion)
  step2Tag: function() {
    return `
    <svg viewBox="0 0 200 160" width="100%" height="160" fill="none" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="collarGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stop-color="#ffd1b8"/>
          <stop offset="100%" stop-color="#fb923c"/>
        </linearGradient>
        <linearGradient id="tagIrisGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stop-color="#479dff"/>
          <stop offset="100%" stop-color="#0069e0"/>
        </linearGradient>
        <filter id="s2Shadow" x="-15%" y="-15%" width="130%" height="130%">
          <feDropShadow dx="0" dy="8" stdDeviation="12" flood-color="#0069e0" flood-opacity="0.1"/>
        </filter>
      </defs>

      <!-- Background Disk -->
      <circle cx="100" cy="80" r="65" fill="#cce7ff" opacity="0.6"/>

      <!-- 3D Curved Collar -->
      <path d="M30 65 C65 105, 135 105, 170 65" stroke="url(#collarGrad)" stroke-width="14" stroke-linecap="round" filter="url(#s2Shadow)"/>
      <rect x="44" y="60" width="14" height="20" rx="4" fill="#ffffff"/>

      <!-- Hanging 3D Pill Tag -->
      <g transform="translate(76, 75)" filter="url(#s2Shadow)">
        <ellipse cx="24" cy="5" rx="6" ry="9" fill="none" stroke="url(#tagIrisGrad)" stroke-width="3"/>
        <rect x="0" y="12" width="48" height="58" rx="16" fill="#ffffff"/>
        
        <!-- Scannable pattern -->
        <g transform="translate(10, 22)">
          <rect x="0" y="0" width="8" height="8" rx="2" fill="#181d27"/>
          <rect x="20" y="0" width="8" height="8" rx="2" fill="#181d27"/>
          <rect x="0" y="20" width="8" height="8" rx="2" fill="#181d27"/>
          <rect x="11" y="11" width="6" height="6" rx="1.5" fill="#0069e0"/>
        </g>
      </g>

      <!-- Floating Sparkle -->
      <path d="M150 35 L153 26 L156 35 L165 38 L156 41 L153 50 L150 41 L141 38 Z" fill="#fff2be"/>
    </svg>
    `;
  },

  // Step 3: 3D Reunite (Smart phone scanner & happy reunion alert)
  step3Reunite: function() {
    return `
    <svg viewBox="0 0 200 160" width="100%" height="160" fill="none" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="screenGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stop-color="#ebf5ff"/>
          <stop offset="100%" stop-color="#d3f6e3"/>
        </linearGradient>
        <filter id="s3Shadow" x="-15%" y="-15%" width="130%" height="130%">
          <feDropShadow dx="0" dy="10" stdDeviation="12" flood-color="#10b981" flood-opacity="0.12"/>
        </filter>
      </defs>

      <!-- Background Disk -->
      <circle cx="100" cy="80" r="65" fill="#d3f6e3" opacity="0.6"/>

      <!-- Smartphone scanning -->
      <g transform="translate(60, 22) rotate(-6)" filter="url(#s3Shadow)">
        <rect x="0" y="0" width="80" height="120" rx="20" fill="#ffffff"/>
        <rect x="6" y="12" width="68" height="96" rx="14" fill="url(#screenGrad)"/>
        
        <!-- Scanner HUD reticle in Iris Blue -->
        <path d="M16 28 L24 28 M16 28 L16 36" stroke="#0069e0" stroke-width="2.5" stroke-linecap="round"/>
        <path d="M64 28 L56 28 M64 28 L64 36" stroke="#0069e0" stroke-width="2.5" stroke-linecap="round"/>
        <path d="M16 72 L24 72 M16 72 L16 64" stroke="#0069e0" stroke-width="2.5" stroke-linecap="round"/>
        <path d="M64 72 L56 72 M64 72 L64 64" stroke="#0069e0" stroke-width="2.5" stroke-linecap="round"/>

        <!-- Success Toast Pill inside phone -->
        <rect x="14" y="80" width="52" height="22" rx="11" fill="#181d27"/>
        <circle cx="25" cy="91" r="5" fill="#10b981"/>
        <path d="M23 91 L24.5 92.5 L27 89.5" stroke="#ffffff" stroke-width="1.5" stroke-linecap="round"/>
        <text x="35" y="94" font-family="'Geist', sans-serif" font-size="7.5" font-weight="600" fill="#ffffff">Owner Reunited</text>
      </g>

      <!-- Floating 3D Heart -->
      <g transform="translate(135, 45) rotate(14)">
        <path d="M15 4 C19 -2, 28 0, 30 7 C32 16, 17 26, 15 28 C13 26, -2 16, 0 7 C2 0, 11 -2, 15 4 Z" fill="#ffd1b8"/>
      </g>
    </svg>
    `;
  },

  // Physical Pet Tag Graphic for the QR Tag screen
  physicalTagGraphic: function(petName, qrSvgMarkup) {
    return `
    <div class="physical-tag-wrapper">
      <div class="physical-tag-ring"></div>
      <div class="physical-tag-card">
        <div class="tag-brand-header">
          <span style="display: inline-flex; width: 10px; height: 10px; border-radius: 50%; background: var(--gradient-iris-blue); margin-right: 4px;"></span>
          <span>MyPet Tag</span>
        </div>
        <div class="tag-qr-center">
          ${qrSvgMarkup}
        </div>
        <div class="tag-pet-name">${petName}</div>
        <div class="tag-scan-caption">Scan with phone camera to reach owner</div>
      </div>
    </div>
    `;
  },

  // Dimensional 3D Clay Avatars
  avatars: {
    luna: `
      <svg viewBox="0 0 100 100" width="100%" height="100%">
        <defs>
          <radialGradient id="lunaCat" cx="35%" cy="30%" r="70%">
            <stop offset="0%" stop-color="#ffffff"/>
            <stop offset="60%" stop-color="#f1f5f9"/>
            <stop offset="100%" stop-color="#cbd5e1"/>
          </radialGradient>
        </defs>
        <circle cx="50" cy="50" r="48" fill="#fafdff"/>
        <!-- 3D Ears -->
        <path d="M28 36 L22 14 C25 12, 38 18, 42 32 Z" fill="#e2e8f0"/>
        <path d="M28 30 L25 19 L36 28 Z" fill="#f1e6ff"/>
        <path d="M72 36 L78 14 C75 12, 62 18, 58 32 Z" fill="#e2e8f0"/>
        <path d="M72 30 L75 19 L64 28 Z" fill="#f1e6ff"/>
        <!-- Head -->
        <circle cx="50" cy="54" r="30" fill="url(#lunaCat)"/>
        <!-- Eyes -->
        <circle cx="41" cy="52" r="3" fill="#0a0d12"/>
        <circle cx="59" cy="52" r="3" fill="#0a0d12"/>
        <circle cx="40" cy="51" r="1" fill="#ffffff"/>
        <circle cx="58" cy="51" r="1" fill="#ffffff"/>
        <!-- Nose & Mouth -->
        <polygon points="48,58 52,58 50,60" fill="#ffd1b8"/>
        <path d="M47 62 C49 64, 51 64, 53 62" stroke="#0a0d12" stroke-width="1.2" stroke-linecap="round"/>
        <!-- Iris Blue Collar -->
        <rect x="36" y="74" width="28" height="6" rx="3" fill="#0069e0"/>
        <circle cx="50" cy="82" r="3" fill="#181d27"/>
      </svg>
    `,
    milo: `
      <svg viewBox="0 0 100 100" width="100%" height="100%">
        <defs>
          <radialGradient id="miloDog" cx="35%" cy="30%" r="70%">
            <stop offset="0%" stop-color="#fffbeb"/>
            <stop offset="55%" stop-color="#fed7aa"/>
            <stop offset="100%" stop-color="#fb923c"/>
          </radialGradient>
        </defs>
        <circle cx="50" cy="50" r="48" fill="#fafdff"/>
        <!-- Floppy Ears -->
        <path d="M24 38 C14 42, 14 58, 20 70 C24 74, 30 70, 28 58 Z" fill="#ea580c"/>
        <path d="M76 38 C86 42, 86 58, 80 70 C76 74, 70 70, 72 58 Z" fill="#ea580c"/>
        <!-- Head -->
        <circle cx="50" cy="54" r="28" fill="url(#miloDog)"/>
        <!-- Muzzle -->
        <ellipse cx="50" cy="62" rx="14" ry="10" fill="#ffffff"/>
        <ellipse cx="50" cy="58" rx="4.5" ry="3.5" fill="#0a0d12"/>
        <!-- Eyes -->
        <circle cx="41" cy="48" r="3" fill="#0a0d12"/>
        <circle cx="59" cy="48" r="3" fill="#0a0d12"/>
        <circle cx="40" cy="47" r="1" fill="#ffffff"/>
        <circle cx="58" cy="47" r="1" fill="#ffffff"/>
        <!-- Charcoal Collar -->
        <rect x="36" y="74" width="28" height="6" rx="3" fill="#181d27"/>
        <circle cx="50" cy="82" r="3" fill="#0069e0"/>
      </svg>
    `,
    catDefault: `
      <svg viewBox="0 0 100 100" width="100%" height="100%">
        <defs>
          <radialGradient id="tabbyCat" cx="35%" cy="30%" r="70%">
            <stop offset="0%" stop-color="#fffbeb"/>
            <stop offset="60%" stop-color="#fde68a"/>
            <stop offset="100%" stop-color="#f59e0b"/>
          </radialGradient>
        </defs>
        <circle cx="50" cy="50" r="48" fill="#fafdff"/>
        <path d="M28 36 L22 14 C25 12, 38 18, 42 32 Z" fill="#d97706"/>
        <path d="M72 36 L78 14 C75 12, 62 18, 58 32 Z" fill="#d97706"/>
        <circle cx="50" cy="54" r="30" fill="url(#tabbyCat)"/>
        <circle cx="41" cy="52" r="3" fill="#0a0d12"/>
        <circle cx="59" cy="52" r="3" fill="#0a0d12"/>
        <polygon points="48,58 52,58 50,60" fill="#ffd1b8"/>
        <rect x="36" y="74" width="28" height="6" rx="3" fill="#181d27"/>
        <circle cx="50" cy="82" r="3" fill="#10b981"/>
      </svg>
    `,
    dogDefault: `
      <svg viewBox="0 0 100 100" width="100%" height="100%">
        <defs>
          <radialGradient id="brownDog" cx="35%" cy="30%" r="70%">
            <stop offset="0%" stop-color="#ffffff"/>
            <stop offset="55%" stop-color="#e2e8f0"/>
            <stop offset="100%" stop-color="#94a3b8"/>
          </radialGradient>
        </defs>
        <circle cx="50" cy="50" r="48" fill="#fafdff"/>
        <path d="M24 38 C14 42, 14 58, 20 70 C24 74, 30 70, 28 58 Z" fill="#475569"/>
        <path d="M76 38 C86 42, 86 58, 80 70 C76 74, 70 70, 72 58 Z" fill="#475569"/>
        <circle cx="50" cy="54" r="28" fill="url(#brownDog)"/>
        <ellipse cx="50" cy="62" rx="14" ry="10" fill="#ffffff"/>
        <ellipse cx="50" cy="58" rx="4.5" ry="3.5" fill="#0a0d12"/>
        <circle cx="41" cy="48" r="3" fill="#0a0d12"/>
        <circle cx="59" cy="48" r="3" fill="#0a0d12"/>
        <rect x="36" y="74" width="28" height="6" rx="3" fill="#0069e0"/>
        <circle cx="50" cy="82" r="3" fill="#ffffff"/>
      </svg>
    `,
    rabbitDefault: `
      <svg viewBox="0 0 100 100" width="100%" height="100%">
        <circle cx="50" cy="50" r="48" fill="#fafdff"/>
        <!-- Tall 3D Bunny Ears -->
        <ellipse cx="38" cy="22" rx="8" ry="18" fill="#ffffff"/>
        <ellipse cx="38" cy="22" rx="4" ry="12" fill="#f1e6ff"/>
        <ellipse cx="62" cy="22" rx="8" ry="18" fill="#ffffff"/>
        <ellipse cx="62" cy="22" rx="4" ry="12" fill="#f1e6ff"/>
        <circle cx="50" cy="58" r="26" fill="#f8fafc"/>
        <circle cx="42" cy="56" r="2.5" fill="#0a0d12"/>
        <circle cx="58" cy="56" r="2.5" fill="#0a0d12"/>
        <polygon points="48,60 52,60 50,62" fill="#ffd1b8"/>
        <rect x="36" y="74" width="28" height="6" rx="3" fill="#7c3aed"/>
        <circle cx="50" cy="82" r="3" fill="#ffffff"/>
      </svg>
    `,
    otherDefault: `
      <svg viewBox="0 0 100 100" width="100%" height="100%">
        <circle cx="50" cy="50" r="48" fill="#fafdff"/>
        <!-- Small Ears -->
        <circle cx="34" cy="36" r="8" fill="#ffd1b8"/>
        <circle cx="66" cy="36" r="8" fill="#ffd1b8"/>
        <circle cx="50" cy="56" r="26" fill="#fed7aa"/>
        <circle cx="42" cy="52" r="3" fill="#0a0d12"/>
        <circle cx="58" cy="52" r="3" fill="#0a0d12"/>
        <ellipse cx="50" cy="58" rx="3" ry="2" fill="#ea580c"/>
        <rect x="36" y="74" width="28" height="6" rx="3" fill="#181d27"/>
        <circle cx="50" cy="82" r="3" fill="#0069e0"/>
      </svg>
    `
  }
};

window.PetIllustrations = PetIllustrations;
