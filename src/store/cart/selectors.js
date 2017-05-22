/**
 * Created by lents on 6/2/16.
 */
import {getProduct, getProductCatSizes} from '../products/reducer'
import * as cartActions from './actions'

export {cartActions}

// export * from './reducer'

export function getQuantity(state, productId) {
   return state.getIn(['quantityById', productId], 0)
}

export function getAddedIds(state) {
   return Object.keys(state.quantityById) || []
}

export function FgetTotal(state) {
   return getAddedIds(state.cart)
      .reduce((total, id) => {
         total + getProduct(state.products, id).price * getQuantity(state.cart, id)
      }, 0)
      .toFixed(2)
}

export function getCartTotals(state) {
    const { tax_rate, gratuityIsPercentage, shipping, amountDiscount } = state.get('meta'),
        totalGoods = state.getIn(['lzCartTotals', 'bucks']),
        taxableGoods = state.getIn(['lzCartTotals', 'taxable'])
    const tip = gratuityIsPercentage ?  totalGoods / 100 * state.get('gratuity') : state.get('gratuity'),
        taxes = tax_rate * taxableGoods

    return {
        productsNet: totalGoods.toFixed(2),
        taxable: taxableGoods.toFixed(2),
        salesTax: taxes.toFixed(2),
        shipping: shipping.toFixed(2),
        discount: amountDiscount.toFixed(2),
        tip: tip.toFixed(2),
        grandTotal: (totalGoods + taxes + shipping + tip - amountDiscount).toFixed(2)
    }
}

export function getCartProducts(state) {
   return getAddedIds(state.cart)
      .map(id => ({
         ...getProduct(state.products, id).toJS(),
         quantity: getQuantity(state.cart, id)
      }))
}

export function getCartArray(state) {
   state.get('lzCartArray')
      .sortBy(item => item.description)
      .toArray()
}

