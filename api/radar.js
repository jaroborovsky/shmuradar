// File: api/radar.js

export const config = {
  runtime: 'edge',
};

export default async function handler(req) {
  const now = new Date();
  const minutes = Math.floor(now.getMinutes() / 10) * 10;
  now.setMinutes(minutes);
  now.setSeconds(0);
  now.setMilliseconds(0);

  const year = now.getUTCFullYear();
  const month = String(now.getUTCMonth() + 1).padStart(2, '0');
  const day = String(now.getUTCDate()).padStart(2, '0');
  const hour = String(now.getUTCHours()).padStart(2, '0');
  const minute = String(now.getUTCMinutes()).padStart(2, '0');

  const timestamp = `${year}${month}${day}.${hour}${minute}`;
  const imageUrl = `https://www.shmu.sk/data/dataradary/data.cappi2km/cappi.2km.${timestamp}.0.png`;

  const kml = `<?xml version="1.0" encoding="UTF-8"?>
<kml xmlns="http://www.opengis.net/kml/2.2">
  <GroundOverlay>
    <name>Aktuálny radar SHMU</name>
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
