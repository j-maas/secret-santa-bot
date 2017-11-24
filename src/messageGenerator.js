const Markup = require('telegraf/markup')

class MessageGenerator {
  static getStatusMessage (users, isClosed) {
    if (isClosed) {
      return {
        messageText: `Done! The secret santa circle is now closed and has the following ${users.length} members:\n` + MessageGenerator.getUsersList(users),
        markup: Markup.inlineKeyboard([Markup.urlButton('See your child', 'https://telegram.me/Y0hy0hTestBot?start=child')]),
      }
    } else {
      return {
        messageText: `The secret santa circle has the following ${users.length} members:\n` + MessageGenerator.getUsersList(users),
        markup: Markup.inlineKeyboard([Markup.callbackButton('Join', 'join')]),
      }
    }
  }

  static getUsersList (users) {
    return users.map(user => `\t - ${MessageGenerator.getUserName(user)}`).join('\n')
  }

  static getUserName (user) {
    let output = `${user.first_name}`
    if (user.last_name) {
      output += ` ${user.last_name}`
    }
    if (user.username) {
      const maxLength = 16
      if (user.username.length > maxLength) {
        output += ` (${user.username.substring(0, maxLength)}…)`
      } else {
        output += ` (${user.username.substring(0, maxLength)})`
      }
    }
    return output
  }
}

module.exports = {MessageGenerator}