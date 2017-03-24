'use strict'

// Initilise Google Maps
var initMap = function () {
  var origin = new google.maps.LatLng(-13.710816, -76.203229)
  var map = new google.maps.Map(document.getElementById('map'), {
    zoom: 12,
    center: origin
  })
  var marker = new google.maps.Marker({
    position: origin,
    map: map
  })

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
  var grid = hexagon.draw.gridHorizontal(map, start, hexagon.radius, hexagon.horizontal)

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
        grid[17 + x * 2][39 - y * 1].bounds(),
        'img/patterns/mountains-0' + getRandomInt(1, 9) + '-1x.png',
        map,
        2
      )
    }
  }

  // Draw Ruins of Haven
  var ruins = [
    [19,30],
    [20,29],
    [20,30],
    [21,28],
    [21,29],
    [21,30],
    [22,29],
    [22,30],
    [23,29],
    [23,30]
  ]
  _.each(ruins, function(coord){
    new IconOverlay(
      grid[coord[0]][coord[1]].bounds(),
      'img/icons/ruins-01-1x.png',
      map
    )
  })

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