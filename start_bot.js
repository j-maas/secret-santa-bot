const Telegraf = require('telegraf')
const util = require('util')
const {SecretSantaHandler} = require('./src/secretSantaHandler')

const startBot = async function () {
  const token = process.env.BOT_TOKEN
  const bot = new Telegraf(token)
  bot.use(log_middleware)
  bot.use(catch_error)

  const handler = new SecretSantaHandler()
  await handler.registerToBot(bot)

  const domain = process.env.PROJECT_DOMAIN
  const host = `${domain}.glitch.me`
  const port = 8443
  const pathToFetchFrom = `/bot/${token}`
  await bot.telegram.setWebhook(`https://${host}${pathToFetchFrom}`)
  bot.startWebhook(`/`, null, port, 'localhost')
  console.log(`Your bot is listening on port ${port}.`)

  return {
    pathToFetchFrom: pathToFetchFrom,
    urlToRedirectTo: `localhost:${port}`,
  }
}

async function log_middleware (ctx, next) {
  console.log('===================================================')
  console.log('Incoming:\n', util.inspect(ctx.update, {depth: 5}))
  console.log('- - - - - - - - - - - - - - - - - - - - - - - - - -')
  console.log('Outgoing:\n', await next())
  console.log('===================================================')
}

async function catch_error (ctx, next) {
  let result = null
  try {
    result = await next()
  } catch (e) {
    console.error(e)
  }
  return result
}

module.exports = {startBot}
