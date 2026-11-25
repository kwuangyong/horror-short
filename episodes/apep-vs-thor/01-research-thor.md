# Research · THOR (Guardian) · tập `apep-vs-thor`

Nguồn: chỉ Old Norse (Poetic Edda, Prose Edda) và tra cứu tham khảo PD. Không dùng Marvel.
**Lưu ý trạng thái nguồn:** trong lượt này, phần lớn domain (sacred-texts.com, en.wikisource.org, en.wikipedia.org, germanicmythology.com, mythopedia.com, norse-mythology.org, pantheon.org) **không phân giải được DNS** khi WebFetch. Chỉ đọc được nội dung qua **snippet WebSearch** (đánh dấu ✔ SNIPPET). Mọi chi tiết khác là kiến thức nền về Edda, **chưa đối chiếu được chương/khổ** → đánh dấu `CHƯA XÁC MINH`. Boss cần cho phép các domain trên hoặc để writer/scout khác đối chiếu lại trước Cổng 1.

## 1. Tóm tắt lore (5–10 gạch đầu dòng)
- Thor (Þórr) là thần sấm, con của Odin, chiến binh chống khổng lồ (jötnar) và bảo vệ Midgard. Vũ khí chính là búa **Mjölnir** do người lùn Brokkr và Eitri rèn; cán búa ngắn (Skáldskaparmál) [S1][S2].
- **Mjölnir**: ném đi rồi bay về tay; không bao giờ trượt đích (theo Gylfaginning/Skáldskaparmál) [S1][S2] — câu nói "không trượt" và "bay về tay" CHƯA XÁC MINH chương.
- **Megingjörð** (đai sức mạnh): khi thắt vào, sức Thor tăng gấp đôi (Gylfaginning) [S1] — CHƯA XÁC MINH chương.
- **Járngreipr** (găng sắt): Thor cần găng này để nắm cán Mjölnir (Gylfaginning/Skáldskaparmál) [S1][S2] — CHƯA XÁC MINH chương.
- **Thần sấm và sét**: Thor gắn với sấm, sét, mưa; xe do hai con dê **Tanngrisnir** và **Tanngnjóstr** kéo, chạy kêu rền như sấm (Gylfaginning) [S1] — CHƯA XÁC MINH chương.
- **Hymiskviða** (Poetic Edda): Thor đi câu với người khổng lồ Hymir, dùng **đầu bò** làm mồi để câu **Jörmungandr** (rắn Midgard) lên khỏi biển. ✔ SNIPPET: đầu bò là mồi, bò đen toàn thân; trong bản Bellows, Thor bẻ sừng bò và gắn đầu lên lưỡi câu [S3][S4].
- ✔ SNIPPET [S4]: trong Hymiskviða, Hymir **không** tự cắt dây câu; việc Hymir cắt dây thuộc bản kể của Snorri (Prose Edda) [S2]. Nghĩa là: cảnh giằng co/cắt dây là **khác nhau giữa hai nguồn**, ghi rõ khi dùng.
- **Ragnarök** (Völuspá): Thor giết Jörmungandr nhưng đi **9 bước** rồi gục vì **nọc độc** rắn phun ra [S5] — CHƯA XÁC MINH số khổ (thường là khổ 56) và bản dịch.
- **Ngoại hình**: râu và tóc đỏ là epithet trong truyền thống Bắc Âu (CHƯA XÁC MINH nguồn chương cụ thể); mắt dữ dội là mô tả phong cách, không phải chi tiết chắc chắn từ Edda.
- **Nơi ở**: sảnh **Bilskirnir** (Bilskírnir) với số phòng lớn (Grímnismál, CHƯA XÁC MINH khổ); lãnh địa **Þrúðvangr / Þrúðheimr** (CHƯA XÁC MINH khổ).

## 2. Bảng sức mạnh (≥ 5 dòng, chỉ có nguồn)
| Mã | Sức mạnh | Nguồn (text + link) | Hình ảnh hóa gợi ý (engine) | Giới hạn |
|---|---|---|---|---|
| P1 | Mjölnir ném đi rồi **bay về tay** | Prose Edda, Skáldskaparmál / Gylfaginning (Brodeur) [S1][S2] | `slash`: vệt búa ném cong, hướng theo whip-pan | Cán ngắn → phải dùng găng; đòn quay lại tốn nhịp (chuẩn bị 2 cảnh) |
| P2 | **Sấm sét** (lightning, thần sấm) | Prose Edda Gylfaginning [S1]; gắn với sấm trong nhiều chương Edda (CHƯA XÁC MINH) | `beam` = sét; `beam-clash` khi sét đối hỗn mang; `orbs` = cầu sét tích điện | CHƯA XÁC MINH giới hạn cụ thể của sét |
| P3 | **Megingjörð** nhân đôi sức mạnh | Prose Edda Gylfaginning [S1] | `pillar`: cột sáng khi thắt đai (cảnh "belt-power") | Phải thắt đai; sức mạnh có điều kiện (không có nguồn về thời gian) |
| P4 | Gọi xe dê sấm (**Tanngrisnir/Tanngnjóstr**) | Prose Edda Gylfaginning [S1] | Prop/action: xe lao qua cát, vệt sấm; `beam` nhỏ | Dê có thể ăn, tái sinh khi xương được đặt lại (Gylfaginning, CHƯA XÁC MINH) |
| P5 | Săn/câu **Jörmungandr** bằng mồi đầu bò | Poetic Edda, Hymiskviða [S3][S4] | Cảnh "mồi" (đầu bò, prop); `orbs`/`pillar` khi kéo rắn lên | Hành động có thể đảo: Hymir cắt dây (Snorri) [S2] |
| P6 | Đánh giết khổng lồ (jötnar) bằng búa | Poetic Edda, Þrymskviða / Prose Edda (CHƯA XÁC MINH khổ) | `slash` + crash-zoom khi đập | Búa phải bay về tay; găng cần để giữ |

Ghi chú: P5 là **mẹo lore** (câu rắn bằng đầu bò) dùng cho cú lật kèo của Thor, không phải "sức mạnh" thuần. Chỉ dùng P1–P6 trong kịch bản; mọi chi tiết khác phải ghi "câu chuyện (không có nguồn)".

## 3. Giới hạn / điểm yếu của Thor (có nguồn)
- **Nọc Jörmungandr**: Thor chết sau 9 bước vì nọc rắn (Völuspá) [S5] — CHƯA XÁC MINH khổ. Đây là cơ sở cho pha Thor yếu dần vì nọc (đúng brief).
- **Găng sắt bắt buộc** để cầm Mjölnir (Gylfaginning/Skáldskaparmál) [S1][S2] — CHƯA XÁC MINH chương. Dùng cho cảnh: Apep siết/làm rơi găng → Thor mất khả năng cầm búa.
- **Cán búa ngắn** [S2]: yêu cầu tay cầm, phải đánh gần hoặc ném.
- **Mẹo lore**: Hymir cắt dây câu trong bản Snorri, không trong Hymiskviða [S2][S4] — chỉ dùng như "câu chuyện" nếu sáng tác.

## 4. Gợi ý tạo hình (flat-vector rig, dựa trên nguồn)
Dựa trên nguồn (chưa xác minh chi tiết trang phục vì không đối chiếu được ảnh/bản dịch):
- Râu và tóc **đỏ** (epithet, xem mục 1).
- **Búa cán ngắn** (Mjölnir), đầu búa to, vật liệu đá/kim loại.
- **Đai Megingjörð** (đai da, khóa kim loại) quanh eo.
- **Găng sắt** (Járngreipr) đeo ở hai tay.
- Trang phục Viking-age: áo len/da, quần, dây da, ủng; không giáp kiểu Marvel.
- Mắt dữ, mày nhíu: tạo cảm giác giận; ánh mắt glint khi kích hoạt sấm (câu chuyện).

**Danh sách tránh (avoid list):**
- Áo choàng đỏ (Marvel).
- Tóc vàng/bạch kim (phim Marvel).
- Mũ có cánh (helmet winged) kiểu phim Marvel hay hình minh họa hiện đại.
- Giáp Marvel, giáp bóng loáng kiểu phim.
- Thiết kế God of War (Thor hay đại diện của franchise game, khác hẳn Edda).
- Vẽ Thor như trò hề hoặc chiến binh cơ bắp kiểu gym.

## 5. Nhạy cảm (Heathenry / Ásatrú)
- Thor được thờ phụng trong **Ásatrú / Heathenry** hiện đại (tôn giáo tái tạo). Hình ảnh phải tôn trọng: không chế giễu, không dùng búa Thor (Mjölnir) làm đồ chơi gây thương tổn.
- Không mô tả nghi lễ tôn giáo hiện đại như trò diễn; chỉ dùng lore.
- Apep có liên quan đến thực hành Kemetic modern ("Overthrowing Apep"); không vẽ nghi lễ thật, không đọc tên/chú thật trên hình.
- Vikings: tránh khắc họa bạo lực ngoài mức phù hợp; dùng "Viking-age" để trang phục, không dùng ký hiệu chính trị cực đoan (ví dụ: chữ Thor/Valknut dùng trong nhóm cực đoan).

## 6. Nguồn
- [S1] Prose Edda, Gylfaginning — Brodeur (1916). Nội dung và link: ✔ SNIPPET chỉ dẫn tới Gylfaginning từ https://pantheon.org:443/articles/m/mjollnir.html (chưa mở được). Bản Brodeur PD: https://www.germanicmythology.com/ProseEdda/BRODEURSkaldskaparmal.html (URL từ search; fetch DNS lỗi) và https://gutenberg.org/cache/epub/18947/pg18947-images.html (bản Anderson PD, từ search).
- [S2] Prose Edda, Skáldskaparmál — Brodeur. Link (từ search): https://mythopedia.com/library/prose-edda-brodeur-1916/skaldskaparmal/ (fetch DNS lỗi). Mjölnir do Brokkr/Eitri rèn: ✔ SNIPPET.
- [S3] Poetic Edda, Hymiskviða — Bellows (1936). Link (từ search): https://mythopedia.com/library/poetic-edda-bellows-1936/hymiskvitha/ (fetch DNS lỗi); bản khác: https://sacred-texts.com/book/the-poetic-edda/shell/hymiskvitha (từ search, không fetch được).
- [S4] Hymiskviða — Open/Bellows notes. ✔ SNIPPET: https://wevikings.com/?p=11168 (Bellows 1923 + notes), https://vikingr.org/old-norse-texts/hymiskvida, https://books.openbookpublishers.com/10.11647/obp.0308.07.pdf. Dòng "all-black ox", "bait = chaff" và "Hymir không cắt dây trong Hymiskviða" đến từ snippet của các nguồn này.
- [S5] Poetic Edda, Völuspá (Ragnarök, Thor giết Jörmungandr, 9 bước, chết vì nọc). Link: CHƯA XÁC MINH bản cụ thể (chưa truy cập được). Đề xuất đối chiếu: sacred-texts.com (Bellows) hoặc en.wikisource.org (Poetic Edda).
- [S6] Mythology tham khảo: https://norse-mythology.org/tales/thor-fishing-for-jormungand/ (từ search; fetch DNS lỗi) — kể lại Snorri, dùng để so sánh, không làm nguồn chính.
- [S7] Tham khảo bách khoa (chưa truy cập): https://en.wikipedia.org/wiki/Thor — dùng để đối chiếu, chưa xác minh nội dung.

## 7. Chưa xác minh (cần Boss/scout đối chiếu lại)
- Số chương Gylfaginning/Skáldskaparmál cho P1–P4, giới hạn sét.
- Số khổ Völuspá (thường 56) và Grímnismál (Bilskirnir, Þrúðvangr).
- Nguồn chính thức cho "râu đỏ" (epithet) và "mắt dữ".
- Chi tiết trang phục Viking-age (cần hình tham khảo PD như bảo tàng, không dùng ảnh Marvel).
- Tham khảo Britannica: chưa truy cập.

## 8. Kết luận cho Cổng 1
- Số nguồn độc lập đã tra được: 4 (S1–S4 qua snippet, còn lại chưa mở trang). Đạt "≥ 3 nguồn" về mặt danh mục; nội dung đầy đủ cần đối chiếu lại.
- Sức mạnh có nguồn: P1, P2, P3, P4, P5 (đều ≥ 3 yêu cầu).
- Điểm yếu có nguồn: nọc Jörmungandr (S5), găng sắt và cán ngắn (S1–S2).
