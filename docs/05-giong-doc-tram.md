# 05 · Giọng đọc tiếng Anh: trầm, chậm, nguy hiểm

Toàn bộ nội dung video làm bằng **tiếng Anh** (kịch bản, phụ đề, chữ trên màn hình). Giọng kể chuyện cần **trầm, chậm, gần mic, nghe như đang thì thầm sát tai** chứ không phải giọng phát thanh viên.

> **Ưu tiên luật format:** tốc độ đọc của Battle Spin theo [docs/07](07-format-battle-spin.md) mục 12 (edge-tts `rate +10%…+15%`, nghỉ 0,30–0,35 s giữa câu, tempo vừa). Các số "120–140 từ/phút, nghỉ 0,4–0,8 s" bên dưới chỉ dùng cho câu thì thầm cú lửng cuối và thoại nhân vật.

## 1. Giọng đọc "nguy hiểm" gồm những gì

| Yếu tố | Mục tiêu |
|---|---|
| Cao độ | Thấp, ít lên xuống. Cuối câu **đi xuống**, không bao giờ đi lên. |
| Tốc độ | **120–140 từ/phút** (chậm hơn video mẫu một chút). Ngừng 0,4–0,8 s sau mỗi câu, ngừng lâu hơn trước từ quan trọng. |
| Âm sắc | Nhiều hơi, khàn nhẹ, "gần mic" (proximity effect → bass dày). |
| Cảm xúc | **Bình tĩnh**: không hét, không diễn quá. Giọng càng điềm tĩnh khi kể chuyện ghê rợn thì càng đáng sợ. |
| Động lực | Thì thầm ở hook và câu cuối, đọc bình thường ở giữa, gần như nói không ra tiếng ở cú lật. |

## 2. Chọn công cụ TTS

### ElevenLabs (chất lượng tốt nhất)
- Vào **Voice Library**, tìm theo từ khóa: `deep narrator`, `horror`, `dark storyteller`, `raspy`, `villain`, `whisper`. Chọn giọng nam trầm, giọng Mỹ hoặc Anh.
- Gợi ý cài đặt (với model Multilingual v2 / Turbo): **Stability 30–45%** (thấp → nhiều cảm xúc), **Similarity 75–85%**, **Style 20–40%**, **Speed 0.85–0.92**.
- Với model **v3** có thể dùng *audio tags* trong văn bản: `[whispers]`, `[pause]`, `[slowly]`, `[sinister laugh]`. Xuất sẵn văn bản có tag:

```bash
python tools/narration.py episodes/<slug>/script-anim.md --elevenlabs -o voice_el.txt
```

- Thoại nhân vật (giọng đứa trẻ, giọng quái vật) được script tách riêng ở cuối file → tạo bằng **giọng thứ hai**, rồi xử lý bằng preset `demon` bên dưới.

### Miễn phí
- **edge-tts** (giọng Microsoft Neural, cần Internet). Giọng nam tiếng Anh trầm nên thử: `en-US-ChristopherNeural`, `en-US-EricNeural`, `en-US-GuyNeural`, `en-GB-RyanNeural`, `en-GB-ThomasNeural`.

```bash
pip install edge-tts
```

```bash
python tools/narration.py episodes/<slug>/script-anim.md -o voice.txt
```

```bash
edge-tts --voice en-US-ChristopherNeural --rate=-15% --pitch=-8Hz --file voice.txt --write-media voice.mp3
```

- **Kokoro** (mã nguồn mở, chạy offline): giọng `am_onyx`, `am_michael`, `bm_george`, `bm_lewis`.
- **CapCut TTS**: có sẵn vài giọng "deep"/"narrator" trong mục Text-to-speech.

### Tự đọc
Thu gần mic (5–10 cm), đọc thầm như đang kể chuyện cho người nằm cạnh trong đêm. Đây là lựa chọn an toàn nhất về tính "nguyên bản" khi bật kiếm tiền.

## 3. Xử lý giọng cho trầm & ghê hơn (`tools/voice_fx.sh`)

```bash
bash tools/voice_fx.sh voice.mp3 voice_dark.wav deep
```

| Preset | Dùng cho | Chuỗi xử lý |
|---|---|---|
| `deep` (mặc định) | Người dẫn truyện | Hạ 2 cung (giữ formant), chậm 6%, tăng bass 110 Hz, giảm 350 Hz (đục), tăng 3,2 kHz (rõ), nén 4:1, phòng nhỏ tối, limiter |
| `demon` | Thoại quái vật | Như trên + một lớp "bóng" hạ 7 cung trộn bên dưới, vang dài hơn |
| `whisper` | Câu hook, câu cuối | Cắt bass, tăng hơi thở 6 kHz, vang dài |
| `radio` | Flash-forward, cảnh "băng ghi âm" | Dải tần hẹp 400–3000 Hz, méo nhẹ |

Mẹo: hạ cao độ tối đa 2–3 cung với giọng TTS. Hạ nhiều hơn sẽ nghe giả như robot; muốn ghê hơn nữa thì dùng lớp `demon` thay vì hạ thêm.

## 4. Trộn âm (kết hợp với tài liệu 03, bước 7)

- Giọng luôn nằm **trên** nhạc 18–22 dB. Khi có câu thoại quan trọng, giảm nhỏ nhạc nền (ducking).
- Ngay **trước** cú lật hoặc jumpscare: tắt nhạc 0,5–1 s, chỉ còn giọng thì thầm → rồi stinger.
- Tổng thể: −14 LUFS, true peak −1 dBTP (`audio-anim/mix_test.sh` làm việc này: loudnorm 2 lượt + limiter).
