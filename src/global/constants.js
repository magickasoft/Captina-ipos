import {
    StyleSheet
} from 'react-native'

export const takenShippingOptionValue = `taken`
export const shippingMethodTitle = `Shipping Method`
export const dateFormat = `MMMM DD YYYY`
export const storedDateFormat = `YYYY-MM-DD`

export const Validators = {
    numbers: /\d+/g,
    characters: /\[A-Za-z]/g,
    cards: {
        visa: "^4[0-9]{12}(?:[0-9]{3})?$",
        amex: "^3[47][0-9]{13}$",
        mastercard: "^5[1-5][0-9]{14}$"
    }
}

export const Fields = {
    club_ship_meth_pref: 'club_ship_meth_pref',
    bill_email: 'bill_email',
    bill_name: 'bill_name',
    bill_addr1: 'bill_addr1',
    bill_addr2: 'bill_addr2',
    bill_postal: 'bill_postal',
    bill_city: 'bill_city',
    bill_state: 'bill_state',
    bill_phone: 'bill_phone',

    ship_name: 'ship_name',
    ship_addr1: 'ship_addr1',
    ship_addr2: 'ship_addr2',
    ship_postal: 'ship_postal',
    ship_city: 'ship_city',
    ship_state: 'ship_state',
    ship_phone: 'ship_phone',

    cc_num: 'cc_num',
    cc_cvv: 'cc_cvv',
    cc_exp_mo: 'cc_exp_mo',
    cc_exp_yr: 'cc_exp_yr'

}

export const Gratuities = [
    {label: 'None', value: 0, percent: 0 },
    {label: '5%', value: 1, percent: 5 },
    {label: '10%', value: 2, percent: 10 },
    {label: '20%', value: 3, percent: 20 },
    {label: 'Other-Amount', value: 4 }
];

export const Colors = {
    grey: '#A8BBBA',
    grey2: '#EEF0F1',
    red: '#E46868',
    green: '#309590',
    iosNativeBlue: '#057DFF',
    iosNateveGreen: '#56DD0B',
    iosNativeGray: '#CCCCCC',
    darkGrey: '#A9A9A9',
    deepSkyBlue: '#00BFFF',
    darkOrchid: '#9932CC',
    crimson: '#DC143C',
    skyBlue: '#0066cc'
}

export const Routes = {
    Authentication: 'Authentication',
    LogIn: 'Log in',
    Wines: 'Wines',
    Checkout: 'Checkout',
    ClubMembership: 'ClubMembership',
    Signature: 'Signature',
    SuccessPage: 'SuccessPage',
    OrderReview: 'OrderReview'
}

export const Categories = {
    1: 'Featured',
    2: 'Current Wines',
    3: 'Wine Club Wines',
    4: 'Olive Oils',
    5: 'Jams & Preserves',
    6: 'Pantry',
    8: 'Wine Tools',
    9: 'Sunset Suppers',
    10: 'Gifts',
    15: 'Personal',
    18: 'Unknown category',
    19: 'Unknown category',
    20: 'Unknown category'
}

export const Holds = [
    'No',
    'Date',
    'Weather'
]

export const borderSize = 1
export const borderColor = 'black'
export const bottomBarHeight = 64
export const GlobalStyles = StyleSheet.create({
    input: {
        height: 42,
        borderWidth: 1,
        borderColor: Colors.grey,
        borderRadius: 6,
        paddingHorizontal: 16
    },
    next: {
        marginTop: 16
    },
    button: {
        paddingHorizontal: 16,
        height: 40,
        borderRadius: 6,
        justifyContent: 'center',
        backgroundColor: Colors.green,
        borderWidth: 1,
        borderColor: Colors.grey
    },
    buttonText: {
        backgroundColor: 'transparent',
        alignSelf: 'center',
        color: 'white',
        fontWeight: 'bold',
        fontSize: 18
    },
    iosNativeButton: {
        paddingHorizontal: 16,
        height: 40,
        justifyContent: 'center',
        backgroundColor: 'transparent',
        alignItems: 'center'
    },
    iosNativeButtonText: {
        backgroundColor: 'transparent',
        color: Colors.iosNativeBlue,
        fontSize: 15
    },
    submitButtons: {
        flex: 1.2,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center'
    },
    bottom: {
        height: bottomBarHeight,
        flexDirection: 'row',
        alignItems: 'center',
        borderTopWidth: borderSize,
        borderColor,
        justifyContent: 'space-between'
    }
})