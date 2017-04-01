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

    var markerLabel = {
      text: options.title,
      color: '#fff',
      // fontWeight: 'bold'
      fontSize: '11px'
    }

    var markerOpacity = 1

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
      label: markerLabel,
      opacity: markerOpacity
    })

    google.maps.event.addListener(map, 'zoom_changed', function() {
      // Resize label on zoom
      markerLabel.fontSize = map.getZoom() + 'px'
      // Hide labels at higher zoom levels
      if(map.getZoom() < 12) {
        markerOpacity = 0
      }
      else {
        markerOpacity = 1
      }
      marker.setOptions({
        label: markerLabel,
        opacity: markerOpacity
      })
    })

    var infowindow = new google.maps.InfoWindow({
      content: '<h2>' + options.title + '</h2><p>' + options.description + '</p>'
    })

    google.maps.event.addListener(hex, 'mouseover', function() {
      marker.setOptions({
        opacity: 1
      })
      ga('send', 'event', 'Icon', 'MouseOver', options.title)
    })

    google.maps.event.addListener(hex, 'mouseout', function() {
      marker.setOptions({
        opacity: markerOpacity
      })
    })

    google.maps.event.addListener(hex, 'click', function() {
      infowindow.open(map, marker)
      ga('send', 'event', 'Icon', 'Click', options.title)
    })

    google.maps.event.addListener(marker, 'click', function() {
      infowindow.open(map, marker)
      ga('send', 'event', 'Marker', 'Click', options.title)
    })
  }
}