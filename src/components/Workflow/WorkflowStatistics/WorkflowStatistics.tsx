import { ReactComponent as UnionIcon } from 'static/unite.svg';
import { ReactComponent as IntersectIcon } from 'static/intersection.svg';
import { calculateArea, intersectFeatures, unionFeatures } from 'utils';
import './styles.css';

interface WorkflowStatisticsProps {
  selectedSolution: ExtendedFeatureCollection | undefined;
  updateSelectedSolution: (featureIDs: string[], action: UpdateAction, updatedFeature: GeoJSON.Feature) => void;
}

interface WorkflowStatisticData {
  label: string;
  value: number | string;
}

/**
 * Component for displaying area data for the selected solution
 * @version 1.0.0
 */
function WorkflowStatistics(props: WorkflowStatisticsProps) {
  const solutionFeatures: GeoJSON.Feature[] = props.selectedSolution ? props.selectedSolution.features : [];
  const selectedSolutionFeatures: GeoJSON.Feature[] = 
    solutionFeatures.filter((feature: GeoJSON.Feature) => feature.properties && feature.properties['selected']);

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

  const onUnion = () => {
    if (selectedSolutionFeatures.length !== 2) return;
    const unitedFeature = unionFeatures(selectedSolutionFeatures);
    if (unitedFeature) {
      props.updateSelectedSolution(
        [selectedSolutionFeatures[0].id as string, selectedSolutionFeatures[1].id as string],
        "UpdatePolygons",
        unitedFeature,
      );
    }
  } 

  const onIntersect = () => {
    if (selectedSolutionFeatures.length !== 2) return;
    const intersectedFeature = intersectFeatures(selectedSolutionFeatures);
    if (intersectedFeature) {
      props.updateSelectedSolution(
        [selectedSolutionFeatures[0].id as string, selectedSolutionFeatures[1].id as string],
        "UpdatePolygons",
        intersectedFeature,
      )
    }
  }

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
              className="workflow_statistic">
              <h4>{area.label}</h4>
              <p>{area.value} m<sup>2</sup></p>
            </div>
          )
        })}
      </div>
      <div>
        <h3>Solution Tools</h3>
        <div className="workflow_tool flex flex_col align_center">
          <button
            className={`workflow_tool_button flex justify_align_center ${toolsDisabled ? "disabled" : ""}`}
            onClick={onUnion}
            disabled={toolsDisabled}
          >
            <UnionIcon />
            Union
          </button>
          <button
            className={`workflow_tool_button flex justify_align_center ${toolsDisabled ? "disabled" : ""}`}
            onClick={onIntersect}
            disabled={toolsDisabled}
          >
            <IntersectIcon />
            Intersect
          </button>
        </div>
      </div>
    </div>
  )
}

export { WorkflowStatistics };