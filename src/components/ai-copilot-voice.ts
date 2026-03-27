function normalizeLanguageTag(language: string | undefined): string {
  return (language ?? "").trim().toLowerCase();
}

const VESTA_PREFERRED_LANGUAGE = "en-au";

const HUMAN_VOICE_HINTS = [
  "natural",
  "neural",
  "wavenet",
  "enhanced",
  "premium",
  "siri",
  "aria",
  "jenny",
  "guy",
  "samantha",
  "allison",
  "victoria",
  "serena",
  "alex",
  "daniel",
];

const AUSTRALIAN_VOICE_HINTS = ["australia", "australian", "karen"];

const ROBOTIC_VOICE_HINTS = [
  "espeak",
  "festival",
  "flite",
  "mbrola",
  "compact",
  "classic",
  "legacy",
  "robot",
  "default",
];

export function scoreSpeechVoice(
  voice: SpeechSynthesisVoice,
  preferredLanguage: string,
): number {
  const voiceName = voice.name.toLowerCase();
  const voiceLanguage = normalizeLanguageTag(voice.lang);
  const preferred = normalizeLanguageTag(preferredLanguage);
  const preferredBase = preferred.split("-")[0];

  let score = 0;

  if (voiceLanguage === VESTA_PREFERRED_LANGUAGE) {
    score += 240;
  } else if (voiceLanguage.startsWith(`${VESTA_PREFERRED_LANGUAGE}-`)) {
    score += 220;
  }

  for (const hint of AUSTRALIAN_VOICE_HINTS) {
    if (voiceName.includes(hint)) {
      score += 70;
    }
  }

  if (voiceLanguage === preferred) {
    score += 80;
  } else if (
    preferredBase &&
    (voiceLanguage === preferredBase ||
      voiceLanguage.startsWith(`${preferredBase}-`))
  ) {
    score += 55;
  } else if (voiceLanguage.startsWith("en")) {
    score += 20;
  } else {
    score -= 35;
  }

  if (voice.default) {
    score += 8;
  }

  if (!voice.localService) {
    score += 6;
  }

  for (const hint of HUMAN_VOICE_HINTS) {
    if (voiceName.includes(hint)) {
      score += 22;
    }
  }

  for (const hint of ROBOTIC_VOICE_HINTS) {
    if (voiceName.includes(hint)) {
      score -= 26;
    }
  }

  return score;
}

export function pickPreferredSpeechVoice(
  voices: SpeechSynthesisVoice[],
  preferredLanguage: string,
): SpeechSynthesisVoice | null {
  if (voices.length === 0) return null;

  const rankedVoices = voices
    .map((voice) => ({
      voice,
      score: scoreSpeechVoice(voice, preferredLanguage),
    }))
    .sort((left, right) => right.score - left.score);

  return rankedVoices[0]?.voice ?? null;
}

type SpeechVoiceEventTarget = Pick<
  SpeechSynthesis,
  "getVoices" | "addEventListener" | "removeEventListener"
>;

export function waitForSpeechVoices(
  synth: SpeechVoiceEventTarget,
  timeoutMs = 900,
): Promise<SpeechSynthesisVoice[]> {
  const existingVoices = synth.getVoices();
  if (existingVoices.length > 0) {
    return Promise.resolve(existingVoices);
  }

  return new Promise((resolve) => {
    let settled = false;

    const settle = (voices: SpeechSynthesisVoice[]) => {
      if (settled) return;
      settled = true;
      synth.removeEventListener("voiceschanged", handleVoicesChanged);
      clearTimeout(timeoutId);
      resolve(voices);
    };

    const handleVoicesChanged = () => {
      const voices = synth.getVoices();
      if (voices.length === 0) return;
      settle(voices);
    };

    const timeoutId = setTimeout(() => {
      settle(synth.getVoices());
    }, timeoutMs);

    synth.addEventListener("voiceschanged", handleVoicesChanged);
  });
}
