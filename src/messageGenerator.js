const Markup = require('telegraf/markup')

class MessageGenerator {
  static getStatusMessage (users, isClosed) {
    const intro = isClosed ? `Done! The secret santa circle is now closed and has the following ${users.length} members:\n`
      : `The secret santa circle has the following ${users.length} members:\n`
    return {
      messageText: intro + MessageGenerator.getUsersList(users),
      markup: isClosed ? Markup.inlineKeyboard([Markup.urlButton('See your child', 'https://telegram.me/Y0hy0hTestBot?start=child')])
        : Markup.inlineKeyboard([Markup.callbackButton('Join', 'join')]),
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
      if (user.username.length > 16) {
        output += ` (${user.username.substring(0, 16)}…)`
      } else {
        output += ` (${user.username.substring(0, 16)})`
      }
    }
    return output
  }
}

module.exports = {MessageGenerator}