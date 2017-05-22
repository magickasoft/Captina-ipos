/**
 * Created by lents on 7/27/16.
 */
import { Map } from 'immutable'

export function getProductCatSizes(state, id) {
   const product = getProduct(state, id)
   const catSizes = product.get(`cat_sizes`)
   if (catSizes && catSizes.size) {
      return catSizes.map(catSize => {
         if (catSize.get(`active`) === '1') {
            return Map({
               id: catSize.get('cat_size_id'),
               sizeString: catSize.get('size_str')
            })
         }
      })
   }
   return []
}

export const getProduct = (state, id) => {
   const product = Map(state.getIn(['byId', id]))
   return product.set('cluster_name', state.getIn['clustersMap', product.get('cluster_id')])
}

export const getVisibleProducts = (state) =>
   state.get('visibleIds')
      .map(id => getProduct(state, id))
      .cacheResult()

export const getCluster = (state, id) =>
   state.getIn(['clustersMap', id]).toJS()

export const getProductClusters = (state) => {
   const products = state.get('byId')
   return state.get('clusterSequence')
      .filter(clusterId => products.some(product => product.get('cluster_id') === clusterId))
      .map(id => getCluster(state, id))
      // .cacheResult()
      //.filter(cluster => parseInt(cluster.cluster_id) > 0)
      //.filterNot(cluster => !cluster.get('cluster_id'))
      // .filter(cluster => state.hasIn(['byId', 'cluster', cluster.get('cluster_id')]))
      // .filter(cluster => state.get('byId')
      //    .some(product => product.get('cluster_id') === cluster.get('cluster_id')))
      //.map(id => getCluster(state, id))
}
export const isLoadingProducts = (state) => state.get('isLoading') || state.get('clustersMap').isEmpty()
export const lastModified = (state) => state.get('updatedAt') || state.get('receivedAt')
