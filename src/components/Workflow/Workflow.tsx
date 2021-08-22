import React from 'react';
import { v4 as uuidv4 } from 'uuid';
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
  constructor(props: WorkflowProps) {
    super(props);

    this.state = {
      solutions: [],
      selectedSolution: 0, 
    }

    this.onSelectSolution = this.onSelectSolution.bind(this);
    this.onUpdateSolutionSelection = this.onUpdateSolutionSelection.bind(this);
    this.onUpdateSolutionFeatures = this.onUpdateSolutionFeatures.bind(this);
  }

  componentDidMount() {
    const solutions: GeoJSON.FeatureCollection[] = [];

    // Load the JSON solutions then update the solution data in the component
    const loadSolutions = async () => {
      try {
        let solution1 = await import('../../solutions/SE_State_Management_Polygons_1.json');
        solutions.push(Workflow.processSolutionImport(solution1.default as GeoJSON.FeatureCollection));
  
        let solution2 = await import('../../solutions/SE_State_Management_Polygons_2.json');
        solutions.push(Workflow.processSolutionImport(solution2.default as GeoJSON.FeatureCollection));

        this.setState({ solutions });
      } catch (err: any) {
        console.error("error loading solutions:", err);
      }
    }

    loadSolutions();
  }

  static processSolutionImport(solution: GeoJSON.FeatureCollection): GeoJSON.FeatureCollection {
    let newSolution: ExtendedFeatureCollection = {
      id: uuidv4(),
      type: "FeatureCollection",
      features: [],
    };
    Object.assign(newSolution, solution);
    
    for (let feature of newSolution.features) {
      feature.id = uuidv4()
      if (feature.properties) {
        feature.properties['selected'] = false;
      }
    }

    return newSolution;
  }

  onSelectSolution(index: number) {
    this.setState({ selectedSolution: index });
  }

  onUpdateSolutionSelection(featureID: string, action: UpdateAction) {
    const updatedSolution: ExtendedFeatureCollection = {
      id: uuidv4(),
      type: "FeatureCollection",
      features: [],
    };

    Object.assign(updatedSolution, this.state.solutions[this.state.selectedSolution]);

    for (let feature of updatedSolution.features) {
      if (feature.id && featureID === feature.id && feature.properties) {
        if (feature.properties['selected'] === false) {
          feature.properties['fillColor'] = [ 63, 191, 63, 100 ];
        } else {
          feature.properties['fillColor'] = [ 160, 160, 180, 200 ];
        }
        feature.properties['selected'] = !feature.properties['selected'];
      }
    }

    const newSolutions: GeoJSON.FeatureCollection[] = [ ...this.state.solutions ];
    newSolutions[this.state.selectedSolution] = updatedSolution;

    this.setState({ solutions: newSolutions });
  }

  onUpdateSolutionFeatures(featureIDs: string[], action: UpdateAction, updatedFeature: GeoJSON.Feature) {
    const updatedSolution: ExtendedFeatureCollection = {
      id: uuidv4(),
      type: "FeatureCollection",
      features: [],
    };

    Object.assign(updatedSolution, this.state.solutions[this.state.selectedSolution]);

    const updatedFeatures: GeoJSON.Feature[] = [];

    for (let feature of updatedSolution.features) {
      if (feature.id && featureIDs.includes(feature.id as string)) {
        continue;
      } else {
        updatedFeatures.push(feature);
      }
    }

    updatedFeatures.push(updatedFeature);
    updatedSolution.features = [ ...updatedFeatures ];

    const newSolutions: GeoJSON.FeatureCollection[] = [ ...this.state.solutions ];
    newSolutions[this.state.selectedSolution] = updatedSolution;

    this.setState({ solutions: newSolutions });
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