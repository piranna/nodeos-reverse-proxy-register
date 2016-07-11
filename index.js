'use strict'

const request = require('http').request

const concat = require('concat-stream')


//
// Piggy-back the built-in `net` module to automaticly registers and un-register
// the TCP and UDP ports
//

const net = require('net')

const Socket_listen = net.Socket.prototype.listen
const Server_listen = net.Server.prototype.listen


function toNumber(x) { return (x = Number(x)) >= 0 ? x : false; }


net.Server.prototype.listen = function()
{
  const self = this

  const argv = Array.prototype.slice.call(arguments)
  const port = toNumber(argv[0])

  // Only register priviledged ports (< 1024)
  if(port === 0 || port >= 1024) return Server_listen.apply(this, argv)

  if(typeof argv[argv.length-1] === 'function')
    const lastArg = argv.pop()

  // Set it to use a random free port and add a `listening` callback
  argv[0] = 0
  argv.push(function()
  {
    const options =
    {
      method: 'POST',
      hostname: '127.0.0.1',
      path: '/_register'
    }
    const req =
    {
      pid: process.pid,
      port: this.address().port,
      externalPort: port,
      type: 'tcp'
    }

    request(options, function(res)
    {
      res.pipe(concat(function(token)
      {
        Object.defineProperty(self, '_token', {value: token})

        if(lastArg) lastArg.call(self)
      }))
    }).end(JSON.stringify(req))
  })

  Server_listen.apply(this, argv)
}
