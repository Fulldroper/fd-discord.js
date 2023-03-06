const WebSocket = require("ws")
const HttpsProxyAgent = require('https-proxy-agent');
/**
 * Creationg discord bot
 */
module.exports = class {
  /**
   * Creationg discord bot client
   * @param {Object} options settings of client
   * @param {String} options.token client token **required parameter*
   * @param {Boolean} options.bot is A bot token (default `true`)
   * @param {String} options.proxy use proxy for connection `url`
   * @param {String} options.ws_gateway discord websocket gateway
   * @param {Number} options.ws_version discord api vercion
   * @param {String} options.ws_encoding discord websocket encoding (in commin)
   * @param {String} options.os discord client os
   * @param {String} options.browser discord client browser
   * @param {Boolean} options.debug use debug mode
   */
  constructor(options){
    const { 
      token = false,
      bot = true,
      proxy = false,
      ws_gateway = "gateway.discord.gg",
      ws_version = 9,
      ws_encoding ="json",
      os = "linux",
      browser = "Firefox",
      debug = false,
    } = options
    // teowing when token not found
    if (!token) throw "Empty token"
    // mouting ws options
    const ws_options = {

    }
    // setup proxy if exist
    proxy && (ws_options.agent = new HttpsProxyAgent(proxy))
    // creating connection
    this.client = new WebSocket(`wss://${ws_gateway}?v=${ws_version}&encoding=${ws_encoding}`, ws_options)
    // creationg peyload
    this.payload = {
      op: 2,
      d: {
        token: `${bot ? "Bot ": ''}${token}`,      
        properties: { os, browser}
      }
    }
    // if bot add intents
    bot && (this.payload.d.intents = 513)
    // register heatbeat private method
    this._heartbeat = function ({heartbeat_interval}) {
      const beat = function() {
        this.send(`{"op":2}`)
      }
      this.heartbeat = setInterval(beat.bind(this.client), heartbeat_interval)
    }
    // register session
    const register_session = function() {
      this.client.send(JSON.stringify(this.payload))
    }
    this.client.on("open",register_session.bind({client: this.client, payload: this.payload}))
    // emiting events
    const emiting_events = function (i) {
      // parse input date
      const {t, op, d} = JSON.parse(i.toString());
      // save session
      if (t === "READY") {
        this.user = {...d.user, session_id: d.session_id}
      }
      // check if need heatbeat else emit event
      if (op === 10) {
        this._heartbeat(d);
      } else this.client.emit(t, d);
    }
    this.client.on('message', emiting_events.bind(this))
  }
  /**
   * Listen bot events [list](https://discord.com/developers/docs/topics/gateway#list-of-intents)
   * @param {String} eventName event namme
   * @param {Function} fn function executing when event emit
   */
  on(eventName, fn){
    this.client.on(eventName, fn.bind(this))
  }
}