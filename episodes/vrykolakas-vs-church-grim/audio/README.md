# audio/ - battle voice + score (free, no license needed)
Voice: edge-tts en-US-ChristopherNeural (rate +12%, pitch -10Hz; rate chosen so voice_dark is ~99 s after voice_fx `deep` slows by 0.94x; -15% gave 132 s). Eleni line: same voice, rate -25%, `whisper` preset + lowpass/echo, overlaid in voice_dark.wav.
Music/SFX: synthesized with numpy (make_music.py). Nothing downloaded.

Files: voice.txt, voice.mp3 (raw, full), voice_narr.mp3 (raw, Eleni slot silent), eleni_raw.mp3/eleni_fx.wav, voice_dark.wav (final voice, 99.13 s, 48k),
words.json (WordBoundary timings scaled x1.0639 to match voice_dark; same format as transcribe_words.py), words_raw.json, sections.json, captions.ass,
music.wav (102.13 s = voice+3 s), impact.wav, growl.wav, knock.wav, mix-test.mp3.

Section starts in voice_dark (s): hook 0.0 | kid card 3.19 | spin 7.20 | VS 11.99 | woods+rule+attack 14.14 | Grim 39.38 | R1 46.59 | R2 51.70 | R3 65.62 | K.O. ("it") ~83.6 | false peace 85.48 | music dies 91.44 | "One knock" 93.95, knock SFX 94.77 | CTA 95.30 | end 99.13.
Note: "Grandma Eleni's voice echoes" 21.7-23.4, rule line (whispered) ~23.9-27.6 (words 'Garlic..fire').

Rebuild (from repo root, HTTPS_PROXY set):
  python tools/narration.py episodes/vrykolakas-vs-church-grim/script-battle.md -o episodes/vrykolakas-vs-church-grim/audio/voice.txt
  python episodes/vrykolakas-vs-church-grim/audio/make_voice.py --rate=+12% --pitch=-10Hz
  python episodes/vrykolakas-vs-church-grim/audio/post_voice.py     # voice_fx + words.json + sections.json
  python episodes/vrykolakas-vs-church-grim/audio/make_music.py
  bash episodes/vrykolakas-vs-church-grim/audio/mix_test.sh
  python tools/make_captions.py episodes/vrykolakas-vs-church-grim/audio/words.json --script episodes/vrykolakas-vs-church-grim/script-battle.md -o episodes/vrykolakas-vs-church-grim/audio/captions.ass
Music is already ~-18 dB-ish relative design; in the final mix apply volume=-18dB to music.wav (as mix_test.sh); knock/impact/growl are baked into music.wav at their cues, wav copies are for reuse.
