/**
 * Project: iOS-Cart
 * Package:
 * Module: options
 * Author: lents
 * Date: 4/30/16
 * Create with: IntelliJ IDEA.
 */
import * as types from '../actionTypes'
import {createAction} from '../helpers'

export const requestStores = () => createAction(types.REQUEST_STORES)
export const receiveStores = (storeData) => createAction(types.RECEIVE_STORES, storeData)

export const requestReferrers = () => createAction(types.REQUEST_REFERRERS)
export const receiveReferrers = (referrerData) => createAction(types.RECEIVE_REFERRERS, referrerData)

export const requestSalesReps = () => createAction(types.REQUEST_SALESREPS)
export const receiveSalesReps = (salesRepData) => createAction(types.RECEIVE_SALESREPS, {salesRepData})

export const requestClubTypes = () => createAction(types.REQUEST_CLUBTYPES)
export const receiveClubTypes = (clubTypeData) => createAction(types.RECEIVE_CLUBTYPES, {clubTypeData})

export const requestPromos = () => createAction(types.REQUEST_PROMOS)
export const receivePromos = (promoData) => createAction(types.RECEIVE_PROMOS, promoData)

export const receiveShippingOptions = (data) => createAction(types.RECEIVE_SHIPPING_OPTIONS, data)