// Bespoke styles
var style = {
  land: {
    fillColor: '#a69375'
  },
  sea: {
    fillColor: '#426661'
  },
  default: {
    fillColor: '#a69375',
    fillOpacity: 0.75,
    strokeColor: '#000',
    strokeOpacity: 0.5,
    strokeWeight: 2
  }
}

var distances = {
  sea: {
    horizontal: 20,
  }
}

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
    return this.radius * 2 * Math.sqrt(3)/2;
  },
  height: function() {
    return this.radius * 3;
  }
}

hexagon.draw.gridVertical = function(map, startPosition, radius,count) {
  var curPos = startPosition;
  var column = []

  // Create Column
  for(var i = 0; i < count; i++) {
    column = column.concat(hexagon.draw.gridHorizontal(map, curPos, hexagon.radius, hexagon.horizontal))

    // Update the current position to draw next hexagon
    curPos = google.maps.geometry.spherical.computeOffset(curPos, hexagon.height(), 0);
  }
  return column
}

// Draw hexagon grid from
// http://stackoverflow.com/questions/11761738/how-can-i-make-a-google-maps-api-v3-hexagon-tiled-map-preferably-coordinate-bas
hexagon.draw.gridHorizontal = function(map, startPosition, radius,count) {
  var curPos = startPosition;
  var row = []
  var row_two = []

  // Create row
  for(var i = 0; i < count; i++) {
    // Create a hexagon at current position
    row.push(hexagon.draw.polygon(map, curPos, radius))

    // Create a second hexagon above and 30 degrees across
    secPos = google.maps.geometry.spherical.computeOffset(curPos, hexagon.width(), 30);
    row_two.push(hexagon.draw.polygon(map, secPos, radius))

    // Update the current position to draw next hexagon
    curPos = google.maps.geometry.spherical.computeOffset(curPos, hexagon.width(), 90);
  }
  return [row, row_two]
}

hexagon.draw.polygon = function(map,position,radius){
  var coordinates = [];
  // Add a coordinate at every 60 degree angle of a circle
  for(var angle = 0; angle < 360; angle += 60) {
    coordinates.push(google.maps.geometry.spherical.computeOffset(position, radius, angle));
  }

  // Construct the polygon between the coordinates
  var polygon = new google.maps.Polygon({
    paths: coordinates
  });
  polygon.setOptions(style.default)
  polygon.setMap(map);
  // map.setCenter(position);
  return polygon
}

// Initilise Google Maps
var initMap = function () {
  var origin = new google.maps.LatLng(-13.710816, -76.203229)
  var map = new google.maps.Map(document.getElementById('map'), {
    zoom: 12,
    center: origin
  });
  var marker = new google.maps.Marker({
    position: origin,
    map: map
  });

  var start = origin

  // Shift start so origin isbeside sea
  start = google.maps.geometry.spherical.computeOffset(start, hexagon.width() * distances.sea.horizontal, -90)

  // Shift start so origin is at centre
  start = google.maps.geometry.spherical.computeOffset(start, hexagon.height() * hexagon.horizontal / 2, 180)

  // Create our grid of hexagons
  grid = hexagon.draw.gridVertical(map, start, hexagon.radius, hexagon.vertical);

  // Colour the sea
  _.each(grid, function(row, key) {
    if(true) {
      _.each(row, function(column, key) {
        if(key < distances.sea.horizontal) {
          column.setOptions(style.sea)
        }
      })
    }
  })



}