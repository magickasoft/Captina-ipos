import {fromJS, Record, Map, OrderedMap, Seq} from 'immutable'
//import normalizeForSearch  from 'normalize-for-search'
import {has} from 'lodash'
import CatalogItem from './catalogItem'

import {
   REQUEST_PRODUCTS,
   RECEIVE_PRODUCTS,
   PRODUCTS_LOADING_COMPLETED,
   ENABLE_PRODUCTS_FILTER,
   CLEAR_PRODUCTS_FILTER,
   RECEIVE_PROMO_CATALOG_UPDATE,
   REQUEST_PROMO_CATALOG_UPDATE_ERROR,
   RECEIVE_CLUSTERS
} from '../actionTypes'

const InitialState = Record({
   byId: OrderedMap(),
   clustersMap: OrderedMap(),
   filter: {
      enabled: false,
      searchString: ''
   },
   visibleIds: Seq(),
   clusterSequence: Seq(),
   isLoading: true,
   receivedAt: null,
   updatedAt: null,
   error: null
})
const initialState = new InitialState

// process incoming catalog items as immutable Map of Product records, sorted by description

const normalizeCatalogData = (productData = []) => {
   const byId = fromJS(productData).reduce((products, item) =>
         products.set(item.get('cat_id'), new CatalogItem(item))
      , Map({}))
      .sortBy(item => item.description)

   const visibleIds = byId.keySeq()

   return {
      byId: byId,
      visibleIds: visibleIds
   }
}

const normalizeClusterData = (clusterData = []) => {
   const clustersMap     = fromJS(clusterData)
      .reduce((clusters, cluster) =>
            clusters.set(cluster.get('cluster_id'), cluster)
         , Map({}))


   const clusterSequence = clustersMap
      .sort((a, b) => a.get('sequence').toString().localeCompare(b.get('sequence'), 'en', {numeric: true}))
      .keySeq()
      .filterNot(key => key == 0)
   return {
      clustersMap: clustersMap,
      clusterSequence: clusterSequence
   }
}

export default function productsReducer(state = initialState, action) {
   if (!(state instanceof InitialState)) return initialState

   switch (action.type) {

      case REQUEST_PRODUCTS:
         return state.set('isLoading', true)

      case RECEIVE_PRODUCTS:
         const {products, receivedAt} = action.payload
         //console.log(action)
         //console.log(products)
         return state.mergeDeep({
            ...normalizeCatalogData(products),
            receivedAt: receivedAt
         })

      case RECEIVE_CLUSTERS:
         const {clusters} = action.payload

         return state.mergeDeep(normalizeClusterData(clusters))

      case RECEIVE_PROMO_CATALOG_UPDATE:
         // const catalogUpdate = byKeyFn(action.payload, 'cat_id')
         // return state.mergeDeep( byKeyMapSorted(action.payload, 'cat_id')('description') )
         // return {...state, ...catalogUpdate}
         const {promoDetails, updatedAt} = action.payload
         return state.mergeDeep({
            ...normalizeCatalogData(promoDetails),
            updatedAt: updatedAt
         })

      case REQUEST_PROMO_CATALOG_UPDATE_ERROR:
         // return state.update(...action.error )
         return state.set('error', action.error)

      case PRODUCTS_LOADING_COMPLETED:
         return state.set('isLoading', false)

      default:
         return state
   }
}

// function visibleIds(state = initialState, action) {
//    if (!(state instanceof InitialState)) return initialState
//
//    switch (action.type) {
//       case ENABLE_PRODUCTS_FILTER:
//          const products = action.payload
//          if (products) {
//             return keyMapFn(products, 'cat_id')
//          }
//
//       default:
//          return state
//    }
// }

function filter(state = initialState, action) {
   if (!(state instanceof InitialState)) return initialState

   switch (action.type) {

      case ENABLE_PRODUCTS_FILTER:
         if (action.filter) {
            return {
               ...state,
               enabled: true,
               searchString: action.filter
            }
         }

      case CLEAR_PRODUCTS_FILTER:
         return {
            ...state,
            enabled: false,
            searchString: null
         }

      default:
         return state
   }
}


