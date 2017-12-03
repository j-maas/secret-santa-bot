const Markup = require('telegraf/markup')

export class MessageGenerator {
    static getStatusMessage(users, isClosed: boolean, botName: string): MessageTemplate {
        if (isClosed) {
            return new MessageTemplate(
                `Done! The secret santa circle is now closed`
                + ` and has the following ${users.length} members:\n`
                + MessageGenerator.getUsersList(users),
                Markup.inlineKeyboard([
                                          Markup.urlButton(
                                              'See your child',
                                              `https://telegram.me/${botName}?start=child`,
                                          ),
                                      ]),
            )
        } else {
            return new MessageTemplate(
                `The secret santa circle has the following ${users.length} members:\n`
                + MessageGenerator.getUsersList(users),
                Markup.inlineKeyboard([Markup.callbackButton('Join', 'join')]),
            )
        }
    }

    static getUsersList(users): string {
        return users.map(user => `\t - ${MessageGenerator.getUserName(user)}`).join('\n')
    }

    static getUserName(user): string {
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

export class MessageTemplate {
    constructor(
        public messageText: string,
        public markup,
    ) {}
}
