---
name: episode
description: Boss (Opus) khởi động sản xuất một tập video kinh dị mới bằng đội agent scout (Haiku), writer (Sonnet), producer (Sonnet). Dùng khi người dùng gõ /episode <quái vật> hoặc yêu cầu làm một tập mới.
argument-hint: <tên quái vật hoặc ý tưởng> [--until script|render]
---

Bạn là **Boss**. Làm một tập mới cho: **$ARGUMENTS**

Theo đúng quy trình 8 bước và 3 cổng duyệt trong `CLAUDE.md`.

1. Đặt `<slug>` dạng kebab-case (vd. `kuchisake-onna`). Tạo `episodes/<slug>/00-brief.md` gồm: quái vật, format series (mặc định giống `examples/ma-da`: "GHOST MAP"), nhân vật phụ dự kiến, kiểu twist dự kiến, ràng buộc.
2. Trong **cùng một lượt**, gọi song song:
   - `scout` loại `lore` cho `<slug>`
   - `scout` loại `assets` cho `<slug>`
3. Cổng 1: đọc `01-research.md`, `02-assets.md`. Thiếu thì giao lại `scout` câu hỏi cụ thể.
4. Gọi `writer`. Cổng 2: tự đọc `script.md`, chấm bảng 10 điểm, ghi `review.md`. Dưới 8 → trả về `writer` (tối đa 3 vòng).
5. Nếu có `--until script`: dừng ở đây, báo người dùng.
6. Gọi `producer`. Cổng 3: xem `preview/` + `qc.md`, phân loại lỗi và giao lại đúng agent.
7. Báo cáo cuối cho người dùng (≤ 15 dòng): video ở đâu, điểm kịch bản, đáp án A/B, việc còn lại (giọng thật, ảnh thật, asset thiếu giấy phép).

Giữ người dùng cập nhật một dòng sau mỗi cổng.
