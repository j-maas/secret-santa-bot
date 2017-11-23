const Markup = require('telegraf/markup')
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
    const message = this.getStatusMessage(false)
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

  async updateAllStatusMessages(ctx, isClosed) {
    this.messages.forEach(inline_message_id => this.updateStatusMessage(ctx, inline_message_id, isClosed))
  }

  async updateStatusMessage (ctx, inline_message_id, isClosed) {
    const message = this.getStatusMessage(isClosed)
    try {
      await ctx.telegram.callApi('editMessageText', Object.assign({
        inline_message_id: inline_message_id,
        text: message.messageText,
      }, message.markup.extra()))
    } catch (e) {
      if (e instanceof TelegramError && e.response.description === 'Bad Request: message is not modified') {
        console.warn("Ignored failed edit: ", e)
      } else {
        throw e
      }
    }
  }

  getUsersList() {
    return this.users.map(user => `\t - ${this.getUserName(user)}`).join('\n')
  }

  getUserName(user) {
    let output = `${user.first_name}`
    if (user.last_name) {
      output += ` ${user.last_name}`
    }
    if (user.username) {
      if (user.username.length > 16) {
        output += ` (${user.username.substring(0, 16)}…)`
      } else {
        output += ` (${user.username.substring(0, 16)})`
      }
    }
    return output
  }

  getStatusMessage (isClosed) {
    const intro = isClosed ? `Done! The secret santa circle is now closed and has the following ${this.users.length} members:\n`
      : `The secret santa circle has the following ${this.users.length} members:\n`
    return {
      messageText: intro +  this.getUsersList(),
      markup: isClosed ? Markup.inlineKeyboard([Markup.urlButton('See your child', 'https://telegram.me/Y0hy0hTestBot?start=child')])
        : Markup.inlineKeyboard([Markup.callbackButton('Join', 'join')]),
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
    ctx.reply("Closed the circle with members:\n" + this.getUsersList())
  }
}

module.exports = {SecretSantaHandler}