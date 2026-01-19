// Minimal Web Speech API types for SpeechRecognition
// Placed under `src/types` so TypeScript picks it up automatically.

interface SpeechRecognitionEvent extends Event {
  resultIndex: number;
  results: any;
}

interface SpeechRecognition extends EventTarget {
  lang: string;
  continuous: boolean;
  interimResults: boolean;
  maxAlternatives: number;
  onaudiostart: ((ev: Event) => any) | null;
  onresult: ((ev: SpeechRecognitionEvent) => any) | null;
  onend: ((ev: Event) => any) | null;
  onerror: ((ev: Event) => any) | null;
  start(): void;
  stop(): void;
  abort(): void;
}

declare var SpeechRecognition: {
  prototype: SpeechRecognition;
  new (): SpeechRecognition;
};

declare var webkitSpeechRecognition: {
  prototype: SpeechRecognition;
  new (): SpeechRecognition;
};

export {};
