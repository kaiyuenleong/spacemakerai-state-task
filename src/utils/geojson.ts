import intersect from '@turf/intersect';
import union from '@turf/union';
import { Feature } from 'geojson';
import { v4 as uuidv4 } from 'uuid';

function intersectFeatures(features: Feature[]): Feature | null {
  let intersectedFeature = intersect(features[0].geometry as GeoJSON.Polygon, features[1].geometry as GeoJSON.Polygon);
  if (intersectedFeature) {
    prepareFeature(intersectedFeature);
    return intersectedFeature;
  }
  return null;
}

function unionFeatures(features: Feature[]): Feature | null {
  let unitedFeature = union(features[0].geometry as GeoJSON.Polygon, features[1].geometry as GeoJSON.Polygon);
  if (unitedFeature) {
    prepareFeature(unitedFeature);
    return unitedFeature;
  }
  return null;
}

function prepareFeature(feature: Feature): void {
  feature.id = uuidv4();
  feature.properties ? feature.properties['selected'] = false : feature.properties = { selected: false };
}

export { intersectFeatures, unionFeatures };
