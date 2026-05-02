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

// Initial Calls
sortAnimeList();
renderAnimeList();
syncMissingImages();
updateLanguageUI();
renderHistory();
