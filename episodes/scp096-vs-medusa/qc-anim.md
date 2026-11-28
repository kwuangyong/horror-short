# QC Animation · Episode #007 (`scp096-vs-medusa`)

## 1. Kiểm tra tự động
- `node tools/anim/validate.js episodes/scp096-vs-medusa/anim/timeline.json --script episodes/scp096-vs-medusa/script-anim.md`: **0 FAIL · 3 WARN · 25 PASS**
  - `WARN shots longer than 3.2 s at 18.6` (vùng chuyển cảnh emerge R → VS)
  - `WARN intro GUARDIAN 7.8 s (target ~5-6.5 s)` (lời giới thiệu Medusa đọc chậm, kịch tính)
  - `WARN could not find a kid actor or 1v1 fx window` (chủ đích không dùng kid như tập #005–#006 để giữ tông Anti-Guardian vs Monster thuần túy)
- `node tools/anim/render.js --timeline episodes/scp096-vs-medusa/anim/timeline.json --check`: **`180-RULE OK`**
- Thời lượng: **96.70 s** (đạt chuẩn 85–100 s) · Số cảnh: **52 cảnh** (đạt chuẩn 50–60 cảnh) · Loudness: **≈ −14.2 LUFS** · 24 FPS · 1080×1920.

## 2. Duyệt hình ảnh Cổng 3 (`preview/scp096-vs-medusa-sheet.jpg`)
- **Hook (`0–3 s`):** Khung `beam-clash` thật + `"WHO SURVIVES?"` + tua ngược `glitch` rõ nét.
- **Split-Roll + 2 Intro:** Khóa `SCP-096` TRÁI (buồng giam tối, ảnh 4-pixel, hàm xé rộng) → khóa `MEDUSA` PHẢI (đền sương xanh, cánh vàng, tóc rắn sống, mắt `glint`) → `VS` + `"WHO WINS? COMMENT"`. `pillar` intro 0.75 s không che mặt.
- **Góc camera mở rộng:** Đã áp dụng trọn bộ `high`, `low`, `follow`, `cu`, `ecu` (`eye`/`mouth`/`claw`/`snake`), `versus`, `wide`, `insert`, `dutch`, `hand`, `whip`, `slow-mo` + `crash-zoom`.
- **Chiến đấu & Kết lửng C2:** Quá trình hóa đá `stone: 0 -> 1` và cú lửng nứt hàm đá lộ khung xương trắng bất tử (`crack: 0 -> 1`) hiển thị sắc nét, phụ đề động né mặt sạch sẽ, không HP/ROUND/ảnh tĩnh.

## 3. Tài sản & bản quyền
- **SCP-096:** Rig flat-vector tự thiết kế mới trong `tools/anim/rigs.js`, kèm credit **CC BY-SA 3.0** (Dr Dan, SCP Wiki).
- **Medusa:** Rig flat-vector tự thiết kế theo bản gốc Hy Lạp (Pseudo-Apollodorus *Bibliotheca* 2.4.2, Public Domain).
- **Nhạc & SFX:** Tổng hợp 100% bằng Python (`audio-anim/make_music.py`), không dùng file bên thứ ba.

**Kết luận Cổng 3: PASS.**
