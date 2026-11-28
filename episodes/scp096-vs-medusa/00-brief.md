# Tập #007 · SCP-096 vs MEDUSA (Anti-Guardian) · Brief (Boss)

Slug: `scp096-vs-medusa` · Format: `sakuga` (`docs/07-format-battle-spin.md`) · Không dùng **The Kid** (tương tự #005–#006 để giữ tông **Monster vs Anti-Guardian**, zero good-guy bias); thay bằng một **người lính đào tẩu (fugitive soldier / trespasser)** vô tình thấy ảnh 4-pixel làm ngòi nổ bối cảnh trước khi bị Medusa hóa đá ngay mở truyện.

Nhân vật:
- **MONSTER (TRÁI): SCP-096 ("The Shy Guy")** — SCP Wiki (Dr Dan, **CC BY-SA 3.0**, https://scp-wiki.wikidot.com/scp-096). Rig flat-vector gốc hoàn toàn mới (cao gầy dị dạng, da trắng bệch, tay dài quá khổ, móng vuốt dính máu, hàm xé rộng gấp 4 lần, khung xương bất khả xâm phạm); không lấy thiết kế từ phim ngắn *096* hay game *SCP: Containment Breach*.
- **ANTI-GUARDIAN (PHẢI): MEDUSA (Gorgon bị nguyền giữ phế tích)** — Thần thoại Hy Lạp gốc (Hesiod *Theogony*, Pseudo-Apollodorus *Bibliotheca* 2.4.2, Ovid *Metamorphoses* IV, Public Domain). Tạo hình theo Apollodorus: **tóc rắn sống dày đặc phun nọc, đôi cánh vàng, bàn tay/móng đồng, ánh mắt xanh lục hóa đá**; không lấy thiết kế phim Hollywood hay game.

## 1. Lý do ghép & Tổ hợp biến thể (`docs/08-he-thong-bien-the.md`)
- **Xung đột lore 1 câu:** Một tên lính đào tẩu vô tình thấy 4 pixel của kẻ *cấm bị nhìn mặt* (SCP-096) chạy trốn vào phế tích của kẻ *hóa đá mọi ánh nhìn* (Medusa) — khiến hai lời nguyền thị giác kinh hoàng nhất va chạm trực diện không khoan nhượng, không có phe chính diện.
- **Tổ hợp (tuân thủ luật chống lặp với #004 A2/C3/E3, #005 A7/C9/E5, #006 A1/C1/E4):**
  - **A4 (Ngang tài):** Hai bên ăn miếng trả miếng ngang cơ, giằng co `beam-clash` giữa sóng gào cuồng nộ và ánh mắt hóa đá; phân thắng bằng chi tiết lore (nhìn sát mặt ở cự ly gần để khóa toàn thân thành đá).
  - **B:** `—` (không dùng kid; người lính đào tẩu cầm ảnh 4-pixel là ngòi nổ bối cảnh ở Hook & Mở truyện, bị Medusa hóa đá thành tượng ngay trước khi trận 1v1 nổ ra).
  - **C2 (Phong ấn nứt):** SCP-096 bị hóa đá hoàn toàn thành tượng, nhưng ở 3 nhịp kết lửng, lớp đá trên hàm nứt vỡ đỏ rực, lộ **khung xương trắng bất tử** bên trong vẫn rung lên (`(story)`).
  - **D (3 không gian):**
    1. `domain-cell096` (Intro Monster): Buồng giam thép đặc 5×5×5 m tối om, đèn báo động đỏ, mảnh ảnh 4-pixel trên sàn.
    2. `domain-gorgon` (Intro Anti-Guardian): Đền đá cổ ngập sương xanh lục, rừng tượng kẻ xâm nhập hóa đá.
    3. `domain-ruins-mist` (Chiến trường duy nhất cho Mở truyện, 1v1 & Kết lửng): Phế tích đền Hy Lạp trên vách đá ven rừng thông đêm sương mù dày dưới trăng xanh lạnh; địa hình trồi lên = cột đá vỡ & phiến đá nứt (`monolith`/`spire`).
  - **E6 (Bối cảnh xâm nhập → Medusa canh gác → Va chạm):**
    - **Hook (0–3 s, 3 cảnh nhanh):** (1) Tên lính hoảng loạn ôm bức ảnh 4-pixel chạy vào ngôi đền Hy Lạp mù sương → (2) Ánh mắt xanh lục của Medusa hóa đá anh ta ngay lúc SCP-096 phá tan tường đá phía sau → (3) **"WHO SURVIVES?"** slam đè lên pha `beam-clash` khóa mắt → tua ngược `glitch` vào Split-Roll.
    - **Mở truyện (ngay sau VS, rõ nhân quả):** Tên lính đào tẩu vô tình thấy 4 pixel trắng của SCP-096 chạy trốn vào phế tích sương mù để ẩn náu → Medusa lướt ra từ bóng tối và hóa đá anh ta thành bức tượng đang gào thét vẫn nắm chặt tấm ảnh → vài giây sau tiếng gào rợn người của SCP-096 xé toạc khu rừng, húc thẳng xuyên tường đền để truy sát mục tiêu → thấy mục tiêu đã thành tượng đá, SCP-096 khựng lại... cho đến khi Medusa nhìn thẳng vào mặt nó → **cả hai lời nguyền thị giác cùng bùng nổ!**
  - **F (Thời điểm/thời tiết):** Đêm sương mù dày, trăng xanh lạnh.

## 2. Mở rộng góc camera (`stage.js` + `anime-power-techniques.md`)
Sử dụng trọn bộ góc máy điện ảnh xuyên suốt **52–58 cảnh** (mục tiêu **56 cảnh** trong script = 53 shot chiến trường/intro + 3 nhịp Split-Roll/VS):
- `high` (toàn cảnh phế tích ven rừng / cú bổ nhào có cánh của Medusa / pha quật xuống sàn đá)
- `low` (uy áp của 096 cao gầy & Medusa bung cánh vàng, tượng đá)
- `follow` (bám theo tên lính chạy trốn, Medusa lướt săn, cú lao siêu thanh xuyên tường & pha bay vòng của Medusa)
- `cu` / `ecu` (khóa sát marker `eye`, `mouth`, `claw`, `snake`, `head` khi kích hoạt lời nguyền & C2)
- `versus` (đối đầu 180° chặt chẽ: SCP-096 TRÁI vs Medusa PHẢI, `beam-clash` đỏ máu vs xanh lục)
- `wide` (định vị chiến trường & dư chấn sau mỗi chuỗi đòn)
- `insert` (bức ảnh 4-pixel, bàn tay đá cầm ảnh, vết nứt đỏ trên hàm tượng đá ở C2)
- Chuyển cảnh & nhịp: `push` + `pan` mọi shot, `dutch`, `hand` (rung cầm tay khi 096 gào), `tr:{type:'whip'}` theo hướng đòn, `slow` + `crash` ở đòn kết.

## 3. Kế hoạch sức mạnh & Thoại (210–238 từ, ~92–98 s)
- **SCP-096 (≥ 3 sức mạnh có nguồn, chuỗi 2–4 cảnh):**
  1. **Kích hoạt 4-pixel & Sóng xung kích tiếng gào xé hàm** (`insert` ảnh 4-pixel → `ecu` `trigger-unhinge` + `roar` + `ripple` đỏ máu).
  2. **Cú lao siêu thanh bất khả cản** (`follow` + `charge` + `speed`, húc vỡ tường đền & cột đá).
  3. **Móng vuốt đẫm máu & Khung xương bất khả xâm phạm** (`claw-slash` + `grab-crush` + `petrify-resist` phá vỡ lớp đá bề mặt và bẻ nứt hàm tượng ở C2 `(story)`).
- **Medusa (≥ 3 sức mạnh có nguồn, Apollodorus 2.4.2 + Hesiod + Ovid):**
  1. **Ánh mắt hóa đá** (`ecu` mắt xoáy `glint` → `beam` / `beam-clash` xanh lục hóa đá nạn nhân & 096).
  2. **Tóc rắn độc dày đặc phóng cắn & phun nọc** (`ecu at snake` + `snake-strike` + chùm `orbs` nọc xanh độc).
  3. **Đôi cánh vàng & Bàn tay/móng đồng** (`wing-dodge` bay vọt né đòn → `bronze-slash` chém tia vàng–đồng).
- **Intro Monster (SCP-096, 18 từ):** `> (scp096's voice, layered hollow shriek) I am SCP Zero Nine Six. Four pixels seal your fate. See my face, and nothing stops me.`
- **Intro Anti-Guardian (Medusa, 15 từ):** `> (medusa's voice, venomous layered hiss) I am Medusa, cursed Gorgon. One gaze turns monsters to stone. Look once, and freeze.`
- **Trong trận (≤ 6 từ):** Medusa: *"Turn to stone!"* · 096: *(gầm xé tai / không thoại người)*.
- **Thoại cuối (Medusa):** *"No beast escapes my gaze. Not even you."*
- **Cú lửng C2 (3 nhịp):** Bình yên sương mù → nhạc tắt phụt, vết nứt đỏ chạy dọc hàm tượng đá → mảnh đá rơi lộ khung xương trắng bất tử rung bần bật `(story)` → thì thầm méo sát tai: *"Four... pixels... left."* → CTA: **`CAN STONE REALLY HOLD IT?`**.
- **Mục tiêu kỹ thuật:** Tổng chữ mọi dòng `>` đạt đúng **228 từ** (chuẩn 210–238 từ, ~94 s ở rate +12%), **56 cảnh** (53 camera shots + 3 split-roll/VS beats), mỗi câu lời dẫn 11–14 từ và ≤ 1 `*keyword*`, bắt buộc ghi credit **CC BY-SA 3.0** cho SCP-096.
