function formatPoints(val) {
  if (val == null || val === "") return "";
  let num = parseFloat(val);
  if (isNaN(num)) return val;
  num = Math.floor(num * 1000) / 1000;
  if (num % 1 === 0) return num.toFixed(2);
  return num.toString();
}

let players = [];

async function loadExcel() {
  try {
    // تحميل الملف من نفس المجلد - المسافة يجب أن تُرمّز إلى %20
    const response = await fetch('./Arab%20Demon%20List.xlsx');
    if (!response.ok) throw new Error("لم يتم العثور على الملف أو فشل التحميل.");

    const arrayBuffer = await response.arrayBuffer();
    const workbook = XLSX.read(arrayBuffer, { type: 'array' });
    const sheet = workbook.Sheets[workbook.SheetNames[0]];
    const data = XLSX.utils.sheet_to_json(sheet, { header: 1 });

    if (!data || data.length < 3) throw new Error("الملف فارغ أو لا يحتوي على البيانات المتوقعة.");

    const playerNumbers = data[0].slice(4);
    const playerNames = data[1].slice(4);
    const playerPoints = data[2].slice(4);

    const playerCount = Math.min(playerNumbers.length, playerNames.length, playerPoints.length);

    players = [];
    for (let i = 0; i < playerCount; i++) {
      players.push({
        id: playerNumbers[i] || (i + 1),
        name: playerNames[i] || `Player${i+1}`,
        value: formatPoints(playerPoints[i]),
        clears: []
      });
    }

    // قراءة المراحل لكل لاعب
    for (let r = 3; r < Math.min(data.length, 153); r++) {
      const levelName = data[r]?.[3];
      if (!levelName) continue;

      for (let c = 4; c < Math.min(data[r].length, 4 + playerCount); c++) {
        const cellValue = String(data[r][c] || "").trim().toLowerCase();
        if (cellValue === "clear") {
          players[c - 4].clears.push(levelName);
        }
      }
    }

    // البحث
    const searchInput = document.getElementById("search-input");
    const playerInfoDiv = document.getElementById("player-info");

    searchInput.addEventListener("input", () => {
      const searchValue = searchInput.value.trim().toLowerCase();
      if (searchValue === "") {
        playerInfoDiv.style.display = "none";
        return;
      }

      const player = players.find(p => p.name.toLowerCase() === searchValue);

      if (player) {
        const bestLevel = player.clears.length > 0 ? player.clears[player.clears.length - 1] : "لا توجد مراحل";
        playerInfoDiv.innerHTML = `
          <h3>📌 معلومات اللاعب</h3>
          <p>Rank: ${player.id}</p>
          <p>Name: ${player.name}</p>
          <p>Points: ${player.value}</p>
          <p>Best Level: ${bestLevel}</p>
        `;
        playerInfoDiv.style.display = "block";
      } else {
        playerInfoDiv.style.display = "none";
      }
    });

  } catch (err) {
    console.error(err);
    alert("⚠️ حدث خطأ أثناء قراءة الملف:\n" + err.message);
  }
}

window.onload = loadExcel;
