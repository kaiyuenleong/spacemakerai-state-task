# Spacemaker AI State Task

## Build Process
### Development
1. Run ```npm i``` to install dependencies
2. Run ```npm run start``` to open a development build locally
3. Open [http://localhost:3000](http://localhost:3000) to view the development build in the browser

### Production
1. Run ```npm run build``` to create a production build output in the `build` folder

## Thoughts and Assumptions
* The state of selected features should also be persisted when switching between solutions; the basis of this is that if a user is comparing multiple solutions it might be a hassle to have to constantly reselect features when switching back and forth
* If solutions exist in the workflow, the first solution should automatically be selected on load, and the map camera view should automatically move to the approximate coordinates of the solution's features

## Limitations
* Inconsistent feature selection behavior when clicking on overlapping features
* Currently, union and intersect functionalities can only be executed if and only if two features are selected
* Map view is only 2D; need to do more technical research to figure out how to inject a 3D Base Map
* Auto view realignment currently does not work if a solution is selected but the user drags the solution's features out of the view and then selects the same solution from the list again (i.e. only works when switching between solutions)

## Credits and Attributions
### Icons
Union/Intersect icons created by [Freepik](https://www.freepik.com)

### Core Dependencies
* [deck.gl](https://deck.gl/) - map wrapper to display GeoJSON layer(s)
* [react-map-gl](https://visgl.github.io/react-map-gl/) - React wrapper for MapBox
* [@turf](https://turfjs.org/) - geospatial toolkit for working with GeoJSON calculations and transformations
* [uuid](https://www.npmjs.com/package/uuid) - unique id generator for tagging solutions and features
