'use strict'

/**
 * Piggy-back the built-in `net` module to automaticly registers and un-register
 * the TCP ports
 */

const Server_prototype = require('net').Server.prototype

const registerPort = require('./registerPort')


Server_prototype.listen = registerPort(Server_prototype.listen)
