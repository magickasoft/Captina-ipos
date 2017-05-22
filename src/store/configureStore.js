
import createSagaMiddleware from 'redux-saga'
// import isomorphicFetch from 'isomorphic-fetch'
import devTools from 'remote-redux-devtools'
import { createStore, applyMiddleware, compose } from 'redux'
import sagas from './sagas'
// import validate from '../services/validate'

import configureReducer from './configureReducer'

// Reset app state on logout, stackoverflow.com/q/35622588/233902.
// const resetOnLogout = (reducer, initialState) => (state, action) => {
//    if (action.type === LOGOUT) {
//       state = {
//          device: initialState.device,
//          intl: initialState.intl,
//          routing: state.routing // Note routing state has to be reused.
//       };
//    }
//    return reducer(state, action);
// };

export default function configureStore(initialState) {
   const sagaMiddleware = createSagaMiddleware()
   const enhancer = compose(
       applyMiddleware(sagaMiddleware),
       devTools()
       //devTools({filters: {blacklist: ['EFFECT_RESOLVED', 'EFFECT_TRIGGERED', 'REGISTER_FIELD']}})
       // window && window.devToolsExtension ? window.devToolsExtension() : f => f
   )
   // if (module.hot) {
   //    // Enable Webpack hot module replacement for reducers
   //    module.hot.accept('../reducers', () => {
   //       const nextReducer = require('../reducers')
   //       store.replaceReducer(nextReducer)
   //    })
   // }
   return {
       ...createStore(configureReducer(), initialState, enhancer),
       runSaga: sagaMiddleware.run(sagas)
   }
}
