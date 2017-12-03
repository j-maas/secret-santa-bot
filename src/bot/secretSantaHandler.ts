import { MessageGenerator } from './messageGenerator';
import { SecretSantaCircle } from './secretSantaCircle';

const TelegramError = require('telegraf/core/network/error');

export class SecretSantaHandler {
    private circle = new SecretSantaCircle();
    private messages: Array<string> = [];
    private botName: string;

    async registerToBot(bot) {
        bot.start(async (ctx) => {if (ctx.chat.type === 'private') return this.childCommand(ctx);});
        bot.command('child', this.childCommand);
        bot.on('inline_query', ({inlineQuery, answerInlineQuery}) => this.inlineQuery(inlineQuery, answerInlineQuery));
        bot.on('chosen_inline_result', ({chosenInlineResult}) => this.chosenInlineResult(chosenInlineResult));
        bot.action('join', (ctx) => this.joinAction(ctx));
        bot.command('close', (ctx) => this.closeCommand(ctx));

        const me = await bot.telegram.getMe();
        this.botName = me.username;
    }

    async childCommand(ctx) {
        const child = this.circle.getChildOf(ctx.from);
        if (child) {
            return ctx.reply(`Your child is ${child.first_name}.`);
        }
    }

    async inlineQuery(inlineQuery, answerInlineQuery) {
        const offset = parseInt(inlineQuery.offset) || 0;
        const message = MessageGenerator.getStatusMessage(this.circle.users, false, this.botName);
        const responses = [{
            type: 'article',
            id: 1,
            title: 'Secret Santa Group',
            input_message_content: {
                message_text: message.messageText,
            },
            reply_markup: message.markup,
        }];

        const results = responses.splice(offset);
        return answerInlineQuery(results, {next_offset: offset + results.length, cache_time: 0});
    }

    async chosenInlineResult(chosenInlineResult) {
        this.messages.push(chosenInlineResult.inline_message_id);
    }

    async joinAction(ctx) {
        const user = ctx.from;
        this.circle.add(user);
        await this.updateAllStatusMessages(ctx, false);
        return ctx.answerCbQuery();
    }

    async updateAllStatusMessages(ctx, isClosed) {
        this.messages.forEach(inline_message_id => this.updateStatusMessage(ctx, inline_message_id, isClosed));
    }

    async updateStatusMessage(ctx, inline_message_id, isClosed) {
        const message = MessageGenerator.getStatusMessage(this.circle.users, isClosed, this.botName);
        try {
            await ctx.telegram.callApi('editMessageText', Object.assign({
                inline_message_id: inline_message_id,
                text: message.messageText,
            }, message.markup.extra()));
        } catch (e) {
            if (e instanceof TelegramError && e.response.description === 'Bad Request: message is not modified') {
                console.warn('Ignored failed edit: ', e);
            } else {
                throw e;
            }
        }
    }

    async closeCommand(ctx) {
        this.circle.matchChildren();

        await this.updateAllStatusMessages(ctx, true);
        ctx.reply('Closed the circle with members:\n' + MessageGenerator.getUsersList(this.circle.users));
    }
}
