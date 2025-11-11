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
    // عند التشغيل من GitHub Pages، الملف يجب أن يكون في نفس المسار
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

    // قراءة المراحل
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

    // عرض أول 50 لاعب
    const listContainer = document.getElementById('GD-List');
    listContainer.innerHTML = '';

    players.slice(0, 50).forEach(player => {
      const bestLevel = player.clears.length > 0 ? player.clears[player.clears.length - 1] : "لا توجد مراحل";
      const playerDiv = document.createElement('div');
      playerDiv.className = 'player-item';
      playerDiv.innerHTML = `
        <div><span>Place:</span> ${player.id}</div>
        <div><span>Player name:</span> ${player.name}</div>
        <div><span>Points:</span> ${player.value}</div>
        <div><span>Best Level:</span> ${bestLevel}</div>
      `;
      listContainer.appendChild(playerDiv);
    });

  } catch (err) {
    console.error(err);
    alert("⚠️ حدث خطأ أثناء قراءة الملف:\n" + err.message);
  }
}

window.onload = loadExcel;
