'use strict'

// Initilise Google Maps
var initMap = function () {
  var origin = new google.maps.LatLng(-13.710816, -76.203229)
  map = new google.maps.Map(document.getElementById('map'), {
    zoom: 12,
    center: origin,
    mapTypeControl: false,
    scaleControl: true,
    streetViewControl: false,
    fullscreenControl: true
  })

  // Extend Polygon class for find bounds method
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

  // Extend LatLngBounds class for double bounds center method
  google.maps.LatLngBounds.prototype.scale = function(scale) {
    if(scale === 1) return this

    var ne = this.getNorthEast()
    var sw = this.getSouthWest()

    var width = (ne.lng() - sw.lng())
    var height = (sw.lat() - ne.lat())

    var center = {
      lng: ne.lng() - (width / 2),
      lat: ne.lat() + (height / 2)
    }

    ne = {
      lng: center.lng + (width * scale) / 2,
      lat: center.lat - (height * scale) / 2
    }

    sw = {
      lng: center.lng - (width * scale) / 2,
      lat: center.lat + (height * scale) / 2
    }

    return new google.maps.LatLngBounds(sw, ne)
  }

  var start = origin

  // Shift start so origin is beside sea
  start = google.maps.geometry.spherical.computeOffset(start, hexagon.width() * distances.sea.horizontal / 2, -90)
  // Shift start so origin is at centre
  start = google.maps.geometry.spherical.computeOffset(start, hexagon.height() * hexagon.horizontal / 2, 180)
  // Create our grid of hexagons
  grid = hexagon.draw.gridHorizontal(map, start, hexagon.radius, hexagon.horizontal)

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

  var imageBounds = {
    north: grid[99][49].center().lat(),
    east: grid[99][49].center().lng(),
    south: grid[0][0].center().lat(),
    west: grid[0][0].center().lng(),
  }

  // Add a textured background
  var texture = new google.maps.GroundOverlay(
    '/img/textures/land-2-1x.jpg',
    imageBounds
  )
  texture.setMap(map);

  // Disable default Google Maps
  var mt = function() {
    this.getTile = function() {
      var n = document.createElement('div');
      n.style.background = '#ccc'
      n.style.width = '256px'
      n.style.height = '256px'
      return n
    }
    this.tileSize = new google.maps.Size(256, 256)
    this.maxZoom = 20
  }

  map.mapTypes.set('hidden', new mt)
  map.setMapTypeId('hidden')

  // Add some land to the bay
  grid[19][31].setOptions(style.land)
  grid[19][30].setOptions(style.land)
  grid[19][26].setOptions(style.land)
  grid[19][25].setOptions(style.land)
  grid[20][22].setOptions(style.sea)

  // Islands
  grid[16][30].setOptions(style.land)
  grid[13][28].setOptions(style.land)
  grid[12][29].setOptions(style.land)
  grid[14][21].setOptions(style.land)
  grid[14][22].setOptions(style.land)
  grid[13][22].setOptions(style.land)
  grid[13][20].setOptions(style.land)
  grid[14][20].setOptions(style.land)
  grid[13][19].setOptions(style.land)

  // Draw Northern Mountains
  for(var x = 0; x < 10; x++) {
    for(var y = 0; y < 6; y++) {
      new IconOverlay(
        grid[16 + x * 3][41 - y * 1].bounds(),
        '/img/patterns/mountains-0' + getRandomInt(1, 9) + '-1x.png',
        map,
        4
      )
      new IconOverlay(
        grid[17 + x * 3][41 - y * 1].bounds(),
        '/img/patterns/mountains-0' + getRandomInt(1, 9) + '-1x.png',
        map,
        4
      )
    }
  }

  // Draw Eastern Hills
  for(var x = 0; x < 2; x++) {
    for(var y = 0; y < 10; y++) {
      new IconOverlay(
        grid[38 + x * 4][35 - y * 2].bounds(),
        '/img/patterns/hills-1x.png',
        map,
        3
      )
      new IconOverlay(
        grid[39 + x * 4][34 - y * 2].bounds(),
        '/img/patterns/hills-1x.png',
        map,
        2.5
      )
      new IconOverlay(
        grid[40 + x * 4][34 - y * 2].bounds(),
        '/img/patterns/hills-1x.png',
        map,
        2
      )
    }
  }

  // Draw Southern Woods
  for(var x = 0; x < 8; x++) {
    for(var y = 0; y < 2; y++) {
      new IconOverlay(
        grid[24 + x][20 - y].bounds(),
        '/img/patterns/trees-0' + getRandomInt(1, 5) + '-1x.png',
        map,
        1
      )
    }
  }

  // Draw North East Woods
  for(var x = 0; x < 3; x++) {
    for(var y = 0; y < 5; y++) {
      new IconOverlay(
        grid[35 + x][34 - y].bounds(),
        '/img/patterns/trees-0' + getRandomInt(1, 5) + '-1x.png',
        map,
        1
      )
    }
  }

  // Draw Ruins of Haven
  var ruins = [
    [19,26],
    [19,30],
    [20,26],
    [20,29],
    [20,30],
    [21,26],
    [21,28],
    [21,29],
    [21,30],
    [22,29],
    [22,30],
    [23,26],
    [23,27],
    [23,28],
    [23,29],
    [23,30],
    [24,29]
  ]
  _.each(ruins, function(coord){
    new IconOverlay(
      grid[coord[0]][coord[1]].bounds(),
      '/img/icons/ruins-01-1x.png',
      map,
      1.25
    )
  })

  // Swamp
  for(var x = 0; x < 4; x++) {
    for(var y = 0; y < 4; y++) {
      grid[29 + x][24 + y].setOptions(style.sea)
    }
  }
  
  // Logging Woods
  icon({
    x: 21,
    y: 24,
    icon: '/img/patterns/trees-01-1x.png',
    scale: 1
  })
  icon({
    x: 22,
    y: 24,
    icon: '/img/patterns/trees-02-1x.png',
    scale: 1
  })

  // Create an icon for each location we get from Google Sheets
  _.each(locations, function(location){
    icon(location)
  })

  map.setCenter(grid[21][27].center())
}