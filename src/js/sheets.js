'use strict'

$(document).ready(function(){
 $.get('https://sheets.googleapis.com/v4/spreadsheets/1Ne1_ZP_aLSxABksLBuiGaXOQryZwdIhf1fu8pYtNLoQ/values/A2:G1000?key=AIzaSyDYJz8OrCDgorY7SE0YYt4oodcs3TIaV6c', function(data) {
  var keys = [
    'id',
    'title',
    'description',
    'x',
    'y',
    'scale',
    'icon'
  ]

  // Add keys to each cell
  _.each(data.values, function(row) {
    var r = {}
    _.each(row, function(value, index) {
      r[keys[index]] = value
    })
    locations.push(r)
  })


  // Trigger Google Maps init event
  initMap()

 })
})