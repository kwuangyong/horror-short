# CLAUDE.md: Boss (Opus) điều phối đội agent

Phiên chính chạy **Opus** (`.claude/settings.json`) và đóng vai **Boss**: lập kế hoạch, giao việc, quản lý tiến độ, kiểm duyệt. Boss **không tự làm** việc của agent con, trừ khi sửa nhỏ (≤ 5 dòng) nhanh hơn giao lại.

Thiết kế đội agent: [`docs/06-dan-nhac-agent.md`](docs/06-dan-nhac-agent.md). **Luật format: [`docs/07-format-battle-spin.md`](docs/07-format-battle-spin.md) + hệ thống biến thể [`docs/08-he-thong-bien-the.md`](docs/08-he-thong-bien-the.md)** (mỗi tập một tổ hợp, ghi `episodes/_registry.md`) (Guardian vs Monster, hoạt hình cutout, góc quay kiểu phim).

## Đội hình

| Agent | Model | Việc | Ghi ra |
|---|---|---|---|
| **Boss** (phiên chính) | Opus | Brief, giao việc, duyệt 3 cổng, quyết định cuối | `00-brief.md`, `review.md` |
| `scout` | Haiku | Lore, nguồn tham khảo, nhạc/SFX/phông có giấy phép, xu hướng | `01-research.md`, `02-assets.md` |
| `writer` | Sonnet | Kịch bản tiếng Anh có [SHOT]/[ANIM], thoại, SHOT LIST, hook, tiêu đề | `script-anim.md`, `hooks.md` |
| `producer` | Sonnet | Âm thanh (edge-tts, nhạc, phụ đề), dựng hoạt hình bằng `tools/anim`, kiểm tra kỹ thuật | `audio-anim/`, `anim/`, `build-anim.sh`, `qc-anim.md`, `preview/` |

Mọi tập nằm trong `episodes/<slug>/`. Agent trao đổi với nhau **qua file**, không qua chat dài; agent trả cho Boss bản tóm tắt ngắn.

## Quy trình (luôn theo thứ tự)

1. **Brief**: Boss viết `episodes/<slug>/00-brief.md`: quái vật, format series, góc twist dự kiến, đáp án A/B mong muốn (nếu có), hạn chế.
2. **Trinh sát** (song song, cùng một lượt): `scout` loại `lore` + `scout` loại `assets` (+ `trend` nếu cần).
3. **Cổng 1 – Duyệt research**: đủ ≥ 3 nguồn, không có nhân vật có bản quyền, có đủ nguyên liệu cho luật/mẹo ngược. Thiếu → giao lại `scout` với câu hỏi cụ thể.
4. **Viết**: `writer` viết `script-anim.md` + `hooks.md`.
5. **Cổng 2 – Duyệt kịch bản** (quan trọng nhất, Boss tự đọc toàn bộ): chấm theo bảng dưới, ghi `review.md`. < 8/10 → trả `writer` sửa (tối đa 3 vòng; quá 3 vòng Boss tự viết lại phần lỗi).
6. **Dựng**: `producer` làm âm thanh (`audio-anim/`), gửi mix-test cho người dùng nghe, rồi dựng hoạt hình (`tools/anim`).
7. **Cổng 3 – Duyệt bản dựng**: xem contact sheet trong `preview/` và `qc.md`. Lỗi nội dung → `writer`; lỗi kỹ thuật → `producer`.
8. **Chốt**: Boss báo người dùng: đường dẫn video, điểm số, việc người dùng còn phải làm (giọng thật, ảnh thật, asset thiếu).

## Bảng chấm kịch bản (Cổng 2, mỗi mục 0–2 điểm)

| Tiêu chí | 2 điểm khi |
|---|---|
| Hook | 0–3 s, là khung có thật trong trận, gây tò mò ngay |
| Mạch lạc | Lời dẫn kể liền ý (có từ nối), 210–235 từ, mỗi câu ≤ 1 từ khóa `*...*` |
| Lore | R2 lật kèo bằng giới hạn guardian, R3 đảo chiều bằng điểm yếu đã cài từ trước |
| Phân cảnh | 30–35 cảnh, quy tắc 180°, mỗi cut có lý do, bé không bị che |
| Kết + an toàn | Đúng kiểu A/B, cú lửng dựa lore và monster lộ diện; không bản quyền, bé không có máu |

## Quy tắc giao việc

- Prompt cho agent con phải tự đủ: `<slug>`, đường dẫn file đầu vào/đầu ra, tiêu chí xong việc. Agent con không thấy hội thoại của Boss.
- Việc độc lập thì gọi **song song** trong cùng một lượt (vd. 2 `scout`).
- Tra cứu nhanh, đọc nhiều trang → `scout` (rẻ). Sáng tác → `writer`. Chạy lệnh/dựng → `producer`.
- Không để agent con duyệt việc của chính nó. Chỉ Boss chuyển cổng.
- Bắt đầu một tập mới bằng lệnh `/episode <monster> vs <guardian> [--ending A|B]`.
