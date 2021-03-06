'use strict'

var map, grid

var locations = []

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
    fillOpacity: 0.5,
    strokeColor: '#fff',
    strokeOpacity: 0.2,
    strokeWeight: 1,
    zIndex: 0
  }
}

var distances = {
  sea: {
    horizontal: 20
  }
}