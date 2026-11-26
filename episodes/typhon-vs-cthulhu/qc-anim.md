# QC Report · Tập #004 · TYPHON vs CTHULHU (Bản Nâng Cấp 30 FPS · Titan Rigs · Story Hook)

## 1. Thông số kỹ thuật đầu ra
- **Video Master Full HD**: `/home/antigravity/kwuangyong/horror-short/episodes/typhon-vs-cthulhu/typhon-vs-cthulhu.mp4` (**55.8 MB**, 1080×1920, **30 FPS** / 3.015 frames, H.264 `yuv420p` CRF 20, AAC 192 kbps)
- **Video Web Full HD (< 20 MB)**: `/home/antigravity/kwuangyong/horror-short/episodes/typhon-vs-cthulhu/typhon-vs-cthulhu-1080p-web.mp4` (**16.3 MB** / 17.1 MB thập phân, 1080×1920, **30 FPS**, H.264 `yuv420p` 1292k, AAC 128 kbps — đạt chuẩn `< 19 MB` phát/tải trực tiếp)
- **Video preview 608p**: `/home/antigravity/kwuangyong/horror-short/episodes/typhon-vs-cthulhu/preview/typhon-vs-cthulhu.mp4` (**10.1 MB**, 608×1080, **30 FPS**)
- **Contact sheet 5×4**: `/home/antigravity/kwuangyong/horror-short/episodes/typhon-vs-cthulhu/preview/typhon-vs-cthulhu-sheet.jpg` (296 KB — đã kiểm tra thị giác đủ 20/20 khung)
- **Thời lượng**: **100.52 s** (`timeline.json`: 100.92 s, trong mục tiêu 95–115 s)
- **Âm lượng chuẩn hóa (EBU R128)**: **−14.2 LUFS** (đạt chuẩn `−14 LUFS ± 1 LU`)
- **Số cảnh & FX**: **60 shots** · **51 cues** · **110 hiệu ứng FX** có lớp lang (nạp chiêu → phóng chiêu → va chạm `impact`/`sparks`/`smoke`/`dust`/`soil`/`ripple`/`glint`/`tints`, `slow-mo` + `crash-zoom`, `flash` kiểm soát `amp ≤ 0.75` không chói trắng)

## 2. Kết quả kiểm tra tự động
- **`render.js --check` (Luật 180 độ)**: **`180-RULE OK`** (Typhon TRÁI, Cthulhu PHẢI xuyên suốt mọi cảnh đối đầu)
- **`tools/anim/validate.js`**: **`0 FAIL · 2 WARN · 26 PASS`**
  - **PASS**: Không HUD/HP, không ROUND, đủ Story Hook trước Split-Roll (`WHO SURVIVES?` + `glitch` tại 11.4 s), đủ 3 split-roll (dive L + dive R + 2 emerges + VS/CTA), đủ 2 intro lãnh địa (Etna & R'lyeh), **2 màn `beam-clash`** (giữa trận `winAt: 0.85` & kết liễu `winAt: 2.05` tính offset tương đối từ `t0`), cột rắn lửa `serpent-coils` trồi từ biển siết Cthulhu, `fisherman` rời khung hình suốt 1v1 (chỉ 1 insert ngắn), 236 từ kịch bản.
  - **WARN** (chấp nhận theo brief): thời lượng 100.92 s (mục tiêu 95–115 s) và một số shot thoại dài > 3.2 s.

## 3. Cấu trúc Mở đầu (Story Hook) & Đoàn tàu đánh cá
- **0–11.4 s Story Hook (trước Split-Roll)**:
  1. Biển đêm không trăng: **đoàn 2 tàu đánh cá (trawler)** vỏ sắt/gỗ dày, cabin lái phát sáng vàng ấm, cần cẩu treo lưới, đèn pha quét mặt nước, cùng **4 ngư dân** áo mưa vàng/xanh đậm, mũ thủy thủ, cầm đèn pin/kéo lưới trên boong.
  2. Biển đột ngột sôi sục dung nham — **Typhon thức tỉnh bão lửa tiến vào đất liền** đe dọa nuốt chửng đoàn tàu.
  3. Chấn động đánh thức **6 con mắt xanh lục khổng lồ của Cthulhu** bừng sáng ngay dưới lườn tàu trong làn nước sâu → slam **`WHO SURVIVES?`** + `glitch` chuyển vào **Split-Roll**.
- **Sau VS**: Cthulhu chắn đòn bão lửa đầu tiên, tạo sóng đẩy đoàn tàu cùng ngư dân trượt vào bờ đá an toàn → trận 1v1 ác liệt 110 FX → hậu cảnh ngư dân (*"Go home, sailors. Do not sail when the stars align."* / *"…Are we safe?"*) → cú lửng 3 nhịp (*"The stars are almost right."*).

## 4. Đại tu Rig Titan (`tools/anim/rigs.js`, `tools/anim/stage.js`)
- **Rig `typhon`** (theo `/home/antigravity/image_2.png`): Hộp sọ ác thần góc cạnh + cặp sừng quỷ uốn cong lớn + bờm khói lửa + hàm nanh gầm rú; thân cơ bắp đá bazan nứt **mạch dung nham hữu cơ rực sáng**; **12 cổ/đầu rồng khớp động** có sừng & vảy + **4 đầu rắn tầng dưới**; **đôi cánh bão lửa rách nhiều tầng** rực lửa ở rìa; thân dưới **cuộn rắn khổng lồ có vảy S-curve**; tay móng vuốt lửa nắm cầu dung nham.
- **Rig `cthulhu`** (theo `/home/antigravity/image.png`): Hộp sọ bạch tuộc hữu cơ có gân nổi & gờ chân mày sâu dữ tợn; **6 con mắt xếch sáng rực xanh lục** (3 cặp); **16 xúc tu Bezier thuôn dài 3 tầng sâu** có đốm giác hút & viền ướt ngọ nguậy mượt ở 30 FPS; thân vảy titan cơ bắp + mạch năng lượng xanh lục; **đôi cánh dơi rồng khung xương rách vỏ sò** rộng lấn màn hình; bàn tay 5 móng vuốt cong sắc nhọn; chế độ tan/tái tạo sương lục.
- **Rig `fisherman`** (mới): Ngư dân mặc áo mưa dầu vàng, mũ sou'wester, râu phong sương, ủng đi biển, đèn pin rọi ngang phía trước; đủ action `idle`, `haul`, `idle-scared`, `run`, `cower`, `peek`, `talk`, `fade`.

## 5. Âm thanh & Phụ đề động (`audio-anim/`)
- **Giọng Blend đa tầng (`make_voice.py`, `post_voice.py`)**: Giữ nguyên công thức blend đa tầng cho `narrator`, `typhon`, `cthulhu`, `cthulhu_whisper`, bổ sung giọng `fisherman` khàn thì thầm (`"…Are we safe?"`), kèm vòng lặp retry chống timeout `edge-tts`.
- **Nhạc nền & SFX (`make_music.py`)**: Trống 128 BPM, bão biển, tiếng gầm trăm đầu, 2 pha beam-clash, **cắt nhạc phụt hoàn toàn tại 93.61 s** trước cú lửng sao thẳng hàng.
- **Phụ đề động (`captions-dyn.ass`)**: 236 từ, 19 từ khóa nhấn màu, 43 dòng tự động dời vị trí tránh che mặt.
