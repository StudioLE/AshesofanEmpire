'use strict'

var overlay
IconOverlay.prototype = new google.maps.OverlayView()

/** @constructor */
function IconOverlay(bounds, image, map, scale) {

  // Initialize all properties.
  this.bounds_ = bounds
  this.image_ = image
  this.map_ = map
  this.scale_ = scale || 1

  // Define a property to hold the image's div. We'll
  // actually create this div upon receipt of the onAdd()
  // method so we'll leave it null for now.
  this.div_ = null

  // Explicitly call setMap on this overlay.
  this.setMap(map)
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

  var width = (ne.x - sw.x) * this.scale_
  var height = (sw.y - ne.y) * this.scale_


  div.style.left = sw.x + 'px'
  div.style.top = ne.y + 'px'
  div.style.width = width + 'px'
  div.style.height = height + 'px'

  if(this.scale_ !== 1) {
    div.style.left = sw.x - width / (2 * this.scale_) + 'px'
    div.style.top = ne.y - height / (2 * this.scale_) + 'px'
  }

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