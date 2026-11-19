# 02 · Công thức viết kịch bản

> ⚡ **Phiên bản nâng cấp** (hook mạnh hơn + kết lựa chọn A/B): xem [04-hook-va-ket-lua-chon-AB.md](04-hook-va-ket-lua-chon-AB.md). Khung 9 nhịp dưới đây là cấu trúc gốc của video mẫu; khung 10 nhịp ở tài liệu 04 dựa trên nó.

Mục tiêu: **60–90 giây, 150–200 từ (tiếng Anh) / 180–230 từ (tiếng Việt)**, ngôi thứ 2, có luật lệ và cú lật.

## Khung 9 nhịp (copy được cho mọi quái vật)

| # | Nhịp | Thời lượng | Việc cần làm | Ví dụ (La Llorona) |
|---|---|---|---|---|
| 1 | **Hook/Intro series** | 3–5s | Hiệu ứng "chọn quái vật" + tên quái vật | Spin → LA LLORONA |
| 2 | **Địa điểm + giờ** | 3s | Một câu, cụ thể, có giờ khuya | "New Mexico. 1:13 A.M." |
| 3 | **Bạn ở đâu, với ai** | 5s | Cài **một nhân vật phụ** (sẽ dùng cho twist) | "Your little sister Sofia sleeps in the next bed." |
| 4 | **Luật lệ (1–3 luật)** | 6–8s | Luật phải *cụ thể, dễ nhớ, dễ phá* | "Don't look. Never answer." |
| 5 | **Dấu hiệu đầu tiên** | 8–10s | Âm thanh/ánh sáng lạ + câu thoại đặc trưng của quái vật | "Crying. Far away. *Where are my children?*" |
| 6 | **Lore 1 câu** | 4–5s | Vì sao nó tồn tại (1–2 câu, không hơn) | "She drowned her own children…" |
| 7 | **"Mẹo"/quy tắc ngược** | 4s | Một luật ngầm làm điều tưởng an toàn thành nguy hiểm | "If she sounds far, she's right next to you." |
| 8 | **Leo thang 3 bậc** | 20–25s | Gần hơn → trong phòng → chạm vào bạn. Kèm thử thách (nín thở, đếm…) | chăn → dấu chân → bàn tay → đếm 100 |
| 9 | **Giả an toàn → TWIST → jumpscare → CTA** | 15s | Hạ nhịp, rồi lật bằng chi tiết đã cài ở nhịp 3 hoặc 4. Kết 1 từ. | "She never said a word. And you just answered." → "MINE." → Who's next? |

## Quy tắc câu chữ

- Câu **2–6 từ**. Tối đa 10 từ. Không dùng mệnh đề phụ dài.
- Thì hiện tại: "You hear…", "It stops…".
- Mỗi câu nên có **1 từ khóa** (danh từ/động từ giác quan) → từ đó sẽ được tô đỏ trong phụ đề. Đánh dấu bằng `*từ*` trong file kịch bản.
- Dùng **5 giác quan**, nhất là âm thanh và xúc giác (lạnh, ướt, nặng).
- Lặp từ để tạo nhịp: "Quieter. Quieter." / "Closer. Closer."
- Câu thoại của quái vật phải **ngắn, lặp lại được, dễ nhại lại** (meme-able): "Where are my children?"
- Twist phải **trả lời được bằng 1 câu** và dùng lại chi tiết đã nói. Không giới thiệu thông tin mới ở twist.

## Các kiểu twist dùng lại được

1. **Phá luật mà không biết** – nhân vật đã vô tình làm điều bị cấm (mẫu La Llorona).
2. **Người thân là giả** – "Mom is downstairs. Mom texted: *I'm still at work.*"
3. **Ngược vị trí** – "It's not trying to get in. It's trying to get *out*."
4. **Đếm sai** – "There are 3 beds. You brought 2 friends."
5. **Bạn mới là quái vật** – "The mirror shows the room. Without you."
6. **Luật là bẫy** – người đặt luật chính là quái vật.

## Prompt mẫu cho AI (Claude / ChatGPT)

```text
Write a 95-second vertical horror short script in second person ("you").
Monster: <MONSTER / LEGEND>, origin: <COUNTRY>.
Structure (strict):
0) HOOK (max 10 words, first 2 seconds): a survival statistic, a flash-forward
   ("4 minutes earlier..."), or a deadly rule. It must promise a choice at the end.
1) Location + exact late-night time (1 line)
2) Where you are and ONE side character who will matter later (clue 1)
3) 2-3 rules given by an elder; one rule hides a loophole (clue 2)
4) First sign of the monster + its signature repeated line
5) One-sentence legend + "Here's the trick:" a reverse rule (clue 3)
6) 3-step escalation getting physically closer, with a timer or meter
7) CHOICE POINT: freeze. Option A vs Option B. Both must feel reasonable;
   the correct one is counter-intuitive but provable from clues 1-3.
8) ENDING A (death): jumpscare, final on-screen word.
9) ENDING B (survive, but with one last creepy detail).
10) CTA asking viewers to comment A or B and rewatch for the clue.
Rules: 200-240 words total. Sentences 2-6 words. Present tense.
Wrap ONE key word per sentence in *asterisks*.
Also output a scene list: for each 1-3 sentences give [SCENE: visual] and [SFX: sound].
```

Template trống: [`templates/script-template.md`](../templates/script-template.md) · Ví dụ hoàn chỉnh: [`examples/ma-da/script.md`](../examples/ma-da/script.md).
