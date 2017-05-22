/**
 * Project: iOS-Cart
 * Package:
 * Module: member
 * Author: lents
 * Date: 4/18/16
 * Create with: IntelliJ IDEA.
 */
// import moment from 'moment/moment'
import * as types from '../actionTypes'
import {createAction} from '../helpers'

// export const requestMember = () => createAction(types.REQUEST_MEMBER)
export const findMemberByEmail = (email) => createAction(types.REQUEST_MEMBER_BY_EMAIL, email)
export const receiveMember = (memberData) => createAction(types.RECEIVE_MEMBER, memberData)
export const updateMemberInfo = (memberInfo) => createAction(types.UPDATE_MEMBER_INFO, memberInfo)
export const requestBillingAddress = (zipCode, completion) => ({type: types.REQUEST_ZIP_CODE_BILLING, zipCode, completion});
export const requestShippingAddress = (zipCode, completion) => ({type: types.REQUEST_ZIP_CODE_BILLING, zipCode, completion});