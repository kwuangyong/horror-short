# 07 · Kinh thánh "Battle Spin": Monster vs Guardian

Luật **bắt buộc** cho mọi tập chính thức (bản đầy đủ 2026-11-26). Brief từng tập chỉ ghi phần riêng: cặp đấu, tổ hợp biến thể ([docs/08](08-he-thong-bien-the.md)), sức mạnh có nguồn. Nhân vật lấy từ [docs/09](09-kho-nhan-vat.md). Tập mẫu chuẩn: **`episodes/apep-vs-thor/`**.

Mục lục: 1 Engine · 2 Nhịp tập theo giây · 3 Mở đầu & intro · 4 Cốt truyện guardian vs monster · 5 THE KID · 6 Thoại nhân vật · 7 Kết lửng · 8 Tạo hình · 9 Animation · 10 Hoạt họa sức mạnh · 11 Camera & continuity · 12 Âm thanh & tempo · 13 Phụ đề & chữ · 14 Kiểm tra tự động · 15 Phạm vi nhân vật · 16 Tập tham chiếu

---

## 1. Engine hoạt ảnh động thật (cấm ảnh tĩnh)
- 100% tập dựng bằng **engine khớp xương SVG** `tools/anim/`: `rigs.js` (nhân vật) · `stage.js` (cảnh, camera, shot, split-roll) · `sakuga.js` (đòn năng lượng, lãnh địa, địa hình trồi lên, thân khổng lồ, hào quang, letterbox) · `episode_kit.js` (dựng sẵn phần mở đầu chuẩn) · `render.js` (Playwright → mp4, `--check` luật 180°) · `validate.js` (kiểm tra luật) · `episodes/<slug>/anim/make_timeline.js` (timeline cắt theo mốc từ trong `words.json`).
- **CẤM**: ảnh tĩnh + Ken Burns, thanh HP, thẻ ROUND 1/2/3, khung game đối kháng, chữ K.O./WINNER kiểu game.
- Nhân vật chưa có rig → producer thêm rig vào `rigs.js` trước (turnaround + 3 pose khoe sức mạnh, Boss duyệt).

## 2. Nhịp tập theo giây (85–100 s, 50–60 cảnh)
| Đoạn | Thời điểm (mẫu 94 s) | Nội dung | Cảnh |
|---|---|---|---|
| **Hook** | 0 – 3 | Khoảnh khắc cao trào có thật giữa trận + "WHO SURVIVES?" + tua ngược glitch. Không lời dẫn | 3 |
| **Split-Roll + intro Monster** | 3 – ~10.5 | Quay → khóa MONSTER → zoom xuyên thẻ → lãnh địa Monster, tự giới thiệu ~5–6.5 s | 4–5 |
| **Intro Guardian** | ~10.5 – ~19 | Quay ra → khóa GUARDIAN → zoom xuyên thẻ → lãnh địa Guardian, tự giới thiệu ~5–6.5 s | 4–5 |
| **VS** | ~19 – 20 | VS + "WHO WINS? COMMENT" → nổ tung vào truyện | 1 |
| **Mở truyện (E)** | 20 – ~28 | Bé ở chiến trường (bị gọi / đi lạc / trốn tìm…), monster xuất hiện, tấn công bé | 5–6 |
| **Guardian chắn + bé chạy** | ~28 – ~34 | Guardian giáng xuống chắn đòn đầu → **cảnh riêng bé chạy ra khỏi khung** → cảnh rộng định vị đối đầu | 3–4 |
| **Trận 1v1 (A)** | ~34 – ~66 | 3 nhịp theo ô A (mục 4); mỗi bên khoe ≥ 3 sức mạnh, mỗi lần là chuỗi 2–4 cảnh; địa hình monster trồi lên; 1 lần cắt về chỗ nấp khi có biến cố (B) | 22–26 |
| **Đòn kết** | ~60 – ~66 | Mẹo lore + đòn quyết định (`beam-clash` thắng, slow-mo + crash-zoom) | 3–4 |
| **Hậu trận + thoại cuối** | ~66 – ~85 | Bé trở về (theo B), guardian ↔ bé 2–3 câu | 4–6 |
| **Kết lửng (C)** | ~85 – hết | Nhạc tắt phụt → hình monster/hậu quả lộ diện → câu thì thầm → CTA | 2–3 |

## 3. Mở đầu & 2 màn tự giới thiệu (dựng bằng `episode_kit.opening()`)
| # | Đoạn | Luật |
|---|---|---|
| 1 | **Hook 0–3 s** | *In medias res*: lấy khung có thật trong trận (`beam-clash` đụng độ, đòn siết chí mạng, lưỡi chém xuyên màn…), 2–3 cảnh động (cu → ecu → low), letterbox + tàn lửa. Chữ **"WHO SURVIVES?"** slam ~1 s trước khi hết hook, rồi **tua ngược glitch** + flash. |
| 2 | **Split-Roll** | Hai cột `MONSTER` (TRÁI, máu nhỏ giọt) \| `GUARDIAN` (PHẢI, hào quang vàng) quay nhanh (`spin`). Khóa trái: văng máu + rung. Khóa phải: lóe sáng + rung. |
| 3 | **Intro Monster ~5–6.5 s** | `dive` xuyên thẻ trái → **lãnh địa riêng** (`domain-<key>`, motif + màu theo lore) → `pillar` chớp ≤ 0.75 s lúc cắt vào (đặt lệch, không che mặt) → **2–4 góc máy động `low` → `cu` → `ecu` (+ `wide`)** → bảng danh hiệu (TÊN + dòng nguồn gốc) → monster tự giới thiệu (mục 6.1). Monster khổng lồ: lãnh địa phải cho thấy quy mô. |
| 4 | **Intro Guardian ~5–6.5 s** | `emerge` ra khỏi thẻ trái (trái giữ `locked`) → cột phải quay, khóa → `dive` xuyên thẻ phải → lãnh địa guardian, cùng cấu trúc, hào quang sáng, mắt `glint`. |
| 5 | **VS** | `emerge` về Split-Roll đã khóa cả hai → **VS** slam + **"WHO WINS? COMMENT"** (CTA duy nhất của mở đầu) → `shatter` vào truyện. Phụ đề intro phải kết thúc trước mỗi `emerge` (`captions_dyn.py --cut`). |

## 4. Cốt truyện: guardian vs monster
**Tiền đề**: một đứa bé lạc vào nơi monster ngự trị; monster nhắm vào bé; guardian xuất hiện bảo vệ; hai bên đánh nhau bằng **sức mạnh có nguồn**; kết lửng.

**Luật xung đột**
- Chọn cặp có **xung đột lore tự nhiên** (kẻ giết rắn vs rắn; chó canh mộ vs xác sống; ánh sáng vs ma đêm). Lý do ghép phải viết được trong 1 câu ở brief.
- **Guardian không bất bại**: luôn có **giới hạn có nguồn** (nọc rắn, cần găng sắt, chỉ mạnh ở ngưỡng cửa, ngủ khi nghe nhạc…). Monster lật kèo bằng chính giới hạn đó.
- **Monster không ngu**: nó thắng ít nhất 1 nhịp bằng sức mạnh thật, đe dọa bé thật.
- **Thắng bằng lore, không bằng may**: đòn quyết định phải dựa trên **điểm yếu đã cài từ trước bằng lời hoặc hình** (bia khắc, câu dẫn, prop xuất hiện sớm). Chi tiết sáng tạo dẫn chuyện ghi *"(story)"*.
- **3 nhịp trận** (theo ô A docs/08), mỗi nhịp có 1 cú đảo:
  1. **Thử sức**: mỗi bên khoe sức mạnh đầu tiên (chuỗi 2–4 cảnh mỗi bên).
  2. **Lật kèo / áp đảo**: bên yếu thế bị dồn (giới hạn guardian lộ ra, hoặc monster bị thương); địa hình monster trồi lên; biến cố số phận của bé (B) xảy ra ở đây.
  3. **Đòn quyết định**: mẹo lore + đòn lớn nhất tập (`beam-clash` hoặc chuỗi `pillar`→`beam`), slow-mo + crash-zoom.
- **Tôn trọng nguồn**: không chế giễu thần/tín ngưỡng; guardian thua (A3) phải thua có danh dự.

## 5. THE KID
| Luật | Chi tiết |
|---|---|
| Vai trò | Chỉ là **bối cảnh và lý do để đánh**: không thẻ, không HP, không lời dẫn xoay quanh bé. Gọi "a kid / the kid / they". |
| Ngoại hình cố định | Tóc rối sẫm (không trùm mũ), mắt to, pyjama sọc rộng, khăn quàng đỏ, giày đỏ, đèn pin to quá khổ, giới tính trung tính. |
| Giải phóng sân đấu | Ngay sau khi guardian **chắn đòn đầu tiên**: **1 cảnh riêng bé quay lưng chạy vút ra khỏi khung** (`kit.kidFlee`), nấp sau vật cản ở xa. Sau đó **ẩn hoàn toàn** khỏi khung chiến trường (actor `vis`) suốt 1v1. |
| Cắt về chỗ nấp | Chỉ khi có **đòn lạc / biến cố số phận** (ô B) và **lúc kết trận** (`insert`/`wide`, mỗi lần ≤ 3 s). |
| An toàn tuyệt đối | Không bao giờ có máu trên người bé. Bé gặp nạn (B2/B3) chỉ bằng ẩn ý: đèn pin lăn rồi tắt phụt, tay buông, cát sụt, chớp trắng. |

## 6. Thoại nhân vật
Ngôn ngữ: tiếng Anh. Cú pháp trong `script-anim.md`: `> (apep's voice, layered hiss) …` / `> (thor's voice, deep boom) …` / `> (kid's voice) …` (đúng regex `tools/narration.py`).

**6.1 Màn tự giới thiệu (ngôi thứ nhất, 12–18 từ)**: công thức **"Tôi là ai → nguồn gốc / chiến tích có nguồn → đe dọa hoặc thề bảo vệ"**.
- Monster: *"I am Apep, serpent of chaos. Each night I devour the sun. Tonight, I devour you."*
- Guardian: *"I am Thor, son of Odin. I hooked the World Serpent. Crawl back, worm."*
- Câu cuối của intro monster **nhắm vào người xem/bé**; câu cuối của guardian **thách thức monster**.

**6.2 Trong trận (tùy chọn, tối đa 1 câu mỗi bên, ≤ 6 từ)**: câu khiêu khích hoặc hô tên chiêu đúng lore ("Mjölnir!", "Bow, worm."). Đặt ở cú đảo nhịp 2 hoặc ngay trước đòn quyết định. Lời dẫn vẫn là chính.

**6.3 Thoại cuối (sau trận)**: guardian 1–2 câu với bé, giọng mệt/khàn hoặc trang nghiêm, chứa **một lời dặn liên quan lore** (gài cho cú lửng): *"Go home, little one. Never sleep under a dark sun."* Bé đáp **1 câu rất ngắn** (≤ 3 từ, thì thầm): *"…Okay."* Không thoại cuối nếu ô B là mất tích (B4).

**6.4 Câu thì thầm kết lửng**: monster (hoặc giọng bí ẩn) **≤ 5 từ**, khô, sát tai, ngay sau khi nhạc tắt: *"I always come back."*

**6.5 Giọng**: mỗi nhân vật một giọng **đa tầng** khác nhau rõ (mục 12). Lời dẫn: ngôi thứ ba, giọng bình luận viên trận tử thần, kể liền mạch (but, so, until, then, as…), câu 6–14 từ, mỗi câu ≤ 1 từ khóa `*...*`.

## 7. Kết lửng
- Theo ô **C** (docs/08). Luật vàng: dựa trên **điều kiện lore có thật**, đã được **cài từ trước** (lời dẫn, intro, prop, thoại cuối của guardian).
- **Lộ diện bằng hình**: monster hoặc hậu quả phải hiện rõ trên màn (mắt mở dưới cát, bóng sai hình, tay trồi lên, cửa sổ, gương…), không chỉ là âm thanh.
- **Cấu trúc 3 nhịp**: (1) bình yên giả (cảnh rộng, ánh sáng trở lại / hôm sau) → (2) **nhạc tắt phụt** + dấu hiệu nhỏ (cát thở, gõ cửa…) → (3) hình lộ diện + **câu thì thầm ≤ 5 từ** + CTA nhấp nháy.
- CTA đi theo C: "Is it really dead?" · "Did the kid survive?" · "Who should fight it next?" · "Would you let it in?"
- Không dùng C trùng 3 tập liền (registry).

## 8. Tạo hình
**Phong cách chung**: flat-vector, không viền, khối hình rõ, nền tối có ánh trăng/ánh lửa, máu ở mức hoạt hình.

| | Guardian | Monster |
|---|---|---|
| Cảm giác | Năng lượng, thần thánh, vững chãi | Kinh dị, bệnh hoạn, bất ổn |
| Shape | Khối vững, đường cong mạnh, đối xứng | Tam giác, gai nhọn, **bất đối xứng** (tay dài, xúc tu, đốt xương, miệng xé tới mang tai) |
| Ánh sáng | `rim` sáng rõ + `aura` 2–3 lớp màu theo nguồn (Hy Lạp vàng–trắng, Bắc Âu xanh băng–trắng, Ai Cập vàng kim–lam, Slav lửa cam, Celtic bạc–xanh trăng, Nhật trắng–đỏ son) | `aura` màu bệnh hoạn (xanh độc, tím, đỏ máu) + `rim` đủ để không chìm vào nền tối |
| Mắt | Lóe vệt sáng (`glint`), luôn đọc được ở cảnh cận | Phát sáng dị dạng (đồng tử dọc, xoáy thôi miên) hoặc đen kịt |
| Chi tiết | Ký hiệu / rune / phù chú phát sáng khi dùng sức mạnh | Gân sáng, vết nứt, nhầy, vết chém cổ |
| Nguồn | Theo văn bản gốc (Thor râu đỏ theo Edda), **không lấy thiết kế phim/game** (Marvel, God of War, Universal…) | Như vậy |

**Quy mô**: monster có lore khổng lồ (rắn thế giới, rồng, titan, Kraken, Cthulhu…) phải **áp đảo khung hình**: guardian cao ~1/4–1/5 monster khi nó vươn lên; **thân monster thành địa hình chiến trường** (`serpent-coils`: vòng thân/xúc tu trồi lên khỏi đất và lặn xuống từ tiền cảnh tới chân trời, có sương xa); nhiều góc thấp nhìn lên đầu monster và cảnh rộng cực xa. Monster cỡ người giữ cỡ người. **Mặt guardian không bị che** trong cảnh siết/cắn (`coilLift`, `headRot`).

**Ngoại lệ an toàn**: monster hình trẻ con → kinh dị bằng mắt, da, tư thế; không máu.

## 9. Animation (nguyên tắc chuyển động)
- **Mọi nhân vật luôn chuyển động**: idle có thở/đung đưa; không pose đứng im quá 1 cảnh.
- **Anticipation → action → follow-through**: mỗi đòn có lấy đà (0.2–0.4 s), ra đòn nhanh (0.1–0.2 s), dư âm (tóc/râu/áo choàng/đuôi đung đưa 0.3–0.6 s).
- **Impact frame**: lúc trúng đòn = `flash` 0.1–0.15 s + `shake` + `impact`/`sparks` + nhân vật bị đẩy lùi (recoil/stagger), có thể `freeze` 2–4 khung.
- **Bộ action tối thiểu của rig**: guardian `idle, land-hero, walk/run, attack (throw/swing), power-up, block, hurt/stagger, kneel, talk`; monster `idle, rise/appear, strike, special (gaze/coil/breath), roar, hurt/recoil, sink/defeat, talk`; bé `sleep, wake, walk, run, cower, peek, look-up, talk`.
- `talk` mở miệng theo biên độ giọng (`voice`), không để miệng đứng yên khi đang nói.
- Đổi pose mượt bằng `blend` (0.15–0.25 s); đòn mạnh dùng ease `out`/`outBack`; rơi/ngã dùng `in`.
- Pose override (`pose:{}` theo actor/cue) để tăng `eyeGlow`, thêm `venom`, đổi tư thế mà không cần action mới.

## 10. Hoạt họa sức mạnh (chuỗi 2–4 cảnh)
Mỗi sức mạnh có nguồn = 1 chuỗi **chuẩn bị → kích hoạt → tác động → hậu quả** (dùng `kit.chain`). Công thức theo loại:
| Loại sức mạnh | Chuẩn bị | Kích hoạt | Tác động | Hậu quả |
|---|---|---|---|---|
| **Tia / hơi thở / sét** | `cu` nạp năng lượng (charge orb, glint mắt) | `versus` `beam` bắn | `cu` mục tiêu trúng, `impact` + shake | `wide` khói/đất cháy, nạn nhân lùi |
| **Vũ khí ném (búa, giáo)** | `cu` vung tay lấy đà | `versus` + whip theo hướng bay, `slash` vệt cong | `cu` trúng, flash | `cu` vũ khí bay về tay (bắt + glint) |
| **Đạn cầu / bầy** | `low` monster gầm, cầu hình thành | `versus` `orbs` bay vòng cung, whip theo hướng | `cu` nổ liên hoàn | `wide` nạn nhân bị hất văng |
| **Lưỡi chém** | `cu` tư thế chém | `slash` xuyên màn, whip | `cu` vết cắt / tia lửa | `wide` địa hình nứt |
| **Thức tỉnh / buff** | `cu` chạm vật phẩm (đai, bùa) | `pillar` + `aura` tăng (`aura:[1,1.6]`) | `wide` sóng xung kích, cát/đá văng | `ecu` mắt lóe |
| **Ánh mắt / lời nguyền** | `ecu` mắt (xoáy, glint) | `cu` nạn nhân đông cứng | `wide` bị khống chế (siết/nhấc bổng) | `cu` cố chống cự |
| **Bắt giữ / siết** | `wide` thân/xúc tu lao tới | `coil-squeeze` | `cu` nạn nhân bị siết (mặt vẫn thấy) | thoát bằng flare năng lượng |
| **Địa hình / triệu hồi** | `low` dutch, đất rung | `rise` (`spire`/`monolith`/`serpent-coils`) | `wide` chiến trường biến dạng | `cu` đối thủ mất thăng bằng |
| **Đụng chưởng (đỉnh trận)** | cả hai nạp | `beam-clash` giằng co (`win`) | slow-mo + crash-zoom | nổ lớn, bên thua văng |
Quy tắc: whip-pan **bám hướng bay**; mỗi chuỗi ≥ 1 cảnh cận và ≥ 1 cảnh rộng; letterbox + embers bật trong hành động; `pillar` trong truyện ≤ 0.8 s trừ cảnh thức tỉnh lớn.

## 11. Camera & continuity
- **Một chiến trường duy nhất** cho truyện (scene `domain-<field>`); địa hình monster **trồi lên ngay trên đó** (track `rise`), không đổi phông giữa trận. Lãnh địa riêng chỉ ở 2 intro; cảnh khác chỉ cho mở truyện / kết lửng (cùng địa điểm, khác giờ: vd. `dusk`).
- **Không khung nào đứng máy**: mọi shot có `push` + `pan`. Nối trái ↔ phải bằng whip (`tr:{type:'whip',dir}`) theo hướng đạn; `follow`, `dutch` khi không gian biến dạng, `slow` + `crash` ở đòn kết. Chuyển động chữ ký PULL BACK / DOLLY ZOOM / CRANE + LAND theo [docs/10](10-camera-moves.md).
- **Trục 180°**: Monster luôn TRÁI, Guardian luôn PHẢI (`sides`); `render.js --check` phải in `180-RULE OK`.
- Sau 2–3 cảnh cận phải có 1 cảnh rộng định vị. Bé không bị che trong cảnh rộng (trước khi chạy đi).

## 12. Âm thanh & tempo (tempo vừa, dễ hiểu)
- Lời dẫn: edge-tts `en-US-ChristopherNeural` (`--proxy "$HTTPS_PROXY"`, host `speech.platform.bing.com`), pitch −10Hz, **rate +10–15% (mặc định +12%)**, nghỉ giữa câu **0.30–0.35 s**, rồi `tools/voice_fx.sh deep`. **Phương án offline / không có mạng**: Kokoro-82M blend `60% am_onyx + 40% bm_george` qua `tools/tts_kokoro.py --fx deep` (khi đó lấy mốc từng từ bằng `tools/transcribe_words.py`).
- Giọng nhân vật đa tầng, chậm hơn lời dẫn ~20%: **monster** = giọng chính hạ pitch + lớp thì thầm lệch ~40 ms + lớp rít/gầm méo + lớp bóng trầm; **guardian** = trầm vang + reverb sảnh + lớp sấm/gầm hợp lore (+ biến thể khàn khi bị thương); **bé** = giọng trẻ con thì thầm.
- Nhạc tổng hợp bằng code: drone + **trống chiến trận ~125 BPM**, ratchet khi Split-Roll quay, hit khi khóa thẻ / VS / va chạm, **SFX nạp + phóng plasma** khớp `beam`/`beam-clash`, whoosh cho ném/chém, rumble cho động đất; đỉnh trận = sub drop + trống tắt 1 ô nhịp; nhịp trống nền giữ căng ở đoạn cuối; **tắt phụt** trước câu thì thầm. Mix **−14 LUFS** (loudnorm 2 lượt + limiter), true peak ≤ −1 dBTP.
- **85–100 s**, **50–60 cảnh** (~1.6–1.8 s/cảnh), lời dẫn + thoại **~200–240 từ**.

## 13. Phụ đề & chữ trên màn
- `tools/make_captions.py --font "Bebas Neue" --size 92 --max-words 4 --max-chars 22`; không cụm nào vượt câu; từ khóa `*...*` tô đỏ.
- `tools/anim/captions_dyn.py captions.ass timeline.json out.ass --cut <emerge times>`: dời phụ đề xuống dải thấp ở `cu`/`ecu`/`reaction`/`low`; cắt phụ đề intro trước mỗi `emerge`.
- Chữ trên màn chỉ gồm: "WHO SURVIVES?", bảng danh hiệu 2 intro, "VS", "WHO WINS? COMMENT", CTA cuối. Không ROUND, không HP, không chữ giải thích.

## 14. Kiểm tra tự động (bắt buộc trước khi dựng toàn tập)
```bash
node tools/anim/render.js --timeline episodes/<slug>/anim/timeline.json --check
```
```bash
node tools/anim/validate.js episodes/<slug>/anim/timeline.json --script episodes/<slug>/script-anim.md
```
`--check` phải in `180-RULE OK`; `validate.js` phải **0 FAIL** (WARN thì Boss quyết ở Cổng 3). Validator kiểm: không HUD/ROUND, thời lượng, số cảnh, push/pan, hook + glitch, 3 instance split-roll (dive L, dive R, 2 emerge), VS + CTA, độ dài + góc máy + pillar của 2 intro, `sides`, số scene của truyện, đủ 5 loại fx, letterbox, embers, slow-mo + crash, whip, bé bị ẩn suốt 1v1, số từ, từ khóa, giọng nhân vật, cờ "(story)".

## 15. Phạm vi nhân vật
Theo [docs/09](09-kho-nhan-vat.md): nhân vật nổi tiếng trong thần thoại / truyền thuyết / truyền thuyết đô thị **phương Tây**, **Ai Cập cổ**, **Lưỡng Hà** + **Nhật Bản**. Không Việt Nam và châu Á khác; không nhân vật có bản quyền; không tín ngưỡng bản địa đang sống; không thiết kế từ phim/game.

## 16. Tập tham chiếu
- **`episodes/apep-vs-thor/` (tập #003 v2) = TẬP MẪU CHUẨN**: brief, research + bảng sức mạnh, kịch bản, âm thanh, timeline (`anim/make_timeline.js`), `build-anim.sh`, QC, review 3 cổng; preview 94 s. Khi tái dùng timeline: hàm `M()` quy đổi giây v1→v2; mốc lấy từ `sections.json`/`words.json` đã là giây hiện tại thì dùng `RAW = true`.
- `tools/anim/episode_kit.js`: dựng phần mở đầu chuẩn cho tập mới (khuyến nghị thay vì chép tay).
- `tools/anim/demo/sakuga_demo.js`: cấu trúc tối giản 26 s.
- `episodes/black-eyed-children-vs-cerberus/`, `episodes/vrykolakas-vs-church-grim/`: legacy, chỉ tham khảo lịch sử.
