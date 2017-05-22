/**
 * Project: iOS-Cart
 * Package:
 * Module: index
 * Author: lents
 * Date: 5/11/16
 * Create with: IntelliJ IDEA.
 */
import moment from 'moment'

export function jisLoggedIn(state, login) {
   if (!state.authenticated) {
      return false
   }
   const { user_login, expires } = state
   // console.log('checking ' + moment().format() + ' is before ' + moment.unix(expires).format() )
   return login === user_login && moment().isBefore(moment.unix(expires))
}

export const isLoggedIn = (state) => {
   if (!state.authenticated) {
      return false
   }
   return moment().isBefore(moment.unix(state.expires))
}

export const hasRegistered = (state) => state.registered
