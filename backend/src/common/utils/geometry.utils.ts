export interface GeoJsonPoint {
  type: 'Point';
  coordinates: [number, number] | [number, number, number];
}

export interface GeoJsonPolygon {
  type: 'Polygon';
  coordinates: number[][][];
}

export interface GeoJsonLineString {
  type: 'LineString';
  coordinates: [number, number][] | [number, number, number][];
}

export function geoJsonPointToWKT(geoJson: GeoJsonPoint): string {
  const coords = geoJson.coordinates;
  if (coords.length === 3) {
    return `POINT Z (${coords[0]} ${coords[1]} ${coords[2]})`;
  }
  return `POINT (${coords[0]} ${coords[1]})`;
}

export function geoJsonPolygonToWKT(geoJson: GeoJsonPolygon): string {
  const ring = geoJson.coordinates[0];

  const hasZ = ring[0] && ring[0].length === 3;

  if (hasZ) {
    const coords = ring
      .map((point) => `${point[0]} ${point[1]} ${point[2]}`)
      .join(', ');
    return `POLYGON Z ((${coords}))`;
  }

  const coords = ring.map((point) => `${point[0]} ${point[1]}`).join(', ');
  return `POLYGON ((${coords}))`;
}

export function geoJsonLineStringToWKT(geoJson: GeoJsonLineString): string {
  const coords = geoJson.coordinates;
  const hasZ = coords[0] && coords[0].length === 3;

  if (hasZ) {
    const coordsStr = coords
      .map((point) => `${point[0]} ${point[1]} ${point[2]}`)
      .join(', ');
    return `LINESTRING Z (${coordsStr})`;
  }

  const coordsStr = coords.map((point) => `${point[0]} ${point[1]}`).join(', ');
  return `LINESTRING (${coordsStr})`;
}
