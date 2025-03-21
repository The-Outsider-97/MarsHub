const sites = {
  gale: {
    coordinates: '5.4°S 137.8°E'
  },
  olympus: {
    coordinates: '18°N 226°E'
  },
  mars3: {
    coordinates: '45°S 202°E'
  },
  jezero: {
    coordinates: '18.38°N 77.58°E'
  },
  valles: {
    coordinates: '14°S 323°E'
  }
};

document.getElementById('siteSelect').addEventListener('change', (event) => {
  const selectedSite = event.target.value;
  updateSidebar(sites[selectedSite]);
});

async function fetchSkyLiveData() {
  try {
    const res = await fetch('https://api.allorigins.win/get?url=' + encodeURIComponent('https://theskylive.com/mars-info'));
    const data = await res.json();
    const html = data.contents;

    const parser = new DOMParser();
    const doc = parser.parseFromString(html, 'text/html');

    const declination = doc.querySelector('table tr:contains("Declination") td').innerText.trim();
    const hourAngle = doc.querySelector('table tr:contains("Hour Angle") td').innerText.trim();
    const siderealTime = doc.querySelector('table tr:contains("Sidereal Time") td').innerText.trim();
    const distanceEarthStr = doc.querySelector('table tr:contains("Distance from Earth") td').innerText.trim();

    const distanceEarthKm = parseFloat(distanceEarthStr.replace(/,/g, '').replace(/ km/, ''));

    const AU_IN_KM = 149597870.7;
    const earthEccentricity = 0.0167;
    const meanAnomaly = getMeanAnomaly();
    const sunEarthDistanceAU = (1 - earthEccentricity * earthEccentricity) / (1 + earthEccentricity * Math.cos(meanAnomaly));
    const sunEarthDistanceKm = sunEarthDistanceAU * AU_IN_KM;

    const speedOfLightKmPerSec = 299792.458;

    const distanceSunKm = sunEarthDistanceKm + distanceEarthKm;
    const lightTravelTimeMinutes = (distanceEarthKm / speedOfLightKmPerSec) / 60;

    document.getElementById('declination').innerText = declination;
    document.getElementById('hourAngle').innerText = hourAngle;
    document.getElementById('siderealTime').innerText = siderealTime;
    document.getElementById('distanceEarth').innerText = `${distanceEarthKm.toLocaleString()} km`;
    document.getElementById('distanceSun').innerText = `${distanceSunKm.toLocaleString()} km`;
    document.getElementById('lightTime').innerText = `${lightTravelTimeMinutes.toFixed(2)} min`;

  } catch (error) {
    console.error('Failed to fetch live data:', error);
  }
}

function getMeanAnomaly() {
  const daysSincePerihelion = (Date.now() - new Date('2024-01-04').getTime()) / (1000 * 60 * 60 * 24);
  const meanMotion = 360 / 365.256;
  return (daysSincePerihelion * meanMotion * Math.PI) / 180;
}

function updateSidebar(siteData) {
  document.getElementById('coordinates').innerText = siteData.coordinates;
  document.getElementById('martianTime').innerText = getMartianTime();

  const latitude = parseFloat(siteData.coordinates.split('°')[0]);
  const Ls = getSolarLongitude();
  const sunTimes = marsSunriseSunset(latitude, Ls);

  document.getElementById('riseTime').innerText = `${sunTimes.LTST_sunrise.toFixed(2)} LTST`;
  document.getElementById('setTime').innerText = `${sunTimes.LTST_sunset.toFixed(2)} LTST`;

  fetchSkyLiveData();
}

function getMartianTime() {
  const now = new Date();
  const msSinceEpoch = now.getTime();
  const solInMs = 88775.244 * 1000;
  const marsEpoch = new Date('1971-12-02T00:00:00Z').getTime();

  const elapsedSols = (msSinceEpoch - marsEpoch) / solInMs;
  const solFraction = elapsedSols % 1;
  const totalSeconds = solFraction * 88775.244;

  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = Math.floor(totalSeconds % 60);

  return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
}

function getSolarLongitude() {
  const daysSincePerihelion = (Date.now() - new Date('2022-12-26').getTime()) / (1000 * 60 * 60 * 24);
  const Ls = (daysSincePerihelion % 687) * (360 / 687);
  return Ls;
}

function toRadians(degrees) {
  return degrees * Math.PI / 180;
}

function toDegrees(radians) {
  return radians * 180 / Math.PI;
}

function solarDeclination(Ls) {
  const obliquity = toRadians(25.19);
  const LsRad = toRadians(Ls);
  const deltaRad = Math.asin(Math.sin(obliquity) * Math.sin(LsRad));
  return toDegrees(deltaRad);
}

function hourAngle(phi, delta) {
  const phiRad = toRadians(phi);
  const deltaRad = toRadians(delta);
  const cosH0 = -Math.tan(phiRad) * Math.tan(deltaRad);
  if (cosH0 >= 1) return 0;
  if (cosH0 <= -1) return 180;
  return toDegrees(Math.acos(cosH0));
}

function LTSTSunriseSunset(H0) {
  const sunrise = 12 - (H0 * 24 / 360);
  const sunset = 12 + (H0 * 24 / 360);
  return { sunrise, sunset };
}

function marsSunriseSunset(phi, Ls) {
  const delta = solarDeclination(Ls);
  const H0 = hourAngle(phi, delta);
  const times = LTSTSunriseSunset(H0);
  return {
    latitude: phi,
    solarLongitude: Ls,
    solarDeclination: delta,
    hourAngle: H0,
    LTST_sunrise: times.sunrise,
    LTST_sunset: times.sunset
  };
}

function showMap() {
  alert('Show map feature coming soon!');
}

fetchSkyLiveData();
