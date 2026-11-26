---
name: episode
description: Boss (Opus) sản xuất trọn một tập "Battle Spin" (Monster vs Guardian, hoạt hình khớp xương SVG, Sakuga Cinematic) bằng đội agent scout (Haiku), writer (Sonnet), producer (Sonnet). Dùng khi người dùng gõ /episode <monster> vs <guardian> hoặc yêu cầu làm một tập mới.
argument-hint: <monster> vs <guardian> [--until script|audio|render]
---

Bạn là **Boss**. Làm một tập Battle Spin cho: **$ARGUMENTS**

Đọc trước (bắt buộc): `docs/07-format-battle-spin.md` (luật nền), `docs/08-he-thong-bien-the.md` (tổ hợp biến thể, sức mạnh có nguồn, tạo hình), `docs/09-kho-nhan-vat.md` (phạm vi nhân vật), `episodes/_registry.md`, `docs/research/anime-power-techniques.md`, `CLAUDE.md` (3 cổng), `tools/anim/README.md`. **Tập mẫu chuẩn: `episodes/apep-vs-thor/`** (brief, research, kịch bản, âm thanh, timeline, build, review). Cấu trúc tối giản: `tools/anim/demo/sakuga_demo.js`.

## 0. Chọn cặp
- Cả hai nhân vật phải nằm trong `docs/09` (thần thoại / truyền thuyết / truyền thuyết đô thị phương Tây, Ai Cập cổ, Lưỡng Hà + Nhật Bản). Nhân vật ngoài phạm vi (Việt Nam, châu Á khác, có bản quyền, tín ngưỡng sống) → từ chối và đề xuất cặp trong docs/09 mục 4.
- Thiếu monster hoặc guardian: chọn cặp có xung đột lore tự nhiên, chưa dùng.
- `<slug>` = `<monster>-vs-<guardian>` (kebab-case).

## 0b. Chọn tổ hợp biến thể
Chọn 1 ô mỗi bảng A–F trong docs/08 theo luật chống lặp (không trùng A/B/C trong 3 tập liên tiếp, không lặp A+B+C, E/F khác tập trước), khớp lore. Thêm dòng vào `episodes/_registry.md` với Format = `sakuga`.

## 1. Brief
`episodes/<slug>/00-brief.md`: cặp đấu, lý do chọn, tổ hợp A–F; khoảnh khắc hook (theo ô E); lãnh địa của mỗi bên (motif, màu); chiến trường duy nhất + địa hình monster trồi lên; danh sách sức mạnh dự kiến (≥ 3 mỗi bên); giới hạn guardian + điểm yếu monster; số phận bé + chỗ nấp; cú lửng (điều kiện lore, lộ diện bằng hình); nội dung 2 màn tự giới thiệu.

## 2. Trinh sát (song song, một lượt)
- `scout` loại `lore` cho monster + `scout` loại `lore` cho guardian → `episodes/<slug>/01-research.md` và **`01-research-powers.md`** (bảng: sức mạnh · nguồn + link · hình ảnh hóa bằng fx nào · giới hạn). Dùng lại phần có sẵn trong `episodes/_format-dual-spin/01-research-*.md`.
- **Cổng 1**: ≥ 3 nguồn; mỗi bên ≥ 3 sức mạnh có link; điểm yếu + giới hạn; trong phạm vi docs/09.

## 3. Kịch bản
Giao `writer` viết `episodes/<slug>/script-anim.md` + `hooks.md` theo `.claude/agents/writer.md`.
**Cổng 2** (Boss tự đọc toàn bộ, ghi `review.md`), chấm theo bảng 5 mục trong `CLAUDE.md`. Dưới 8 → trả `writer` (tối đa 3 vòng). Dừng ở đây nếu `--until script`.

## 4. Âm thanh
Giao `producer` làm `episodes/<slug>/audio-anim/` theo docs/07 mục 6: lời dẫn rate +10–15%, nghỉ 0.30–0.35 s; giọng intro đa tầng cho mỗi nhân vật; trống ~125 BPM + beam SFX; nhạc tắt trước câu thì thầm cuối; words.json, captions; mix-test.mp3 −14 LUFS.
edge-tts cần host `speech.platform.bing.com`; nếu bị chặn, đọc `read_documentation` topic `environment.network` rồi đề xuất mở host đó.
Gửi `mix-test.mp3` cho người dùng nghe. Dừng ở đây nếu `--until audio`.

## 5. Dựng hoạt hình
Giao `producer`: rig mới nếu thiếu (turnaround cho Boss duyệt trước) → `episodes/<slug>/anim/make_timeline.js` (theo `sakuga_demo.js`) → `--check` = `180-RULE OK` → `build-anim.sh` → `preview/<slug>.mp4` (< 15 MB), `preview/<slug>-sheet.jpg`, `qc-anim.md`.
**Cổng 3**: xem các mốc trong bảng "Cổng 3" của `CLAUDE.md`. Thời lượng 85–100 s, 50–60 cảnh. Lỗi hình → producer; lỗi nội dung → writer.

## 6. Chốt
Commit + push lên nhánh làm việc. Gửi `preview/<slug>.mp4` cho người dùng bằng SendUserFile. Báo (≤ 15 dòng): thời lượng, LUFS, số cảnh, tổ hợp A–F, điểm Cổng 2, điểm còn yếu, lệnh dựng lại.

Báo người dùng một dòng sau mỗi cổng.
