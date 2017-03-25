'use strict'

var overlay
IconOverlay.prototype = new google.maps.OverlayView()

/** @constructor */
function IconOverlay(bounds, image, map, scale) {

  // Initialize all properties.
  this.bounds_ = bounds.scale(scale || 1)
  this.image_ = image
  this.map_ = map

  // Define a property to hold the image's div. We'll
  // actually create this div upon receipt of the onAdd()
  // method so we'll leave it null for now.
  this.div_ = null

  // Explicitly call setMap on this overlay.
  this.setMap(map)

  return this
}

/**
 * onAdd is called when the map's panes are ready and the overlay has been
 * added to the map.
 */
IconOverlay.prototype.onAdd = function() {

  var div = document.createElement('div')
  div.style.borderStyle = 'none'
  div.style.borderWidth = '0px'
  div.style.position = 'absolute'
  div.style.zIndex = 30
  div.style.background = 'url(' + this.image_ + ') center center no-repeat'
  div.style.backgroundSize = 'contain'
  div.style.display = 'flex'
  div.style.alignItems = 'center';
  div.style.justifyContent = 'center';

  var h2 = document.createElement('h2')

  h2.innerHTML = 'Haven'

  div.appendChild(h2)

  this.div_ = div

  // Add the element to the "overlayLayer" pane.
  var panes = this.getPanes()
  panes.overlayLayer.appendChild(div)
}

IconOverlay.prototype.draw = function() {

  // We use the south-west and north-east
  // coordinates of the overlay to peg it to the correct position and size.
  // To do this, we need to retrieve the projection from the overlay.
  var overlayProjection = this.getProjection()

  // Retrieve the south-west and north-east coordinates of this overlay
  // in LatLngs and convert them to pixel coordinates.
  // We'll use these coordinates to resize the div.
  var sw = overlayProjection.fromLatLngToDivPixel(this.bounds_.getSouthWest())
  var ne = overlayProjection.fromLatLngToDivPixel(this.bounds_.getNorthEast())

  // Resize the image's div to fit the indicated dimensions.
  var div = this.div_
  div.style.left = sw.x + 'px'
  div.style.top = ne.y + 'px'
  div.style.width = (ne.x - sw.x) + 'px'
  div.style.height = (sw.y - ne.y) + 'px'

}

function getRandomInt(min, max) {
  min = Math.ceil(min)
  max = Math.floor(max)
  return Math.floor(Math.random() * (max - min)) + min
}

// The onRemove() method will be called automatically from the API if
// we ever set the overlay's map property to 'null'.
IconOverlay.prototype.onRemove = function() {
  this.div_.parentNode.removeChild(this.div_)
  this.div_ = null
}

var icon = function(options) {

  var hex = grid[options.x][options.y]

  var i = new IconOverlay(
    hex.bounds(),
    options.icon,
    map,
    options.scale
  )

  if(options.title) {

    var marker = new google.maps.Marker({
      position: hex.center(),
      map: map,
      icon: {
        path: google.maps.SymbolPath.CIRCLE,
        // scale: 5,
        fillOpacity: 0,
        fillColor: '#fff',
        // strokeOpacity: 0
      },
      label: {
        text: options.title,
        color: '#fff',
        // fontWeight: 'bold'
      },
      opacity: 0
    })

    var infowindow = new google.maps.InfoWindow({
      content: options.description
    })

    google.maps.event.addListener(hex, 'mouseover', function() {
      marker.setOptions({
        opacity: 1
      })
    })

    google.maps.event.addListener(hex, 'mouseout', function() {
      marker.setOptions({
        opacity: 0
      })
    })

    google.maps.event.addListener(hex, 'click', function() {
      infowindow.open(map, marker)
    })

    google.maps.event.addListener(marker, 'click', function() {
      infowindow.open(map, marker)
    })
  }
}