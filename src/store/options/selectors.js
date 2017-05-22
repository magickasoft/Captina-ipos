/**
 * Created by lents on 7/24/16.
 */

export function listShippingOptions(state) {
    return state.toObject()
}

export function getClubTypesOptions(state) {
    return keys(state).reduce((variantMap, clubId) => {
        const club = state[clubId]
        return keys(club)
            .filter(key => key.startsWith('variant'))
            .reduce((clubVariant, idx) => {
                let variantIdx = club['club_type_id'] + '_' + idx.replace('variant', '')
                let clubDescription = club['club_name']
                if (!isEmpty(club[idx])) {
                    clubDescription += ` - ${club[idx]}`
                }
                clubVariant[variantIdx] = clubDescription
                return clubVariant
            }, variantMap)
    }, {})
}

export function getSalesRepOptions(state) {
    return keys(state)
        .map(key => getSalesRep(state, key))
}

export function getSalesRepName(state, id) {
    return `${state[id]['name_first']} ${state[id]['name_last']}`
}

export function getSalesRep(state, id) {
    return {
        id: id,
        name: getSalesRepName(state, id)
    }
}

export function getReferrerOptions(state) {
    return keys(state).map(key => {
        return {
            id: key,
            name: `${state[key]['referrer_name']}`
        }
    })
}
