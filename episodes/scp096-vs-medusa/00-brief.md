# Tập #007 · SCP-096 vs MEDUSA (Anti-Guardian) · Brief (Boss)

Slug: `scp096-vs-medusa` · Format: `sakuga` (`docs/07-format-battle-spin.md`) · Không dùng kid (tương tự #005–#006 để giữ tông **Monster vs Anti-Guardian**, không bias phe thiện).
Nhân vật:
- **MONSTER (TRÁI): SCP-096 ("The Shy Guy")** — SCP Wiki (Dr Dan, CC BY-SA 3.0). Tự thiết kế rig flat-vector gốc (cao gầy dị dạng, da trắng bệch, tay dài quá khổ, hàm xé rộng, khung xương bất khả xâm phạm); không lấy thiết kế từ phim ngắn *096* hay game *SCP: Containment Breach*.
- **ANTI-GUARDIAN (PHẢI): MEDUSA (Gorgon bị nguyền giữ phế tích)** — Thần thoại Hy Lạp gốc (Hesiod *Theogony*, Pseudo-Apollodorus *Bibliotheca*, Ovid *Metamorphoses*, Public Domain). Thiết kế theo bản gốc Apollodorus: **tóc rắn sống, đôi cánh vàng, bàn tay móng đồng, ánh mắt xanh lục hóa đá**; không lấy thiết kế phim Hollywood.

## 1. Lý do ghép & Tổ hợp biến thể (`docs/08-he-thong-bien-the.md`)
- **Xung đột lore 1 câu:** Kẻ *cấm bị nhìn mặt* (SCP-096) đụng độ kẻ *hóa đá mọi ánh nhìn* (Medusa) — trận chiến giữa hai lời nguyền thị giác kinh hoàng nhất, không có phe chính diện.
- **Tổ hợp (đã kiểm luật chống lặp với #004 A2/C3/E3, #005 A7/C9/E5, #006 A1/C1/E4):**
  - **A4 (Ngang tài):** Hai bên ăn miếng trả miếng ngang cơ, giằng co `beam-clash` giữa sóng gào cuồng nộ và ánh mắt hóa đá; phân thắng bằng chi tiết lore (nhìn sát mặt để khóa toàn thân thành đá).
  - **B:** `—` (không dùng kid; kẻ xâm nhập đã bị hóa đá chỉ là prop dẫn truyện).
  - **C2 (Phong ấn nứt):** SCP-096 bị hóa đá hoàn toàn thành tượng, nhưng ở 3 nhịp kết lửng, lớp đá trên hàm nứt vỡ đỏ rực, lộ **khung xương trắng bất tử** bên trong vẫn rung lên.
  - **D (3 không gian):**
    1. `domain-cell096` (Intro Monster): Buồng giam thép đặc 5×5×5m tối om, đèn báo động đỏ, mảnh ảnh 4-pixel trên sàn.
    2. `domain-gorgon` (Intro Anti-Guardian): Đền đá cổ ngập sương xanh lục, rừng tượng người hóa đá.
    3. `domain-ruins-mist` (Chiến trường duy nhất 1v1): Phế tích đền cổ trên vách đá trong đêm sương mù dày, trăng xanh lạnh; địa hình trồi lên = cột đá vỡ & tượng đá nứt (`monolith`/`spire`).
  - **E6 (Guardian canh gác):** Hook *in medias res* ngay khoảnh khắc ánh mắt hóa đá gặp cú gầm sát mặt; mở truyện bằng cảnh Medusa lướt canh khu vườn tượng đá thì 096 phá tường lao vào.
  - **F (Thời điểm/thời tiết):** Đêm sương mù dày, trăng xanh lạnh.

## 2. Mở rộng góc camera (`stage.js` + `anime-power-techniques.md`)
Sử dụng trọn bộ góc máy điện ảnh xuyên suốt 50–60 cảnh:
- `high` (toàn cảnh vách đá / cú bổ nhào có cánh của Medusa)
- `low` (uy áp của 096 cao gầy & Medusa bung cánh vàng)
- `follow` (bám sát cú lao siêu thanh của 096 xuyên tường đá & pha bay lượn của Medusa)
- `cu` / `ecu` (khóa sát marker `eye`, `mouth`, `claw`, `snake` khi kích hoạt lời nguyền)
- `versus` (đối đầu 180° chặt chẽ, `beam-clash` đỏ máu vs xanh lục)
- `insert` (ảnh 4-pixel, bức tượng kẻ xâm nhập bị hóa đá, vết nứt hàm tượng đá ở C2)
- Chuyển cảnh & nhịp: `push` + `pan` mọi shot, `dutch`/`dutchTo`, `hand` (rung cầm tay khi 096 gầm), `tr:{type:'whip'}` theo hướng đòn, `slow` + `crash` ở đòn kết.

## 3. Kế hoạch sức mạnh & Thoại
- **SCP-096 (≥ 3):** (1) Kích hoạt 4-pixel & tiếng gào xé hàm (`roar` + `ripple`), (2) Cú lao bất khả cản húc vỡ cột đá (`follow` + `impact`), (3) Khung xương bất khả xâm phạm chịu đòn & bẻ nứt đá (`petrify-resist` + C2).
- **Medusa (≥ 3):** (1) Ánh mắt hóa đá (`ecu` + `beam` xanh lục), (2) Tóc rắn độc phóng cắn & phun nọc (`orbs` + `snake-strike`), (3) Đôi cánh vàng & bàn tay đồng (`wing-dodge` + `slash` đồng-vàng).
- **Intro Monster (SCP-096):** Không tự nói kiểu người hùng; tiếng gầm méo đa tầng ngắn + lời dẫn giới thiệu 096.
- **Intro Anti-Guardian (Medusa):** *"I am Medusa, cursed Gorgon. One gaze turns flesh to stone. Trespass, and join my garden."*
- **Trong trận (≤ 6 từ mỗi bên):** Medusa: *"Turn to stone!"* · 096: *(gầm xé tai / không thoại người)*.
- **Thoại cuối (Medusa):** *"No beast escapes my gaze. Not even you."*
- **Cú lửng C2 (3 nhịp):** Bình yên sương mù → nhạc tắt phụt, vết nứt đỏ chạy dọc hàm tượng đá → mảnh đá rơi lộ khung xương trắng → thì thầm méo/tiếng rên sát tai: *"Four... pixels... left."* → CTA: **`CAN STONE REALLY HOLD IT?`**.
