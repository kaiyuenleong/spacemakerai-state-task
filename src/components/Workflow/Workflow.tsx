import React from 'react';
import { GeoJSONInterface } from 'utils';
import { WorkflowSolutions } from './WorkflowSolutions';
import { WorkflowWorkspace } from './WorkflowWorkspace';
import { WorkflowStatistics } from './WorkflowStatistics';
import './styles.css';

interface WorkflowProps {}

interface WorkflowState {
  solutions: ExtendedFeatureCollection[];
  selectedSolution: number;
}

/**
 * Parent wrapper component for the Spacemaker polygon workflow
 * @version 1.0.0
 */
class Workflow extends React.Component<WorkflowProps, WorkflowState> {
  private GeoJSONToolkit: GeoJSONInterface;

  constructor(props: WorkflowProps) {
    super(props);

    this.GeoJSONToolkit = new GeoJSONInterface();

    this.state = {
      solutions: [],
      selectedSolution: 0, 
    }

    this.onSelectSolution = this.onSelectSolution.bind(this);
    this.onUpdateSolutionSelection = this.onUpdateSolutionSelection.bind(this);
    this.onUpdateSolutionFeatures = this.onUpdateSolutionFeatures.bind(this);
  }

  /**
   * Loads a list of solutions for the workflow after the initial render
   */
  componentDidMount() {
    const loadSolutions = async () => {
      try {
        await this.GeoJSONToolkit.importTests();
        const solutions = this.GeoJSONToolkit.getSolutions();
        this.setState({ solutions });
      } catch (err: any) {
        console.error("loadSolutions error:", err);
        this.setState({ solutions: [] });
      }
    }

    loadSolutions();
  }

  /**
   * Sets the currently-selected solution
   * @param {number} index - the index of the selected solution
   */
  onSelectSolution(index: number): void {
    this.setState({ selectedSolution: index });
  }

  /**
   * Callback function to update the selection state of a feature
   * @param {string} featureID - the feature to update
   */
  onUpdateSolutionSelection(featureID: string): void {
    try {
      const solutionID = this.state.solutions[this.state.selectedSolution].id;
      this.GeoJSONToolkit.updateSolution(solutionID, featureID, "UpdateSelection");
      const newSolutions = this.GeoJSONToolkit.getSolutions();
      this.setState({ solutions: newSolutions });
    } catch (err: any) {
      console.error(err);
    } 
  }

  /**
   * Callback function to update the solution with a feature transformation
   * @param {string[]} featureIDs - the features involved in the transformation
   * @param {GeoJSON.Feature} updatedFeature - the resultant feature from uniting or intersecting two features
   */
  onUpdateSolutionFeatures(featureIDs: string[], updatedFeature: GeoJSON.Feature): void {
    try {
      const solutionID = this.state.solutions[this.state.selectedSolution].id;
      this.GeoJSONToolkit.updateSolution(solutionID, featureIDs, "UpdatePolygons", updatedFeature);
      const newSolutions = this.GeoJSONToolkit.getSolutions();
      this.setState({ solutions: newSolutions });
    } catch (err: any) {
      console.error(err);
    }
  }

  render() {
    return (
      <div className="workflow flex">
        <WorkflowSolutions
          solutions={this.state.solutions}
          setSelectedSolution={this.onSelectSolution} 
        />
        <WorkflowWorkspace
          selectedSolution={this.state.solutions[this.state.selectedSolution]}
          updateSelectedSolution={this.onUpdateSolutionSelection}
        />
        <WorkflowStatistics
          selectedSolution={this.state.solutions[this.state.selectedSolution]}
          updateSelectedSolution={this.onUpdateSolutionFeatures}
        />
      </div>
    )
  }
}

export { Workflow };