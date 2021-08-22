import React from 'react';
import { StaticMap, Popup, ViewportProps, FlyToInterpolator, _MapContext as MapContext } from 'react-map-gl';
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
  contextMenuData: {
    show: boolean;
    longitude: number;
    latitude: number;
  }
}

class WorkflowWorkspace extends React.Component<WorkflowWorkspaceProps, WorkflowWorkspaceState> {
  constructor(props: WorkflowWorkspaceProps) {
    super(props);

    this.state = {
      initialViewState: INITIAL_VIEW_STATE,
      contextMenuData: {
        show: false,
        longitude: 0,
        latitude: 0,
      }
    }

    this.alignViewToSolution = this.alignViewToSolution.bind(this);
    this.closeContextMenu = this.closeContextMenu.bind(this);
    this.onDeckClick = this.onDeckClick.bind(this);
    this.onDeckDrag = this.onDeckDrag.bind(this);
  }

  /**
   * Triggers a shift in the map view after the initial render
   */
  componentDidMount() {
    this.alignViewToSolution();
  }

  componentDidUpdate(prevProps: WorkflowWorkspaceProps) {
    if (this.props.selectedSolution?.id !== prevProps.selectedSolution?.id) {
      this.alignViewToSolution();
    }
  }

  /**
   * If a solution exists and is selected, align the map's view to a
   * coordinate reference in the selected solution's features
   */
  alignViewToSolution() {
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

  closeContextMenu() {
    if (this.state.contextMenuData.show) {
      const contextMenuData = {
        show: false,
        longitude: 0,
        latitude: 0,
      }
      this.setState({ contextMenuData });
    }
  }

  onDeckClick(info: PickInfo<any>, e: MouseEvent) {
    this.closeContextMenu();
    if (info.object && info.object.properties) {
      this.props.updateSelectedSolution(info.object.id, "UpdateSelection");
    }
  }

  onDeckDrag(info: PickInfo<any>, e: MouseEvent) {
    this.closeContextMenu();
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
        onClick: (info: PickInfo<any>, e: any) => {
          if (e.rightButton) {
            // TODO: Implement context menu for union/intersect
            console.log("rightclicked selected geojson layer:", info, e);
            this.setState({
              contextMenuData: {
                show: true,
                longitude: info.coordinate ? info.coordinate[0] : 0,
                latitude: info.coordinate ? info.coordinate[1] : 0,
              } 
            });
            return true;
          }
          return false;
        },
      }),
    ];

    return (
      <div className="workflow_workspace" onContextMenu={(e) => e.preventDefault()}>
        <DeckGL
          initialViewState={this.state.initialViewState}
          controller={true}
          layers={layers}
          onClick={this.onDeckClick}
          onDrag={this.onDeckDrag}
          ContextProvider={MapContext.Provider}
        >
          <StaticMap mapboxApiAccessToken={process.env.REACT_APP_MAPBOX_ACCESS_TOKEN} />
          {this.state.contextMenuData.show && (
            <Popup
              longitude={this.state.contextMenuData.longitude}
              latitude={this.state.contextMenuData.latitude}
              closeButton={false}
              anchor="bottom"
              tipSize={0}
            >
              <WorkflowWorkspaceContextMenu />
            </Popup>
          )}
        </DeckGL>
      </div>
    ) 
  }
}

interface WorkflowWorkspaceContextMenuProps {}

function WorkflowWorkspaceContextMenu(props: WorkflowWorkspaceContextMenuProps) {
  return (
    <div>
      <div>Select</div>
      <div>Union</div>
      <div>Intersect</div>
    </div>
  )
}

export { WorkflowWorkspace };
