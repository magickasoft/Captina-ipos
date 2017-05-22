/**
 * Project: iOS-Cart
 * Package:
 * Module: options
 * Author: lents
 * Date: 4/30/16
 * Create with: IntelliJ IDEA.
 */
import {combineReducers} from 'redux'
import {Record, OrderedMap, List} from 'immutable'
import {keys, isEmpty} from 'lodash'
import * as types from '../actionTypes'
import {byKeyFn} from '../helpers'

const initialState = {
   referrers: {},
   sales_reps: {
      0: {
         user_id: '0',
         name_first: 'House',
         name_last: 'Account'
      }
   },
   club_types: {},
   promos: {},
   shippingOptions: OrderedMap(),
   lastSalesTaxData: Record({
      tax_shipping: 0.00,
      taxrate_wine: 0.00,
      tax_model: 'fullrate',
      taxrate_type: 'local',
      taxrate_state: 0.00,
      taxrate_county: 0.00,
      taxrate_city: 0.00,
      taxrate_special: 0.00,
      rate: 0.00,
      rules: {}
   })
}

function referrers(state = initialState.referrers, action) {
   switch (action.type) {

      case types.RECEIVE_REFERRERS:
         return Object.assign({}, state, byKeyFn(action.payload, 'ref_source_id'))

      case types.REQUEST_REFERRERS_ERROR:
         return {
            ...state,
            error: action.error
         }

      default:
         return state
   }
}

function club_types(state = initialState.club_types, action) {
   switch (action.type) {

      case types.RECEIVE_CLUBTYPES:
         const {clubTypeData} = action.payload
         return Object.assign({}, state, byKeyFn(clubTypeData, 'club_type_id'))

      case types.REQUEST_CLUBTYPES_ERROR:
         return {
            ...state,
            error: action.error
         }

      default:
         return state
   }
}

function sales_reps(state = initialState.sales_reps, action) {
   switch (action.type) {

      case types.RECEIVE_SALESREPS:
         const {salesRepData} = action.payload
         return Object.assign({}, state, byKeyFn(salesRepData, 'user_id'))

      case types.REQUEST_SALESREPS_ERROR:
         return {
            ...state,
            error: action.error
         }

      default:
         return state
   }
}

function promos(state = initialState.promos, action) {
   switch (action.type) {

      case types.RECEIVE_PROMOS:
         return Object.assign({}, state, byKeyFn(action.payload, ''))

      default:
         return state
   }
}

function shippingOptions(state = initialState.shippingOptions, action) {
   switch (action.type) {

      case types.RECEIVE_SHIPPING_OPTIONS:

         return action.payload.reduce((options, select) => {
            const option = List(select.split('~')).reverse()
            return options.set(option.first(), option.last())
         }, OrderedMap({}))

      default:
         return state
   }
}

function salesTaxRules(state = initialState.lastSalesTaxData, action) {
   switch (action.type) {
      case types.RECEIVE_SALESTAX_INFO:
         return state.mergeDeep(action.payload)

      default:
         return state
   }
}
// TODO: get city, state by zip

export default combineReducers({
   referrers,
   sales_reps,
   club_types,
   promos,
   shippingOptions,
   salesTaxRules
})
