'use strict'

// Bespoke hexagons
var hexagon = {
  // Set hexagon radius in metres
  radius: 1 * 1000,
  // Quantities
  horizontal: 50,
  vertical: 50,
  draw: {},
  grid: [],
  width: function() {
    return this.radius * 3
  },
  height: function() {
    return this.radius * 2 * Math.sqrt(3)/2
  }
}

hexagon.draw.gridHorizontal = function(map, startPosition, radius,count) {
  var curPos = startPosition
  var column = []

  // Create Column
  for(var i = 0; i < count; i++) {
    column = column.concat(hexagon.draw.gridVertical(map, curPos, hexagon.radius, hexagon.vertical))

    // Update the current position to draw next hexagon
    curPos = google.maps.geometry.spherical.computeOffset(curPos, hexagon.width(), 90)
  }
  return column
}

// Draw hexagon grid from
// http://stackoverflow.com/questions/11761738/how-can-i-make-a-google-maps-api-v3-hexagon-tiled-map-preferably-coordinate-bas
hexagon.draw.gridVertical = function(map, startPosition, radius,count) {
  var curPos = startPosition
  var row = []
  var row_two = []

  // Create row
  for(var i = 0; i < count; i++) {
    // Create a hexagon at current position
    row.push(hexagon.draw.polygon(map, curPos, radius))

    // Create a second hexagon above and 30 degrees across
    var secPos = google.maps.geometry.spherical.computeOffset(curPos, hexagon.height(), 60)
    row_two.push(hexagon.draw.polygon(map, secPos, radius))

    // Update the current position to draw next hexagon
    curPos = google.maps.geometry.spherical.computeOffset(curPos, hexagon.height(), 0)
  }
  return [row, row_two]
}

hexagon.draw.polygon = function(map,position,radius){
  var coordinates = []
  // Add a coordinate at every 60 degree angle of a circle
  for(var angle = 30; angle < 360; angle += 60) {
    coordinates.push(google.maps.geometry.spherical.computeOffset(position, radius, angle))
  }

  // Construct the polygon between the coordinates
  var polygon = new google.maps.Polygon({
    paths: coordinates
  })
  polygon.setOptions(style.default)
  polygon.setMap(map)
  // map.setCenter(position)
  return polygon
}
