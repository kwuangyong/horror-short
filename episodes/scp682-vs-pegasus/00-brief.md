# Tập #005 · SCP-682 vs PEGASUS · Brief (Boss)

Slug: `scp682-vs-pegasus` · Format: `sakuga` (docs/07) · Nhân vật: SCP-682 (SCP Wiki, Dr Gears, CC BY-SA 3.0 — thiết kế gốc theo văn bản & bảng tham chiếu kinh dị, ghi credit đầy đủ) & Pegasus (Thần thoại Hy Lạp, Public Domain, docs/09).

## 1. Cặp đấu và diễn biến theo yêu cầu
- **MONSTER (TRÁI): SCP-682 ("Hard-to-Destroy Reptile")** — tạo hình cực kinh dị: hộp sọ xương trắng lộ hàm răng nhọn, mảng lồng ngực lộ xương sườn & thịt đỏ rách nát, bờm lông đen xơ xác, hàng gai xương dọc sống lưng và đuôi gai, gân/dịch axit xanh độc. Khi thích nghi: bọc giáp vảy kháng sét, bắn gai xương + axit tầm xa, **mọc đôi cánh xương-màng da khổng lồ** để không chiến!
- **GUARDIAN (PHẢI): Pegasus** — ngựa thần có cánh trắng cơ bắp, **aura đa sắc rực rỡ** (trắng ngọc + lửa vàng kim Olympus + gió xanh lam + ánh tím-hồng viền cánh). Đòn đánh đa dạng hình khối & màu sắc (đá vó lao bổ vàng-cam, sét chẻ nhánh xanh-trắng-vàng của Zeus, lốc gió cánh xanh-bạc), không dùng chưởng 1 màu đơn điệu.
- **Diễn biến 3 giai đoạn**:
  1. **Hook & Mở truyện**: Phòng thí nghiệm SCP báo động đỏ vỡ buồng giam → để xổng SCP-682 lao ra rừng đêm. Pegasus bay qua bầu trời bão tố thấy 682 tàn phá rừng (và đe dọa đứa bé đi lạc trong rừng) nên lao xuống giao chiến.
  2. **Giai đoạn đầu (Pegasus áp đảo trên không)**: Nhờ tốc độ bay vượt bão tố, 682 bản gốc không chạm tới được. Pegasus lao xuống tung **cú đá vó thần thánh** xé rách hông 682 rồi gọi **sấm sét Zeus** thiêu rụi nó tạm thời.
  3. **Bước ngoặt thích nghi (SCP-682 tiến hóa tuyệt đối)**: 682 tự tái tạo trong vài giây → mọc **giáp kháng sét** (vô hiệu hóa sét Zeus), phóng **gai xương & axit tầm xa** bắn lên trời, rồi **xé lưng mọc đôi cánh xương khổng lồ** bay lên không chiến.
  4. **Kết cục (682 áp đảo ngược, Pegasus rút lên Olympus gọi Zeus)**: Pegasus không thể xóa sổ khả năng tái tạo của 682; bị áp đảo trên không và dần kiệt sức, Pegasus dùng tốc độ tối thượng vọt thẳng qua tầng mây **bay lên đỉnh Olympus để chính thần Zeus ra tay**. Kết lửng: 682 có cánh gầm lên trời bão: *"Bring your god."*

## 2. Tổ hợp biến thể (docs/08), đã ghi `_registry.md`
| Bảng | Ô | Áp dụng |
|---|---|---|
| A | **A4 / A7** (đảo chiều & không chiến) | Giai đoạn 1 Pegasus áp đảo trên không → Giai đoạn 2 SCP-682 thích nghi mọc cánh + giáp kháng sét lật kèo áp đảo ngược → Pegasus rút lui chiến thuật lên Olympus gọi Zeus |
| B | **B5 / B6** | Đứa bé trong rừng được Pegasus chắn đòn đầu, chạy nấp sau gốc cây/tảng đá (`kit.kidFlee`), ẩn suốt 1v1; thoát nạn khi Pegasus kéo 682 lên không chiến |
| C | **C9** (nhá tập sau — Zeus!) | Pegasus bay vút vào tầng mây vàng Olympus; dưới rừng đêm nhạc tắt phụt, SCP-682 có cánh & giáp kháng sét ngước lên trời sấm sét tụ lại, mắt rực sáng: *"Bring your god."* CTA: `"CAN ZEUS STOP SCP-682?"` |
| D | 4 không gian | Lab SCP vỡ buồng giam (`domain-lab`, đèn báo động đỏ, thép rách) · Lãnh địa 682 (`domain-acid`) · Lãnh địa Pegasus (`domain-olympus`, mây đa sắc vàng-lam-tím) · **Chiến trường duy nhất: rừng thông đêm bão tố** (`domain-forest-storm`, cây gãy, hố sét cháy, địa hình đá/gai trồi lên) |
| E | **E5** (Lab breach → rừng) | Hook 0–3 s: phòng thí nghiệm báo động đỏ, SCP-682 phá cửa thép lao ra rừng, va chạm sét đầu tiên với Pegasus; "WHO SURVIVES?" + glitch rewind |
| F | **Bão sấm đêm trong rừng** | Sương lạnh + mây bão sấm chớp xanh-vàng trên cao, chuyển sang ánh rạng mây vàng Olympus ở cuối |

## 3. Phân công Orchestra
- **Hydrogen (Research)**: Tra cứu đầy đủ nguồn, kỹ năng, đòn tấn công & bảng phối màu FX đa sắc cho SCP-682 và Pegasus (`01-research.md`, `01-research-powers.md`).
- **Carbon (Rig & Visuals)**: Dựng rig `scp682` (kinh dị theo `image.png`, có trạng thái tiến hóa `armor`, `wings`, `damage`, `spikes`) và `pegasus` (uy nghi đa sắc theo `image_2.png`, aura nhiều lớp vàng-lam-tím-trắng) trong `tools/anim/rigs.js`, xuất turnaround sheet kiểm duyệt.
- **Audio + Timeline + Render**: Giọng đa tầng, nhạc 125 BPM + còi báo động lab + sấm sét + gầm thích nghi, 52–58 cảnh Sakuga, 0 FAIL trên `validate.js`, `180-RULE OK`.
