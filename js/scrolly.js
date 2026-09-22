/**
 * Scrollytelling Engine for MyPet Recovery Journey
 * Native scroll-scrubbed interactive sequence (Zero autoplay, zero scroll-jacking)
 */

(function () {
  'use strict';

  const Scrollytelling = {
    track: null,
    viewport: null,
    progressBar: null,
    stepTexts: [],
    cards: {},
    ticking: false,

    init() {
      this.track = document.getElementById('scrolly-journey');
      if (!this.track) return;

      this.viewport = this.track.querySelector('.scrolly-viewport');
      this.progressBar = document.getElementById('scrollyProgressFill');
      this.stepTexts = Array.from(this.track.querySelectorAll('.scrolly-step-text'));

      this.cards = {
        tag: document.getElementById('scrollyCardTag'),
        scan: document.getElementById('scrollyCardScan'),
        gps: document.getElementById('scrollyCardGps'),
        reunion: document.getElementById('scrollyCardReunion')
      };

      this.pup = document.getElementById('bentoFlankPup');
      this.contactCard = document.getElementById('bentoCardContact');
      this.cat = document.getElementById('bentoFlankCat');
      this.medicalCard = document.getElementById('bentoCardMedical');

      // Listen to scroll and resize with passive handlers and requestAnimationFrame debouncing
      window.addEventListener('scroll', () => this.requestTick(), { passive: true });
      window.addEventListener('resize', () => this.requestTick(), { passive: true });

      // Initial layout evaluation
      this.updateProgress();
      this.updateBenefitPup();
      this.updateMedicalCat();
      CinemaSection.init();
    },

    requestTick() {
      if (!this.ticking) {
        requestAnimationFrame(() => {
          this.updateProgress();
          this.updateBenefitPup();
          this.updateMedicalCat();
          CinemaSection.updateProgress();
          this.ticking = false;
        });
        this.ticking = true;
      }
    },

    updateProgress() {
      if (!this.track) return;

      const rect = this.track.getBoundingClientRect();
      const windowHeight = window.innerHeight || document.documentElement.clientHeight;
      const totalScrollDistance = rect.height - windowHeight;

      if (totalScrollDistance <= 0) return;

      // Calculate normalized progress from 0.0 to 1.0 through the track
      const scrolled = -rect.top;
      const progress = Math.max(0, Math.min(1, scrolled / totalScrollDistance));

      // Determine active narrative beat (4 beats total)
      // 0: 0.00 - 0.25 (01 · SMART TAG)
      // 1: 0.25 - 0.50 (02 · ZERO-FRICTION SCAN)
      // 2: 0.50 - 0.75 (03 · GPS RADAR PING)
      // 3: 0.75 - 1.00 (04 · SAFE REUNION)
      let activeIndex = Math.floor(progress * 4);
      if (activeIndex >= 4) activeIndex = 3;

      // Update progress bar width & dynamic step gradient
      if (this.progressBar) {
        this.progressBar.style.width = (progress * 100).toFixed(1) + '%';
        if (activeIndex === 0) {
          this.progressBar.style.background = 'linear-gradient(90deg, #38bdf8, #0069e0)';
        } else if (activeIndex === 1) {
          this.progressBar.style.background = 'linear-gradient(90deg, #34d399, #059669)';
        } else if (activeIndex === 2) {
          this.progressBar.style.background = 'linear-gradient(90deg, #c084fc, #7c3aed)';
        } else {
          this.progressBar.style.background = 'linear-gradient(90deg, #fb923c, #ea580c)';
        }
      }

      this.stepTexts.forEach((el, index) => {
        if (index === activeIndex) {
          el.classList.add('active');
        } else {
          el.classList.remove('active');
        }
      });

      // Scrub Dynamic Pastel Background Color Transition (Powder Blue -> Fresh Mint -> Soft Lavender -> Warm Peach)
      this.updateBackgroundTransition(progress);

      // Scrub Card Visual Stages
      this.scrubStages(progress);
    },

    /**
     * Dynamic 4-step pastel color transition across scroll progress (0.0 to 1.0)
     * Sky canvas (#ebf5ff) -> Soft Powder Blue (#d0e9ff) -> Fresh Mint (#cdf6de) -> Soft Lavender (#f1e6ff) -> Warm Peach (#ffeade) -> Sky canvas (#ebf5ff)
     */
    updateBackgroundTransition(p) {
      if (!this.viewport) return;

      const keyframes = [
        { p: 0.00, rgb: [235, 245, 255] }, // 0.00: Sky tint (#ebf5ff) - matches #benefits
        { p: 0.12, rgb: [208, 233, 255] }, // 0.12: Soft Powder Blue (#d0e9ff) - peak 01 · SMART TAG
        { p: 0.26, rgb: [216, 244, 246] }, // 0.26: Powder Blue to Mint crossfade
        { p: 0.38, rgb: [205, 246, 222] }, // 0.38: Fresh Mint (#cdf6de) - peak 02 · ZERO-FRICTION SCAN
        { p: 0.52, rgb: [228, 236, 248] }, // 0.52: Mint to Lavender crossfade
        { p: 0.65, rgb: [241, 230, 255] }, // 0.65: Soft Lavender (#f1e6ff) - peak 03 · GPS RADAR PING
        { p: 0.78, rgb: [250, 235, 246] }, // 0.78: Lavender to Warm Peach crossfade
        { p: 0.88, rgb: [255, 234, 222] }, // 0.88: Warm Peach (#ffeade) - peak 04 · SAFE REUNION
        { p: 1.00, rgb: [235, 245, 255] }  // 1.00: Sky tint (#ebf5ff) - matches #how-it-works seamlessly
      ];

      let activeColor = keyframes[0].rgb;
      for (let i = 0; i < keyframes.length - 1; i++) {
        const k1 = keyframes[i];
        const k2 = keyframes[i + 1];
        if (p >= k1.p && p <= k2.p) {
          const factor = (p - k1.p) / (k2.p - k1.p);
          activeColor = [
            Math.round(k1.rgb[0] + (k2.rgb[0] - k1.rgb[0]) * factor),
            Math.round(k1.rgb[1] + (k2.rgb[1] - k1.rgb[1]) * factor),
            Math.round(k1.rgb[2] + (k2.rgb[2] - k1.rgb[2]) * factor)
          ];
          break;
        }
      }

      const solidColor = `rgb(${activeColor[0]}, ${activeColor[1]}, ${activeColor[2]})`;
      this.viewport.style.background = solidColor;
      this.viewport.style.backgroundColor = solidColor;
    },

    /**
     * Scroll transition for the running puppy on the left side of Instant 1-tap contact
     */
    updateBenefitPup() {
      if (!this.pup || !this.contactCard) {
        this.pup = document.getElementById('bentoFlankPup');
        this.contactCard = document.getElementById('bentoCardContact');
        if (!this.pup || !this.contactCard) return;
      }

      const rect = this.contactCard.getBoundingClientRect();
      const windowHeight = window.innerHeight || document.documentElement.clientHeight;

      // Start transition when card enters the viewport (top of card at 95% of viewport height)
      // Fully completes leap when top of card reaches 45% of viewport height
      const startY = windowHeight * 0.95;
      const endY = windowHeight * 0.45;

      const rawProgress = (startY - rect.top) / (startY - endY);
      const progress = Math.max(0, Math.min(1, rawProgress));

      if (progress <= 0) {
        this.pup.style.opacity = '0';
        this.pup.style.transform = 'translate3d(-70px, 35px, 0) rotate(-14deg) scale(0.82)';
        this.pup.classList.remove('pup-active');
        return;
      }

      // Smooth ease-out cubic for realistic leaping physics
      const ease = 1 - Math.pow(1 - progress, 3);
      const tx = (-70 * (1 - ease)).toFixed(2);
      // Playful parabolic arc: pup rises higher during mid-leap
      const arc = Math.sin(progress * Math.PI) * 16;
      const ty = (35 * (1 - ease) - arc).toFixed(2);
      const rot = (-14 * (1 - ease)).toFixed(2);
      const scale = (0.82 + 0.18 * ease).toFixed(3);
      const opacity = Math.min(1, progress * 1.6).toFixed(2);

      if (progress >= 0.99) {
        // Once landed, subtle parallax tracking as user scrolls past the card
        const scrollPast = Math.max(0, (endY - rect.top) * 0.08);
        this.pup.style.opacity = '1';
        this.pup.style.transform = `translate3d(0px, ${-scrollPast.toFixed(1)}px, 0) rotate(0deg) scale(1)`;
        this.pup.classList.add('pup-active');
      } else {
        this.pup.style.opacity = opacity;
        this.pup.style.transform = `translate3d(${tx}px, ${ty}px, 0) rotate(${rot}deg) scale(${scale})`;
        this.pup.classList.remove('pup-active');
      }
    },

    /**
     * Scroll transition for the playful cat on the bottom right of Smart digital medical sheet
     */
    updateMedicalCat() {
      if (!this.cat || !this.medicalCard) {
        this.cat = document.getElementById('bentoFlankCat');
        this.medicalCard = document.getElementById('bentoCardMedical');
        if (!this.cat || !this.medicalCard) return;
      }

      const rect = this.medicalCard.getBoundingClientRect();
      const windowHeight = window.innerHeight || document.documentElement.clientHeight;

      // Start transition when card enters the viewport (top of card at 95% of viewport height)
      // Fully completes leap when top of card reaches 45% of viewport height
      const startY = windowHeight * 0.95;
      const endY = windowHeight * 0.45;

      const rawProgress = (startY - rect.top) / (startY - endY);
      const progress = Math.max(0, Math.min(1, rawProgress));

      if (progress <= 0) {
        this.cat.style.opacity = '0';
        this.cat.style.transform = 'translate3d(60px, 40px, 0) rotate(12deg) scale(0.82)';
        this.cat.classList.remove('cat-active');
        return;
      }

      // Smooth ease-out cubic for realistic pouncing physics
      const ease = 1 - Math.pow(1 - progress, 3);
      const tx = (60 * (1 - ease)).toFixed(2);
      // Playful parabolic arc: cat arches slightly higher during mid-pounce
      const arc = Math.sin(progress * Math.PI) * 16;
      const ty = (40 * (1 - ease) - arc).toFixed(2);
      const rot = (12 * (1 - ease)).toFixed(2);
      const scale = (0.82 + 0.18 * ease).toFixed(3);
      const opacity = Math.min(1, progress * 1.6).toFixed(2);

      if (progress >= 0.99) {
        // Once landed, subtle parallax tracking as user scrolls past the card
        const scrollPast = Math.max(0, (endY - rect.top) * 0.08);
        this.cat.style.opacity = '1';
        this.cat.style.transform = `translate3d(0px, ${-scrollPast.toFixed(1)}px, 0) rotate(0deg) scale(1)`;
        this.cat.classList.add('cat-active');
      } else {
        this.cat.style.opacity = opacity;
        this.cat.style.transform = `translate3d(${tx}px, ${ty}px, 0) rotate(${rot}deg) scale(${scale})`;
        this.cat.classList.remove('cat-active');
      }
    },

    /**
     * Compute individual sub-progress for a stage within [start, end]
     */
    subProgress(val, start, end) {
      if (val <= start) return 0;
      if (val >= end) return 1;
      return (val - start) / (end - start);
    },

    scrubStages(p) {
      // Stage 1: 0.00 - 0.28 (01 · SMART TAG)
      // Stage 2: 0.25 - 0.52 (02 · ZERO-FRICTION SCAN)
      // Stage 3: 0.50 - 0.77 (03 · GPS RADAR PING)
      // Stage 4: 0.75 - 1.00 (04 · SAFE REUNION)

      let o1 = 0, o2 = 0, o3 = 0, o4 = 0;
      let y1 = 0, y2 = 0, y3 = 0, y4 = 0;
      let s1 = 1, s2 = 1, s3 = 1, s4 = 1;

      // Card 1: Enters from 0 -> 0.08, stays visible until 0.22, fades/scales down 0.22 -> 0.28
      if (p < 0.22) {
        o1 = 1;
        y1 = (1 - Math.min(1, p / 0.08)) * 30;
        s1 = 0.95 + (Math.min(1, p / 0.1) * 0.05);
      } else if (p < 0.28) {
        const exitProg = (p - 0.22) / 0.06;
        o1 = 1 - exitProg;
        y1 = -exitProg * 30;
        s1 = 1 - (exitProg * 0.05);
      } else {
        o1 = 0;
      }

      // Card 2: Enters 0.24 -> 0.31, stays until 0.48, exits 0.48 -> 0.54
      if (p >= 0.24 && p < 0.31) {
        const enterProg = (p - 0.24) / 0.07;
        o2 = enterProg;
        y2 = (1 - enterProg) * 35;
        s2 = 0.94 + enterProg * 0.06;
      } else if (p >= 0.31 && p < 0.48) {
        o2 = 1;
        y2 = 0;
        s2 = 1;
      } else if (p >= 0.48 && p < 0.54) {
        const exitProg = (p - 0.48) / 0.06;
        o2 = 1 - exitProg;
        y2 = -exitProg * 35;
        s2 = 1 - exitProg * 0.05;
      } else {
        o2 = 0;
      }

      // Card 3: Enters 0.49 -> 0.56, stays until 0.73, exits 0.73 -> 0.79
      if (p >= 0.49 && p < 0.56) {
        const enterProg = (p - 0.49) / 0.07;
        o3 = enterProg;
        y3 = (1 - enterProg) * 35;
        s3 = 0.94 + enterProg * 0.06;
      } else if (p >= 0.56 && p < 0.73) {
        o3 = 1;
        y3 = 0;
        s3 = 1;
      } else if (p >= 0.73 && p < 0.79) {
        const exitProg = (p - 0.73) / 0.06;
        o3 = 1 - exitProg;
        y3 = -exitProg * 35;
        s3 = 1 - exitProg * 0.05;
      } else {
        o3 = 0;
      }

      // Card 4: Enters 0.74 -> 0.82, stays until 1.00
      if (p >= 0.74 && p < 0.82) {
        const enterProg = (p - 0.74) / 0.08;
        o4 = enterProg;
        y4 = (1 - enterProg) * 35;
        s4 = 0.94 + enterProg * 0.06;
      } else if (p >= 0.82) {
        o4 = 1;
        y4 = 0;
        s4 = 1;
      } else {
        o4 = 0;
      }

      // Apply transforms and opacities
      if (this.cards.tag) {
        this.cards.tag.style.opacity = o1.toFixed(3);
        this.cards.tag.style.transform = `translate3d(0, ${y1.toFixed(1)}px, 0) scale(${s1.toFixed(3)})`;
        this.cards.tag.style.pointerEvents = o1 > 0.6 ? 'auto' : 'none';
      }

      if (this.cards.scan) {
        this.cards.scan.style.opacity = o2.toFixed(3);
        this.cards.scan.style.transform = `translate3d(0, ${y2.toFixed(1)}px, 0) scale(${s2.toFixed(3)})`;
        this.cards.scan.style.pointerEvents = o2 > 0.6 ? 'auto' : 'none';

        const laser = this.cards.scan.querySelector('.scrolly-scan-laser');
        if (laser) {
          const scanProg = this.subProgress(p, 0.28, 0.44);
          laser.style.top = (scanProg * 88) + '%';
        }
      }

      if (this.cards.gps) {
        this.cards.gps.style.opacity = o3.toFixed(3);
        this.cards.gps.style.transform = `translate3d(0, ${y3.toFixed(1)}px, 0) scale(${s3.toFixed(3)})`;
        this.cards.gps.style.pointerEvents = o3 > 0.6 ? 'auto' : 'none';

        const radarWave1 = this.cards.gps.querySelector('.scrolly-radar-wave-1');
        const radarWave2 = this.cards.gps.querySelector('.scrolly-radar-wave-2');
        const gpsProg = this.subProgress(p, 0.52, 0.70);

        if (radarWave1) {
          const scale1 = 1 + (gpsProg * 1.8);
          const op1 = Math.max(0, 1 - gpsProg);
          radarWave1.style.transform = `scale(${scale1.toFixed(2)})`;
          radarWave1.style.opacity = op1.toFixed(2);
        }
        if (radarWave2) {
          const delayedProg = Math.max(0, gpsProg - 0.2) / 0.8;
          const scale2 = 1 + (delayedProg * 1.6);
          const op2 = Math.max(0, 1 - delayedProg);
          radarWave2.style.transform = `scale(${scale2.toFixed(2)})`;
          radarWave2.style.opacity = op2.toFixed(2);
        }
      }

      if (this.cards.reunion) {
        this.cards.reunion.style.opacity = o4.toFixed(3);
        this.cards.reunion.style.transform = `translate3d(0, ${y4.toFixed(1)}px, 0) scale(${s4.toFixed(3)})`;
        this.cards.reunion.style.pointerEvents = o4 > 0.6 ? 'auto' : 'none';
      }
    }
  };

  /**
   * CinemaSection — Apple-Style Cinematic Scrollytelling Product Reveal
   * 100% scroll-scrubbed, bidirectional, GPU-accelerated transforms
   */
  const CinemaSection = {
    track: null,
    viewport: null,
    heading: null,
    lineTop: null,
    lineBottom: null,
    eyebrowWrap: null,
    subtextWrap: null,
    visualStage: null,
    reunionShowcase: null,
    reunionFrames: [],
    reunionResolve: null,
    scrubBar: null,
    scrubIndicator: null,
    starsStage: null,

    init() {
      this.track = document.getElementById('cinema-experience');
      if (!this.track) return;

      this.viewport = document.getElementById('cinemaViewport');
      this.heading = document.getElementById('cinemaGiantHeading');
      this.lineTop = document.getElementById('cinemaLineTop');
      this.lineBottom = document.getElementById('cinemaLineBottom');
      this.visualStage = document.getElementById('cinemaVisualStage');
      this.reunionShowcase = document.getElementById('cinemaReunionShowcase');
      this.reunionFrames = [1, 2, 3, 4, 5].map(i => document.getElementById('cinemaFrame' + i)).filter(Boolean);
      this.reunionResolve = document.getElementById('cinemaReunionResolve');
      this.scrubBar = document.getElementById('cinemaScrubBar');
      this.scrubIndicator = document.getElementById('cinemaScrubIndicator');
      this.starsStage = document.getElementById('cinemaStarsStage');
      this.cloudBank = document.getElementById('cinemaCloudBank');
      this.cloudTL = document.getElementById('cinemaCloudTL');
      this.cloudTR = document.getElementById('cinemaCloudTR');
      this.cloudML = document.getElementById('cinemaCloudML');
      this.cloudMR = document.getElementById('cinemaCloudMR');
      this.cloudCenter = document.getElementById('cinemaCloudCenter');

      // Ensure viewport background remains clean sky-tint canvas
      if (this.viewport) {
        this.viewport.style.background = '';
        this.viewport.style.backgroundColor = '';
      }

      this.updateProgress();
    },

    updateProgress() {
      if (!this.track) return;

      const rect = this.track.getBoundingClientRect();
      const windowHeight = window.innerHeight || document.documentElement.clientHeight;
      const totalScrollDistance = rect.height - windowHeight;

      if (totalScrollDistance <= 0) return;

      // Calculate progress from 0.0 to 1.0 through the pinned track
      const scrolled = -rect.top;
      const progress = Math.max(0, Math.min(1, scrolled / totalScrollDistance));

      this.scrub(progress);
    },

    scrub(p) {
      // 1. Scrub progress indicator bar
      if (this.scrubBar) {
        this.scrubBar.style.width = (p * 100).toFixed(1) + '%';
      }
      if (this.scrubIndicator) {
        this.scrubIndicator.style.opacity = p > 0.94 ? Math.max(0, (1 - p) / 0.06).toFixed(2) : '1';
      }

      // 2. Giant Typography Progressive Scale & Aperture Zoom:
      // Starts at natural elegant scale (1.0 at p=0.0) -> expands to 1.85 (p=0.30) -> zooms past viewport to 6.5 (p=0.60)
      let textScale = 1.0;
      if (p <= 0.30) {
        const ease = p / 0.30;
        textScale = 1.0 + (ease * 0.85); // 1.0 -> 1.85
      } else if (p <= 0.60) {
        const ease = (p - 0.30) / 0.30;
        textScale = 1.85 + (Math.pow(ease, 1.4) * 4.65); // 1.85 -> 6.50
      } else {
        textScale = 6.50 + ((p - 0.60) * 3.0);
      }

      // Typography Opacity & Clean Dissolve:
      // Solid 1.0 from p=0.00 to 0.38, dissolves cleanly from 0.38 to 0.56 to clear stage for phone
      let textOpacity = 1.0;
      if (p > 0.38 && p <= 0.56) {
        textOpacity = Math.max(0, 1 - Math.pow((p - 0.38) / 0.18, 1.3));
      } else if (p > 0.56) {
        textOpacity = 0.0;
      }

      // Word / line level opposing horizontal parallax
      const shiftProgress = Math.min(1, p / 0.55);
      const topShiftX = -shiftProgress * 140; // Top line glides left
      const bottomShiftX = shiftProgress * 140; // Bottom line glides right

      if (this.heading) {
        this.heading.style.transform = `scale(${textScale.toFixed(3)})`;
        this.heading.style.opacity = textOpacity.toFixed(3);
        this.heading.style.pointerEvents = textOpacity > 0.1 ? 'auto' : 'none';
      }
      if (this.lineTop) {
        this.lineTop.style.transform = `translate3d(${topShiftX.toFixed(1)}px, 0, 0)`;
      }
      if (this.lineBottom) {
        this.lineBottom.style.transform = `translate3d(${bottomShiftX.toFixed(1)}px, 0, 0)`;
      }

      // 4. Reunion Sequence Reveal & 5-Frame Keyframe Scrubbing
      // Emerges smoothly from behind/through typography as it clears (p = 0.44 -> 0.94)
      if (this.visualStage && this.reunionFrames && this.reunionFrames.length === 5) {
        if (p < 0.42) {
          this.visualStage.style.opacity = '0';
          this.visualStage.style.pointerEvents = 'none';
        } else {
          const visualProg = Math.min(1, (p - 0.42) / 0.10); // fades in 0.42 -> 0.52
          const stageOpacity = visualProg;
          this.visualStage.style.opacity = stageOpacity.toFixed(3);

          if (stageOpacity > 0) {
            const seqP = Math.max(0, Math.min(1, (p - 0.46) / 0.46));

            if (this.reunionShowcase) {
              const zoomScale = (0.96 + (seqP * 0.08)).toFixed(3);
              this.reunionShowcase.style.transform = `scale(${zoomScale})`;
            }

            const frameVal = seqP * 4.0;
            const curIdx = Math.min(3, Math.floor(frameVal));
            const frac = frameVal - curIdx;

            let blend = 0;
            if (frac >= 0.75) {
              blend = 1;
            } else if (frac > 0.35) {
              const norm = (frac - 0.35) / 0.40;
              blend = 0.5 - 0.5 * Math.cos(norm * Math.PI);
            }

            for (let i = 0; i < 5; i++) {
              let op = 0;
              if (i === curIdx) {
                op = 1 - blend;
              } else if (i === curIdx + 1) {
                op = blend;
              }
              this.reunionFrames[i].style.opacity = op.toFixed(3);
            }

            // 5. Emotional Resolution Call-to-Action (Fades in & glides up as Frame 5 settles, stays visible with no fade-out)
            if (this.reunionResolve) {
              let resolveProg = 0;
              if (p >= 0.76) {
                resolveProg = Math.min(1, (p - 0.76) / 0.12); // smoothly reaches full visibility at p=0.88
              }
              const resolveEase = 1 - Math.pow(1 - resolveProg, 2.2);
              const resolveOpacity = resolveEase.toFixed(3);
              const resolveY = ((1 - resolveEase) * 22).toFixed(1);

              this.reunionResolve.style.opacity = resolveOpacity;
              this.reunionResolve.style.transform = `translate3d(0, ${resolveY}px, 0)`;

              const isClickable = resolveProg > 0.6;
              this.reunionResolve.style.pointerEvents = isClickable ? 'auto' : 'none';
              this.visualStage.style.pointerEvents = isClickable ? 'auto' : 'none';
            }
          }
        }
      }

      // 8. Modern Flat 2D Stars Stage reveal & dynamic shine hold
      // Stars emerge smoothly around the reunion frames and stay 100% visible through end of section
      if (this.starsStage) {
        let starsProg = 0;
        if (p >= 0.44) {
          starsProg = Math.min(1, (p - 0.44) / 0.24); // Smoothly reaches 1.0 around p=0.68
        }
        this.starsStage.style.opacity = starsProg.toFixed(3);
        const starsScale = (0.92 + starsProg * 0.08).toFixed(3);
        this.starsStage.style.transform = `scale(${starsScale})`;
      }

      // 9. Flat Modern 2D Cloud Transition Effect (Parting & Parallax Scrubbing)
      this.updateCloudTransition(p);
    },

    /**
     * Flat Modern 2D Cloud Transition Effect
     * Interactive scroll-scrubbed 2D cloud layers that drift into the blue sky,
     * part dramatically as the giant typography zooms out to reveal the smartphone,
     * and float serenely around the frame before smoothly dissolving into #safety.
     */
    updateCloudTransition(p) {
      // 1. Base Entry and Exit Envelope
      // p = 0.00 -> 0.16 (Fade in as sky turns blue)
      // p = 0.84 -> 1.00 (Fade out as sky returns to sky-tint)
      let stageAlpha = 0;
      if (p < 0.16) {
        stageAlpha = Math.max(0, p / 0.16);
      } else if (p <= 0.84) {
        stageAlpha = 1;
      } else {
        stageAlpha = Math.max(0, (1 - p) / 0.16);
      }

      // 2. Bottom Horizon Cloud Bank
      if (this.cloudBank) {
        let bankY = 60;
        let bankOpacity = 0;
        if (p < 0.18) {
          const inProg = p / 0.18;
          bankY = (1 - inProg) * 60;
          bankOpacity = inProg;
        } else if (p <= 0.84) {
          bankY = 0;
          bankOpacity = 1;
        } else {
          const outProg = (p - 0.84) / 0.16;
          bankY = outProg * 70;
          bankOpacity = Math.max(0, 1 - outProg);
        }
        this.cloudBank.style.opacity = (bankOpacity * stageAlpha).toFixed(3);
        this.cloudBank.style.transform = `translate3d(0, ${bankY.toFixed(1)}px, 0)`;
      }

      // 3. Center Cloud (The Dramatic Parting Breakthrough Wipe)
      // Floats in during typography (p: 0.18 -> 0.40)
      // Parts rapidly outward and scales past the camera (p: 0.40 -> 0.60)
      if (this.cloudCenter) {
        let centerOpacity = 0;
        let centerScale = 1;
        let centerX = 0;

        if (p >= 0.16 && p < 0.40) {
          const inProg = (p - 0.16) / 0.24;
          centerOpacity = inProg * 0.80;
          centerScale = 0.85 + (inProg * 0.15);
        } else if (p >= 0.40 && p <= 0.62) {
          const breakProg = (p - 0.40) / 0.22;
          const breakEase = 1 - Math.pow(1 - breakProg, 2.2);
          centerOpacity = Math.max(0, 0.80 * (1 - breakEase));
          centerScale = 1.0 + (breakEase * 1.0); // zooms up to 2.0x
          centerX = breakEase * 70; // glides across
        } else {
          centerOpacity = 0;
        }

        this.cloudCenter.style.opacity = centerOpacity.toFixed(3);
        this.cloudCenter.style.transform = `translate3d(calc(-50% + ${centerX.toFixed(1)}px), -50%, 0) scale(${centerScale.toFixed(3)})`;
      }

      // 4. Perimeter Floating Clouds (Parallax & Parting Wipe)
      // When the user scrolls from p = 0.36 to 0.62, the clouds part outward
      let partProgress = 0;
      if (p >= 0.36) {
        partProgress = Math.min(1, (p - 0.36) / 0.26);
      }
      const partEase = 1 - Math.pow(1 - partProgress, 2);

      // Top Left Cloud (Parts up & left)
      if (this.cloudTL) {
        const tlX = -partEase * 80;
        const tlY = -partEase * 40;
        const tlScale = 1.0 - (partEase * 0.08);
        this.cloudTL.style.opacity = stageAlpha.toFixed(3);
        this.cloudTL.style.transform = `translate3d(${tlX.toFixed(1)}px, ${tlY.toFixed(1)}px, 0) scale(${tlScale.toFixed(3)})`;
      }

      // Top Right Cloud (Parts up & right)
      if (this.cloudTR) {
        const trX = partEase * 75;
        const trY = -partEase * 35;
        const trScale = 1.0 - (partEase * 0.08);
        this.cloudTR.style.opacity = stageAlpha.toFixed(3);
        this.cloudTR.style.transform = `translate3d(${trX.toFixed(1)}px, ${trY.toFixed(1)}px, 0) scale(${trScale.toFixed(3)})`;
      }

      // Mid Left Cloud (Parts further left)
      if (this.cloudML) {
        const mlX = -partEase * 95;
        const mlY = partEase * 20;
        this.cloudML.style.opacity = stageAlpha.toFixed(3);
        this.cloudML.style.transform = `translate3d(${mlX.toFixed(1)}px, ${mlY.toFixed(1)}px, 0)`;
      }

      // Mid Right Cloud (Parts further right)
      if (this.cloudMR) {
        const mrX = partEase * 95;
        const mrY = partEase * 18;
        this.cloudMR.style.opacity = stageAlpha.toFixed(3);
        this.cloudMR.style.transform = `translate3d(${mrX.toFixed(1)}px, ${mrY.toFixed(1)}px, 0)`;
      }
    }
  };

  // Attach to window and initialize when DOM is ready
  window.Scrollytelling = Scrollytelling;
  window.CinemaSection = CinemaSection;

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
      Scrollytelling.init();
      CinemaSection.init();
    });
  } else {
    Scrollytelling.init();
    CinemaSection.init();
  }
})();
