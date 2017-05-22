import {Record, Map} from 'immutable'
import CartItem from './cartItem'
import CartTotals from './cartTotals'

import {
    ADD_TO_CART,
    ADD_TO_CART_ERROR,
    REMOVE_FROM_CART,
    ADD_TO_CART_ARRAY,
    CALCULATE_CART_TOTALS,
    CHECKOUT_REQUEST,
    CHECKOUT_SUCCESS,
    CHECKOUT_FAILURE,
    RECEIVE_STORE,
    RECEIVE_COUPON,
    SELECT_PROMO,
    REQUEST_COUPON_ERROR,
    SELECT_SALESREP,
    RECEIVE_USER_AUTH,
    SET_IN_CART,
    RECEIVE_SALESTAX_INFO,
    SET_GRATUITY
} from '../actionTypes'

// TODO: gratuity, shipping, tax, discounts
const InitialState = Record({
    checkoutStatus: {
        checkoutPending: false,
        error: null
    },
    quantityById: Map(),
    lzCartArrayMap: Map(),
    lzCartTotals: new CartTotals(),
    promos: {},
    gratuity_index: 0,
    gratuity: 0.00,
    meta: {
        sales_rep: null,
        store_id: null,
        vip_id: 24696,
        disc_id: null,
        tax_rate: 0.00,
        gratuityIsPercentage: true,
        shipToZip: '',
        shipping: 0.00,
        amountDiscount: 0.00
    },

})
const initialState = new InitialState

export default function cartReducer(state = initialState, action) {
    if (!(state instanceof InitialState)) return initialState

    const {productId, quantity} = action.payload || {productId: undefined, quantity: 0}
    switch (action.type) {
        case CHECKOUT_SUCCESS:
            return state.get('quantityById')

        case ADD_TO_CART:
            if (productId) {
                return state.updateIn(['quantityById', productId], 0, val => val + quantity)
            }
            break

        case SET_IN_CART:
            const {quantity:trueQuantity} = action.payload // why quantity here is undefined?
            return state.setIn(['quantityById', productId], trueQuantity)

        case ADD_TO_CART_ARRAY:
            const {product, cat_size_id} = action.payload
            if (product) {
                return state.updateIn(['lzCartArrayMap', product.cat_id],
                    new CartItem(product)
                       .set('base_price_ea', product.price),
                    item => item.merge(Map({
                        qty: state.getIn(['quantityById', product.cat_id]),
                        cat_size_id: cat_size_id,
                    }))
                )
                return state
            }

        case ADD_TO_CART_ERROR:
            return {
                error: action.error
            }

        case RECEIVE_SALESTAX_INFO:
            return state.updateIn(['meta', 'tax_rate'], action.payload.rate || 0.00) // TODO: update tax rate

        case REMOVE_FROM_CART:
            return state.deleteIn(['quantityById', productId]).deleteIn(['lzCartArrayMap', productId])

        case CALCULATE_CART_TOTALS:

            let totals = new CartTotals
            state.get('lzCartArrayMap')
                .forEach(cartItem => {
                    const itemObj = cartItem.toObject(),
                        isDiscount = parseInt(itemObj.is_disc) > 0,
                        isTaxable = parseInt(itemObj.taxable) > 0
                    let discFactor = 1,
                        qty = parseInt(itemObj.qty),
                        price = parseFloat(itemObj.base_price_ea) // XXX: no base_price_ea
                    if (isDiscount) {
                        discFactor = -1
                        qty = 1
                        price = Math.abs(itemObj.amount)
                    }
                    totals = totals.update('bucks', bucks => bucks + price * qty * discFactor)
                        .update('taxable', taxable => isTaxable ? taxable + qty * price * discFactor : taxable)
                        .update('taxable_discount', taxable_discount =>
                            isTaxable ? taxable_discount + parseFloat(itemObj.qty) * parseFloat(itemObj.base_price_ea) - parseFloat(itemObj.amount)
                               : taxable_discount)
                        .update('weight', weight => weight + parseFloat(itemObj.ship_weight))
                        .update('bottles', bottles => bottles + qty * parseInt(itemObj.num_bottles))
                        .update('has_wine', has_wine => parseInt(itemObj.has_wine) > 0 ? true : has_wine )
                        .update('is_club', is_club => parseInt(itemObj.is_club) > 0 ? true : is_club)
                        .update('has_futures', has_futures => has_futures) // TODO: check for calc

                        .update('has_non_futures', has_non_futures => has_non_futures) // TODO: check for calc
                        .update('future_date_conflict', future_date_conflict => future_date_conflict) // TODO: check for calc
                        .update('future_release_dates', future_release_dates => future_release_dates) // TODO: check for calc
                        .update('coupon_details', coupon_details => coupon_details) // TODO: check for calc
                })
            return state.mergeIn(['lzCartTotals'], totals)
            // return state.setIn(['lzCartTotals', 'bucks'], bucks.toFixed(2))

        case SET_GRATUITY:
            return state.set(`gratuity`, action.payload.gratuity).set(`gratuity_index`, action.payload.gratuity_index)

        default:
            return state
    }
}

// function calcCart(state) {
//     let productsCost = 0
//     state.get('quantityById').map((productId, quantity) => {
//         const price = parseFloat(state.getIn(['lzCartArrayMap', productId, 'price']))
//         console.log('qty: ', quantity)
//         productsCost += price * quantity
//     })
//
//     const discount = state.getIn(['mockTotals', 'discount']),
//         shipping = state.getIn(['mockTotals', 'deliveryCost'])
//
//     if (discount > 0) {
//         productsCost = productsCost / 100 * discount
//     }
//
//     return state
//         .setIn(['mockTotals', 'productsCost'], productsCost)
//         .setIn(['mockTotals', 'totalCost'], productsCost + shipping)
// //                 .mergeIn(['mockTotals', 'totalCost'], val => val + shipping)
// }

// function checkoutStatus(state = initialState, action) {
//     switch (action.type) {
//         case CHECKOUT_REQUEST:
//             return {
//                 checkoutPending: true,
//                 error: null
//             }
//         case CHECKOUT_SUCCESS:
//             return initialState.checkoutStatus
//
//         case CHECKOUT_FAILURE:
//             return {
//                 checkoutPending: false,
//                 error: action.error
//             }
//         default:
//             return state
//     }
// }
//
// function promos(state = initialState, action) {
//
//     switch (action.type) {
//         case ADD_TO_CART:
//             return state
//
//         case RECEIVE_COUPON:
//             return {...state, ...action.coupon}
//
//         default:
//             return state
//     }
// }
//
// function meta(state = initialState.meta, action) {
//     switch (action.type) {
//         case SELECT_SALESREP:
//             return {...state, sales_rep: action.id}
//
//         case SELECT_PROMO:
//             return {...state, disc_id: action.promoId}
//
//         case RECEIVE_USER_AUTH:
//             return {...state, sales_rep: action.data.user_details['user_id']}
//
//         case RECEIVE_STORE:
//             const {store_id} = action.payload
//             return {...state, store_id: store_id}
//
//         default:
//             return state
//     }
// }
