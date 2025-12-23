export function geoJsonToPostGIS(geoJson: {
  type: string;
  coordinates: number[][][];
}): string {
  const coords = geoJson.coordinates[0]
    .map((point) => `${point[0]} ${point[1]}`)
    .join(',');
  return `SRID=4326;POLYGON((${coords}))`;
}
