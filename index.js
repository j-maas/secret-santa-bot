const Telegraf = require('telegraf')
const Markup = require('telegraf/markup')

const util = require('util')

const bot = new Telegraf(process.env.BOT_TOKEN)

const users = []
let matches = {}

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

async function listChildren (ctx) {
  if (matches) {
    return ctx.reply(`Your child is ${matches[ctx.from.id].first_name}.`)
  }
}

bot.start(listChildren)
bot.command('child', listChildren)

bot.command('open', (ctx) => {
  return ctx.reply(
    'Your secret santa circle is opened.',
    Markup.inlineKeyboard(
      [
        Markup.callbackButton('Join', 'join'),
        Markup.callbackButton('Close', 'close'),
      ]
    ).extra()
  )
})

bot.action('join', async (ctx) => {
  const user = ctx.from
  const same_user_in_list = users.filter(user => user.id === ctx.from.id)
  // console.log(util.inspect(same_user_in_list, {depth: 5}))
  if (same_user_in_list.length === 0) {
    users.push(user)
  }
  console.log(util.inspect(users, {depth: 5}))
  return ctx.answerCbQuery('You will be added. Maybe.')
})

function shuffle (array) {
  let currentIndex = array.length, temporaryValue, randomIndex

  while (0 !== currentIndex) {
    randomIndex = Math.floor(Math.random() * currentIndex)
    currentIndex -= 1

    temporaryValue = array[currentIndex]
    array[currentIndex] = array[randomIndex]
    array[randomIndex] = temporaryValue
  }

  return array
}

function match (toMatch) {
  const matches = {}
  toMatch = shuffle(toMatch)
  toMatch.forEach((user, index) => matches[user.id] = toMatch[(index + 1) % toMatch.length])
  return matches
}

bot.action('close', async (ctx) => {
  matches = match(Array.from(users))
  console.log(util.inspect(matches, {depth: 5}))
  return ctx.answerCbQuery('Closed and matched.')
})

bot.startPolling()
