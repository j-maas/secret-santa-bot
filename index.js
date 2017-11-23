const Telegraf = require('telegraf')
const {SecretSantaHandler} = require('./secretSantaHandler')

const bot = new Telegraf(process.env.BOT_TOKEN)

const handler = new SecretSantaHandler()
handler.registerToBot(bot)

bot.startPolling()
