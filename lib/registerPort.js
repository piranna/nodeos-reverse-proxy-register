'use strict'

const request = require('http').request

const concat = require('concat-stream')


const tokens = {}


function toNumber(x)
{
  return (x = Number(x)) >= 0 ? x : false
}


function registerPort(prototype, methodName)
{
  // Open
  const open = prototype[methodName]

  prototype[methodName] = function()
  {
    const self = this

    const argv = Array.prototype.slice.call(arguments)
    const port = toNumber(argv[0])

    // Only register priviledged ports (< 1024)
    if(!port || port >= 1024) return open.apply(this, argv)

    if(typeof argv[argv.length-1] === 'function')
      var callback = argv.pop()

    // Register and un-register functions
    const type = this.type || 'tcp'
    const key = type+':'+port

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
        port: this.address().port,
        externalPort: port,
        type: type
      }

      request(options, function(res)
      {
        res.pipe(concat(function(token)
        {
          tokens[key] = token.toString()

          if(callback) callback.call(self)
        }))
      })
      .end(JSON.stringify(req))
    })

    open.apply(this, argv)


    // Close
    function doClose(callback)
    {
      const token = tokens[key]
      if(token == null)
      {
        if(callback) callback.call(self)
        return
      }

      // Prevent clossing twice
      tokens[key] = null

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

      request(options, function(res)
      {
        delete tokens[key]

        if(callback) callback.call(self)
      })
      .end(JSON.stringify(req))
    }

    this.on('close', doClose)

    const close = this.close
    this.close = function(callback)
    {
      close.call(this, doClose.bind(this, callback))
    }
  }
}


module.exports = registerPort
