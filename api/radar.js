// File: api/radar.js

export const config = {
  runtime: 'edge',
};

// Pomocná funkcia na zistenie, či existuje obrázok
async function checkImageExists(url) {
  //const res = await fetch(url, { method: 'HEAD', redirect: 'manual' });
  //return res.status === 200;
  try {
    const res = await fetch(url, { method: 'GET', redirect: 'manual' });
    return res.status === 200;
  } catch {
    return false;
  }
}

function getRoundedTimeOffset(offsetMinutes = 0) {
  const date = new Date();
  date.setMinutes(Math.floor(date.getMinutes() / 5) * 5); // zmena na 5-minútové intervaly
  date.setMinutes(date.getMinutes() - offsetMinutes);
  date.setSeconds(0);
  date.setMilliseconds(0);
  return date;
}

function formatTimestamp(date) {
  const year = date.getUTCFullYear();
  const month = String(date.getUTCMonth() + 1).padStart(2, '0');
  const day = String(date.getUTCDate()).padStart(2, '0');
  const hour = String(date.getUTCHours()).padStart(2, '0');
  const minute = String(date.getUTCMinutes()).padStart(2, '0');
  return `${year}${month}${day}.${hour}${minute}`;
}

export default async function handler(req) {
  const maxTries = 12; // Skúsi 0 až 55 minút dozadu po 5 minút
  let imageUrl = null;
  let timestamp = null;

  for (let i = 0; i < maxTries; i++) {
    const date = getRoundedTimeOffset(i * 5);
    const ts = formatTimestamp(date);
    const url = `https://www.shmu.sk/data/dataradary/data.cappi2km/cappi.2km.${ts}.0.png`;
    const exists = await checkImageExists(url);
    if (exists) {
      imageUrl = url;
      timestamp = ts;
      break;
    }
  }

  if (!imageUrl) {
    return new Response('Radarový obrázok nebol nájdený.', { status: 404 });
  }

  const kml = `<?xml version="1.0" encoding="UTF-8"?>
<kml xmlns="http://www.opengis.net/kml/2.2">
  <GroundOverlay>
    <name>Aktuálny radar SHMU (${timestamp})</name>
    <Icon>
      <href>${imageUrl}</href>
    </Icon>
    <LatLonBox>
      <north>50.7</north>
      <south>46.05</south>
      <east>23.79</east>
      <west>13.6</west>
    </LatLonBox>
  </GroundOverlay>
</kml>`;

  return new Response(kml, {
    status: 200,
    headers: {
      'Content-Type': 'application/vnd.google-earth.kml+xml'
    }
  });
}
