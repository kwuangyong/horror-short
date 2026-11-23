# 06 · Dàn nhạc agent: Opus chỉ huy, Haiku trinh sát, Sonnet thi công

Mục tiêu: dùng đúng model cho đúng việc. Opus đắt nhưng giỏi phán đoán, nên chỉ **ra quyết định và duyệt**. Haiku rẻ và nhanh, nên lo **việc đọc nhiều, tìm nhiều**. Sonnet cân bằng, nên lo **việc làm ra sản phẩm**: viết kịch bản và dựng video.

## Sơ đồ

```
                       ┌──────────────────────────────┐
   Người dùng ───────▶ │  BOSS · Opus (phiên chính)   │ ◀─── báo cáo cuối
   /episode <quái vật> │  brief · giao việc · 3 cổng  │
                       └──────┬───────────┬───────────┘
              song song       │           │            tuần tự
        ┌─────────────────────┘           └───────────────┐
        ▼                                                 ▼
 ┌──────────────┐   ┌──────────────┐   Cổng 1   ┌──────────────┐   Cổng 2   ┌──────────────┐   Cổng 3
 │ scout · lore │   │scout · assets│ ─────────▶ │writer·Sonnet │ ─────────▶ │producer·Sonnet│ ─────────▶ Chốt
 │    Haiku     │   │    Haiku     │            │ script/hook/ │            │ tools/ render │
 └──────┬───────┘   └──────┬───────┘            │  shotlist    │            │  QC, preview  │
        ▼                  ▼                    └──────┬───────┘            └──────┬────────┘
  01-research.md     02-assets.md            script.md hooks.md           project.json qc.md
                                             shotlist.md                  preview/*.jpg
                         ▲                          ▲   review.md (Boss)        │
                         └── giao lại nếu thiếu ────┴──── lỗi nội dung ◀────────┘
```

## Vai trò

### Boss · Opus (phiên chính)
- Viết brief, chọn hướng twist, quyết đáp án A/B.
- Giao việc: prompt tự đủ (slug, file vào/ra, tiêu chí xong).
- Duyệt 3 cổng: research → kịch bản → bản dựng. **Chỉ Boss được chuyển cổng.**
- Quy tắc bảo vệ chi phí: Boss không tự đi tìm tài liệu hay chạy render; giao xuống.

### `scout` · Haiku
- `lore`: truyền thuyết, dấu hiệu, luật dân gian, chi tiết giác quan, rủi ro bản quyền, nguồn.
- `assets`: nhạc, SFX, phông, ảnh tham chiếu **có giấy phép ghi rõ**.
- `trend`: hook và video đang chạy tốt cùng chủ đề (dùng vidIQ nếu có).
- Không sáng tác, không đoán giấy phép.

### `writer` · Sonnet
- Kịch bản tiếng Anh theo khung 10 nhịp + điểm chọn A/B (doc 02, 04).
- 3 phương án hook, 3 tiêu đề, mô tả + hashtag.
- Shotlist kèm prompt ảnh theo style prompt cố định (doc 03, bước 4).
- Tự kiểm checklist trước khi nộp; sửa theo `review.md`.

### `producer` · Sonnet
- Chạy toàn bộ `tools/`: narration → voice_fx → transcribe → captions → cards → render.
- Tạo placeholder khi thiếu ảnh/giọng thật, ghi rõ trong `qc.md`.
- QC: độ dài, LUFS ≈ −14, vùng phụ đề, contact sheet.
- Không sửa nội dung kịch bản.

## Cấu trúc thư mục một tập

```
episodes/<slug>/
├── 00-brief.md        Boss
├── 01-research.md     scout (lore, trend)
├── 02-assets.md       scout (assets)
├── script.md          writer
├── hooks.md           writer
├── shotlist.md        writer
├── review.md          Boss (điểm + góp ý từng vòng)
├── art/               ảnh thật (người dùng hoặc AI tạo ảnh)
├── voice.mp3          giọng thật (nếu có)
├── project.json       producer
├── build.sh           producer
├── qc.md              producer
├── preview/           producer (contact sheet)
└── build/             file sinh ra (gitignore)
```

## Vì sao giao tiếp qua file
- Agent con không thấy hội thoại của Boss; file là "bộ nhớ chung" duy nhất.
- Mỗi agent trả về bản tóm tắt ≤ 10–12 dòng, nên ngữ cảnh của Boss (Opus, đắt) không bị lấp đầy bởi trang web hay log ffmpeg.
- Lịch sử sửa nằm trong `review.md` và `## Changelog` của `script.md`, dễ xem lại.

## Cách dùng

Mở Claude Code trong repo (phiên chính sẽ tự chạy Opus theo `.claude/settings.json`), rồi gõ:

```text
/episode Kuchisake-onna
```

Chỉ làm tới kịch bản (chưa dựng):

```text
/episode Wendigo --until script
```

Gọi lẻ từng agent khi cần:

```text
Dùng scout tìm 5 SFX tiếng nước nhỏ giọt CC0 cho tập ma-da
```

## Mở rộng sau này
- Thêm `artist` (Sonnet) nếu có công cụ tạo ảnh (vd. vidIQ `image_generate`): nhận `shotlist.md`, xuất `art/*.png` đồng bộ style.
- Thêm `publisher` (Haiku) để chấm tiêu đề/thumbnail và lên lịch đăng qua vidIQ, luôn cần Boss duyệt trước khi đăng.
- Đổi model một agent: sửa dòng `model:` trong `.claude/agents/<tên>.md` (`haiku`, `sonnet`, `opus`, `inherit`).
