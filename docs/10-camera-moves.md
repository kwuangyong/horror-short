# 10 · Góc máy & chuyển động máy "đạo diễn" (Horror Short + Dark Myth)

Mục tiêu: mỗi cảnh là **một quyết định đạo diễn**, không chỉ push+pan. Ba chuyển động chữ ký (giống bảng storyboard "01 PULL BACK · 02 DOLLY ZOOM · 03 CRANE + LAND") nay có sẵn trong engine `tools/anim/stage.js` và gắn được vào **mọi loại shot** (`wide`, `cu`, `low`, `high`, `versus`, `follow`...).

Demo: `node tools/anim/demo/camera_moves_demo.js && node tools/anim/render.js --timeline tools/anim/demo/camera_moves_demo.json --out cm.mp4` · ảnh mẫu: `tools/anim/demo/camera-moves-sheet.jpg`.

## 1. Ba chuyển động chữ ký

| # | Tên | Tham số shot | Cảm xúc | Dùng khi |
|---|---|---|---|---|
| 01 | **PULL BACK** (lùi máy hé lộ) | `pullback:{k:2.6, ease:'outCubic', rise:40}` (hoặc `pullback:2.6`) | "Hóa ra nó to thế này" / cô độc | Mở cảnh monster khổng lồ, lộ địa hình trồi lên, cảnh kết hé lộ cú lửng, bé nhỏ bé giữa chiến trường |
| 02 | **DOLLY ZOOM** (vertigo) | `dolly:{k:1.9, ease:'inOut'}` (k>1 nền phình về phía nhân vật, k<1 nền lùi xa) | Choáng, nhận ra sự thật, sợ hãi | Guardian nhận ra điểm yếu, bé thấy monster, khoảnh khắc "it's behind you", trước đòn quyết định |
| 03 | **CRANE + LAND** (cần cẩu hạ xuống, đáp) | `crane:{dy:-700, from:0.72, to:1, zoom:0.8, land:true}` | Uy nghi, "người hùng đã đến" | Guardian đáp xuống, intro góc thần thánh, kết thúc trận khi khói tan |

Chi tiết kỹ thuật:
- `pullback.k`: zoom đầu shot = zoom × k, ease về zoom gốc. `rise`: camera trượt dọc (px) trong lúc lùi.
- `dolly.k`: nhân vật (layer parallax = 1) **giữ nguyên cỡ**, chỉ các layer nền (parallax < 1 + domain) đổi tỉ lệ ×1 → ×k. Để nhân vật đứng yên giữa khung, không dùng `push` cùng lúc.
- `crane.dy`: độ lệch dọc lúc bắt đầu (âm = máy ở trên cao), `from`→`to`: độ nén dọc (sy, < 1 = nhìn từ trên xuống), `zoom`: hệ số zoom đầu shot, `land:true`: đáp với overshoot nhẹ (outBack); nên thêm `shake` 0.3 s ngay mốc đáp.
- Validator coi `pullback`/`dolly`/`crane` là có chuyển động (không phải khung tĩnh).

## 2. Bảng góc máy đầy đủ (từ vựng chung writer ↔ producer)

| Góc | Engine | Ý nghĩa |
|---|---|---|
| Establishing / wide | `wide` / `establish` + zoom 0.55–0.9 | Không gian, quy mô |
| Low angle | `low` (`ground`, `sy` 1.1–1.2) | Quyền lực, quái vật đe dọa |
| High angle / bird's eye | `high` (`sy` 0.7) | Yếu thế (bé, nạn nhân) |
| Close-up / ECU | `cu` (`fill`) / `ecu` (`at:'eye'`) | Cảm xúc, mắt quái |
| Over-the-shoulder | `ots` | Đối đầu, góc nhìn bé |
| POV | `pov` / `povgate` | Nhập vai horror |
| Versus 2-shot | `versus` | Hai bên đối mặt, giữ 180° |
| Tracking | `follow` + whip | Lao tới, bay theo đạn |
| Dutch | `dutch`/`dutchTo` | Không gian méo, điên loạn |
| Handheld | `hand: 3–8` | Hoảng loạn, tài liệu tìm thấy |
| Rack focus | `rack:{bg,fg}` | Chuyển chú ý (bé ↔ bóng phía sau) |
| Crash zoom | `crash:{at,k}` | Va chạm, đòn kết |
| Slow-mo | `slow: 0.3–0.5` | Đòn kết, khoảnh khắc trước va chạm |
| **Pull back / Dolly zoom / Crane + land** | `pullback` / `dolly` / `crane` | Xem mục 1 |

## 3. Cách dùng trong một tập

**Writer** (`script-anim.md`): ghi rõ chuyển động trong `[SHOT]`, ví dụ `[SHOT] CU Apep eye → PULL BACK reveal the coils (2.6x)`, `[SHOT] DOLLY ZOOM on Thor as he spots the scar`, `[SHOT] CRANE + LAND: high above, descend as Thor lands`.

**Producer** (timeline):
```js
S(t, 'cu',  { actor: 'mon', pullback: { k: 2.6, rise: 40 } });            // 01
S(t, 'cu',  { actor: 'gua', dolly: { k: 1.9 }, tr: { type: 'whip', dir: 1 } }); // 02
S(t, 'low', { actor: 'gua', crane: { dy: -700, from: 0.72, land: true } }); // 03
tl.shake.push({ t0: t + dur * 0.9, dur: 0.3, amp: 10 });                   // cú đáp
```

**Định mức mỗi tập (85–100 s, 50–60 cảnh):**
- PULL BACK: 2–4 lần (bắt buộc 1 lần lúc địa hình monster trồi lên hoặc lộ quy mô monster).
- DOLLY ZOOM: 1–2 lần, **chỉ** ở khoảnh khắc nhận ra (lạm dụng mất tác dụng); dài 1.2–2 s.
- CRANE + LAND: 1–2 lần (intro guardian hoặc guardian đáp xuống chắn đòn đầu).
- Không ghép 2 chuyển động chữ ký liền nhau; xen bằng cảnh cắt nhanh để giữ tempo.

## 4. Học mở rộng (tự luyện)
1. Xem demo, đổi `k`, `dy`, `ease` (`lin`, `inOut`, `outCubic`) và so sánh khung bằng `--dump`.
2. Phân tích 1 cảnh phim/anime: ghi `góc · chuyển động · lý do cảm xúc` vào `docs/research/` rồi dịch sang tham số engine.
3. Kết hợp an toàn: `crane` + `dutch` nhẹ (thần thánh méo mó), `pullback` + `slow` (kết trận), `dolly` + `rack` (bé phát hiện bóng sau lưng).
4. Horror thuần (không đánh nhau): dolly zoom vào bé khi cửa sổ có mặt quái, pull back từ mắt ra căn phòng trống, crane xuống nghĩa địa mở đầu.
