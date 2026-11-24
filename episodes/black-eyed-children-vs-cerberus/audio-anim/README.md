# audio-anim/ - voice + score, black-eyed-children-vs-cerberus (script-anim v1.1, 232 words incl. dialogue). Synthesized, no licences.
Narrator: edge-tts Christopher, rate +8%, pitch -10Hz, voice_fx `deep`. voice_dark.wav 95.97 s.
Characters (silent slots in narration, overlaid; 0.55 s air around; 1.1 s before the final "Can we come in?" for the knock):
- children (x2): en-US-AnaNeural + en-GB-MaisieNeural, rate -14%, flat, 14 ms apart, cold echo.
- kid_mimic "Come in.": Ana flat + triple echo + chorus (warped).
- kid "No. You can't come in." / "I won't.": Ana whisper, light echo.
- cerberus "Never let them in. Go home.": GuyNeural -22% -18Hz; 3 layers (base -2 st, -5 st +35 ms, +3 st +70 ms) + low growl.
words.json: every word has speaker narrator/children/kid/kid_mimic/cerberus. sections.json: sections, "dialogue", "sentences" (start of every sentence).
Sections (s): hook 0 | split_roll 4.21 | arena 14.33 | R1 37.65 | R2 44.59 | R3 55.91 | K.O. 76.10 | dawn 77.84 | cliffhanger 85.20 | CTA 93.03 (see sections.json).
Music (music.wav 98.97 s): locks 7.75 ("Black-Eyed") / 10.29 ("Cerberus"); VS 13.46; cabin knock + floor-glow swell; R1 drums; R2 off-key music-box lullaby from "hum" (44.0), hard stop at "breaks" 66.0 (+ hit); R3 strong beat, fire + growl from "splits" 70.45, gate slam 75.11, K.O. hit 76.06; soft bell/pad at dawn; red sub-rumble from "glow" -> hard cut 89.18 (before "one") -> single knock 90.10 -> children's line -> silence.
Captions: captions.ass, --font "Bebas Neue" --max-words 5 --max-chars 24 --size 92; 81 events; no chunk crosses a sentence, no orphan word, none ends on article/preposition. Colours by speaker: children cold grey, kid/kid_mimic white italic, cerberus red-orange, narrator white (tools/make_captions.py SPEAKER_COLOR).
Mix: mix_test.sh -> mix-test.mp3 99.0 s, -14.2 LUFS.
Rebuild (HTTPS_PROXY set; growl.wav copied from episode 001): python make_voice.py --rate=+8%; python post_voice.py; python make_music.py; python ../../../tools/make_captions.py words.json --script ../script-anim.md --font "Bebas Neue" --max-words 5 --max-chars 24 --size 92 -o captions.ass; bash mix_test.sh
