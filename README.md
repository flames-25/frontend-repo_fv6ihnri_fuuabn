Nightquad: College Roster

A responsive single-page app with a classic chilly college-at-night aesthetic. Features fluid animations, a parallax starfield with a Spline 3D hero, and subtle, melodic UI sounds synthesized with the Web Audio API. Includes a global sound toggle, volume slider (persisted), optional keypress shimmer (off by default), accessibility fallbacks, and roster management (add/edit/delete, search/filter, export JSON) stored locally.

Quick start
- Run: npm install && npm run dev
- Open the preview URL.
- Sounds are low by default (~30% volume). Toggle or adjust from the top-right controls.

Accessibility and performance
- Honors prefers-reduced-motion: audio is auto-suppressed if reduced motion is requested.
- Audio context is created on first user gesture to avoid autoplay restrictions.
- Very short, mono synth tones. Envelopes are short and nodes are reused per event.

Data
- Sample seed data (8 entries) is embedded and persisted to localStorage. Export the roster via the Export button (JSON file).

Replacing or adding custom audio files
- Create a /public/audio directory and add small files (e.g., input.mp3, success.mp3, delete.mp3).
- In AudioProvider.jsx, replace playTinn/playSuccess/playDelete with HTMLAudioElement playback, remembering to check the global enabled state and reducedMotion.

Code snippet: Web Audio API tinn
// simple melodic "tinn" with Web Audio API (reusable, low-footprint)
function playTinn({ctx, freq = 880, duration = 0.22, gain = 0.25} = {}) {
  if (!ctx) return;
  const now = ctx.currentTime;
  const osc = ctx.createOscillator();
  const gainNode = ctx.createGain();
  // timbre: mix of sine + triangle for warmth
  const osc2 = ctx.createOscillator();

  osc.type = 'sine';
  osc.frequency.value = freq;
  osc2.type = 'triangle';
  osc2.frequency.value = Math.round(freq * 1.997); // slight harmonic

  gainNode.gain.setValueAtTime(0.0001, now);
  gainNode.gain.exponentialRampToValueAtTime(gain, now + 0.005);
  gainNode.gain.exponentialRampToValueAtTime(0.0001, now + duration);

  osc.connect(gainNode);
  osc2.connect(gainNode);
  gainNode.connect(ctx.destination);

  osc.start(now);
  osc2.start(now);
  osc.stop(now + duration + 0.02);
  osc2.stop(now + duration + 0.02);
}

Fallback with files (example)
// In AudioProvider, initialize:
const audioFiles = {
  input: new Audio('/audio/input.mp3'),
  success: new Audio('/audio/success.mp3'),
  delete: new Audio('/audio/delete.mp3'),
};
// And play like:
if (enabled && !reducedMotion) { audioFiles.input.volume = volume; audioFiles.input.currentTime = 0; audioFiles.input.play(); }

Design details
- Palette: deep navy/indigo background, subtle stars, frost-like texture overlay, warm amber accents.
- Components: rounded paper-like cards, stitched borders (soft borders), subtle glow on hover.
- Motion: card fade+translate entrance, hover lift, modal scale-in, micro-animations for inputs.
- Spline: Headphones 3D scene used in the background hero, non-blocking and pointer-events disabled.

Note
- To disable shimmer while typing, keep the toggle off (default). The main tones trigger on blur or pressing Enter.
