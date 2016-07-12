'use strict'

/**
 * Piggy-back the built-in `net` module to automaticly registers and un-register
 * the UDP ports
 */

const Socket_prototype = require('dgram').Socket.prototype

const registerPort = require('./registerPort')


Socket_prototype.bind = registerPort(Socket_prototype.bind)
