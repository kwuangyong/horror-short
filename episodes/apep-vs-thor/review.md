# Review (Boss) · apep-vs-thor

## Cổng 1 – Research: ĐẠT (có điều kiện)
Xem `01-research-powers.md`. Nguồn chỉ được đối chiếu qua đoạn trích tìm kiếm (mạng chặn Wikipedia và sacred-texts). Nhật thực và cảnh "nhả ra" phải ghi (story).

## Cổng 2 – Kịch bản v1: 8.5/10 → ĐẠT (Boss tự sửa 4 chỗ nhỏ)
| Tiêu chí | Điểm | Nhận xét |
|---|---|---|
| Hook + mở đầu | 2 | Hook là khung thật (#32–33 Apep siết Thor), "WHO SURVIVES?" + tua ngược; 2 intro ngôi thứ nhất gọn, đúng nguồn (Apep nuốt mặt trời; Thor từng câu Rắn Thế Giới), mỗi intro 4 góc máy low → cu → ecu → wide; VS + CTA đúng |
| Mạch lạc + tempo | 1.5 | Câu liền ý, từ nối tốt. Câu đệm "Thor held, so the fight began." đã bị Boss xóa. Câu mồi đầu bò chưa rõ nghĩa, đã sửa. Tổng ~217 từ theo narration.py, sát mức trên: producer chỉnh rate +40% nếu vượt 85 s |
| Lore + sức mạnh | 1.5 | Apep: A1–A5; Thor: T1–T6; "(story)" ghi đủ. Chuỗi đai Megingjörð chỉ có 1 cảnh → Boss nối #22 (chuẩn bị) + #23 (kích hoạt) thành 2 cảnh. Giới hạn nọc rắn / 9 bước dùng rất tốt cho A3 |
| Phân cảnh Sakuga | 2 | 54 cảnh, một chiến trường sa mạc, địa hình trồi lên (#26), whip theo hướng búa/orbs/mồi, slow-mo + crash ở #45–46, 180° rõ |
| Bé + kết + an toàn | 1.5 | Bé chạy ra khỏi khung #21, ẩn tới #36; nhật thực nuốt chỗ nấp chỉ bằng ẩn ý (#38); bé trở về với cái bóng rắn; C1 mắt mở dưới cát. "split its throat" hơi bạo lực → đổi "blasted it skyward" |

Ghi chú cho producer:
- #20: xe dê sấm chỉ cần vệt sét + bóng xe mờ, không bắt buộc rig dê.
- #42: đầu bò là prop đơn giản (khắc đá) gắn vào búa.
- #52: bóng rắn của bé = bóng đổ dài (polygon tối) có đầu rắn + lưỡi, `glint` tím.
- #53–54: mắt rắn dưới cát ở cảnh sa mạc hoàng hôn, có thể dùng domain `desert` với track sky ấm.

## Cổng 3 – Bản dựng v1: ĐẠT (có ghi chú)
76.81 s · −14.2 LUFS · 56 shot (gồm 3 placeholder split-roll) · `180-RULE OK`. Đủ mốc: hook siết, 2 intro lãnh địa, VS, Thor chắn đòn, bé chạy đi, địa hình trồi, beam/clash/orbs/slash/pillar, kết liễu slow-mo + crash, chỗ nấp, cú lửng mắt rắn dưới cát.
Cần sửa ở v2 (không vi phạm luật):
1. Nhật thực toàn phần (#37–38) quá tối: nâng ambient / rim, giữ corona sáng hơn.
2. #20: bé đứng chồng chân Thor lúc Thor đáp xuống → dời bé sang phải / sau Thor.
3. #14 emerge: phụ đề intro chồng label thẻ → kết thúc phụ đề Thor trước emerge hoặc dời `cap:'low'`.
4. #52 bóng rắn của bé tương phản thấp; #20 xe dê mờ; #34 răng chưa chạm vai.
