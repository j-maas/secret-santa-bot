const util = require('util')
const Markup = require('telegraf/markup')

class SecretSantaHandler {
  constructor () {
    this.users = []
    this.matches = {}
    this.messages = []
  }

  registerToBot (bot) {
    bot.use(this.log_middleware)
    bot.use(this.catch_error)
    bot.start(async (ctx) => {if (ctx.chat.type === 'private') return this.listChildren(ctx)})
    bot.command('child', this.listChildren)
    bot.on('inline_query', ({inlineQuery, answerInlineQuery}) => this.inlineQuery(inlineQuery, answerInlineQuery))
    bot.on('chosen_inline_result', ({chosenInlineResult}) => this.chosenInlineResult(chosenInlineResult))
    bot.action('join', (ctx) => this.join(ctx))
    bot.command('close', (ctx) => this.close(ctx))
  }

  async log_middleware (ctx, next) {
    console.log('===================================================')
    console.log('Incoming:\n', util.inspect(ctx.update, {depth: 5}))
    console.log('- - - - - - - - - - - - - - - - - - - - - - - - - -')
    console.log('Outgoing:\n', await next())
    console.log('===================================================')
  }

  async catch_error (ctx, next) {
    let result = null
    try {
      result = await next()
    } catch (e) {
      console.error(e)
    }
    return result
  }

  async listChildren (ctx) {
    const currentUserId = ctx.from.id
    if (Object.keys(this.matches).includes(currentUserId.toString())) {
      return ctx.reply(`Your child is ${this.matches[currentUserId].first_name}.`)
    }
  }

  async inlineQuery (inlineQuery, answerInlineQuery) {
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
  }

  async chosenInlineResult (chosenInlineResult) {
    this.messages.push(chosenInlineResult.inline_message_id)
  }

  async join (ctx) {
    const user = ctx.from
    const same_user_in_list = this.users.filter(user => user.id === ctx.from.id)
    if (same_user_in_list.length === 0) {
      this.users.push(user)
    }
    const messageText = 'The secret santa circle has the following members:\n\n' + this.users.map(user => '\t - ' + user.first_name).join('\n')
    await ctx.telegram.callApi('editMessageText', Object.assign({
      inline_message_id: ctx.callbackQuery.inline_message_id,
      text: messageText,
    }, Markup.inlineKeyboard([Markup.callbackButton('Join', 'join')]).extra()))
    return ctx.answerCbQuery()
  }

  shuffle (array) {
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

  match (toMatch) {
    const matches = {}
    toMatch = this.shuffle(toMatch)
    toMatch.forEach((user, index) => matches[user.id] = toMatch[(index + 1) % toMatch.length])
    return matches
  }

  async close (ctx) {
    this.matches = this.match(Array.from(this.users))

    this.messages.forEach(inline_message_id => ctx.telegram.callApi('editMessageText', Object.assign({
      inline_message_id: inline_message_id,
      text: this.users.map(user => user.first_name),
    }, Markup.inlineKeyboard([Markup.urlButton('See your child', 'https://telegram.me/Y0hy0hTestBot?start=child')]).extra())))
  }
}

module.exports = { SecretSantaHandler }