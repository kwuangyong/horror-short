# Horror Short · Battle Spin (Monster vs Guardian)

Sổ tay làm video kinh dị dọc tiếng Anh (TikTok / Reels / YouTube Shorts) theo format **Battle Spin**: hai vòng quay chọn ra **1 MONSTER** và **1 GUARDIAN** trong thần thoại / truyền thuyết; một đứa bé lạc vào lãnh địa của monster; guardian xuất hiện bảo vệ; hai bên đánh nhau bằng sức mạnh có nguồn gốc thật; kết lửng để kéo bình luận.

Toàn bộ video dựng bằng **engine hoạt ảnh khớp xương SVG** (`tools/anim/`, Playwright Chromium), do một **đội agent** sản xuất theo quy trình 3 cổng duyệt. Không ảnh tĩnh, không Ken Burns, không thanh HP, không thẻ ROUND.

▶ **Tập mẫu chuẩn #003 · APEP vs THOR (94 s):** [`episodes/apep-vs-thor/preview/apep-vs-thor.mp4`](episodes/apep-vs-thor/preview/apep-vs-thor.mp4)

![Khung hình tập #003](episodes/apep-vs-thor/preview/apep-vs-thor-sheet.jpg)

Luật đầy đủ: **[docs/07 · Kinh thánh Battle Spin](docs/07-format-battle-spin.md)** · biến thể: [docs/08](docs/08-he-thong-bien-the.md) · kho nhân vật: [docs/09](docs/09-kho-nhan-vat.md) · quy trình đội agent: [CLAUDE.md](CLAUDE.md).

---

## 0. Một tập trông như thế nào (85–100 s, 50–60 cảnh)

| Giây (mẫu 94 s) | Đoạn | Người xem thấy gì |
|---|---|---|
| 0–3 | **Hook** | Khoảnh khắc cao trào nhất giữa trận (Apep siết Thor) + chữ **"WHO SURVIVES?"** → tua ngược glitch |
| 3–10 | **Split-Roll + intro Monster** | Hai cột thẻ MONSTER \| GUARDIAN quay, khóa trái → zoom xuyên thẻ vào **lãnh địa của monster** → monster tự giới thiệu ngôi thứ nhất (~5–6 s) |
| 10–19 | **Intro Guardian** | Quay ra, khóa phải → zoom vào **lãnh địa của guardian** → guardian tự giới thiệu |
| 19–20 | **VS** | Hai thẻ đã khóa, chữ **VS** + **"WHO WINS? COMMENT"** → nổ tung vào truyện |
| 20–28 | **Mở truyện** | Đứa bé ở chiến trường, monster xuất hiện, tấn công bé |
| 28–34 | **Guardian chắn đòn + bé chạy đi** | Guardian giáng xuống chặn đòn đầu; **bé quay lưng chạy ra khỏi khung**, nấp ở xa |
| 34–66 | **Trận 1v1** | 3 nhịp: thử sức → lật kèo → đòn quyết định; mỗi bên khoe ≥ 3 sức mạnh có nguồn bằng đòn năng lượng |
| 66–85 | **Hậu trận** | Bé trở về (hoặc không), guardian nói với bé 1–2 câu |
| 85–94 | **Kết lửng** | Nhạc tắt phụt → monster/hậu quả lộ diện → câu thì thầm → "Is it really dead?" |

---

## 1. Chọn cặp đối đầu

**Phạm vi** ([docs/09](docs/09-kho-nhan-vat.md)): nhân vật **nổi tiếng** trong thần thoại / truyền thuyết / truyền thuyết đô thị **phương Tây** (Hy Lạp – La Mã, Bắc Âu, Celtic/Anh, Germanic, Slav, Pháp, Tây Ban Nha, Mỹ Latinh, Mỹ, Canada), **Ai Cập cổ**, **Lưỡng Hà** và **Nhật Bản**. Không Việt Nam, Trung Quốc, Hàn, Đông Nam Á, Nam Á.

**Cấm**: nhân vật có chủ bản quyền (Slenderman, Siren Head, Jeff the Killer, The Rake…), thiết kế lấy từ phim/game (Marvel, God of War, Universal Monsters…), tín ngưỡng bản địa đang sống (Wendigo, Skinwalker…). Cẩn trọng: Golem, Jizō, Inari, thần Ai Cập (có người thờ hiện nay, không chế giễu).

**Tiêu chí một cặp tốt** (đủ cả 5):
1. **Cả hai nổi tiếng**: khán giả toàn cầu nghe tên là nhận ra.
2. **Xung đột lore tự nhiên**, viết được trong 1 câu. Ví dụ: "Thor là kẻ giết rắn thế giới, Apep là rắn nuốt mặt trời".
3. **Monster có điểm yếu có nguồn** (để thắng bằng lore) và **guardian có giới hạn có nguồn** (để monster lật kèo). Ví dụ: Thor chết vì nọc rắn sau 9 bước (Völuspá).
4. **Mỗi bên ≥ 3 sức mạnh có nguồn**, vẽ được thành đòn năng lượng (tia, búa ném, đạn cầu, ánh mắt thôi miên…).
5. **Tương phản hình ảnh**: guardian sáng, vững; monster tối, méo, bất đối xứng. Nếu monster khổng lồ theo lore thì càng tốt cho cảnh rộng.

**Cặp gợi ý chưa dùng**: Medusa vs Perseus · Hydra vs Heracles · Cthulhu vs Valkyrie · Koschei vs Talos · Kuchisake-onna vs Komainu · Oni vs Karasu-tengu · Dullahan vs Church Grim · Lamashtu vs Pazuzu · Ammit vs Anubis · Humbaba vs Gilgamesh & Enkidu (đầy đủ ở docs/09 mục 4).

## 2. Chọn tổ hợp biến thể (để các tập không lặp)

Mỗi tập chọn **1 ô ở mỗi bảng A–F** ([docs/08](docs/08-he-thong-bien-the.md)) và ghi vào [`episodes/_registry.md`](episodes/_registry.md):

| Bảng | Quyết định | Ví dụ ô |
|---|---|---|
| **A** Hình dạng trận | Ai áp đảo, đảo chiều thế nào | A1 lật kèo kinh điển · A3 monster áp đảo · A4 ngang tài · A6 hiểu lầm |
| **B** Số phận bé | Bé ra sao | B1 an toàn · B2 tử nạn rồi được cứu hồn (chỉ ẩn ý) · B3 bị kéo sang cõi khác, trở về khác lạ · B4 mất tích |
| **C** Kết lửng | Cú lửng dựa lore nào | C1 hồi sinh · C3 có nhiều hơn một · C4 theo về nhà · C5 bé mang theo một phần monster |
| **D** Không gian | ≥ 3 không gian | 2 lãnh địa + 1 chiến trường |
| **E** Mở đầu | Khoảnh khắc hook + cách truyện bắt đầu | E2 đòn siết chí mạng / bé đang ngủ bị gọi |
| **F** Thời điểm | Thời tiết, ánh sáng | nhật thực, bão, sương mù, tuyết, giữa trưa |

**Luật chống lặp**: không dùng lại cùng ô A, B hoặc C trong 3 tập liên tiếp; không bao giờ lặp nguyên tổ hợp A+B+C; E và F khác tập liền trước.

## 3. Bối cảnh

Mỗi tập có **3 không gian**, đổi theo cặp đấu:

| Không gian | Dùng ở đâu | Cách làm |
|---|---|---|
| **Lãnh địa Monster** | Chỉ trong intro monster | Scene `domain-<key>`: bầu trời gradient, motif theo lore (`monoliths` cột đá nghiêng, `spires` gai đá, `ruins` phế tích, `runes`…), sigil xoay, sương, hạt bay. Ví dụ: Duat (sông đen, gai obsidian, tím–xanh độc) |
| **Lãnh địa Guardian** | Chỉ trong intro guardian | Ví dụ: Thrudheim (cột đá, mây giông, xanh điện–trắng) |
| **Một chiến trường duy nhất** | Toàn bộ truyện | Ví dụ: sa mạc phế tích đền cổ lúc nhật thực. **Địa hình monster trồi lên ngay trên đó** (gai đá, cột R'lyeh, vòng thân rắn khổng lồ), không đổi phông giữa trận. Cảnh kết có thể cùng nơi nhưng khác giờ (hoàng hôn hôm sau) |

Trong chiến trường phải có: **chỗ nấp xa cho bé** (tượng đổ, rặng đá), vật lore được cài sớm (bia khắc, bàn thờ, đầu bò làm mồi…), thời tiết theo ô F (nhật thực khuyết dần → toàn phần ở đỉnh trận → sáng lại khi monster thua).

## 4. Nghiên cứu sức mạnh

Trước khi viết, scout lập **bảng sức mạnh có nguồn** (`01-research-powers.md`): tên · nguồn Public Domain + link (Edda, Sách Người Chết, Gilgamesh, Ovid, sưu tầm dân gian…) · cách hình ảnh hóa (fx nào) · giới hạn. Chi tiết tự sáng tạo để dẫn chuyện phải ghi **"(story)"**, không trình bày như sự thật dân gian.

## 5. Kịch bản & nội dung

**5.1 Cốt truyện guardian vs monster**
- Monster nhắm vào bé → guardian chắn đòn đầu → bé chạy đi nấp → trận 1v1 **3 nhịp**:
  1. **Thử sức**: mỗi bên khoe sức mạnh đầu tiên.
  2. **Lật kèo / áp đảo**: monster khai thác **giới hạn của guardian**; địa hình monster trồi lên; biến cố số phận của bé (ô B) xảy ra ở đây.
  3. **Đòn quyết định**: **mẹo lore** dựa trên điểm yếu **đã cài từ trước** + đòn lớn nhất tập (đụng chưởng), slow-mo + crash-zoom.
- Monster phải thắng ít nhất 1 nhịp. Guardian không bất bại; nếu thua thì thua có danh dự. Không thắng nhờ may.

**5.2 Đứa bé (THE KID)**: chỉ là bối cảnh và lý do để đánh. Ngoại hình cố định: tóc rối sẫm, pyjama sọc, khăn quàng đỏ, giày đỏ, đèn pin to quá khổ, giới tính trung tính, gọi "the kid / they". Có **1 cảnh riêng chạy ra khỏi khung** ngay sau khi guardian chắn đòn đầu; **ẩn suốt 1v1**; chỉ cắt về chỗ nấp khi có biến cố và lúc kết. **Không bao giờ có máu trên bé**; gặp nạn chỉ bằng ẩn ý (đèn pin lăn rồi tắt, cát sụt, chớp trắng).

**5.3 Thoại nhân vật**
| Loại | Luật | Ví dụ |
|---|---|---|
| Intro monster (ngôi thứ nhất, 12–18 từ) | Tôi là ai → nguồn gốc/chiến tích → **đe dọa người xem/bé** | *"I am Apep, serpent of chaos. Each night I devour the sun. Tonight, I devour you."* |
| Intro guardian | Tôi là ai → chiến tích có nguồn → **thách thức monster** | *"I am Thor, son of Odin. I hooked the World Serpent. Crawl back, worm."* |
| Trong trận | Tùy chọn, ≤ 1 câu mỗi bên, ≤ 6 từ, đúng lore | *"Mjölnir!"* |
| Thoại cuối | Guardian 1–2 câu có **lời dặn gài cú lửng**; bé ≤ 3 từ | *"Go home, little one. Never sleep under a dark sun."* / *"…Okay."* |
| Thì thầm kết | ≤ 5 từ, sau khi nhạc tắt | *"I always come back."* |

**5.4 Lời dẫn**: tiếng Anh, ngôi thứ ba, giọng bình luận viên trận tử thần; **kể liền mạch** có từ nối (but, so, until, then, as…); câu 6–14 từ; mỗi câu ≤ 1 từ khóa `*...*` (tô đỏ trong phụ đề); tổng lời dẫn + thoại **~200–240 từ**.

**5.5 Kết lửng (3 nhịp)**: bình yên giả → **nhạc tắt phụt** + dấu hiệu nhỏ (cát thở, tiếng gõ cửa) → **monster/hậu quả lộ diện bằng hình** (mắt mở dưới cát, cái bóng hình rắn…) + câu thì thầm + CTA ("Is it really dead?" / "Did the kid survive?" / "Who should fight it next?"). Luôn dựa trên điều kiện lore có thật, đã cài từ trước.

**5.6 File kịch bản** `episodes/<slug>/script-anim.md`: các phần `HOOK` · `SPLIT-ROLL + INTROS` · `STORY` · `POWERS USED` · `SHOT LIST` · `ANIMATION BEAT SHEET` · `Changelog`. Mỗi dòng lời dẫn kèm hình:
```text
> But Apep roared, so the sand split and the dunes buckled.
[SHOT #26 31.6 low dutch] Obsidian spikes and coils erupt under Thor's feet. push + pan.
[ANIM] Apep LEFT `roar`; Thor RIGHT staggers.   [FX] rise spire + coils, shake.
> (thor's voice, hoarse) Go home, little one. Never sleep under a dark sun.
```

## 6. Tạo hình, animation, hoạt họa sức mạnh

| | Guardian | Monster |
|---|---|---|
| Cảm giác | Thần thánh, vững chãi | Kinh dị, bệnh hoạn |
| Hình khối | Khối vững, cong mạnh | Gai, bất đối xứng, tay dài, xúc tu, miệng xé |
| Ánh sáng | Rim light + aura 2–3 lớp màu theo nguồn (Bắc Âu xanh băng, Hy Lạp vàng–trắng, Ai Cập vàng kim–lam…) | Aura bệnh hoạn (xanh độc, tím, đỏ máu) |
| Mắt | Lóe vệt sáng | Đồng tử dọc, xoáy thôi miên, hoặc đen kịt |

- **Quy mô**: monster khổng lồ theo lore phải áp đảo khung hình (guardian ~1/4–1/5), **thân thành địa hình chiến trường** (prop `serpent-coils`), nhiều góc thấp và cảnh rộng cực xa. Mặt guardian không bị che.
- **Animation**: luôn chuyển động; lấy đà → ra đòn → dư âm (tóc, râu, áo choàng); lúc trúng đòn có flash + rung + giật lùi; nhân vật `talk` mở miệng theo giọng.
- **Sức mạnh = chuỗi 2–4 cảnh**: chuẩn bị → kích hoạt → tác động → hậu quả, theo công thức từng loại ([docs/07 mục 10](docs/07-format-battle-spin.md)): tia/sét (`beam`), vũ khí ném (`slash` + bay về tay), đạn cầu (`orbs`), lưỡi chém (`slash`), thức tỉnh (`pillar` + aura), ánh mắt (`glint` + đông cứng), siết, địa hình (`rise`), **đụng chưởng** (`beam-clash`, đỉnh trận).
- **Camera**: mọi shot có push + pan; whip-pan bám hướng bay của đạn; slow-mo + crash-zoom ở đòn kết; letterbox + tàn lửa trong hành động; **trục 180°: monster luôn TRÁI, guardian luôn PHẢI**.

## 7. Sản xuất

**Âm thanh** (`episodes/<slug>/audio-anim/`): lời dẫn edge-tts `en-US-ChristopherNeural` rate +12%, nghỉ 0,30–0,35 s, `voice_fx.sh deep` (offline: Kokoro-82M `tools/tts_kokoro.py`); mỗi nhân vật một giọng **đa tầng**; nhạc tổng hợp bằng code (trống ~125 BPM, SFX nạp/phóng sét, hit khi khóa thẻ, tắt phụt trước câu thì thầm); mix −14 LUFS; `words.json` mốc từng từ để cắt hình.

**Hình**: rig mới trong `tools/anim/rigs.js` (Boss duyệt bảng rig trước) → `episodes/<slug>/anim/make_timeline.js` (mở đầu bằng `tools/anim/episode_kit.js`, cắt cảnh theo `words.json`) → kiểm tra → dựng.

```bash
node episodes/<slug>/anim/make_timeline.js
```
```bash
node tools/anim/render.js --timeline episodes/<slug>/anim/timeline.json --check
```
```bash
node tools/anim/validate.js episodes/<slug>/anim/timeline.json --script episodes/<slug>/script-anim.md
```
```bash
bash episodes/<slug>/build-anim.sh
```
`--check` phải in `180-RULE OK`; `validate.js` phải **0 FAIL**. Kết quả: `preview/<slug>.mp4` (< 15 MB) + `preview/<slug>-sheet.jpg`. Cài đặt và chi tiết: [`tools/README.md`](tools/README.md), [`tools/anim/README.md`](tools/anim/README.md).

## 8. Đội agent và quy trình 3 cổng

Bắt đầu một tập bằng:
```text
/episode <monster> vs <guardian>
```

| Bước | Ai | Ra file |
|---|---|---|
| Brief + tổ hợp A–F | **Boss** (Opus) | `00-brief.md`, `_registry.md` |
| Research lore + bảng sức mạnh (song song 2 nhân vật) | `scout` (Haiku) | `01-research-*.md`, `01-research-powers.md` |
| **Cổng 1**: ≥ 3 nguồn, mỗi bên ≥ 3 sức mạnh có link, có điểm yếu + giới hạn | Boss | |
| Kịch bản + hook/tiêu đề | `writer` (Sonnet) | `script-anim.md`, `hooks.md` |
| **Cổng 2**: chấm 10 điểm (hook, mạch lạc, lore + xung đột, phân cảnh, bé + thoại + kết), < 8 thì viết lại | Boss | `review.md` |
| Âm thanh → rig → timeline → dựng → QC | `producer` (Sonnet) | `audio-anim/`, `anim/`, `build-anim.sh`, `qc-anim.md`, `preview/` |
| **Cổng 3**: xem khung tại mọi mốc bắt buộc, `180-RULE OK`, validate 0 FAIL | Boss | `review.md` |
| Chốt: commit, push, gửi preview | Boss | |

Chi tiết: [CLAUDE.md](CLAUDE.md), [docs/06](docs/06-dan-nhac-agent.md), [.claude/skills/episode/SKILL.md](.claude/skills/episode/SKILL.md).

## 9. Cấu trúc repo

| Đường dẫn | Nội dung |
|---|---|
| `docs/07` · `08` · `09` | Kinh thánh format · hệ thống biến thể · kho nhân vật |
| `docs/05`, `docs/06`, `docs/01`, `docs/research/` | Giọng đọc · đội agent · phân tích video mẫu · kỹ thuật anime |
| `tools/anim/` | Engine: `rigs.js`, `stage.js`, `sakuga.js`, `episode_kit.js`, `validate.js`, `render.js`, `captions_dyn.py`, demo |
| `tools/` | Âm thanh + phụ đề: `narration.py`, `tts_kokoro.py`, `voice_fx.sh`, `make_captions.py`, `transcribe_words.py` |
| `episodes/apep-vs-thor/` | **Tập mẫu chuẩn #003** (đủ mọi bước) |
| `episodes/_format-dual-spin/` | Kho research monster / guardian |
| `episodes/_registry.md` | Tổ hợp biến thể đã dùng |
| `episodes/black-eyed-children-vs-cerberus/`, `episodes/vrykolakas-vs-church-grim/` | Tập #002, #001 (legacy, trước luật hiện tại) |
| `.claude/agents/`, `.claude/skills/episode/` | Định nghĩa agent và lệnh `/episode` |

## 10. Bản quyền và an toàn
- Chỉ dùng thần thoại, truyền thuyết và văn học Public Domain (bản gốc). Không sao chép thiết kế phim/game, không brand/intro của kênh khác.
- Nhạc và SFX tổng hợp bằng code, hoặc nguồn có giấy phép rõ (CC0…).
- Đứa bé không bao giờ có máu; máu và gore của monster chỉ ở mức hoạt hình.
- Không chế giễu thần hay tín ngưỡng còn người thờ.
