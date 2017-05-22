/**
 * Project: iOS-Cart
 * Package:
 * Module: member
 * Author: lents
 * Date: 4/28/16
 * Create with: IntelliJ IDEA.
 */

import * as types from '../actionTypes'
import {createAction} from '../helpers'

export const requestAllPrefs = () => createAction(types.REQUEST_PREFS)
export const receiveAllPrefs = (prefsData) => createAction(types.RECEIVE_PREFS, prefsData)

export const requestConfig = () => createAction(types.REQUEST_CONFIG)
export const receiveConfig = (configData) => createAction(types.RECEIVE_CONFIG, configData)

export const requestStore = () => createAction(types.REQUEST_STORE)
export const receiveStore = (storeData) => createAction(types.RECEIVE_STORE, storeData)
