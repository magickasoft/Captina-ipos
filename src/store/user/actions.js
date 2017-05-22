/**
 * Project: iOS-Cart
 * Package:
 * Module: user
 * Author: lents
 * Date: 4/20/16
 * Create with: IntelliJ IDEA.
 */
import * as types from '../actionTypes'
import {createAction} from '../helpers'

export const login = (email, password) => createAction(types.LOGIN_REQUEST, {
   login: email,
   password: password
})
export const requestUserLogin = login

export const receiveUserLoginResult = (authResult) => createAction(types.RECEIVE_USER_AUTH, authResult)

export const logout = () => createAction(types.LOGOUT)
