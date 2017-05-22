import {Record} from 'immutable'

// import { combineReducers } from 'redux'
import * as types from '../actionTypes'

const InitialState = Record({
    vip_id: '11157',
    is_vip: '1',
    is_flag2: '1',
    is_flag3: '1',
    is_flag4: '0',
    is_flag5: '0',
    is_flag6: '0',
    join_date: '2011-12-16',
    active: '1',
    receipts: '1',
    offers: '1',
    newsletters: '1',
    bounced: '0',
    spammed: '0',
    list_id: '14550',
    bill_name: 'David Lents',
    name_last: 'Lents',
    name_first: 'David',
    bill_dob: '1963-07-24',
    bill_addr1: '354 Los Alamos Rd.',
    bill_addr2: '',
    bill_city: 'Santa Rosa',
    bill_state: 'CA',
    bill_postal: '95409',
    bill_country: 'US',
    bill_phone: '(707) 393-8892',
    bill_phone_ext: '',
    bill_phone_type: '---',
    bill_email: 'david@lents.net',
    bill_pass: 'qwe123',
    bill_is_club_order: false,
    ship_name: 'Ronald Lents',
    spouse_name: '',
    salutation: 'David',
    ship_dob: '1990-12-16',
    ship_addr1: '7 Woodgrove Dr',
    ship_addr2: '',
    ship_city: 'Jackson',
    ship_state: 'TN',
    ship_postal: '38305',
    ship_country: 'US',
    ship_addr_type: 'residential',
    ship_hold_index: 0,
    ship_hold_date: new Date(),
    ups_location_id: '0',
    ship_phone: '(707) 393-8892',
    ship_phone_ext: '',
    ship_phone_type: '---',
    ship_email: '',
    cell_phone: '',
    cc_id: '72664',
    will_pickup_club: '0',
    club_ship_meth_pref: 'ground',
    over_alloc_level: '100',
    special_instructions: '',
    linked_id: '0',
    photo: '',
    locked: '0',
    cc_exp_mo: '9',
    cc_exp_yr: '2015',
    cc_type: 'Visa',
    cc_is_cardreader: false,
    retired: '0',
    cc_num: '4111-1111-1111-1111',
    cc_cvv: '333',
    error: '',
    isFindingMemberByEmail: false
})
const initialState = new InitialState

export default function memberReducer(state = initialState, action) {
    if (!(state instanceof InitialState)) return initialState

    switch (action.type) {
        case types.RECEIVE_MEMBER:
        case types.UPDATE_MEMBER_INFO:
            return state.merge(action.payload)

        default:
            return state
    }
}
