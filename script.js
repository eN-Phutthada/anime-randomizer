const currentTheme = localStorage.getItem("animeTheme") || "dark";
if (currentTheme === "light") {
  document.body.classList.add("light-mode");
  document.getElementById("themeToggle").innerText = "🌞";
}

function toggleTheme() {
  document.body.classList.toggle("light-mode");
  const isLight = document.body.classList.contains("light-mode");
  document.getElementById("themeToggle").innerText = isLight ? "🌞" : "🌙";
  localStorage.setItem("animeTheme", isLight ? "light" : "dark");
}

const appSettings = JSON.parse(localStorage.getItem("animeSettings")) || {
  guessMode: false,
  allowDupes: false,
  role: "All",
  topX: 20,
  minPop: 100,
};

document.getElementById("guessMode").checked = appSettings.guessMode;
document.getElementById("allowDupes").checked = appSettings.allowDupes;
document.getElementById("roleFilter").value = appSettings.role;
document.getElementById("topX").value = appSettings.topX;
document.getElementById("minPopularity").value = appSettings.minPop;

function saveSettings() {
  appSettings.guessMode = document.getElementById("guessMode").checked;
  appSettings.allowDupes = document.getElementById("allowDupes").checked;
  appSettings.role = document.getElementById("roleFilter").value;
  appSettings.topX = parseInt(document.getElementById("topX").value) || 20;
  appSettings.minPop =
    parseInt(document.getElementById("minPopularity").value) || 0;
  localStorage.setItem("animeSettings", JSON.stringify(appSettings));
}

let myAnimeList = JSON.parse(localStorage.getItem("myAnimeListV5"));
if (!myAnimeList || myAnimeList.length < 60) {
  const megaAnimePack = [
    { id: 54112, title: "Alya Hides Her Feelings" },
    { id: 16498, title: "Attack on Titan" },
    { id: 34572, title: "Black Clover" },
    { id: 47917, title: "Bocchi the Rock!" },
    { id: 53446, title: "Campfire Cooking in Another World" },
    { id: 37141, title: "Cells at Work!" },
    { id: 44511, title: "Chainsaw Man" },
    { id: 35507, title: "Classroom of the Elite" },
    { id: 42310, title: "Cyberpunk: Edgerunners" },
    { id: 52701, title: "Delicious in Dungeon" },
    { id: 38000, title: "Demon Slayer" },
    { id: 235, title: "Detective Conan" },
    { id: 5081, title: "Doraemon" },
    { id: 30694, title: "Dragon Ball Super" },
    { id: 6702, title: "Fairy Tail" },
    { id: 10087, title: "Fate/Zero" },
    { id: 52991, title: "Frieren" },
    { id: 37349, title: "Goblin Slayer" },
    { id: 2001, title: "Gurren Lagann" },
    { id: 11617, title: "High School DxD" },
    { id: 11061, title: "Hunter x Hunter" },
    { id: 12189, title: "Hyouka" },
    { id: 40748, title: "Jujutsu Kaisen" },
    { id: 5680, title: "K-ON!" },
    { id: 37999, title: "Kaguya-sama" },
    { id: 52588, title: "Kaiju No. 8" },
    { id: 34933, title: "Kakegurui" },
    { id: 30831, title: "Konosuba" },
    { id: 52211, title: "MASHLE" },
    { id: 33206, title: "Miss Kobayashi's Dragon Maid" },
    { id: 32182, title: "Mob Psycho 100" },
    { id: 58426, title: "My Deer Friend Nokotan" },
    { id: 48736, title: "My Dress-Up Darling" },
    { id: 31964, title: "My Hero Academia" },
    { id: 20, title: "Naruto" },
    { id: 18897, title: "Nisekoi" },
    { id: 19815, title: "No Game, No Life" },
    { id: 52034, title: "OSHI NO KO" },
    { id: 30276, title: "One-Punch Man" },
    { id: 29803, title: "Overlord" },
    { id: 527, title: "Pokemon" },
    { id: 31240, title: "Re:Zero" },
    { id: 44942, title: "Record of Ragnarok" },
    { id: 35790, title: "Shield Hero" },
    { id: 50265, title: "Spy x Family" },
    { id: 11757, title: "Sword Art Online" },
    { id: 37430, title: "That Time I Got Reincarnated as a Slime" },
    { id: 54492, title: "The Apothecary Diaries" },
    { id: 20785, title: "The Irregular at Magic High School" },
    { id: 849, title: "The Melancholy of Haruhi Suzumiya" },
    { id: 37779, title: "The Promised Neverland" },
    { id: 23755, title: "The Seven Deadly Sins" },
    { id: 43692, title: "The Way of the Househusband" },
    { id: 3455, title: "To Love Ru" },
    { id: 22319, title: "Tokyo Ghoul" },
    { id: 42249, title: "Tokyo Revengers" },
    { id: 10033, title: "Toriko" },
    { id: 35249, title: "Umamusume" },
    { id: 8861, title: "Yosuga no Sora" },
    { id: 32281, title: "Your Name" },
  ];
  myAnimeList = megaAnimePack.map((anime) => ({
    ...anime,
    img: `https://via.placeholder.com/150x220/2a2a40/ff4757?text=Loading...`,
    active: true,
  }));
  localStorage.setItem("myAnimeListV5", JSON.stringify(myAnimeList));
}

let drawnHistory = JSON.parse(sessionStorage.getItem("drawnHistory")) || [];
let currentDrawnChar = null;

function sortAnimeList() {
  myAnimeList.sort((a, b) => a.title.localeCompare(b.title));
}

async function syncMissingImages() {
  for (let i = 0; i < myAnimeList.length; i++) {
    if (myAnimeList[i].img.includes("Loading...")) {
      try {
        const res = await fetch(
          `https://api.jikan.moe/v4/anime/${myAnimeList[i].id}`,
        );
        const result = await res.json();
        if (result.data && result.data.images) {
          myAnimeList[i].img = result.data.images.jpg.image_url;
          localStorage.setItem("myAnimeListV5", JSON.stringify(myAnimeList));
          renderAnimeList();
        }
      } catch (e) {}
      await new Promise((resolve) => setTimeout(resolve, 800));
    }
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
      anime.active = !anime.active;
      localStorage.setItem("myAnimeListV5", JSON.stringify(myAnimeList));
      renderAnimeList();
    };
    card.innerHTML = `
            <img src="${anime.img}" alt="${anime.title}" loading="lazy">
            <div class="card-title">${anime.title}</div>
            <div class="btn-remove" onclick="removeAnime(${index}); event.stopPropagation();" title="ลบเรื่องนี้">✕</div>
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
  localStorage.setItem("myAnimeListV5", JSON.stringify(myAnimeList));
  renderAnimeList();
}

async function addAnime() {
  const input = document.getElementById("animeInput");
  let value = input.value.trim();
  const idMatch = value.match(/\/anime\/(\d+)/) || value.match(/^(\d+)$/);
  const animeId = idMatch ? idMatch[1] : null;

  if (!animeId) return alert("กรุณาใส่ลิงก์หรือ ID ให้ถูกต้องครับ");
  input.value = "กำลังค้นหา...";
  try {
    const res = await fetch(`https://api.jikan.moe/v4/anime/${animeId}`);
    const result = await res.json();
    if (result.data) {
      if (!myAnimeList.find((a) => a.id == animeId)) {
        myAnimeList.push({
          id: animeId,
          title: result.data.title,
          img: result.data.images.jpg.image_url,
          active: true,
        });
        sortAnimeList();
        localStorage.setItem("myAnimeListV5", JSON.stringify(myAnimeList));
        renderAnimeList();
      } else {
        alert("เรื่องนี้อยู่ในคลังแล้วครับ!");
      }
    }
  } catch (e) {
    alert("ไม่พบข้อมูลอนิเมะ");
  } finally {
    input.value = "";
  }
}

function removeAnime(index) {
  if (confirm(`ต้องการลบ ${myAnimeList[index].title} ใช่ไหม?`)) {
    myAnimeList.splice(index, 1);
    localStorage.setItem("myAnimeListV5", JSON.stringify(myAnimeList));
    renderAnimeList();
  }
}

async function randomCharacter() {
  const nameElement = document.getElementById("charName");
  const animeElement = document.getElementById("animeName");
  const imgElement = document.getElementById("charImg");
  const loader = document.getElementById("loader");
  const button = document.getElementById("btnRandom");
  const btnReveal = document.getElementById("btnReveal");
  const popElement = document.getElementById("charPop");
  const hintElement = document.getElementById("clickHint");

  const { role, topX, minPop, guessMode, allowDupes } = appSettings;
  const activeAnimes = myAnimeList.filter((a) => a.active);

  if (activeAnimes.length === 0)
    return alert("กรุณาเลือกอนิเมะอย่างน้อย 1 เรื่อง!");

  const randomAnime =
    activeAnimes[Math.floor(Math.random() * activeAnimes.length)];

  button.disabled = true;
  button.innerText = "กำลังค้นหา...";
  imgElement.style.display = "none";
  imgElement.classList.remove("blur-mode");
  loader.style.display = "block";
  nameElement.innerText = "กำลังร่ายเวทมนตร์... ✨";
  animeElement.innerText = "";
  popElement.style.display = "none";
  hintElement.style.display = "none";
  btnReveal.style.display = "none";

  document
    .querySelectorAll("details")
    .forEach((detail) => detail.removeAttribute("open"));

  try {
    const response = await fetch(
      `https://api.jikan.moe/v4/anime/${randomAnime.id}/characters`,
    );
    const result = await response.json();
    let characters = result.data;

    if (role !== "All") characters = characters.filter((c) => c.role === role);
    characters = characters.filter((c) => (c.favorites || 0) >= minPop);
    characters.sort((a, b) => b.favorites - a.favorites);
    characters = characters.slice(0, topX);

    let availableCharacters = characters;
    if (!allowDupes) {
      availableCharacters = characters.filter(
        (c) => !drawnHistory.includes(c.character.mal_id),
      );
    }

    if (availableCharacters.length === 0) {
      nameElement.innerText =
        "ไม่พบตัวละครใหม่แล้ว! (ลองกดยอมให้สุ่มซ้ำได้ในตั้งค่าดูนะ)";
      animeElement.innerText = `จากเรื่อง: ${randomAnime.title}`;
      loader.style.display = "none";
      button.disabled = false;
      button.innerText = "🎲 สุ่มเลย!";
      if (!allowDupes)
        document.getElementById("btnReset").style.display = "block";
      return;
    }

    const randomPick =
      availableCharacters[
        Math.floor(Math.random() * availableCharacters.length)
      ];
    currentDrawnChar = {
      name: randomPick.character.name,
      anime: randomAnime.title,
      pop: randomPick.favorites || 0,
      img: randomPick.character.images.jpg.image_url,
    };

    if (!allowDupes) {
      drawnHistory.push(currentDrawnChar.mal_id);
      sessionStorage.setItem("drawnHistory", JSON.stringify(drawnHistory));
      updateResetButton();
    }

    imgElement.onload = () => {
      loader.style.display = "none";
      imgElement.style.display = "block";

      if (guessMode) {
        nameElement.innerText = "????????";
        animeElement.innerText = "จากเรื่อง: ????????";
        btnReveal.style.display = "inline-block";
      } else {
        nameElement.innerText = currentDrawnChar.name;
        animeElement.innerText = `จากเรื่อง: ${currentDrawnChar.anime}`;
        popElement.style.display = "inline-block";
        popElement.innerText = `❤️ ความนิยม: ${currentDrawnChar.pop.toLocaleString()} คน`;
        hintElement.style.display = "block";
      }

      button.disabled = false;
      button.innerText = "🎲 สุ่มต่อ!";
    };
    imgElement.src = currentDrawnChar.img;
  } catch (error) {
    nameElement.innerText = "เกิดข้อผิดพลาด ลองใหม่นะ 😅";
    loader.style.display = "none";
    button.disabled = false;
    button.innerText = "🎲 สุ่มเลย!";
  }
}

function revealCharacter() {
  if (!currentDrawnChar) return;
  document.getElementById("charImg").classList.remove("blur-mode");
  document.getElementById("charName").innerText = currentDrawnChar.name;
  document.getElementById("animeName").innerText =
    `จากเรื่อง: ${currentDrawnChar.anime}`;
  document.getElementById("btnReveal").style.display = "none";
  document.getElementById("clickHint").style.display = "block";

  const popElement = document.getElementById("charPop");
  popElement.style.display = "inline-block";
  popElement.innerText = `❤️ ความนิยม: ${currentDrawnChar.pop.toLocaleString()} คน`;
}

function resetHistory() {
  drawnHistory = [];
  sessionStorage.removeItem("drawnHistory");
  updateResetButton();
  alert("ล้างความจำเรียบร้อย! ตอนนี้สุ่มตัวเดิมซ้ำได้แล้วครับ");
}

function updateResetButton() {
  if (!appSettings.allowDupes) {
    document.getElementById("btnReset").style.display =
      drawnHistory.length > 0 ? "block" : "none";
  } else {
    document.getElementById("btnReset").style.display = "none";
  }
}

sortAnimeList();
renderAnimeList();
syncMissingImages();

const modal = document.getElementById("imageModal");
function openModal() {
  if (
    appSettings.guessMode &&
    document.getElementById("btnReveal").style.display !== "none"
  )
    return;

  document.getElementById("modalImg").src =
    document.getElementById("charImg").src;
  document.getElementById("modalName").innerText =
    document.getElementById("charName").innerText;
  document.getElementById("modalAnime").innerText =
    document.getElementById("animeName").innerText;
  document.getElementById("modalPop").innerText =
    document.getElementById("charPop").innerText;
  modal.style.display = "flex";
}
function closeModal() {
  modal.style.display = "none";
}
