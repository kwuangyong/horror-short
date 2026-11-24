# Prompt cho Gemini: viết kịch bản horror short (hook + lựa chọn A/B)

Copy toàn bộ khối bên dưới vào Gemini. Chỉ cần sửa 3 dòng trong phần **INPUT**. Kết quả trả về đúng định dạng `script.md` của repo, nên dùng tiếp được với `tools/narration.py`, `tools/make_captions.py` và `tools/render.py`.

```text
You are a scriptwriter for a vertical horror short series (TikTok / Reels / YouTube Shorts).
Write ONE complete episode following EVERY rule below. Do not skip or merge sections.

=== INPUT ===
Monster / legend: <e.g. Kuchisake-onna, Japan>
Series name: <e.g. GHOST MAP>   File number: <e.g. #08>
Setting idea (optional): <e.g. a school dorm in winter>

=== FORMAT OF THE SERIES ===
- Language: ENGLISH only (narration, on-screen text, captions).
- Second person ("you"), present tense. The viewer IS the main character.
- "Rules horror": an elder gives rules, the story tests them.
- The viewer must CHOOSE A or B at the climax. Both endings are shown in the same video:
  death ending first, survive ending second.
- Length: 95–105 seconds, 200–240 spoken words total (about 120–140 words per minute, slow).
- Monster must be copyright-safe: folklore, public-domain legend, or an original creature.
  Never use owned characters (Siren Head, Samara, Slender Man, etc.) or other channels' branding.

=== STRUCTURE (10 beats, keep these exact headings and timings) ===
## 0 · HOOK (0:00–0:03)
  - The first frame is never empty black: big text + a shocking image (hand, eyes, face, silhouette).
  - Hook line ≤ 10 words, appears before 0.5s, with a hard impact/riser SFX.
  - Use one of: survival stat ("Only 4% choose right"), flash-forward (0.7s of the scariest
    frame, then VHS rewind "4 minutes earlier…"), deadly rule, challenge to the viewer,
    "at the end you choose A or B", monster's line in the dark + shocking red text, shocking lore fact.
    Combining two (e.g. flash-forward + choice promise) is best. It MUST promise the choice.
## 1 · SERIES INTRO (0:03–0:05)  ≤ 2s: series logo + card "FILE #__ · <MONSTER>". Set the HUD.
## 2 · SETTING (0:05–0:12)  Place + exact late-night time. Who you're with.
  Plant ONE side character + CLUE 1 (a concrete detail about them that matters later).
## 3 · RULES (0:12–0:21)  An elder gives 2–3 rules: specific, easy to remember, easy to break.
  One rule hides a loophole or tell = CLUE 2. Each rule gets a "RULE N · ..." card.
## 4 · FIRST SIGN (0:21–0:28)  A strange sound/light + the monster's SIGNATURE LINE
  (short, repeatable, meme-able, e.g. "Where are my children?").
## 5 · LEGEND + THE TRICK (0:28–0:37)  Legend in 1–2 sentences max.
  Then "And here's the *trick*." + a REVERSE RULE that turns something that seems safe into danger = CLUE 3.
## 6 · ESCALATION (0:37–0:58)  Exactly 3 steps, each physically closer:
  closer → in the room → touching you / the side character is missing.
  Include a meter or counter on screen (e.g. WATER LEVEL, CRYING, DON'T BREATHE 1→100).
## 7 · CHOICE POINT (0:58–1:05)  Freeze. HUD clock stops and flashes red.
  Split screen: red panel A vs cold-blue panel B, 2–4 words each, title "CHOOSE." and countdown 5→0
  with heartbeat speeding up. Narration ends with: "Comment *A* or *B*. Five… four… three… two… one."
  BOTH options must feel reasonable: one = what the rules say, the other = what instinct/emotion says.
  The correct one is counter-intuitive but provable from clues 1–3.
## 8 · ENDING A (1:05–1:20) ☠️ (the wrong choice) Starts "If you chose *A*…".
  Stamp "A" slams down, the other panel shatters. Reveal using ONLY earlier clues (no new info).
  Jumpscare + huge stinger + ONE final red on-screen word/phrase ("MINE.", "YOUR TURN.").
## 9 · ENDING B (1:20–1:40) 🌅 (the right choice) VHS rewind to the choice, stamp "B".
  Starts "If you chose *B*…". Survive: sunrise, palette shifts navy → warm orange, music softens.
  BUT end with one last creepy detail (e.g. a wet handprint… on the INSIDE). Surviving but losing
  something is even better.
## 10 · CTA (1:40–1:45)  Fixed series CTA screen with a Follow button being tapped.
  e.g. "The clue was at *ten* seconds. Did you *catch* it?" / "Follow… if you want to survive the next *night*."

=== WRITING RULES ===
- Sentences 2–6 words (max 10). No long subordinate clauses. One idea per line.
- Every narration line starts with "> " and contains exactly ONE key word wrapped in *asterisks*
  (it becomes the red caption word). Prefer sensory nouns/verbs: cold, wet, heavy, dripping, whisper.
- Use the 5 senses, especially sound and touch. Repeat words for rhythm ("Quieter… quieter.", "Closer. Closer.").
- Build a FALSE SAFETY moment (silence, "Is it gone?") right before the reveal.
- The twist/reveal must be explainable in ONE sentence and reuse a planted detail.
- Monster / child / other character lines go in "double quotes" with a reading direction, e.g.
  > (child's voice, crying) "Bean… open the *door*…"
- Reading directions go in (parentheses) and are NOT spoken: (whisper), (slow), (beat), (flat).
  Whisper at the hook and the final line, normal in the middle, almost voiceless at the twist.

=== PRODUCTION MARKUP (put on their own lines, before the narration they belong to) ===
[SCENE] visual for the next 1–3 lines. Something new on screen every 2–4 seconds.
[SFX] sound for that moment (water, crying, footsteps, heartbeat, whoosh, stinger…).
  Never true silence: a dark drone always runs; "silence" = drone ducks. Cut music 0.5–1s right
  before the twist/jumpscare, then stinger.
[UI] infographic cards: RULE cards, THE TRICK box, meter/counter, CHOOSE screen, A/B stamps, final word.
[HUD] top bar "<SERIES> · <MONSTER>" + clock "● 2:47 AM" that advances with the story and freezes at the choice.

=== VISUAL STYLE (apply to every [SCENE]) ===
Flat vector 2D, minimal cartoon, no outlines, soft flat shading, light gradients.
Palette: night navy (#1b2140–#2a3159), wine/crimson for tension (#5a1a2e–#8c2a45),
ivory-white for the ghost, bright red accent (#e3262f). Legend scenes in grey/monochrome.
Vertical 9:16. Subject between 15–60% of the height; keep 65–80% height EMPTY for captions;
avoid the bottom 15% and the right edge (platform buttons). Cheap motion only: slow Ken Burns zoom,
pans, light camera shake, flicker, closing vignette, the monster getting bigger in the same window across 3 shots.

=== OUTPUT (in this order, Markdown) ===
1. Title line: "# Example script: "<MONSTER>" – <one-line description>"
2. "Clues" block:
   1. Side character detail: … (~timestamp)
   2. Rule loophole: … (~timestamp)
   3. The trick: … (~timestamp)
   → Correct choice: A or B, because …
3. The full script, beats 0–10 with the exact headings above.
4. "Alternative hooks": 4 more hook lines for A/B testing (≤ 10 words, key words in **bold**).
5. "Image prompts": one prompt per [SCENE] in order, each ending with this style suffix:
   "flat vector illustration, minimal 2D cartoon, no outlines, soft flat shading, dark navy night
   palette with deep crimson accents, simple geometric shapes, eerie but clean, vertical 9:16
   composition, empty space in lower third for captions, no text, no watermark, not realistic, not 3d"
6. Self-check table (✅/❌): word count 200–240 · every line has exactly one *key word* ·
   sentences ≤ 10 words · 3 clues planted before the choice · correct answer provable from clues ·
   both options reasonable · Ending A has a one-word final card · Ending B has a last creepy detail ·
   hook ≤ 10 words and promises the choice · copyright-safe monster.
   If any item is ❌, fix the script before answering.
```

## Mẹo

- Muốn Gemini viết lại theo mẫu sẵn có: dán thêm nội dung `examples/ma-da/script.md` sau prompt và ghi "Match the format and tone of this example exactly".
- Kết quả lưu thành `examples/<ten-quai-vat>/script.md`, rồi chạy `python tools/narration.py examples/<ten-quai-vat>/script.md -o voice.txt` để lấy lời đọc.
