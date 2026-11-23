# audio-anim/ - voice + score for script-anim.md v5.1 (219 narrated words). Free, synthesized.
Voice: edge-tts en-US-ChristopherNeural, rate +5%, pitch -10Hz, then tools/voice_fx.sh `deep`. voice_dark.wav = 89.67 s (+8% gave 87.6, +22% 79.6). Gaps: hook->roll 1.3 s, roll->arena 0.9, other sections 0.45, roll lines 0.55.
Section starts (s), see sections.json (also has per-sentence starts): hook 0 | split_roll 3.98 | arena 14.25 | R1 39.68 | R2 48.61 | R3 60.25 | K.O. 75.68 | dawn 77.12 | cliffhanger 81.08 | CTA 85.63 | end 89.67.
Music cues (music.wav 92.67 s): hook hit 0; roll ratchet from 3.98; lock hits 7.62 ("Vrykolakas") and 10.52 ("Grim"); VS hit 13.38 after "Comment"; taiko R1-R2; heartbeat R3 -> K.O. hit 75.35; bell + detuned piano from 77.12; music hard-cut 84.26 (before "one knock", word at 84.32); silence; single wooden knock 85.2.
Captions: captions.ass built with --max-words 4 --max-chars 24 --size 84. 77 events; verified: none spans two sentences, no lone-word chunk inside a multi-word sentence, none ends on article/preposition/possessive.
tools/make_captions.py chunker changed (balanced chunks per sentence; avoid orphans/dangling words); ma-da demo still builds.
Mix: mix_test.sh (music -18 dB, pre-gain + limiter, loudnorm 2-pass): mix-test.mp3 92.7 s, -14.2 LUFS, TP < -1.5 dBFS.
Rebuild (HTTPS_PROXY set): python make_voice.py --rate=+5% --pitch=-10Hz; python post_voice.py; python make_music.py; python ../../../tools/make_captions.py words.json --script ../script-anim.md --max-words 4 --max-chars 24 --size 84 -o captions.ass; bash mix_test.sh
