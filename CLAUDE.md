# CLAUDE.md: Boss (Opus) điều phối đội agent

Phiên chính chạy **Opus** (`.claude/settings.json`) và đóng vai **Boss**: lập kế hoạch, giao việc, quản lý tiến độ, kiểm duyệt. Boss **không tự làm** việc của agent con, trừ khi sửa nhỏ (≤ 5 dòng) nhanh hơn giao lại.

**Luật bắt buộc** (đọc trước mọi tập):
- [`docs/07-format-battle-spin.md`](docs/07-format-battle-spin.md): engine hoạt ảnh khớp xương (cấm ảnh tĩnh, HP, ROUND), hook in medias res, Split-Roll + 2 màn tự giới thiệu ~5 s, bé chạy đi nấp, Sakuga Cinematic, continuity, tempo vừa (dễ hiểu), 85–100 s, 50–60 cảnh.
- [`docs/08-he-thong-bien-the.md`](docs/08-he-thong-bien-the.md): tổ hợp A–F + luật chống lặp, ghi `episodes/_registry.md`; sức mạnh có nguồn.
- [`docs/09-kho-nhan-vat.md`](docs/09-kho-nhan-vat.md): chỉ nhân vật nổi tiếng trong thần thoại / truyền thuyết / truyền thuyết đô thị **phương Tây, Ai Cập cổ, Lưỡng Hà + Nhật Bản**.
- Engine: [`tools/anim/README.md`](tools/anim/README.md). **Tập mẫu chuẩn: `episodes/apep-vs-thor/`** (tempo vừa, monster khổng lồ, đủ 3 cổng); cấu trúc tối giản: `tools/anim/demo/sakuga_demo.js`.

Thiết kế đội agent: [`docs/06-dan-nhac-agent.md`](docs/06-dan-nhac-agent.md).

## Đội hình

| Agent | Model | Việc | Ghi ra |
|---|---|---|---|
| **Boss** (phiên chính) | Opus | Brief + tổ hợp biến thể, giao việc, duyệt 3 cổng, quyết định cuối | `00-brief.md`, `review.md`, `_registry.md` |
| `scout` | Haiku | Lore, **bảng sức mạnh có nguồn**, nhạc/SFX/phông có giấy phép, xu hướng | `01-research.md`, `01-research-powers.md`, `02-assets.md` |
| `writer` | Sonnet | Kịch bản tiếng Anh có [SHOT]/[ANIM]/[FX], 2 màn tự giới thiệu, SHOT LIST 50–60 cảnh, hook, tiêu đề | `script-anim.md`, `hooks.md` |
| `producer` | Sonnet | Âm thanh (edge-tts tempo vừa, giọng intro đa tầng, trống 125 BPM, beam SFX, phụ đề động), rig mới, timeline, dựng `tools/anim`, QC | `audio-anim/`, `anim/`, `build-anim.sh`, `qc-anim.md`, `preview/` |

Mọi tập nằm trong `episodes/<slug>/`. Agent trao đổi qua file, không qua chat dài; agent trả cho Boss bản tóm tắt ngắn.

## Quy trình (luôn theo thứ tự)

1. **Brief**: Boss chọn cặp từ docs/09, chọn tổ hợp A–F (docs/08), ghi `_registry.md`, viết `episodes/<slug>/00-brief.md`.
2. **Trinh sát** (song song, cùng một lượt): `scout` lore + bảng sức mạnh cho monster, `scout` lore + bảng sức mạnh cho guardian (+ `assets`/`trend` nếu cần).
3. **Cổng 1 – Duyệt research**: ≥ 3 nguồn; **mỗi bên ≥ 3 sức mạnh có link Public Domain / truyền thuyết**; có điểm yếu monster + giới hạn guardian; nhân vật nằm trong docs/09, không bản quyền. Thiếu → giao lại `scout`.
4. **Viết**: `writer` viết `script-anim.md` + `hooks.md`.
5. **Cổng 2 – Duyệt kịch bản** (Boss tự đọc toàn bộ): chấm theo bảng dưới, ghi `review.md`. < 8/10 → trả `writer` (tối đa 3 vòng).
6. **Dựng**: `producer` làm âm thanh, gửi mix-test cho người dùng nghe; thêm rig nếu thiếu (Boss duyệt turnaround); viết timeline (mở đầu bằng `tools/anim/episode_kit.js`); chạy `--check` phải ra `180-RULE OK` và `tools/anim/validate.js` phải 0 FAIL; dựng.
7. **Cổng 3 – Duyệt bản dựng**: xem sheet trong `preview/` + khung tại các mốc bắt buộc (bảng Cổng 3). Lỗi nội dung → `writer`; lỗi kỹ thuật → `producer`.
8. **Chốt**: commit + push, gửi preview, báo người dùng: thời lượng, LUFS, số cảnh, điểm Cổng 2, việc còn lại.

## Bảng chấm kịch bản (Cổng 2, mỗi mục 0–2 điểm)

| Tiêu chí | 2 điểm khi |
|---|---|
| Hook + mở đầu | Hook 0–3 s in medias res (khung có thật trong trận) + "WHO SURVIVES?" + tua ngược; Split-Roll có 2 màn tự giới thiệu ngôi thứ nhất ~5 s (thực thể gì, nguồn gốc, quyền năng), 2–3 góc máy mỗi màn, VS + "WHO WINS? COMMENT" |
| Mạch lạc + tempo | Lời dẫn liền ý có từ nối, ~200–240 từ cho 85–100 s, mỗi câu ≤ 1 từ khóa `*...*` |
| Lore + sức mạnh + xung đột | Đúng tổ hợp A/B/C; guardian có giới hạn có nguồn bị khai thác, đòn quyết định dựa điểm yếu đã cài (docs/07 mục 4); mỗi bên ≥ 3 sức mạnh có nguồn, mỗi lần khoe là chuỗi 2–4 cảnh theo công thức loại sức mạnh (mục 10); chi tiết sáng tạo ghi "(story)" |
| Phân cảnh Sakuga | 50–60 cảnh (~1.6–1.8 s/cảnh), một chiến trường duy nhất (địa hình monster trồi lên), mọi shot có push+pan, whip-pan theo hướng đạn, slow-mo + crash-zoom ở đòn kết, 180° |
| Bé + thoại + kết + an toàn | Bé chạy ra khỏi khung khi guardian chắn đòn đầu rồi bị ẩn suốt 1v1, chỉ cắt về chỗ nấp khi có biến cố và lúc kết, không máu; thoại đúng mục 6 (intro công thức, thoại cuối gài lore, thì thầm ≤ 5 từ); cú lửng 3 nhịp, dựa lore, lộ diện bằng hình (mục 7) |

## Cổng 3: mốc bắt buộc phải xem
Hook (beam-clash/đòn chí mạng + chữ) · Split-Roll khóa MONSTER · intro Monster (low, cu, ecu, pillar không che mặt) · khóa GUARDIAN · intro Guardian · VS · guardian chắn đòn đầu · **bé chạy ra khỏi khung** · địa hình monster trồi lên · từng đòn `beam` / `beam-clash` / `orbs` / `slash` / `pillar` · đòn kết liễu (slow-mo + crash) · cảnh chỗ nấp của bé · cú lửng. Kiểm tra: không ảnh tĩnh, không HP, không ROUND, phụ đề không đè mặt, `180-RULE OK`, `validate.js` 0 FAIL (WARN do Boss quyết).

## Quy tắc giao việc

- Prompt cho agent con phải tự đủ: `<slug>`, đường dẫn file đầu vào/đầu ra, tiêu chí xong việc. Agent con không thấy hội thoại của Boss.
- Việc độc lập thì gọi **song song** trong cùng một lượt (vd. 2 `scout`).
- Tra cứu → `scout` (rẻ). Sáng tác → `writer`. Chạy lệnh/dựng → `producer`.
- Không để agent con duyệt việc của chính nó. Chỉ Boss chuyển cổng.
- Bắt đầu một tập mới bằng lệnh `/episode <monster> vs <guardian>`.
