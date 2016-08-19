var whacko = require('whacko')
var request = require('request')
var dataConverter = require('./data_converter.js')

function run (db, callbackScraper) {
  var counter = 0
  var policy = 1000
  var numberOfPages = 0

  fetchPage('http://services.gov.ng/agencies', getAgencies)

  function fetchPage (url, callback) {
    request(url, function (error, response, body) {
      if (error) {
        console.log('Error requesting page: ' + error)
        return
      }

      callback(body)
    })
  }

  function getAgencies (body) {
    var $ = whacko.load(body)

    var agencies = []

    $('.menu.index-list').children('li').children('a').each(function () {
      agencies.push('http://services.gov.ng' + $(this).attr('href'))
    })

    numberOfPages = agencies.length

    $ = undefined

    agencies.forEach(function (link) {
      counter += policy
      setTimeout(function () {
        console.log('services.gov.ng - Get Page: ' + link)
        getAgencyInformation(link)
      }, counter)
    })
  }

  function getAgencyInformation (link) {
    fetchPage(link, function (body) {
      var $ = whacko.load(body)

      var databaseObject = {}

      databaseObject['type'] = 'Government Institutions'
      databaseObject['name'] = $('h2').eq(0).text().trim()

      var information = $('#bodytext').children('ul').children('li')

      information.each(function () {
        var content = $(this).text().split(':')

        content = content.reduce(function (newArray, element) {
          var newElement = element.trim()
          if (newElement !== '') {
            newArray.push(newElement)
          }
          return newArray
        }, [])

        var key = content[0].toLowerCase()

        if (key === 'address') {
          databaseObject['address'] = content[1]
        } else if (key === 'telephone') {
          databaseObject = dataConverter.convertTelephone(content[1], databaseObject)
        } else if (key === 'website') {
          databaseObject['website'] = content[1]
        }
      })

      $ = undefined

      db.insertRow(databaseObject)

      numberOfPages -= 1
      if (numberOfPages === 0) {
        if (typeof callbackScraper === 'function') {
          callbackScraper()
        }
      }
    })
  }
}

module.exports.run = run
