import {
    NavigationExperimental
} from 'react-native'
import { Routes } from '../global/constants'

const {
    StateUtils: NavigationStateUtils
} = NavigationExperimental

const types = {
    PUSH : 'PUSH',
    POP: 'POP',
    SET_INITIAL: 'SET_INITIAL',
    SET_WINES: 'SET_WINES',
    DISABLE_UPDATING_ROUTES: 'DISABLE_UPDATING_ROUTES'
}

export function pushRoute(route) {
    return {
        type: types.PUSH,
        route
    }
}

export function popRoute(needUpdateRoute = false) {
    return {
        type: types.POP,
        needUpdateRoute
    }
}

export function setInitialRoute() {
    return {
        type: types.SET_INITIAL
    }
}

export function setWinesRoute() {
    return {
        type: types.SET_WINES
    }
}

export function disableUpdatingRoutes() {
    return {
        type: types.POP
    }
}

const initialState = {
    index: 0,
    routes: [{key: Routes.Checkout}],
    needUpdateRoute: false
}

const winesState = {
    index: 0,
    routes: [{key: Routes.Wines}],
    needUpdateRoute: false
}

export default function(state = Object.assign({}, initialState), action) {
    switch (action.type) {
        case types.PUSH:
            return NavigationStateUtils.push(state, {key: action.route})
        case types.POP:
            state = NavigationStateUtils.pop(state)
            state.needUpdateRoute = action.needUpdateRoute
            return state
        case types.SET_INITIAL:
            return initialState
        case types.SET_WINES:
            return winesState
        case types.DISABLE_UPDATING_ROUTES:
            state.needUpdateRoute = false
            return state
        default:
            return state
    }
}
