// Alert sound generation and playback utility

/**
 * Create and play an alert sound using Web Audio API
 * Generates a 440Hz sine wave beep for garbage detection alerts
 */
export async function playAlertSound(duration: number = 500, frequency: number = 880) {
  try {
    const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();

    // Connect nodes
    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);

    // Configure oscillator
    oscillator.frequency.value = frequency;
    oscillator.type = "sine";

    // Configure gain for fade in/out
    gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + duration / 1000);

    // Play sound
    oscillator.start(audioContext.currentTime);
    oscillator.stop(audioContext.currentTime + duration / 1000);

    return true;
  } catch (error) {
    console.error("Error playing alert sound:", error);
    return false;
  }
}

/**
 * Play a sequence of beeps for critical alerts
 */
export async function playTripleBeep() {
  for (let i = 0; i < 3; i++) {
    await playAlertSound(150, 880);
    await new Promise((resolve) => setTimeout(resolve, 100));
  }
}

/**
 * Fallback: Play alert using HTML5 Audio with data URI
 * Simple sine wave encoded as base64 MP3-like format
 */
export function playFallbackAlert() {
  try {
    const audio = new Audio();
    // Data URI for a simple beep tone (440Hz, 1 second)
    audio.src =
      "data:audio/wav;base64,UklGRiYAAABXQVZFZm10IBAAAAABAAEAQB8AAAB9AAACABAAZGF0YQIAAAAAAA==";
    audio.volume = 0.5;
    audio.play().catch(() => {
      console.warn("Could not play fallback alert sound");
    });
  } catch (error) {
    console.error("Fallback alert failed:", error);
  }
}
