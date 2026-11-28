# SVG Rig Design Blueprint · Episode #007: SCP-096 vs MEDUSA

> **Role**: Neon-1 (Gate 1 Reviewer & Horror Character Art Director)  
> **Target Consumers**: Carbon-1 (`buildScp096` in `tools/anim/rigs.js`) & Carbon-2 (`buildMedusa` in `tools/anim/rigs.js`)  
> **Reference Art**: `/home/antigravity/image_2.png` (SCP-096) · `/home/antigravity/image.png` (Medusa) · `buildScp682` (`tools/anim/rigs.js:1545-1860`)  
> **Engine Mandate**: Pure cubic-Bezier SVG anatomy (`C` / `Q`), local `defs` (`radialGradient` / `linearGradient` suffixed with `_${uid}`), multi-layer rim/core/shadow shading, **zero crude stick-polygon blocks**, strict `G.reg(...)` registration on all base skin/armor/garment fills (so Split-Roll `setSil(rig, 1)` turns the silhouette solid black while glowing eyes/cracks/auras pop), and full backward compatibility with every action, marker, and parameter in `episodes/scp096-vs-medusa/anim/make_timeline.js`.

---

## 0. Engine Compatibility Contract (`stage.js` + `make_timeline.js`)

Both upgraded rigs MUST preserve these exact API surfaces so `make_timeline.js`, `stage.js`, and `validate.js` run seamlessly:

1. **Rig Factory Signature & Registration**:
   - `const uid = ++_rigUid;` (shared counter already declared at `rigs.js:854`)
   - `const rig = newRig();` and `const pathR = (p, d, fill, extra) => G.reg($('path', Object.assign({ d, fill }, extra || {}), p), fill);`
   - Register solid anatomical paths via `pathR(...)` / `poly(...)` / `ell(...)`. Do **NOT** register overlay groups (`stone`, `crack`, `ichor`, eye glows, blood pools/gradients) into `G.reg` if their fill is `url(#...)` or toggled dynamically via opacity, OR ensure `G.reg` only receives hex `#rrggbb` colors (`mixc()` in `core.js:28` calls `parseInt(h.slice(...), 16)` which breaks on `url(#...)` or `rgba(...)`!).
   - **CRITICAL ENGINE GOTCHA**: Look at `core.js:28` (`parse(h)`): `setSil(rig, 1)` calls `mixc(c, silCol, s)` on every entry in `rig.fills`. Therefore, **ONLY pass `#rrggbb` hex strings to `pathR`, `poly`, `ell`, `limb`**. Any `url(#grad_uid)` or `rgba(...)` gradient overlay MUST use raw `$('path', { d, fill: gGrad, ... }, parent)` (exactly as `buildScp682` does on line 1588: `pathR(wg, memD, W_MEM); $('path', { d: memD, fill: gWMem, opacity: 0.85 }, wg);`).
2. **Coordinate System & Orientation**:
   - Origin `(0, 0)` = ground contact between feet / tail base. Character faces `+x` (right). `y` is negative upward (`head` around `y = -480..-535`).
   - `stage.js:684` `HEADSZ` & `HEADOFF`: keep head marker close to existing `HEADOFF` (`scp096: [10, -520]`, `medusa: [6, -460]`) and `rig.dynHead = true` so `cu`/`ecu` shots frame identically.
3. **Required Markers (`rig.mk`)**:
   - **SCP-096**: `eye`, `head`, `mouth`, `hand`, `claw`, `body`
   - **Medusa**: `eye`, `head`, `mouth`, `hand`, `snake`, `body`
4. **Required Actions**:
   - **SCP096**: `idle`, `idle-card`, `cower`, `trigger-unhinge`, `charge`, `claw-slash`, `grab-crush`, `roar`, `petrify-resist`, `petrified`, `hurt`, `talk`, `fade`
   - **MEDUSA**: `idle`, `idle-card`, `glide-watch`, `gaze-charge`, `gaze-blast`, `wing-dodge`, `bronze-slash`, `snake-strike`, `pinned`, `gaze-overdrive`, `breathe-after`, `walk-away`, `talk`, `fade`
5. **Split-Roll Card Framing**:
   - `make_timeline.js` sets `scp096` card `{ fx: 0, fy: 268, fscale: 0.48, idle: 'idle-card' }` and `medusa` card `{ fx: 0, fy: 262, fscale: 0.5, idle: 'idle-card' }`. Total standing height should sit ~`540..570 px` (`y = 0` down to `-560`) so cards, `versus`, and `high/low` shots match cleanly.

---

## 1. CARBON-1 BLUEPRINT: `buildScp096()` (Left · Monster)

### 1.1 Visual Reference Analysis (`/home/antigravity/image_2.png`)
From the SCP-096 reference sheet (`image_2.png`), the unmistakable horror silhouette rests on 5 anatomical pillars:
1. **Terrifyingly Emaciated Frame & Hunched Spine**: Not rectangular planks—a warped S-curved thoracic hump, paper-thin skin stretched taut over protruding **clavicles**, **individual curved ribs**, **sternum trench**, and a sharply **hollowed concave abdomen** pinching into a bony pelvis.
2. **Impossibly Long Arms (~1.5× torso) Reaching Past the Knees**: Thin, sinewy upper arms and hyper-elongated forearms hanging past mid-shin/knees, bridged by **knobby gaunt joints** (protruding shoulder acromion, sharp elbow olecranon, bony wrists, protruding knobby knees).
3. **Oversized Bloody Hooked Hands & Claws**: Huge elongated metacarpals/palms compared to thin wrists, fanning into 5 skeletal-thin **hooked claws/fingers** drenched from knuckle to talon in wet dripping arterial gore.
4. **Hairless Pale Skull & Hollow Abyssal Eye Sockets**: Smooth, elongated, slightly forward-tilted hairless cranium (`#EDEAE2`), sunken cheekbones, hollowed brow ridge casting black shadow into deep eye sockets (`#120E10`) with eerie pinprick pigmentless white irises (turning flare-crimson in rage).
5. **4× Vertical Jaw Unhinge & Dripping Blood**: When triggered (`jaw: 0 -> 1.35`), the mandible drops vertically down to upper-chest depth, stretching ragged crimson cheek-tendon webs around a cavernous pitch-black/blood-red gullet lined with **jagged, uneven, needle-like teeth** and **thick dripping blood trails** streaking down the chin, neck, and pale ribcage.

### 1.2 Color Palette & Local Gradients (`defs` with `_${uid}`)
| Token | Hex | Role |
|---|---|---|
| `SKIN_L` | `#F5F2EB` | Pale corpse-white highlight along clavicles, cranium dome, shin ridge, arm bone highlights |
| `SKIN` | `#E3DFD6` | Base depigmented pale flesh |
| `SKIN_M` | `#BFB9AC` | Gaunt muscle-trough midtone, far limbs |
| `SKIN_D` | `#8F887D` | Deep hollow abdomen, sunken rib troughs, far joint shadows |
| `SKIN_DD` | `#59534B` | Clavicle hollow, armpit crease, spinal concavity |
| `BONE` | `#FAF7EE` | Exposed indestructible skull bone (C2 crack), jagged teeth |
| `GORE_L` | `#FF3648` | Fresh wet arterial highlight on jaw tendons, bloody knuckles, chest drip edge |
| `GORE` | `#B80D1B` | Primary dried-and-wet blood on claws, chin trails, rib streaks |
| `GORE_D` | `#59050C` | Deep throat cavity, clotted blood shadow |
| `STONE_L` | `#9CA4AA` | Petrified marble highlight plane |
| `STONE` | `#6E767C` | Petrified stone base shell |
| `STONE_D` | `#40474D` | Deep granite crevice shadow |

**Local Gradients (`mkRad` / `mkLin`):**
- `gBodyShade`: linear gradient (`0,0 -> 1,0.3`) `#FFFFFF` (0) → `#8F887D` (0.35) → `#3B3530` (0.7) for 3D cylindrical rib/limb falloff.
- `gSkull`: radial gradient off-center top-right (`#FFFFFF` at 0 → `#E3DFD6` at 0.55 → `#7A736A` at 1) for eerie moonlight cranium sculpting.
- `gEyeFlare`: radial gradient (`#FFFFFF` 0 → `#FF3848` 0.4 → `#8F0510` 0.8 → `#000000` 0) for rage flare.
- `gBloodDrip`: linear gradient (`0,0 -> 0,1`) `#59050C` (0) → `#B80D1B` (0.55) → `#FF2E40` (1) for glossy wet gore trails.
- `gStone`: linear gradient (`0,0 -> 1,1`) `#AEB6BC` (0) → `#6E767C` (0.55) → `#333A40` (1) for chiseled granite look.
- `gCrackGlow`: radial gradient (`#FFFFFF` 0 → `#FF2438` 0.38 → `#8F0612` 0.78 → `#1A0204` 0) for C2 crimson skull fracture glow.

### 1.3 Joint Hierarchy & SVG Geometry Blueprint
Root & shadow:
- `g` → ground shadow `sh` (`ell(g, 0, 4, 118, 22, '#000000', { opacity: 0.52 })` — keep non-registered `fill: 'rgba(0,0,0,0.52)'` on `$('ellipse', ...)` just like existing code, NOT `ell()`, so `setSil` never touches it).
- `root = $('g', {}, g)`.
- **Pelvis / Root Body Pivot**: `body = joint(root, 0, -258)`. All torso/limb coordinates use absolute rig space inside `body.c`.

#### A. Emaciated Hunched Torso (`B = body.c`) — Coordinates `y = -270 .. -462`
1. **Pelvis & Sunken Concave Abdomen**:
   - Bony iliac hip silhouette (`M-24 -274 C-32 -258 -24 -238 -16 -232 L18 -232 C28 -242 30 -260 22 -274 Z`, `SKIN_M`) with iliac crest highlights (`SKIN_L`).
   - **Pinched Concave Waist / Abdomen**: Narrow waist curving inward (`w ≈ 26 px` at waist `y = -325`), expanding sharply up into the **flared bottom of the ribcage** (`y = -355`):
     `M-22 -268 C-14 -300 -12 -334 -28 -364 L30 -364 C16 -332 14 -300 22 -268 Z` (`SKIN`), layered with a deep hollowed **umbilical/abdominal concavity shadow** (`M-10 -274 C-4 -305 -6 -336 -18 -356 L14 -356 C4 -336 2 -305 8 -274 Z`, `SKIN_D`, `opacity: 0.65`) and vertical **rectus/linea alba tendon cord** (`stroke: SKIN_DD`).
2. **Hunched Thoracic Ribcage (`y = -356 .. -462`)**:
   - Asymmetric hunched upper torso silhouette: left back arches out into a **kyphotic thoracic hump** (`x = -46` at `y = -435`), chest protrudes slightly right (`x = +38`), shoulders pinched narrow/gaunt (`M-38 -454 C-48 -425 -42 -382 -28 -356 L30 -356 C44 -384 46 -424 34 -454 C14 -468 -18 -468 -38 -454 Z`, `SKIN`).
   - **Protruding Clavicles & Hollow Supraclavicular Trench**: Twin sharp S-curved collarbone ridges (`M-28 -452 Q-8 -440 4 -448 Q18 -440 34 -452`, `SKIN_L`, width 5) above dark recessed collarbone hollows (`SKIN_DD`, `opacity: 0.72`).
   - **7 Individual Curved Pale Ribs (`i = 0..6`)**: Looping across the ribcage (`y = -432` down to `-360`), each rib renders **two strokes/paths**:
     - Deep dark intercostal shadow groove underneath (`stroke: SKIN_D`, `stroke-width: 5.5`, `opacity: 0.75`).
     - Raised bony rib arc on top (`M-26 ${y} C-10 ${y+8} 10 ${y+10} 28 ${y-3}`, `stroke: SKIN_L`, `stroke-width: 4.5`) curving cleanly into a central **ridged sternum line** (`M4 -446 L6 -368`, `stroke: SKIN_M`, `stroke-width: 4`).
   - **Dorsal Vertebral Knobs**: Subtle sawtooth spine ridge along the hunched left back edge (`x = -42..-34`, `y = -445..-345`) for unmistakable starved horror silhouette even in profile.
   - **Chest Gore Trails (`chestBlood` group, toggled by `blood`)**: Irregular viscous cubic-Bezier crimson blood runs streaming from the neck/chin down over the sternum and dripping off the lower rib margin (`#B80D1B` base + `#FF3648` wet edge highlights + `gBloodDrip` overlay).

#### B. Gaunt Knobby Legs (`legB` at `(-10, -252)`, `legF` at `(12, -250)`)
- **Thigh (`joint` at hip)**: Ultra-thin skeletal femur silhouette (`w ≈ 20 -> 15 px`, `len ≈ 124 px`) with slight inward bow (`C-12 ... -8`), sunken muscle hollow stroke (`SKIN_D`), and **protruding knobby knee condyle** at the bottom (`y + 124`: twin-lobed bony patella + shadow crease, `rx: 12, ry: 13`).
- **Shin & Elongated Bony Foot (`joint` at knee `y + 124`)**: Bowed tibia (`len ≈ 128 px`, tapering `15 -> 10 px` to a **knobby ankle malleolus**), sharp pale shin-bone specular highlight (`SKIN_L`), and long gaunt skeletal foot (`-12` heel to `+34` clawed toes) grounded flat at `y = 0` with dark tendon striations.
- **Stone Shell**: Matching cubic-Bezier `.s096-stone` paths inside `hip` and `knee` using `STONE_D` / `STONE` / `STONE_L` + jagged crack lines (`stroke: #2A3035`, `opacity` driven by `P.stone`).

#### C. Impossibly Long Arms & Oversized Bloody Hooked Hands (`armB` at `(-30, -448)`, `armF` at `(30, -448)`)
- **Length Mandate**: Total arm length from shoulder `(-448)` to fingertip must reach **`~365 px`** (`upper: 172 px`, `forearm: 174 px`, `hand+claws: ~95 px`), so when relaxed downward, fingertips hang well **past the knees** (`y ≈ -448 + 365 = -83`, nearly mid-shin)!
- **Upper Arm (`shd` joint)**: Sharp protruding **bony acromion shoulder knob** (`ell(..., 13, 14)` + crescent shadow), hyper-thin humerus (`w: 18 -> 13 px`) with taut sinew groove.
- **Elbow & Forearm (`elb` joint at `sy + 172`)**: **Sharp jutting olecranon elbow spike** (`path` pointing slightly backward `-x`, `SKIN_L`), long thin double-boned radius/ulna forearm (`w: 14 -> 10 px`) flaring slightly at a **knobby wrist**.
- **Oversized Bloody Hooked Hand (`hand` joint at `sy + 346`)**:
  - Wide skeletal-gaunt metacarpal palm (`~28 px` wide × `40 px` long) with visible dorsal bone tendons (`SKIN_L` / `SKIN_D` troughs).
  - **5 Long Hooked Fingers/Claws** (`dx = -13, -6, +1, +8, +14`, thumb splayed inner-forward): curved cubic-Bezier talons (`len: 52..72 px`) tapering to razor hooks, coated with **irregular dripping arterial blood sleeves** (`class="s096-blood"`, `GORE` + `GORE_L` glossy edge + hanging droplet beads).
  - Markers: `handMk` on palm center, `clawMk` on middle claw tip.

#### D. Hairless Pale Skull, Deep Hollow Sockets & 4× Unhinging Jaw (`neck` at `(6, -456)` → `headG` at `(10, -492)`)
1. **Gaunt Neck**: Thin, corded neck tilting forward (`M-10 -454 C-8 -476 -2 -492 2 -504 L22 -502 C18 -484 14 -468 14 -452 Z`, `SKIN_D`), with visible **sternocleidomastoid tendons** straining forward.
2. **Upper Cranium (`headG`)**:
   - Sculpted hairless skull (`M-30 -518 C-34 -556 -10 -578 16 -576 C40 -574 52 -548 48 -518 C46 -504 40 -494 34 -488 L-14 -488 C-24 -496 -28 -506 -30 -518 Z`, `SKIN`), overlaid with `gSkull` radial moonlight highlight + stark temporal hollow shadow (`SKIN_D`) and protruding **zygomatic cheekbone shelf**.
   - **Deep Hollow Eye Sockets**: Twin recessed orbital cavities (`cx: 24, cy: -528`, `rx: 10, ry: 11` and far eye `cx: 2, cy: -528`, `rx: 7.5, ry: 10`) filled with dark orbital shadow (`#161214`), heavy brow shadow shelf above, and eerie **pinprick pigmentless white irises** (`r: 3.2`, `#FFFFFF`) that shift to burning crimson (`#FF3B4D` + `eyeFlare` radial glow) when `rage > 0.25`.
   - **Flat Nasal Bridge & Nostril Slits**: Twin pinched vertical slit nostrils (`#2E2628`) rather than a cartoon dot.
3. **Articulated 4× Unhinging Jaw (`jawG` + dynamic throat & dripping gore)**:
   - Upper palate & **8 jagged uneven upper teeth** (`#FAF7EE` / `#DFD7C4` alternating narrow spikes of varying lengths `7..13 px` stained at gumline `#6E0A12`).
   - **Dynamic Inner Gullet (`mouthCav`)**: Pitch-dark crimson-black vertical abyss (`#240206` core + `#6E0812` throat walls) stretching downward as `jaw` increases (`0 -> 1.4`, translating `jawG` down by `j * 54 px`!).
   - **Stretched Cheek Tendons & Blood Strands (`tendonL`, `tendonR`, `salivaBlood`)**: 4 taut ragged arterial sinew cords (`GORE` + `GORE_L`) bridging upper cheekbones down to the dropped mandible, plus **3 viscous crimson blood threads** spanning the open mouth that stretch and break as `jaw` hits `1.2+`!
   - **Lower Mandible (`jawG`)**: Tapered gaunt pale chin (`M-16 0 C-14 22 -4 34 10 36 C26 36 34 22 32 0 Z`), **7 jagged uneven lower teeth** pointing up, and **4 thick dripping blood trails** (`#B80D1B` / `#FF3648`) hanging down from the chin toward the chest.
4. **Dynamic Petrification Shell (`.s096-stone`, driven by `P.stone: 0..1`)**:
   - Every segment (`headG`, `jawG`, `torso`, `legB`, `legF`, `armB`, `armF`) carries precision-matched **sculpted grey granite overlays** (`STONE_L` lit plane, `STONE` base, `STONE_D` deep shadow) plus **jagged chiselled stone hairline cracks** (`stroke: #2B3136`) and `gStone` gradient sheen—so when `stone: 1.0`, SCP-096 looks like a terrifying **carved stone horror statue**, NOT flat grey rectangles!
   - In `apply(p)`, allow optional **progressive bottom-up / eye-down stone creep** when `stone` is between `0.05` and `0.95` (e.g., head/shoulders petrify first, or full uniform opacity `st`), while keeping `blood` fading out cleanly as flesh calcifies (`bl * (1 - st * 0.9)`).
5. **Dynamic Indestructible Skull-Bone Crack Reveal (`crackG` on `headG`, driven by `P.crack: 0..1`)**:
   - Positioned across the right/front cheek, temple, and unhinged stone jaw (`C2` cliffhanger `ecu` at `mouth` / `head`):
   - **Step 1 (`crack: 0..0.45`)**: Jagged glowing crimson fault lines (`#FF2438` outer glow + `#FFE6E8` hot core) fracture across the stone mandible and cheek; `crackGlow` radial light bleeds through.
   - **Step 2 (`crack: 0.45..1.0`)**: Broken grey granite shell fragments (`crackChunksG`) separate and drop downward (`translate(0, (c-0.4)*32) rotate(...)`), exposing **gleaming, intact, blinding white indestructible skull bone (`#FFFFFF` / `#FAF7EE`)** underneath with intact teeth and glowing crimson sub-surface bone resonance!

---

## 2. CARBON-2 BLUEPRINT: `buildMedusa()` (Right · Anti-Guardian)

### 2.1 Visual Reference Analysis (`/home/antigravity/image.png`)
From the Medusa reference board (`image.png`), Medusa must unite **chilling, sculptural classical Greek beauty & terror** with **authentic Pseudo-Apollodorus *Bibliotheca* 2.4.2 anatomy**:
1. **Chilling Sculpted Classical Greek Face**: Pale olive-jade marble complexion (`#9DB5A3` / `#BDD1C2`), razor-high sculpted cheekbones, hollow shadowed cheeks, straight Greek nose bridge, heavy dark-shadowed eyelids framing **blazing emerald slit-pupil eyes**, dark plum-black lips parting slightly to reveal **sharp white fangs**, and an **ornate antique gold-bronze Gorgon brow circlet** anchored by an emerald/serpent centerpiece.
2. **Dense Multi-Layered Serpent Hair Crown (14–18 Living Vipers)**: NOT 7 stiff sticks! Inspired directly by the dense, writhing, coiled masses in `image.png`, build **16 animated cubic-Bezier serpents** arranged in **two distinct depth layers**:
   - **Back Layer (8 dark emerald shadow vipers)**: framing the crown silhouette wide and high (`#123D27` body, `#0B2417` shadow, `#256B45` rim).
   - **Front Layer (8 vibrant scaled jade vipers)**: coiling forward over shoulders, temples, and forehead (`#2B945A` base, `#57D98C` dorsal scale pattern via `stroke-dasharray`, `#A6FFC4` specular highlight, `#D8C87A` ventral belly scutes).
   - Each viper ends in an articulated triangular **viper head** with **glowing emerald/gold slit eyes**, open fang-jaws on `snakeLunge`, and **flickering crimson forked tongue**.
3. **Apollodorus Golden Feathered Wings (Multi-Layered Plumage + `wingDmg`)**: Inspired by `buildPegasus`'s cohesive overlapping wing craft (`rigs.js:1914-1958`), replace the old triangular polygons with **two articulated wings (`wingB`, `wingF`)**, each built with:
   - Solid sculpted golden covert-backing blade (zero ugly gaps).
   - **10 overlapping curved primary flight feathers** (`#F0C24B` solar gold, `#FFF2B2` specular rim, `#9E6B18` warm bronze shadow).
   - **7 layered secondary covert feathers** + ornate sculpted golden shoulder-arch trim.
   - **Dynamic Fracture (`wingDmg: 0..1`)**: When `wingDmg > 0.2`, `wingF` visually splits along a mid-wing bone joint (`wingBrokenF` droops sharply downward at `-58°`, revealing bent quill shafts and dark bronze/ichor feather splatters—far more visceral than simply rotating an intact wing!).
4. **Apollodorus Brazen (Bronze) Arms & Razor Claws**: Sculpted pale olive-jade upper arms transitioning seamlessly through ornate Greek serpent-coil armlets into **forged bronze/brass forearms (`#C9843B` / `#FFE099` specular ridge / `#6E3F14` shadow)** and **gleaming bronze clawed hands** with 4 curved metallic talons.
5. **Dark Emerald-Gold Tattered Chiton & Coiled Serpentine Lower Body**:
   - **Upper Chiton Bodice**: Sculpted Greek draped folds (`#112921` / `#1D4235`), asymmetrical shoulder strap with **golden Gorgon clasp**, embossed **golden Greek meander (key-pattern) waist corset/sash** (`#F0C24B` / `#9E6B18`).
   - **Tattered Chiton Skirt & Coiled Serpentine Tail Base**: Split, windswept dark emerald-gold tattered skirt pleats flowing cleanly over an **S-coiled scaled serpentine lower body** (`2–3` thick cubic-Bezier serpent coils resting on the ground at `y = 0`, matching `buildTyphon`'s scale/belly-plate shader craft in deep jade-teal `#143B2A` / `#2E7A56` with pale gold-olive belly scutes `#C8B978`!). When `lift > 20` (aerial `wing-dodge`), the tail coils dynamically unfurl downward like a striking sea-serpent!

### 2.2 Color Palette & Local Gradients (`defs` with `_${uid}`)
| Token | Hex | Role |
|---|---|---|
| `SKIN_L` | `#C3D6C7` | Sculpted cheekbone, nose bridge, brow bone, collarbone moonlight highlight |
| `SKIN` | `#99B3A0` | Pale cursed olive-jade Greek flesh |
| `SKIN_D` | `#637D6C` | Cheek hollow, neck shadow, back-arm flesh |
| `SKIN_DD` | `#2F4237` | Deep orbital eye shadow, under-chin shadow |
| `GOLD_L` | `#FFF2B2` | Specular wing-feather rim, circlet filigree, meander highlight |
| `GOLD` | `#F0C24B` | Primary Apollodorus golden wings, crown, Greek key trim |
| `GOLD_D` | `#9E6B18` | Wing under-shadow, antique gold recess |
| `BRONZE_L` | `#FFE099` | Brazen claw specular bevel, forearm highlight |
| `BRONZE` | `#C78038` | Forged bronze forearms, claw palms, armlets |
| `BRONZE_D` | `#6E3F14` | Oxidized bronze shadow |
| `ROBE_D` | `#0B1C16` | Deep shadow fold in chiton |
| `ROBE` | `#122B22` | Dark emerald Greek chiton |
| `ROBE_L` | `#204B3C` | Draped fabric highlight |
| `VIPER_B` | `#123D27` | Back-layer shadow vipers |
| `VIPER` | `#298F56` | Front-layer jade vipers & tail coils |
| `VIPER_L` | `#5BE091` | Scaled dorsal viper pattern & sheen |
| `BELLY` | `#C4BA78` | Pale olive-gold ventral serpent belly scutes |
| `EYE_EM` | `#4CFF88` | Blazing emerald petrification iris/glow |
| `ICHOR` | `#240B1A` | Dark mortal Gorgon blood/ichor (`#661A42` wet highlight) |

**Local Gradients (`mkRad` / `mkLin`):**
- `gGoldWing`: linear gradient (`0,0 -> 1,1`) `#FFF2B2` (0) → `#F0C24B` (0.45) → `#A8711A` (0.85) → `#633D0A` (1).
- `gBronze`: linear gradient (`0,0 -> 1,0`) `#FFE099` (0) → `#C78038` (0.45) → `#5E340E` (1).
- `gEyeEm`: radial gradient (`#FFFFFF` 0 → `#9BFFBD` 0.28 → `#4CFF88` 0.6 → `#0A5C2B` 0.9 → `#000000` 0).
- `gChiton`: linear gradient (`0,0 -> 0,1`) `#204B3C` (0) → `#122B22` (0.6) → `#091510` (1).

### 2.3 Joint Hierarchy & SVG Geometry Blueprint
Root & shadow:
- `g` → ground shadow `sh` (`$('ellipse', { cx: 0, cy: 4, rx: 112, ry: 22, fill: 'rgba(0,0,0,0.5)' }, g)`).
- `root = $('g', {}, g)`.
- **Main Body Pivot**: `body = joint(root, 0, -245)`. (Standing head reaches `y ≈ -520`, matching `HEADOFF.medusa = [6, -460]` cleanly—let's place `headMk` around `y = -465` so `HEADOFF` stays synced!)

#### A. Multi-Layered Golden Feathered Wings (`wingB` at `(-24, -396)`, `wingF` at `(-10, -388)`)
- Built via `mkGoldenWing(sx, sy, isFront)`:
  1. **Solid Covert Blade Backing**: Smooth curved cubic-Bezier upper-wing arc (`M${sx} ${sy} C...` arching up-back to `sx - 235, sy - 235` and sweeping down to `sx - 75, sy + 24`) filled with `GOLD_D` (back) or `GOLD` (front) + `gGoldWing` overlay.
  2. **10 Overlapping Sweeping Primary Feathers**: Fanning gracefully backward (`-x`) and upward (`-y`), alternating `GOLD` and `GOLD_D` (front uses `GOLD` / `GOLD_L`), each with a crisp **metallic rachis shaft** (`stroke: GOLD_L`, `stroke-width: 2`) and curved tip highlight.
  3. **7 Layered Secondary Covert Feathers + Ornate Shoulder Scroll**: Overlapping mid-wing plumage in `GOLD_L` / `GOLD` + sculpted **ancient Greek spiral shoulder-crest**.
  4. **Wing Fracture (`wingDmg` joint on `wingF`)**: Split `wingF` into an inner shoulder-wing section (`wingFInner`) and an outer primary-tip sub-joint (`wingFOuter` pivoted at `(sx - 92, sy - 92)`). When `wingDmg > 0`, `wingFOuter` rotates/droops downward (`-wd * 58°`), exposing **jagged broken quill stubs** (`wingBreakG`, opacity `clamp(wd * 1.5)`) and dark ichor stains on the torn golden feathers!

#### B. Coiled Serpentine Lower Body & Tattered Chiton Skirt (`tailG` inside `body.c`)
- **Coiled Serpentine Tail Base (`y = -245 .. 0`)**:
  - 3 dynamic cubic-Bezier S-coils (`tailCoils`) updated continuously in `apply(p)` with `t` and `lift`:
    - Grounded (`lift ≈ 0`): heavy coils loop back-and-forth across the floor (`x: -110..+95`, `y: -155.. -14`) so Medusa rests effortlessly on an undulating scaled coil pedestal.
    - Airborne (`lift > 40`, e.g., `wing-dodge`): coils smoothly uncoil downward (`y` stretches to `+45..+95`, trailing like a sinuous whip!).
  - Each coil layers: dark under-shadow (`#06120D`) → `VIPER` body stroke (`stroke-width: 64 -> 34`) → dorsal scale chevrons (`VIPER_L`, `stroke-dasharray`) → **pale olive-gold ventral belly plates** (`BELLY`, `stroke-dasharray`).
- **Tattered Emerald-Gold Greek Chiton Skirt**:
  - Layered cubic-Bezier drapery splits over the upper serpentine coil (`M-42 -245 C-56 -160 -78 -80 -88 -26 L-44 -54 L-12 -18 L24 -52 L66 -22 C54 -95 44 -165 36 -245 Z`, `ROBE` + `ROBE_L` vertical drapery pleats + `gChiton` overlay) with **frayed tattered hem edges** and a **gold Greek-key (meander) border strip** (`GOLD` + `GOLD_D`).

#### C. Torso, Chiton Bodice & Greek Meander Belt (`y = -396 .. -245`)
- **Sculpted Feminine Classical Torso**: Tapered waist (`w ≈ 54 px` at `y = -255`), ribcage & shoulder silhouette (`w ≈ 82 px` at `y = -390`), **chiseled collarbone & neck base** in `SKIN` / `SKIN_L` above the asymmetrical chiton neckline.
- **Draped Chiton Bodice & Gold Breastplate/Sash**:
  - Asymmetric one-shoulder / cross-strapped dark emerald chiton (`ROBE` / `ROBE_L` folds) pinned by **two ornate golden Gorgon shoulder brooches** (`GOLD_L`).
  - Embossed **golden Greek meander corset belt** (`y = -265 .. -240`) wrapping the waist with geometric key-pattern filigree (`stroke: GOLD_D`) and a flowing central gold-trimmed tabard drape.

#### D. Brazen (Bronze) Arms & Razor Claws (`armB` at `(-38, -388)`, `armF` at `(36, -388)`)
- **Upper Arm (`shd` joint)**: Slender sculpted `SKIN` / `SKIN_D` upper arm + **coiled golden serpent bicep armlet** (`GOLD` / `GOLD_L`).
- **Brazen Forearm (`elb` joint at `sy + 108`)**: Forged **bronze-brass vambrace/forearm** (`BRONZE` base, `BRONZE_L` specular edge, `BRONZE_D` inner shadow + `gBronze` gradient overlay, engraved Greek cuff band).
- **Bronze Clawed Hand (`hand` joint at `sy + 216`)**: Sculpted articulated bronze palm + **5 curved gleaming bronze-gold talons** (`len: 32..46 px`, `BRONZE` → `GOLD_L` razor edge). Markers: `handMk` on palm/claws.

#### E. Sculpted Classical Greek Face & Dense 16-Viper Crown (`neck` at `(4, -396)` → `headG` at `(6, -432)`)
1. **Back Serpent Hair Layer (8 Dark Emerald Vipers — behind face/neck)**:
   - Radiating across upper back, temples, and high crown (`angles: -165° .. +28°`, lengths `82..126 px`, widths `13..17 px`).
   - Built with smooth **tapered cubic-Bezier serpent bodies** (`VIPER_B` base + darker dorsal ridge + subtle belly rim) that writhe organically in `apply(p)` via multi-harmonic sine curvature (`Q`/`C` control points) and surge forward aggressively on `snakeLunge` (`0..1`).
2. **Sculpted Classical Greek Head & Face (`headG`, centered around `y = -465`)**:
   - **Jawline, Cheekbones & Chin**: High-craft sculpted silhouette (`M-28 -488 C-30 -512 -14 -526 6 -526 C28 -526 40 -508 38 -484 C36 -462 24 -440 8 -432 C-10 -432 -24 -456 -28 -488 Z`, `SKIN`).
   - **Anatomical Shading**: Recessed hollow cheek contour (`SKIN_D`), raised cheekbone & brow highlights (`SKIN_L`), straight classical Greek nose bridge (`SKIN_L` ridge + `SKIN_D` side plane), and **dark recessed eye sockets** (`SKIN_DD`, `opacity: 0.78`).
   - **Ornate Gold-Bronze Gorgon Brow Circlet**: Curved crescent tiara hugging the forehead (`y ≈ -498`), engraved wings/scrolls in `GOLD` / `GOLD_L` / `BRONZE_D`, topped by a glowing **emerald gemstone centerpiece** (`EYE_EM`).
   - **Blazing Petrifying Emerald Eyes**:
     - Sunken dark sclera sockets (`#061A10`), arched fierce dark brows (`#11241B`), glowing radial aura (`eyeGlowBg` using `gEyeEm` — tightly scaled so it NEVER washes out the face in `cu`/`ecu`!), sharp **emerald irises (`#4CFF88` → `#D4FFE6`)** with **vertical black serpent slit pupils** (`rx: 1.6, ry: 4.8`) and tiny white specular glint dots.
   - **Dark Lips & Gorgon Fangs**: Sculpted dark plum-jade lips (`#210912` / `#3D1222`) parting dynamically with `mouth` (`0..1.2`) to reveal a dark mouth cavity and **twin sharp white upper fangs** (+ lower canine tips when screaming).
   - **Mortal Gorgon Ichor (`ichorG`, driven by `P.ichor: 0..1`)**: Curved dark burgundy-black ichor trickle from corner of mouth & bruised cheekbone (`#240B1A` + `#6E1B47` wet highlight).
3. **Front Serpent Hair Layer (8 Vibrant Scaled Jade Vipers — framing forehead & temples)**:
   - Emerge cleanly from behind/above the golden circlet and around the temples (`VIPER` base, `VIPER_L` scale chevrons, `BELLY` underside, glowing `#7CFFAA` slit eyes, open jaw hiss & **flickering `#FF2E44` forked tongue** on front vipers).
   - **16 total living vipers** (8 back + 8 front) ensure dense, terrifying Gorgon volume matching `image.png` from wide shots all the way down to `ecu at snake`!

---

## 3. Verification Checklist for Carbon-1 & Carbon-2

1. **Zero `core.js` `setSil` Crashes**: Verify **no** `url(#...)` or `rgba(...)` string is ever passed to `pathR(...)`, `poly(...)`, `ell(...)`, or `limb(...)` (hex `#rrggbb` only!).
2. **Unique Gradient IDs**: Both `buildScp096()` and `buildMedusa()` increment `const uid = ++_rigUid;` so Split-Roll cards + main stage actors never collide in `<defs>`.
3. **100% Timeline Action & Marker Parity**: All actions in `make_timeline.js` and markers (`eye`, `head`, `mouth`, `hand`, `claw`, `snake`, `body`) produce crisp, unclipped framing under `validate.js` and `render.js --check`.
4. **Gate 3 Visual Sign-Off**: Render a contact sheet (`peek.sh` / `sheet.py` or `build-anim.sh`) covering `idle-card`, `cower`, `trigger-unhinge`, `ecu` on SCP-096 `mouth` (4× jaw + blood drips), `ecu` on Medusa `eye`/`snake`, `wing-dodge`, `pinned` (`wingDmg: 0.75, ichor: 0.9`), `petrified`, and C2 `crack: 1.0`.
