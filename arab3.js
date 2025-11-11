function formatPoints(val) {
  if (val == null || val === "") return "";
  let num = parseFloat(val);
  if (isNaN(num)) return val;
  num = Math.floor(num * 1000) / 1000;
  if (num % 1 === 0) return num.toFixed(2);
  return num.toString();
}

let levels = [];

async function loadExcel() {
  try {
    // تحميل الملف من نفس المجلد - لاحظ الترميز للمسافة
    const response = await fetch('./Arab%20Demon%20List.xlsx');
    if (!response.ok) throw new Error("لم يتم العثور على الملف أو فشل التحميل.");

    const arrayBuffer = await response.arrayBuffer();
    const workbook = XLSX.read(arrayBuffer, { type: 'array' });
    const sheet = workbook.Sheets[workbook.SheetNames[0]];
    const data = XLSX.utils.sheet_to_json(sheet, { header: 1 });

    if (!data || data.length < 4) throw new Error("الملف فارغ أو لا يحتوي على البيانات المتوقعة.");

    // قراءة المراحل من B4 إلى D153
    levels = [];
    for (let r = 3; r < Math.min(data.length, 153); r++) {
      const rank = data[r]?.[1];  // B4 = index 1
      const points = formatPoints(data[r]?.[2]); // C4 = index 2
      const name = data[r]?.[3]; // D4 = index 3

      if (!name) continue;

      levels.push({
        rank: rank || r - 2,
        points: points || "0",
        name: name
      });
    }

    // عرض المراحل
    const listContainer = document.getElementById('GDA-List');
    listContainer.innerHTML = '';

    levels.forEach(level => {
      const levelDiv = document.createElement('div');
      levelDiv.className = 'player-item';
      levelDiv.innerHTML = `
        <div><span>Level Rank:</span> ${level.rank}</div>
        <div><span>Level Points:</span> ${level.points}</div>
        <div><span>Level Name:</span> ${level.name}</div>
      `;
      listContainer.appendChild(levelDiv);
    });

  } catch (err) {
    console.error(err);
    alert("⚠️ حدث خطأ أثناء قراءة الملف:\n" + err.message);
  }
}

window.onload = loadExcel;
