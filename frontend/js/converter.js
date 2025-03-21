    //CONVERTER
const referenceDate = new Date('1971-11-12T00:00:00Z');
const martianMonths = [28,28,28,28,28,28,28,27,28,28,28,28,28,28,28,27,28,28,28,28,28,28,28,27];

function setEarthDate(dateStr) {
  document.getElementById('earthDate').value = dateStr;
  document.getElementById('earthTime').value = '00:00'; // Default to midnight
  convertEarthToRemyan(); // Optionally auto-convert
}

function getMartianYearDays(year) {
  let months = [...martianMonths];

  // Every 5th year month 12 loses 1 sol
  if (year % 5 === 0) months[11] -= 1;

  // Every 50th year month 23 loses 1 sol
  if (year % 50 === 0) months[22] -= 1;

  return months;
}

function totalSolsUntilYear(year) {
  let sols = 0;
  for (let y = 1; y < year; y++) {
    sols += getMartianYearDays(y).reduce((a, b) => a + b, 0);
  }
  return sols;
}

function convertEarthToRemyan() {
  const earthDateStr = document.getElementById('earthDate').value;
  const earthTimeStr = document.getElementById('earthTime').value || "00:00:00";

  if (!earthDateStr || !earthTimeStr) {
    alert('Please enter a valid Earth date and time!');
    return;
  }

  const earthDate = new Date(`${earthDateStr}T${earthTimeStr}Z`);
  const solDiffFloat = (earthDate - referenceDate) / (1000 * 60 * 60 * 24); // days with fraction
  const solDiff = Math.floor(solDiffFloat);
  const solTimeFraction = solDiffFloat - solDiff;

  if (solDiff < 0) {
    document.getElementById('remyanResult').textContent = 'Date is before Sol 1, Year 1';
    return;
  }

  let remainingSols = solDiff;
  let year = 1;

  while (true) {
    const yearDays = getMartianYearDays(year).reduce((a, b) => a + b, 0);
    if (remainingSols < yearDays) break;
    remainingSols -= yearDays;
    year++;
  }

  const months = getMartianYearDays(year);
  let month = 1;
  let sol = remainingSols + 1;

  for (let i = 0; i < months.length; i++) {
    if (sol > months[i]) {
      sol -= months[i];
      month++;
    } else {
      break;
    }
  }

  // Convert time fraction to Remyan time (1 sol ~ 24h 39m 35.244s)
  const solSeconds = solTimeFraction * 88775.244; // 1 sol = 88775.244 Earth seconds
  const hours = Math.floor(solSeconds / 3600);
  const minutes = Math.floor((solSeconds % 3600) / 60);
  const seconds = Math.floor(solSeconds % 60);

  const remyanTime = `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;

  document.getElementById('remyanResult').textContent = `Remyan Date: ${sol.toString().padStart(2, '0')}/${month.toString().padStart(2, '0')}/${year.toString().padStart(2, '0')} ${remyanTime}`;
}

function convertRemyanToEarth() {
  const sol = parseInt(document.getElementById('remyanSol').value, 10);
  const month = parseInt(document.getElementById('remyanMonth').value, 10);
  const year = parseInt(document.getElementById('remyanYear').value, 10);
  const remyanTimeStr = document.getElementById('remyanTime').value || "00:00:00";

  if (!sol || !month || !year) return alert('Fill all Remyan date fields!');

  const months = getMartianYearDays(year);
  if (month < 1 || month > 24) return alert('Invalid month (1-24)');
  if (sol < 1 || sol > months[month - 1]) return alert(`Invalid sol for month ${month}`);

  const solsBeforeYear = totalSolsUntilYear(year);
  const solsBeforeMonth = months.slice(0, month - 1).reduce((a, b) => a + b, 0);
  const totalSols = solsBeforeYear + solsBeforeMonth + (sol - 1);

  const timeParts = remyanTimeStr.split(":").map(Number);
  const totalSeconds = (timeParts[0] || 0) * 3600 + (timeParts[1] || 0) * 60 + (timeParts[2] || 0);
  const solFraction = totalSeconds / 88775.244;

  const earthDate = new Date(referenceDate.getTime() + (totalSols + solFraction) * 86400000);

  document.getElementById('earthResult').textContent = `Earth Date: ${earthDate.toISOString().replace('T', ' ').slice(0, 19)} UTC`;
}
