/**
 * THE TINU SHOW - Theatrical Cartoon Stage Engine
 * Automatically flows from scene to scene with smooth cartoon animations.
 */

document.addEventListener('DOMContentLoaded', () => {
  // Elements
  const introDrop = document.getElementById('intro-curtain-drop');
  const btnStartSound = document.getElementById('btn-start-show-sound');
  const btnStartMute = document.getElementById('btn-start-show-mute');
  const bgAudio = document.getElementById('bg-audio');
  const btnToggleSound = document.getElementById('btn-toggle-sound');
  const soundStatusText = document.getElementById('sound-status-text');

  const slides = document.querySelectorAll('.scene-slide');
  const pills = document.querySelectorAll('.pill-btn');
  const sceneCounter = document.getElementById('scene-counter');
  const progressFill = document.getElementById('progress-fill');
  const btnPrev = document.getElementById('btn-prev-scene');
  const btnNext = document.getElementById('btn-next-scene');
  const btnPlayPause = document.getElementById('btn-play-pause-show');
  const btnReplay = document.getElementById('btn-replay-show');
  const btnCopyEmail = document.getElementById('btn-copy-email');
  const emailDisplay = document.getElementById('email-display');

  // Director state
  const TOTAL_SCENES = slides.length;
  let currentScene = 1;
  let isShowPlaying = false;
  let isSoundActive = false;
  let sceneTimer = null;
  let progressInterval = null;
  const SCENE_DURATION_MS = 7500;
  let sceneStartTime = 0;
  let elapsedBeforePause = 0;

  // =========================================================================
  // 1. SCENE NAVIGATION & AUTO-DIRECTOR
  // =========================================================================
  function showScene(sceneNum) {
    if (sceneNum < 1) sceneNum = TOTAL_SCENES;
    if (sceneNum > TOTAL_SCENES) sceneNum = 1;
    currentScene = sceneNum;

    // Update slides
    slides.forEach(slide => {
      const num = parseInt(slide.getAttribute('data-scene'), 10);
      if (num === currentScene) {
        slide.classList.add('active');
      } else {
        slide.classList.remove('active');
      }
    });

    // Update pills
    pills.forEach(pill => {
      const target = parseInt(pill.getAttribute('data-target'), 10);
      if (target === currentScene) {
        pill.classList.add('active');
      } else {
        pill.classList.remove('active');
      }
    });

    // Update counter
    sceneCounter.textContent = `SCENE ${currentScene} OF ${TOTAL_SCENES}`;

    // Reset progress
    resetSceneTimer();
  }

  function startSceneTimer(remainingMs = SCENE_DURATION_MS) {
    clearTimeout(sceneTimer);
    clearInterval(progressInterval);

    if (!isShowPlaying) return;

    sceneStartTime = Date.now() - (SCENE_DURATION_MS - remainingMs);

    progressInterval = setInterval(() => {
      if (!isShowPlaying) return;
      const elapsed = Date.now() - sceneStartTime;
      const percent = Math.min(100, (elapsed / SCENE_DURATION_MS) * 100);
      progressFill.style.width = `${percent}%`;
    }, 50);

    sceneTimer = setTimeout(() => {
      progressFill.style.width = '100%';
      // Next scene
      showScene(currentScene + 1);
    }, remainingMs);
  }

  function resetSceneTimer() {
    clearTimeout(sceneTimer);
    clearInterval(progressInterval);
    progressFill.style.width = '0%';
    elapsedBeforePause = 0;

    if (isShowPlaying) {
      startSceneTimer(SCENE_DURATION_MS);
    }
  }

  function pauseShow() {
    if (!isShowPlaying) return;
    isShowPlaying = false;
    clearTimeout(sceneTimer);
    clearInterval(progressInterval);
    elapsedBeforePause = Date.now() - sceneStartTime;
    btnPlayPause.textContent = 'PLAY';
    btnPlayPause.classList.remove('btn-yellow');
    btnPlayPause.classList.add('btn-pink');
  }

  function resumeShow() {
    if (isShowPlaying) return;
    isShowPlaying = true;
    btnPlayPause.textContent = 'PAUSE';
    btnPlayPause.classList.add('btn-yellow');
    btnPlayPause.classList.remove('btn-pink');
    const remaining = Math.max(500, SCENE_DURATION_MS - elapsedBeforePause);
    startSceneTimer(remaining);
  }

  function toggleShowPlay() {
    if (isShowPlaying) {
      pauseShow();
    } else {
      resumeShow();
    }
  }

  // Next / Prev triggers
  btnNext.addEventListener('click', () => {
    showScene(currentScene + 1);
  });

  btnPrev.addEventListener('click', () => {
    showScene(currentScene - 1);
  });

  btnPlayPause.addEventListener('click', toggleShowPlay);

  if (btnReplay) {
    btnReplay.addEventListener('click', () => {
      showScene(1);
      resumeShow();
    });
  }

  // Pill navigation
  pills.forEach(pill => {
    pill.addEventListener('click', () => {
      const target = parseInt(pill.getAttribute('data-target'), 10);
      showScene(target);
    });
  });

  // =========================================================================
  // 2. AUDIO CONTROLS
  // =========================================================================
  function startMusic() {
    bgAudio.volume = 0.8;
    bgAudio.play().then(() => {
      isSoundActive = true;
      soundStatusText.textContent = 'MUSIC: ON';
      btnToggleSound.classList.add('btn-yellow');
      btnToggleSound.classList.remove('btn-pink');
    }).catch(err => {
      console.warn('Playback prevented by browser policy:', err);
      isSoundActive = false;
      soundStatusText.textContent = 'MUSIC: OFF';
    });
  }

  function pauseMusic() {
    bgAudio.pause();
    isSoundActive = false;
    soundStatusText.textContent = 'MUSIC: OFF';
    btnToggleSound.classList.remove('btn-yellow');
    btnToggleSound.classList.add('btn-pink');
  }

  function toggleSound() {
    if (isSoundActive) {
      pauseMusic();
    } else {
      startMusic();
    }
  }

  btnToggleSound.addEventListener('click', toggleSound);

  // =========================================================================
  // 3. START SHOW OVERLAY
  // =========================================================================
  function launchShow(withSound) {
    introDrop.classList.add('opened');
    isShowPlaying = true;
    btnPlayPause.textContent = 'PAUSE';

    if (withSound) {
      startMusic();
    } else {
      pauseMusic();
    }

    showScene(1);

    setTimeout(() => {
      introDrop.style.display = 'none';
    }, 1000);
  }

  btnStartSound.addEventListener('click', () => launchShow(true));
  btnStartMute.addEventListener('click', () => launchShow(false));

  // =========================================================================
  // 4. COPY EMAIL
  // =========================================================================
  if (btnCopyEmail && emailDisplay) {
    btnCopyEmail.addEventListener('click', async () => {
      const email = 'tinujungshi34@outlook.com';
      try {
        await navigator.clipboard.writeText(email);
      } catch (e) {
        const t = document.createElement('textarea');
        t.value = email;
        document.body.appendChild(t);
        t.select();
        document.execCommand('copy');
        document.body.removeChild(t);
      }

      const origText = emailDisplay.textContent;
      emailDisplay.textContent = 'COPIED TO CLIPBOARD!';
      emailDisplay.style.color = '#c1121f';

      setTimeout(() => {
        emailDisplay.textContent = origText;
        emailDisplay.style.color = '';
      }, 2500);
    });
  }

  // Keyboard navigation for fun
  window.addEventListener('keydown', (e) => {
    if (e.key === 'ArrowRight' || e.key === ' ') {
      e.preventDefault();
      showScene(currentScene + 1);
    } else if (e.key === 'ArrowLeft') {
      e.preventDefault();
      showScene(currentScene - 1);
    }
  });
});
