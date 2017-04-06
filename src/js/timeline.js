'use strict'

$(document).ready(function(){
 $.get('https://sheets.googleapis.com/v4/spreadsheets/13p39TFniybEyVyRC3rXVy4LqQoyhaYWzDEAxvVjtmcY/values/A2:F1000?key=AIzaSyDYJz8OrCDgorY7SE0YYt4oodcs3TIaV6c', function(data) {
  var keys = [
    'date',
    'title',
    'description',
    'summary',
    'team',
    'theme',
    'focus'
  ]

  var adventures = []
  var json = {
    events: []
  }
  var options = {
    // debug: true,
    hash_bookmark: true,
    ga_property_id: 'UA-4718623-20',
    scale_factor: 1.5
  }

  // Add keys to each cell
  _.each(data.values, function(row) {
    var r = {}
    _.each(row, function(value, index) {
      r[keys[index]] = value
    })
    adventures.push(r)
  })

  // Cycle through adventures and format them for timeline
  _.each(adventures, function(adventure) {

    var text = [
      adventure.team,
      adventure.description,
      '<a href="' + adventure.summary + '">Read in full</a>'
    ]

    if(moment(adventure.date, 'MMM D').format('D') == 'Invalid date') {
      console.log('Invalid date', adventure)
    }
    else {
      json.events.push({
        // media: {
        //   url: '<iframe src="/map/?embed&focus=' + adventure.focus + '"></iframe>',
        //   caption: "Houston's mother and Gospel singer, Cissy Houston (left) and cousin Dionne Warwick."
        // },
        start_date: {
          month: moment(adventure.date, 'MMM D').format('M'),
          day: moment(adventure.date, 'MMM D').format('D'),
          year: '2017'
        },
        text: {
          headline: adventure.title,
          text: '<p>' + text.join('</p><p>') + '</p>'
        },
        // group: adventure.theme
      })
    }
  })

  window.timeline = new TL.Timeline('timeline-embed', json, options)

 })
})