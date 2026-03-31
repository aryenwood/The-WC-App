---
name: mapbox-maps
description: "Interactive maps using Mapbox GL JS - rep tracking, territory heatmaps, door pins, geofencing, and the WC App super admin cross-org view."
---

# Mapbox Maps Skill

## Setup

### CDN Links

```html
<script src="https://api.mapbox.com/mapbox-gl-js/v3.3.0/mapbox-gl.js"></script>
<link href="https://api.mapbox.com/mapbox-gl-js/v3.3.0/mapbox-gl.css" rel="stylesheet" />
```

### Access Token

```js
mapboxgl.accessToken = 'pk.YOUR_MAPBOX_TOKEN';
```

Store the token in your app config or environment. For the WC App, it is embedded in index.html or passed via a config object.

## Base Map Initialization

```js
const map = new mapboxgl.Map({
  container: 'map',           // DOM element ID
  style: 'mapbox://styles/mapbox/dark-v11',  // Dark theme matches WC App
  center: [-97.7431, 30.2672], // Default: Austin, TX [lng, lat]
  zoom: 12,
  attributionControl: false
});

// Add navigation controls
map.addControl(new mapboxgl.NavigationControl(), 'top-right');

// Add geolocate control
const geolocate = new mapboxgl.GeolocateControl({
  positionOptions: { enableHighAccuracy: true },
  trackUserLocation: true,
  showUserHeading: true
});
map.addControl(geolocate);
```

## Door Pin Clusters

Use GeoJSON source with clustering for performance when displaying many door pins:

```js
map.on('load', () => {
  // Add door data as GeoJSON source
  map.addSource('doors', {
    type: 'geojson',
    data: {
      type: 'FeatureCollection',
      features: doors.map(d => ({
        type: 'Feature',
        geometry: { type: 'Point', coordinates: [d.lng, d.lat] },
        properties: {
          id: d.id,
          status: d.status,
          address: d.address,
          repName: d.repName
        }
      }))
    },
    cluster: true,
    clusterMaxZoom: 14,
    clusterRadius: 50
  });

  // Cluster circles
  map.addLayer({
    id: 'door-clusters',
    type: 'circle',
    source: 'doors',
    filter: ['has', 'point_count'],
    paint: {
      'circle-color': [
        'step', ['get', 'point_count'],
        '#58c0d0', 10,   // Teal for < 10
        '#2a7a8a', 30,   // Dark teal for < 30
        '#148f98'         // Primary for 30+
      ],
      'circle-radius': [
        'step', ['get', 'point_count'],
        20, 10,
        30, 30,
        40
      ]
    }
  });

  // Cluster count labels
  map.addLayer({
    id: 'cluster-count',
    type: 'symbol',
    source: 'doors',
    filter: ['has', 'point_count'],
    layout: {
      'text-field': ['get', 'point_count_abbreviated'],
      'text-font': ['DIN Pro Medium', 'Arial Unicode MS Bold'],
      'text-size': 14
    },
    paint: { 'text-color': '#ffffff' }
  });

  // Individual door pins (unclustered)
  map.addLayer({
    id: 'door-pins',
    type: 'circle',
    source: 'doors',
    filter: ['!', ['has', 'point_count']],
    paint: {
      'circle-color': [
        'match', ['get', 'status'],
        'closed', '#22c55e',
        'scheduled', '#FFD700',
        'pitched', '#58c0d0',
        'not_interested', '#ef4444',
        'not_home', '#94a3b8',
        '#58c0d0' // default
      ],
      'circle-radius': 8,
      'circle-stroke-width': 2,
      'circle-stroke-color': '#ffffff'
    }
  });
});
```

## Live Rep Tracking

Update rep positions in real-time using Firestore listeners:

```js
// Rep location marker
const repMarkers = {};

function updateRepLocation(repId, lng, lat, name) {
  if (repMarkers[repId]) {
    repMarkers[repId].setLngLat([lng, lat]);
  } else {
    const el = document.createElement('div');
    el.className = 'rep-marker';
    el.innerHTML = `<div class="rep-dot"></div><span class="rep-label">${name}</span>`;
    repMarkers[repId] = new mapboxgl.Marker(el)
      .setLngLat([lng, lat])
      .addTo(map);
  }
}

// CSS for rep markers
const repMarkerCSS = `
.rep-marker { display:flex; flex-direction:column; align-items:center; }
.rep-dot { width:16px; height:16px; background:#58c0d0; border:3px solid #fff; border-radius:50%;
           box-shadow:0 0 8px rgba(88,192,208,0.6); animation: pulse 2s infinite; }
.rep-label { font:600 11px/1 Inter,sans-serif; color:#fff; background:rgba(0,0,0,0.7);
             padding:2px 6px; border-radius:4px; margin-top:4px; white-space:nowrap; }
@keyframes pulse { 0%,100% { transform:scale(1); } 50% { transform:scale(1.3); } }
`;
```

## Heatmap Layer

Visualize door density or sales performance as a heatmap:

```js
map.addLayer({
  id: 'door-heatmap',
  type: 'heatmap',
  source: 'doors',
  maxzoom: 15,
  paint: {
    'heatmap-weight': [
      'match', ['get', 'status'],
      'closed', 3,
      'scheduled', 2,
      'pitched', 1,
      0.5
    ],
    'heatmap-intensity': ['interpolate', ['linear'], ['zoom'], 0, 1, 15, 3],
    'heatmap-color': [
      'interpolate', ['linear'], ['heatmap-density'],
      0, 'rgba(0,0,0,0)',
      0.2, 'rgba(88,192,208,0.3)',
      0.4, 'rgba(88,192,208,0.5)',
      0.6, 'rgba(42,122,138,0.7)',
      0.8, 'rgba(20,143,152,0.9)',
      1, 'rgba(255,215,0,1)'
    ],
    'heatmap-radius': ['interpolate', ['linear'], ['zoom'], 0, 2, 15, 20],
    'heatmap-opacity': ['interpolate', ['linear'], ['zoom'], 13, 1, 15, 0]
  }
}, 'door-pins');
```

## Geolocation Capture

Capture rep location when logging a door:

```js
async function captureLocation() {
  return new Promise((resolve, reject) => {
    if (!navigator.geolocation) {
      reject(new Error('Geolocation not supported'));
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (pos) => resolve({ lat: pos.coords.latitude, lng: pos.coords.longitude }),
      (err) => reject(err),
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 30000 }
    );
  });
}

// Usage when logging a door
async function logDoor(address, status, notes) {
  const { lat, lng } = await captureLocation();
  await addDoor(orgId, { address, status, notes, lat, lng, repId, repName });
}
```

## Manual Map Pin (Drop Pin)

Allow users to drop a pin by tapping the map:

```js
let tempMarker = null;

map.on('click', (e) => {
  const { lng, lat } = e.lngLat;

  if (tempMarker) tempMarker.remove();

  tempMarker = new mapboxgl.Marker({ color: '#FFD700', draggable: true })
    .setLngLat([lng, lat])
    .addTo(map);

  // Show popup with address lookup
  reverseGeocode(lng, lat).then(address => {
    new mapboxgl.Popup({ offset: 25 })
      .setLngLat([lng, lat])
      .setHTML(`<strong>${address}</strong><br><button onclick="logDoorAt(${lat},${lng},'${address}')">Log Door</button>`)
      .addTo(map);
  });
});

async function reverseGeocode(lng, lat) {
  const res = await fetch(`https://api.mapbox.com/geocoding/v5/mapbox.places/${lng},${lat}.json?access_token=${mapboxgl.accessToken}`);
  const data = await res.json();
  return data.features[0]?.place_name || `${lat.toFixed(5)}, ${lng.toFixed(5)}`;
}
```

## Popup on Door Click

```js
map.on('click', 'door-pins', (e) => {
  const props = e.features[0].properties;
  const coords = e.features[0].geometry.coordinates.slice();

  const statusColors = {
    closed: '#22c55e', scheduled: '#FFD700', pitched: '#58c0d0',
    not_interested: '#ef4444', not_home: '#94a3b8'
  };

  new mapboxgl.Popup({ offset: 15, className: 'wc-popup' })
    .setLngLat(coords)
    .setHTML(`
      <div style="font-family:Inter,sans-serif;padding:4px;">
        <strong>${props.address}</strong><br>
        <span style="color:${statusColors[props.status] || '#58c0d0'}">${props.status.replace('_',' ')}</span><br>
        <small>Rep: ${props.repName}</small>
      </div>
    `)
    .addTo(map);
});

// Pointer cursor on hover
map.on('mouseenter', 'door-pins', () => map.getCanvas().style.cursor = 'pointer');
map.on('mouseleave', 'door-pins', () => map.getCanvas().style.cursor = '');
```

## Leaflet Fallback

The WC App uses Leaflet as primary map library (already loaded in index.html). Use Leaflet when Mapbox token is unavailable or for simpler use cases:

```html
<!-- Already in WC App index.html -->
<link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css" />
<script src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js"></script>
<link rel="stylesheet" href="https://unpkg.com/leaflet.markercluster@1.5.3/dist/MarkerCluster.css" />
<script src="https://unpkg.com/leaflet.markercluster@1.5.3/dist/leaflet.markercluster.js"></script>
```

```js
const map = L.map('map-container').setView([30.2672, -97.7431], 12);

L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
  attribution: '&copy; OpenStreetMap'
}).addTo(map);

// Marker cluster group
const markers = L.markerClusterGroup();

doors.forEach(d => {
  const marker = L.marker([d.lat, d.lng])
    .bindPopup(`<strong>${d.address}</strong><br>${d.status}`);
  markers.addLayer(marker);
});

map.addLayer(markers);
```

## WC Map CSS

```css
#map-container {
  width: 100%;
  height: 100%;
  border-radius: 12px;
  overflow: hidden;
}

.wc-popup .mapboxgl-popup-content {
  background: rgba(0,0,0,0.85);
  color: #fff;
  border-radius: 8px;
  padding: 8px 12px;
  font-size: 13px;
  backdrop-filter: blur(8px);
  border: 1px solid rgba(88,192,208,0.3);
}

.wc-popup .mapboxgl-popup-tip {
  border-top-color: rgba(0,0,0,0.85);
}

.leaflet-container {
  font-family: Inter, sans-serif;
  background: #1a1a2e;
}
```

## Performance Guidelines

- Use clustering for > 50 pins — both Mapbox and Leaflet MarkerCluster
- Debounce map move events (250ms) before querying Firestore for visible bounds
- Set `maxzoom` on heatmap layers to transition to pin view at close zoom
- On mobile, disable `map.dragRotate` and `map.touchZoomRotate.disableRotation()` for simpler UX
- Invalidate map size after container resize: `map.invalidateSize()` (Leaflet) or `map.resize()` (Mapbox)
