const express = require('express')
const app = express()

const {startBot} = require('./start_bot')

app.use(express.static('public'));

const listener = app.listen(process.env.PORT, function () {
  console.log('Your app is listening on port ' + listener.address().port)
})

startBot()
