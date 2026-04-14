(function(){
  const params = new URLSearchParams(window.location.search);
  const mode = params.get('mode');
  if (!mode) return; // no param = normal deck, do nothing

  const CHANNEL_NAME = 'care-for-the-culture-presenter';

  // ========== AUDIENCE MODE ==========
  if (mode === 'audience') {
    const ch = new BroadcastChannel(CHANNEL_NAME);
    ch.postMessage({ type: 'ready' });

    ch.onmessage = (e) => {
      if (e.data.type === 'goto' && typeof window.navigate === 'function') {
        // Use the existing show() function directly
        const slides = document.querySelectorAll('.slide');
        const target = e.data.slide;
        if (target >= 0 && target < slides.length) {
          // Reset all legal states before jumping
          document.querySelectorAll('.legal-slide').forEach(s => s.classList.remove('legal-active'));
          document.querySelectorAll('.legal-sub').forEach(s => s.classList.remove('visible'));
          // Find and call show()
          const current = Array.from(slides).findIndex(s => s.classList.contains('active'));
          slides[current]?.classList.remove('active');
          slides[target]?.classList.add('active');
          // Update counter and progress
          const counter = document.getElementById('counter');
          const progress = document.getElementById('progress');
          if (counter) counter.textContent = (target+1) + ' / ' + slides.length;
          if (progress) progress.style.width = ((target+1)/slides.length*100) + '%';
          // Restart GIFs
          slides[target]?.querySelectorAll('img[src$=".gif"]').forEach(img => {
            const src = img.src; img.src = ''; img.src = src;
          });
        }
      }
      if (e.data.type === 'ping') {
        const slides = document.querySelectorAll('.slide');
        const current = Array.from(slides).findIndex(s => s.classList.contains('active'));
        ch.postMessage({ type: 'pong', slide: current });
      }
    };
    // Hide nav buttons in audience mode
    const nav = document.querySelector('.nav');
    if (nav) nav.style.display = 'none';
    // Disable keyboard nav in audience mode
    document.addEventListener('keydown', e => { e.stopImmediatePropagation(); }, true);
    return;
  }

  // ========== PRESENTER MODE ==========
  if (mode === 'presenter') {
    // Dynamically import notes
    let speakerNotes = {};
    let generalNotes = {};

    // Load notes via fetch since we can't use ES modules inline
    fetch('speaker-notes.js')
      .then(r => r.text())
      .then(text => {
        // Parse the exported objects
        const notesMatch = text.match(/export const speakerNotes = (\{[\s\S]*?\n\});/);
        const generalMatch = text.match(/export const generalNotes = (\{[\s\S]*?\n\});/);
        if (notesMatch) speakerNotes = eval('(' + notesMatch[1] + ')');
        if (generalMatch) generalNotes = eval('(' + generalMatch[1] + ')');
        initPresenter();
      });

    function initPresenter() {
      const totalSlides = document.querySelectorAll('.slide').length;
      let currentSlide = 0;
      let timerStart = Date.now();
      let connected = false;

      // Replace body with presenter layout
      document.head.insertAdjacentHTML('beforeend', '<link rel="stylesheet" href="presenter.css">');
      const baseUrl = window.location.pathname;

      document.body.innerHTML = `
        <div class="presenter-wrap">
          <div class="presenter-left">
            <div class="presenter-slide-frame">
              <iframe id="pres-current" src="${baseUrl}?mode=audience"></iframe>
            </div>
            <div class="presenter-next">
              <span class="presenter-next-label">NEXT</span>
              <iframe id="pres-next" src="${baseUrl}?mode=audience"></iframe>
            </div>
            <div class="presenter-meta">
              <span class="presenter-counter" id="pres-counter">Slide 1 of ${totalSlides}</span>
              <span class="presenter-timer" id="pres-timer">00:00</span>
            </div>
          </div>
          <div class="presenter-right">
            <div class="presenter-sync">
              <div class="presenter-sync-dot disconnected" id="sync-dot"></div>
              <span class="presenter-sync-text" id="sync-text">Waiting for audience</span>
            </div>
            <div class="presenter-opener" id="pres-opener"></div>
            <div class="presenter-gloss" id="pres-gloss" style="display:none"></div>
            <div class="presenter-notes" id="pres-notes"></div>
          </div>
        </div>
        <div class="presenter-general" id="general-panel">
          <button class="presenter-general-close" onclick="document.getElementById('general-panel').classList.remove('visible')">&times;</button>
          <div id="general-content"></div>
        </div>
        <div class="presenter-footer">
          <button onclick="presNav(-1)">&larr; Previous</button>
          <span class="presenter-footer-hint">&larr; &rarr; arrows to navigate &bull; space for next &bull; esc to reset timer &bull; g for general notes</span>
          <button onclick="presNav(1)">Next &rarr;</button>
        </div>
      `;

      // Populate general notes
      const genEl = document.getElementById('general-content');
      if (genEl && generalNotes) {
        let html = '';
        for (const [key, val] of Object.entries(generalNotes)) {
          html += '<h3>' + key.replace(/_/g, ' ') + '</h3>';
          html += '<p>' + renderMarkdown(val) + '</p>';
        }
        genEl.innerHTML = html;
      }

      // BroadcastChannel
      const ch = new BroadcastChannel(CHANNEL_NAME);
      const syncDot = document.getElementById('sync-dot');
      const syncText = document.getElementById('sync-text');

      ch.onmessage = (e) => {
        if (e.data.type === 'pong' || e.data.type === 'ready') {
          connected = true;
          syncDot.className = 'presenter-sync-dot connected';
          syncText.textContent = 'Audience connected';
          // Sync audience to current slide
          ch.postMessage({ type: 'goto', slide: currentSlide });
        }
      };

      // Ping loop
      setInterval(() => {
        ch.postMessage({ type: 'ping' });
        setTimeout(() => {
          // If no pong received in 3s, mark disconnected
          // (connected flag gets set to true on pong, we reset it here)
        }, 3000);
      }, 2000);

      // Better connection detection
      let lastPong = 0;
      const origOnMessage = ch.onmessage;
      ch.onmessage = (e) => {
        if (e.data.type === 'pong' || e.data.type === 'ready') lastPong = Date.now();
        origOnMessage(e);
      };
      setInterval(() => {
        if (Date.now() - lastPong > 5000) {
          syncDot.className = 'presenter-sync-dot disconnected';
          syncText.textContent = 'Audience disconnected';
        }
      }, 2000);

      // Timer
      setInterval(() => {
        const elapsed = Math.floor((Date.now() - timerStart) / 1000);
        const min = String(Math.floor(elapsed / 60)).padStart(2, '0');
        const sec = String(elapsed % 60).padStart(2, '0');
        document.getElementById('pres-timer').textContent = min + ':' + sec;
      }, 1000);

      // Navigation
      function goToSlide(n) {
        if (n < 0) n = 0;
        if (n >= totalSlides) n = totalSlides - 1;
        currentSlide = n;
        updatePresenterView();
        ch.postMessage({ type: 'goto', slide: n });
      }

      window.presNav = function(dir) { goToSlide(currentSlide + dir); };

      function updatePresenterView() {
        // Update counter
        document.getElementById('pres-counter').textContent = 'Slide ' + (currentSlide+1) + ' of ' + totalSlides;

        // Update current slide iframe
        const currentFrame = document.getElementById('pres-current');
        currentFrame.contentWindow?.postMessage({ type: 'presenter-goto', slide: currentSlide }, '*');

        // Update next slide iframe
        const nextFrame = document.getElementById('pres-next');
        const nextSlide = Math.min(currentSlide + 1, totalSlides - 1);
        nextFrame.contentWindow?.postMessage({ type: 'presenter-goto', slide: nextSlide }, '*');

        // Update notes
        const notes = speakerNotes[currentSlide] || { opener: '', notes: '', gloss: '' };
        document.getElementById('pres-opener').innerHTML = '"' + (notes.opener || '') + '"';

        const glossEl = document.getElementById('pres-gloss');
        if (notes.gloss) {
          glossEl.style.display = 'block';
          glossEl.innerHTML = '<p>' + renderMarkdown(notes.gloss) + '</p>';
        } else {
          glossEl.style.display = 'none';
        }

        document.getElementById('pres-notes').innerHTML = renderMarkdown(notes.notes || '');
      }

      // Handle iframe-internal navigation via postMessage
      window.addEventListener('message', (e) => {
        if (e.data.type === 'presenter-goto') {
          // Forward to the iframe's audience mode
        }
      });

      // After iframes load, push them to the right slide
      document.getElementById('pres-current').addEventListener('load', function() {
        setTimeout(() => {
          const ch2 = new BroadcastChannel(CHANNEL_NAME);
          ch2.postMessage({ type: 'goto', slide: currentSlide });
          ch2.close();
        }, 500);
      });

      // Keyboard
      document.addEventListener('keydown', (e) => {
        if (e.key === 'ArrowRight' || e.key === ' ') { e.preventDefault(); goToSlide(currentSlide + 1); }
        else if (e.key === 'ArrowLeft') { e.preventDefault(); goToSlide(currentSlide - 1); }
        else if (e.key === 'Home') { e.preventDefault(); goToSlide(0); }
        else if (e.key === 'End') { e.preventDefault(); goToSlide(totalSlides - 1); }
        else if (e.key === 'Escape') { e.preventDefault(); timerStart = Date.now(); }
        else if (e.key === 'g') {
          e.preventDefault();
          document.getElementById('general-panel').classList.toggle('visible');
        }
      });

      // Initial render
      updatePresenterView();
    }

    function renderMarkdown(text) {
      if (!text) return '';
      return text
        .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
        .replace(/^- (.+)$/gm, '<li>$1</li>')
        .replace(/(<li>.*<\/li>)/s, '<ul>$1</ul>')
        .replace(/\n/g, '<br>');
    }
  }
})();
