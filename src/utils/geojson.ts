import intersect from '@turf/intersect';
import union from '@turf/union';
import { v4 as uuidv4 } from 'uuid';

/**
 * Creates and returns an intersection of two features
 * @param {GeoJSON.Feature[]} features - an array of features to intersect
 * @returns {(GeoJSON.Feature|null)} a new feature created from intersecting input features
 */
function intersectFeatures(features: GeoJSON.Feature[]): GeoJSON.Feature | null {
  let intersectedFeature = intersect(features[0].geometry as GeoJSON.Polygon, features[1].geometry as GeoJSON.Polygon);
  if (intersectedFeature) {
    prepareFeature(intersectedFeature, false);
    return intersectedFeature;
  }
  return null;
}

/**
 * Creates and returns an union of two features
 * @param {GeoJSON.Feature[]} features - an array of features to unite
 * @returns {(GeoJSON.Feature|null)} a new feature created from uniting input features
 */
function unionFeatures(features: GeoJSON.Feature[]): GeoJSON.Feature | null {
  let unitedFeature = union(features[0].geometry as GeoJSON.Polygon, features[1].geometry as GeoJSON.Polygon);
  if (unitedFeature) {
    prepareFeature(unitedFeature, false);
    return unitedFeature;
  }
  return null;
}

/**
 * Prepares a feature to be consumed by the workspace by adding
 * a unique identifier and an entry to the feature's properties
 * setting whether the feature is selected in the workspace
 * @param {GeoJSON.Feature} feature - a feature that needs an id assigned
 * @param {boolean} selected - a flag to set whether the feature should be selected
 */
function prepareFeature(feature: GeoJSON.Feature, selected: boolean): void {
  feature.id = uuidv4();
  feature.properties ? feature.properties['selected'] = selected : feature.properties = { selected };
}

export { intersectFeatures, unionFeatures };
