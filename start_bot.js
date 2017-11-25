const Telegraf = require('telegraf')
const util = require('util')
const {SecretSantaHandler} = require('./src/secretSantaHandler')

const startBot = async function () {
  const bot = new Telegraf(process.env.BOT_TOKEN)
  bot.use(log_middleware)
  bot.use(catch_error)

  const handler = new SecretSantaHandler()
  await handler.registerToBot(bot)

  bot.startPolling()
  console.log('Your bot is polling.')
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
