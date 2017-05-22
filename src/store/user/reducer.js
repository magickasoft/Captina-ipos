/**
 * Project: iOS-Cart
 * Package:
 * Module: user
 * Author: lents
 * Date: 4/19/16
 * Create with: IntelliJ IDEA.
 */
import * as types from '../actionTypes'

const initialState = {
   login_pending: false,
   authenticated: false,
   expires: null,
   user_login: null,
   user_details: {},
   login_error: null
}

export default function user(state = initialState, action) {
   switch (action.type) {

      case types.LOGIN_PENDING:
         return {
            ...initialState,
            login_pending: true,
            ...action.data
         }

      case types.LOGIN_SUCCESS:
         return {
            ...state,
            login_pending: false,
            authenticated: true,
            ...action.data
         }

      case types.RECEIVE_USER_AUTH:
         return { ...state, user_details: action.payload.user_details }

      case types.LOGOUT:
         return initialState

      case types.LOGIN_ERROR:
         return { ...state, login_error: action.error, login_pending: false }

      default:
         return state
   }
}

