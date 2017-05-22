/**
 * Created by lents on 6/2/16.
 */

export const createAction = (type, payload = {}) => ({type, payload})

export const keyMapFn = (data, key = 'id') => data.map(item => item[key])
export const byKeyFn = (data, key = 'id') => data.reduce((obj, item) => {
   obj[item[key]] = item
   return obj
}, {})

// const byKeyMap = (data, key = 'id') => data.reduce((idMap, item) => {
//    idMap.set([item[key]], item)
//    return idMap
// }, new Map())

export const byKeySorted = (data, key) => (sortField) => byKeyFn(orderBy(data, sortField), key)
// export const byKeyMapSorted = (data, key) => (sortField) => byKeyMap(orderBy(data, sortField), key)
