//  Fetch accurate planet positions from backend (JPL Horizons API)
async function fetchPlanetPositions(dateStr) {
  try {
    const res = await fetch(`http://localhost:8000/api/planet-positions?date=${dateStr}`);
    return await res.json();
  } catch (error) {
    console.error('Failed to fetch planet positions:', error);
    return null;
  }
}

// Fetch Earth-Mars opposition data from SEDS (Optional for further enhancements)
async function fetchOppositionData() {
  try {
    const res = await fetch('https://spider.seds.org/spider/Mars/marsopps.html');
    const text = await res.text();
    // Example parser
    const parser = new DOMParser();
    const doc = parser.parseFromString(text, 'text/html');
    const preTags = doc.querySelectorAll('pre');
    let oppositionText = '';
    preTags.forEach(pre => {
      if (pre.textContent.includes('Opposition')) {
        oppositionText = pre.textContent;
      }
    });
    console.log(oppositionText);
  } catch (error) {
    console.error('Failed to fetch opposition data:', error);
  }
}

  // Utility functions for Kepler's true anomaly calculation
function solveKepler(meanAnomaly, eccentricity, tolerance = 1e-6) {
  let E = meanAnomaly;
  let delta = 1;
  while (Math.abs(delta) > tolerance) {
    delta = (E - eccentricity * Math.sin(E) - meanAnomaly) / (1 - eccentricity * Math.cos(E));
    E -= delta;
  }
  return E;
}

function trueAnomaly(meanAnomaly, eccentricity) {
  const E = solveKepler(meanAnomaly, eccentricity);
  const ta = 2 * Math.atan2(Math.sqrt(1 + eccentricity) * Math.sin(E / 2), Math.sqrt(1 - eccentricity) * Math.cos(E / 2));
  return ta;
}
  
  const canvas = document.getElementById('orbitCanvas');
  const ctx = canvas.getContext('2d');

  let width, height, centerX, centerY;
  function resizeCanvas() {
    width = window.innerWidth;
    height = window.innerHeight;
    canvas.width = width;
    canvas.height = height;
    centerX = width / 2;
    centerY = height / 2;
  }
  window.addEventListener('resize', resizeCanvas);
  resizeCanvas();

  const earthOrbit = { semiMajorAxis: 1.0, eccentricity: 0.0167 };
  const marsOrbit = { semiMajorAxis: 1.5237, eccentricity: 0.0934 };

  let AU = 200;

// Colors
  const earthColor = '#00BFFF';
  const marsColor = '#FF4500';
  
// Radii
  const sunRadius = 18;
  const earthRadius = 6.3;
  const marsRadius = earthRadius*0.53;

  let time = 0;
  let speed = 1;
  let isPlaying = true;
  let isRealTime = false;
  let lastFrameTime = Date.now();

  const earthOrbitalPeriod = 365.256;
  const marsOrbitalPeriod = 686.980;

  const referenceDate = new Date('1971-08-10T00:00:00Z');
  const martianMonths = [28,28,28,28,28,28,28,27,28,28,28,28,28,28,28,27,28,28,28,28,28,28,28,27];
  const totalMartianSolsPerYear = martianMonths.reduce((a, b) => a + b, 0);

// Traces for orbit paths
  const earthTrace = [];
  const marsTrace = [];

  function solveKepler(M, e, tol = 1e-6) {
    let E = M;
    let delta = 1;
    while (Math.abs(delta) > tol) {
      delta = (E - e * Math.sin(E) - M) / (1 - e * Math.cos(E));
      E -= delta;
    }
    return E;
  }

  function trueAnomaly(M, e) {
    const E = solveKepler(M, e);
    return 2 * Math.atan2(Math.sqrt(1 + e) * Math.sin(E / 2), Math.sqrt(1 - e) * Math.cos(E / 2));
  }

  function drawOrbit(orbit, color) {
    const a = orbit.semiMajorAxis * AU;
    const b = a * Math.sqrt(1 - orbit.eccentricity ** 2);
    ctx.beginPath();
    ctx.strokeStyle = color;
    ctx.lineWidth = 1;
    ctx.ellipse(centerX - orbit.eccentricity * a, centerY, a, b, 0, 0, 2 * Math.PI);
    ctx.stroke();
  }

  function drawTrace(trace, color) {
    ctx.beginPath();
    ctx.strokeStyle = color;
    ctx.lineWidth = 0.5;
    for (let i = 0; i < trace.length - 1; i++) {
      ctx.moveTo(trace[i].x, trace[i].y);
      ctx.lineTo(trace[i + 1].x, trace[i + 1].y);
    }
    ctx.stroke();
  }

  function calculateVelocity(semiMajorAxisAU, rAU) {
    const AU_in_km = 149597870.7;
    const GM_km = 1.32712440018e11;
    const a_km = semiMajorAxisAU * AU_in_km;
    const r_km = rAU * AU_in_km;
    return Math.sqrt(GM_km * (2 / r_km - 1 / a_km));
  }

  function drawPlanet(orbit, period, days, radius, color, trace, velocityElementId) {
    const M = (2 * Math.PI / period) * days;
    const ta = trueAnomaly(M, orbit.eccentricity);

    const a = orbit.semiMajorAxis;
    const rAU = a * (1 - orbit.eccentricity ** 2) / (1 + orbit.eccentricity * Math.cos(ta));
    const r = rAU * AU;
    const x = centerX + r * Math.cos(ta);
    const y = centerY + r * Math.sin(ta);

    const velocity = calculateVelocity(a, rAU);
    document.getElementById(velocityElementId).textContent = velocity.toFixed(2) + ' km/s';

    trace.push({ x, y });
    if (trace.length > 500) trace.shift();

    ctx.beginPath();
    ctx.fillStyle = color;
    ctx.arc(x, y, radius, 0, 2 * Math.PI);
    ctx.fill();
    return { x, y };
  }

  function drawDistanceLine(x1, y1, x2, y2) {
    const dx = x2 - x1;
    const dy = y2 - y1;
    const distance = Math.sqrt(dx * dx + dy * dy);
    ctx.beginPath();
    ctx.strokeStyle = '#FEFEFE';
    ctx.setLineDash([5, 5]);
    ctx.moveTo(x1, y1);
    ctx.lineTo(x2, y2);
    ctx.stroke();
    ctx.setLineDash([]);
    ctx.fillStyle = 'white';
    ctx.font = '12px Butler';
    ctx.fillText(`${(distance / AU).toFixed(2)} AU`, (x1 + x2) / 2 + 10, (y1 + y2) / 2);
  }

  function updateDateDisplays() {
    const earthDaysElapsed = time;
    const earthDate = new Date(referenceDate.getTime());
    const marsDaysElapsed = earthDaysElapsed + 114;
    earthDate.setUTCDate(earthDate.getUTCDate() + earthDaysElapsed);
    document.getElementById('dateDisplay').textContent = earthDate.toUTCString().slice(5, 16);

    const marsSolsElapsed = earthDaysElapsed / 1.0274912517;
    const marsYear = Math.floor(marsSolsElapsed / totalMartianSolsPerYear) + 1;
    let sol = Math.floor(marsSolsElapsed % totalMartianSolsPerYear);

    let month = 1;
    let solOfMonth = sol;
    for (let i = 0; i < martianMonths.length; i++) {
      if (solOfMonth < martianMonths[i]) {
        month = i + 1;
        break;
      } else {
        solOfMonth -= martianMonths[i];
      }
    }
    document.getElementById('marsDateDisplay').textContent = `${(solOfMonth + 1).toString().padStart(2, '0')}/${month.toString().padStart(2, '0')}/${marsYear.toString().padStart(2, '0')}`;
  }

  function animate() {
    ctx.clearRect(0, 0, width, height);
    ctx.beginPath();
    ctx.fillStyle = 'yellow';
    ctx.arc(centerX, centerY, sunRadius, 0, 2 * Math.PI);
    ctx.fill();

    drawOrbit(earthOrbit, '#3333FF');
    drawOrbit(marsOrbit, '#AA0000');
    drawTrace(earthTrace, '#3333FF');
    drawTrace(marsTrace, '#AA0000');

    const earth = drawPlanet(earthOrbit, earthOrbitalPeriod, time, earthRadius, earthColor, earthTrace, 'earthVelocityDisplay');
    const mars = drawPlanet(marsOrbit, marsOrbitalPeriod, time, marsRadius, marsColor, marsTrace, 'marsVelocityDisplay');

    drawDistanceLine(earth.x, earth.y, mars.x, mars.y);

    const now = Date.now();
    const delta = (now - lastFrameTime) / 1000;
    lastFrameTime = now;

    if (isPlaying) {
      time += isRealTime ? delta / (3600 / 1) : delta * Math.min(Math.max(speed, 1), 100);
    }

    updateDateDisplays();
    document.getElementById('speedDisplay').textContent = isRealTime ? 'Real-Time' : `${speed.toFixed(1)}x`;

    requestAnimationFrame(animate);
  }

  function togglePlay() { isPlaying = !isPlaying; document.querySelector('#controls button:nth-child(1)').textContent = isPlaying ? 'Pause' : 'Play'; }
  function slowMotion() { isRealTime = false; speed = Math.max(1, speed / 2); }
  function fastForward() { isRealTime = false; speed = Math.min(100, speed * 2); }
  function zoomIn() { AU *= 1.020; }
  function zoomOut() { AU /= 1.020; }
  function goToEarthDate() {
    const input = document.getElementById('earthDateInput').value;
    if (!input) return;
    const target = new Date(input);
    time = Math.floor((target - referenceDate) / (1000 * 60 * 60 * 24));
  }
  function toggleRealTime() { isRealTime = !isRealTime; }
  function goToRemyanCalendar() { window.location.href = 'RemyanCalendar.html'; }

  canvas.addEventListener('wheel', function(e) {
    e.preventDefault();
    if (e.deltaY < 0) zoomIn(); else zoomOut();
  });

  animate();

// Initial distance fetch for current time
updateDistanceForDate(new Date(referenceDate.getTime() + time * 86400000).toISOString().slice(0, 10));
