import area from '@turf/area';
import { Feature } from 'geojson';

function calculateArea(features: Feature[], decimals: number) {
  let total = 0;
  for (let i = 0; i < features.length; i++) {
    total += area(features[i]);
  }
  return total.toFixed(decimals);
}

export { calculateArea };
