# Audio Pipeline · Episode #007 (`scp096-vs-medusa`)

- **Narrator:** `en-US-ChristopherNeural`, rate `+12%`, pitch `-10Hz`, 3-layer dark blend.
- **SCP-096:** `en-US-GuyNeural`, rate `+6%`, pitch `-8Hz`, 4-layer hollow distorted shriek + sub-bass; whisper layer `-22%`, `-14Hz` dry close-mic.
- **Medusa:** `en-GB-SoniaNeural`, rate `-4%`, pitch `-10Hz`, 3-layer venomous sibilant Gorgon voice.
- **Music & SFX:** 125 BPM war drums, misty cursed temple drone, Split-Roll ratchets, 096 shriek FX, emerald petrification beam, stone cracks, hard silence cut at `86.54s` before the C2 cliffhanger whisper.
- **Mix:** 2-pass `loudnorm` to `-14.2 LUFS`, duration `96.74s`.

## Rebuild Commands
```bash
python3 episodes/scp096-vs-medusa/audio-anim/make_voice.py
python3 episodes/scp096-vs-medusa/audio-anim/post_voice.py
python3 episodes/scp096-vs-medusa/audio-anim/make_music.py
bash episodes/scp096-vs-medusa/audio-anim/mix_test.sh
```
