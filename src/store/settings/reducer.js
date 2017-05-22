
import { combineReducers } from 'redux'
import * as types from '../actionTypes'
import {byKeyFn} from '../helpers'

const initialState = {
   registered: true,
   prefs: {
      // XXX: required for checkout screen, find real field names
      gratuity: true,
      signature_required: true
   },
   config: {},
   store: {}
}

function store(state = initialState.store, action) {
   switch (action.type) {
      case types.RECEIVE_STORE:
         return Object.assign({}, state, action.payload)

      case types.REQUEST_STORE_ERROR:
         return { ...state, error: action.error}
      default:
         return state
   }
}

function config(state = initialState.config, action) {
   switch (action.type) {
      case types.RECEIVE_CONFIG:
         return Object.assign({}, action.payload)

      default:
         return state
   }
}

function prefs(state = initialState.prefs, action) {
   switch (action.type) {
      case types.RECEIVE_PREFS:
         return Object.assign({}, state, byKeyFn(action.payload, 'pref'))

      case types.REQUEST_PREFS_ERROR:
         return { ...state, error: action.error }

      default:
         return state
   }
}

export default combineReducers({
   store,
   config,
   prefs
})

