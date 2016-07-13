'use strict'

const request = require('http').request

const concat = require('concat-stream')


const tokens = {}


function toNumber(x)
{
  return (x = Number(x)) >= 0 ? x : false
}


function registerPort(func)
{
  return function()
  {
    const self = this

    const argv = Array.prototype.slice.call(arguments)
    const port = toNumber(argv[0])

    // Only register priviledged ports (< 1024)
    if(!port || port >= 1024) return func.apply(this, argv)

    if(typeof argv[argv.length-1] === 'function')
      var callback = argv.pop()

    // Register and un-register functions
    const type = self.type || 'tcp'
    const key = type+':'+port

    function onRegister(res)
    {
      res.pipe(concat(function(token)
      {
        tokens[key] = token

        self.on('close', function()
        {
          const options =
          {
            method: 'POST',
            hostname: '127.0.0.1',
            path: '/_unregister'
          }
          const req =
          {
            pid: process.pid,
            externalPort: port,
            type: type,
            token: token
          }

          request(options, onUnregister).end(JSON.stringify(req))
        })

        if(callback) callback.call(self)
      }))
    }

    function onUnregister(res)
    {
      delete tokens[key]
    }

    // Set the port to use a random free port and register on the reverse proxy
    // when the port gets open
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
        port: self.address().port,
        externalPort: port,
        type: type
      }

      request(options, onRegister).end(JSON.stringify(req))
    })

    func.apply(this, argv)
  }
}


module.exports = registerPort
