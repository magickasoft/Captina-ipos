/**
 * Created by lents on 6/9/16.
 */
import {Record, List} from 'immutable'

// import productBase from '../lib/productBase'

const CartTotals = Record({
   bucks: 0.00,
   taxable: 0.00,
   weight: 0,
   bottles: 0,
   has_wine: false,
   is_club: false,
   has_futures: false,
   taxable_discount: 0.00,
   has_non_futures: false,
   future_date_conflict: false,
   future_release_dates: List(),
   coupon_details: 0
})


export default CartTotals

