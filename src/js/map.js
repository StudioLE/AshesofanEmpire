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
    strokeColor: '#fff',
    strokeOpacity: 0.25,
    strokeWeight: 2,
    zIndex: 0
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
    return this.radius * 3;
  },
  height: function() {
    return this.radius * 2 * Math.sqrt(3)/2;
  }
}

hexagon.draw.gridHorizontal = function(map, startPosition, radius,count) {
  var curPos = startPosition;
  var column = []

  // Create Column
  for(var i = 0; i < count; i++) {
    column = column.concat(hexagon.draw.gridVertical(map, curPos, hexagon.radius, hexagon.vertical))

    // Update the current position to draw next hexagon
    curPos = google.maps.geometry.spherical.computeOffset(curPos, hexagon.width(), 90);
  }
  return column
}

// Draw hexagon grid from
// http://stackoverflow.com/questions/11761738/how-can-i-make-a-google-maps-api-v3-hexagon-tiled-map-preferably-coordinate-bas
hexagon.draw.gridVertical = function(map, startPosition, radius,count) {
  var curPos = startPosition;
  var row = []
  var row_two = []

  // Create row
  for(var i = 0; i < count; i++) {
    // Create a hexagon at current position
    row.push(hexagon.draw.polygon(map, curPos, radius))

    // Create a second hexagon above and 30 degrees across
    secPos = google.maps.geometry.spherical.computeOffset(curPos, hexagon.height(), 60);
    row_two.push(hexagon.draw.polygon(map, secPos, radius))

    // Update the current position to draw next hexagon
    curPos = google.maps.geometry.spherical.computeOffset(curPos, hexagon.height(), 0);
  }
  return [row, row_two]
}

hexagon.draw.polygon = function(map,position,radius){
  var coordinates = [];
  // Add a coordinate at every 60 degree angle of a circle
  for(var angle = 30; angle < 360; angle += 60) {
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

var overlay
IconOverlay.prototype = new google.maps.OverlayView()

/** @constructor */
function IconOverlay(bounds, image, map, scale) {

  // Initialize all properties.
  this.bounds_ = bounds;
  this.image_ = image;
  this.map_ = map;
  this.scale_ = scale || 1

  // Define a property to hold the image's div. We'll
  // actually create this div upon receipt of the onAdd()
  // method so we'll leave it null for now.
  this.div_ = null;

  // Explicitly call setMap on this overlay.
  this.setMap(map);
}

/**
 * onAdd is called when the map's panes are ready and the overlay has been
 * added to the map.
 */
IconOverlay.prototype.onAdd = function() {

  var div = document.createElement('div');
  div.style.borderStyle = 'none';
  div.style.borderWidth = '0px';
  div.style.position = 'absolute';

  // Create the img element and attach it to the div.
  var img = document.createElement('img');
  img.src = this.image_;
  img.style.width = '100%';
  img.style.height = '100%';
  img.style.position = 'absolute';
  div.appendChild(img);

  this.div_ = div;

  // Add the element to the "overlayLayer" pane.
  var panes = this.getPanes();
  // panes.overlayLayer.appendChild(div);
  panes.floatPane.appendChild(div);
};

IconOverlay.prototype.draw = function() {

  // We use the south-west and north-east
  // coordinates of the overlay to peg it to the correct position and size.
  // To do this, we need to retrieve the projection from the overlay.
  var overlayProjection = this.getProjection();

  // Retrieve the south-west and north-east coordinates of this overlay
  // in LatLngs and convert them to pixel coordinates.
  // We'll use these coordinates to resize the div.
  var sw = overlayProjection.fromLatLngToDivPixel(this.bounds_.getSouthWest());
  var ne = overlayProjection.fromLatLngToDivPixel(this.bounds_.getNorthEast());

  // Resize the image's div to fit the indicated dimensions.
  var div = this.div_;

  var width = (ne.x - sw.x) * this.scale_
  var height = (sw.y - ne.y) * this.scale_


  div.style.left = sw.x + 'px';
  div.style.top = ne.y + 'px';
  div.style.width = width + 'px';
  div.style.height = height + 'px';

  if(this.scale_ !== 1) {
    div.style.left = sw.x - width / (2 * this.scale_) + 'px';
    div.style.top = ne.y - height / (2 * this.scale_) + 'px';
  }


};


function getRandomInt(min, max) {
  min = Math.ceil(min);
  max = Math.floor(max);
  return Math.floor(Math.random() * (max - min)) + min;
}

// The onRemove() method will be called automatically from the API if
// we ever set the overlay's map property to 'null'.
IconOverlay.prototype.onRemove = function() {
  this.div_.parentNode.removeChild(this.div_);
  this.div_ = null;
};

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

  // Extend Polygon class for find center method
  // http://stackoverflow.com/a/13772082/247218
  google.maps.Polygon.prototype.bounds = function() {
    var bounds = new google.maps.LatLngBounds()
    this.getPath().forEach(function(element, index) {
      bounds.extend(element)
    })
    return bounds
  }

  // Extend Polygon class for find center method
  // http://stackoverflow.com/a/13772082/247218
  google.maps.Polygon.prototype.center = function() {
    return this.bounds().getCenter()
    // return bounds
  }

  var start = origin

  // Shift start so origin is beside sea
  start = google.maps.geometry.spherical.computeOffset(start, hexagon.width() * distances.sea.horizontal / 2, -90)

  // Shift start so origin is at centre
  start = google.maps.geometry.spherical.computeOffset(start, hexagon.height() * hexagon.horizontal / 2, 180)

  // Create our grid of hexagons
  grid = hexagon.draw.gridHorizontal(map, start, hexagon.radius, hexagon.horizontal);

  // Hexagon mouseover events
  _.each(grid, function(column, x) {
    _.each(column, function(item, y) {
      // On mouseover
      google.maps.event.addListener(item, 'mouseover', function() {
        this.setOptions({
          strokeColor: '#000',
          zIndex: 1
        })
        $('#coords').html('(' + x + ', ' + y + ')')
      })

      // On mouseout
      google.maps.event.addListener(item, 'mouseout', function() {
        this.setOptions({
          strokeColor: style.default.strokeColor,
          zIndex: 0
        })
      })
    })
  })

  // Colour the sea
  _.each(grid, function(column, x) {
    if(x < distances.sea.horizontal) {
      _.each(column, function(item, y) {
        if(x > 50 - y && x > 7) {
          item.setOptions(style.land)
        }
        else if(x > y && x > 11) {
          item.setOptions(style.land)
        }
        else {
          item.setOptions(style.sea)
        }
      })
    }
  })


  // Add some land to the bay
  grid[19][31].setOptions(style.land)
  grid[19][30].setOptions(style.land)
  grid[19][26].setOptions(style.land)
  grid[19][25].setOptions(style.land)
  grid[20][22].setOptions(style.sea)


  // Draw Northern Mountains
  for(var x = 0; x < 20; x++) {
    for(var y = 0; y < 4; y++) {
      new IconOverlay(
        grid[16 + x * 2][39 - y * 1].bounds(),
        'img/patterns/mountains-0' + getRandomInt(1, 9) + '-1x.png',
        map,
        2
      )
      new IconOverlay(
        grid[17 + x * 2][40 - y * 1].bounds(),
        'img/patterns/mountains-0' + getRandomInt(1, 9) + '-1x.png',
        map,
        2
      )
    }
  }


  // Draw Ruins of Haven
  new IconOverlay(
    grid[19][30].bounds(),
    'img/icons/ruins-01-1x.png',
    map
  )
  new IconOverlay(
    grid[20][29].bounds(),
    'img/icons/ruins-01-1x.png',
    map
  )
  new IconOverlay(
    grid[20][30].bounds(),
    'img/icons/ruins-01-1x.png',
    map
  )
  new IconOverlay(
    grid[21][29].bounds(),
    'img/icons/ruins-01-1x.png',
    map
  )
  new IconOverlay(
    grid[21][30].bounds(),
    'img/icons/ruins-01-1x.png',
    map
  )
  new IconOverlay(
    grid[22][29].bounds(),
    'img/icons/ruins-01-1x.png',
    map
  )
  new IconOverlay(
    grid[22][30].bounds(),
    'img/icons/ruins-01-1x.png',
    map
  )
  new IconOverlay(
    grid[23][29].bounds(),
    'img/icons/ruins-01-1x.png',
    map
  )
  new IconOverlay(
    grid[23][30].bounds(),
    'img/icons/ruins-01-1x.png',
    map
  )

  // Draw docks
  new IconOverlay(
    grid[19][28].bounds(),
    'img/icons/dock-01-1x.png',
    map
  )

  // Draw temple
  new IconOverlay(
    grid[22][31].bounds(),
    'img/icons/temple-01-1x.png',
    map
  )

  // Draw town of Haven
  new IconOverlay(
    grid[21][27].bounds(),
    'img/icons/town-01-1x.png',
    map,
    2
  )

}

google.maps.event.addDomListener(window, 'load', initMap);