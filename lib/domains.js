'use strict'

const request = require('http').request

const concat = require('concat-stream')


const tokens = {}


function register(domain, port, callback)
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
    domain: domain,
    port: port
  }

  request(options, function(res)
  {
    res.pipe(concat(function(token)
    {
      tokens[domain] = token
      callback()
    })
  })
  .end(JSON.stringify(req))
}

function unregister(domain, port, callback)
{
  const token = tokens[domain]

  const options =
  {
    method: 'POST',
    hostname: '127.0.0.1',
    path: '/_unregister'
  }
  const req =
  {
    pid: process.pid,
    domain: domain,
    token: token
  }

  request(options, function(res)
  {
    delete tokens[domain]
    callback()
  })
  .end(JSON.stringify(req))
}


exports.register   = register
exports.unregister = unregister
