/* eslint-disable no-constant-condition */
import 'babel-polyfill'
import {take, put, call, fork, cancel, cancelled, select} from 'redux-saga/effects'
import {takeEvery, takeLatest} from 'redux-saga'

import * as types from '../actionTypes'
// import {types as billingInfoTypes} from '../../redux/billingInfo'
// import {types as shippingInfoTypes} from '../../redux/shippingInfo'

import {receiveMember} from '../member/actions'
import * as productActions from '../products/actions'
// import * as cartActions from '../cart/actions'
import * as userActions from '../user/actions'
import * as optionsActions from '../options/actions'
import * as settingsActions from '../settings/actions'

// import * as billingActions from '../billing/actions'

//import { LOGIN, validAuthFields } from '../auth/actions'

import * as api from '../../services/api'
import {} from '../../services/storage'

//import { buyProducts } from '../../services'

// import { saveFullCatalog } from '../reducers/products'

import {Map} from 'immutable'

const getProducts = state => state.products
const getCart     = state => state.cart
const getCartMeta = state => state.cart.meta

// export function* checkout() {
//
//    while (yield take(types.CHECKOUT_REQUEST)) {
//       try {
//          const cart = yield select(getCart)
//          // yield call(buyProducts, cart)
//          yield put(cartActions.checkoutSuccess(cart))
//       }
//       catch (error) {
//          yield put(cartActions.checkoutFailure(error))
//       }
//    }
// }

function *fetchProducts() {
   try {
      yield put(productActions.requestProducts())
      const [categories, products] = yield [
         call(api.getCatalogClusters),
         call(api.getCatalog)
      ]
      yield [
         put(productActions.receiveProductCategories(categories['data']['clusters'])),
         put(productActions.receiveProducts(products['data']))
      ]
      yield put({type: types.PRODUCTS_LOADING_COMPLETED})
   }
   catch (error) {
      console.error(error)
      yield put(productActions.receiveProducts([]))
   }
}

function *getCoupon(action) {
   try {
      const coupon = yield call(api.getPromoCoupon, action.promoName)
      yield put({
         type: types.RECEIVE_COUPON,
         coupon: coupon['data']
      })
   }
   catch (error) {
      yield put({
         type: types.REQUEST_COUPON_ERROR,
         error: error
      })
   }
}

function *watchGetCoupon() {
   yield* takeLatest(types.REQUEST_COUPON, getCoupon)
}

function *filterProducts(action) {
   try {
      if (action.filter) {
         yield put(productActions.enableProductsFilter(action.filter))
      }
      else {
         yield put(productActions.disableProductsFilter())
      }
   }
   catch (error) {
      yield put({
         type: types.FILTER_PRODUCTS_ERROR,
         error: error
      })
   }
}

function *watchFilterProducts() {
   yield* takeEvery(types.FILTER_PRODUCTS, filterProducts)
}

function *addToCart(payload) {
   try {
      const {productId, quantity, cat_size_id} = payload
      // yield put(cartActions.setProductInCart(productId, quantity))
      yield put({
         type: types.SET_IN_CART,
         payload: {
            productId: productId,
            quantity: quantity
         }

      })
      const products = yield select(getProducts)
      yield put({
         type: types.ADD_TO_CART_ARRAY,
         payload: {
            product: products.getIn(['byId', productId]),
            cat_size_id: cat_size_id
         }
      })
      yield put({type: types.CALCULATE_CART_TOTALS})
   }
   catch (error) {
      yield put({
         type: types.ADD_TO_CART_ERROR,
         error: error
      })
   }
}

function *removeFromCart(payload) {
    yield put({
        type: types.REMOVE_FROM_CART,
        payload: payload
    })
    yield put({type: types.CALCULATE_CART_TOTALS})
}

function *shippingUpdate(payload) {
   try {
      const {shipOption, zipCode, state} = payload
      yield fork(getShippingOptions, zipCode)
      const useStoreRate = ['pickup', 'delivery', 'taken'].some(method => method === shipOption)
      const saleTaxInfo  = yield call(api.getSalesTaxInfo(zipCode, state, useStoreRate))
      yield put({
         type: types.RECEIVE_SALESTAX_INFO,
         payload: saleTaxInfo['data']
      })
      yield put({type: types.CALCULATE_CART_TOTALS})
   }
   catch (error) {
      console.log(error)
   }

}

function *cartUpdate(action) {
   const {type, payload} = action
   switch (type) {
      case types.REQUEST_CART_UPDATE_ADD:
         yield call(addToCart, payload)
         break
      case types.REQUEST_CART_UPDATE_REMOVE:
         yield call(removeFromCart, payload)
         break
      case types.REQUEST_CART_UPDATE_SHIPPING:
         yield call(shippingUpdate, payload)
   }
}

function *watchCartUpdates() {
   yield* takeEvery(
      [
         types.REQUEST_CART_UPDATE_ADD,
         types.REQUEST_CART_UPDATE_REMOVE,
         types.REQUEST_CART_UPDATE_SHIPPING

      ],
      cartUpdate
   )
}

function *findMemberByEmail(action) {
   yield put(receiveMember({isFindingMemberByEmail: true}))
   const responce = yield call(api.findMemberByEmail, action.payload)
   console.log(responce)
   const member = responce.data
   const {
      cc_exp_mo, cc_exp_yr,
       bill_email, bill_name, bill_addr1, bill_addr2, bill_postal, bill_city, bill_state, bill_phone,
       club_ship_meth_pref, ship_name, ship_addr1, ship_addr2, ship_postal, ship_city, ship_state, ship_phone
   } = member
   if (member.error) {
      yield put(receiveMember({isFindingMemberByEmail: false}))
   } else {
      yield put(receiveMember({
         isFindingMemberByEmail: false,
         cc_num: ``, cc_cvv: ``, cc_exp_mo, cc_exp_yr,
         bill_email, bill_name, bill_addr1, bill_addr2, bill_postal, bill_city, bill_state, bill_phone,
         club_ship_meth_pref, ship_name, ship_addr1, ship_addr2, ship_postal, ship_city, ship_state, ship_phone
      }))
   }
}

function *watchFindMemberByEmail() {
   yield takeLatest(types.REQUEST_MEMBER_BY_EMAIL, findMemberByEmail)
}

function *watchSelectPromo() {
   yield *takeLatest(types.SELECT_PROMO, getPromoCatalogDetails)
}

function *getPromoCatalogDetails(action) {
   // TODO: Ridge: must be manually triggered when cust lookup happens and person is a club member
   try {
      // get current vip
      const cartMeta = yield select(getCartMeta)
      if (cartMeta.vip_id) {
         const result = yield call(api.getCatalogPromotionDetails(action.couponId, cartMeta.vip_id))
         console.log('saga CatalogDetails: ', result)
         // yield put(productActions.receivePromoCatalogDetails(result['data']))
         yield put({
            type: types.SELECT_PROMO,
            promoId: action.couponId
         })
      }
      else {

      }

   }
   catch (error) {
      //    yield put (productActions.receivePromoCatalogError({error: error}))
   }
}

function *getReferrers() {
   try {
      const result = yield call(api.getReferrersList)
      yield put(optionsActions.receiveReferrers(result['data']))
   }
   catch (error) {
      yield put({
         type: types.REQUEST_REFERRERS_ERROR,
         error: error
      })
   }
}

function *getSalesReps() {
   try {
      const result = yield call(api.getSalesRepsList)
      yield put(optionsActions.receiveSalesReps(result['data']))
   }
   catch (error) {
      yield put({
         type: types.REQUEST_SALESREPS_ERROR,
         error: error
      })
   }
}

function *getClubTypes() {
   try {
      const result = yield call(api.getClubTypes)
      yield put(optionsActions.receiveClubTypes(result['data']))
   }
   catch (error) {
      yield put({
         type: types.REQUEST_SALESREPS_ERROR,
         error: error
      })
   }
}

function *getShippingOptions(zip = '') {
   try {
      const result = yield call(api.getShippingOptions, zip)
      yield put(optionsActions.receiveShippingOptions(result['data']))
   }
   catch (error) {
      // TODO: Add errors
   }
}

function *getPrefs() {
   try {
      const result = yield call(api.getAllPrefs)
      yield put(settingsActions.receiveAllPrefs(result['data']))
   }
   catch (error) {
      yield put({
         type: types.REQUEST_PREFS_ERROR,
         error: error
      })
   }
}

function *getConfig() {
   try {
      const result = yield call(api.getConfig)
      yield put(settingsActions.receiveConfig(result['data']))
   }
   catch (error) {
      yield put({
         type: types.REQUEST_CONFIG_ERROR,
         error: error
      })
   }
}

function *getStoreDetails() {
   try {
      const result = yield call(api.getStoreDetail)
      // console.log(result)
      yield put(settingsActions.receiveStore(result['data']))
   }
   catch (error) {
      yield put({
         type: types.REQUEST_STORES_ERROR,
         error: error
      })
   }
}

function* watchFetchProducts() {
   yield* takeLatest(types.FETCH_ALL_PRODUCTS, fetchProducts)
}

// function* watchUserLogin() {
//    yield* takeLatest(types.LOGIN, authenticateUser, )
// }

function* authorize(login, password) {
   try {
      let result = false
      const authResult = yield call(api.authenticateUser, login, password)
      console.log('saga login: ', authResult)
      if (authResult.data && authResult.data.data) {
         const data = authResult.data.data;
         if (data['success']) {
            result = true
            yield put({
               type: types.LOGIN_SUCCESS,
               data: {
                  user_login: login,
                  expires: data['auth_expires']
               }
            })
            yield put(userActions.receiveUserLoginResult({user_details: data['user']}))
         } else {
            yield put({
               type: 'LOGIN_ERROR',
               error: `Invalid email or password`
            })
         }
      } else {
         yield put({
            type: 'LOGIN_ERROR',
            error: `Invalid email or password`
         })
      }
      return result
   }
   catch (error) {
      // console.log(error)
      yield put({
         type: 'LOGIN_ERROR',
         error: error
      })
   }
   finally {
      if (yield cancelled()) {
         // ... put special cancellation handling code here
      }
   }
}

function* handleLoginFlow(result) {
   const {login, password} = result.payload
   // const authFields = yield take(types.LOGIN_REQUEST)
   yield put({
      type: types.LOGIN_PENDING,
      data: {user_login: login}
   })
   // yield put({ type: LOGIN_START })
   // const foo = yield call(validAuthFields, authFields)
   // console.log('Foo: ', foo)
   // const { email, password } = authFields
   const task   = yield call(authorize, login, password)
   const action = yield take(['LOGOUT', 'LOGIN_ERROR'])
   if (action.type === 'LOGOUT') {
      yield cancel(task)
   }
   yield put({...action})
}

function* loginFlow() {
   yield* takeEvery(types.LOGIN_REQUEST, handleLoginFlow)
}

function* getAddressBuZipcode(payload) {
   const result  = yield call(api.zipLookup, payload.zipCode);
   const address = result.data
   yield call(payload.completion, address)
}

function *watchZipFieldBillingInfo() {
   yield takeEvery(types.REQUEST_ZIP_CODE_BILLING, getAddressBuZipcode)
}

function *watchZipFieldShippingInfo() {
   yield takeEvery(types.REQUEST_ZIP_CODE_SHIPPING, getAddressBuZipcode)
}

function* startup() {
   yield call(fetchProducts)
   yield [
      fork(getStoreDetails),
      fork(getReferrers),
      fork(getSalesReps),
      fork(getClubTypes),
      fork(getShippingOptions),
      fork(getPrefs),
      fork(getConfig)
   ]
}

export default function* rootSaga() {
   yield fork(startup)
   yield fork(loginFlow)
   yield fork(watchCartUpdates)
   yield fork(watchGetCoupon)
   yield fork(watchFindMemberByEmail)
   yield fork(watchFilterProducts)
   yield fork(watchSelectPromo)
   yield fork(watchZipFieldBillingInfo)
   yield fork(watchZipFieldShippingInfo)
   // yield fork(checkout)
   yield fork(watchFetchProducts)
}
