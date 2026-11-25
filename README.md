# Horror Short: Battle Spin (Monster vs Guardian)

Bộ quy chuẩn, đội agent và engine hoạt hình để làm video kinh dị dọc (TikTok / Reels / YouTube Shorts) tiếng Anh theo format **Battle Spin**:
- Hook *in medias res* + **"WHO SURVIVES?"**, tua ngược glitch.
- **Split-Roll MONSTER | GUARDIAN**, mỗi bên có màn tự giới thiệu ~5 s trong lãnh địa riêng, sau đó **VS · "WHO WINS? COMMENT"**.
- Trận 1v1 kiểu **Sakuga Cinematic** (beam, beam-clash, orbs, slash, pillar, letterbox, tàn lửa) trên một chiến trường duy nhất. THE KID chạy đi nấp và không xuất hiện trong khung giao chiến.
- Tempo x1.25: 70–85 s, 50–56 cảnh, −14 LUFS.

Toàn bộ video dựng bằng **engine hoạt ảnh khớp xương SVG** (`tools/anim/`, Playwright Chromium). Không dùng ảnh tĩnh, Ken Burns, thanh HP hay thẻ ROUND.

▶ **Demo engine (26 s, không tiếng):** [`tools/anim/demo/sakuga-demo.mp4`](tools/anim/demo/sakuga-demo.mp4)

![Khung hình demo](tools/anim/demo/sakuga-demo-sheet.jpg)

## Luật bắt buộc

| # | Tài liệu | Nội dung |
|---|---|---|
| 07 | [Format Battle Spin](docs/07-format-battle-spin.md) | Engine, mở đầu + 2 intro, THE KID, Sakuga, continuity 180°, tempo, sức mạnh có nguồn, phụ đề động |
| 08 | [Hệ thống biến thể](docs/08-he-thong-bien-the.md) | Bảng A–F, luật chống lặp, `episodes/_registry.md`, tạo hình nhân vật |
| 09 | [Kho nhân vật](docs/09-kho-nhan-vat.md) | Monster + Guardian nổi tiếng: thần thoại / truyền thuyết / truyền thuyết đô thị **phương Tây**, **Ai Cập cổ**, **Lưỡng Hà** + **Nhật Bản**. Không lấy châu Á khác |
| 06 | [Dàn nhạc agent](docs/06-dan-nhac-agent.md) | Boss (Opus) + scout (Haiku) + writer, producer (Sonnet); quy trình 3 cổng trong [`CLAUDE.md`](CLAUDE.md) |

Tham khảo: [01 · Phân tích video mẫu](docs/01-phan-tich-video-mau.md) · [05 · Giọng đọc trầm](docs/05-giong-doc-tram.md) · [Kỹ thuật khoe sức mạnh kiểu anime](docs/research/anime-power-techniques.md).

## Làm một tập mới

```text
/episode <monster> vs <guardian>
```

Boss chọn tổ hợp biến thể, giao `scout` tra lore + bảng sức mạnh có nguồn, `writer` viết `script-anim.md`, `producer` làm âm thanh, rig, timeline và dựng. Boss duyệt 3 cổng. Mọi tập nằm trong `episodes/<slug>/`.

## Cấu trúc

| Thư mục | Nội dung |
|---|---|
| `tools/anim/` | Engine: `rigs.js`, `stage.js`, `sakuga.js`, `render.js` (`--check` luật 180°), `timeline_words.js`, `captions_dyn.py`, demo. Xem [README](tools/anim/README.md) |
| `tools/` | Âm thanh và phụ đề: `narration.py`, `voice_fx.sh`, `make_captions.py`, `transcribe_words.py`. Xem [README](tools/README.md) |
| `episodes/_format-dual-spin/` | Kho research monster/guardian (đã lọc theo phạm vi docs/09) |
| `episodes/_registry.md` | Tổ hợp biến thể đã dùng |
| `episodes/black-eyed-children-vs-cerberus/` | Tập #002 (legacy): mẫu pipeline âm thanh và build |
| `episodes/vrykolakas-vs-church-grim/` | Tập #001 (legacy, lưu trữ) |

## Bản quyền
- Chỉ dùng truyền thuyết dân gian, thần thoại và văn học Public Domain (bản gốc, không lấy thiết kế từ phim/game). Không dùng nhân vật có chủ (Slenderman, Siren Head, Jeff the Killer, The Rake…), không dùng tín ngưỡng bản địa đang sống (Wendigo, Skinwalker…).
- Nhạc và SFX tổng hợp bằng code, hoặc nguồn có giấy phép rõ (CC0…).
