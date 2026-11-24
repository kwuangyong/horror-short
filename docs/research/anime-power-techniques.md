# Kỹ thuật anime: sức mạnh, cảnh đánh, cận mặt, tạo hình

Mục đích: áp dụng cho hoạt hình cutout flat-vector 2D (SVG rig, render từng khung) trong format Battle Spin (docs/07).
Trạng thái: nghiên cứu bằng tìm kiếm web. Nhiều trang không tải được (xem mục "Tình trạng nguồn" cuối file), nên các dòng có "CHƯA XÁC MINH" chỉ dựa trên kiến thức chung, cần kiểm lại trước khi trích dẫn.

Cách đọc bảng: cột **Nguồn** là mã [Sn] ở mục "Nguồn". "—" nghĩa là không có nguồn trong kết quả tìm được. Tên tác phẩm trong cột "Ví dụ" chỉ dùng để tham chiếu, không chép hình.

## 1. Khung hình & camera

| # | Kỹ thuật (EN) | Mô tả | Ví dụ tác phẩm | Cách làm trong SVG cutout | Độ khó | Nguồn |
|---|---|---|---|---|---|---|
| 1 | Extreme eye close-up | Khung chỉ mắt, chiếm phần lớn khung, báo nội tâm hoặc sát khí | Fullmetal Alchemist: Brotherhood (phân tích cận mặt) | Tách mắt thành group riêng, scale 2–3× quanh tâm mắt; đồng tử và highlight là shape riêng | Thấp | [S18], [S16] |
| 2 | Dutch angle | Xoay khung 10–20° để tạo bất ổn | Nhiều anime, manga, visual novel | Xoay root group quanh tâm khung; giữ nhân vật chính bằng counter-rotate | Thấp | [S13], [S14] |
| 3 | Low-angle hero shot | Nhìn từ dưới, nhân vật cao lớn, uy quyền | Hero/villain reveal phổ biến (CHƯA XÁC MINH tên cụ thể) | Đẩy đường chân trời xuống thấp, phóng nhân vật ~1.2×, nền tối dần lên | Thấp | [S15] |
| 4 | 360° orbit camera | Camera quay quanh nhân vật để lộ nhiều góc | Action anime hiện đại (CHƯA XÁC MINH) | Không có 3D: dùng 3 layer góc (chính diện / 3-4 / nghiêng), hoán đổi kèm scaleX và skew | Cao | — |
| 5 | Tracking through occluders | Camera bám qua vật cản tiền cảnh | Action anime phổ biến | Layer tiền cảnh chuyển động nhanh hơn nền (parallax); nhân vật lộ ra từ sau mask | TB | — |
| 6 | Split-screen face-off | Chia khung cho hai đối thủ đối mặt | Anime đối đầu (CHƯA XÁC MINH) | Hai clipPath dọc, mỗi bên một nhân vật; đường chia nghiêng theo Dutch angle | Thấp | — |
| 7 | Mirror / reflection shot | Nhân vật phản chiếu trên nước, gương, vũng máu | Horror/psychological anime (CHƯA XÁC MINH) | Nhân bản group, scaleY(-1), opacity 0.3; feDisplacementMap nhẹ tạo gợn | TB | — |
| 8 | Silhouette vs fire/moon | Nhân vật đen đặc trước nguồn sáng | Phổ biến trong key art anime | Fill một màu đen; rim light là stroke sáng ở mép; nền radialGradient đỏ/trăng | Thấp | — |

## 2. Hiệu ứng hành động

| # | Kỹ thuật (EN) | Mô tả | Ví dụ tác phẩm | Cách làm trong SVG cutout | Độ khó | Nguồn |
|---|---|---|---|---|---|---|
| 9 | Impact frame | 1–2 khung đảo màu, nền đen/trắng, tia nứt khi va chạm | Dragon Ball Super: Broly (sizzle reel) [S5]; Demon Slayer [S1] | Chèn 1–2 khung: rect #fff/#000 + filter invert; polygon tia nứt. Khung ngắn nhất ở 12 fps | Thấp | [S2], [S3], [S5] |
| 10 | Speed lines / focus lines | Vạch tỏa từ tâm hoặc theo hướng chuyển động | Phổ biến trong shonen | N path tia từ tâm; stroke-dasharray + dashoffset để chạy; chỉ 1–2 khung | Thấp | [S6], [S7], [S8] |
| 11 | Smear frame | Khung kéo dài hoặc nhiều bản sao để giả chuyển động | Snippet nêu Naruto Shippuden (CHƯA XÁC MINH) | Scale X 1.3 + 2–3 bản copy opacity 0.4 lệch theo quỹ đạo; giữ 1–2 khung | TB | [S9], [S10], [S12] |
| 12 | Hit-stop / freeze | Đóng băng 2–4 khung ngay khi va chạm | Phổ biến (CHƯA XÁC MINH) | Trong timeline giữ nguyên transform N khung; chỉ hiệu ứng rung/particle vẫn chạy | Thấp | — |
| 13 | Screen shake | Rung camera theo hướng đòn | Demon Slayer (ufotable) [S1, S24] | Dịch root group ±6–12 px, giảm dần trong 4–6 khung, hướng ngược đòn. Một nguồn nói rung ở 24 fps trên hoạt hình 12 fps | Thấp | [S1] (1 nguồn), [S24] |
| 14 | Chromatic aberration | Tách kênh RGB ở mép khi bị đánh | Phổ biến trong action hiện đại (CHƯA XÁC MINH) | Nhân bản layer, fill đỏ và xanh, lệch ±3 px, mix-blend-mode: screen | Thấp | — |
| 15 | Shockwave ring | Vòng lan từ điểm va chạm | Phổ biến (kiến thức chung) | Circle stroke scale 0→3, opacity 1→0 trong 6–8 khung | Thấp | [S25] (tham khảo VFX) |
| 16 | Debris | Mảnh vụn bay ra | Phổ biến (CHƯA XÁC MINH) | 10–20 polygon nhỏ, quỹ đạo parabol, ít xoay để tiết kiệm | TB | — |
| 17 | Beam clash | Hai tia năng lượng đối nhau, điểm giao là ranh giới | Dragon Ball kiểu Kamehameha [S25] | Hai path gradient; clipPath điểm giao kéo qua lại; độ dày theo sức mạnh | Cao | [S25] |
| 18 | Anticipation / wind-up | Lùi lại trước đòn rồi bật tới | Nguyên tắc hoạt hình chung | 2–4 khung lùi ngược chiều đòn, release 1–2 khung | Thấp | [S4] |

## 3. Màn khoe sức mạnh

| # | Kỹ thuật (EN) | Mô tả | Ví dụ tác phẩm | Cách làm trong SVG cutout | Độ khó | Nguồn |
|---|---|---|---|---|---|---|
| 19 | Power-up aura | Ánh sáng bao quanh, nhấp nháy, tăng dần | Dragon Ball (battle aura) [S20] | Path glow + feGaussianBlur, mix-blend add; scale 1.0→1.08 và opacity 0.6–1.0 nhấp nháy | TB | [S20], [S21] |
| 20 | Transformation sequence | Bóng đen → lộ nét → đổi màu | Dragon Ball, Demon Slayer (CHƯA XÁC MINH) | 3 trạng thái SVG: silhouette, outline, màu đầy đủ; crossfade 6–12 khung | Cao | — |
| 21 | Glowing sigils / runes | Ký hiệu phát sáng xoay quanh nhân vật | Phổ biến trong anime phù chú (CHƯA XÁC MINH) | Path ký hiệu; stroke-dashoffset để vẽ dần; rotate chậm quanh tâm | TB | — |
| 22 | Eye glow trail | Vệt sáng theo chuyển động mắt | Phổ biến (CHƯA XÁC MINH) | Path stroke bám quỹ đạo mắt, fade opacity 1→0 trong 4–6 khung | Thấp | — |
| 23 | Ground cracking | Mặt đất nứt lan từ điểm đứng | Phổ biến (CHƯA XÁC MINH) | Path zigzag đen, stroke-dashoffset chạy từ điểm nổ | TB | — |
| 24 | Slow-mo + particles | Chậm lại, hạt bay độc lập | Phổ biến | Giữ nhân vật ở 12 fps; particle chạy ở 24 fps trên layer riêng | TB | [S1] |
| 25 | Awakening color shift | Đổi palette nhân vật theo giai đoạn | Phổ biến (CHƯA XÁC MINH) | fill="var(--c)"; đổi biến CSS qua 2–3 bảng màu theo cảnh | Thấp | — |

## 4. Tạo hình nhân vật mạnh / đáng sợ

| # | Kỹ thuật (EN) | Mô tả | Ví dụ tác phẩm | Cách làm trong SVG cutout | Độ khó | Nguồn |
|---|---|---|---|---|---|---|
| 26 | Shape language | Tam giác/nhọn = nguy hiểm; tròn = thân thiện | Nguyên tắc thiết kế nhân vật chung | Guardian: góc nhọn ở vai, áo, kiếm; monster: góc sắc, thân vuông méo | Thấp | — |
| 27 | Guardian energy palette | Glow, gradient, rim light hai màu đối nhau, particles | Dragon Ball, Demon Slayer (glow) [S21] | Gradient 3 điểm (lõi trắng → màu → tối); rim stroke cyan + magenta; particle nhỏ | TB | [S21], [S25] |
| 28 | Monster distorted proportions | Tay dài, đầu nghiêng, thân gập | Phổ biến trong horror anime (CHƯA XÁC MINH) | Skew và scale không đều trên group; giữ silhouette đọc được ở thumbnail | TB | — |
| 29 | Monster glowing eyes | Mắt đỏ/vàng đơn sắc phát sáng | Phổ biến (CHƯA XÁC MINH) | Hai circle radialGradient, feGaussianBlur nhẹ, flicker opacity | Thấp | — |
| 30 | Black veins & torn mouth | Gân đen nổi, miệng xé rộng | Phổ biến (CHƯA XÁC MINH) | Path gân stroke 2–4 px, dashoffset để nổi lên; răng là tam giác lặp | TB | — |
| 31 | Blood trails & grainy texture | Vệt máu, bề mặt sần | Phổ biến (CHƯA XÁC MINH) | Path đỏ đậm dạng drip; feTurbulence overlay opacity ~0.15. Máu theo luật an toàn của kịch bản | TB | — |

## 5. Nhịp dựng

| # | Kỹ thuật (EN) | Mô tả | Ví dụ tác phẩm | Cách làm trong SVG cutout | Độ khó | Nguồn |
|---|---|---|---|---|---|---|
| 32 | Cut on beat | Cắt đúng nhịp nhạc | Anime opening phổ biến (CHƯA XÁC MINH) | Liệt kê thời điểm beat trong timeline; snap điểm cắt vào beat gần nhất | Thấp | — |
| 33 | Build-up → release | Tăng nhịp cắt và zoom, rồi bùng nổ | Phổ biến | Độ dài cảnh giảm 1.0 s → 0.3 s; khung release là impact frame (#9) | TB | — |
| 34 | Quiet before impact | Khung tĩnh 0.3–0.5 s trước đòn | Nguyên tắc anticipation | Hold 6–10 khung ở 12 fps; SFX drone nổi lên trong khoảng lặng | Thấp | [S4] |
| 35 | 180° rule & reverse cut | Giữ camera một phía trục; cắt chéo có chủ ý tạo mất định hướng | Paprika (theo nguồn tìm được) | Khai báo trục nhân vật trong file scene; reverse cut chỉ dùng cho beat nhấn | Thấp | [S22], [S23] |

## Ghi chú kỹ thuật cho render

- Chạy ở 12 fps cho nhân vật, 24 fps cho camera và particle (một nguồn mô tả cách này ở Demon Slayer [S1]). Cần tự thử để xác nhận trên rig.
- Hiệu ứng nhanh (impact, smear, flash) chỉ 1–3 khung. Nguồn SEO [S26] nói 1–3 khung; con số này chưa được xác minh.
- Filter SVG (feGaussianBlur, feTurbulence, feDisplacementMap) nặng khi render nhiều khung. Nên cache glow và texture thành layer riêng.
- Sự khác biệt giữa "đẹp" và "rẻ" thường nằm ở việc không lạm dụng. Smear và speed lines dùng quá nhiều sẽ mất tác dụng (nguồn [S10], [S12]).

## Rủi ro bản quyền

- Đây là kỹ thuật phong cách chung, không phải tài sản của một tác phẩm. Không sao chép khung, layout, hay bố cục cụ thể của Dragon Ball, Demon Slayer, Jujutsu Kaisen, Fullmetal Alchemist.
- Tên tác phẩm trong file chỉ để tham chiếu. Không đưa hình ảnh từ phim hay game vào repo.
- Nhạc và SFX cho impact/aura cần lấy từ nguồn có giấy phép (việc của scout loại `assets`).

## Tình trạng nguồn

- Đã đọc được đoạn tóm tắt từ kết quả tìm kiếm (không mở được toàn bộ trang) cho hầu hết nguồn dưới đây.
- Không mở được do DNS bị chặn trong phiên: jbsiraudin.github.io [S1], animationobsessive.substack.com, knowyourmeme.com, en.wikipedia.org (smear), drunkenanimeblog.com [S13]. Cần cho phép các domain này để kiểm lại.
- Chưa tìm được bài phân tích quy trình sản xuất của studio (ví dụ phỏng vấn animator Dragon Ball, Jujutsu Kaisen black flash). Nguồn đang có chỉ là fan article hoặc blog.

## Nguồn

- [S1] Demon Slayer visual grammar (blog phân tích, chỉ đoạn tìm kiếm): https://jbsiraudin.github.io/blog/demon-slayer-visual-grammar
- [S2] How to Draw Impact Frames (Loughborough LBAS): https://lbas.lboro.ac.uk/drawing/how-to-draw-impact-frames.html
- [S3] Learn how to add accents to your animations with impact frames (80.lv): https://80.lv/articles/learn-how-to-add-accents-to-your-animations-with-impact-frames
- [S4] Anticipation impacts (bài học art379): https://sites.google.com/view/art379/lessons/anticipation-impacts
- [S5] Dragon Ball Super Broly impact frames sizzle reel (ComicBook): https://comicbook.com/anime/news/dragon-ball-super-broly-impact-frames-sizzle-reel/
- [S6] Create anime speed lines in After Effects (PremiumBeat): https://www.premiumbeat.com/blog/create-anime-speed-lines-after-effects/
- [S7] Speed lines and Focus lines (Clip Studio Paint manual): https://help.clip-studio.com/en-us/manual_en/540_comic/Speed_lines_and_Focus_lines.htm
- [S8] Creating Focus Lines (Clip Studio tips): https://tips.clip-studio.com/en-us/articles/4603
- [S9] How to use motion blur or smearing in animation (Clip Studio tips): https://tips.clip-studio.com/en-us/articles/6170
- [S10] The Art of Smear Frames (Bloop Animation): https://www.bloopanimation.com/the-art-of-smear-frames/
- [S11] The partial and mostly lost history of animation smear terminology (Cartoon Research): https://cartoonresearch.com/index.php/the-partial-and-mostly-lost-history-of-animation-smear-terminology/
- [S12] How Smear Frames Enhance Animation (CG Wire): https://blog.cg-wire.com/smear-frames/
- [S13] Dutch angles in anime (Drunken Anime Blog, chỉ đoạn tìm kiếm, ý kiến blog): https://drunkenanimeblog.com/2019/09/17/dutch-angles-in-anime/
- [S14] Dutch Angle (TV Tropes): https://tvtropes.org/pmwiki/pmwiki.php/Main/DutchAngle
- [S15] Camera angles and their storytelling impact (Fiveable): https://library.fiveable.me/directing/unit-6/camera-angles-storytelling-impact/study-guide/hYHEs1h7D2tQ3TRD
- [S16] Manga Cinematography Best Practices (LLMWiki): https://kulisama81.github.io/LLMWiki/source-manga-cinematography
- [S17] Anime News Network Answerman (2018-01-31): https://www.animenewsnetwork.com/answerman/2018-01-31/.127150
- [S18] Essay về facial close-up trong Fullmetal Alchemist: Brotherhood (BYU Aperture): https://aperture.byu.edu/?p=483
- [S19] MAPPA black flash, Jujutsu Kaisen ep. 44 (Sportskeeda): https://sportskeeda.com/anime/mappa-makes-underrated-move-jujutsu-kaisen-flashiest-episode-44
- [S20] Battle Aura (TV Tropes): https://tvtropes.org/pmwiki/pmwiki.php/Main/BattleAura
- [S21] Anime style aura tutorial (Blender Artists): https://blenderartists.org/t/anime-style-aura-tutorial/1165451
- [S22] Screen Direction (LMU Filmmaking): https://lmu.pressbooks.pub/filmmaking/chapter/screen-direction/
- [S23] 180-degree rule (Columbia film glossary): https://filmglossary.ccnmtl.columbia.edu/term/180-degree-rule
- [S24] Why It Works: The Digital Arenas of Demon Slayer's Battles (Wrong Every Time): https://wrongeverytime.com/2019/05/06/why-it-works-the-digital-arenas-of-demon-slayers-battles
- [S25] Crafting a Kamehameha-like VFX (80.lv): https://80.lv/articles/crafting-a-kamehameha-like-vfx-001agt/
- [S26] How to draw dynamic action scenes like Japanese animators (Alibaba, SEO, độ tin cậy thấp): https://www.alibaba.com/product-insights/how-to-draw-dynamic-action-scenes-like-japanese-animators.html
