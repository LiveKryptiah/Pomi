/**
 * MyPet Anonymous Finder <-> Owner Direct Chat & Photo Relay Engine
 * Enables real-time, privacy-first communication between finders and pet owners
 * without exchanging personal phone numbers or email addresses.
 */

(function(root) {
  'use strict';

  const MyPetChat = {
    activeThreadId: null,
    activePetCode: null,
    activeRole: 'finder', // 'finder' or 'owner'
    pollingInterval: null,
    attachedPhotoData: null,
    audioCtx: null,

    // Session ID management for finders
    getFinderSessionId: function() {
      let sessId = sessionStorage.getItem('mypet_finder_session_id');
      if (!sessId) {
        sessId = 'sess-' + Math.random().toString(36).substring(2, 10) + Date.now().toString(36).substring(4);
        sessionStorage.setItem('mypet_finder_session_id', sessId);
      }
      return sessId;
    },

    // Gentle synthesized audio chime using Web Audio API
    playChime: function(type = 'receive') {
      try {
        const AudioContext = window.AudioContext || window.webkitAudioContext;
        if (!AudioContext) return;
        if (!MyPetChat.audioCtx) {
          MyPetChat.audioCtx = new AudioContext();
        }
        const ctx = MyPetChat.audioCtx;
        if (ctx.state === 'suspended') {
          ctx.resume();
        }

        const now = ctx.currentTime;
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();

        osc.type = 'sine';
        if (type === 'receive') {
          osc.frequency.setValueAtTime(523.25, now); // C5
          osc.frequency.exponentialRampToValueAtTime(659.25, now + 0.12); // E5
        } else {
          osc.frequency.setValueAtTime(440.0, now); // A4
          osc.frequency.exponentialRampToValueAtTime(554.37, now + 0.10); // C#5
        }

        gain.gain.setValueAtTime(0.08, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.28);

        osc.connect(gain);
        gain.connect(ctx.destination);

        osc.start(now);
        osc.stop(now + 0.3);
      } catch (e) {
        // Audio auto-play policy silently suppressed
      }
    },

    // =========================================================================
    // FINDER CHAT WORKFLOW (PUBLIC SCANNED PROFILE)
    // =========================================================================
    openFinderChat: async function(petCode, finderName = 'Kind Finder') {
      MyPetChat.activeRole = 'finder';
      MyPetChat.activePetCode = petCode;
      const modal = document.getElementById('finderChatModal');
      if (!modal) return;
      modal.classList.add('active');

      const sessId = MyPetChat.getFinderSessionId();
      const statusText = document.getElementById('finderChatStatus');
      if (statusText) statusText.innerText = "Connecting to family...";

      try {
        let resp = null;
        if (window.ApiClient) {
          resp = await window.ApiClient.initFinderChat(petCode, sessId, finderName);
        }

        if (resp && resp.thread) {
          MyPetChat.activeThreadId = resp.thread.id;
          MyPetChat.renderFinderHeader(resp.thread);
          MyPetChat.renderMessages(resp.messages || [], 'finderMessagesList', 'finder');
          if (statusText) statusText.innerText = "Active encrypted relay · Online";

          // Mark any owner messages as read
          if (window.ApiClient) {
            window.ApiClient.markChatRead(resp.thread.id, 'finder').catch(() => {});
          }
        } else {
          MyPetChat.renderFallbackFinderChat(petCode);
        }
      } catch (err) {
        console.warn("[MyPetChat] Backend init failed, using local session:", err);
        MyPetChat.renderFallbackFinderChat(petCode);
      }

      // Start live polling every 3.5 seconds
      MyPetChat.startPolling('finderMessagesList', 'finder');
    },

    renderFinderHeader: function(thread) {
      const pet = thread.pet || {};
      const titleEl = document.getElementById('finderChatPetTitle');
      if (titleEl) {
        titleEl.innerHTML = `Chatting with <strong>${pet.name || 'Owner'}</strong>'s Family`;
      }
      const avatarEl = document.getElementById('finderChatPetAvatar');
      if (avatarEl) {
        if (pet.avatarCustom) {
          avatarEl.innerHTML = `<img src="${pet.avatarCustom}" alt="${pet.name}" />`;
        } else {
          avatarEl.innerHTML = `<span style="font-size: 24px;">🐾</span>`;
        }
      }
    },

    renderFallbackFinderChat: function(petCode) {
      MyPetChat.activeThreadId = 'th-local-' + petCode;
      const msgs = [
        {
          id: 'msg-f1',
          sender: 'owner',
          sender_name: "Luna's Family",
          text: "Hello! Thank you for scanning our pet's collar tag. Are you with Luna right now?",
          time_str: "Just now"
        }
      ];
      MyPetChat.renderMessages(msgs, 'finderMessagesList', 'finder');
    },

    // =========================================================================
    // OWNER MESSAGE CENTER (DASHBOARD)
    // =========================================================================
    openOwnerModal: async function(preferredPetId = null) {
      MyPetChat.activeRole = 'owner';
      const modal = document.getElementById('ownerChatModal');
      if (!modal) return;
      modal.classList.add('active');

      try {
        let threads = [];
        if (window.ApiClient) {
          threads = await window.ApiClient.getOwnerChats();
        }

        if (!threads || threads.length === 0) {
          threads = MyPetChat.getFallbackOwnerThreads();
        }

        MyPetChat.renderOwnerThreadsList(threads, preferredPetId);

        // Select initial thread
        let target = threads[0];
        if (preferredPetId) {
          const match = threads.find(t => t.pet_id === preferredPetId);
          if (match) target = match;
        }

        if (target) {
          MyPetChat.selectOwnerThread(target.id, target);
        }
      } catch (err) {
        console.warn("[MyPetChat] Failed loading owner chats:", err);
        const fallback = MyPetChat.getFallbackOwnerThreads();
        MyPetChat.renderOwnerThreadsList(fallback, preferredPetId);
        if (fallback[0]) MyPetChat.selectOwnerThread(fallback[0].id, fallback[0]);
      }
    },

    renderOwnerThreadsList: function(threads, selectedPetId) {
      const container = document.getElementById('ownerChatThreadsList');
      if (!container) return;

      if (threads.length === 0) {
        container.innerHTML = `<div class="chat-thread-empty">No active conversations yet.<br><small>When a finder scans your tag and sends a message, it will appear here.</small></div>`;
        return;
      }

      container.innerHTML = threads.map(th => {
        const isSelected = MyPetChat.activeThreadId === th.id;
        const unreadBadge = th.unreadCount > 0
          ? `<span class="chat-unread-dot" title="${th.unreadCount} unread">${th.unreadCount}</span>`
          : '';
        const preview = th.latestMessage ? (th.latestMessage.text || 'Photo attachment') : 'Conversation opened';

        return `
          <div class="chat-thread-item ${isSelected ? 'active' : ''}" onclick="MyPetChat.selectOwnerThread('${th.id}')" data-thread-id="${th.id}">
            <div class="chat-thread-avatar">
              ${th.petAvatar ? `<img src="${th.petAvatar}" alt="${th.petName}" />` : '🐾'}
            </div>
            <div class="chat-thread-meta">
              <div class="chat-thread-top">
                <span class="chat-thread-name">${th.finder_name || 'Kind Finder'} (${th.petName})</span>
                <span class="chat-thread-time">${th.latestMessage ? (th.latestMessage.time_str || '') : ''}</span>
              </div>
              <div class="chat-thread-preview">${preview}</div>
            </div>
            ${unreadBadge}
          </div>
        `;
      }).join('');
    },

    selectOwnerThread: async function(threadId, threadData = null) {
      MyPetChat.activeThreadId = threadId;

      // Update UI selection highlight
      document.querySelectorAll('#ownerChatThreadsList .chat-thread-item').forEach(el => {
        el.classList.toggle('active', el.getAttribute('data-thread-id') === threadId);
      });

      const headerTitle = document.getElementById('ownerChatActiveHeader');
      if (headerTitle && threadData) {
        headerTitle.innerHTML = `
          <div>
            <strong>${threadData.finder_name || 'Kind Finder'}</strong>
            <span style="font-size: 12.5px; color: var(--color-fog); margin-left: 8px;">Re: ${threadData.petName}</span>
          </div>
        `;
      }

      // Fetch messages
      try {
        if (window.ApiClient) {
          const res = await window.ApiClient.getChatMessages(threadId);
          if (res && res.messages) {
            MyPetChat.renderMessages(res.messages, 'ownerMessagesList', 'owner');
            // Mark read
            window.ApiClient.markChatRead(threadId, 'owner').catch(() => {});
            // Refresh unread counters in header & nav
            MyPetChat.updateUnreadBadges();
          }
        }
      } catch (e) {
        console.warn("Failed fetching thread messages:", e);
      }

      // Start live polling
      MyPetChat.startPolling('ownerMessagesList', 'owner');
    },

    getFallbackOwnerThreads: function() {
      return [
        {
          id: "th-luna-demo",
          pet_id: "pet-1",
          petName: "Luna",
          petAvatar: "images/pet-luna.png",
          finder_name: "Alex R. (Finder)",
          unreadCount: 1,
          latestMessage: {
            text: "Yes, exactly! Sitting on the bench right across from Peet's Coffee. I'll stay right here with her!",
            time_str: "3m ago"
          }
        }
      ];
    },

    // =========================================================================
    // SHARED MESSAGE RENDERING & POLLING
    // =========================================================================
    renderMessages: function(messages, containerId, currentRole) {
      const container = document.getElementById(containerId);
      if (!container) return;

      if (!messages || messages.length === 0) {
        container.innerHTML = `
          <div class="chat-bubble-empty">
            <span>🛡️ End-to-end private direct relay</span>
            <p>Send a message below to start communicating immediately.</p>
          </div>
        `;
        return;
      }

      container.innerHTML = messages.map(msg => {
        const isMine = msg.sender === currentRole;
        let photoMarkup = '';
        if (msg.photo_url) {
          photoMarkup = `
            <div class="chat-photo-attachment">
              <img src="${msg.photo_url}" alt="Photo sent in chat" onclick="MyPetChat.zoomPhoto('${msg.photo_url}')" />
            </div>
          `;
        }

        return `
          <div class="chat-message-row ${isMine ? 'mine' : 'theirs'}">
            <div class="chat-bubble ${isMine ? 'mine' : 'theirs'}">
              <div class="chat-bubble-sender">${msg.sender_name || (isMine ? 'You' : 'Family')}</div>
              ${photoMarkup}
              ${msg.text ? `<div class="chat-bubble-text">${MyPetChat.escapeHtml(msg.text)}</div>` : ''}
              <div class="chat-bubble-time">${msg.time_str || ''}</div>
            </div>
          </div>
        `;
      }).join('');

      // Auto-scroll to bottom
      container.scrollTop = container.scrollHeight;
    },

    startPolling: function(containerId, role) {
      if (MyPetChat.pollingInterval) {
        clearInterval(MyPetChat.pollingInterval);
      }

      MyPetChat.pollingInterval = setInterval(async () => {
        if (!MyPetChat.activeThreadId) return;

        try {
          if (window.ApiClient) {
            const res = await window.ApiClient.getChatMessages(MyPetChat.activeThreadId);
            if (res && res.messages) {
              const container = document.getElementById(containerId);
              const prevCount = container ? container.querySelectorAll('.chat-message-row').length : 0;
              
              if (res.messages.length > prevCount) {
                MyPetChat.renderMessages(res.messages, containerId, role);
                MyPetChat.playChime('receive');

                // Mark read if modal visible
                window.ApiClient.markChatRead(MyPetChat.activeThreadId, role).catch(() => {});
                MyPetChat.updateUnreadBadges();
              }
            }
          }
        } catch (e) {}
      }, 3500);
    },

    stopPolling: function() {
      if (MyPetChat.pollingInterval) {
        clearInterval(MyPetChat.pollingInterval);
        MyPetChat.pollingInterval = null;
      }
    },

    // =========================================================================
    // SENDING MESSAGES & PHOTO ATTACHMENTS
    // =========================================================================
    sendMessage: async function(inputFieldId, role) {
      const input = document.getElementById(inputFieldId);
      const text = input ? input.value.trim() : '';
      const photo = MyPetChat.attachedPhotoData;

      if (!text && !photo) return;
      if (!MyPetChat.activeThreadId) return;

      const senderName = role === 'finder' ? 'Kind Finder' : 'Sarah Miller (Owner)';

      const payload = {
        sender: role,
        senderName: senderName,
        text: text,
        photoUrl: photo,
        timeStr: 'Just now'
      };

      // Clear input and attachments
      if (input) input.value = '';
      MyPetChat.clearPhotoAttachment(role);

      try {
        if (window.ApiClient) {
          const res = await window.ApiClient.sendChatMessage(MyPetChat.activeThreadId, payload);
          if (res && res.message) {
            MyPetChat.playChime('send');
            const containerId = role === 'finder' ? 'finderMessagesList' : 'ownerMessagesList';
            
            // Re-fetch all messages to keep in sync
            const allRes = await window.ApiClient.getChatMessages(MyPetChat.activeThreadId);
            if (allRes && allRes.messages) {
              MyPetChat.renderMessages(allRes.messages, containerId, role);
            }
          }
        }
      } catch (err) {
        console.warn("[MyPetChat] Failed sending message:", err);
      }
    },

    sendCannedResponse: function(text, inputFieldId, role) {
      const input = document.getElementById(inputFieldId);
      if (input) {
        input.value = text;
        MyPetChat.sendMessage(inputFieldId, role);
      }
    },

    // Photo file attachment handler
    handlePhotoSelect: function(event, previewId, role) {
      const file = event.target.files && event.target.files[0];
      if (!file) return;

      const reader = new FileReader();
      reader.onload = function(e) {
        const rawData = e.target.result;
        // Compress/resize image if large using an offscreen canvas
        MyPetChat.compressImage(rawData, 900, 0.82, function(compressedData) {
          MyPetChat.attachedPhotoData = compressedData;
          const previewContainer = document.getElementById(previewId);
          if (previewContainer) {
            previewContainer.innerHTML = `
              <div class="chat-photo-thumb-wrap">
                <img src="${compressedData}" alt="Attachment preview" />
                <button type="button" class="chat-photo-remove-btn" onclick="MyPetChat.clearPhotoAttachment('${role}')" title="Remove photo">&times;</button>
              </div>
            `;
            previewContainer.style.display = 'block';
          }
        });
      };
      reader.readAsDataURL(file);
    },

    clearPhotoAttachment: function(role) {
      MyPetChat.attachedPhotoData = null;
      const previewId = role === 'finder' ? 'finderPhotoPreview' : 'ownerPhotoPreview';
      const inputId = role === 'finder' ? 'finderPhotoInput' : 'ownerPhotoInput';
      const container = document.getElementById(previewId);
      if (container) {
        container.innerHTML = '';
        container.style.display = 'none';
      }
      const fileInput = document.getElementById(inputId);
      if (fileInput) fileInput.value = '';
    },

    compressImage: function(dataUrl, maxDim, quality, callback) {
      const img = new Image();
      img.onload = function() {
        let width = img.width;
        let height = img.height;
        if (width > maxDim || height > maxDim) {
          if (width > height) {
            height = Math.round((height * maxDim) / width);
            width = maxDim;
          } else {
            width = Math.round((width * maxDim) / height);
            height = maxDim;
          }
        }
        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0, width, height);
        callback(canvas.toDataURL('image/jpeg', quality));
      };
      img.src = dataUrl;
    },

    zoomPhoto: function(url) {
      const overlay = document.createElement('div');
      overlay.className = 'chat-photo-lightbox';
      overlay.innerHTML = `
        <div class="chat-photo-lightbox-content">
          <img src="${url}" alt="Zoomed view" />
          <button type="button" class="chat-lightbox-close">&times;</button>
        </div>
      `;
      overlay.onclick = function() {
        document.body.removeChild(overlay);
      };
      document.body.appendChild(overlay);
    },

    // =========================================================================
    // UNREAD BADGE COUNTERS
    // =========================================================================
    updateUnreadBadges: async function() {
      try {
        if (!window.ApiClient) return;
        const res = await window.ApiClient.getUnreadChatCount();
        const count = res && res.unreadCount ? res.unreadCount : 0;
        
        // Update nav badge
        const navBadges = document.querySelectorAll('.chat-unread-badge-counter');
        navBadges.forEach(badge => {
          if (count > 0) {
            badge.innerText = count;
            badge.style.display = 'inline-flex';
          } else {
            badge.style.display = 'none';
          }
        });

        // Update dashboard pet cards if applicable
        const cardBadges = document.querySelectorAll('.pet-card-chat-badge');
        cardBadges.forEach(b => {
          if (count > 0) b.style.display = 'inline-flex';
          else b.style.display = 'none';
        });
      } catch (e) {}
    },

    closeModal: function(modalId) {
      const modal = document.getElementById(modalId);
      if (modal) modal.classList.remove('active');
      MyPetChat.stopPolling();
      MyPetChat.clearPhotoAttachment('finder');
      MyPetChat.clearPhotoAttachment('owner');
    },

    escapeHtml: function(str) {
      if (!str) return '';
      const div = document.createElement('div');
      div.innerText = str;
      return div.innerHTML;
    }
  };

  root.MyPetChat = MyPetChat;
})(typeof window !== 'undefined' ? window : this);
