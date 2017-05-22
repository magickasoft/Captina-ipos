/**
 * Created by lents on 6/9/16.
 */
import {Record} from 'immutable'

import productBase from '../lib/productBase'

const cartItem = {
   ...productBase,
   amount: 0.00,
   base_price_ea: 0.00,
   cat_size_id: '0',
   image_src: null,
   msg: '',
   qty: 0,
   require_accept_terms: ''

}

class CartItem extends Record(cartItem) {

}

export default CartItem

