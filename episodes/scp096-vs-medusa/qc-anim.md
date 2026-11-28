# QC Animation · Episode #007 v2 (`scp096-vs-medusa` — Orchestra Horror Redraw + Story-Context Hook)

## 1. Kiểm tra tự động (v2)
- `node tools/anim/validate.js episodes/scp096-vs-medusa/anim/timeline.json --script episodes/scp096-vs-medusa/script-anim.md`: **0 FAIL · 1 WARN · 27 PASS**
  - `WARN could not find a kid actor or 1v1 fx window` (chủ đích `B: —` không dùng kid, giữ tông Anti-Guardian vs Monster thuần túy)
- `node tools/anim/render.js --timeline episodes/scp096-vs-medusa/anim/timeline.json --check`: **`180-RULE OK`**
- Thời lượng: **98.99 s** (chuẩn 85–100 s) · Số cảnh: **54 cảnh** (chuẩn 50–60 cảnh) · Loudness: **−14.2 LUFS** · 24 FPS · 1080×1920.

## 2. Duyệt hình ảnh Cổng 3 (`preview/scp096-vs-medusa-sheet.jpg`, Neon-4 + Boss)
- **Tạo hình kinh dị mới (`tools/anim/rigs.js`):**
  - `SCP-096`: giải phẫu gù lưng với 6 đốt sống nhô, 7 xương sườn cong, bụng hóp sâu, tay dài quá khổ (~430 px) 5 móng rớm máu, hốc mắt đen sâu, hàm xé dọc 4× với 15 răng lởm chởm & máu chảy ròng xuống ngực, hiệu ứng hóa đá granite (`stone: 0..1`) & nứt đỏ lộ sọ trắng bất tử (`crack: 0..1`).
  - `Medusa`: mặt điêu khắc Hy Lạp cổ điển hốc mắt sâu, vương miện **16 con rắn sống 2 tầng có vảy/mắt sáng/lưỡi chẻ**, cánh vàng 10 lông chính + khớp gãy `wingDmg`, móng đồng rèn, đuôi rắn cuộn có vảy & áo chiton Hy Lạp.
- **Hook & Mở truyện có bối cảnh (`0–3 s` & `21.16–36.35 s`):** Hiển thị rõ mạch nguyên nhân → kết quả trước khi đánh: lính chạy nạn cầm ảnh 4-pixel trốn vào phế tích → Medusa lướt ra hóa đá anh ta thành tượng vẫn cầm ảnh → 096 gào thét phá tường lao vào → khựng lại trước bức tượng rồi khóa mắt trực diện với Medusa.
- **Toàn bộ 4 lỗi căn khung từ bản duyệt `Neon-4` đã sửa dứt điểm:** Shot #1 (lộ mặt Medusa sạch), Shot #11 (vương miện rắn nằm gọn dưới bảng tên), Shot #38 (`FROM THE SKY` slam giữa khung), Shot #41 (`GORGON STARED` cận móng vuốt máu đe dọa thẳng trên đỉnh đầu rắn Medusa), Shot #49 (hậu trận tách sạch khung).

**Kết luận Cổng 3 (v2): PASS.**
