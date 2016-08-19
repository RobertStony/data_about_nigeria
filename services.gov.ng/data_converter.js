var DataConverter = function () {}

DataConverter.prototype.convertTelephone = function (value, dataObject) {
  var telephones = getOrElse(value, '').split(',').map(function (telephone) {
    return telephone.trim()
  }).filter(function (telephone) {
    return telephone !== ''
  })

  if (telephones.length !== 0) {
    insertIntoDataObject('telephone', telephones, dataObject)
  }
}

function insertIntoDataObject (key, values, dataObject) {
  if (values.length > 1) {
    dataObject[key] = values.shift()
    values.forEach(function (element, index) {
      dataObject[key + (index + 2)] = element
    })
  } else if (values.length === 1) {
    dataObject[key] = values[0]
  }
}

function getOrElse (value, elseValue) {
  if (typeof value === 'undefined' || value === null) {
    return elseValue
  } else {
    return value
  }
}

module.exports = new DataConverter()
