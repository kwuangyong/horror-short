# tools/

Cần có: Python 3.10+, `pip install pillow faster-whisper kokoro-onnx soundfile`, và `ffmpeg` (có libass, rubberband). Phông chữ: đặt file `Oswald-Bold.ttf` (hoặc Anton / Bebas Neue) vào `fonts/`.

## Quy trình đầy đủ cho một tập

```bash
python tools/narration.py my-episode/script.md -o my-episode/voice.txt
```

Tạo giọng đọc tiếng Anh offline bằng **Kokoro-82M** (mặc định trộn `60% am_onyx + 40% bm_george`) và xử lý trầm luôn với `--fx deep`:

```bash
python tools/tts_kokoro.py my-episode/voice.txt -o my-episode/voice_dark.wav --fx deep
```

*(Hoặc nếu dùng ElevenLabs / edge-tts ra `voice.mp3` thì chạy riêng: `bash tools/voice_fx.sh my-episode/voice.mp3 my-episode/voice_dark.wav deep`.)*

```bash
python tools/transcribe_words.py my-episode/voice_dark.wav --lang en -o my-episode/words.json
```

```bash
python tools/make_captions.py my-episode/words.json --script my-episode/script.md -o my-episode/captions.ass
```

```bash
python tools/make_cards.py choice "OPEN THE DOOR" "STAY QUIET" --countdown 5 --bg my-episode/door.png -o my-episode/choice.png
```

```bash
python tools/render.py my-episode/project.json --voice voice_dark.wav
```

## Định dạng `project.json`

Mọi đường dẫn đều tính tương đối so với vị trí file project.json. Ví dụ đầy đủ: `examples/ma-da/project.json`.

```jsonc
{
  "width": 1080, "height": 1920, "fps": 30,
  "output": "build/out.mp4",
  "hud": { "label": "GHOST MAP · THE MA DA" },   // nhãn đỏ + đồng hồ trên cùng
  "voice": "voice_dark.wav",
  "music": "drone.mp3", "music_volume": 0.18,      // nhạc tự lặp, fade ở cuối
  "captions": "captions.ass",
  "loudness": -14,                                 // LUFS, chuẩn hóa 2 lần
  "sfx": [ { "file": "knock.wav", "at": 46.0, "volume": 0.8 } ],
  "scenes": [
    {
      "image": "house.png", "duration": 3.5,
      "zoom": [1.0, 1.12],        // Ken Burns: từ → đến
      "pan": "left",              // none | left | right | up | down
      "shake": 14,                // biên độ rung (px), hoặc true
      "flash": true,              // flash trắng ở đầu cảnh
      "fade_in": 0.8, "fade_out": 0.6,
      "clock": "2:47 AM",         // đồng hồ HUD (giữ nguyên cho các cảnh sau)
      "hud": false                // ẩn HUD ở cảnh này
    }
  ]
}
```

## Quy ước trong script.md

- Lời dẫn = những dòng bắt đầu bằng `>` nằm sau tiêu đề `## ` đầu tiên.
- `*word*` = từ khóa được tô đỏ trong phụ đề (chỉ tô đúng chỗ đã đánh dấu, các lần lặp khác không bị tô).
- `(whisper, slow)` = chỉ dẫn cách đọc: bị bỏ khỏi phụ đề, chuyển thành audio tag khi dùng `narration.py --elevenlabs`.
- `(child's voice …)` = thoại nhân vật: được tách riêng để thu bằng giọng thứ hai.
