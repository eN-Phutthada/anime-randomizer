// script.js

// --- Jikan API Fetcher (ป้องการ Error 429 Rate Limit และ Network Error) ---
async function fetchFromJikan(url, retries = 3) {
  for (let i = 0; i < retries; i++) {
    try {
      const response = await fetch(url);
      if (response.ok) return await response.json();

      if (response.status === 429) {
        console.warn(
          `⏳ โดนจำกัด Rate Limit กำลังรอเพื่อดึงข้อมูลใหม่... (ครั้งที่ ${i + 1})`,
        );
        await new Promise((r) => setTimeout(r, 1500 * (i + 1)));
      } else if (response.status === 404) {
        console.warn(`❌ ไม่พบข้อมูล (404) สำหรับ URL: ${url}`);
        return null;
      } else {
        throw new Error(`API Error: ${response.status}`);
      }
    } catch (error) {
      console.warn(`⚠️ การดึงข้อมูลล้มเหลว: ${error.message}`);
      if (i === retries - 1) return null;
      await new Promise((r) => setTimeout(r, 1500));
    }
  }
  return null;
}

// --- Language System (Translations & AI Disclaimer) ---
const translations = {
  title: { th: "✨ ฉันคือใครในอนิเมะ! ✨", en: "✨ Who am I in Anime! ✨" },
  clickHint: {
    th: "🔍 กดที่รูปเพื่อดูแบบเต็มจอ",
    en: "🔍 Click image to view full screen",
  },
  charNameDefault: { th: "พร้อมแล้วสุ่มเลย!", en: "Ready, set, roll!" },
  btnReveal: { th: "👁️ ดูเฉลย", en: "👁️ Reveal" },
  btnSelectFriend: {
    th: "🎯 เลือกตัวนี้ให้เพื่อน!",
    en: "🎯 Pick this for friend!",
  },
  btnRandom: { th: "🎲 สุ่มตัวละคร!", en: "🎲 Roll Character!" },
  btnRandomAgain: { th: "🎲 สุ่มต่อ!", en: "🎲 Roll Again!" },
  btnReset: { th: "🔄 ล้างความจำการสุ่ม", en: "🔄 Clear Roll History" },
  settingsSummary: {
    th: "⚙️ ตั้งค่าการสุ่ม & ระบบ",
    en: "⚙️ Randomizer Settings",
  },
  sound: { th: "🎵 เสียงประกอบ (Sound Effects)", en: "🎵 Sound Effects" },
  guessMode: {
    th: "❓ โหมดทายชื่อ (ปิดบังชื่อ)",
    en: "❓ Guess Mode (Hide Name)",
  },
  allowDupes: { th: "🔁 สุ่มเจอตัวเดิมซ้ำได้", en: "🔁 Allow Duplicates" },
  role: { th: "🎭 บทบาทตัวละคร", en: "🎭 Character Role" },
  roleAll: {
    th: "ทั้งหมด (พระเอก & ตัวประกอบ)",
    en: "All (Main & Supporting)",
  },
  roleMain: { th: "เฉพาะตัวเอก (Main)", en: "Main Characters Only" },
  roleSupp: {
    th: "เฉพาะตัวสมทบ (Supporting)",
    en: "Supporting Characters Only",
  },
  topX: { th: "🏆 สุ่มจากตัวท็อป", en: "🏆 Roll from Top Characters" },
  topXHint: { th: "อันดับ 1 ถึง", en: "Rank 1 to" },
  minPop: { th: "❤️ ขั้นต่ำความนิยม", en: "❤️ Min Popularity" },
  librarySummary: { th: "📚 คลังอนิเมะของฉัน", en: "📚 My Anime Library" },
  animeInput: {
    th: "🔗 ลิงก์ MyAnimeList หรือ ID",
    en: "🔗 MyAnimeList Link or ID",
  },
  btnAdd: { th: "➕ เพิ่มเรื่อง", en: "➕ Add Anime" },
  searchAnime: { th: "🔍 ค้นหาชื่อเรื่อง...", en: "🔍 Search anime title..." },
  btnSelectAll: { th: "✅ เลือกหมด", en: "✅ Select All" },
  btnDeselectAll: { th: "❌ เอาออก", en: "❌ Deselect All" },
  loadingLib: { th: "⏳ กำลังเตรียมคลัง...", en: "⏳ Loading Library..." },

  // Forehead Game Mode
  fhSetupTitle: {
    th: "ยื่นมือถือให้เพื่อนเลย!",
    en: "Hand the phone to your friend!",
  },
  fhSetupDesc: {
    th: "ให้เพื่อนถือโทรศัพท์แนบหน้าผาก<br>(หันหน้าจอมาหาเรา)<br>แล้วกดปุ่มด้านล่างเพื่อเริ่มทาย!",
    en: "Have them hold it on their forehead facing you.<br>Then tap below to start!",
  },
  fhSurrender: { th: "🏳️ ใครอะ?", en: "🏳️ Who is it?" },
  fhCorrect: { th: "🎉 ก็เก่งอะ", en: "🎉 Great job!" },
  btnShowHint: { th: "💡 ขอคำใบ้ (Hint)", en: "💡 Show Hint" },

  // History
  historySummary: { th: "📜 ประวัติการทาย", en: "📜 Guess History" },
  emptyHistory: {
    th: "ยังไม่มีประวัติการทาย...",
    en: "No guess history yet...",
  },

  // Dynamic Texts
  castingSpell: { th: "กำลังร่ายเวทมนตร์... ✨", en: "Casting spell... ✨" },
  searching: { th: "กำลังค้นหา...", en: "Searching..." },
  fromAnime: { th: "จากเรื่อง:", en: "From:" },
  popularity: { th: "❤️ ความนิยม:", en: "❤️ Popularity:" },
  people: { th: "คน", en: "users" },
  errorMsg: {
    th: "เกิดข้อผิดพลาด ลองใหม่นะ 😅",
    en: "Error occurred, try again 😅",
  },
  noNewChar: {
    th: "ไม่พบตัวละครใหม่แล้ว! (ลองกดยอมให้สุ่มซ้ำได้ในตั้งค่าดูนะ)",
    en: "No new characters! (Try allowing duplicates in settings)",
  },
  needOneAnime: {
    th: "กรุณาเลือกอนิเมะอย่างน้อย 1 เรื่อง!",
    en: "Please select at least 1 anime!",
  },
  clearSuccess: {
    th: "ล้างความจำเรียบร้อย! ตอนนี้สุ่มตัวเดิมซ้ำได้แล้วครับ",
    en: "History cleared! You can now roll duplicates.",
  },
  alreadyInLib: {
    th: "เรื่องนี้อยู่ในคลังแล้วครับ!",
    en: "This anime is already in your library!",
  },
  invalidLink: {
    th: "กรุณาใส่ลิงก์หรือ ID ให้ถูกต้องครับ",
    en: "Please enter a valid link or ID.",
  },
  notFound: { th: "ไม่พบข้อมูลอนิเมะ", en: "Anime not found." },
  removeConfirm: { th: "ต้องการลบ", en: "Are you sure you want to remove" },

  // Rules & How to play
  howToPlaySummary: {
    th: "📖 วิธีการเล่น & กติกา",
    en: "📖 How to Play & Rules",
  },
  ruleSoloTitle: { th: "👤 โหมดทายคนเดียว (Solo Mode)", en: "👤 Solo Mode" },
  ruleSolo1: {
    th: "กดสุ่มตัวละครจากคลังอนิเมะของคุณ",
    en: "Roll a random character from your library.",
  },
  ruleSolo2: {
    th: "เปิด 'โหมดทายชื่อ' ในตั้งค่า เพื่อปิดบังชื่อและทดสอบความจำ!",
    en: "Turn on 'Guess Mode' in settings to hide names and test your memory!",
  },
  rulePartyTitle: {
    th: "👥 โหมดเกมหน้าผาก (Party Mode)",
    en: "👥 Forehead Game (Party Mode)",
  },
  ruleParty1: {
    th: "สุ่มได้ตัวละครแล้ว กดปุ่ม 'เลือกตัวนี้ให้เพื่อน!' (เล่นได้หลายคน)",
    en: "Roll a character and click 'Pick this for friend!' (Multiplayer)",
  },
  ruleParty2: {
    th: "ให้ผู้เล่นนำมือถือไปทาบหน้าผาก (หันหน้าจอให้เพื่อนคนอื่นๆ เห็น)",
    en: "Have the player hold the phone on their forehead (screen facing others).",
  },
  ruleParty3: {
    th: "ผู้เล่นผลัดกันถามคำถามทีละรอบ โดยเพื่อนๆ ต้องตอบตามจริงแค่ 'ใช่', 'ไม่ใช่' หรือ 'ไม่รู้'",
    en: "Take turns asking questions. The group can only answer 'Yes', 'No', or 'Don't know'.",
  },
  ruleParty4: {
    th: "แข่งกันว่าใครจะทายชื่อตัวละครของตัวเองได้ก่อน! (รอ 30 วิเพื่อดูคำใบ้ได้นะ)",
    en: "Compete to guess who you are first! (Wait 30s for a hint if stuck).",
  },
  ruleExampleTitle: { th: "💡 ตัวอย่างการถาม:", en: "💡 Example Questions:" },
  ruleExampleDesc: {
    th: '"ฉันเป็นผู้ชายใช่ไหม?", "ฉันมีพลังวิเศษหรือเปล่า?"\n👉 (ถ้าเพื่อนตอบ "ใช่" ให้แคบวงลงมาจนกว่าจะทายถูก!)',
    en: '"Am I a guy?", "Do I have superpowers?"\n👉 (If yes, keep narrowing it down until you guess it!)',
  },

  menuTitle: { th: "✨ เลือกมินิเกม ✨", en: "✨ Select Mini-Game ✨" },
  game1Title: { th: "ฉันคือใครในอนิเมะ!", en: "Who am I in Anime!" },
  game1Desc: {
    th: "ทายชื่อตัวละคร หรือเล่นเกมหน้าผาก",
    en: "Guess character or forehead game",
  },
  game2Title: { th: "A-Z ตะโกนชื่ออนิเมะ!", en: "A-Z Anime Shout!" },
  game2Desc: {
    th: "สุ่มอักษรและแข่งนึกชื่ออนิเมะให้ทันเวลา",
    en: "Roll a letter and shout anime names",
  },
  btnBackMenu: { th: "⬅️ กลับเมนู", en: "⬅️ Back to Menu" },
  azTitle: { th: "🅰️ A-Z ตะโกนชื่อ!", en: "🅰️ A-Z Shout!" },
  azTimeSetting: { th: "⏱️ เวลา (วินาที): ", en: "⏱️ Time (sec): " },
  azRule: {
    th: "💡 กติกา: สุ่มได้ตัวอักษรแล้ว ให้เวลาคิด... พอเสียงหมดเวลาดังปุ๊บ ให้ทุกคนตะโกนชื่ออนิเมะที่ขึ้นต้นด้วยตัวนั้นพร้อมกัน ห้ามซ้ำ!",
    en: "💡 Rule: Think of an anime starting with this letter. When time's up, shout it out together! No repeats!",
  },
  btnRollAZ: { th: "🎲 เริ่มสุ่มอักษร!", en: "🎲 Roll Letter!" },
  btnRollAZAgain: { th: "🎲 สุ่มใหม่!", en: "🎲 Roll Again!" },
  getReady: { th: "🔥 เตรียมตัว...", en: "🔥 Get Ready..." },

  // Music Game
  game3Title: { th: "ทายเพลงอนิเมะ!", en: "Guess Anime Music!" },
  game3Desc: {
    th: "สุ่มชื่อเพลงเปิด/ปิด แล้วทายว่ามาจากเรื่องอะไร",
    en: "Guess anime from OP/ED song",
  },
  musicTitle: { th: "🎵 ทายเพลงอนิเมะ! 🎵", en: "🎵 Guess Anime Song! 🎵" },
  musicRule: {
    th: "💡 กติกา: ทายชื่ออนิเมะจากชื่อเพลงและศิลปิน (กดที่ปุ่ม YouTube เพื่อแอบฟังทำนองใบ้เพื่อนได้!)",
    en: "💡 Rule: Guess anime from song name and artist (Click YouTube to listen!)",
  },
};

let currentLang = localStorage.getItem("animeLang") || "th";

function t(key) {
  return translations[key][currentLang] || key;
}

function updateLanguageUI() {
  document.getElementById("text_title").innerText = t("title");
  document.getElementById("clickHint").innerText = t("clickHint");

  if (!currentDrawnChar) {
    document.getElementById("charName").innerText = t("charNameDefault");
  }

  document.getElementById("btnReveal").innerText = t("btnReveal");
  document.getElementById("btnSelectFriend").innerText = t("btnSelectFriend");

  updateButtonState();

  document.getElementById("btnReset").innerText = t("btnReset");
  document.getElementById("text_settingsSummary").innerText =
    t("settingsSummary");
  document.getElementById("text_sound").innerText = t("sound");
  document.getElementById("text_guessMode").innerText = t("guessMode");
  document.getElementById("text_allowDupes").innerText = t("allowDupes");
  document.getElementById("text_role").innerText = t("role");
  document.getElementById("opt_roleAll").innerText = t("roleAll");
  document.getElementById("opt_roleMain").innerText = t("roleMain");
  document.getElementById("opt_roleSupp").innerText = t("roleSupp");
  document.getElementById("text_topX").innerText = t("topX");
  document.getElementById("text_topXHint").innerText = t("topXHint");
  document.getElementById("text_minPop").innerText = t("minPop");
  document.getElementById("text_librarySummary").innerText =
    t("librarySummary");
  document.getElementById("animeInput").placeholder = t("animeInput");
  document.getElementById("btnAdd").innerText = t("btnAdd");
  document.getElementById("searchAnime").placeholder = t("searchAnime");
  document.getElementById("btnSelectAll").innerText = t("btnSelectAll");
  document.getElementById("btnDeselectAll").innerText = t("btnDeselectAll");

  // Rules UI
  const howToPlayObj = document.getElementById("text_howToPlaySummary");
  if (howToPlayObj) {
    howToPlayObj.innerText = t("howToPlaySummary");
    document.getElementById("text_ruleSoloTitle").innerText =
      t("ruleSoloTitle");
    document.getElementById("text_ruleSolo1").innerText = t("ruleSolo1");
    document.getElementById("text_ruleSolo2").innerText = t("ruleSolo2");
    document.getElementById("text_rulePartyTitle").innerText =
      t("rulePartyTitle");
    document.getElementById("text_ruleParty1").innerText = t("ruleParty1");
    document.getElementById("text_ruleParty2").innerText = t("ruleParty2");
    document.getElementById("text_ruleParty3").innerText = t("ruleParty3");
    document.getElementById("text_ruleParty4").innerText = t("ruleParty4");
    document.getElementById("text_ruleExampleTitle").innerText =
      t("ruleExampleTitle");
    document.getElementById("text_ruleExampleDesc").innerText =
      t("ruleExampleDesc");
  }

  // Forehead Mode UI
  document.getElementById("text_fhSetupTitle").innerText = t("fhSetupTitle");
  document.getElementById("text_fhSetupDesc").innerHTML = t("fhSetupDesc");
  document.getElementById("text_fhSurrender").innerText = t("fhSurrender");
  document.getElementById("text_fhCorrect").innerText = t("fhCorrect");
  document.getElementById("btnShowHint").innerText = t("btnShowHint");

  // History UI
  const historySummaryObj = document.getElementById("text_historySummary");
  if (historySummaryObj) historySummaryObj.innerText = t("historySummary");
  renderHistory();

  if (
    currentDrawnChar &&
    document.getElementById("animeName").innerText !== ""
  ) {
    if (
      !appSettings.guessMode ||
      document.getElementById("btnReveal").style.display === "none"
    ) {
      document.getElementById("animeName").innerText =
        `${t("fromAnime")} ${currentDrawnChar.anime}`;
      document.getElementById("charPop").innerText =
        `${t("popularity")} ${currentDrawnChar.pop.toLocaleString()} ${t("people")}`;
    } else {
      document.getElementById("animeName").innerText =
        `${t("fromAnime")} ????????`;
    }
  }

  const azEls = [
    "text_menuTitle",
    "text_game1Title",
    "text_game1Desc",
    "text_game2Title",
    "text_game2Desc",
    "text_game3Title",
    "text_game3Desc",
    "text_azTitle",
    "text_azTimeSetting",
    "text_azRule",
    "text_musicTitle",
    "text_musicRule",
  ];
  azEls.forEach((id) => {
    if (document.getElementById(id))
      document.getElementById(id).innerHTML = t(id.replace("text_", ""));
  });
  if (document.getElementById("text_btnBackMenu1"))
    document.getElementById("text_btnBackMenu1").innerText = t("btnBackMenu");
  if (document.getElementById("text_btnBackMenu2"))
    document.getElementById("text_btnBackMenu2").innerText = t("btnBackMenu");
  if (document.getElementById("text_btnBackMenu3"))
    document.getElementById("text_btnBackMenu3").innerText = t("btnBackMenu");

  const btnAz = document.getElementById("btnStartAZ");
  if (btnAz && btnAz.innerText.includes("!")) {
    btnAz.innerText =
      btnAz.innerText.includes("เริ่ม") || btnAz.innerText.includes("Roll L")
        ? t("btnRollAZ")
        : t("btnRollAZAgain");
  }

  const btnMusic = document.getElementById("btnStartMusic");
  if (btnMusic) {
    btnMusic.innerText =
      "🎲 " + t("btnRollAZ").replace("อักษร", "เพลง").substring(3);
  }
}

function toggleLanguage() {
  playClickSound();
  currentLang = currentLang === "th" ? "en" : "th";
  localStorage.setItem("animeLang", currentLang);
  updateLanguageUI();
}

// --- Library Status & Main Button ---
let isLibraryReady = false;
let currentLoaded = null;
let currentTotal = null;

// --- Honkai Star Rail ---
let isHSRMode = false;
let hsrCharacters = [];

async function toggleHSRMode() {
  playClickSound();
  const btn = document.getElementById("btnRandom");

  if (!isHSRMode) {
    btn.innerText = "🚀 กำลังวาร์ปไปขบวนรถไฟ Astral...";
    btn.disabled = true;

    try {
      const res = await fetch(
        "https://raw.githubusercontent.com/Mar-7th/StarRailRes/master/index_new/en/characters.json",
      );
      const data = await res.json();
      hsrCharacters = Object.values(data).filter((c) => c.portrait);
      isHSRMode = true;
      document.body.style.setProperty(
        "--bg-gradient",
        "linear-gradient(135deg, #1e1e2f, #3a2e5d, #7b5b8e)",
      );
      alert("✨ ระบบลับทำงาน: เปิดโหมด Honkai: Star Rail แล้ว! (กดสุ่มได้เลย)");
    } catch (e) {
      alert("❌ วาร์ปล้มเหลว: ไม่สามารถเชื่อมต่อฐานข้อมูล HSR ได้");
    } finally {
      btn.innerText = "";
      updateButtonState();
    }
  } else {
    isHSRMode = false;
    applyTheme(
      document.body.classList.contains("light-mode") ? "light" : "dark",
    );
    alert("❌ ปิดระบบลับ: กลับสู่โหมดอนิเมะปกติ");
    updateButtonState();
  }
}

function updateButtonState(loaded = null, total = null) {
  if (loaded !== null) currentLoaded = loaded;
  if (total !== null) currentTotal = total;

  const btn = document.getElementById("btnRandom");

  if (!isLibraryReady && !isHSRMode) {
    btn.disabled = true;

    if (currentLoaded !== null && currentTotal !== null) {
      const percent = Math.floor((currentLoaded / currentTotal) * 100);
      btn.innerText =
        currentLang === "th"
          ? `⏳ กำลังเตรียมคลัง... ${percent}% (${currentLoaded}/${currentTotal})`
          : `⏳ Loading Library... ${percent}% (${currentLoaded}/${currentTotal})`;
    } else {
      btn.innerText = t("loadingLib");
    }
    return;
  }

  currentLoaded = null;
  currentTotal = null;

  if (
    btn.innerText !== t("searching") &&
    btn.innerText !== t("castingSpell") &&
    !btn.innerText.includes("วาร์ป")
  ) {
    btn.disabled = false;
    btn.innerText = currentDrawnChar ? t("btnRandomAgain") : t("btnRandom");
  }
}

// --- Sound System ---
let audioCtx;
function initAudio() {
  if (!audioCtx)
    audioCtx = new (window.AudioContext || window.webkitAudioContext)();
  if (audioCtx.state === "suspended") audioCtx.resume();
}

function playTone(freq, type, duration, vol) {
  if (!appSettings.soundEnabled) return;
  initAudio();
  const osc = audioCtx.createOscillator();
  const gain = audioCtx.createGain();
  osc.type = type;
  osc.frequency.setValueAtTime(freq, audioCtx.currentTime);
  gain.gain.setValueAtTime(vol, audioCtx.currentTime);
  gain.gain.exponentialRampToValueAtTime(
    0.001,
    audioCtx.currentTime + duration,
  );
  osc.connect(gain);
  gain.connect(audioCtx.destination);
  osc.start();
  osc.stop(audioCtx.currentTime + duration);
}

function playClickSound() {
  playTone(600, "sine", 0.1, 0.03);
}

function playLoadingSound() {
  if (!appSettings.soundEnabled) return;
  initAudio();
  const osc = audioCtx.createOscillator();
  const gain = audioCtx.createGain();
  osc.type = "triangle";
  osc.frequency.setValueAtTime(400, audioCtx.currentTime);
  osc.frequency.exponentialRampToValueAtTime(1200, audioCtx.currentTime + 0.4);
  gain.gain.setValueAtTime(0.02, audioCtx.currentTime);
  gain.gain.linearRampToValueAtTime(0, audioCtx.currentTime + 0.4);
  osc.connect(gain);
  gain.connect(audioCtx.destination);
  osc.start();
  osc.stop(audioCtx.currentTime + 0.4);
}

function playRevealSound() {
  if (!appSettings.soundEnabled) return;
  playTone(523.25, "sine", 0.6, 0.05);
  playTone(659.25, "sine", 0.6, 0.05);
  setTimeout(() => playTone(783.99, "sine", 0.6, 0.05), 50);
  setTimeout(() => playTone(1046.5, "sine", 1.0, 0.08), 150);
}

// --- Theme System ---
const prefersDarkScheme = window.matchMedia("(prefers-color-scheme: dark)");
function applyTheme(theme) {
  if (theme === "dark") {
    document.body.classList.add("dark-mode");
    document.body.classList.remove("light-mode");
    document.getElementById("themeToggle").innerText = "🌙";
  } else {
    document.body.classList.remove("dark-mode");
    document.body.classList.add("light-mode");
    document.getElementById("themeToggle").innerText = "🌞";
  }

  if (isHSRMode) {
    document.body.style.setProperty(
      "--bg-gradient",
      "linear-gradient(135deg, #1e1e2f, #3a2e5d, #7b5b8e)",
    );
  } else {
    document.body.style.removeProperty("--bg-gradient");
  }
}

const savedTheme = localStorage.getItem("animeTheme");
if (savedTheme) applyTheme(savedTheme);
else applyTheme(prefersDarkScheme.matches ? "dark" : "light");

function toggleTheme() {
  playClickSound();
  const newTheme = document.body.classList.contains("light-mode")
    ? "dark"
    : "light";
  applyTheme(newTheme);
  localStorage.setItem("animeTheme", newTheme);
}

// --- Settings & Variables ---
const appSettings = JSON.parse(localStorage.getItem("animeSettings")) || {
  guessMode: false,
  allowDupes: false,
  role: "All",
  topX: 20,
  minPop: 1000,
  soundEnabled: true,
};
document.getElementById("guessMode").checked = appSettings.guessMode;
document.getElementById("allowDupes").checked = appSettings.allowDupes;
document.getElementById("soundEnabled").checked = appSettings.soundEnabled;
document.getElementById("roleFilter").value = appSettings.role;
document.getElementById("topX").value = appSettings.topX;
document.getElementById("minPopularity").value = appSettings.minPop;

function saveSettings() {
  appSettings.guessMode = document.getElementById("guessMode").checked;
  appSettings.allowDupes = document.getElementById("allowDupes").checked;
  appSettings.soundEnabled = document.getElementById("soundEnabled").checked;
  appSettings.role = document.getElementById("roleFilter").value;
  appSettings.topX = parseInt(document.getElementById("topX").value) || 20;
  appSettings.minPop =
    parseInt(document.getElementById("minPopularity").value) || 0;
  localStorage.setItem("animeSettings", JSON.stringify(appSettings));
}

const defaultAnimeIds = [
  54112, 16498, 34572, 47917, 53446, 37141, 44511, 35507, 42310, 52701, 38000,
  235, 5081, 30694, 6702, 10087, 52991, 37349, 2001, 11617, 11061, 12189, 40748,
  5680, 37999, 52588, 34933, 30831, 52211, 33206, 32182, 58426, 48736, 31964,
  20, 18897, 19815, 52034, 30276, 29803, 527, 31240, 44942, 35790, 50265, 11757,
  37430, 54492, 20785, 849, 37779, 23755, 43692, 3455, 22319, 42249, 10033,
  35249, 8861, 32281, 54744, 2471, 39535, 33352, 21, 813, 269, 5114, 14719,
  1535, 918, 20583,
];

let myAnimeList = JSON.parse(localStorage.getItem("myAnimeListV6")) || [];
let drawnHistory = JSON.parse(sessionStorage.getItem("drawnHistory")) || [];
let currentDrawnChar = null;
let guessHistory = JSON.parse(sessionStorage.getItem("guessHistory")) || [];
const characterCache =
  JSON.parse(sessionStorage.getItem("animeCharCache")) || {};

async function fetchDefaultAnimeList() {
  let missingIds = defaultAnimeIds.filter(
    (id) => !myAnimeList.some((anime) => anime.id === id),
  );
  let total = defaultAnimeIds.length;
  let loadedCount = total - missingIds.length;

  if (missingIds.length === 0) {
    isLibraryReady = true;
    updateButtonState();
    syncMissingImages();
    return;
  }

  isLibraryReady = false;
  updateButtonState(loadedCount, total);

  for (let id of missingIds) {
    try {
      const result = await fetchFromJikan(
        `https://api.jikan.moe/v4/anime/${id}`,
      );
      if (result && result.data) {
        myAnimeList.push({
          id: id,
          title: result.data.title_english || result.data.title,
          img: result.data.images.jpg.image_url,
          active: true,
        });
        localStorage.setItem("myAnimeListV6", JSON.stringify(myAnimeList));
        sortAnimeList();
        renderAnimeList();
      }
    } catch (error) {
      console.error(`โหลด ID ${id} ไม่สำเร็จ`, error);
    }

    loadedCount++;
    updateButtonState(loadedCount, total);
    await new Promise((resolve) => setTimeout(resolve, 500));
  }

  isLibraryReady = true;
  updateButtonState();
  syncMissingImages();
}

fetchDefaultAnimeList();

function sortAnimeList() {
  myAnimeList.sort((a, b) => a.title.localeCompare(b.title));
}

async function syncMissingImages() {
  let hasChanges = false;
  for (let i = 0; i < myAnimeList.length; i++) {
    if (myAnimeList[i].img.includes("Loading...")) {
      try {
        const result = await fetchFromJikan(
          `https://api.jikan.moe/v4/anime/${myAnimeList[i].id}`,
        );
        if (result && result.data && result.data.images) {
          myAnimeList[i].img = result.data.images.jpg.image_url;
          hasChanges = true;
        }
      } catch (e) {
        console.warn(`Sync image failed for ${myAnimeList[i].id}`);
      }
      await new Promise((resolve) => setTimeout(resolve, 400));
    }
  }
  if (hasChanges) {
    localStorage.setItem("myAnimeListV6", JSON.stringify(myAnimeList));
    renderAnimeList();
  }
}

function renderAnimeList() {
  const selectorDiv = document.getElementById("animeSelector");
  const searchWord = document.getElementById("searchAnime").value.toLowerCase();
  selectorDiv.innerHTML = "";
  myAnimeList.forEach((anime, index) => {
    if (searchWord && !anime.title.toLowerCase().includes(searchWord)) return;
    const card = document.createElement("div");
    card.className = `anime-card ${anime.active ? "active" : ""}`;
    card.onclick = (e) => {
      if (e.target.classList.contains("btn-remove")) return;
      playClickSound();
      anime.active = !anime.active;
      localStorage.setItem("myAnimeListV6", JSON.stringify(myAnimeList));
      renderAnimeList();
    };
    card.innerHTML = `
            <img src="${anime.img}" alt="${anime.title}" loading="lazy">
            <div class="card-title">${anime.title}</div>
            <div class="btn-remove" onclick="removeAnime(${index}); event.stopPropagation();" title="Remove">✕</div>
        `;
    selectorDiv.appendChild(card);
  });
  updateResetButton();
}

function filterAnime() {
  renderAnimeList();
}

function toggleAllAnime(state) {
  myAnimeList.forEach((anime) => (anime.active = state));
  localStorage.setItem("myAnimeListV6", JSON.stringify(myAnimeList));
  renderAnimeList();
}

async function addAnime() {
  const input = document.getElementById("animeInput");
  let value = input.value.trim();

  // ---- Easter Egg ----
  const secretCode = value.toUpperCase();
  if (secretCode === "HSR" || secretCode === "STARRAIL") {
    input.value = "";
    toggleHSRMode();
    return;
  }
  // ----------------------------

  playClickSound();
  const idMatch = value.match(/\/anime\/(\d+)/) || value.match(/^(\d+)$/);
  const animeId = idMatch ? idMatch[1] : null;

  if (!animeId) return alert(t("invalidLink"));
  input.value = t("searching");
  try {
    const result = await fetchFromJikan(
      `https://api.jikan.moe/v4/anime/${animeId}`,
    );
    if (result && result.data) {
      if (!myAnimeList.find((a) => a.id == animeId)) {
        myAnimeList.push({
          id: animeId,
          title: result.data.title,
          img: result.data.images.jpg.image_url,
          active: true,
        });
        sortAnimeList();
        localStorage.setItem("myAnimeListV6", JSON.stringify(myAnimeList));
        renderAnimeList();
      } else {
        alert(t("alreadyInLib"));
      }
    } else {
      alert(t("notFound"));
    }
  } catch (e) {
    alert(t("notFound"));
  } finally {
    input.value = "";
  }
}

function removeAnime(index) {
  playClickSound();
  if (confirm(`${t("removeConfirm")} ${myAnimeList[index].title}?`)) {
    myAnimeList.splice(index, 1);
    localStorage.setItem("myAnimeListV6", JSON.stringify(myAnimeList));
    renderAnimeList();
  }
}

async function randomCharacter() {
  if (!isLibraryReady && !isHSRMode) return;
  playLoadingSound();

  const nameElement = document.getElementById("charName");
  const animeElement = document.getElementById("animeName");
  const imgElement = document.getElementById("charImg");
  const loader = document.getElementById("loader");
  const button = document.getElementById("btnRandom");
  const btnReveal = document.getElementById("btnReveal");
  const btnSelectFriend = document.getElementById("btnSelectFriend");
  const popElement = document.getElementById("charPop");
  const hintElement = document.getElementById("clickHint");

  // ----  HSR  ----
  if (isHSRMode && hsrCharacters.length > 0) {
    button.disabled = true;
    button.innerText = "🚀 กำลังวาร์ป...";
    imgElement.style.display = "none";
    imgElement.classList.remove("blur-mode");
    loader.style.display = "block";
    nameElement.innerText = t("castingSpell");
    animeElement.innerText = "";
    popElement.style.display = "none";
    hintElement.style.display = "none";
    btnReveal.style.display = "none";
    btnSelectFriend.style.display = "none";

    const randomPick =
      hsrCharacters[Math.floor(Math.random() * hsrCharacters.length)];
    const baseUrl =
      "https://raw.githubusercontent.com/Mar-7th/StarRailRes/master/";

    currentDrawnChar = {
      id: "HSR_" + randomPick.id,
      name: randomPick.name,
      anime: "Honkai: Star Rail",
      pop: randomPick.rarity * 100000,
      img: baseUrl + randomPick.portrait,
    };

    imgElement.onload = () => {
      loader.style.display = "none";
      imgElement.style.display = "block";
      playRevealSound();
      btnSelectFriend.style.display = "inline-block";

      if (appSettings.guessMode) {
        nameElement.innerText = "????????";
        animeElement.innerText = `${t("fromAnime")} ????????`;
        btnReveal.style.display = "inline-block";
      } else {
        nameElement.innerText = currentDrawnChar.name;
        animeElement.innerText = `${t("fromAnime")} ${currentDrawnChar.anime}`;
        popElement.style.display = "inline-block";
        popElement.innerText = `⭐ Rarity: ${randomPick.rarity} Star`;
        hintElement.style.display = "block";
      }
      button.disabled = false;
      button.innerText = t("btnRandomAgain");
    };

    imgElement.onerror = () => {
      nameElement.innerText = t("errorMsg");
      loader.style.display = "none";
      button.disabled = false;
      button.innerText = t("btnRandom");
    };

    imgElement.src = currentDrawnChar.img;
    return;
  }
  // ----------------------------

  const { role, topX, minPop, guessMode, allowDupes } = appSettings;
  const activeAnimes = myAnimeList.filter((a) => a.active);

  if (activeAnimes.length === 0) return alert(t("needOneAnime"));

  button.disabled = true;
  button.innerText = t("searching");
  imgElement.style.display = "none";
  imgElement.classList.remove("blur-mode");
  loader.style.display = "block";
  nameElement.innerText = t("castingSpell");
  animeElement.innerText = "";
  popElement.style.display = "none";
  hintElement.style.display = "none";
  btnReveal.style.display = "none";
  btnSelectFriend.style.display = "none";

  document
    .querySelectorAll("details")
    .forEach((detail) => detail.removeAttribute("open"));

  const shuffledAnimes = [...activeAnimes].sort(() => 0.5 - Math.random());
  let newDrawnChar = null;
  let apiFetches = 0;
  const maxApiFetches = 8;

  for (let anime of shuffledAnimes) {
    try {
      let characters = [];

      if (characterCache[anime.id]) {
        characters = characterCache[anime.id];
      } else {
        if (apiFetches >= maxApiFetches) break;
        if (apiFetches > 0) await new Promise((r) => setTimeout(r, 400));

        const result = await fetchFromJikan(
          `https://api.jikan.moe/v4/anime/${anime.id}/characters`,
        );
        if (!result) continue;

        characters = result.data || [];
        characterCache[anime.id] = characters;
        sessionStorage.setItem(
          "animeCharCache",
          JSON.stringify(characterCache),
        );
        apiFetches++;
      }

      let filteredChars = [...characters];

      if (role !== "All") {
        filteredChars = filteredChars.filter((c) => c.role === role);
      }

      filteredChars = filteredChars.filter((c) => (c.favorites || 0) >= minPop);
      filteredChars.sort((a, b) => (b.favorites || 0) - (a.favorites || 0));
      filteredChars = filteredChars.slice(0, topX);

      if (!allowDupes) {
        filteredChars = filteredChars.filter(
          (c) => !drawnHistory.includes(c.character.mal_id),
        );
      }

      if (filteredChars.length === 0) continue;

      const randomPick =
        filteredChars[Math.floor(Math.random() * filteredChars.length)];
      newDrawnChar = {
        id: randomPick.character.mal_id,
        name: randomPick.character.name,
        anime: anime.title,
        pop: randomPick.favorites || 0,
        img: randomPick.character.images.jpg.image_url,
      };

      break;
    } catch (error) {
      console.warn(`Skip: ${anime.title}`, error);
    }
  }

  if (!newDrawnChar) {
    nameElement.innerText = t("noNewChar");
    loader.style.display = "none";
    button.disabled = false;
    button.innerText = t("btnRandom");
    if (!allowDupes)
      document.getElementById("btnReset").style.display = "block";
    return;
  }

  currentDrawnChar = newDrawnChar;

  if (!allowDupes) {
    drawnHistory.push(currentDrawnChar.id);
    sessionStorage.setItem("drawnHistory", JSON.stringify(drawnHistory));
    updateResetButton();
  }

  imgElement.onload = () => {
    loader.style.display = "none";
    imgElement.style.display = "block";
    playRevealSound();
    btnSelectFriend.style.display = "inline-block";

    if (guessMode) {
      nameElement.innerText = "????????";
      animeElement.innerText = `${t("fromAnime")} ????????`;
      btnReveal.style.display = "inline-block";
    } else {
      nameElement.innerText = currentDrawnChar.name;
      animeElement.innerText = `${t("fromAnime")} ${currentDrawnChar.anime}`;
      popElement.style.display = "inline-block";
      popElement.innerText = `${t("popularity")} ${currentDrawnChar.pop.toLocaleString()} ${t("people")}`;
      hintElement.style.display = "block";
    }

    button.disabled = false;
    button.innerText = t("btnRandomAgain");
  };

  imgElement.onerror = () => {
    nameElement.innerText = t("errorMsg");
    loader.style.display = "none";
    button.disabled = false;
    button.innerText = t("btnRandom");
  };

  imgElement.src = currentDrawnChar.img;
}

function revealCharacter() {
  if (!currentDrawnChar) return;
  playRevealSound();
  document.getElementById("charImg").classList.remove("blur-mode");
  document.getElementById("charName").innerText = currentDrawnChar.name;
  document.getElementById("animeName").innerText =
    `${t("fromAnime")} ${currentDrawnChar.anime}`;
  document.getElementById("btnReveal").style.display = "none";
  document.getElementById("clickHint").style.display = "block";
  const popElement = document.getElementById("charPop");
  popElement.style.display = "inline-block";

  if (isHSRMode) {
    popElement.innerText = currentDrawnChar.pop
      ? `⭐ Rarity: ${currentDrawnChar.pop / 100000} Star`
      : "";
  } else {
    popElement.innerText = `${t("popularity")} ${currentDrawnChar.pop.toLocaleString()} ${t("people")}`;
  }
}

function resetHistory() {
  playClickSound();
  drawnHistory = [];
  guessHistory = [];
  sessionStorage.removeItem("drawnHistory");
  sessionStorage.removeItem("guessHistory");
  updateResetButton();
  renderHistory();
  alert(t("clearSuccess"));
}

function updateResetButton() {
  if (!appSettings.allowDupes) {
    document.getElementById("btnReset").style.display =
      drawnHistory.length > 0 ? "block" : "none";
  } else {
    document.getElementById("btnReset").style.display = "none";
  }
}

const modal = document.getElementById("imageModal");
function openModal() {
  playClickSound();
  document.getElementById("modalImg").src =
    document.getElementById("charImg").src;
  document.getElementById("modalName").innerText =
    document.getElementById("charName").innerText;
  document.getElementById("modalAnime").innerText =
    document.getElementById("animeName").innerText;
  const charPop = document.getElementById("charPop");
  const modalPop = document.getElementById("modalPop");
  if (charPop.style.display !== "none") {
    modalPop.innerText = charPop.innerText;
    modalPop.style.display = "inline-block";
  } else {
    modalPop.style.display = "none";
  }
  modal.style.display = "flex";
}

function closeModal() {
  playClickSound();
  modal.style.display = "none";
}

let hintTimer;

function renderHistory() {
  const list = document.getElementById("historyList");
  list.innerHTML = "";

  if (guessHistory.length === 0) {
    list.innerHTML = `
            <div class="history-empty">
                <span class="history-empty-icon">📭</span>
                ${t("emptyHistory")}
            </div>
        `;
    return;
  }

  [...guessHistory].reverse().forEach((item) => {
    const div = document.createElement("div");
    const statusClass = item.isCorrect ? "correct" : "wrong";
    const statusTextTh = item.isCorrect ? "✅ ทายถูก" : "❌ ข้าม";
    const statusTextEn = item.isCorrect ? "✅ Correct" : "❌ Skipped";
    const displayStatus = currentLang === "th" ? statusTextTh : statusTextEn;

    div.className = `history-item ${statusClass}`;
    div.innerHTML = `
            <img src="${item.img}" alt="character image" loading="lazy">
            <div class="history-item-info">
                <h4>${item.name}</h4>
                <p>${item.anime}</p>
            </div>
            <div class="history-status">${displayStatus}</div>
        `;
    list.appendChild(div);
  });
}

function prepareForeheadGame() {
  playClickSound();
  document.getElementById("mainContainer").style.display = "none";
  document.getElementById("foreheadGameScreen").style.display = "flex";
  document.getElementById("fhSetupStep").style.display = "block";
  document.getElementById("fhPlayStep").style.display = "none";

  document.getElementById("fhHintText").style.display = "none";
  document.getElementById("fhHintText").innerText = "";
  document.getElementById("btnShowHint").style.display = "none";
}

function cancelForeheadGame() {
  playClickSound();
  clearTimeout(hintTimer);
  document.getElementById("foreheadGameScreen").style.display = "none";
  document.getElementById("mainContainer").style.display = "";
}

function startForeheadGame() {
  playClickSound();

  try {
    if (document.documentElement.requestFullscreen)
      document.documentElement.requestFullscreen();
  } catch (e) {}

  document.getElementById("fhSetupStep").style.display = "none";
  document.getElementById("fhPlayStep").style.display = "block";

  document.getElementById("fhImg").src = currentDrawnChar.img;
  document.getElementById("fhName").innerText = currentDrawnChar.name;
  document.getElementById("fhAnime").innerText =
    `${t("fromAnime")} ${currentDrawnChar.anime}`;

  clearTimeout(hintTimer);

  if (!isHSRMode) {
    hintTimer = setTimeout(() => {
      document.getElementById("btnShowHint").style.display = "block";
      playTone(800, "sine", 0.2, 0.05);
    }, 30000);
  }
}

async function fetchAndShowHint() {
  if (isHSRMode) return;

  playClickSound();
  document.getElementById("btnShowHint").style.display = "none";
  document.getElementById("fhHintLoader").style.display = "block";
  const hintTextBox = document.getElementById("fhHintText");

  try {
    const res = await fetch(
      `https://api.jikan.moe/v4/characters/${currentDrawnChar.id}/full`,
    );
    const data = await res.json();

    let aboutText = data.data.about;
    if (!aboutText) throw new Error("No about info");

    let shortHint = aboutText.split("\n")[0].replace(/\\/g, "");
    if (shortHint.length > 250) shortHint = shortHint.substring(0, 250) + "...";

    if (currentLang === "th") {
      try {
        const tRes = await fetch(
          `https://api.mymemory.translated.net/get?q=${encodeURIComponent(shortHint)}&langpair=en|th`,
        );
        const tData = await tRes.json();
        if (tData && tData.responseData && tData.responseData.translatedText) {
          shortHint = tData.responseData.translatedText;
        }
      } catch (e) {
        console.log("Translation failed");
        shortHint = "⚠️ (ไม่สามารถแปลภาษาได้ในขณะนี้)\n" + shortHint;
      }
    }

    hintTextBox.innerText = shortHint;
    document.getElementById("fhHintLoader").style.display = "none";
    hintTextBox.style.display = "block";
    hintTextBox.style.animation = "bounceIn 0.3s";
  } catch (error) {
    document.getElementById("fhHintLoader").style.display = "none";
    hintTextBox.innerText =
      currentLang === "th"
        ? "❌ ไม่มีข้อมูลคำใบ้ของตัวละครนี้"
        : "❌ No hint available.";
    hintTextBox.style.display = "block";
  }
}

function endForeheadGame(isCorrect) {
  if (isCorrect) {
    playRevealSound();
    alert(
      currentLang === "th"
        ? "สุดยอด! ทายถูกด้วย 🎉"
        : "Awesome! You guessed it right 🎉",
    );
  } else {
    playTone(300, "sawtooth", 0.5, 0.05);
    alert(
      currentLang === "th"
        ? "ไม่เป็นไรนะ ไว้ทายใหม่! 😅"
        : "Nice try! Let's roll again! 😅",
    );
  }

  guessHistory.push({
    name: currentDrawnChar.name,
    anime: currentDrawnChar.anime,
    img: currentDrawnChar.img,
    isCorrect: isCorrect,
  });
  sessionStorage.setItem("guessHistory", JSON.stringify(guessHistory));
  renderHistory();

  try {
    if (document.exitFullscreen) document.exitFullscreen();
  } catch (e) {}

  clearTimeout(hintTimer);
  document.getElementById("foreheadGameScreen").style.display = "none";
  document.getElementById("mainContainer").style.display = "";
}

// --- Navigation System ---
function openWhoAmI() {
  playClickSound();
  document.getElementById("menuContainer").style.display = "none";
  document.getElementById("azGameContainer").style.display = "none";
  document.getElementById("mainContainer").style.display = "block";
}

function openAZGame() {
  playClickSound();
  document.getElementById("menuContainer").style.display = "none";
  document.getElementById("mainContainer").style.display = "none";
  document.getElementById("azGameContainer").style.display = "block";
  updateAZTimerDisplay();
}

function goBackToMenu() {
  playClickSound();
  clearInterval(azInterval);
  document.getElementById("mainContainer").style.display = "none";
  document.getElementById("azGameContainer").style.display = "none";
  document.getElementById("menuContainer").style.display = "block";

  // Reset A-Z
  document.getElementById("azLetterDisplay").innerText = "?";
  updateAZTimerDisplay();
  document.getElementById("azTimerDisplay").classList.remove("danger");
  document.getElementById("btnStartAZ").innerText = t("btnRollAZ");
  document.getElementById("btnStartAZ").disabled = false;
}

// --- A-Z Game Variables ---
let azInterval;
let azTimeout;
let azRollAnim;
let azDrawnHistory = [];
const totalAZLetters = 26;

function openAZGame() {
  playClickSound();
  document.getElementById("menuContainer").style.display = "none";
  document.getElementById("mainContainer").style.display = "none";
  document.getElementById("azGameContainer").style.display = "flex";
  updateAZTimerDisplay();
  renderAZHistory();
}

function goBackToMenu() {
  playClickSound();
  clearInterval(azInterval);
  clearTimeout(azTimeout);
  clearInterval(azRollAnim);

  document.getElementById("mainContainer").style.display = "none";
  document.getElementById("azGameContainer").style.display = "none";
  document.getElementById("musicGameContainer").style.display = "none";
  document.getElementById("menuContainer").style.display = "block";

  document.getElementById("azLetterDisplay").innerText = "?";
  updateAZTimerDisplay();
  document.getElementById("azTimerDisplay").classList.remove("danger");

  const btn = document.getElementById("btnStartAZ");
  btn.innerText =
    currentLang === "th" ? "🎲 เริ่มสุ่มอักษร!" : "🎲 Roll Letter!";
  btn.disabled = false;
}

function updateAZTimerDisplay() {
  let timeSetting =
    parseFloat(document.getElementById("azTimeInput").value) || 10;
  document.getElementById("azTimerDisplay").innerText = timeSetting.toFixed(1);
}

function renderAZHistory() {
  const logContainer = document.getElementById("azHistoryLog");
  const countDisplay = document.getElementById("azHistoryCount");
  logContainer.innerHTML = "";

  countDisplay.innerText = `(${azDrawnHistory.length}/${totalAZLetters})`;

  azDrawnHistory.forEach((letter) => {
    const div = document.createElement("div");
    div.className = "az-log-item";
    div.innerText = letter;
    logContainer.appendChild(div);
  });

  const emptyCount = totalAZLetters - azDrawnHistory.length;
  for (let i = 0; i < emptyCount; i++) {
    const div = document.createElement("div");
    div.className = "az-log-item empty";
    div.innerText = "?";
    logContainer.appendChild(div);
  }

  document.getElementById("btnResetAZ").style.display =
    azDrawnHistory.length > 0 ? "inline-block" : "none";
}

function resetAZHistory() {
  playClickSound();
  azDrawnHistory = [];
  document.getElementById("azLetterDisplay").innerText = "?";
  updateAZTimerDisplay();
  document.getElementById("btnStartAZ").innerText = t("btnRollAZ");
  document.getElementById("btnStartAZ").disabled = false;
  renderAZHistory();
}

function openAZModal() {
  document.getElementById("azModal").style.display = "flex";
  try {
    if (document.documentElement.requestFullscreen) {
      document.documentElement.requestFullscreen();
    }
  } catch (e) {}
}

function closeAZModal() {
  playClickSound();
  document.getElementById("azModal").style.display = "none";
  try {
    if (document.exitFullscreen) {
      document.exitFullscreen();
    }
  } catch (e) {}
}

function rollAZ() {
  if (azDrawnHistory.length >= totalAZLetters) {
    alert(
      currentLang === "th"
        ? "อักษรออกครบหมดแล้ว 26 ตัว! โปรดกดรีเซ็ตเริ่มรอบใหม่"
        : "All 26 letters drawn! Please reset.",
    );
    return;
  }

  clearInterval(azInterval);
  clearTimeout(azTimeout);
  clearInterval(azRollAnim);

  try {
    playLoadingSound();
  } catch (e) {}

  if (document.getElementById("azModal").style.display !== "flex") {
    openAZModal();
  }

  const btn = document.getElementById("btnStartAZ");
  const btnModalRoll = document.getElementById("btnModalRoll");

  if (btn) btn.disabled = true;
  if (btnModalRoll) {
    btnModalRoll.disabled = true;
    btnModalRoll.style.display = "none";
  }

  const allLetters = "ABCDEFGHIJKLMNOPQRSTUVWXYZ".split("");
  const availableLetters = allLetters.filter(
    (l) => !azDrawnHistory.includes(l),
  );

  const letterDisplay = document.getElementById("azLetterDisplay");
  const modalLetterDisplay = document.getElementById("azModalLetter");
  const timerDisplay = document.getElementById("azTimerDisplay");
  const modalTimerDisplay = document.getElementById("azModalTimer");
  const modalStatus = document.getElementById("azModalStatus");

  if (timerDisplay) timerDisplay.classList.remove("danger");
  if (modalTimerDisplay) modalTimerDisplay.classList.remove("danger");

  let timeSetting =
    parseFloat(document.getElementById("azTimeInput").value) || 10;
  let totalTicks = Math.floor(timeSetting * 10);

  const initialTimeStr = (totalTicks / 10).toFixed(1);
  if (timerDisplay) timerDisplay.innerText = initialTimeStr;
  if (modalTimerDisplay) modalTimerDisplay.innerText = initialTimeStr;
  if (modalStatus)
    modalStatus.innerText =
      currentLang === "th" ? "กำลังสุ่ม..." : "Rolling...";

  let rollCount = 0;
  const rollAgainTxt = currentLang === "th" ? "🎲 สุ่มใหม่!" : "🎲 Roll Again!";

  azRollAnim = setInterval(() => {
    const tempLetter =
      availableLetters[Math.floor(Math.random() * availableLetters.length)];
    if (letterDisplay) letterDisplay.innerText = tempLetter;
    if (modalLetterDisplay) modalLetterDisplay.innerText = tempLetter;
    rollCount++;

    if (rollCount > 12) {
      clearInterval(azRollAnim);

      const finalLetter =
        availableLetters[Math.floor(Math.random() * availableLetters.length)];
      if (letterDisplay) letterDisplay.innerText = finalLetter;
      if (modalLetterDisplay) modalLetterDisplay.innerText = finalLetter;

      azDrawnHistory.push(finalLetter);
      renderAZHistory();

      try {
        playRevealSound();
      } catch (e) {}

      const getReadyTxt =
        currentLang === "th" ? "🔥 เตรียมตัว..." : "🔥 Get Ready...";
      if (btn) btn.innerText = getReadyTxt;
      if (modalStatus) modalStatus.innerText = getReadyTxt;

      azTimeout = setTimeout(() => {
        if (btn) {
          btn.disabled = false;
          btn.innerText = rollAgainTxt;
        }
        if (modalStatus)
          modalStatus.innerText =
            currentLang === "th"
              ? "เงียบไว้... คิดชื่ออนิเมะ! 🤔"
              : "Think of an anime! 🤔";

        azInterval = setInterval(() => {
          totalTicks--;

          if (totalTicks <= 0) {
            totalTicks = 0;
            clearInterval(azInterval);

            if (timerDisplay) timerDisplay.innerText = "0.0";
            if (modalTimerDisplay) modalTimerDisplay.innerText = "0.0";
            if (modalStatus)
              modalStatus.innerText =
                currentLang === "th"
                  ? "หมดเวลา! ตะโกนเลย! 🗣️"
                  : "Time's Up! Shout! 🗣️";

            if (btnModalRoll) {
              btnModalRoll.style.display = "inline-block";
              btnModalRoll.disabled = false;
            }

            if (azDrawnHistory.length >= totalAZLetters) {
              if (btn) {
                btn.innerText =
                  currentLang === "th"
                    ? "จบเกม! ครบ A-Z แล้ว"
                    : "Game Over! All Done";
                btn.disabled = true;
              }
              if (btnModalRoll) {
                btnModalRoll.innerText =
                  currentLang === "th"
                    ? "รีเซ็ตเพื่อเล่นใหม่"
                    : "Reset to Play Again";
                btnModalRoll.onclick = () => {
                  closeAZModal();
                  resetAZHistory();
                };
              }
            } else {
              if (btn) btn.innerText = "หมดเวลา! " + rollAgainTxt;
              if (btnModalRoll) {
                btnModalRoll.innerText = rollAgainTxt;
                btnModalRoll.onclick = rollAZ;
              }
            }

            try {
              if (typeof playTimesUpSound === "function") {
                playTimesUpSound();
              } else {
                playTone(1046.5, "sine", 1.0, 0.5);
              }
            } catch (e) {
              console.warn("Sound blocked or error:", e);
            }
          } else {
            const timeStr = (totalTicks / 10).toFixed(1);
            if (timerDisplay) timerDisplay.innerText = timeStr;
            if (modalTimerDisplay) modalTimerDisplay.innerText = timeStr;

            if (totalTicks <= 30) {
              if (timerDisplay) timerDisplay.classList.add("danger");
              if (modalTimerDisplay) modalTimerDisplay.classList.add("danger");
              if (totalTicks % 10 === 0) {
                try {
                  playTone(800, "sine", 0.1, 0.05);
                } catch (e) {}
              }
            }
          }
        }, 100);
      }, 1500);
    }
  }, 50);
}

function openMusicGame() {
  playClickSound();
  document.getElementById("menuContainer").style.display = "none";
  document.getElementById("mainContainer").style.display = "none";
  document.getElementById("azGameContainer").style.display = "none";
  document.getElementById("musicGameContainer").style.display = "block";
  updateMusicLanguageUI();
}

// --- Music Game System ---
let currentMusic = null;
let currentMusicAnime = null;
let musicAudioUrl = null;
let musicAudio = null;

const popularAnimeSongs = [
  { name: "Idol", artist: "YOASOBI", anime: "Oshi no Ko", type: "OP" },
  { name: "Bling-Bang-Bang-Born", artist: "Creepy Nuts", anime: "Mashle: Magic and Muscles", type: "OP" },
  { name: "Unravel", artist: "TK from Ling tosite sigure", anime: "Tokyo Ghoul", type: "OP" },
  { name: "Gurenge", artist: "LiSA", anime: "Demon Slayer", type: "OP" },
  { name: "Kaikai Kitan", artist: "Eve", anime: "Jujutsu Kaisen", type: "OP" },
  { name: "SPECIALZ", artist: "King Gnu", anime: "Jujutsu Kaisen", type: "OP" },
  { name: "Kick Back", artist: "Kenshi Yonezu", anime: "Chainsaw Man", type: "OP" },
  { name: "The Rumbling", artist: "SiM", anime: "Attack on Titan", type: "OP" },
  { name: "Guren no Yumiya", artist: "Linked Horizon", anime: "Attack on Titan", type: "OP" },
  { name: "Shinzo wo Sasageyo!", artist: "Linked Horizon", anime: "Attack on Titan", type: "OP" },
  { name: "Silhouette", artist: "KANA-BOON", anime: "Naruto: Shippuden", type: "OP" },
  { name: "Blue Bird", artist: "Ikimonogakari", anime: "Naruto: Shippuden", type: "OP" },
  { name: "Cruel Angel's Thesis", artist: "Yoko Takahashi", anime: "Neon Genesis Evangelion", type: "OP" },
  { name: "Butter-Fly", artist: "Koji Wada", anime: "Digimon Adventure", type: "OP" },
  { name: "Again", artist: "YUI", anime: "Fullmetal Alchemist: Brotherhood", type: "OP" },
  { name: "Peace Sign", artist: "Kenshi Yonezu", anime: "My Hero Academia", type: "OP" },
  { name: "Cry Baby", artist: "Official HIGE DANdism", anime: "Tokyo Revengers", type: "OP" },
  { name: "Inferno", artist: "Mrs. GREEN APPLE", anime: "Fire Force", type: "OP" },
  { name: "Crossing Field", artist: "LiSA", anime: "Sword Art Online", type: "OP" },
  { name: "COLORS", artist: "FLOW", anime: "Code Geass", type: "OP" },
  { name: "Renai Circulation", artist: "Kana Hanazawa", anime: "Bakemonogatari", type: "OP" },
  { name: "Connect", artist: "ClariS", anime: "Puella Magi Madoka Magica", type: "OP" },
  { name: "Cha-La Head-Cha-La", artist: "Hironobu Kageyama", anime: "Dragon Ball Z", type: "OP" },
  { name: "We Are!", artist: "Hiroshi Kitadani", anime: "One Piece", type: "OP" },
  { name: "Kyouran Hey Kids!!", artist: "THE ORAL CIGARETTES", anime: "Noragami", type: "OP" }
];

function updateMusicLanguageUI() {
  document.getElementById("text_btnBackMenu3").innerText = t("btnBackMenu");
  document.getElementById("text_musicTitle").innerText = t("musicTitle");
  document.getElementById("text_musicRule").innerText = t("musicRule");
  const btnMusic = document.getElementById("btnStartMusic");
  if (currentLang === "th") {
    btnMusic.innerText = "🎲 สุ่มเพลง!";
  } else {
    btnMusic.innerText = "🎲 Roll Song!";
  }
}

async function searchAudioPreview(songName, artist) {
    try {
        const query = encodeURIComponent(`${songName} ${artist}`);
        const res = await fetch(`https://itunes.apple.com/search?term=${query}&entity=song&limit=1`);
        const data = await res.json();
        if (data.results && data.results.length > 0) {
            return data.results[0].previewUrl;
        }
        
        // Fallback: search just the song name if combined search fails
        const fallbackRes = await fetch(`https://itunes.apple.com/search?term=${encodeURIComponent(songName)}&entity=song&limit=1`);
        const fallbackData = await fallbackRes.json();
        if (fallbackData.results && fallbackData.results.length > 0) {
            return fallbackData.results[0].previewUrl;
        }
    } catch (e) {
        console.warn("Audio search failed", e);
    }
    return null;
}

async function rollMusic() {
  playLoadingSound();

  const musicLoader = document.getElementById("musicLoader");
  const musicInfo = document.getElementById("musicInfo");
  const vinylRecord = document.getElementById("vinylRecord");

  musicLoader.style.display = "block";
  musicInfo.style.display = "none";

  // Spin vinyl
  vinylRecord.style.animation = "none";
  setTimeout(() => {
    vinylRecord.style.animation = "spin 2s linear infinite";
  }, 10);

  // Pick random popular OP
  currentMusic = popularAnimeSongs[Math.floor(Math.random() * popularAnimeSongs.length)];

  // Display masked music info
  document.getElementById("songName").innerText = "????????";
  document.getElementById("artistName").innerText = `by ????????`;
  document.getElementById("musicType").innerText = currentMusic.type + " (Opening)";
  document.getElementById("musicAnimeName").style.display = "none";
  document.getElementById("musicAnimeName").innerText = "";
  document.getElementById("btnYoutube").style.display = "none";
  document.getElementById("btnRevealMusic").innerText = t("btnReveal");
  document.getElementById("btnRevealMusic").style.display = "block";

  const audioPlayer = document.getElementById("audioPlayer");
  const audioErrorMsg = document.getElementById("audioErrorMsg");
  const indicator = document.getElementById("musicPlayingIndicator");
  
  if (audioPlayer) {
      audioPlayer.style.display = "none";
      audioPlayer.pause();
      audioPlayer.src = "";
  }
  if (audioErrorMsg) audioErrorMsg.style.display = "none";
  if (indicator) indicator.style.display = "none";

  musicLoader.style.display = "none";
  musicInfo.style.display = "block";

  // Search and set up audio
  const previewUrl = await searchAudioPreview(currentMusic.name, currentMusic.artist);
  if (previewUrl && audioPlayer) {
      audioPlayer.src = previewUrl;
      audioPlayer.style.display = "block";
      
      audioPlayer.onplay = () => {
          vinylRecord.style.animation = "spin 2s linear infinite";
          if (indicator) indicator.style.display = "block";
      };
      audioPlayer.onpause = () => {
          vinylRecord.style.animation = "none";
          if (indicator) indicator.style.display = "none";
      };
      audioPlayer.onended = () => {
          vinylRecord.style.animation = "none";
          if (indicator) indicator.style.display = "none";
      };

      try {
          await audioPlayer.play();
      } catch (e) {
          console.warn("Autoplay prevented:", e);
          vinylRecord.style.animation = "none";
      }
  } else {
      if (audioErrorMsg) audioErrorMsg.style.display = "block";
      vinylRecord.style.animation = "none";
      // Optional: keep the beep sound if audio not found
      playMusicPlaybackSound();
  }
}

function playMusicPlaybackSound() {
  // Show "Now Playing" indicator
  const indicator = document.getElementById("musicPlayingIndicator");
  if (indicator) {
    indicator.style.display = "block";
  }

  // Play a series of ascending tones to indicate music is "playing"
  if (!appSettings.soundEnabled) return;
  initAudio();

  const notes = [523.25, 587.33, 659.25, 783.99]; // C, D, E, G
  notes.forEach((freq, idx) => {
    setTimeout(() => {
      playTone(freq, "sine", 0.3, 0.02);
    }, idx * 150);
  });
}

function revealMusicAnime() {
  playRevealSound();
  if (currentMusic) {
    // Hide playing indicator if audio is not actually playing
    const audioPlayer = document.getElementById("audioPlayer");
    if (!audioPlayer || audioPlayer.paused) {
      const vinylRecord = document.getElementById("vinylRecord");
      if (vinylRecord) vinylRecord.style.animation = "none";
      const indicator = document.getElementById("musicPlayingIndicator");
      if (indicator) indicator.style.display = "none";
    }

    document.getElementById("songName").innerText = currentMusic.name;
    document.getElementById("artistName").innerText = `by ${currentMusic.artist}`;
    document.getElementById("musicAnimeName").innerText = currentMusic.anime;
    document.getElementById("musicAnimeName").style.display = "block";

    const searchQuery = encodeURIComponent(`${currentMusic.name} ${currentMusic.artist}`);
    document.getElementById("btnYoutube").href = `https://www.youtube.com/results?search_query=${searchQuery}`;
    document.getElementById("btnYoutube").style.display = "block";
    document.getElementById("btnRevealMusic").style.display = "none";
  }
}

// Initial Calls
sortAnimeList();
renderAnimeList();
syncMissingImages();
updateLanguageUI();
renderHistory();
