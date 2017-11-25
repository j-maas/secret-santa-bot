const express = require('express')
const app = express()

const startServer = function () {
  app.use(express.static('public'))

  const listener = app.listen(process.env.PORT, function () {
    console.log('Your app is listening on port ' + listener.address().port)
  })
}

module.exports = {startServer}

