# 07 · Format "Battle Spin": Monster vs Guardian (hoạt hình khớp xương, Sakuga Cinematic)

Luật chung **bắt buộc** cho mọi tập chính thức (cập nhật 2026-11-25, thay toàn bộ bản cũ). Brief từng tập chỉ ghi phần riêng: cặp đấu, tổ hợp biến thể ([docs/08](08-he-thong-bien-the.md)), sức mạnh có nguồn. Nhân vật lấy từ [docs/09](09-kho-nhan-vat.md).

## 1. Engine hoạt ảnh động thật (cấm ảnh tĩnh)
- 100% tập chính thức dựng bằng **engine hoạt ảnh khớp xương SVG** `tools/anim/`: `rigs.js` (nhân vật) · `stage.js` (cảnh, camera, shot, split-roll) · `sakuga.js` (đòn năng lượng, lãnh địa, hào quang, letterbox) · `render.js` (Playwright Chromium → mp4) · `episodes/<slug>/anim/make_timeline.js` (sinh timeline, cắt và cue theo mốc từ trong `words.json` bằng `timeline_words.js`).
- **CẤM**: ảnh tĩnh + Ken Burns (công cụ `render.py` cũ đã bị xóa), thanh máu HP, thẻ ROUND 1/2/3, khung game đối kháng. Chữ K.O. / WINNER chỉ dùng khi thật cần.
- Nhân vật chưa có rig → producer thêm rig vào `rigs.js` trước (turnaround + 3 pose khoe sức mạnh, Boss duyệt).

## 2. Mở đầu: Hook → Split-Roll → 2 màn tự giới thiệu ~5 s → VS
| # | Đoạn | Thời lượng | Luật |
|---|---|---|---|
| 1 | **Hook** | 0–3 s | *In medias res*: khoảnh khắc cao trào nhất giữa trận (vd. `beam-clash` hai luồng chưởng đụng độ, hoặc đòn bắt giữ chí mạng). Chữ **"WHO SURVIVES?"** (slam), letterbox, rồi **tua ngược glitch** (`glitch` + flash) để vào Split-Roll. Khung này phải có thật trong trận. |
| 2 | **Split-Roll quay** | ~1–1.3 s | Hai cột `MONSTER` (trái) \| `GUARDIAN` (phải) quay tốc độ cao (`spin`). |
| 3 | **Khóa MONSTER → intro Monster** | ~5 s | Khóa cột trái (văng máu) → **zoom xuyên thẻ** (`dive`, side `L`) → ẩn Split-Roll, mở cảnh toàn màn hình tại **lãnh địa riêng của Monster** (scene `domain-<key>`). Monster **tự giới thiệu ở ngôi thứ nhất** bằng giọng riêng đa tầng: nó là thực thể gì, nguồn gốc, quyền năng đáng sợ nhất. Có bảng danh hiệu (tên + dòng nguồn gốc), VFX năng lượng, **2–3 góc máy động `low` → `cu` → `ecu`**. `pillar` chỉ chớp ~0.75 s lúc cắt vào để không che mặt. |
| 4 | **Quay lại → khóa GUARDIAN → intro Guardian** | ~1.3 s + ~5 s | `emerge` ra khỏi thẻ trái (cột trái giữ trạng thái khóa `locked`) → cột phải quay rồi khóa (lóe sáng) → `dive` side `R` vào **lãnh địa riêng của Guardian**: tự giới thiệu tương tự, giọng riêng, bảng danh hiệu, hào quang. |
| 5 | **VS** | ~1.3 s | `emerge` về Split-Roll đã khóa cả hai → đập chữ **VS** + **"WHO WINS? COMMENT"** → nổ tung (`shatter`) vào câu chuyện. Đây là lời kêu gọi duy nhất ở phần mở đầu. |

Mẫu đầy đủ: [`tools/anim/demo/sakuga_demo.js`](../tools/anim/demo/sakuga_demo.js), thử `--check` với nó trước khi viết timeline tập mới.

## 3. Câu chuyện và THE KID
| Thành phần | Luật |
|---|---|
| **THE KID** | Chỉ là **bối cảnh**: không thẻ, không HP, không lời dẫn xoay quanh bé. Gọi "a kid / the kid / they". |
| **Ngoại hình bé** (cố định) | Tóc rối sẫm màu (không trùm mũ), mắt to, pyjama sọc rộng, khăn quàng đỏ, giày đỏ, đèn pin to quá khổ. Giới tính trung tính. |
| **Giải phóng sân đấu** | Ngay khi Guardian xuất hiện **chắn đòn đầu tiên**, bắt buộc có **1 cảnh riêng THE KID quay lưng chạy vút ra khỏi khung** (`follow` hoặc `wide`, nấp sau rặng đá / vật cản ở xa). Sau đó **ẩn hoàn toàn THE KID** khỏi khung chiến trường (actor `vis`) suốt màn 1v1. |
| **Cắt về chỗ nấp** | Chỉ khi có **đòn lạc / biến cố số phận** (bảng B) và **lúc kết trận**: cảnh `insert`/`wide` tới chỗ nấp xa. |
| **An toàn tuyệt đối** | Không bao giờ có máu trên người bé. Biến thể bé tử nạn rồi được cứu hồn (B2) chỉ thể hiện bằng ẩn ý: đèn pin lăn rồi tắt phụt, tay buông, chớp trắng. |
| **Thoại cuối** | Guardian nói 1–2 câu với bé (giọng trầm), bé đáp 1 câu rất ngắn (nếu tổ hợp B cho phép). |
| **Diễn biến + kết** | Theo tổ hợp A (trận) · B (bé) · C (kết lửng) trong docs/08. Cú lửng dựa trên điều kiện lore có thật, đã cài từ trước, **monster/hậu quả lộ diện bằng hình**. |

## 4. Phong cách chiến đấu "Sakuga Cinematic"
Trận đánh phải hoành tráng như phim điện ảnh / anime, phô diễn sức mạnh bằng **đòn năng lượng và va chạm động** (`tools/anim/sakuga.js`, kiểu `fx`):

| fx | Hình ảnh |
|---|---|
| `beam` | Đại pháo tia nhiều lớp: nạp năng lượng (cầu sáng + tia hội tụ) → hào quang ngoài + thân màu + lõi trắng rung + tia sét quấn dọc thân → nổ tại mục tiêu |
| `beam-clash` | Hai luồng đại pháo từ hai phía đụng độ giữa màn hình, cầu năng lượng giằng co đẩy qua lại, tia lửa, vòng sóng xung kích; `win:'L'\|'R'` đẩy hẳn về một phía rồi nổ |
| `orbs` | Loạt cầu năng lượng bay vòng cung có đuôi sáng, đuổi mục tiêu, nổ nhỏ khi trúng |
| `slash` | Lưỡi chém năng lượng bán nguyệt bay xuyên màn hình, có vệt mờ |
| `pillar` | Cột hào quang bùng thẳng lên trời khi tung chiêu / thức tỉnh. **Ở intro chỉ ~0.75 s** lúc cắt vào |
| `glint` | Mắt lóe vệt sáng (khóa vào marker `eye` của rig) |
| `cinema` | Dải đen điện ảnh trên/dưới trong các phân cảnh hành động |
| `embers` | Hạt tàn lửa bay khắp màn hình trong phân cảnh hành động |

**Tạo hình đối lập rõ** (chi tiết docs/08 mục H):
- **Guardian**: `rim` light sáng rõ trên nền tối, `aura` 2–3 lớp màu theo thần thoại gốc, ký hiệu/phù chú phát sáng, mắt lóe vệt sáng (`glint`), khối vững.
- **Monster**: tỉ lệ kinh dị bất đối xứng (tay dài, gai nhọn, xúc tu/đốt xương), gân sáng hoặc nhầy/máu mức hoạt hình, mắt phát sáng dị dạng, `aura` màu bệnh hoạn (xanh độc, đỏ máu, tím).

## 5. Continuity: chống rời rạc khung hình
- **Một chiến trường thống nhất duy nhất** cho toàn bộ màn 1v1 (một scene `domain-<field>` hoặc một scene có sẵn). Địa hình đặc trưng của Monster (cột đá R'lyeh, khe địa ngục, gai đá…) phải **trồi trực tiếp lên ngay trên bối cảnh chính** (prop `monolith`/`spire` với track `rise`), không cắt nhảy đổi phông giữa trận. Lãnh địa riêng chỉ dùng ở 2 màn tự giới thiệu.
- **Không khung hình nào đứng máy tĩnh**: mọi shot có `push` + `pan`. Nối trái ↔ phải bằng `whip-pan` (`tr:{type:'whip',dir}`) **bám theo hướng bay của đạn chưởng / lưỡi chém**, `follow` camera, `dutch` khi không gian biến dạng, `slow` (slow-mo) + `crash` (crash-zoom) ở đòn kết liễu.
- **Quy tắc trục 180°**: Monster luôn TRÁI, Guardian luôn PHẢI (`sides:{left,right}`). `node tools/anim/render.js --timeline … --check` phải in **`180-RULE OK`** trước khi dựng.
- Sau 2–3 cảnh cận phải có 1 cảnh rộng định vị.

## 6. Tempo vừa (cập nhật 2026-11-25: chậm hơn bản tempo vừa cũ ~20% để người xem kịp hiểu)
- Lời dẫn: edge-tts `en-US-ChristopherNeural` (`--proxy "$HTTPS_PROXY"`, host `speech.platform.bing.com` được mở), pitch −10Hz, **`rate +10%` đến `+15%`** (mặc định +12%), **khoảng nghỉ giữa câu 0.30–0.35 s**, rồi `tools/voice_fx.sh deep`.
- Giọng tự giới thiệu: mỗi nhân vật một giọng riêng **đa tầng** (2–3 lớp: giọng chính hạ pitch + lớp thì thầm lệch thời gian + lớp gầm/vọng), tempo chậm hơn lời dẫn một chút để nghe uy lực.
- Nhạc nền tổng hợp bằng code: **trống chiến trận ~125 BPM**, SFX **nạp / phóng tia plasma** (beam charge/fire) khớp mốc fx, hit ở mỗi lần khóa thẻ / VS / va chạm. **Ngắt nhạc đột ngột** trước câu thì thầm cú lửng cuối. Mix **−14 LUFS** (loudnorm 2 lượt + limiter).
- **Tổng thời lượng ~85–100 s**, **~50–60 cảnh**, trung bình **~1.6–1.8 s/cảnh**.
- Lời dẫn + thoại: ~200–240 từ (tùy độ dài 2 màn tự giới thiệu, mỗi màn ~12–16 từ). Kể liền mạch có từ nối (but, so, until, then, as…), câu 6–14 từ, mỗi câu ≤ 1 từ khóa `*...*`.

## 7. Sức mạnh có nguồn gốc
- Mỗi bên khoe **≥ 3 sức mạnh có nguồn truyền thuyết / văn học Public Domain** (kèm link nguồn trong `01-research-powers.md`).
- Mỗi lần khoe là **chuỗi 2–4 cảnh**: chuẩn bị → kích hoạt → tác động → hậu quả.
- Chi tiết sáng tạo thêm để dẫn chuyện phải ghi chú rõ là *"câu chuyện"* trong research và kịch bản, không trình bày như sự thật dân gian.

## 8. Phụ đề
- `tools/make_captions.py --font "Bebas Neue" --size 104 --max-words 4 --max-chars 24`; không cụm nào vượt câu.
- **Phụ đề động** `tools/anim/captions_dyn.py`: tự dời phụ đề xuống dải thấp (y≈1590) ở các cảnh cận `cu`, `ecu`, `reaction`, `low` để không đè mặt nhân vật. Khi letterbox bật, kiểm tra phụ đề không chui vào dải đen.

## 9. Chọn nhân vật
Theo [docs/09](09-kho-nhan-vat.md): chỉ nhân vật nổi tiếng trong thần thoại / truyền thuyết / truyền thuyết đô thị **phương Tây**, **Ai Cập cổ**, **Lưỡng Hà** + **Nhật Bản**. Không lấy Việt Nam và châu Á khác. Không lấy nhân vật có bản quyền, tín ngưỡng bản địa đang sống, hình ảnh từ phim/game.

## 10. Tập tham chiếu
- `tools/anim/demo/sakuga_demo.js` → `sakuga-demo.mp4`: mẫu đúng luật mới (hook, split-roll + 2 intro, VS, 1v1 một chiến trường, đủ 5 đòn, bé chạy đi nấp).
- `episodes/black-eyed-children-vs-cerberus/`: mẫu pipeline âm thanh (`audio-anim/`), `build-anim.sh`. Tập này dựng **trước** luật mới (chưa có intro lãnh địa, đòn chưởng), không lấy làm mẫu hình ảnh.
- `episodes/vrykolakas-vs-church-grim/`: tập lưu trữ (bản v6 còn HUD/ROUND), chỉ để tham khảo lịch sử.
