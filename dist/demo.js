const audio = document.querySelector('#sample-audio');
const player = document.querySelector('#audio-controls');
const playButton = document.querySelector('#play');
const time = document.querySelector('#audio-time');
const audioMessage = document.querySelector('#audio-message');
const waveformStops = [document.querySelector('#played'), document.querySelector('#remaining')];

function updateAudio() {
  const playing = !audio.paused && !audio.ended;
  const duration = Number.isFinite(audio.duration) ? audio.duration : 0;
  const seconds = Math.floor(playing || audio.currentTime ? audio.currentTime : duration);
  const percent = duration > 0 ? (audio.currentTime / duration) * 100 : 0;
  playButton.setAttribute('aria-label', playing ? 'Pausar áudio de exemplo' : 'Ouvir áudio de exemplo');
  playButton.classList.toggle('playing', playing);
  time.textContent = Math.floor(seconds / 60) + ':' + String(seconds % 60).padStart(2, '0');
  for (const stop of waveformStops) stop.setAttribute('offset', percent + '%');
}

playButton.addEventListener('click', async () => {
  audioMessage.textContent = '';
  if (!audio.paused) {
    audio.pause();
    return;
  }
  try {
    await audio.play();
  } catch {
    audioMessage.textContent = 'Não foi possível reproduzir o exemplo.';
  }
});

for (const event of ['loadedmetadata', 'timeupdate', 'play', 'pause', 'ended']) {
  audio.addEventListener(event, updateAudio);
}
audio.controls = false;
player.hidden = false;
updateAudio();

const copyStatus = document.querySelector('#copy-status');
const feedbackTimers = new WeakMap();

for (const button of document.querySelectorAll('[data-copy], [data-copy-target]')) {
  const initialMarkup = button.innerHTML;
  button.addEventListener('click', async () => {
    const value = button.dataset.copy ?? document.getElementById(button.dataset.copyTarget).textContent.trim();
    clearTimeout(feedbackTimers.get(button));
    try {
      await navigator.clipboard.writeText(value);
      button.textContent = 'Copiado';
      copyStatus.textContent = 'Texto copiado para a área de transferência.';
    } catch {
      button.textContent = 'Não foi possível copiar';
      copyStatus.textContent = 'Não foi possível copiar.';
    }
    feedbackTimers.set(button, setTimeout(() => {
      button.innerHTML = initialMarkup;
      copyStatus.textContent = '';
    }, 1600));
  });
}
