import intersect from '@turf/intersect';
import union from '@turf/union';
import { v4 as uuidv4 } from 'uuid';

/**
 * Wrapper class for working with GeoJSON Features
 */
class GeoJSONFeatureInterface {
  /**
   * Creates and returns an intersection of two features
   * @param {GeoJSON.Feature[]} features - an array of features to intersect
   * @returns {(GeoJSON.Feature|null)} a new feature created from intersecting input features
   */
  static intersectFeatures(features: GeoJSON.Feature[]): GeoJSON.Feature | null {
    let intersectedFeature = intersect(features[0].geometry as GeoJSON.Polygon, features[1].geometry as GeoJSON.Polygon);
    if (intersectedFeature) {
      this.prepareFeature(intersectedFeature, false);
      return intersectedFeature;
    }
    return null;
  }

  /**
   * Creates and returns an union of two features
   * @param {GeoJSON.Feature[]} features - an array of features to unite
   * @returns {(GeoJSON.Feature|null)} a new feature created from uniting input features
   */
  static unionFeatures(features: GeoJSON.Feature[]): GeoJSON.Feature | null {
    let unitedFeature = union(features[0].geometry as GeoJSON.Polygon, features[1].geometry as GeoJSON.Polygon);
    if (unitedFeature) {
      this.prepareFeature(unitedFeature, false);
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
  static prepareFeature(feature: GeoJSON.Feature, selected: boolean): void {
    feature.id = uuidv4();
    feature.properties ? feature.properties['selected'] = selected : feature.properties = { selected };
  }
}

export { GeoJSONFeatureInterface };

/**
 * Wrapper class for working with GeoJSON solutions
 */
class GeoJSONInterface {
  /**
   * An array of stored solutions
   */
  private solutions: ExtendedFeatureCollection[];

  constructor() {
    this.solutions = [];
  }

  /**
   * Augments an imported solution by adding unique identifiers to the solution
   * as well as its features
   * @param {GeoJSON.FeatureCollection0} solution - a solution in the form of a feature collection 
   * @returns {ExtendedFeatureCollection} an extended version of a feature collection that has identifiers and extra properties
   */
  static processImport(solution: GeoJSON.FeatureCollection): ExtendedFeatureCollection {
    let newSolution: ExtendedFeatureCollection = {
      id: uuidv4(),
      type: "FeatureCollection",
      features: [],
    };

    Object.assign(newSolution, solution);

    for (let feature of newSolution.features) {
      feature.id = uuidv4();
      if (feature.properties) { feature.properties['selected'] = false };
    }

    return newSolution;
  }
  
  /**
   * Imports local solutions for testing purposes
   * @returns {Promise<void>} a promise that resolves after the test solutions are imported
   */
  async importTests(): Promise<void> {
    try {
      let solution1 = await import('solutions/SE_State_Management_Polygons_1.json');
      this.addSolution(GeoJSONInterface.processImport(solution1.default as GeoJSON.FeatureCollection));

      let solution2 = await import('solutions/SE_State_Management_Polygons_2.json');
      this.addSolution(GeoJSONInterface.processImport(solution2.default as GeoJSON.FeatureCollection));
    } catch (err: any) {
      console.error("error importing test solutions:", err);
      throw new Error("could not import test solutions");
    }
  }

  /**
   * Adds a solution to the list of solutions
   * @param {GeoJSON.FeatureCollection} solution - the solution to add 
   */
  addSolution(solution: ExtendedFeatureCollection): void {
    this.solutions.push(solution);
  }

  /**
   * Returns all stored solutions
   * @returns {ExtendedFeatureCollection[]} an array of the current solutions
   */
  getSolutions(): ExtendedFeatureCollection[] {
    return this.solutions;
  }

  /**
   * Updates features in a solution
   * @param {string} solutionID - the solution to update
   * @param {string | string[]} featureIDs - the feature(s) to update
   * @param {UpdateAction} action - the type of feature update
   * @param {GeoJSON.Feature} [updatedFeature] - the updated feature that needs to be morphed into the solution
   */
  updateSolution(solutionID: string, featureIDs: string | string[], action: UpdateAction, updatedFeature?: GeoJSON.Feature): void {
    let currentSolution: ExtendedFeatureCollection | undefined;
    let currentSolutionIndex: number | undefined;
    for (let i = 0; i < this.solutions.length; i++) {
      if (this.solutions[i].id === solutionID) {
        currentSolution = this.solutions[i];
        currentSolutionIndex = i;
      }
    }

    if (currentSolution === undefined || currentSolutionIndex === undefined) throw new Error("could not find corresponding solution to update");
    if (action === "UpdatePolygons" && !updatedFeature) throw new Error("cannot update features without a new union/intersecting feature");

    const updatedSolution: ExtendedFeatureCollection = {
      id: uuidv4(),
      type: "FeatureCollection",
      features: [],
    }

    Object.assign(updatedSolution, currentSolution);

    const updatedFeatures: GeoJSON.Feature[] = [];

    for (let feature of updatedSolution.features) {
      if (action === "UpdateSelection") {
        if (feature.id && (featureIDs as string) === feature.id && feature.properties) {
          if (feature.properties['selected'] === false) {
            // Set the green tint for a soon-to-be "selected" feature
            feature.properties['fillColor'] = [ 63, 191, 63, 100 ];
          } else {
            // Set the gray tint for a soon-to-be "deselected" feature
            feature.properties['fillColor'] = [ 160, 160, 180, 200 ];
          }
          // Invert the selection states of the current feature
          feature.properties['selected'] = !feature.properties['selected'];
        }
      } else if (action === "UpdatePolygons") {
        if (feature.id && (featureIDs as string[]).includes(feature.id as string)) {
          // Filter out the affected features from the modification
          // from the updated array of features
          continue;
        } else {
          // Add the unaffected features back to the updated array of features
          updatedFeatures.push(feature);
        }
      }
    }

    if (action === "UpdatePolygons") {
      // Add the new resultant feature to the output features
      updatedFeatures.push(updatedFeature as GeoJSON.Feature);
      updatedSolution.features = [ ...updatedFeatures ];
    }

    this.solutions[currentSolutionIndex] = updatedSolution;
  }
}

export { GeoJSONInterface };
