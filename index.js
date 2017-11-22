const Telegraf = require('telegraf')
const Markup = require('telegraf/markup')

const util = require('util')

const bot = new Telegraf(process.env.BOT_TOKEN)

async function log_middleware (ctx, next) {
  console.log('===================================================')
  console.log('Incoming:\n', util.inspect(ctx.update, {depth: 5}))
  console.log('- - - - - - - - - - - - - - - - - - - - - - - - - -')
  console.log('Outgoing:\n', await next())
  console.log('===================================================')
}

bot.use(log_middleware)

async function catch_error (ctx, next) {
  let result = null
  try {
    result = await next()
  } catch (e) {
    console.error(e)
  }
  return result
}

bot.use(catch_error)

bot.start((ctx) => {
  return ctx.reply(
    'Your secret santa circle is opened.',
    Markup.inlineKeyboard(
      [Markup.callbackButton('Join', 'join')]
    ).extra()
  )
})

bot.action('join', async (ctx) => {
  return ctx.answerCbQuery('You will be added. Maybe.')
})

bot.startPolling()
