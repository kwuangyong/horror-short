# 03 · Quy trình sản xuất từng bước

Thời gian thực tế cho 1 video khi đã có bộ asset/template: **2–4 giờ** (lần đầu dựng format: 1–3 ngày).

```
Bước 0  Thiết kế format series (1 lần)
Bước 1  Chọn quái vật + viết kịch bản       ~30'
Bước 2  Giọng đọc (TTS)                      ~15'
Bước 3  Lấy timestamp từng từ                ~5'
Bước 4  Vẽ/generate cảnh (8–15 cảnh)         ~60–90'
Bước 5  Dựng + chuyển động                   ~45'
Bước 6  Phụ đề từ khóa đỏ                    ~10' (tự động bằng tools/)
Bước 7  Âm thanh: nhạc nền + SFX + mix        ~30'
Bước 8  Xuất file + đăng                     ~15'
```

---

<a id="buoc-0"></a>
## Bước 0 · Thiết kế format series riêng (làm 1 lần)

Kênh mẫu dùng "slot machine chọn quái vật". Bạn cần một **khung lặp lại** của riêng mình, ví dụ:

| Ý tưởng format | Intro 3–5s | Outro |
|---|---|---|
| **"Hồ sơ mật"** | Ngăn kéo tủ hồ sơ trượt ra, đóng dấu "CASE #017" | "Mở hồ sơ tiếp theo?" |
| **"Bánh xe định mệnh"** | Vòng quay may rủi chọn 1 trong 12 quái vật | "Quay tiếp?" |
| **"Đêm thứ N"** | Lịch xé, "ĐÊM 23", đồng hồ 3:00 AM | "Đêm 24 – follow để sống sót" |
| **"Bản đồ ma Việt Nam"** | Bản đồ, ghim đỏ rơi xuống tỉnh nào thì kể ma tỉnh đó | "Tỉnh tiếp theo?" |

Cố định cho mọi tập: logo, mascot, 2 phông chữ, bảng màu (≤ 5 màu), HUD trên cùng (tên series · tên quái vật · đồng hồ), đoạn outro CTA. Lưu thành **template project** trong phần mềm dựng.

## Bước 1 · Kịch bản

Theo [02-cong-thuc-kich-ban.md](02-cong-thuc-kich-ban.md). Nguồn quái vật an toàn bản quyền: **truyền thuyết dân gian** (ma da, ma lai, ma xó, quỷ nhập tràng, ma rà, Kuchisake-onna, Wendigo, La Llorona, Baba Yaga…), **creepypasta/SCP có giấy phép CC** (ghi nguồn), hoặc **quái vật tự sáng tạo**.

## Bước 2 · Giọng đọc (tiếng Anh, trầm, nguy hiểm)

> Chi tiết chọn giọng + xử lý cho trầm/ghê: **[05-giong-doc-tram.md](05-giong-doc-tram.md)**.

| Công cụ | Ghi chú |
|---|---|
| **Kokoro-82M** (mã nguồn mở, offline — **mặc định**) | Chạy nhanh trên CPU, không giới hạn, miễn phí thương mại (Apache 2.0). Dùng sẵn `tools/tts_kokoro.py` với giọng trộn **60% `am_onyx` + 40% `bm_george`**. |
| **ElevenLabs** (trả phí, có gói free nhỏ) | Chất lượng cao nhất, nhiều giọng trầm kể chuyện, chỉnh "stability" thấp để giọng có cảm xúc hơn. |
| **CapCut Text-to-speech** | Miễn phí trong CapCut, đủ dùng cho bắt đầu. |
| **edge-tts** (Python, miễn phí) | Giọng Microsoft Neural, ví dụ `en-US-ChristopherNeural`, `en-US-GuyNeural`, `en-GB-RyanNeural`. |
| **Tự đọc** | Tốt nhất về tính "nguyên bản" khi kiếm tiền; dùng mic tốt, đọc thầm, gần mic. |

Mẹo: tốc độ ~0.86–0.9×, thêm dấu "…" hoặc xuống dòng để TTS ngắt nghỉ. Sau đó chạy qua `tools/voice_fx.sh` (hoặc thêm cờ `--fx deep` ngay trong `tts_kokoro.py`).

```bash
pip install kokoro-onnx soundfile
```

```bash
python tools/tts_kokoro.py voice.txt -o voice_dark.wav --fx deep
```

## Bước 3 · Timestamp từng từ (để làm phụ đề tự động)

```bash
pip install faster-whisper
```

```bash
python tools/transcribe_words.py voice_dark.wav -o words.json --lang en
```

(Hoặc dùng auto-caption của CapCut / Premiere / DaVinci rồi bỏ qua bước này.)

## Bước 4 · Hình ảnh (phong cách flat vector)

Cần **8–15 cảnh**, mỗi cảnh hiển thị 3–8 giây, cộng **3–5 "đồ họa thông tin"** (thẻ luật, hộp mẹo, thanh đo, bộ đếm).

**Cách A – Tự vẽ vector (đồng bộ nhất):** Figma / Adobe Illustrator / Inkscape (miễn phí). Tạo thư viện tái sử dụng: phòng ngủ, giường, cửa sổ, cửa, mặt trăng, cây, nhân vật chính, người già, trẻ con, con ma. Mỗi tập chỉ đổi quái vật + vài đạo cụ.

**Cách B – AI tạo ảnh** (Midjourney, Ideogram, Leonardo, Flux, Recraft – Recraft xuất được SVG vector). Giữ đồng bộ bằng 1 "style prompt" cố định + ảnh tham chiếu (style reference):

```text
flat vector illustration, minimal 2D cartoon, no outlines, soft flat shading,
dark navy night palette with deep crimson accents, simple geometric shapes,
eerie but clean, vertical 9:16 composition, empty space in lower third for captions,
--no text, watermark, realistic, 3d
```

Ví dụ cảnh: `a small adobe house beside a dark river at night, full moon, ...` + style prompt.

**Bố cục cho video dọc 1080×1920:** chủ thể nằm ở 15–60% chiều cao; **chừa trống 65–80%** cho phụ đề; tránh 15% dưới cùng và cột phải (nút like/comment của TikTok/Shorts).

**Cảnh nên có:** toàn cảnh địa điểm → phòng ngủ → người đặt luật → cửa sổ thấy quái vật (3 khung, quái vật gần dần) → cảnh lore (màu xám/đơn sắc) → góc nhìn trong chăn → dấu chân → bàn tay → màn tối → jumpscare.

## Bước 5 · Dựng & chuyển động

Phần mềm: **CapCut** (dễ nhất, miễn phí), **DaVinci Resolve** (miễn phí, chuyên nghiệp), **After Effects** (đồ họa thông tin đẹp nhất), hoặc dựng bằng code (**Remotion**, **Motion Canvas**, hoặc script ffmpeg trong [`tools/`](../tools)).

Bộ chuyển động tối thiểu (đủ để giống video mẫu):

- **Ken Burns:** zoom 100% → 110% suốt cảnh.
- **Pan:** trượt ngang ở intro "spin" (tăng tốc rồi giảm tốc, motion blur), dừng → flash trắng 2 frame.
- **Camera shake** nhẹ ở các khoảnh khắc chạm/tiếng động lớn.
- **Quái vật tiến gần:** cùng một khung cửa sổ, scale quái vật 60% → 100% → 140% qua 3 cảnh.
- **Vignette co lại** dần khi căng thẳng tăng.
- **Đồ họa thông tin:** pop-in (scale 80→100%, 150 ms), thanh đo giảm từng vạch, số đếm chạy, con dấu "BROKEN" đập xuống + shake.
- **Cut theo nhịp câu**, mỗi 2–4 giây phải có một thay đổi trên màn hình (cảnh mới, zoom, đồ họa, chữ).

## Bước 6 · Phụ đề

Tự động với công cụ trong repo:

```bash
python tools/make_captions.py words.json --script script.md -o captions.ass
```

Kết quả: chữ HOA, condensed đậm, 1–3 từ/cụm, từ khóa trong `*...*` được tô đỏ, đặt ở ~70% chiều cao, hiệu ứng pop. Phông khuyên dùng (Google Fonts, miễn phí): **Oswald**, **Bebas Neue**, **Anton**. Tải file `.ttf` về thư mục `fonts/`.

Trong CapCut: Auto captions → chọn style chữ đậm, viết hoa → tô đỏ từ khóa thủ công.

## Bước 7 · Âm thanh

| Lớp | Mức (tương đối) | Nguồn miễn phí |
|---|---|---|
| Giọng đọc | 0 dB (chuẩn) | – |
| Drone/ambient tối, liên tục | −18 đến −22 dB dưới giọng | Pixabay Music, YouTube Audio Library, Free Music Archive |
| SFX theo chữ (nước, khóc, bước chân, tim đập, whoosh) | −6 đến −10 dB | Freesound.org (kiểm tra giấy phép CC0/CC-BY), Pixabay SFX, Zapsplat |
| Stinger jumpscare | to nhất video, ngắn | như trên |

Mix: nén nhẹ toàn bộ, **chuẩn hóa ~ −14 LUFS** (video mẫu ~ −17 LUFS), true peak ≤ −1 dBTP. "Im lặng" trong truyện = giảm drone xuống, không tắt hẳn.

## Bước 8 · Xuất file

- 1080×1920, 30 fps, H.264, CRF 18–20, AAC 192 kbps. Độ dài 60–90s (TikTok, Reels thoải mái; YouTube Shorts cho phép tới 3 phút).
- Dựng tự động bằng ffmpeg: xem [`tools/README.md`](../tools/README.md).
