// import moment from 'moment/moment'
import * as types from '../actionTypes'
import {createAction} from '../helpers'

export const checkout = () => createAction(types.CHECKOUT_REQUEST)
export const checkoutSuccess = (cart) => createAction(types.CHECKOUT_SUCCESS, cart)
export const checkoutFailure = (error) => createAction(types.CHECKOUT_FAILURE, error)

export const setProductInCart = (productId, quantity, cat_size_id = 0) => createAction(types.REQUEST_CART_UPDATE_ADD, {
    productId,
    quantity,
    cat_size_id
})

export const removeProductFromCart = (productId) => createAction(types.REQUEST_CART_UPDATE_REMOVE, {productId})

export const updateCartShipping = (shippingOption, zipCode = '', state = '--') => createAction(types.REQUEST_CART_UPDATE_SHIPPING, {
    shipOption: shippingOption,
    zipCode: zipCode,
    state: state
})

export const requestPromoCoupon = (promoName) => createAction(types.REQUEST_COUPON, {promoName: promoName})

export const selectSalesRep = (salesRep) => createAction(types.SELECT_SALESREP, salesRep)

export const setGratuity = (gratuity, gratuity_index) => createAction(types.SET_GRATUITY, {gratuity, gratuity_index})