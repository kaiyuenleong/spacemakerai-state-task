import React from 'react';
import { StaticMap, ViewportProps, FlyToInterpolator } from 'react-map-gl';
import { PickInfo, RGBAColor } from 'deck.gl';
import DeckGL from '@deck.gl/react';
import { GeoJsonLayer } from '@deck.gl/layers';
import './styles.css';

// Default map viewbox on initial load
const INITIAL_VIEW_STATE = {
  longitude: -71.08475,
  latitude: 42.36254,
  zoom: 15,
  pitch: 0,
  bearing: 0,
  transitionDuration: 2000,
  transitionInterpolator: new FlyToInterpolator(),
};

interface WorkflowWorkspaceProps {
  selectedSolution: ExtendedFeatureCollection | undefined;
  updateSelectedSolution: (featureID: string, action: UpdateAction) => void;
}

interface WorkflowWorkspaceState {
  initialViewState: ViewportProps;
}

class WorkflowWorkspace extends React.Component<WorkflowWorkspaceProps, WorkflowWorkspaceState> {
  constructor(props: WorkflowWorkspaceProps) {
    super(props);

    this.state = {
      initialViewState: INITIAL_VIEW_STATE,
    }

    this.alignViewToSolution = this.alignViewToSolution.bind(this);
    this.onDeckClick = this.onDeckClick.bind(this);
  }

  /**
   * Triggers a shift in the map view after the initial render
   */
  componentDidMount() {
    this.alignViewToSolution();
  }

  /**
   * Shifts the map's viewbox when another solution is selected
   * @param {WorkflowWorkspaceProps} prevProps - the previous version of the received props
   */
  componentDidUpdate(prevProps: WorkflowWorkspaceProps) {
    if (this.props.selectedSolution?.id !== prevProps.selectedSolution?.id) {
      this.alignViewToSolution();
    }
  }

  /**
   * If a solution exists and is selected, align the map's view to a
   * coordinate reference in the selected solution's features
   */
  alignViewToSolution(): void {
    if (this.props.selectedSolution) {
      const solutionFeature = this.props.selectedSolution.features[0];
      if (solutionFeature) {
        const solutionFeatureCoordinates = (solutionFeature.geometry as GeoJSON.Polygon).coordinates;
        if (solutionFeatureCoordinates.length > 0 && solutionFeatureCoordinates[0].length > 0) {
          this.setState({
            initialViewState: {
              longitude: solutionFeatureCoordinates[0][0][0],
              latitude: solutionFeatureCoordinates[0][0][1],
              zoom: 15,
              pitch: 0,
              bearing: 0,
              transitionDuration: 2000,
              transitionInterpolator: new FlyToInterpolator(),
            }
          });
        }
      }
    }
  }

  /**
   * Handles updating the selection states for a solution's features
   * when a feature is clicked on the map
   * @param {PickInfo<any>} info - the object picked from clicking the map
   * @param {MouseEvent} e - the mouse event associated with the click
   */
  onDeckClick(info: PickInfo<any>, e: MouseEvent): void {
    if (info.object && info.object.properties) {
      this.props.updateSelectedSolution(info.object.id, "UpdateSelection");
    }
  }
   
  render() {
    const data = this.props.selectedSolution ? this.props.selectedSolution : null;
    const layers = [
      new GeoJsonLayer({
        id: 'geojson-layer',
        data,
        pickable: true,
        stroked: false,
        filled: true,
        pointType: 'circle',
        lineWidthScale: 20,
        lineWidthMinPixels: 2,
        autoHighlight: true,
        highlightColor: [ 255, 255, 0, 100 ],
        getFillColor: (feature: any) => { 
          // Get color from polygon feature object if it exists
          if (feature?.properties?.fillColor) {
            return feature.properties.fillColor as RGBAColor;
          }
          // Default grayscale color for unselected polygon
          return [ 160, 160, 180, 200 ];
        },
        getPointRadius: 100,
        getLineWidth: 1,
      }),
    ];

    return (
      <div className="workflow_workspace" onContextMenu={(e) => e.preventDefault()}>
        <DeckGL
          initialViewState={this.state.initialViewState}
          controller={true}
          layers={layers}
          onClick={this.onDeckClick}
        >
          <StaticMap mapboxApiAccessToken={process.env.REACT_APP_MAPBOX_ACCESS_TOKEN} />
        </DeckGL>
      </div>
    ) 
  }
}

export { WorkflowWorkspace };
