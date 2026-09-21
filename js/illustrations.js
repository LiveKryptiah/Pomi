/**
 * MyPet Bespoke Hand-Drawn Storybook SVG Illustrations
 * Designed in the Family storybook visual aesthetic:
 * - Warm cream fills & flat saturated accent colors
 * - Organic charcoal outlines (stroke: #121212, stroke-width: 2.2, round caps/joins)
 * - Playful, emotional expressions for cats, dogs, and doodles
 */

const PetIllustrations = {
  // Hero Cat wearing QR collar with playful expression
  heroCat: function(width = 340, height = 340) {
    return `
    <svg viewBox="0 0 320 320" width="${width}" height="${height}" fill="none" xmlns="http://www.w3.org/2000/svg" class="storybook-art cat-art">
      <!-- Background soft blob -->
      <path d="M70 120 C40 60, 120 20, 200 35 C280 50, 310 130, 280 210 C250 290, 160 305, 90 280 C20 255, 100 180, 70 120 Z" fill="#f6f4ef" stroke="#e5d5c3" stroke-width="2" stroke-dasharray="4 6"/>
      
      <!-- Floating doodles -->
      <!-- Star 1 -->
      <path d="M48 55 L52 42 L56 55 L68 59 L56 63 L52 75 L48 63 L36 59 Z" fill="#ffcd6c" stroke="#121212" stroke-width="2" stroke-linejoin="round"/>
      <!-- Heart -->
      <path d="M260 70 C250 55, 235 65, 235 75 C235 90, 255 105, 255 105 C255 105, 275 90, 275 75 C275 65, 260 55, 260 70 Z" fill="#ff58ae" stroke="#121212" stroke-width="2" stroke-linejoin="round"/>
      <!-- Small paw print -->
      <g transform="translate(42, 210) rotate(-15) scale(0.8)">
        <ellipse cx="20" cy="24" rx="8" ry="6" fill="#0086fc" stroke="#121212" stroke-width="2"/>
        <circle cx="10" cy="14" r="3.5" fill="#0086fc" stroke="#121212" stroke-width="1.8"/>
        <circle cx="18" cy="10" r="3.5" fill="#0086fc" stroke="#121212" stroke-width="1.8"/>
        <circle cx="26" cy="12" r="3.5" fill="#0086fc" stroke="#121212" stroke-width="1.8"/>
      </g>
      <!-- Sparkle/cross -->
      <path d="M275 180 L287 180 M281 174 L281 186" stroke="#ff3e00" stroke-width="3" stroke-linecap="round"/>
      <!-- Little leaf -->
      <path d="M245 250 C265 240, 275 260, 270 270 C255 275, 245 260, 245 250 Z" fill="#00c978" stroke="#121212" stroke-width="2"/>

      <!-- Cat Body -->
      <!-- Tail -->
      <path d="M95 245 C60 250, 45 190, 68 165 C76 156, 85 168, 80 178 C65 195, 78 228, 105 228" fill="#f2f0ed" stroke="#121212" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"/>
      
      <!-- Back & Body -->
      <path d="M102 245 C102 185, 120 160, 160 160 C200 160, 222 185, 222 245 C222 265, 102 265, 102 245 Z" fill="#ffffff" stroke="#121212" stroke-width="2.5" stroke-linejoin="round"/>
      
      <!-- Cat Calico/Tabby patch on shoulder -->
      <path d="M185 168 C205 175, 218 195, 215 215 C205 210, 195 200, 185 190 Z" fill="#ffcd6c" stroke="#121212" stroke-width="2" stroke-linejoin="round"/>
      
      <!-- Chest patch -->
      <path d="M142 185 C150 175, 170 175, 178 185 C185 205, 175 235, 160 238 C145 235, 135 205, 142 185 Z" fill="#fbfaf9"/>

      <!-- Front Paws -->
      <rect x="135" y="235" width="22" height="28" rx="10" fill="#ffffff" stroke="#121212" stroke-width="2.5"/>
      <rect x="165" y="235" width="22" height="28" rx="10" fill="#ffffff" stroke="#121212" stroke-width="2.5"/>
      <!-- Paw toe lines -->
      <line x1="142" y1="254" x2="142" y2="261" stroke="#121212" stroke-width="2" stroke-linecap="round"/>
      <line x1="150" y1="254" x2="150" y2="261" stroke="#121212" stroke-width="2" stroke-linecap="round"/>
      <line x1="172" y1="254" x2="172" y2="261" stroke="#121212" stroke-width="2" stroke-linecap="round"/>
      <line x1="180" y1="254" x2="180" y2="261" stroke="#121212" stroke-width="2" stroke-linecap="round"/>

      <!-- Collar & QR Tag -->
      <path d="M125 174 C140 184, 180 184, 195 174" stroke="#ff3e00" stroke-width="8" stroke-linecap="round"/>
      <path d="M125 174 C140 184, 180 184, 195 174" stroke="#121212" stroke-width="2" stroke-linecap="round" fill="none"/>
      <!-- Tag ring -->
      <circle cx="160" cy="184" r="4" fill="none" stroke="#121212" stroke-width="2"/>
      <!-- Square QR Pet Tag hanging -->
      <g transform="translate(148, 188)">
        <rect x="0" y="0" width="24" height="24" rx="4" fill="#ffffff" stroke="#121212" stroke-width="2"/>
        <!-- Mini QR pattern inside tag -->
        <rect x="3" y="3" width="6" height="6" fill="#121212" rx="1"/>
        <rect x="15" y="3" width="6" height="6" fill="#121212" rx="1"/>
        <rect x="3" y="15" width="6" height="6" fill="#121212" rx="1"/>
        <rect x="13" y="13" width="4" height="4" fill="#0086fc"/>
        <circle cx="17" cy="17" r="1.5" fill="#ff3e00"/>
      </g>

      <!-- Cat Head -->
      <!-- Ears -->
      <path d="M115 110 L102 62 C100 58, 107 55, 114 60 L138 90 Z" fill="#ffffff" stroke="#121212" stroke-width="2.5" stroke-linejoin="round"/>
      <path d="M112 100 L107 72 L128 88 Z" fill="#ff58ae"/>
      <path d="M205 110 L218 62 C220 58, 213 55, 206 60 L182 90 Z" fill="#ffffff" stroke="#121212" stroke-width="2.5" stroke-linejoin="round"/>
      <path d="M208 100 L213 72 L192 88 Z" fill="#ff58ae"/>

      <!-- Head shape -->
      <ellipse cx="160" cy="120" rx="52" ry="44" fill="#ffffff" stroke="#121212" stroke-width="2.5"/>
      <!-- Patch over left eye -->
      <path d="M125 90 C110 110, 115 138, 138 142 C148 135, 150 100, 138 92 Z" fill="#e5d5c3" opacity="0.6"/>

      <!-- Happy Eyes -->
      <path d="M136 118 C140 112, 148 112, 152 118" stroke="#121212" stroke-width="3" stroke-linecap="round" fill="none"/>
      <path d="M168 118 C172 112, 180 112, 184 118" stroke="#121212" stroke-width="3" stroke-linecap="round" fill="none"/>

      <!-- Nose & Mouth -->
      <polygon points="157,126 163,126 160,130" fill="#ff58ae" stroke="#121212" stroke-width="1.5"/>
      <path d="M160 130 L160 134 C156 136, 152 135, 150 133 M160 134 C164 136, 168 135, 170 133" stroke="#121212" stroke-width="2" stroke-linecap="round" fill="none"/>

      <!-- Whiskers -->
      <line x1="120" y1="128" x2="98" y2="124" stroke="#121212" stroke-width="2" stroke-linecap="round"/>
      <line x1="122" y1="134" x2="96" y2="136" stroke="#121212" stroke-width="2" stroke-linecap="round"/>
      <line x1="198" y1="128" x2="222" y2="124" stroke="#121212" stroke-width="2" stroke-linecap="round"/>
      <line x1="196" y1="134" x2="224" y2="136" stroke="#121212" stroke-width="2" stroke-linecap="round"/>

      <!-- Cheek blush -->
      <ellipse cx="130" cy="128" rx="6" ry="3.5" fill="#ff58ae" opacity="0.4"/>
      <ellipse cx="190" cy="128" rx="6" ry="3.5" fill="#ff58ae" opacity="0.4"/>
    </svg>
    `;
  },

  // Hero Dog wearing QR collar with floppy ears & wagging tail
  heroDog: function(width = 340, height = 340) {
    return `
    <svg viewBox="0 0 320 320" width="${width}" height="${height}" fill="none" xmlns="http://www.w3.org/2000/svg" class="storybook-art dog-art">
      <!-- Background soft organic shape -->
      <path d="M80 110 C40 40, 140 15, 210 25 C290 40, 305 130, 275 205 C245 280, 155 300, 85 270 C25 240, 95 160, 80 110 Z" fill="#f6f4ef" stroke="#e5d5c3" stroke-width="2" stroke-dasharray="4 6"/>

      <!-- Floating playful doodles -->
      <!-- Dog bone doodle -->
      <g transform="translate(240, 48) rotate(25)">
        <path d="M6 10 C3 10, 0 8, 0 5 C0 2, 4 0, 7 3 C9 0, 13 2, 13 5 C13 8, 10 10, 7 10 L28 10 C25 10, 22 8, 22 5 C22 2, 26 0, 29 3 C31 0, 35 2, 35 5 C35 8, 32 10, 29 10 Z" fill="#ffcd6c" stroke="#121212" stroke-width="2" stroke-linejoin="round"/>
      </g>
      <!-- Sparkle -->
      <path d="M42 90 L48 90 M45 84 L45 96" stroke="#0086fc" stroke-width="3" stroke-linecap="round"/>
      <!-- Star -->
      <path d="M265 185 L269 174 L273 185 L284 188 L273 192 L269 202 L265 192 L254 188 Z" fill="#ff58ae" stroke="#121212" stroke-width="2" stroke-linejoin="round"/>
      <!-- Little heart -->
      <path d="M52 175 C45 162, 32 170, 32 178 C32 190, 48 202, 48 202 C48 202, 64 190, 64 178 C64 170, 51 162, 52 175 Z" fill="#ff3e00" stroke="#121212" stroke-width="2" stroke-linejoin="round"/>
      <!-- Swirl/sound wave -->
      <path d="M255 245 C270 240, 280 255, 272 268" stroke="#00c978" stroke-width="3" stroke-linecap="round" fill="none"/>

      <!-- Dog Tail Wagging -->
      <path d="M210 215 C245 200, 265 170, 258 150 C252 145, 242 152, 245 162 C248 178, 230 198, 202 212" fill="#ffcd6c" stroke="#121212" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"/>
      <!-- Wag motion dashes -->
      <path d="M268 140 C274 148, 276 158, 272 168" stroke="#7e7e7d" stroke-width="2" stroke-linecap="round" stroke-dasharray="2 4"/>

      <!-- Dog Body -->
      <path d="M108 245 C108 175, 130 155, 170 155 C210 155, 222 180, 220 245 C220 265, 108 265, 108 245 Z" fill="#ffcd6c" stroke="#121212" stroke-width="2.5" stroke-linejoin="round"/>

      <!-- Dog Chest white patch -->
      <path d="M145 185 C155 175, 175 175, 185 185 C192 205, 185 240, 165 242 C145 240, 138 205, 145 185 Z" fill="#ffffff"/>

      <!-- Paws -->
      <rect x="135" y="235" width="24" height="28" rx="11" fill="#ffffff" stroke="#121212" stroke-width="2.5"/>
      <rect x="168" y="235" width="24" height="28" rx="11" fill="#ffffff" stroke="#121212" stroke-width="2.5"/>
      <line x1="143" y1="254" x2="143" y2="261" stroke="#121212" stroke-width="2" stroke-linecap="round"/>
      <line x1="151" y1="254" x2="151" y2="261" stroke="#121212" stroke-width="2" stroke-linecap="round"/>
      <line x1="176" y1="254" x2="176" y2="261" stroke="#121212" stroke-width="2" stroke-linecap="round"/>
      <line x1="184" y1="254" x2="184" y2="261" stroke="#121212" stroke-width="2" stroke-linecap="round"/>

      <!-- Collar & QR Tag -->
      <path d="M125 172 C142 184, 182 184, 202 172" stroke="#0086fc" stroke-width="9" stroke-linecap="round"/>
      <path d="M125 172 C142 184, 182 184, 202 172" stroke="#121212" stroke-width="2" stroke-linecap="round" fill="none"/>
      <!-- Ring -->
      <circle cx="163" cy="183" r="4" fill="none" stroke="#121212" stroke-width="2"/>
      <!-- QR Pet Tag Medallion -->
      <g transform="translate(150, 187)">
        <rect x="0" y="0" width="26" height="26" rx="6" fill="#ffffff" stroke="#121212" stroke-width="2"/>
        <rect x="4" y="4" width="6" height="6" fill="#121212" rx="1"/>
        <rect x="16" y="4" width="6" height="6" fill="#121212" rx="1"/>
        <rect x="4" y="16" width="6" height="6" fill="#121212" rx="1"/>
        <rect x="14" y="14" width="4" height="4" fill="#ff3e00"/>
        <circle cx="18" cy="18" r="1.5" fill="#00c978"/>
      </g>

      <!-- Dog Head -->
      <!-- Floppy Ear Left -->
      <path d="M122 88 C95 90, 80 120, 88 145 C94 158, 108 155, 114 140 C118 128, 122 108, 122 88 Z" fill="#d48f00" stroke="#121212" stroke-width="2.5" stroke-linejoin="round"/>
      
      <!-- Floppy Ear Right -->
      <path d="M205 88 C232 90, 247 120, 239 145 C233 158, 219 155, 213 140 C209 128, 205 108, 205 88 Z" fill="#d48f00" stroke="#121212" stroke-width="2.5" stroke-linejoin="round"/>

      <!-- Main Head -->
      <ellipse cx="164" cy="115" rx="50" ry="46" fill="#ffcd6c" stroke="#121212" stroke-width="2.5"/>

      <!-- Snout -->
      <ellipse cx="164" cy="128" rx="26" ry="20" fill="#ffffff" stroke="#121212" stroke-width="2"/>
      
      <!-- Big Soft Nose -->
      <path d="M156 120 C156 116, 172 116, 172 120 C172 126, 166 128, 164 128 C162 128, 156 126, 156 120 Z" fill="#121212"/>
      
      <!-- Happy Open Mouth / Tongue -->
      <path d="M164 128 L164 135" stroke="#121212" stroke-width="2"/>
      <path d="M154 135 C158 144, 170 144, 174 135" stroke="#121212" stroke-width="2" stroke-linecap="round" fill="none"/>
      <!-- Happy pink tongue -->
      <path d="M160 136 C160 146, 168 146, 168 136 Z" fill="#ff58ae" stroke="#121212" stroke-width="1.5"/>

      <!-- Eyes with sparkle -->
      <ellipse cx="145" cy="108" rx="5" ry="6" fill="#121212"/>
      <circle cx="144" cy="106" r="1.8" fill="#ffffff"/>
      <ellipse cx="183" cy="108" rx="5" ry="6" fill="#121212"/>
      <circle cx="182" cy="106" r="1.8" fill="#ffffff"/>

      <!-- Cheerful Eyebrows -->
      <path d="M139 96 C143 92, 149 93, 151 96" stroke="#121212" stroke-width="2.2" stroke-linecap="round"/>
      <path d="M177 96 C179 93, 185 92, 189 96" stroke="#121212" stroke-width="2.2" stroke-linecap="round"/>
    </svg>
    `;
  },

  // How It Works Step 1: Owner creating pet profile
  step1Create: function() {
    return `
    <svg viewBox="0 0 240 180" width="100%" height="160" fill="none" xmlns="http://www.w3.org/2000/svg" class="storybook-step-art">
      <!-- Storybook accent background -->
      <circle cx="120" cy="90" r="70" fill="#eaf4ff"/>
      <circle cx="120" cy="90" r="70" stroke="#0086fc" stroke-width="2" stroke-dasharray="3 5"/>
      
      <!-- Phone / Card mockup -->
      <rect x="55" y="32" width="85" height="116" rx="12" fill="#ffffff" stroke="#121212" stroke-width="2.2"/>
      <!-- Pet photo inside phone -->
      <ellipse cx="97" cy="65" rx="18" ry="18" fill="#ffcd6c" stroke="#121212" stroke-width="1.8"/>
      <!-- Cat face inside -->
      <path d="M88 56 L83 48 L91 52 Z" fill="#ffffff" stroke="#121212" stroke-width="1.2"/>
      <path d="M106 56 L111 48 L103 52 Z" fill="#ffffff" stroke="#121212" stroke-width="1.2"/>
      <circle cx="92" cy="63" r="1.8" fill="#121212"/>
      <circle cx="102" cy="63" r="1.8" fill="#121212"/>
      <polygon points="96,67 98,67 97,69" fill="#ff58ae"/>
      
      <!-- Input lines -->
      <rect x="68" y="92" width="58" height="8" rx="4" fill="#f2f0ed" stroke="#121212" stroke-width="1.2"/>
      <rect x="68" y="105" width="42" height="8" rx="4" fill="#f2f0ed" stroke="#121212" stroke-width="1.2"/>
      <rect x="68" y="122" width="58" height="14" rx="7" fill="#0086fc" stroke="#121212" stroke-width="1.5"/>
      <text x="97" y="132" font-size="8" font-family="Inter, sans-serif" font-weight="bold" fill="#ffffff" text-anchor="middle">Save Pet</text>

      <!-- Hand holding pencil or petting -->
      <g transform="translate(130, 75) rotate(-10)">
        <path d="M10 30 C20 20, 45 35, 60 40 L50 65 C35 60, 20 45, 10 30 Z" fill="#f6f4ef" stroke="#121212" stroke-width="2"/>
        <circle cx="22" cy="22" r="12" fill="#ff58ae" stroke="#121212" stroke-width="2"/>
        <path d="M22 16 L22 28 M16 22 L28 22" stroke="#ffffff" stroke-width="2.5" stroke-linecap="round"/>
      </g>
      
      <!-- Star doodle -->
      <path d="M185 45 L188 36 L191 45 L200 48 L191 51 L188 60 L185 51 L176 48 Z" fill="#ffcd6c" stroke="#121212" stroke-width="1.5"/>
    </svg>
    `;
  },

  // How It Works Step 2: Collar with QR tag
  step2Tag: function() {
    return `
    <svg viewBox="0 0 240 180" width="100%" height="160" fill="none" xmlns="http://www.w3.org/2000/svg" class="storybook-step-art">
      <circle cx="120" cy="90" r="70" fill="#fff2ed"/>
      <circle cx="120" cy="90" r="70" stroke="#ff3e00" stroke-width="2" stroke-dasharray="3 5"/>

      <!-- Pet Collar curving across -->
      <path d="M35 80 C80 130, 160 130, 205 80" stroke="#ff3e00" stroke-width="16" stroke-linecap="round"/>
      <path d="M35 80 C80 130, 160 130, 205 80" stroke="#121212" stroke-width="2.2" stroke-linecap="round" fill="none"/>
      <!-- Collar buckle -->
      <rect x="52" y="76" width="14" height="24" rx="3" fill="#ffcd6c" stroke="#121212" stroke-width="2"/>
      <line x1="59" y1="80" x2="59" y2="96" stroke="#121212" stroke-width="2"/>

      <!-- Metal ring -->
      <circle cx="120" cy="115" r="7" fill="none" stroke="#121212" stroke-width="2.5"/>

      <!-- Hanging Storybook Pet Tag -->
      <g transform="translate(95, 120)">
        <rect x="0" y="0" width="50" height="50" rx="10" fill="#ffffff" stroke="#121212" stroke-width="2.2"/>
        <!-- Ring hole -->
        <circle cx="25" cy="8" r="3" fill="#f2f0ed" stroke="#121212" stroke-width="1.5"/>
        
        <!-- Scannable style QR matrix inside -->
        <g transform="translate(10, 14)">
          <rect x="0" y="0" width="10" height="10" rx="2" fill="#121212"/>
          <rect x="2" y="2" width="6" height="6" rx="1" fill="#ffffff"/>
          <rect x="3.5" y="3.5" width="3" height="3" fill="#121212"/>
          
          <rect x="20" y="0" width="10" height="10" rx="2" fill="#121212"/>
          <rect x="22" y="2" width="6" height="6" rx="1" fill="#ffffff"/>
          <rect x="23.5" y="3.5" width="3" height="3" fill="#121212"/>

          <rect x="0" y="20" width="10" height="10" rx="2" fill="#121212"/>
          <rect x="2" y="22" width="6" height="6" rx="1" fill="#ffffff"/>
          <rect x="3.5" y="23.5" width="3" height="3" fill="#121212"/>

          <!-- Accent data dots -->
          <rect x="14" y="14" width="4" height="4" rx="1" fill="#ff3e00"/>
          <rect x="22" y="16" width="3" height="3" rx="0.5" fill="#121212"/>
          <rect x="15" y="22" width="4" height="4" rx="0.5" fill="#0086fc"/>
        </g>
      </g>

      <!-- Sparkle and heart doodles -->
      <path d="M185 45 C178 35, 168 40, 168 46 C168 55, 185 65, 185 65 C185 65, 202 55, 202 46 C202 40, 192 35, 185 45 Z" fill="#ff58ae" stroke="#121212" stroke-width="1.8"/>
      <path d="M55 42 L65 42 M60 37 L60 47" stroke="#ffcd6c" stroke-width="2.5" stroke-linecap="round"/>
    </svg>
    `;
  },

  // How It Works Step 3: Finder scans QR & reunites
  step3Reunite: function() {
    return `
    <svg viewBox="0 0 240 180" width="100%" height="160" fill="none" xmlns="http://www.w3.org/2000/svg" class="storybook-step-art">
      <circle cx="120" cy="90" r="70" fill="#eafaf1"/>
      <circle cx="120" cy="90" r="70" stroke="#00c978" stroke-width="2" stroke-dasharray="3 5"/>

      <!-- Smartphone scanning -->
      <g transform="translate(60, 25) rotate(-6)">
        <rect x="0" y="0" width="70" height="120" rx="14" fill="#ffffff" stroke="#121212" stroke-width="2.4"/>
        <!-- Screen viewfinder -->
        <rect x="8" y="16" width="54" height="88" rx="8" fill="#fbfaf9" stroke="#e5d5c3" stroke-width="1.5"/>
        
        <!-- Camera scan reticle -->
        <path d="M14 26 L22 26 M14 26 L14 34" stroke="#00c978" stroke-width="2.5" stroke-linecap="round"/>
        <path d="M56 26 L48 26 M56 26 L56 34" stroke="#00c978" stroke-width="2.5" stroke-linecap="round"/>
        <path d="M14 66 L22 66 M14 66 L14 58" stroke="#00c978" stroke-width="2.5" stroke-linecap="round"/>
        <path d="M56 66 L48 66 M56 66 L56 58" stroke="#00c978" stroke-width="2.5" stroke-linecap="round"/>
        
        <!-- Scan line beam -->
        <line x1="16" y1="46" x2="54" y2="46" stroke="#00c978" stroke-width="2" stroke-linecap="round" stroke-dasharray="2 3"/>

        <!-- Success notification popup -->
        <rect x="12" y="74" width="46" height="24" rx="6" fill="#121212"/>
        <circle cx="22" cy="86" r="4" fill="#00c978"/>
        <path d="M20 86 L21.5 88 L24 84" stroke="#ffffff" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
        <text x="30" y="89" font-size="7" font-family="Inter, sans-serif" font-weight="bold" fill="#ffffff">Found!</text>
      </g>

      <!-- Happy Dog snout peeking into scan frame -->
      <g transform="translate(138, 70)">
        <path d="M10 50 C25 20, 60 25, 75 50 C85 65, 80 85, 55 90 C25 95, 0 75, 10 50 Z" fill="#ffcd6c" stroke="#121212" stroke-width="2.2"/>
        <!-- Floppy ear -->
        <path d="M48 24 C68 22, 82 45, 74 65 C68 70, 58 65, 55 50 Z" fill="#d48f00" stroke="#121212" stroke-width="2"/>
        <!-- Snout & Nose -->
        <ellipse cx="25" cy="62" rx="14" ry="10" fill="#ffffff" stroke="#121212" stroke-width="1.8"/>
        <ellipse cx="20" cy="58" rx="5" ry="4" fill="#121212"/>
        <ellipse cx="32" cy="46" rx="4" ry="4.5" fill="#121212"/>
        <circle cx="31" cy="44.5" r="1.2" fill="#ffffff"/>
        <!-- Tag on dog collar -->
        <rect x="25" y="80" width="16" height="16" rx="4" fill="#ffffff" stroke="#121212" stroke-width="1.8"/>
        <circle cx="33" cy="88" r="4" fill="#ff3e00"/>
      </g>

      <!-- Hearts reuniting -->
      <path d="M190 32 C184 24, 174 28, 174 33 C174 42, 190 50, 190 50 C190 50, 206 42, 206 33 C206 28, 196 24, 190 32 Z" fill="#ff58ae" stroke="#121212" stroke-width="1.8"/>
    </svg>
    `;
  },

  // Physical Pet Tag Mockup Graphic (for the QR Tag screen)
  physicalTagGraphic: function(petName, qrSvgMarkup) {
    return `
    <div class="physical-tag-wrapper">
      <div class="physical-tag-ring"></div>
      <div class="physical-tag-card">
        <div class="tag-brand-header">
          <span class="tag-brand-paw">🐾</span>
          <span class="tag-brand-name">MyPet</span>
        </div>
        <div class="tag-qr-center">
          ${qrSvgMarkup}
        </div>
        <div class="tag-pet-name">${petName.toUpperCase()}</div>
        <div class="tag-scan-caption">Scan me to reach my family</div>
      </div>
    </div>
    `;
  },

  // Preset Storybook Pet Avatars (for Add Pet flow & dashboard)
  avatars: {
    luna: `
      <svg viewBox="0 0 100 100" width="100%" height="100%">
        <circle cx="50" cy="50" r="48" fill="#f6f4ef" stroke="#e5d5c3" stroke-width="2"/>
        <path d="M30 35 L22 18 L38 27 Z" fill="#ffffff" stroke="#121212" stroke-width="2"/>
        <path d="M70 35 L78 18 L62 27 Z" fill="#ffffff" stroke="#121212" stroke-width="2"/>
        <ellipse cx="50" cy="55" rx="30" ry="26" fill="#ffffff" stroke="#121212" stroke-width="2"/>
        <path d="M32 40 C24 50, 28 68, 42 70 C48 65, 48 45, 40 40 Z" fill="#e5d5c3" opacity="0.6"/>
        <circle cx="42" cy="52" r="3" fill="#121212"/>
        <circle cx="58" cy="52" r="3" fill="#121212"/>
        <polygon points="48,58 52,58 50,61" fill="#ff58ae"/>
        <path d="M50 61 L50 64 C47 66, 44 65, 42 63 M50 64 C53 66, 56 65, 58 63" stroke="#121212" stroke-width="1.5" stroke-linecap="round" fill="none"/>
        <path d="M32 78 C42 84, 58 84, 68 78" stroke="#ff58ae" stroke-width="5" stroke-linecap="round"/>
        <circle cx="50" cy="84" r="3" fill="#ffcd6c" stroke="#121212" stroke-width="1.2"/>
      </svg>
    `,
    milo: `
      <svg viewBox="0 0 100 100" width="100%" height="100%">
        <circle cx="50" cy="50" r="48" fill="#f6f4ef" stroke="#e5d5c3" stroke-width="2"/>
        <path d="M26 38 C14 42, 12 58, 18 70 C22 75, 28 72, 28 62 Z" fill="#d48f00" stroke="#121212" stroke-width="2"/>
        <path d="M74 38 C86 42, 88 58, 82 70 C78 75, 72 72, 72 62 Z" fill="#d48f00" stroke="#121212" stroke-width="2"/>
        <ellipse cx="50" cy="54" rx="28" ry="26" fill="#ffcd6c" stroke="#121212" stroke-width="2"/>
        <ellipse cx="50" cy="62" rx="16" ry="12" fill="#ffffff" stroke="#121212" stroke-width="1.5"/>
        <ellipse cx="50" cy="58" rx="4.5" ry="3.5" fill="#121212"/>
        <circle cx="41" cy="48" r="3" fill="#121212"/>
        <circle cx="59" cy="48" r="3" fill="#121212"/>
        <path d="M50 62 L50 66" stroke="#121212" stroke-width="1.5"/>
        <path d="M46 66 C48 70, 52 70, 54 66" stroke="#121212" stroke-width="1.5" stroke-linecap="round" fill="none"/>
        <path d="M30 78 C42 85, 58 85, 70 78" stroke="#0086fc" stroke-width="5" stroke-linecap="round"/>
        <circle cx="50" cy="85" r="3" fill="#ff3e00" stroke="#121212" stroke-width="1.2"/>
      </svg>
    `,
    catDefault: `
      <svg viewBox="0 0 100 100" width="100%" height="100%">
        <circle cx="50" cy="50" r="48" fill="#fff9f0" stroke="#e5d5c3" stroke-width="2"/>
        <path d="M30 35 L22 18 L38 27 Z" fill="#ffcd6c" stroke="#121212" stroke-width="2"/>
        <path d="M70 35 L78 18 L62 27 Z" fill="#ffcd6c" stroke="#121212" stroke-width="2"/>
        <ellipse cx="50" cy="55" rx="30" ry="26" fill="#ffcd6c" stroke="#121212" stroke-width="2"/>
        <circle cx="42" cy="52" r="3" fill="#121212"/>
        <circle cx="58" cy="52" r="3" fill="#121212"/>
        <polygon points="48,58 52,58 50,61" fill="#ff58ae"/>
        <path d="M50 61 L50 64 C47 66, 44 65, 42 63 M50 64 C53 66, 56 65, 58 63" stroke="#121212" stroke-width="1.5" stroke-linecap="round" fill="none"/>
        <path d="M32 78 C42 84, 58 84, 68 78" stroke="#ff3e00" stroke-width="5" stroke-linecap="round"/>
        <circle cx="50" cy="84" r="3" fill="#ffffff" stroke="#121212" stroke-width="1.2"/>
      </svg>
    `,
    dogDefault: `
      <svg viewBox="0 0 100 100" width="100%" height="100%">
        <circle cx="50" cy="50" r="48" fill="#eef7ff" stroke="#e5d5c3" stroke-width="2"/>
        <path d="M26 38 C14 42, 12 58, 18 70 C22 75, 28 72, 28 62 Z" fill="#8d5b4c" stroke="#121212" stroke-width="2"/>
        <path d="M74 38 C86 42, 88 58, 82 70 C78 75, 72 72, 72 62 Z" fill="#8d5b4c" stroke="#121212" stroke-width="2"/>
        <ellipse cx="50" cy="54" rx="28" ry="26" fill="#ffffff" stroke="#121212" stroke-width="2"/>
        <ellipse cx="50" cy="62" rx="16" ry="12" fill="#f2f0ed" stroke="#121212" stroke-width="1.5"/>
        <ellipse cx="50" cy="58" rx="4.5" ry="3.5" fill="#121212"/>
        <circle cx="41" cy="48" r="3" fill="#121212"/>
        <circle cx="59" cy="48" r="3" fill="#121212"/>
        <path d="M30 78 C42 85, 58 85, 70 78" stroke="#00c978" stroke-width="5" stroke-linecap="round"/>
        <circle cx="50" cy="85" r="3" fill="#ffcd6c" stroke="#121212" stroke-width="1.2"/>
      </svg>
    `,
    rabbitDefault: `
      <svg viewBox="0 0 100 100" width="100%" height="100%">
        <circle cx="50" cy="50" r="48" fill="#fdf4f8" stroke="#e5d5c3" stroke-width="2"/>
        <ellipse cx="38" cy="24" rx="8" ry="20" fill="#ffffff" stroke="#121212" stroke-width="2"/>
        <ellipse cx="38" cy="24" rx="4" ry="14" fill="#ff58ae" opacity="0.5"/>
        <ellipse cx="62" cy="24" rx="8" ry="20" fill="#ffffff" stroke="#121212" stroke-width="2"/>
        <ellipse cx="62" cy="24" rx="4" ry="14" fill="#ff58ae" opacity="0.5"/>
        <ellipse cx="50" cy="60" rx="28" ry="24" fill="#ffffff" stroke="#121212" stroke-width="2"/>
        <circle cx="42" cy="56" r="3" fill="#121212"/>
        <circle cx="58" cy="56" r="3" fill="#121212"/>
        <polygon points="48,62 52,62 50,64" fill="#ff58ae"/>
        <path d="M46 66 C48 68, 52 68, 54 66" stroke="#121212" stroke-width="1.5" stroke-linecap="round" fill="none"/>
        <path d="M34 82 C44 86, 56 86, 66 82" stroke="#9f4fff" stroke-width="4" stroke-linecap="round"/>
      </svg>
    `,
    otherDefault: `
      <svg viewBox="0 0 100 100" width="100%" height="100%">
        <circle cx="50" cy="50" r="48" fill="#f6f4ef" stroke="#e5d5c3" stroke-width="2"/>
        <circle cx="32" cy="36" r="10" fill="#d48f00" stroke="#121212" stroke-width="2"/>
        <circle cx="68" cy="36" r="10" fill="#d48f00" stroke="#121212" stroke-width="2"/>
        <ellipse cx="50" cy="56" rx="28" ry="26" fill="#ffcd6c" stroke="#121212" stroke-width="2"/>
        <ellipse cx="50" cy="62" rx="14" ry="10" fill="#ffffff"/>
        <circle cx="42" cy="52" r="3" fill="#121212"/>
        <circle cx="58" cy="52" r="3" fill="#121212"/>
        <ellipse cx="50" cy="58" rx="3" ry="2" fill="#ff58ae"/>
        <path d="M46 63 C48 66, 52 66, 54 63" stroke="#121212" stroke-width="1.5" stroke-linecap="round" fill="none"/>
      </svg>
    `
  }
};

window.PetIllustrations = PetIllustrations;
