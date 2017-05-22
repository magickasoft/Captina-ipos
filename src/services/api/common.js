/**
 * Project: iOSCaptinaCart
 * Package: CaptinaAPI
 * Module: common
 * Author: lents
 * Date: 4/8/16
 * Create with: IntelliJ IDEA.
 */
// import Fetch from 'node-fetch' // or isomorphic-fetch
// import FormData from 'form-data'

import { captina } from './captina-api.json'
import FormData from 'form-data'

var Buffer = require('buffer/').Buffer

// keys/creds for crypt
const { version, endpoint, domain, hexKey, methods, store_id } = captina
// apiKey = new Buffer(hexKey, 'hex')

export const getStoreId = () => store_id
export const getDomain = () => domain


export function callApi(apiMethod, args = {}) {
   // params
   // send request

   const headers = createApiRequestHeaders(),
         body = createApiRequestBody(apiMethod, args)
   // body = JSON.stringify(createApiRequestBody(apiMethod))
   //console.log('API body: ', apiMethod)

   //console.log('apiMethod:', apiMethod)

   //console.log(apiMethod, endpoint, headers, body)
   return fetch(endpoint, {
      method:  'POST',
      headers: headers,
      body:    body
   })
   .then(res => res.text())
   .then(( res ) => {

      // if (!res.ok) {
      //    console.log('API: ', res)
      //    return Promise.reject(new Error('Bad response status from request: ' + res.statusText))
      // }
      //console.log('API: ', 'in callApi then')
      const decoded = new Buffer(res, 'base64')
      //console.log('API: ', decoded.toString())
      const result = JSON.parse(decoded.toString('utf8'))
      // console.log(apiMethod, args, result)
      //console.log(apiMethod, result);
      return result
   })
   .catch(/*console.log.bind(console)*/(error) => console.log(apiMethod, error))
}

export function createApiRequestBody(apiMethod, args = {}) {
   // params
   let method_args = Object.assign({}, args, {api_return: true})
   const apiId = methods[apiMethod]
   //console.log(apiId)
   const message      = new Buffer(JSON.stringify({
      api_id:    apiId,
      api_key:   hexKey,
      domain:    domain,
      method_args: method_args
   }), 'utf-8'), form = new FormData()

   form.append('domain', domain)
   form.append('request', message.toString('base64'))
   return form
   // return {
   //    domain:  domain,
   //    request: message.toString('base64')
   // }
}

export function createApiRequestHeaders() {
   return {
      'x-captina-api-version': version
   }
}
