# 08 · Hệ thống biến thể: mỗi tập một tổ hợp khác

Mục tiêu: các tập **không lặp mô típ**. Mỗi tập Boss chọn **1 ô ở mỗi bảng A–F**, ghi tổ hợp vào [`episodes/_registry.md`](../episodes/_registry.md).

**Luật chống lặp (bắt buộc):**
- Không dùng lại **cùng ô của bảng A, B hoặc C trong 3 tập liên tiếp**.
- **Không bao giờ** lặp nguyên tổ hợp A+B+C.
- E (kiểu mở đầu) và F (thời tiết) không trùng tập liền trước.

Luật nền theo [`docs/07`](07-format-battle-spin.md): hook in medias res, Split-Roll + 2 intro ~5 s, bé chạy đi nấp rồi bị ẩn suốt 1v1, một chiến trường duy nhất, Sakuga Cinematic, tempo vừa. Nhân vật lấy từ [`docs/09`](09-kho-nhan-vat.md).

## A. Hình dạng trận đấu
| # | Kiểu | Diễn biến |
|---|---|---|
| A1 | Lật kèo kinh điển | Guardian áp đảo → monster lật kèo bằng giới hạn guardian → đảo chiều bằng lore đã cài |
| A2 | Áp đảo tuyệt đối (guardian) | Guardian nghiền nát monster; căng thẳng nằm ở cái giá phải trả hoặc cú lửng |
| A3 | Áp đảo tuyệt đối (monster) | Monster vượt trội, guardian thua từng nhịp; kết bằng hy sinh / mưu mẹo / cứu bé phút chót |
| A4 | Ngang tài | `beam-clash` giằng co nhiều lần; phân thắng bằng chi tiết lore nhỏ (lời nguyền, giờ khắc, vật phẩm) |
| A5 | Kẻ thù chung | Guardian và monster tạm hợp sức trước mối đe dọa thứ ba, rồi quay lại đánh nhau |
| A6 | Hiểu lầm | Thứ tưởng là monster hóa ra vô hại, hoặc guardian hóa ra nguy hiểm (lore phải cho phép) |
| A7 | Rượt đuổi | Không đánh tay đôi suốt; guardian cầm chân monster qua nhiều điểm của **cùng một chiến trường** |

## B. Số phận đứa bé
| # | Kiểu |
|---|---|
| B1 | An toàn |
| B2 | **Tử nạn rồi được cứu hồn** (guardian dẫn hồn về, đổi mạng, đảo thời gian theo lore). Cái chết **chỉ bằng ẩn ý**: đèn pin lăn rồi tắt phụt, tay buông, chớp trắng. Không máu |
| B3 | Bị kéo vào thế giới khác rồi được đưa về, nhưng không còn như cũ (mắt đổi màu, bóng sai) |
| B4 | Mất tích, số phận bỏ ngỏ ("Do you think the kid survived?") |
| B5 | Bé tự cứu mình bằng mẹo lore từ chỗ nấp, guardian chỉ hỗ trợ |
| B6 | Bé trả giá (mất giọng, mất trí nhớ đêm đó, mang dấu vết của guardian) |

Luật chung mọi ô B: bé chạy ra khỏi khung khi guardian chắn đòn đầu, bị ẩn suốt 1v1, chỉ quay lại khi có **đòn lạc / biến cố số phận** và lúc kết trận.

## C. Kết lửng (luôn dựa trên **điều kiện lore**; monster/hậu quả phải **lộ diện bằng hình**)
| # | Kết lửng |
|---|---|
| C1 | Monster chết nhưng **hồi sinh**: trồi lên nói một câu / tro tàn vẫn cử động / đất mộ động |
| C2 | Monster **bị giam**, nhưng phong ấn nứt (xiềng, đinh, bia, cổng đỏ rỉ sáng) |
| C3 | **Có nhiều hơn một**: camera kéo ra thấy hàng chục con khác |
| C4 | Monster **theo về nhà bé**: sau cửa sổ, dưới gầm giường, trong gương |
| C5 | Bé **mang theo** một phần monster (vết cắn đen lan, giọng nói lạ, phản chiếu là monster) |
| C6 | **Guardian kiệt sức / biến chất**: aura tắt dần, mắt đổi màu |
| C7 | **Đổi vai**: guardian hóa ra cũng muốn bé (cái giá, khế ước) |
| C8 | **Vòng lặp**: đêm sau đồng hồ lại chỉ đúng giờ đó, hook lặp lại |
| C9 | **Nhá tập sau**: monster hấp hối gọi tên monster khác; cột Split-Roll tự quay ô tiếp theo |
| C10 | **Cái giá**: guardian thắng nhưng người thân của bé gặp điềm báo |

CTA đi theo kết: "Is it really dead?" · "Did the kid survive?" · "Who should fight it next?" · "Would you let it in?"…

## D. Không gian (≥ 3 không gian mỗi tập)
Mỗi tập có tối thiểu: **lãnh địa Monster** (intro) + **lãnh địa Guardian** (intro) + **một chiến trường duy nhất** cho 1v1. Có thể thêm nơi bé đi lạc trước khi chiến trường hiện ra, và nơi diễn ra cú lửng.
- Chiến trường: rừng thông đêm · nghĩa địa nhà thờ · cầu gỗ trên sông · cánh đồng ngô giữa trưa · đầm lầy Louisiana · làng tuyết Nga · đường ray bỏ hoang · bệnh viện cũ · hầm mộ · đỉnh núi đá · bờ biển đá đen · đền Nhật bỏ hoang trên núi.
- Lãnh địa (scene `domain-<key>`, motif `monoliths` / `spires` / `columns` / `runes`): R'lyeh chìm (cột đá nghiêng, xanh độc) · địa ngục gai đá (đỏ máu) · âm phủ Hy Lạp · Valhalla băng · đền thờ cột trắng (vàng thánh) · rừng tiên Celtic · cổng torii sương mù.
- Địa hình monster **trồi lên ngay trên chiến trường** (prop `monolith`/`spire`), không đổi phông giữa trận.
- Phòng ngủ của bé chỉ dùng cho cú lửng, không dùng mọi tập.

## E. Kiểu mở đầu
Hook 0–3 s luôn *in medias res*, nhưng đổi **khoảnh khắc được chọn** và **cách câu chuyện bắt đầu sau VS**:
| # | Khoảnh khắc hook | Câu chuyện bắt đầu bằng |
|---|---|---|
| E1 | `beam-clash` giữa trận | POV bé đi lạc |
| E2 | Đòn bắt giữ chí mạng (monster túm guardian / xúc tu quấn) | Bé đang ngủ thì bị gọi |
| E3 | `slash` xuyên màn hình chém đôi khung | Bé chơi trốn tìm |
| E4 | `pillar` thức tỉnh của guardian | Bé theo vật lạ (đom đóm, quả bóng, tiếng hát) |
| E5 | Monster lao thẳng vào ống kính (crash-zoom) | Cảnh monster đang săn |
| E6 | `orbs` bủa vây guardian | Guardian đang canh gác |

## F. Thời điểm / thời tiết
Nửa đêm trăng tròn · mưa bão sấm chớp · tuyết rơi · sương mù dày · giữa trưa nắng gắt (ma ban ngày) · nhật thực · rạng đông.

## G. Sức mạnh (bắt buộc có nguồn)
- Research có file **`episodes/<slug>/01-research-powers.md`**: bảng cho từng nhân vật, mỗi dòng gồm tên sức mạnh · nguồn gốc (truyền thuyết / tác phẩm Public Domain + **link**) · hình ảnh hóa (fx nào: `beam`, `orbs`, `slash`, `pillar`, `glint`, prop, action rig) · giới hạn.
- Mỗi tập: guardian khoe **≥ 3** sức mạnh có nguồn, monster **≥ 3**. Mỗi lần khoe là **chuỗi 2–4 cảnh**: chuẩn bị → kích hoạt → tác động → hậu quả.
- Chi tiết sáng tạo để dẫn chuyện phải ghi chú *"câu chuyện"*. Không trình bày như sự thật dân gian.
- Kỹ thuật dàn cảnh: [`docs/research/anime-power-techniques.md`](research/anime-power-techniques.md).

## H. Tạo hình nhân vật
- **Guardian = năng lượng, phép thuật**: `rim` light sáng rõ trên nền tối; `aura` 2–3 lớp gradient theo nguồn gốc (Hy Lạp vàng–trắng, Bắc Âu xanh băng–trắng, Slav lửa cam, Celtic/Anh bạc–xanh trăng, Nhật trắng–đỏ son); ký hiệu/phù chú phát sáng khi dùng sức mạnh; mắt lóe vệt sáng (`glint`); tư thế hero (góc thấp, ngực mở). Shape language: khối vững, đường cong mạnh.
- **Monster = kinh dị**: tỉ lệ bất đối xứng (tay quá dài, gai nhọn, nhiều xúc tu / đốt xương, cổ gãy, miệng xé tới mang tai); gân sáng hoặc nhầy/máu **mức hoạt hình** (không gore thực tế); mắt phát sáng dị dạng hoặc đen kịt; `aura` màu bệnh hoạn; chuyển động giật cục. Shape language: tam giác, gai nhọn.
- **Quy mô**: monster khổng lồ theo lore → áp đảo khung hình, thân thành địa hình chiến trường (docs/07 mục 8 "Quy mô khổng lồ"). Guardian vẫn phải đọc rõ: rim light + aura, mặt không bị che.
- Ngoại lệ an toàn: monster hình trẻ con → kinh dị bằng mắt, da, tư thế, không máu. THE KID không bao giờ có máu.
- Mỗi nhân vật mới: turnaround + bảng màu + 3 pose khoe sức mạnh, Boss duyệt trước khi dựng.

## I. Quy trình áp dụng (Boss)
1. Mở `episodes/_registry.md`, chọn tổ hợp A·B·C·D·E·F không vi phạm luật chống lặp; ghi lý do khớp lore cặp đấu.
2. Brief ghi tổ hợp + danh sách sức mạnh cần research.
3. Scout viết `01-research.md` (lore) + `01-research-powers.md` (bảng sức mạnh có link). Cổng 1 không đạt nếu thiếu nguồn cho sức mạnh dùng trong tập.
4. Writer viết theo tổ hợp; Producer dựng theo docs/07 + mục H; Boss duyệt 3 cổng.
