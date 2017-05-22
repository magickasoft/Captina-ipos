/**
 * Project: CartApp
 * Package:
 * Module: captinaApi
 * Author: lents
 * Date: 1/28/16
 * Created with: IntelliJ IDEA.
 */
import {callApi, getStoreId, getDomain} from './common'

export {getStoreId, getDomain}

const storeId                   = getStoreId()
// Catalog
/**
 *
 * @returns {*|Promise|Promise.<T>}
 */
      export const getCatalog   = () => callApi('getCatalog') // .then(products => {console.log('API: ', products)})
export const getCatalogClusters = () => callApi('getCatalogClusters')
// Coupons/Discounts/Taxes

export const getCatalogPromotionDetails = (couponId, memberId) => callApi('getCatalogPromotionDetails', {
   disc_id: couponId,
   vip_id: memberId
})

/**
 *
 * @param coupon
 */
export const getPromoCoupon = (coupon) => callApi('getPromoCoupon', {COUPON: coupon})

export const calculateCouponValue = (couponId, shipMethod, cartArray) => callApi('calculateCouponValue', {
   coupon_id: couponId,
   ship_method: shipMethod,
   cart_array: cartArray,
   store_id: storeId
})
// VIP/Customer
/**
 *
 * @param email
 */
export const findMemberByEmail = (email) => callApi('findMemberByEmail', {email: email})

// TODO: test these:
export const findMemberByName = (searchString) => callApi('findMemberByName', {STRING: searchString})

// User
/**
 *
 * @param login
 * @param pass
 */
export const authenticateUser = (login, password) => callApi('authenticateUser', {
   USERNAME: login,
   PASSWORD: password,
   SIMPLE_LOGIN: false
})

// Settings/options

export const getAllPrefs        = () => callApi('getAllPrefs')
export const getConfig          = () => callApi('getConfig')
export const getActiveStores    = () => callApi('getActiveStores')
export const getStoreDetail     = (id = storeId) => callApi('getStoreInfo')
export const getReferrersList   = () => callApi('getReferrersList')
export const getSalesRepsList   = () => callApi('getSalesRepsList')
export const getClubTypes       = () => callApi('getClubTypes')
export const getShippingOptions = (zip = '') => callApi('getShippingOptions', {
   zipCode: zip
})

export const getSalesTaxInfo = (zip, state, useStoreRate = false) => callApi('getSalesTaxInfo', {
   zipcode: zip,
   state: state,
   use_store_rate: useStoreRate ? 1 : 0,
   store_id: storeId
})

export const zipLookup = (zip, country = 'US', tc_action = 1) => callApi('zipLookup', {
   ZIP: zip,
   COUNTRY: country,
   tc_action: tc_action,
   // tc_do_nothing: 0,
   // tc_cleanup: 1,
   // tc_no_alert: 2,
   // tc_drop_tc: 4,
   // tc_include_if_ever_avail: 8
})

export const preAuthCreditCard = (cardData = {
   bill_name: '',
   bill_addr1: '',
   bill_addr2: '',
   bill_city: '',
   bill_state: '',
   bill_postal: '',
   bill_phone: '',
   bill_country: '',
   cc_num: '',
   cc_cvv: '',
   cc_exp_mo: '',
   cc_exp_yr: '',
   amt_total: 0.00
}) => callApi('preAuthCreditCard', cardData)

