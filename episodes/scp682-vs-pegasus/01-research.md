# Research Lore & Visual Anatomy · Episode #005: SCP-682 vs Pegasus

> **Role**: Hydrogen (Research & Combat-Design Specialist)  
> **Episode Slug**: `scp682-vs-pegasus` · **Format**: Sakuga 2D Canvas (`tools/anim`)  
> **Core Visual Rule**: **Strictly NO generic single-color beams or flat monochrome silhouettes.** Every entity, aura, and attack must layer distinct multi-hued palettes, organic textures, and kinetic silhouettes.

---

## 1. MONSTER (LEFT): SCP-682 — "Hard-to-Destroy Reptile"

### 1.1 Primary Sources & Licensing (CC BY-SA 3.0)
- **Primary Article**: Dr Gears, *SCP-682 — Hard-to-Destroy Reptile*, SCP Foundation Wiki: https://scp-wiki.wikidot.com/scp-682
- **Termination & Adaptation Logs**: SCP Foundation Wiki, *Experiment Log T-98816-OC108/682* (Cross-SCP Termination Testing): https://scp-wiki.wikidot.com/experiment-log-t-98816-oc108-682
- **License**: Creative Commons Attribution-ShareAlike 3.0 Unported (CC BY-SA 3.0): https://creativecommons.org/licenses/by-sa/3.0/
- **Required Video Description Attribution**:
  > `"SCP-682" by Dr Gears, from the SCP Wiki (https://scp-wiki.wikidot.com/scp-682). Licensed under CC BY-SA 3.0.`

### 1.2 Canon Lore & Behavioral Profile
- **Classification**: Keter. Containment mandates constant submersion in **hydrochloric acid (HCl)** inside a **5 m × 5 m × 5 m chamber lined with 25 cm reinforced acid-resistant steel plate**. Acid does *not* kill SCP-682; it only dissolves outer tissue fast enough to keep it weakened and slow down breaches.
- **Intellect & Malice**: Highly sapient, speaks in a low, rasping, guttural bass. Expresses absolute revulsion toward all living things (canon transcript: *"…they were… disgusting…"*).
- **Extreme Regeneration**: Survives loss of limbs, organs, incineration, and up to ~85–87% of total body mass (e.g., recovering from SCP-096's 27-hour assault with 85% mass absent, and recovering from SCP-409 crystal-conversion in Addendum 682-E18).
- **Absolute Reactive Adaptation**: Develops rapid physiological and structural counters to any threat (e.g., permanent immunity to SCP-409 after initial exposure; restructuring tissue under extreme physical laws in SCP-536 testing; sprouting defensive carapaces, extra eyes, or offensive bio-structures across termination logs).

### 1.3 Horrifying Visual Anatomy Spec (For Carbon — Original Rig `scp682`)
> **IP Safety**: Do NOT trace or reuse the original beluga whale carcass photo or 3D models from *SCP: Containment Breach*. Build an original horror-anatomy rig directly from canon text + user visual direction:
- **Head & Skull**: Elongated, pale ivory-bone **exposed crocodilian/reptilian skull** (`#E8E2D0` bone highlight, `#9A927E` weathered shadow) with cracked sutures, hollow nasal cavity, and **interlocking jagged teeth** stained with crimson gore and acid saliva.
- **Eyes**: Deep-set, **sickly glowing eyes** — toxic chartreuse-lime core (`#D9FF3F`) with slit pupils and inflamed crimson-amber sclera rim (`#FF3B1F`) that flare brighter during adaptation.
- **Neck & Dorsal Mane**: Thick, **dark ragged mane** of matted charcoal-black hair and tattered tendons (`#1B1A1E` → `#35302E`) running from the back of the skull down the hunched shoulders.
- **Torso & Exposed Ribcage**: Asymmetrical decaying charcoal-olive reptilian hide (`#2B3028` / `#434A3C`) torn open across the flanks and chest to reveal a **pale exposed ribcage** (`#DFD8C4`) over glistening **bloody crimson-maroon muscle tissue** (`#8F0E16` / `#D92626`) and acid-seared patches.
- **Spine & Tail**: Row of **sharp white-ivory bone spines** erupting along the arched spine and extending down a heavy, whip-like **spiked tail** tipped with jagged bone barbs.
- **Limbs**: Heavily **muscular, scarred quadruped/semi-rearing limbs** ending in massive, curved bone-black talons (`#1E1B1A` with `#D6CEB8` tips) capable of rending 25 cm steel containment doors.
- **Evolution States (`rig` layers for Carbon)**:
  1. **Base / Breached (`damage: 0`)**: Freshly escaped from HCl vat — dripping sickly acid vapor, exposed ribs steaming, jagged skull gleaming under red lab emergency strobes.
  2. **Charred & Torn (`damage: 1`)**: After Pegasus's dive-kick & Zeus thunderbolts — blackened charred hide (`#121114`), shattered rib fragments, glowing orange-red ember cracks (`#FF5A1F`) on scorched flesh.
  3. **Regenerating (`regen: 1`)**: Rapid knit-back of **vivid crimson sinew tendrils** (`#E01E2B`) intertwined with **boiling sickly-green HCl vapor** (`#7CFF3B`) sealing the ribcage.
  4. **Adapted — Armored (`armor: 1`)**: **Dark obsidian-chitin & bone-plated dorsal/shoulder armor** (`#1F242B` plates with `#5E6B78` metallic-bone bevels and conductive grounding ridges) that shatters and grounds lightning arcs.
  5. **Adapted — Winged Horror (`wings: 1`)**: Back hide violently splits open with crimson splatter to unfurl **massive tattered bone-and-membrane horror wings** — pale skeletal wing-fingers (`#DDD5C0`), ragged leathery crimson-black translucent webbing (`#3A1217` / `#5C1B22` torn edges), pulsing toxic-green veins.

---

## 2. GUARDIAN (RIGHT): Pegasus — Divine Winged Steed of Olympus

### 2.1 Primary Sources & Licensing (Public Domain)
- **Hesiod, *Theogony* (lines 280–286 & 5–6)** (trans. Hugh G. Evelyn-White, 1914) — Birth of Pegasus from Medusa's neck; Pegasus dwells in Zeus's palace on Olympus and **bears thunder and lightning for wise Zeus**:
  - Perseus Digital Library: https://www.perseus.tufts.edu/hopper/text?doc=Perseus:text:1999.01.0130:card=270
  - Theoi Classical Texts Library: https://www.theoi.com/Text/HesiodTheogony.html
- **Pindar, *Olympian Ode 13* (lines 63–92)** & ***Isthmian Ode 7* (lines 44–48)** — Bellerophon tames Pegasus with Athena's golden bridle; Pegasus battles the fire-breathing Chimera from the cold upper air and holds an immortal stall in the **stables of Olympus**:
  - Perseus Digital Library: https://www.perseus.tufts.edu/hopper/text?doc=Perseus:text:1999.01.0162:book=O.:poem=13
  - ToposText: https://topostext.org/work/18
- **Pseudo-Apollodorus, *Bibliotheca* (Book 2.3.2)** — Bellerophon mounts Pegasus, soars high above the Chimera's flames, and strikes from supreme aerial altitude:
  - Perseus Digital Library: https://www.perseus.tufts.edu/hopper/text?doc=Perseus:text:1999.01.0022:text=Library:book=2:chapter=3:section=2
- **Ovid, *Metamorphoses* (Book 5.250–268)** & ***Fasti* (Book 3.449–458)** — Pegasus strikes Mount Helicon with his hoof to shatter rock and unleash the sacred spring **Hippocrene**; glides above the clouds and beneath the stars:
  - Perseus Digital Library (*Metamorphoses* 5.250): https://www.perseus.tufts.edu/hopper/text?doc=Perseus:text:1999.02.0028:book=5:card=250
  - Theoi (*Fasti* 3): https://www.theoi.com/Text/OvidFasti3.html
- **Classical Mythology Reference Compendium**:
  - Theoi Project — *Pegasos*: https://www.theoi.com/Ther/HipposPegasos.html

### 2.2 Canon Lore & Behavioral Profile
- **Divine Heritage**: Immortal winged stallion born from Poseidon (Earthshaker/Sea) and Medusa; raised to Mount Olympus where he serves as **Zeus's thunderbolt-bearer** (*Theogony* 285–286).
- **Domains**: Upper sky, storm-winds, Olympian lightning, and sacred mountain springs (Hippocrene).
- **Combat Temperament**: Noble, swift, relentless aerial protector. Excels at high-altitude dive strikes, blinding speed, and storm-summoning, but is **not** an erasure-tier god himself—when facing an unkillable adaptive horror that invades his sky domain, his ultimate duty as Zeus's steed is to break free and summon the King of Olympus.

### 2.3 Radiant Multi-Colored Visual Anatomy Spec (For Carbon — Rig `pegasus`)
> **Strict Rule**: Pegasus MUST NOT look like a flat white horse with a single yellow outline. Layer **4 distinct luminous spectra** so he gleams like living Olympian starlight against the dark night storm:
- **Body**: Sculpted, muscular **pearl-white stallion** (`#F8FAFF` lit plane, `#D8E4F8` cool sky-blue midtone, `#9EB4DE` silver-lavender musculature shadow).
- **Mane & Tail**: Flowing, weightless **golden-amber Olympus flame** (`#FFF4B8` core → `#FFB830` gold → `#FF7A1A` amber tips) trailing sparks like solar wind.
- **Wings**: Enormous, layered eagle-angel pinions — **pure pearl-white primaries** with **sky-cyan wind sheen** (`#4CE8FF`) across the covert feathers and **iridescent violet-to-amber rim-glow** (`#B366FF` / `#FF9E3D`) along the feather tips.
- **Hooves & Eyes**: **Molten-gold divine hooves** (`#FFE066` → `#FF9900`) that leave blazing amber-cyan shock rings on impact; **luminous sky-cyan eyes** (`#7DF9FF`) with white star-glint flares.
- **Multi-Layered Divine Aura**: Three concentric kinetic ribbons around body/wings — inner **gold Olympus flame** (`#FFD147`), mid **sky-cyan slipstream wind** (`#38E1FF`), outer **iridescent violet-magenta prismatic shimmer** (`#C57BFF` / `#FF8AD4` at low alpha).

---

## 3. Story Arc & Combat Escalation Support (3-Phase Structure)

| Phase | Setting / Domain | Narrative & Combat Beat | Visual Contrast |
|---|---|---|---|
| **Hook (0–3 s)** | `domain-lab` → `domain-forest-storm` | SCP Foundation containment breach: flashing red alarm strobes, 25 cm steel door ripped off its hinges, HCl mist pouring out. SCP-682 lunges into the midnight storm forest. Overhead, Pegasus cleaves through storm clouds and intercepts 682 before it reaches a stray child (`kit.kidFlee`). | Harsh red lab sirens + toxic-green acid mist vs. prismatic gold-cyan-violet sky descent. |
| **Phase 1: Aerial Dominance (Pegasus Leads)** | `domain-forest-storm` (low altitude → canopy) | Base SCP-682 snaps, claws, and lunges, but cannot touch Pegasus in the air. Pegasus unleashes **Wing Cyclone** (cyan/gold/white vortex), slams a **Divine Hoof-Dive Kick** (gold-amber meteor impact) into 682's ribcage, and calls down **Zeus's Forked Sky-Thunderbolts** (blue-white-gold jagged arcs) that char and tear 682 apart. | Radiant multi-hued storm-gold & electric cyan dominating charred bone & crimson gore. |
| **Phase 2: Absolute Adaptation (Turning Point)** | `domain-forest-storm` → High Storm Sky | From charred ribs, SCP-682 **regenerates violently** (vivid crimson sinew + boiling sickly-green vapor). It adapts in real time: (1) sprouts **lightning-proof dark chitin/bone armor** that grounds and shatters Zeus's next thunderbolt; (2) fires **volleys of launched bone-spikes + corrosive green-yellow acid spit** skyward; (3) rips open its own back to sprout **massive tattered bone-and-membrane horror wings** and rockets into the sky to match Pegasus in brutal aerial dogfighting. | Dark obsidian-chitin + crimson-black bone wings + toxic-acid projectiles colliding with Pegasus's iridescent feathers mid-storm. |
| **Phase 3: Aerial Overwhelm & Olympus Cliffhanger** | High Storm Sky → `domain-olympus` Cloud Gate | Pegasus's attacks cannot erase 682's regeneration; clipped by bone-spikes and pressed by winged 682's relentless jaws/talons, Pegasus triggers **Hippocrene Sacred Surge** (iridescent aqua-gold flash shockwave) to break free and rockets vertically at supersonic speed through the storm clouds toward **Mount Olympus** to summon Zeus. **Cliffhanger**: Hovering amid dark thunderclouds, armored & winged SCP-682 roars upward at the golden storm-lit peak of Olympus: *"Bring your god."* | Prismatic gold-aqua vertical ascent trail disappearing into golden Olympus cloud break; shadowed winged horror silhouetted against gathering Zeus-lightning. |

---

## 4. Safety, Canon & Attribution Checklist
- **SCP-682 Credit**: Must appear in video description (`"SCP-682" by Dr Gears, SCP Wiki, CC BY-SA 3.0`).
- **Original Art Only**: Zero copyrighted game assets or beluga photo traces.
- **Canon vs. Cinematic Extrapolation**: Base regeneration, HCl containment, hyper-adaptation, and extreme hostility are canon to Dr Gears's SCP-682 & Experiment Log T-98816-OC108/682. Specific combat forms tailored to Pegasus (lightning-grounding chitin plates, launched dorsal bone-spikes, acid spit projectiles, and horror bone-wings) are clearly tagged as **`(story)`** extrapolations of SCP-682's canon reactive adaptation.
- **Pegasus Canon**: Thunderbolt-bearing (*Theogony* 285–286), Hippocrene hoof-strike (*Metamorphoses* 5.250–268), supersonic aerial monster-slaying (*Bibliotheca* 2.3.2, *Olympian 13*), and Olympus residence are 100% classical Public Domain lore.
