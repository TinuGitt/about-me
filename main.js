/**
 * THE BIG TINU SHOWCASE '84
 * Progressive Flowstate 80s Game Show Director Engine
 */

document.addEventListener('DOMContentLoaded', () => {
  // Elements
  const onAirOverlay = document.getElementById('on-air-overlay');
  const btnStartMusic = document.getElementById('btn-start-show-music');
  const btnStartSilent = document.getElementById('btn-start-show-silent');
  const bgAudio = document.getElementById('bg-audio');
  const btnSoundToggle = document.getElementById('btn-sound-toggle');

  const slides = document.querySelectorAll('.game-round-slide');
  const pills = document.querySelectorAll('.round-pill-btn');
  const roundDisplay = document.getElementById('round-display');
  const scorePoints = document.getElementById('score-points');
  const flowTimerBar = document.getElementById('flow-timer-bar');

  const btnPrevRound = document.getElementById('btn-prev-round');
  const btnNextRound = document.getElementById('btn-next-round');
  const btnPauseFlow = document.getElementById('btn-pause-flow');
  const btnReplay = document.getElementById('btn-replay-showcase');
  const btnCopyEmail = document.getElementById('btn-copy-email');
  const emailLabel = document.getElementById('email-label');

  // State
  const TOTAL_ROUNDS = slides.length;
  let currentRound = 1;
  let isFlowing = false;
  let isMusicPlaying = false;
  let flowTimer = null;
  let progressInterval = null;
  const ROUND_DURATION_MS = 8000;
  let roundStartTime = 0;
  let elapsedBeforePause = 0;
  let baseScore = 1216200;

  // =========================================================================
  // 1. FLOWSTATE DIRECTOR ENGINE
  // =========================================================================
  function setRound(roundNum, shouldAnimateScore = true) {
    if (roundNum < 1) roundNum = TOTAL_ROUNDS;
    if (roundNum > TOTAL_ROUNDS) roundNum = 1;
    currentRound = roundNum;

    // Update slide classes
    slides.forEach(slide => {
      const r = parseInt(slide.getAttribute('data-round'), 10);
      if (r === currentRound) {
        slide.classList.add('active');
      } else {
        slide.classList.remove('active');
      }
    });

    // Update pills
    pills.forEach(pill => {
      const r = parseInt(pill.getAttribute('data-round'), 10);
      if (r === currentRound) {
        pill.classList.add('active');
      } else {
        pill.classList.remove('active');
      }
    });

    // Update scoreboard
    roundDisplay.textContent = `0${currentRound}/0${TOTAL_ROUNDS}`;

    // Score ticking
    if (shouldAnimateScore) {
      animatePoints(baseScore + (currentRound - 1) * 25000);
    }

    // Reset round timer
    resetFlowTimer();
  }

  function animatePoints(target) {
    let current = parseInt(scorePoints.textContent.replace(/,/g, ''), 10) || baseScore;
    const diff = target - current;
    const steps = 12;
    const increment = diff / steps;
    let stepCount = 0;

    const interval = setInterval(() => {
      stepCount++;
      current += increment;
      scorePoints.textContent = Math.round(current).toLocaleString();
      if (stepCount >= steps) {
        clearInterval(interval);
        scorePoints.textContent = target.toLocaleString();
      }
    }, 30);
  }

  function startFlowTimer(remainingMs = ROUND_DURATION_MS) {
    clearTimeout(flowTimer);
    clearInterval(progressInterval);

    if (!isFlowing) return;

    roundStartTime = Date.now() - (ROUND_DURATION_MS - remainingMs);

    progressInterval = setInterval(() => {
      if (!isFlowing) return;
      const elapsed = Date.now() - roundStartTime;
      const percent = Math.min(100, (elapsed / ROUND_DURATION_MS) * 100);
      flowTimerBar.style.width = `${percent}%`;
    }, 40);

    flowTimer = setTimeout(() => {
      flowTimerBar.style.width = '100%';
      setRound(currentRound + 1);
    }, remainingMs);
  }

  function resetFlowTimer() {
    clearTimeout(flowTimer);
    clearInterval(progressInterval);
    flowTimerBar.style.width = '0%';
    elapsedBeforePause = 0;

    if (isFlowing) {
      startFlowTimer(ROUND_DURATION_MS);
    }
  }

  function pauseFlow() {
    if (!isFlowing) return;
    isFlowing = false;
    clearTimeout(flowTimer);
    clearInterval(progressInterval);
    elapsedBeforePause = Date.now() - roundStartTime;
    btnPauseFlow.textContent = 'PLAY';
    btnPauseFlow.classList.remove('act-btn-yellow');
    btnPauseFlow.classList.add('act-btn-pink');
  }

  function resumeFlow() {
    if (isFlowing) return;
    isFlowing = true;
    btnPauseFlow.textContent = 'PAUSE';
    btnPauseFlow.classList.add('act-btn-yellow');
    btnPauseFlow.classList.remove('act-btn-pink');
    const remaining = Math.max(600, ROUND_DURATION_MS - elapsedBeforePause);
    startFlowTimer(remaining);
  }

  function toggleFlow() {
    if (isFlowing) {
      pauseFlow();
    } else {
      resumeFlow();
    }
  }

  // Round triggers
  btnNextRound.addEventListener('click', () => {
    setRound(currentRound + 1);
  });

  btnPrevRound.addEventListener('click', () => {
    setRound(currentRound - 1);
  });

  btnPauseFlow.addEventListener('click', toggleFlow);

  if (btnReplay) {
    btnReplay.addEventListener('click', () => {
      setRound(1);
      resumeFlow();
    });
  }

  // Pill click triggers
  pills.forEach(pill => {
    pill.addEventListener('click', () => {
      const r = parseInt(pill.getAttribute('data-round'), 10);
      setRound(r);
    });
  });

  // =========================================================================
  // 2. AUDIO BROADCAST CONTROLS
  // =========================================================================
  function startMusic() {
    bgAudio.volume = 0.8;
    bgAudio.play().then(() => {
      isMusicPlaying = true;
      btnSoundToggle.textContent = 'MUSIC: ON';
      btnSoundToggle.classList.add('act-btn-yellow');
      btnSoundToggle.classList.remove('act-btn-pink');
    }).catch(err => {
      console.warn('Playback prevented by browser:', err);
      isMusicPlaying = false;
      btnSoundToggle.textContent = 'MUSIC: OFF';
    });
  }

  function pauseMusic() {
    bgAudio.pause();
    isMusicPlaying = false;
    btnSoundToggle.textContent = 'MUSIC: OFF';
    btnSoundToggle.classList.remove('act-btn-yellow');
    btnSoundToggle.classList.add('act-btn-pink');
  }

  function toggleMusic() {
    if (isMusicPlaying) {
      pauseMusic();
    } else {
      startMusic();
    }
  }

  btnSoundToggle.addEventListener('click', toggleMusic);

  // =========================================================================
  // 3. START SHOWCASE
  // =========================================================================
  function launchShowcase(withMusic) {
    onAirOverlay.classList.add('opened');
    isFlowing = true;
    btnPauseFlow.textContent = 'PAUSE';

    if (withMusic) {
      startMusic();
    } else {
      pauseMusic();
    }

    setRound(1, false);

    setTimeout(() => {
      onAirOverlay.style.display = 'none';
    }, 800);
  }

  btnStartMusic.addEventListener('click', () => launchShowcase(true));
  btnStartSilent.addEventListener('click', () => launchShowcase(false));

  // =========================================================================
  // 4. COPY EMAIL (GAME SHOW BUZZER EFFECT)
  // =========================================================================
  if (btnCopyEmail && emailLabel) {
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

      const orig = emailLabel.textContent;
      emailLabel.textContent = 'BUZZ! COPIED TO CLIPBOARD!';
      emailLabel.style.color = '#d90429';

      setTimeout(() => {
        emailLabel.textContent = orig;
        emailLabel.style.color = '';
      }, 2500);
    });
  }

  // Keyboard navigation
  window.addEventListener('keydown', (e) => {
    if (e.key === 'ArrowRight' || e.key === ' ') {
      e.preventDefault();
      setRound(currentRound + 1);
    } else if (e.key === 'ArrowLeft') {
      e.preventDefault();
      setRound(currentRound - 1);
    }
  });
});
