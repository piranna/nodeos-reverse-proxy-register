const assert       = require('assert')
const createSocket = require('dgram').createSocket
const http         = require('http')
const net          = require('net')

const nock = require('nock')
const uuid = require('uuid').v4

const nrpr = require('.')


nock.disableNetConnect();

const reverseProxy = nock('http://127.0.0.1')


describe('dgram', function()
{
  it('register automatically a priviledged port', function(done)
  {
    const port = 80
    const requestRegister =
    {
      pid: process.pid,
      port:  /\d+/,
      externalPort: port,
      type: 'udp4'
    }
    const token = uuid()
    const requestUnregister =
    {
      pid: process.pid,
      externalPort: port,
      type: 'udp4',
      token: token
    }

    reverseProxy
    .post('/_register', requestRegister)
    .reply(200, token)
    .post('/_unregister', requestUnregister)
    .reply(200)

    createSocket('udp4').bind(port, function()
    {
      assert.notStrictEqual(this.address().port, port)

      this.close(done)
    })
  })
})

describe('net', function()
{
  it('register automatically a priviledged port', function(done)
  {
    const port = 80
    const requestRegister =
    {
      pid: process.pid,
      port:  /\d+/,
      externalPort: port,
      type: 'tcp'
    }
    const token = uuid()
    const requestUnregister =
    {
      pid: process.pid,
      externalPort: port,
      type: 'tcp',
      token: token
    }

    reverseProxy
    .post('/_register', requestRegister)
    .reply(200, token)
    .post('/_unregister', requestUnregister)
    .reply(200)

    net.createServer().listen(port, function()
    {
      assert.notStrictEqual(this.address().port, port)

      this.close(done)
    })
  })
})

describe('domains', function()
{
  it('register explicitly a domain', function(done)
  {
    const domain = 'example.com'
    const requestRegister =
    {
      pid: process.pid,
      port:  /\d+/,
      domain: domain
    }
    const token = uuid()
    const requestUnregister =
    {
      pid: process.pid,
      domain: domain,
      token: token
    }

    reverseProxy
    .post('/_register', requestRegister)
    .reply(200, token)
    .post('/_unregister', requestUnregister)
    .reply(200)

    const server = http.createServer().listen(function()
    {
      nrpr.register(domain, this.address().port, function(error)
      {
        assert.ifError(error)

        nrpr.unregister(domain, function(error)
        {
          assert.ifError(error)

          server.close(done)
        })
      })
    })
  })
})
