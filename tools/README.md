# tools/

Công cụ sản xuất cho format Battle Spin. **Mọi tập chính thức dựng bằng engine hoạt ảnh khớp xương SVG `tools/anim/`** (xem [`anim/README.md`](anim/README.md)). Không dùng ảnh tĩnh + Ken Burns, không thanh HP, không thẻ ROUND (các công cụ cũ `render.py`, `make_cards.py` đã bị xóa).

Cần có: Node 18+ với Playwright Chromium (đã cài sẵn trong cloud), Python 3.10+, `ffmpeg` (có libass), `edge-tts`, phông `fonts-bebas-neue`.

| File | Việc làm |
|---|---|
| `narration.py` | Tách lời dẫn + thoại nhân vật từ `script-anim.md` ra văn bản cho TTS (`(grim's voice …)`, `(kid's voice …)`) |
| `voice_fx.sh` | Làm giọng trầm và ghê hơn: preset `deep`, `demon`, `whisper`, `radio` |
| `transcribe_words.py` | Mốc từng từ bằng faster-whisper. Dự phòng: trong cloud dùng WordBoundary của edge-tts |
| `make_captions.py` (+ `common.py`) | Phụ đề `.ass`: chữ HOA, 1–4 từ mỗi cụm, từ khóa `*...*` tô đỏ, pop |
| `anim/` | Engine hoạt ảnh: `rigs.js` (nhân vật khớp xương), `stage.js` (cảnh, camera, shot, split-roll), `sakuga.js` (đòn năng lượng, lãnh địa, hào quang, letterbox), `render.js` (Playwright → mp4, `--check` luật 180°), `timeline_words.js` (khớp cue theo `words.json`), `captions_dyn.py` (phụ đề động) |

## Chuỗi lệnh cho một tập (`episodes/<slug>/`)

```bash
python tools/narration.py episodes/<slug>/script-anim.md -o episodes/<slug>/audio-anim/voice.txt
```

```bash
bash tools/voice_fx.sh episodes/<slug>/audio-anim/voice_narr.mp3 episodes/<slug>/audio-anim/voice_dark.wav deep
```

```bash
python tools/make_captions.py episodes/<slug>/audio-anim/words.json --script episodes/<slug>/script-anim.md --font "Bebas Neue" --size 104 --max-words 4 --max-chars 24 -o episodes/<slug>/build/captions.ass
```

```bash
node episodes/<slug>/anim/make_timeline.js
```

```bash
node tools/anim/render.js --timeline episodes/<slug>/anim/timeline.json --check
```

```bash
python3 tools/anim/captions_dyn.py episodes/<slug>/build/captions.ass episodes/<slug>/anim/timeline.json episodes/<slug>/build/captions-dyn.ass
```

```bash
bash episodes/<slug>/build-anim.sh
```

Lệnh `--check` phải in `180-RULE OK` trước khi dựng. Mẫu dựng đầy đủ: `episodes/black-eyed-children-vs-cerberus/build-anim.sh`. Mẫu timeline theo luật mới: `tools/anim/demo/sakuga_demo.js`.
