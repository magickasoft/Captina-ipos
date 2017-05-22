import app from './app/reducer'
import cart from './cart/reducer';
import member from './member/reducer';
import options from './options/reducer';
import products from './products/reducer';
import settings from './settings/reducer';
import navigation from '../redux/navigation';
// import billingInfo from '../redux/billingInfo';
// import shippingInfo from '../redux/shippingInfo'

import user from './user/reducer';
import {combineReducers} from 'redux';

export default function configureReducer(initialState, platformReducers) {
   return combineReducers({
      ...platformReducers,
      app,
      cart,
      member,
      options,
      products,
      settings,
      user,
      navigation
   });
}
