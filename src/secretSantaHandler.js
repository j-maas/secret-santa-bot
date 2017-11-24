const {MessageGenerator} = require('./messageGenerator')
const TelegramError = require('telegraf/core/network/error')

class SecretSantaHandler {
  constructor () {
    this.users = []
    this.matches = {}
    this.messages = []
  }

  registerToBot (bot) {
    bot.start(async (ctx) => {if (ctx.chat.type === 'private') return this.childCommand(ctx)})
    bot.command('child', this.childCommand)
    bot.on('inline_query', ({inlineQuery, answerInlineQuery}) => this.inlineQuery(inlineQuery, answerInlineQuery))
    bot.on('chosen_inline_result', ({chosenInlineResult}) => this.chosenInlineResult(chosenInlineResult))
    bot.action('join', (ctx) => this.joinAction(ctx))
    bot.command('close', (ctx) => this.closeCommand(ctx))
  }

  async childCommand (ctx) {
    const currentUserId = ctx.from.id
    if (Object.keys(this.matches).includes(currentUserId.toString())) {
      return ctx.reply(`Your child is ${this.matches[currentUserId].first_name}.`)
    }
  }

  async inlineQuery (inlineQuery, answerInlineQuery) {
    const offset = parseInt(inlineQuery.offset) || 0
    const message = MessageGenerator.getStatusMessage(this.users, false)
    const responses = [{
      type: 'article',
      id: 1,
      title: 'Secret Santa Group',
      input_message_content: {
        message_text: message.messageText,
      },
      reply_markup: message.markup
    }]

    const results = responses.splice(offset)
    return answerInlineQuery(results, {next_offset: offset + results.length, cache_time: 0})
  }

  async chosenInlineResult (chosenInlineResult) {
    this.messages.push(chosenInlineResult.inline_message_id)
  }

  async joinAction (ctx) {
    const user = ctx.from
    const same_user_in_list = this.users.filter(user => user.id === ctx.from.id)
    if (same_user_in_list.length === 0) {
      this.users.push(user)
    }
    await this.updateAllStatusMessages(ctx, false)
    return ctx.answerCbQuery()
  }

  async updateAllStatusMessages (ctx, isClosed) {
    this.messages.forEach(inline_message_id => this.updateStatusMessage(ctx, inline_message_id, isClosed))
  }

  async updateStatusMessage (ctx, inline_message_id, isClosed) {
    const message = MessageGenerator.getStatusMessage(this.users, isClosed)
    try {
      await ctx.telegram.callApi('editMessageText', Object.assign({
        inline_message_id: inline_message_id,
        text: message.messageText,
      }, message.markup.extra()))
    } catch (e) {
      if (e instanceof TelegramError && e.response.description === 'Bad Request: message is not modified') {
        console.warn('Ignored failed edit: ', e)
      } else {
        throw e
      }
    }
  }

  shuffle (array) {
    // Code from https://stackoverflow.com/a/2450976/3287963
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

  async closeCommand (ctx) {
    this.matches = this.match(Array.from(this.users))

    await this.updateAllStatusMessages(ctx, true)
    ctx.reply('Closed the circle with members:\n' + MessageGenerator.getUsersList(this.users))
  }
}

module.exports = {SecretSantaHandler}