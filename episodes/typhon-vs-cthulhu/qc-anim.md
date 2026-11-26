# QC Report · Tập #004 · TYPHON vs CTHULHU (Cổng 3)

## 1. Thông số kỹ thuật đầu ra
- **Video chính**: `/home/antigravity/kwuangyong/horror-short/episodes/typhon-vs-cthulhu/typhon-vs-cthulhu.mp4` (35 MB, 1080×1920, H.264 `yuv420p`, AAC 192 kbps)
- **Video preview**: `/home/antigravity/kwuangyong/horror-short/episodes/typhon-vs-cthulhu/preview/typhon-vs-cthulhu.mp4` (11 MB, 608px)
- **Contact sheet 5×4**: `/home/antigravity/kwuangyong/horror-short/episodes/typhon-vs-cthulhu/preview/typhon-vs-cthulhu-sheet.jpg`
- **Khung hình mốc Cổng 3 (11 PNG)**: `/home/antigravity/kwuangyong/horror-short/episodes/typhon-vs-cthulhu/preview/frames/` (`0.5s, 6.0s, 14.5s, 19.3s, 28.5s, 35.5s, 47.5s, 60.5s, 77.0s, 94.0s, 98.5s`)
- **Thời lượng**: **100.18 s** (trong mục tiêu ~95–115 s của brief)
- **Âm lượng chuẩn hóa (EBU R128)**: **−14.2 LUFS** (đạt chuẩn `−14 LUFS ± 1 LU`)
- **Số cảnh (shots)**: **56 shots** (Sakuga cuts, mỗi shot đều có `push`/`pan`, có `slow-mo` + `crash-zoom` ở đòn kết)

## 2. Kết quả kiểm tra tự động
- **`render.js --check` (Luật 180 độ)**: **`180-RULE OK`** (Typhon TRÁI, Cthulhu PHẢI xuyên suốt mọi cảnh đối đầu)
- **`tools/anim/validate.js`**: **`0 FAIL · 3 WARN · 25 PASS`**
  - PASS: Không HUD/HP, không ROUND, đủ 3 split-roll (dive L + dive R + 2 emerges + VS/CTA), đủ 2 intro territory (`low > cu > ecu > wide`, pillar 0.75 s), đủ `beam`/`beam-clash`/`orbs`/`slash`/`pillar`, có `cinema` letterbox + `embers` + `slow-mo`/`crash-zoom` + `whip-pans`, cậu bé ẩn suốt 1v1 (chỉ 1 insert ngắn ≤ 2.0 s), 237 từ kịch bản.
  - WARN (chấp nhận theo brief người dùng): thời lượng 100.6 s (người dùng cho phép ~95–115 s), 5 shot dài hơn 3.2 s do thoại dài, và cờ `(story)` trong script.

## 3. Âm thanh & Giọng Blend (`audio-anim/`)
- **Giọng blend đa tầng (`make_voice.py`)**:
  - `narrator`: `en-US-ChristopherNeural` (+12%, −10 Hz) mix 3 tầng (giọng chính trầm + lớp bóng trầm −3.5 st + lớp không gian + echo tối).
  - `typhon`: `en-US-GuyNeural` (+8%, −20 Hz) mix 5 tầng (trầm chính + lớp rít crunched + sub-volcanic −6 st + tiếng ầm núi lửa + vọng hang dung nham).
  - `cthulhu` & `cthulhu_whisper`: `en-GB-RyanNeural` (+6%, −22 Hz / −24%, −16 Hz) mix 3 tầng (trầm sâu đáy biển + lớp sub −8 st + rung tâm linh tremolo + vọng thánh đường dưới nước).
  - `kid`: `en-US-AnaNeural` (−18%) thì thầm trẻ em.
- **Nhạc nền & SFX (`make_music.py`)**: Trống chiến đấu 128 BPM, nền bão biển, SFX beam-clash, núi lửa phun, sóng thần, cột đá R'lyeh trồi lên, tiếng gầm trăm đầu, và **cắt nhạc phụt hoàn toàn tại 93.27 s** (trước cảnh #58 sao thẳng hàng và câu thì thầm cuối).
- **Phụ đề động**: `make_captions.py` + `captions_dyn.py` (237 từ, 17 từ khóa nhấn màu, 42 dòng tự động dời vị trí tránh che mặt ở cảnh `cu`/`ecu`/`low`).

## 4. Rig & Cảnh mới (`tools/anim/rigs.js`, `tools/anim/stage.js`, `anim/make_timeline.js`)
- **Rig `typhon`**: Thân tro núi lửa rạn mạch dung nham, 8 cổ/đầu rồng khớp động mọc từ vai + đầu chính có sừng & hàm gầm, nửa dưới cuộn rắn obsidian uốn lượn, cánh đen viền tàn lửa, đủ 15 action.
- **Rig `cthulhu`**: Đầu bạch tuộc phồng + 7 xúc tu mặt uốn lượn + 4 mắt xanh lục phát sáng, thân vảy xanh lục ướt, cánh dơi hẹp dài, móng vuốt lớn, hiệu ứng tan/tái tạo sương lục (`disperse-mist` / `reform-mist`), đủ 18 action.
- **3 không gian**: `domain-etna`, `domain-rlyeh`, `domain-ocean-storm` (kèm bờ đá bên phải, thuyền đánh cá có đèn lồng, cột dung nham trái, cột đá R'lyeh phải, dải sao thẳng hàng & mắt xanh lục dưới nước ở cuối).
