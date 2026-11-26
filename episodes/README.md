# episodes/

Mỗi tập một thư mục `episodes/<slug>/` (`<slug>` = `<monster>-vs-<guardian>`), do đội agent tạo bằng lệnh `/episode <monster> vs <guardian>`. Luật: [docs/07](../docs/07-format-battle-spin.md). Tập mẫu chuẩn: [`apep-vs-thor/`](apep-vs-thor/).

| File / thư mục | Ai tạo | Nội dung |
|---|---|---|
| `00-brief.md` | Boss | Cặp đấu + lý do, tổ hợp A–F, bối cảnh 3 không gian, sức mạnh dự kiến, số phận bé, cú lửng, nội dung 2 intro |
| `01-research-<nhân vật>.md`, `01-research-powers.md` | scout | Lore có nguồn, bảng sức mạnh (nguồn + link + fx + giới hạn); kết luận Cổng 1 |
| `script-anim.md`, `hooks.md` | writer | Kịch bản tiếng Anh (HOOK · INTROS · STORY · POWERS USED · SHOT LIST · BEAT SHEET), 3 hook, 3 tiêu đề, mô tả |
| `review.md` | Boss | Chấm Cổng 2 và Cổng 3, các chỉnh sửa |
| `audio-anim/` | producer | Giọng đọc, giọng nhân vật, `words.json`, `sections.json`, `music.wav`, `captions.ass`, `mix-test.mp3`, README cue |
| `anim/make_timeline.js` → `anim/timeline.json` | producer | Timeline hoạt hình (mở đầu bằng `tools/anim/episode_kit.js`) |
| `build-anim.sh` | producer | Kiểm tra → mix → phụ đề → render → preview |
| `qc-anim.md` | producer | Thời lượng, LUFS, số cảnh, `--check`, `validate.js`, từng mốc pass/fail |
| `preview/` | producer | `<slug>.mp4` (< 15 MB), `<slug>-sheet.jpg`, bảng rig |
| `build/` | producer | File trung gian (không commit) |

Thư mục khác: `_registry.md` (tổ hợp biến thể đã dùng), `_format-dual-spin/` (kho research monster / guardian).
