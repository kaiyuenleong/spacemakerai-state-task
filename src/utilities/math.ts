import area from '@turf/area';

/**
 * Calculates the area from an array of features
 * @param {GeoJSON.Feature[]} features - an array of features
 * @param {number} decimals - the number of decimal places to return 
 * @returns {string} representation of the calculated area
 */
function calculateArea(features: GeoJSON.Feature[], decimals: number): string {
  let total = 0;
  for (let i = 0; i < features.length; i++) {
    total += area(features[i]);
  }
  return total.toFixed(decimals);
}

export { calculateArea };
