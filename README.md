# fd-discord
Simple light package for create discord bot

### Installation
```bash
npm i fd-discord
```
### example of use
```js
const bot = new (await require("fd-discord"))({
  token: TOKEN,
})

bot.on("READY", function(){
  // return user obj and session_id
  console.log(this.user);
})
// log messages
bot.on("MESSAGE_CREATE", console.log)
```
### [Event list](https://discord.com/developers/docs/topics/gateway-events#gateway-events)
