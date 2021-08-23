import React from 'react';
import { ReactComponent as UnionIcon } from 'static/unite.svg';
import { ReactComponent as IntersectIcon } from 'static/intersection.svg';
import { calculateArea, GeoJSONFeatureInterface } from 'utils';
import './styles.css';

interface WorkflowStatisticsProps {
  selectedSolution: ExtendedFeatureCollection | undefined;
  updateSelectedSolution: (featureIDs: string[], updatedFeature: GeoJSON.Feature) => void;
}

interface WorkflowStatisticData {
  label: string;
  value: string;
}

/**
 * Component for displaying area data for the selected solution
 * @version 1.0.1
 */
function WorkflowStatistics(props: WorkflowStatisticsProps) {
  // Array of features in the solution being displayed
  const solutionFeatures: GeoJSON.Feature[] = props.selectedSolution ? props.selectedSolution.features : [];

  // Array of selected features in the solution being displayed
  const selectedSolutionFeatures: GeoJSON.Feature[] = 
    solutionFeatures.filter((feature: GeoJSON.Feature) => feature.properties && feature.properties['selected']);

  // Area data entries to be mapped in the component
  const areaData: WorkflowStatisticData[] = [
    {
      label: "Solution Area",
      value: calculateArea(solutionFeatures, 3),
    },
    {
      label: "Selected Area",
      value: calculateArea(selectedSolutionFeatures, 3),
    }
  ];

  /**
   * A wrapper callback function for the 'Union' button
   * that sends the selected features for a single united feature
   * to be created, then passes the new union feature
   * to update the solution state
   */
  const onUnion = (): void => {
    if (selectedSolutionFeatures.length !== 2) return;
    const unitedFeature = GeoJSONFeatureInterface.unionFeatures(selectedSolutionFeatures);
    if (unitedFeature) {
      props.updateSelectedSolution(
        [selectedSolutionFeatures[0].id as string, selectedSolutionFeatures[1].id as string],
        unitedFeature,
      );
    }
  } 

  /**
   * A wrapper callback function for the 'Intersect' button
   * that sends the selected features for a single intersecting feature
   * to be created, then passes the new intersecting feature
   * to update the solution state
   */
  const onIntersect = (): void => {
    if (selectedSolutionFeatures.length !== 2) return;
    const intersectedFeature = GeoJSONFeatureInterface.intersectFeatures(selectedSolutionFeatures);
    if (intersectedFeature) {
      props.updateSelectedSolution(
        [selectedSolutionFeatures[0].id as string, selectedSolutionFeatures[1].id as string],
        intersectedFeature,
      )
    }
  }

  // Set whether tool buttons are disabled based on the
  // number of selected polygon features
  const toolsDisabled = selectedSolutionFeatures.length !== 2;

  return (
    <div className="workflow_statistics flex flex_col">
      <div>
        <h3>Solution Statistics</h3>
        {areaData.map((area: WorkflowStatisticData) => {
          const key = `workflow_statistic_area_${area.label.toLowerCase().split(" ").join("_")}`
          return (
            <div
              key={key}
              className="workflow_statistic"
            >
              <h4>{area.label}</h4>
              <p>{area.value} m<sup>2</sup></p>
            </div>
          )
        })}
      </div>
      <div>
        <h3>Solution Tools</h3>
        <div className="flex flex_col align_center">
          <WorkflowTool
            label={"Union"}
            disabled={toolsDisabled}
            onClickCallback={onUnion}
          >
            <UnionIcon />
          </WorkflowTool>
          <WorkflowTool
            label={"Intersect"}
            disabled={toolsDisabled}
            onClickCallback={onIntersect}
          >
            <IntersectIcon />
          </WorkflowTool>
        </div>
      </div>
    </div>
  )
}

export { WorkflowStatistics };

interface WorkflowToolProps {
  label: string;
  disabled: boolean;
  onClickCallback: () => void;
  children: React.ReactNode;
}

/**
 * A workflow tool button component
 * @version 1.0.0
 */
function WorkflowTool(props: WorkflowToolProps) {
  return (
    <button
      className={`workflow_tool_button flex justify_align_center ${props.disabled ? "disabled" : ""}`}
      onClick={props.onClickCallback}
      disabled={props.disabled}
    >
      {props.children}
      {props.label}
    </button>
  )
}
