    const mapContainer = document.getElementById('mapContainer');
    const marsMap = document.getElementById('marsMap');
    const marker = document.getElementById('marker');
    const mapWrapper = document.getElementById('mapWrapper');

    let containerWidth = mapContainer.clientWidth;
    let containerHeight = mapContainer.clientHeight;

    let mapWidth = containerWidth;
    let mapHeight = containerHeight;
    let scale = 1;
    const minScale = 1;
    const maxScale = 4;

    let translateX = 0;
    let translateY = 0;
    let isDragging = true;
    let dragStartX = 0;
    let dragStartY = 0;

    marsMap.style.width = `${mapWidth}px`;
    marsMap.style.height = `${mapHeight}px`;

    const marsLatMin = -90;
    const marsLatMax = 90;
    const marsLonMin = -180;
    const marsLonMax = 180;

    function latLonToXY(lat, lon) {
      const x = ((lon - marsLonMin) / (marsLonMax - marsLonMin)) * mapWidth;
      const y = ((marsLatMax - lat) / (marsLatMax - marsLatMin)) * mapHeight;
      return { x, y };
    }

    function updateMarker() {
      const lat = parseFloat(document.getElementById('latitude').value);
      const lon = parseFloat(document.getElementById('longitude').value);

      if (isNaN(lat) || isNaN(lon)) return;

      const { x, y } = latLonToXY(lat, lon);

      marker.style.left = `${x}px`;
      marker.style.top = `${y}px`;
    }

    function goToLocation() {
      const lat = parseFloat(document.getElementById('latitude').value);
      const lon = parseFloat(document.getElementById('longitude').value);

      if (isNaN(lat) || isNaN(lon)) {
        console.error("Invalid latitude or longitude input.");
        return;
      }

      const { x, y } = latLonToXY(lat, lon);

      translateX = containerWidth / (2 * scale) - x;
      translateY = containerHeight / (2 * scale) - y;

      clampTranslation();
      applyTransform();
      updateMarker();
    }

    function toggleFullscreen() {
      mapContainer.classList.toggle('fullscreen');
      containerWidth = mapContainer.clientWidth;
      containerHeight = mapContainer.clientHeight;

      mapWidth = containerWidth;
      mapHeight = containerHeight;

      marsMap.style.width = `${mapWidth}px`;
      marsMap.style.height = `${mapHeight}px`;

      updateCoordinateLines();
      updateMarker();
      clampTranslation();
      applyTransform();
    }

    mapContainer.addEventListener('wheel', function(event) {
      event.preventDefault();
      const delta = Math.sign(event.deltaY);

      if (delta < 0) {
        scale *= 1.02;
      } else {
        scale /= 1.02;
      }

      if (scale < minScale) scale = minScale;
      if (scale > maxScale) scale = maxScale;

      updateCoordinateLines();
      clampTranslation();
      applyTransform();
    });

    mapWrapper.addEventListener('mousedown', (e) => {
      isDragging = true;
      dragStartX = e.clientX;
      dragStartY = e.clientY;
    });

    window.addEventListener('mouseup', () => {
      isDragging = false;
    });

    window.addEventListener('mousemove', (e) => {
      if (!isDragging) return;

      const dx = (e.clientX - dragStartX) / scale;
      const dy = (e.clientY - dragStartY) / scale;

      dragStartX = e.clientX;
      dragStartY = e.clientY;

      translateX += dx;
      translateY += dy;

      clampTranslation();
      applyTransform();
    });

    function clampTranslation() {
      const maxTranslateX = 0;
      const maxTranslateY = 0;
      const minTranslateX = containerWidth / scale - mapWidth;
      const minTranslateY = containerHeight / scale - mapHeight;

      translateX = Math.min(Math.max(translateX, minTranslateX), maxTranslateX);
      translateY = Math.min(Math.max(translateY, minTranslateY), maxTranslateY);
    }

    function applyTransform() {
      mapWrapper.style.transformOrigin = 'top left';
      mapWrapper.style.transform = `scale(${scale}) translate(${translateX}px, ${translateY}px)`;
      const gridLines = document.querySelectorAll('.grid-line');
      const coordinateLabels = document.querySelectorAll('.coordinate-label');
      gridLines.forEach(line => {
        line.style.transform = `scale(${1/scale})`;
      });
      coordinateLabels.forEach(label => {
        label.style.transform = `scale(${1/scale})`;
      });
    }

    function createCoordinateLines() {
      mapWrapper.querySelectorAll('.grid-line, .coordinate-label').forEach(el => el.remove());

      let stepLat = 10;
      let stepLon = 10;

      if (scale >= 2) {
        stepLat = 5;
        stepLon = 5;
      }

      if (scale >= 3.9) {
        stepLat = 2.5;
        stepLon = 2.5;
      }

      for (let lat = marsLatMin; lat <= marsLatMax; lat += stepLat) {
        const y = ((marsLatMax - lat) / (marsLatMax - marsLatMin)) * mapHeight;

        const line = document.createElement('div');
        line.className = 'grid-line';
        line.style.top = `${y}px`;
        line.style.left = '0px';
        line.style.width = `${mapWidth}px`;
        line.style.height = '1px';
        mapWrapper.appendChild(line);

        const label = document.createElement('div');
        label.className = 'coordinate-label';
        label.style.left = '0';
        label.style.top = `${y}px`;
        label.textContent = `${lat}°`;
        mapWrapper.appendChild(label);
      }

      for (let lon = marsLonMin; lon <= marsLonMax; lon += stepLon) {
        const x = ((lon - marsLonMin) / (marsLonMax - marsLonMin)) * mapWidth;

        const line = document.createElement('div');
        line.className = 'grid-line';
        line.style.left = `${x}px`;
        line.style.top = '0px';
        line.style.width = '1px';
        line.style.height = `${mapHeight}px`;
        mapWrapper.appendChild(line);

        const label = document.createElement('div');
        label.className = 'coordinate-label';
        label.style.left = `${x}px`;
        label.style.top = '0';
        label.textContent = `${lon}°`;
        mapWrapper.appendChild(label);
      }
    }

    function updateCoordinateLines() {
      createCoordinateLines();
    }

    createCoordinateLines();
    applyTransform();