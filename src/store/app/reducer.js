/**
 * Created by lents on 7/29/16.
 */
import { Map, Record } from 'immutable'
import * as actions from './actions'

const InitialState = Record({
   online: false,
   storageLoaded: false,
   registration: Map({
      code: '',
      registered: false
   }),
   clientDomain: '',
   captinaApi: Map({
      endpoint: 'https://www.captina.net/api/iOS/',
      hexKey: '',
      nonceHeader: 'x-captina-api-auth',
      version: '1.1',
      methods: Map({
         registerApp: 'YXV0aDpyZWdpc3RlckFwcA==',
         getActiveStores: 'b3B0aW9uczpnZXRBY3RpdmVTdG9yZXM=',
         getStoreInfo: 'b3B0aW9uczpnZXRTdG9yZUluZm8=',
         getReferrersList: 'b3B0aW9uczpnZXRSZWZlcnJlcnNMaXN0',
         getSalesRepsList: 'b3B0aW9uczpnZXRTYWxlc1JlcHNMaXN0',
         getAllPrefs: 'b3B0aW9uczpnZXRBbGxQcmVmcw==',
         getConfig: 'b3B0aW9uczpnZXRDb25maWc=',
         getCatalog: 'Y2FydDpnZXRDYXRhbG9n',
         getCatalogClusters: 'Y2FydDpnZXRDYXRhbG9nQ2x1c3RlcnM=',
         findMemberByEmail: 'dmlwOmZpbmRNZW1iZXJCeUVtYWls',
         findMemberByName: 'dmlwOmZpbmRNZW1iZXJCeU5hbWU=',
         preAuthCreditCard: 'Y2FydDpwcmVBdXRoQ3JlZGl0Q2FyZA==',
         calculateCouponValue:   'Y2FydDpjYWxjdWxhdGVDb3Vwb25WYWx1ZQ==',
         recordNewStoreOrder: 'Y2FydDpyZWNvcmROZXdTdG9yZU9yZGVy',
         authenticateUser: 'dXNlcjphdXRoZW50aWNhdGVVc2Vy',
         getPromoCoupon: 'Y2FydDpnZXRDb3Vwb25JbmZv',
         getClubTypes: 'Y2x1YnM6Z2V0Q2x1YlR5cGVz',
         getPromotionsList: 'b3B0aW9uczpnZXRQcm9tb3Rpb25zTGlzdA==',
         getCatalogPromotionDetails: 'b3B0aW9uczpnZXRDYXRhbG9nUHJvbW90aW9uRGV0YWlscw==',
         getShippingOptions: 'b3B0aW9uczpnZXRTaGlwcGluZ09wdGlvbnM=',
         zipLookup: 'Y2FydDp6aXBMb29rdXA=',
         calculateShipping: 'Y2FydDpjYWxjdWxhdGVTaGlwcGluZw=='
      })
   })
}, 'app')
const initialState = new InitialState

export default function appReducer(state = initialState, action) {
   if (!(state instanceof InitialState)) return initialState

   switch (action.type) {

      case actions.APP_OFFLINE:
         return state.set('online', false)

      case actions.APP_ONLINE:
         return state.set('online', true)

      case actions.APP_STORAGE_LOAD:
         return state.set('storageLoaded', true)
   }

   return state
}