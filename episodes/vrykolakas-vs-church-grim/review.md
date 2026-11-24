# Review · Cổng 2 · script v1 → v1.1 (Boss)

| Tiêu chí | Điểm | Nhận xét |
|---|---|---|
| Hook | 1/2 → 2/2 | v1 chung chung và thẻ ghi "2 MONSTERS" sai (Grim là hộ vệ). Boss đã sửa ở v1.1 để hook bán đúng ý tưởng 2 vòng quay. |
| Nhịp | 2/2 | 2 spin gọn trong 0:03–0:09, mỗi 2–4s có thay đổi, garlic meter tốt. |
| Câu chữ | 2/2 | ~230 từ, câu ngắn, từ khóa đỏ đúng chỗ. |
| Điểm chọn | 1.5/2 | Đáp án B suy ra được từ 3 manh mối (mộng du, tỏi khô, Grim chỉ canh trong tường). "Điềm báo tử" làm A hấp dẫn, tốt. Điểm trừ: Luật 1 (gõ lần đầu) chỉ là trang trí; tập sau nên dùng luật dân gian thật làm trục chết. |
| Twist + an toàn | 2/2 | Kết B: bà Eleni chết = trả lại câu "See him… someone dies". Giữ nguyên, đây là cú đảo ngược đúng tinh thần Grim. Không chế giễu tôn giáo. |

**Tổng: 8.5/10 (v1) → ~9/10 (v1.1). ĐẠT, chuyển Producer.**

Ghi chú cho format Dual Spin (rút ra từ tập này):
- Hộ vệ hay nhất khi có **sức mạnh thật + giới hạn rõ**; điểm chọn = "có tới được vùng của hộ vệ không".
- Kết sống nên có giá phải trả do chính hộ vệ (điềm báo, đòi hỏi, hy sinh).

---

# Review · Cổng 2 · script-battle v1 → v1.1 (Boss)

| Tiêu chí | Điểm | Nhận xét |
|---|---|---|
| Hook | 1/2 → 2/2 | Flash-forward phải là khung có thật. v1 hiện HUD 40/15/70 không xuất hiện trong trận → sửa thành khoảnh khắc Round 2 (Grim kẹt sau vạch tường). |
| Nhịp | 2/2 | 3 hiệp rõ, Round 2 lật kèo bằng đúng giới hạn của Grim. |
| Câu chữ | 2/2 | 205 từ, câu ngắn. Bỏ câu meta "health bar shrinks" (HUD đã nói việc đó). |
| Tương tác | 2/2 | Chỉ một CTA "WHO WINS?" ở màn VS, kết có người thắng rõ ràng, đúng quyết định của người dùng. |
| Cú lửng | 2/2 | Cài "Only fire ends it" ở ~0:19, đèn dầu chưa châm cạnh mộ, CTA "Grandma said fire". Đúng quy tắc "điều kiện lore bị bỏ sót". |

**Tổng: 9/10 (v1) → 10/10 (v1.1). ĐẠT.**

Ghi chú: Human đang là "he". Nếu muốn mascot trung tính cho khán giả rộng, cân nhắc thiết kế nhân vật + đại từ trước khi làm tập 2.

---

# Review · Cổng 3 · bản dựng nháp script.md v1.1 (Boss)
ĐẠT ở mức **nháp kiểm pipeline** (102 s, −14 LUFS, phụ đề 70%). Lỗi cần sửa khi dựng bản thật / bản Battle:
- Vòng đếm ngược đè lên chữ ô A/B (tools/make_cards.py) → dời vòng tròn ra cạnh phải hoặc giữa 2 ô có khoảng trống.
- Thẻ luật đè lên nhãn placeholder phía sau (chữ "G…C" lộ hai bên) → thẻ luật cần nền cảnh riêng hoặc làm tối nền.
- Thẻ tên spin chồng lên dãy buồng → khi có ảnh thật, khóa vòng quay rồi mới hiện thẻ (0.3 s sau flash).
- Mix nghiêng về drone; SFX nhỏ → cân lại khi có giọng thật.

---

# Review · Cổng 2 · script-battle v2 (THE KID) (Boss)

| Tiêu chí | Điểm | Nhận xét |
|---|---|---|
| Hook | 2/2 | Khung Round 2 giữ nguyên, đại từ "them" trung tính. |
| Nhịp | 2/2 | Tiền đề series "Every night, the kid sneaks into the woods" + đom đóm dẫn đường: dễ thương mà đáng lo. Round 3 dày (10 câu) nhưng mỗi câu là 1 hành động, chấp nhận; chỉnh khi có giọng thật. |
| Câu chữ | 2/2 | 221 từ, không he/she, không máu trên người bé. |
| Tương tác | 2/2 | Chỉ "WHO WINS?" ở màn VS. |
| Cú lửng | 2/2 | Cài 2 lớp: "Only fire ends it" + "Matches in the other pocket" → bé về nhà với diêm chưa dùng. Ném tỏi vào mặt (không chạm quái vật) là hợp lý cho nhân vật trẻ em. |

**Tổng: 10/10. ĐẠT, chuyển Producer.**

---

# Review · Cổng 3 · BATTLE SPIN #001 bản hoàn chỉnh (Boss)
Lần 1: KHÔNG ĐẠT (phụ đề ghép xuyên câu "DEAD GRANDMA SAID", đồng hồ HUD đứng yên, flash K.O. xóa trắng).
Lần 2: **ĐẠT.** 99.2 s, −14.2 LUFS, 45 cảnh căn theo words.json. Phụ đề không vượt ranh giới câu (sửa trong tools/make_captions.py, ma-da demo vẫn chạy). Đồng hồ 2:00 → 3:30 → 5:40. K.O. chỉ nháy 0.07 s rồi thẻ WINNER rõ.
Còn có thể nâng cấp: tranh riêng cho "kid crawls"; spin thành bánh xe quay thật; tên VRYKOLAKAS sát mép ở màn VS; tay bàn tay cú lửng.

---

# Review · Cổng 2 · script-anim v3 (hoạt hình, không THE KID) (Boss)
Hook 2/2 (khung R2 có thật) · Nhịp 2/2 (split roll 0:03–0:13, mỗi câu có [ANIM] khớp nghĩa) · Câu chữ 2/2 (199 từ) · Tương tác 2/2 (chỉ "WHO WINS?") · Twist/lửng 2/2 (tỏi được cài bằng hình ở 0:25 rồi trả ở R3; "Only fire ends it" khắc trên bia; "Legend says a dog lies buried here" dùng lore Grim thật).
Sửa v3.1: bỏ câu CTA lặp "Only fire ends it". **ĐẠT 10/10.** Lưu ý: tỏi mọc dại là chi tiết câu chuyện (không phải lore).

# Review · Cổng 2 · script-anim v4 (bé làm bối cảnh, Kết A) (Boss)
174 từ. Bé chỉ là bối cảnh (không thẻ/HP), có mặt đúng lúc tạo nguy hiểm (R2 "It turns to the kid"). Hook khớp khung R2. HP nhất quán (G 35% thắng). Kết A đúng quy tắc: bé an toàn + cú lửng theo lore Vrykolakas (một tiếng gõ cửa). **ĐẠT 10/10.**

# Review · Cổng 3 · bản HOẠT HÌNH v4 (Boss)
**ĐẠT (bản 1).** 102.7 s, −14.2 LUFS, 3082 khung. Split roll có tiêu đề MONSTER/GUARDIAN, máu bên monster, hào quang bên guardian. Grim có rim light; bé núp sau bia; phòng ngủ + tiếng gõ ở cú lửng.
Nâng cấp lần sau: cụm phụ đề lẻ ("IT", "IT GRABS GRIM'S" cắt sau sở hữu cách); nhân vật vẫn nhỏ ở cảnh rộng (25–40%); Grim che mất bé ở vài cảnh; tỏi lộ ra trước khi được nhắc; cảnh chó chôn dưới nhà thờ tối, nhỏ; tay Vrykolakas lún dưới mặt đất khi bị đè; chưa có slow-mo thật; font phụ đề là Inter (chưa cài Oswald).

# Review · Cổng 2 · script-anim v5 (mạch lạc, cinematic) (Boss)
220 từ, 51+ cảnh (~1.8 s/cảnh). Lời dẫn đã liền mạch có từ nối, cài tỏi/bia/luật tường trước khi dùng. Sửa v5.1: "red light returns" → "his strength returns"; thêm "Grim wins." ở K.O. **ĐẠT.**

# Review · Cổng 3 · bản HOẠT HÌNH CINEMATIC v5.1 (Boss)
**ĐẠT.** 89.7 s, −14.2 LUFS, 55 cảnh cut theo từ. POV đèn pin, OTS qua vai bé, low-angle trồi mộ, ECU hàm/mắt, versus, high-angle, phòng ngủ + gõ cửa. Phụ đề không vượt câu.
Nâng cấp lần sau: cảnh "Legend says a dog lies buried here" gần như đen; Grim che bé ở vài cảnh rộng; phụ đề đè mặt ở cảnh cận; rừng POV vẫn phẳng; font Inter (chưa có Oswald).

# Review · Cổng 2 · script-anim v6 (Boss)
227 từ (217 lời dẫn + 10 thoại), 35 cảnh có MATCH/[REPOSITION], 180° giữ đúng. Thoại cuối Grim ↔ bé tách đúng bằng narration.py (2 character lines). Cú lửng: xác Vrykolakas lấp ló sau cửa sổ, cắt đen trước khi bé thấy. Cảnh chó chôn sáng rõ. **ĐẠT 10/10.**

# Review · Cổng 3 · anim v6 (Boss)
**ĐẠT.** 96.8 s, −14.2 LUFS, 180° check pass. Bé v2, Grim/bé nói, cảnh chó chôn sáng, phụ đề Bebas Neue né mặt. Còn yếu: xác sau cửa sổ hơi hoạt hình chưa đủ rợn; rừng POV phẳng; phụ đề cận có lúc đè mặt đất.
