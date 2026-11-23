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
