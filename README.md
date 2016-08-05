[![Build Status](https://travis-ci.org/piranna/nodeos-reverse-proxy-register.svg?branch=master)](https://travis-ci.org/piranna/nodeos-reverse-proxy-register)
[![Coverage Status](https://coveralls.io/repos/github/piranna/nodeos-reverse-proxy-register/badge.svg?branch=master)](https://coveralls.io/github/piranna/nodeos-reverse-proxy-register?branch=master)

# nodeos-reverse-proxy-register

Register a priviledged port or a domain address on the
[NodeOS reverse proxy](https://github.com/piranna/nodeos-reverse-proxy)

## How to use it

`nodeos-reverse-proxy-register` transparently piggy-back on top of the Node.js build-in `dgram` and `net` modules to send a request to `nodeos-reverse-proxy` to register ports when calling the `.bind()` and `.listen()` methods, and unregister automatically when they get clossed. For domains, since there's no standard way to register them on Node.js it's needed to do it by hand by calling to the exported `register()` and `unregister()` functions.

## How it works

Communications with `nodeos-reverse-proxy` are done using `POST` requests to the urls `http://127.0.0.1/_register` and `http://127.0.0.1/_unregister`, that later are filtered by it to only allow requests from the own machine.
