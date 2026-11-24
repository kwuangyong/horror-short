# Brief v3: BATTLE SPIN #001 · VRYKOLAKAS vs CHURCH GRIM (bản HOẠT HÌNH)

Quyết định của người dùng (thay thế các brief trước nếu mâu thuẫn):
1. **Hoạt hình thật**: nhân vật cử động theo từng câu lời dẫn, như phim hoạt hình ngắn (cutout/rig animation), không phải tranh tĩnh + Ken Burns.
2. **BỎ THE KID**: không còn nhân vật người. Trận đấu chỉ còn **GUARDIAN vs MONSTER**.
3. **Mở đầu = 1 khung cảnh chia đôi màn hình**: nửa trái cuộn (slot roll dọc) chọn MONSTER, nửa phải cuộn chọn GUARDIAN; khóa lần lượt (flash) → vạch chia tan ra → hai nhân vật bước vào cùng một đấu trường, đối mặt.

## Kịch bản (writer)
- Tiếng Anh, ~95–105 s, 190–230 từ. Lời dẫn ngôi thứ ba, giọng bình luận viên trận đấu tử thần (Christopher, trầm).
- Khung: HOOK (khoảnh khắc nguy hiểm nhất trong trận, freeze) → SPLIT ROLL (monster | guardian) → VS + "WHO WINS? COMMENT" → giới thiệu đấu trường (nghĩa địa cũ trong rừng, tường đá đổ: đất của Grim) + lore 1 câu mỗi bên + luật/giới hạn → ROUND 1 (Grim áp đảo) → ROUND 2 (Vrykolakas lật kèo bằng giới hạn "chỉ trong tường") → ROUND 3 (đảo chiều bằng lore: tỏi / ánh sáng nhà thờ / chuông… chỉ dùng lore có trong research) → K.O. người thắng rõ ràng → bình yên giả → CÚ LỬNG (điều kiện lore bị bỏ sót: "only fire ends it" — không ai đốt xác; đất động, một tiếng gõ) → CTA.
- Ai cài "only fire ends it" khi không còn bà/bé? Ví dụ: chữ khắc trên bia mộ cổ, hoặc lời dẫn nêu lore ở phần giới thiệu.
- **Mỗi câu lời dẫn phải kèm dòng `[ANIM]`** mô tả hành động nhân vật/camera trong đúng câu đó (ai làm gì, hướng, cảm xúc), để hoạt hình bám theo lời.

## Hoạt hình (producer)
- Engine: HTML/SVG rig + timeline, render từng khung bằng Playwright Chromium → ffmpeg. Đồng bộ theo words.json.
- Phong cách giữ như art cũ: flat-vector, không viền, navy + đỏ thẫm, trăng glow; Grim và Vrykolakas giống thiết kế trong art/.

## CẬP NHẬT v4 (người dùng): đứa bé quay lại làm BỐI CẢNH
- Câu chuyện: một đứa bé lạc vào rừng (đuổi đom đóm) → tới nghĩa địa cũ → Vrykolakas trồi lên, tiến về phía bé → Church Grim xuất hiện chắn trước bé → đánh nhau. Bé núp sau bia mộ, ló ra xem; có lúc gặp nguy (vd. R2 Grim bị quăng ra ngoài, Vrykolakas quay sang bé) để tăng kịch tính.
- KHÔNG thẻ THE KID, KHÔNG thanh HP cho bé, không lời dẫn tập trung vào bé; gọi là "a kid" / "the kid" / "they".
- Tập này dùng **Kết A (Grim thắng)**: bình minh, bé chạy về nhà an toàn. Cú lửng theo lore Vrykolakas: đêm đó, bé nằm trên giường… **một tiếng gõ cửa duy nhất** (Vrykolakas gõ 1 lần) — và/hoặc đất mộ động. Nhắc "only fire ends it / nobody burned it".

## CẬP NHẬT v5 (người dùng, sau khi xem bản hoạt hình v4)
1. **Lời dẫn mạch lạc**: kể như một câu chuyện liền ý (có từ nối, nguyên nhân → kết quả), KHÔNG chuỗi mảnh câu 2–3 từ rời rạc. Vẫn ngắn gọn, dễ nghe, nhưng câu 6–14 từ là bình thường; chỉ dùng câu cực ngắn ở khoảnh khắc nhấn.
2. **Nhịp nhanh hơn ~1.25x**: giọng đọc nhanh hơn bản v4 khoảng 25%; tổng video ~85–95 s → kịch bản ~200–220 từ.
3. **Quay phim (cinematic), nhiều cảnh hơn**: mỗi câu có dòng `[SHOT]` (loại cảnh) + `[ANIM]`.
   - Mở đầu: **góc nhìn thứ nhất (POV) của đứa bé** đi trong rừng: tay cầm đèn pin trong khung, chùm sáng quét, khung nhún theo bước, thở gấp.
   - Đánh nhau: **góc đối kháng ngang** (kiểu game đối kháng, hai bên trái–phải).
   - Còn lại: cận mặt từng nhân vật (close-up/extreme close-up mắt, hàm), góc thấp hất lên khi quái vật trồi lên, qua vai (over-the-shoulder) từ sau lưng bé nhìn quái vật, cảnh phản ứng (reaction) của bé, góc nghiêng (dutch) lúc nguy, góc trên cao khi Grim gục, cắt nhanh trong hành động.
   - Trung bình 1 cảnh mới mỗi 1.5–3 s.

## CẬP NHẬT v6 (người dùng, sau khi xem bản cinematic v5.1)
1. **Sửa điểm yếu v5.1**: cảnh "legend says a dog lies buried here" quá tối; Grim che mất bé ở cảnh rộng; phụ đề đè mặt ở cảnh cận; rừng POV phẳng; font phụ đề (thử cài Oswald/Anton/Bebas qua apt, không được thì dùng font condensed đậm sẵn có).
2. **Phân cảnh đang bị đứt lìa**: nối cảnh mượt hơn — ít cut hơn (trung bình 2.5–3.5 s/cảnh, ~30–35 cảnh), **match-on-action** (cắt giữa động tác, động tác tiếp diễn ở cảnh sau), giữ **quy tắc 180°** (Vrykolakas luôn bên trái, Grim bên phải trong cảnh đối kháng; bé ở phía Grim), chuyển cảnh có động lực (whip-pan, push-in nối push-in, cắt theo hướng nhìn), cảnh rộng định vị lại sau chuỗi cận. Không cắt chỉ để cắt.
3. **THE KID đổi ngoại hình, KHÔNG trùm mũ**: tóc rối sẫm màu lộ ra, mắt to; áo pyjama sọc rộng thùng thình + khăn quàng đỏ; dép/giày đỏ; đèn pin to. Giới tính trung tính. (Không áo mưa vàng.)
4. **Cú lửng đáng sợ hơn**: sau tiếng gõ, cho thấy **xác Vrykolakas lấp ló sau cửa sổ phòng ngủ** (mặt xám, mắt trống, móng cào kính / hơi thở mờ kính), bé chưa thấy hoặc vừa quay lại.
5. **Thoại cuối Guardian ↔ bé**: trước khi bé chạy về, Grim (giọng trầm, khàn, như tiếng gầm thành lời) nói với bé, ví dụ "Go home, child. Never come back after dark." Bé có thể đáp 1 câu ngắn. Thoại nhân vật ghi theo cú pháp `(grim's voice)` / `(kid's voice)` để tools/narration.py tách giọng.
