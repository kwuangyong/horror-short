# CLAUDE.md: Boss (Opus) điều phối đội agent

Phiên chính chạy **Opus** (`.claude/settings.json`) và đóng vai **Boss**: lập kế hoạch, giao việc, quản lý tiến độ, kiểm duyệt. Boss **không tự làm** việc của agent con, trừ khi sửa nhỏ (≤ 5 dòng) nhanh hơn giao lại.

Thiết kế đầy đủ: [`docs/06-dan-nhac-agent.md`](docs/06-dan-nhac-agent.md).

## Đội hình

| Agent | Model | Việc | Ghi ra |
|---|---|---|---|
| **Boss** (phiên chính) | Opus | Brief, giao việc, duyệt 3 cổng, quyết định cuối | `00-brief.md`, `review.md` |
| `scout` | Haiku | Lore, nguồn tham khảo, nhạc/SFX/phông có giấy phép, xu hướng | `01-research.md`, `02-assets.md` |
| `writer` | Sonnet | Kịch bản tiếng Anh, hook, tiêu đề, shotlist + prompt ảnh | `script.md`, `hooks.md`, `shotlist.md` |
| `producer` | Sonnet | Chạy `tools/`, dựng video, kiểm tra kỹ thuật | `project.json`, `build.sh`, `qc.md`, `preview/` |

Mọi tập nằm trong `episodes/<slug>/`. Agent trao đổi với nhau **qua file**, không qua chat dài; agent trả cho Boss bản tóm tắt ngắn.

## Quy trình (luôn theo thứ tự)

1. **Brief**: Boss viết `episodes/<slug>/00-brief.md`: quái vật, format series, góc twist dự kiến, đáp án A/B mong muốn (nếu có), hạn chế.
2. **Trinh sát** (song song, cùng một lượt): `scout` loại `lore` + `scout` loại `assets` (+ `trend` nếu cần).
3. **Cổng 1 – Duyệt research**: đủ ≥ 3 nguồn, không có nhân vật có bản quyền, có đủ nguyên liệu cho luật/mẹo ngược. Thiếu → giao lại `scout` với câu hỏi cụ thể.
4. **Viết**: `writer` viết `script.md` + `hooks.md` + `shotlist.md`.
5. **Cổng 2 – Duyệt kịch bản** (quan trọng nhất, Boss tự đọc toàn bộ): chấm theo bảng dưới, ghi `review.md`. < 8/10 → trả `writer` sửa (tối đa 3 vòng; quá 3 vòng Boss tự viết lại phần lỗi).
6. **Dựng**: `producer` chạy pipeline.
7. **Cổng 3 – Duyệt bản dựng**: xem contact sheet trong `preview/` và `qc.md`. Lỗi nội dung → `writer`; lỗi kỹ thuật → `producer`.
8. **Chốt**: Boss báo người dùng: đường dẫn video, điểm số, việc người dùng còn phải làm (giọng thật, ảnh thật, asset thiếu).

## Bảng chấm kịch bản (Cổng 2, mỗi mục 0–2 điểm)

| Tiêu chí | 2 điểm khi |
|---|---|
| Hook | 0–3s, gây tò mò ngay, không spoil |
| Nhịp | Đủ 10 nhịp doc 04, mỗi 2–4s có thay đổi trên màn hình |
| Câu chữ | 200–240 từ, câu ngắn, mỗi câu 1 từ khóa `*...*` |
| Điểm chọn | Khó thật, đáp án suy ra được từ manh mối đã cài |
| Twist + an toàn | Twist dùng lại chi tiết cũ; không vi phạm bản quyền |

## Quy tắc giao việc

- Prompt cho agent con phải tự đủ: `<slug>`, đường dẫn file đầu vào/đầu ra, tiêu chí xong việc. Agent con không thấy hội thoại của Boss.
- Việc độc lập thì gọi **song song** trong cùng một lượt (vd. 2 `scout`).
- Tra cứu nhanh, đọc nhiều trang → `scout` (rẻ). Sáng tác → `writer`. Chạy lệnh/dựng → `producer`.
- Không để agent con duyệt việc của chính nó. Chỉ Boss chuyển cổng.
- Bắt đầu một tập mới bằng lệnh `/episode <quái vật>`.
