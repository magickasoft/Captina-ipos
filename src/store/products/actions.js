import moment from 'moment/moment'
import * as types from '../actionTypes'
import {createAction} from '../helpers'

export const requestProducts = () => createAction(types.REQUEST_PRODUCTS)
export const fetchProducts = () => createAction(types.FETCH_ALL_PRODUCTS)

export const receiveProducts = (data) => createAction(types.RECEIVE_PRODUCTS, {
   products: data,
   receivedAt: moment().toISOString()
})

export const receiveProductCategories = (data) => createAction(types.RECEIVE_CLUSTERS, {clusters: data})

export const searchProducts = (searchString) => createAction(types.FILTER_PRODUCTS, {filter: searchString})

export const enableProductsFilter = (searchString) => createAction(types.ENABLE_PRODUCTS_FILTER, {filter: searchString})

export const disableProductsFilter = () => createAction(types.CLEAR_PRODUCTS_FILTER)

export const receivePromoCatalogDetails = (data) => createAction(types.RECEIVE_PROMO_CATALOG_UPDATE, {
   promoDetails: data,
   updatedAt: moment().toISOString()
})
export const receivePromoCatalogError = (error) => createAction(types.REQUEST_PROMO_CATALOG_UPDATE_ERROR, error)

