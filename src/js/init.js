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
    'img/textures/land-2-1x.jpg',
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

  icon({
    x: 13,
    y: 28,
    icon: 'img/icons/marker-icon-01-1x.png',
    scale: 0.25,
    title: 'Scattered Islands',
    description: 'small islands scattered about'
  })

  // Draw Northern Mountains
  for(var x = 0; x < 10; x++) {
    for(var y = 0; y < 4; y++) {
      new IconOverlay(
        grid[16 + x * 3][39 - y * 1].bounds(),
        'img/patterns/mountains-0' + getRandomInt(1, 9) + '-1x.png',
        map,
        4
      )
      new IconOverlay(
        grid[17 + x * 3][39 - y * 1].bounds(),
        'img/patterns/mountains-0' + getRandomInt(1, 9) + '-1x.png',
        map,
        4
      )
    }
  }
  icon({
    x: 28,
    y: 38,
    icon: 'img/icons/marker-icon-01-1x.png',
    scale: 1,
    title: 'Distant Mountains',
    description: 'To the north you can see a sprawling mountain range in the distance'
  })

  // Draw Western Hills
  for(var x = 0; x < 2; x++) {
    for(var y = 0; y < 10; y++) {
      new IconOverlay(
        grid[38 + x * 4][35 - y * 2].bounds(),
        'img/patterns/hills-1x.png',
        map,
        3
      )
      new IconOverlay(
        grid[39 + x * 4][34 - y * 2].bounds(),
        'img/patterns/hills-1x.png',
        map,
        2.5
      )
      new IconOverlay(
        grid[40 + x * 4][34 - y * 2].bounds(),
        'img/patterns/hills-1x.png',
        map,
        2
      )
    }
  }
  icon({
    x: 40,
    y: 27,
    icon: 'img/icons/marker-icon-01-1x.png',
    scale: 1,
    title: 'Distant Hills',
    description: 'to the east mostly flat lands with some rolling hills blocking further view past'
  })

  // Draw Southern Woods
  icon({
    x: 28,
    y: 20,
    icon: 'img/icons/marker-icon-01-1x.png',
    scale: 0.25,
    title: 'Woods',
    description: 'Woods close by Haven'
  })
  for(var x = 0; x < 8; x++) {
    for(var y = 0; y < 2; y++) {
      new IconOverlay(
        grid[24 + x][20 - y].bounds(),
        'img/patterns/trees-0' + getRandomInt(1, 5) + '-1x.png',
        map,
        1
      )
    }
  }

  // Draw North East Woods
  for(var x = 0; x < 7; x++) {
    for(var y = 0; y < 2; y++) {
      new IconOverlay(
        grid[31 + x][34 - y].bounds(),
        'img/patterns/trees-0' + getRandomInt(1, 5) + '-1x.png',
        map,
        1
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
      map,
      1.25
    )
  })

  // Draw docks
  icon({
    x: 19,
    y: 28,
    icon: 'img/icons/dock-01-1x.png',
    scale: 1.25,
    title: 'Docks',
    description: 'ruins of a once majestic city’s dockyards district.'
  })

  // Draw temple
  icon({
    x: 22,
    y: 31,
    icon: 'img/icons/temple-01-1x.png',
    scale: 1.5,
    title: 'Cathedral',
    description: 'lone building still standing is a cathedral you can see on the far edge of the city'
  })

  // Draw town of Haven
  icon({
    x: 21,
    y: 27,
    icon: 'img/icons/town-01-1x.png',
    scale: 2,
    title: 'Town of Haven',
    description: 'The town, mostly human bar a few Halflings, are very welcoming to the sudden influx of strange adventures. The town deems to have the basic infrastructure of full village including farms, blacksmith, tavern, fletcher and a rundown guild hall. Due to the large population increase the town folk have put you up in a large warehouse. While exploring the town, being an adventurer, the notice board outside the tavern has caught your eye. The largely empty board has the following information written in notes of varying age. [Source](https://www.reddit.com/r/TheAshesOfAnEmpire/comments/5yng5m/adventure_start_box_text/)'
  })

  // Draw windmill
  icon({
    x: 26,
    y: 25,
    icon: 'img/icons/windmill-01-1x.png',
    scale: 1.5,
    title: 'The Mill',
    description: 'TBC'
  })

  // Swamp
  grid[27][24].setOptions(style.sea)
  icon({
    x: 27,
    y: 24,
    icon: 'img/icons/marker-icon-01-1x.png',
    scale: 0.25,
    title: 'Swamp',
    description: 'Beside mill'
  })

  // Draw The Manor
  icon({
    x: 23,
    y: 23,
    icon: 'img/icons/tower-01-1x.png',
    scale: 1.5,
    title: 'The Manor',
    description: 'The Manor its just south east past the logging camp.'
  })

  // Draw Logging Camp
  icon({
    x: 22,
    y: 25,
    icon: 'img/icons/outpost-01-1x.png',
    scale: 1.5,
    title: 'Logging Camp',
    description: 'south east past the logging camp. VERY abandoned the yard looked hunky-dorey'
  })
  // Logging Woods
  icon({
    x: 21,
    y: 24,
    icon: 'img/patterns/trees-01-1x.png',
    scale: 1
  })
  icon({
    x: 22,
    y: 24,
    icon: 'img/patterns/trees-02-1x.png',
    scale: 1
  })

  // Draw Farm
  icon({
    x: 27,
    y: 27,
    icon: 'img/icons/village-01-1x.png',
    scale: 1.5,
    title: 'Farm',
    description: 'Halfling farm'
  })

  // Draw Sea Fort
  icon({
    x: 13,
    y: 20,
    icon: 'img/icons/tower-02-1x.png',
    scale: 1.5,
    title: 'Sea Fort',
    description: 'When I sailed into Haven I noticed a small island/ruin off to the south on my approach, at the time I thought nothing of it however we found some letters in the manor which suggest that the island is actually a fort. [Source](https://www.reddit.com/r/TheAshesOfAnEmpire/comments/616ltl/sea_fort/)'
  })

  // Draw The Quarry
  icon({
    x: 24,
    y: 26,
    icon: 'img/icons/outpost-01-1x.png',
    scale: 1.5,
    title: 'The Quarry',
    description: 'We have had no reports of what has taken over the quarry, as it was only abandoned by us this last week after running out of people to man it, and no-one spare to scout it out. As for the stone there is a seem of solid lime with a touch of slate. [Source](https://www.reddit.com/r/TheAshesOfAnEmpire/comments/5yng5m/adventure_start_box_text/deru3cw/)'
  })

  // Draw Goblin Seige Workshop
  icon({
    x: 28,
    y: 21,
    icon: 'img/icons/orc-citadel-01-1x.png',
    scale: 1,
    title: 'Goblin Seige Workshop',
    description: 'Klarg, assuming all has gone well at the mine, this package is to inform you of the on going operaitions so you can divert materials. The warg training camp in in need of new metal for chains to hold the buggers. The seige workshop will be needing 80% of all exports so we can finally get past that wall at haven. Some metal will be needed for the training camp as the new recruits lack proper equipment. Follwing these plans and with these camps active, it will make sure our new stronghold will be un-beatable [Source](https://www.reddit.com/r/TheAshesOfAnEmpire/comments/60624f/goblin_strongbox/)'
  })

  // Draw Warg Training Camp'
  icon({
    x: 26,
    y: 23,
    icon: 'img/icons/orc-town-01-1x.png',
    scale: 1.25,
    title: 'Warg Training Camp',
    description: 'Klarg, assuming all has gone well at the mine, this package is to inform you of the on going operaitions so you can divert materials. The warg training camp in in need of new metal for chains to hold the buggers. The seige workshop will be needing 80% of all exports so we can finally get past that wall at haven. Some metal will be needed for the training camp as the new recruits lack proper equipment. Follwing these plans and with these camps active, it will make sure our new stronghold will be un-beatable [Source](https://www.reddit.com/r/TheAshesOfAnEmpire/comments/60624f/goblin_strongbox/)'
  })


  map.setCenter(grid[21][27].center())
}

google.maps.event.addDomListener(window, 'load', initMap);