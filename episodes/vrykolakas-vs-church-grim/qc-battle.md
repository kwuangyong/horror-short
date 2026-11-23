# QC · BATTLE SPIN #001 · script-battle.md v2 (THE KID) · bản nháp

Build: `bash episodes/vrykolakas-vs-church-grim/build-battle.sh` (helper: `battle_gen.py`; dữ liệu trong `build/battle/`, project: `project-battle.json`).
Video đầy đủ: `build/battle/battle-draft.mp4` (1080x1920, 30fps, ~19 MB). Bản xem nhanh: `preview/battle-draft.mp4` (720p, ~5 MB). Contact sheet: `preview/battle-contact-sheet.png`.

| Hạng mục | Kết quả |
|---|---|
| Độ dài (ffprobe) | 100.47 s (đạt 95–105) |
| Loudness tích hợp | -14.1 LUFS (đích -14), LRA 15 LU (nhiều khoảng lặng/cú lửng, cố ý) |
| True peak | <= -1 dBFS (loudnorm TP -1) |
| Phụ đề | ASS `\pos(540,1344)` = 70% chiều cao (vùng 65–80%); size 80, tối đa 14 ký tự/dòng, cạnh phải dài nhất ~908 px < 918 (85%); không chạm 15% dưới (y > 1632) |
| Giọng | CHƯA CÓ. Timing ước lượng: mỗi khối lời dẫn chia đều theo số từ (~2.75 từ/s). Khi có voice.mp3 phải dựng lại captions từ words.json và canh lại độ dài từng khối |

## Ba lỗi Cổng 3 đã sửa
1. Thẻ trên nền placeholder: mọi thẻ (rule, limit, ROUND, fighter, K.O.) dùng nền cảnh đã làm tối 72% + blur và KHÔNG có nhãn placeholder; nhãn chỉ nằm trên cảnh thường (giữa khung, tránh vùng HUD và phụ đề).
2. Thẻ tên spin: chuỗi = 4 khung buồng quay mờ -> khung khóa (flash, 0.33 s) -> mới hiện thẻ FIGHTER 1/2 (1.0 s); không chồng lên dãy buồng.
3. Mix: nhạc nền (drone) tự hạ 75% quanh mỗi SFX lớn (ducking tính theo timeline), SFX tổng hợp dày hơn (thân + mid), nhạc tắt hẳn ở cú lửng, hạ còn 8% ở Round 3 (chỉ nhịp tim). Đo: cú gõ cuối đỉnh -1 dB ngay sau 1.5 s im lặng (-91 dB); slam/gầm đỉnh -1 dB.

## Thay đổi công cụ (tương thích ngược)
`tools/render.py`: thêm khóa tùy chọn `"overlay"` cho mỗi cảnh (PNG RGBA phủ SAU zoom/shake, không bị phóng/cắt). Dùng cho thanh máu HUD. Đã chạy lại `examples/ma-da/build_demo10.sh`: render 10 s OK.

## Yếu tố battle có trong bản nháp
HUD 3 thanh KID/GRIM/VRYKOLAKAS (overlay, có vệt "mất máu" vàng, thanh KID chớp ở 20%); thẻ THE KID HP 100%; FIGHTER 1/2; màn VS tam giác + POWER/SPEED/LORE + "WHO WINS? COMMENT" nhấp nháy; ROUND 1/2/3 đập xuống (zoom 1.7->1, shake, flash); khung đánh: shake + flash + zoom mạnh; K.O. + WINNER: THE KID + GRIM (KID 20 / GRIM 30 / VRY 0 đúng script); cú lửng (cliff cảnh, nhạc tắt, 1 tiếng gõ, cắt đen 0.7 s); CTA "IS IT REALLY DEAD?" -> "WHO'S NEXT?".

## Placeholder / rủi ro còn lại
- Toàn bộ ảnh cảnh là placeholder hình khối (shotlist-battle.md #1–#21, 22 ảnh gồm mascot sheet) + nhãn; thẻ vẽ bằng Pillow, nền thẻ là ảnh cảnh làm mờ -> thay ảnh thật thì dựng lại.
- Tất cả SFX/drone là tổng hợp (ffmpeg lavfi), chưa có asset nào cần giấy phép; 02-assets.md không có mục nào đang dùng trong bản này.
- Không có giọng; không có TTS nhân vật (bà Eleni, kid). Voice thật sẽ lệch timing ước lượng (khối Round 2 dài 33 từ trong ~12.5 s là khối dày nhất; Round 3 gồm 6 khối).
- Màn hình KO: HUD GRIM 75 -> 30 theo script (không có đòn nào giải thích trong lời dẫn); báo Boss nếu muốn thêm 1 đòn Vrykolakas vào Grim trong Round 3.
- "Mẹo ~0:19" trong script rơi ở ~0:25 trong bản dựng (lời dẫn đẩy dài hơn ước tính của script).
- Cảnh cliff ("one knock") đặt knock ở cuối khối; bản thật nên đồng bộ với giọng.
- LRA 15 LU cao do đoạn im lặng (cố ý).
