var whacko = require('whacko')
var request = require('request')

function run (db, callbackScraper) {
  console.log('health.gov.ng - http://www.health.gov.ng/index.php/parastatals')
  fetchPage('http://www.health.gov.ng/index.php/parastatals', getHospitals)

  function fetchPage (url, callback) {
    request(url, function (error, response, body) {
      if (error) {
        console.log('Error requesting page: ' + error)
        return
      }

      callback(body)
    })
  }

  function getHospitals (body) {
    var $ = whacko.load(body)

    $('.MsoNormalTable tbody').children('tr').slice(1).each(function () {
      var name = $(this).children('td').eq(1).children('p').text().trim()
      if (name !== 'Name of Hospital') {
        var databaseObject = {}
        databaseObject['name'] = name
        databaseObject['city'] = $(this).children('td').eq(2).children('p').text().trim()
        databaseObject['region'] = $(this).children('td').eq(3).children('p').text().trim()
        databaseObject['type'] = 'hospital'
        console.log(databaseObject)
        db.insertRow(databaseObject)
      }
    })
    if (typeof callbackScraper === 'function') {
      callbackScraper()
    }
    $ = undefined
  }
}

module.exports.run = run
