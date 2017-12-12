# Santa's Secret Bot

[![Telegram @santasSecretBot](https://img.shields.io/badge/Telegram-%40santasSecretBot-blue.svg)](https://t.me/santasSecretBot)
[![Glitch santas-secret-bot](https://img.shields.io/badge/Glitch-santas--secret--bot-fa6972.svg)](https://santas-secret-bot.glitch.me)
[![JavaScript Style Guide](https://img.shields.io/badge/code_style-standard-brightgreen.svg)](https://github.com/standard/standard)

A Telegram bot for organizing secret santa gatherings.

## Run it yourself
You need to have a [bot account][Bots] registered and
an associated [token][generate token], in order to run the bot
yourself.

Don't forget to activate the [inline mode] as well as
[100% inline feedback][inline feedback] for your bot to work properly.

### Remix it on Glitch
You can easily get hold of the code and run it on Glitch:

[<img src="https://cdn.glitch.com/2bdfb3f8-05ef-4035-a06e-2043962a3a13%2Fremix-button.svg?1504724691606" alt="remix button" aria-label="remix" width="124">](https://glitch.com/edit/#!/remix/santas-secret-bot)

### Running it on your machine
Running this bot requires [Node.js].

Download the source code and execute `npm start`. Make sure that the
token is set as an environment variable with the name `BOT_TOKEN`.
E. g., if your token is `123:ABC`, run:
```
BOT_TOKEN="123:ABC" npm start
```


[Node.js]: https://nodejs.org/en/
[Bots]: https://core.telegram.org/bots
[generate token]: https://core.telegram.org/bots#generating-an-authorization-token
[inline mode]: https://core.telegram.org/bots/inline
[inline feedback]: https://core.telegram.org/bots/inline#collecting-feedback