---
name: episode
description: Boss (Opus) sản xuất trọn một tập "Battle Spin" (Guardian vs Monster, hoạt hình cutout có góc quay kiểu phim) bằng đội agent scout (Haiku), writer (Sonnet), producer (Sonnet). Dùng khi người dùng gõ /episode <monster> vs <guardian> hoặc yêu cầu làm một tập mới.
argument-hint: <monster> vs <guardian> [--ending A|B] [--until script|audio|render]
---

Bạn là **Boss**. Làm một tập Battle Spin cho: **$ARGUMENTS**

Đọc trước (bắt buộc): `docs/07-format-battle-spin.md` (luật format), `CLAUDE.md` (quy trình 3 cổng), `tools/anim/README.md` (engine hoạt hình). Tập mẫu: `episodes/vrykolakas-vs-church-grim/`.

## 0. Chọn cặp và kiểu kết
- Nếu thiếu monster hoặc guardian: chọn từ vòng gợi ý trong docs/07 mục 4, ưu tiên cặp có **xung đột lore tự nhiên** và chưa dùng ở tập trước (xem `episodes/`).
- Kết A (guardian thắng + monster hồi sinh lấp ló) hoặc Kết B (monster thắng + guardian giải thoát bé + "Do you think the kid survived?"). Không có `--ending` thì Boss chọn theo lore.
- Đặt `<slug>` = `<monster>-vs-<guardian>` (kebab-case).

## 1. Brief
Tạo `episodes/<slug>/00-brief.md`: cặp đấu, lý do chọn, lore dùng ở R2 (giới hạn guardian) và R3 (điểm yếu monster), kiểu kết + cú lửng (điều kiện lore bị bỏ sót, monster phải **lộ diện**), nơi bé lạc vào, thoại cuối guardian ↔ bé dự kiến.

## 2. Trinh sát (song song, một lượt)
- Nếu cặp đã có trong `episodes/_format-dual-spin/01-research-*.md` với độ tin cậy ≥ TB: dùng luôn, chỉ giao `scout` phần còn thiếu.
- Nếu chưa: `scout` loại `lore` cho monster + `scout` loại `lore` cho guardian → `episodes/<slug>/01-research.md`.
- **Cổng 1**: ≥ 3 nguồn, có điểm yếu monster + giới hạn guardian, không vướng bản quyền/nhạy cảm (docs/07 mục 4).

## 3. Kịch bản
Giao `writer` viết `episodes/<slug>/script-anim.md` theo docs/07 mục 2, 3, 5, 6 và lấy `episodes/vrykolakas-vs-church-grim/script-anim.md` làm mẫu định dạng: mỗi câu `>` có `[SHOT]` + `[ANIM]`; thoại nhân vật theo cú pháp `(grim's voice …)` / `(kid's voice …)` mà `tools/narration.py` tách được; mục `## SHOT LIST` (30–35 cảnh) và `## ANIMATION BEAT SHEET`; kèm `hooks.md` (3 hook, 3 tiêu đề, mô tả + hashtag).
**Cổng 2** (Boss tự đọc toàn bộ lời dẫn, ghi `review.md`), chấm mỗi mục 0–2:
| Hook | Mạch lạc (câu liền ý, có từ nối) | Lore (R2 dùng giới hạn guardian, R3 dùng điểm yếu đã cài) | Phân cảnh (180°, match-on-action, không bị đứt) | Kết lửng đúng kiểu A/B + an toàn |
Dưới 8 → trả `writer` (tối đa 3 vòng). Dừng ở đây nếu `--until script`.

## 4. Âm thanh
Giao `producer` làm `episodes/<slug>/audio-anim/` theo docs/07 mục 7, tái dùng script trong `episodes/vrykolakas-vs-church-grim/audio-anim/` (make_voice.py, post_voice.py, make_music.py, mix_test.sh): voice_dark.wav 90–98 s, thoại guardian và bé bằng giọng riêng, words.json, sections.json, captions.ass, music.wav (cue theo mốc), mix-test.mp3 −14 LUFS, README.md.
edge-tts cần environment cho phép `speech.platform.bing.com` (environment `horror-short`); nếu bị chặn, đọc `read_documentation` topic `environment.network` rồi đề xuất mở host đó.
Gửi `mix-test.mp3` cho người dùng nghe. Dừng ở đây nếu `--until audio`.

## 5. Dựng hoạt hình
Giao `producer` viết `episodes/<slug>/anim/make_timeline.js` (sinh timeline từ words.json bằng `cutOnWord`/`cueOnWord`, đủ shots/cues/props/scenes/hud/splits theo SHOT LIST) và `episodes/<slug>/build-anim.sh` (theo mẫu `build-anim-v5.sh` của tập #001), rồi dựng:
- `build/anim/<slug>.mp4` (1080x1920, 30 fps), `preview/<slug>.mp4` (< 15 MB), `preview/<slug>-sheet.jpg` (20 khung theo thứ tự thời gian), `qc-anim.md`.
- Nếu monster/guardian chưa có rig trong `tools/anim/rigs.js`: producer phải thêm rig mới (cùng phong cách, các action trong beat sheet) và silhouette cho split roll, xuất một turnaround PNG để Boss duyệt trước khi dựng cả tập.
**Cổng 3** (Boss xem sheet + khung tại các mốc: split roll lock, monster xuất hiện, guardian chắn, R2 lật kèo, monster quay sang bé, R3, K.O., thoại cuối, cú lửng): lỗi lời/hình → producer; lỗi nội dung → writer.

## 6. Chốt
Commit + push lên nhánh làm việc. Gửi `preview/<slug>.mp4` cho người dùng bằng SendUserFile. Báo (≤ 15 dòng): thời lượng, LUFS, số cảnh, kiểu kết, điểm Cổng 2, điểm còn yếu, lệnh dựng lại.

Giữ người dùng cập nhật một dòng sau mỗi cổng.
