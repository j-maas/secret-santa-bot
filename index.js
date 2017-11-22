const Telegraf = require('telegraf')
const Markup = require('telegraf/markup')

const util = require('util')

const bot = new Telegraf(process.env.BOT_TOKEN)

const users = []
let matches = {}
const messages = []

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
  const currentUserId = ctx.from.id
  console.log('listing:', matches, currentUserId)
  if (Object.keys(matches).includes(currentUserId.toString())) {
    return ctx.reply(`Your child is ${matches[currentUserId].first_name}.`)
  }
}

bot.start(listChildren, async (ctx) => {if (ctx.chat.type === 'private') return listChildren(ctx)})
bot.command('child', listChildren)

bot.on('inline_query', async ({inlineQuery, answerInlineQuery}) => {
  const offset = parseInt(inlineQuery.offset) || 0
  const responses = [{
    type: 'article',
    id: 1,
    title: 'Secret Santa Group',
    input_message_content: {
      message_text: 'Your secret santa circle is opened.',
    },
    reply_markup: Markup.inlineKeyboard(
      [
        Markup.callbackButton('Join', 'join'),
      ]
    )
  }]

  const results = responses.splice(offset)
  return answerInlineQuery(results, {next_offset: offset + results.length, cache_time: 0})
})

bot.on('chosen_inline_result', async ({chosenInlineResult}) => {
  messages.push(chosenInlineResult.inline_message_id)
  console.log('-------->', messages)
})

bot.action('join', async (ctx) => {
  const user = ctx.from
  const same_user_in_list = users.filter(user => user.id === ctx.from.id)
  // console.log(util.inspect(same_user_in_list, {depth: 5}))
  if (same_user_in_list.length === 0) {
    users.push(user)
  }
  const messageText = "The secret santa circle has the following members:\n\n" + users.map(user => '\t - ' + user.first_name).join('\n')
  await ctx.telegram.callApi('editMessageText', Object.assign({
    inline_message_id: ctx.callbackQuery.inline_message_id,
    text: messageText,
  }, Markup.inlineKeyboard([Markup.callbackButton('Join', 'join')]).extra()))
  return ctx.answerCbQuery()
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

bot.command('close', async (ctx) => {
  matches = match(Array.from(users))

  messages.forEach(inline_message_id => ctx.telegram.callApi('editMessageText', Object.assign({
    inline_message_id: inline_message_id,
    text: users.map(user => user.first_name),
  }, Markup.inlineKeyboard([Markup.urlButton('See your child', 'https://telegram.me/Y0hy0hTestBot?start=child')]).extra())))

})

bot.startPolling()
