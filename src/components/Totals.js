import React, { PropTypes } from 'react'
import {
    Text,
    View,
    StyleSheet,
    // Image,
    // TouchableOpacity
} from 'react-native'

import { getCartTotals } from '../store/cart/selectors'

export default class Totals extends React.Component {

    render() {
        const { style, cart } = this.props
        const { productsNet, shipping, discount, grandTotal } = getCartTotals(cart)
        return (
            <View style={[Styles.totals, style]}>
                <Text style={Styles.label}>Products cost:</Text><Text style={Styles.total}>{productsNet}</Text>
                <Text style={Styles.label}>Delivery:</Text><Text style={Styles.total}>{shipping}</Text>
                <Text style={Styles.label}>Discount:</Text><Text style={Styles.total}>{discount}</Text>
                <Text style={Styles.label}>Total:</Text><Text style={Styles.total}>{grandTotal}</Text>
            </View>
        )
    }

}

Totals.propTypes = {
    cart: PropTypes.object.isRequired,
    // imageHome: PropTypes.object.isRequired,
    // imageView: PropTypes.object.isRequired
}

const Styles = StyleSheet.create({
    totals: {
        flex: 1,
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center'
    },
    image: {
        width: 40,
        height: 40,
        marginLeft: 5
    },
    label: {
        fontWeight: 'bold',
        fontSize: 18
    },
    total: {
        fontSize: 21,
        marginRight: 16
    }
})