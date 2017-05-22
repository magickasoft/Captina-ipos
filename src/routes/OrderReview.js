import React from 'react'
import {
    View,
    StyleSheet,
    Text,
    ListView,
    TouchableOpacity
} from 'react-native'

import RadioForm, {RadioButton} from 'react-native-simple-radio-button'
import Moment from 'moment'

import { connect } from 'react-redux'
import { bindActionCreators } from 'redux'
import {popRoute, pushRoute} from "../redux/navigation"
import { getCartTotals } from '../store/cart/selectors'
import { setGratuity } from '../store/cart/actions'

import Form from '../components/Form'
import Loader from '../components/Loader'
import NavigationButton from '../components/NavigationButton'

import { Colors, Gratuities, Routes, takenShippingOptionValue, Fields, shippingMethodTitle, Holds, dateFormat, GlobalStyles } from '../global/constants'
import { hideCardNumber, makeFullAddress } from '../global/functions'

@connect(state => ({
        isLoading: state.products.get(`isLoading`),
        cart: state.cart,
        member: state.member,
        options: state.options
    }),
    dispatch => bindActionCreators({
        pushRoute,
        popRoute,
        setGratuity
    }, dispatch))

export default class OrderReview extends React.Component {

    constructor(props) {
        super(props)
        this.dataSource = new ListView.DataSource({rowHasChanged: (r1, r2) => r1 !== r2});
    }

    totalPrice(quantity, price) {
        let total = 0;
        try {
            total = '$ ' + parseFloat(price) * quantity
        } catch (error) {
            console.log(error)
        }
        return total;
    }

    quantityById = (quantityId) => {
        const { cart } = this.props;
        return cart.quantityById.get(quantityId) || 0;
    }

    renderCart(ca, sectionId, rowId) {
        let quantity = this.quantityById(ca.cat_id);
        return (
            <View style={[Styles.cartRow, Styles.borderBottomRow]}>
                <View style={[{flex: 0.6}]}>
                    <Text style={[Styles.textNameInRow, Styles.textCart]}>{ca.description}</Text>
                </View>
                <View style={[{flex: 0.1}]}>
                    <Text style={[Styles.textQuantityInRow, Styles.textCart]}>{quantity}</Text>
                </View>
                <View style={[{flex: 0.1}]}>
                    <Text style={[Styles.textPriceInRow, Styles.textCart]}>{'$ ' + ca.price}</Text>
                </View>
                <View style={[{flex: 0.2}]}>
                    <Text style={[Styles.textTotalInRow, Styles.textCart]}>{this.totalPrice(quantity, ca.price)}</Text>
                </View>
            </View>
        )
    }

    renderShippingInfo() {
        const { member, options } = this.props;
        const club_ship_meth_pref = member.get(Fields.club_ship_meth_pref)
        const ship_addr = makeFullAddress(member.get('ship_addr1'), member.get('ship_addr2'), member.get('ship_city'), member.get('ship_state'), member.get('ship_postal'))
        if (club_ship_meth_pref === takenShippingOptionValue) {
            return (
                <View style={[Styles.textInRow]}>
                    <Text style={[Styles.textTitle]}>{shippingMethodTitle}</Text><Text style={[Styles.textInfo]}>{options.shippingOptions.get(club_ship_meth_pref)}</Text>
                </View>
            )
        } else {
            const ship_hold_index = member.get(`ship_hold_index`)
            let hold = Holds[ship_hold_index]
            if (ship_hold_index == 1) {
                hold += ` (${Moment(member.get(`ship_hold_date`)).format(dateFormat)})`
            }
            return (
                <View>
                    <View style={[Styles.textInRow]}>
                        <Text style={[Styles.textTitle]}>Name</Text><Text style={[Styles.textInfo]}>{member.get('ship_name')}</Text>
                    </View>
                    <View style={[Styles.textInRow]}>
                        <Text style={[Styles.textTitle]}>Address</Text><Text style={[Styles.textInfo]}>{ship_addr}</Text>
                    </View>
                    <View style={[Styles.textInRow]}>
                        <Text style={[Styles.textTitle]}>Phone</Text><Text style={[Styles.textInfo]}>{member.get('ship_phone')}</Text>
                    </View>
                    <View style={[Styles.textInRow]}>
                        <Text style={[Styles.textTitle]}>Notes</Text><Text style={[Styles.textInfo]}>{member.get('special_instructions')}</Text>
                    </View>
                    {ship_hold_index > 0 &&
                        <View style={[Styles.textInRow]}>
                            <Text style={[Styles.textTitle]}>Hold</Text><Text style={[Styles.textInfo]}>{hold}</Text>
                        </View>
                    }
                </View>
            )
        }
    }

    render () {
        const { popRoute, pushRoute, isLoading, cart, member, setGratuity } = this.props;
        const { productsNet, taxable, shipping, discount, grandTotal, salesTax } = getCartTotals(cart)
        const bill_addr = makeFullAddress(member.get('bill_addr1'), member.get('bill_addr2'), member.get('bill_city'), member.get('bill_state'), member.get('bill_postal'))
        return (
            <View style={Styles.container}>
                <View style={Styles.blockTop}>
                    <Form style={[{flex: 1}]} title='Billing Info'>
                        <View style={[Styles.textInRow]}>
                            <Text style={[Styles.textTitle]}>Name</Text><Text style={[Styles.textInfo]}>{member.get('bill_name')}</Text>
                        </View>
                        <View style={[Styles.textInRow]}>
                            <Text style={[Styles.textTitle]}>Address</Text><Text style={[Styles.textInfo]}>{bill_addr}</Text>
                        </View>
                        <View style={[Styles.textInRow]}>
                            <Text style={[Styles.textTitle]}>Phone</Text><Text style={[Styles.textInfo]}>{member.get('bill_phone')}</Text>
                        </View>
                        <View style={[Styles.textInRow]}>
                            <Text style={[Styles.textTitle]}>Email</Text><Text style={[Styles.textInfo]}>{member.get('bill_email')}</Text>
                        </View>
                        <View style={[Styles.textInRow]}>
                            <Text style={[Styles.textTitle]}>Credit Card #</Text><Text style={[Styles.textInfo]}>{hideCardNumber(member.get('cc_num'))}</Text>
                        </View>
                    </Form>
                    <Form style={[{flex: 1}]} title='Shipping Info'>
                        {this.renderShippingInfo()}
                    </Form>
                </View>
                <View style={Styles.blockCenter}>
                    <Form style={[{flex: 1}]}>
                        <View style={[Styles.topTable, Styles.marginRowTable]}>
                            <Text style={[Styles.textTHead, {flex: 0.6, textAlign: 'left'}]}>NAME</Text>
                            <Text style={[Styles.textTHead, {flex: 0.1, textAlign: 'center'}]}>QUANTITY</Text>
                            <Text style={[Styles.textTHead, {flex: 0.1, textAlign: 'center'}]}>EACH</Text>
                            <Text style={[Styles.textTHead, {flex: 0.2, textAlign: 'center'}]}>TOTAL</Text>
                        </View>
                        <View style={[Styles.centerTable, Styles.marginRowTable]}>
                            {isLoading ?
                                <Loader />
                                :  <ListView
                                    dataSource={this.dataSource.cloneWithRows(cart.lzCartArrayMap.toJS())}
                                    renderRow={(rowData, sectionId, rowId) => this.renderCart(rowData, sectionId, rowId)}
                                    // style={Styles.wines}
                                    enableEmptySections
                                    //pageSize={10}
                                />
                            }
                        </View>
                        <View style={[Styles.bottomTable, Styles.marginRowTable]}>
                            <View style={Styles.bottomTableLeft}>
                                <Text style={Styles.textLeftTitleBottom}>ADD GRATUITY</Text>
                                <RadioForm
                                    initial={0}
                                    // formHorizontal={true}
                                    animation={true}
                                >
                                    {Gratuities.map((gratuity, i) => {
                                        const gratuity_index = cart.get(`gratuity_index`)
                                        const isSelected = gratuity_index === gratuity.value
                                        return (
                                            <View key={i}>
                                                <RadioButton
                                                    isSelected={isSelected}
                                                    obj={gratuity}
                                                    index={i}
                                                    labelHorizontal={true}
                                                    buttonColor={'#2196f3'}
                                                    buttonSize={11}
                                                    labelColor={'#000'}
                                                    onPress={(value, index) => {
                                                        if (index === 4) {
                                                            setGratuity(0, index)
                                                        } else {
                                                            setGratuity(gratuity.percent, index)
                                                        }
                                                    }}
                                                />
                                            </View>
                                        )
                                    })}
                                </RadioForm>
                            </View>
                            <View style={Styles.bottomTableRight}>
                                <View style={[Styles.textBlockBottom]}>
                                    <Text style={[Styles.textTitleBottom]}>Product Total</Text><Text style={Styles.currency}> $ </Text><Text style={[Styles.textInfoBottom]}>{productsNet}</Text>
                                </View>
                                <View style={[Styles.textBlockBottom]}>
                                    <Text style={[Styles.textTitleBottom]}>Taxable</Text><Text style={Styles.currency}> $ </Text><Text style={[Styles.textInfoBottom]}>{taxable}</Text>
                                </View>
                                <View style={[Styles.textBlockBottom]}>
                                    <Text style={[Styles.textTitleBottom]}>Discount</Text><Text style={Styles.currency}> $ </Text><Text style={[Styles.textInfoBottom]}>{discount}</Text>
                                </View>
                                <View style={[Styles.textBlockBottom]}>
                                    <Text style={[Styles.textTitleBottom]}>Shipping Cost</Text><Text style={Styles.currency}> $ </Text><Text style={[Styles.textInfoBottom]}>{shipping}</Text>
                                </View>
                                <View style={[Styles.textBlockBottom]}>
                                    <Text style={[Styles.textTitleBottom]}>Sales Tax (@ 8.25%)</Text><Text style={Styles.currency}> $ </Text><Text style={[Styles.textInfoBottom]}>{salesTax}</Text>
                                </View>
                            </View>
                        </View>
                    </Form>
                </View>
                <View style={GlobalStyles.bottom}>
                    <NavigationButton onPress={() => popRoute()} />
                    <NavigationButton onPress={() => pushRoute(Routes.Signature)} isNext />
                </View>
            </View>
        )
    }
}

const Styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: 'white',
        paddingTop: 20
    },
    textCart: {
        marginLeft: 15,
        fontSize: 17
    },
    textNameInRow: {
        textAlign: 'left',
        paddingLeft: 15,
        fontWeight: 'bold',
        color: Colors.darkGrey
    },
    textQuantityInRow: {
        textAlign: 'left',
        paddingLeft: 15,
        color: Colors.darkGrey
    },
    textPriceInRow: {
        textAlign: 'left',
        paddingLeft: 15,
        color: Colors.darkGrey
    },
    textTotalInRow: {
        textAlign: 'right',
        paddingRight: 15,
        color: Colors.darkGrey
    },
    borderBottomRow: {
        borderColor: Colors.grey2,
        borderBottomWidth: 1
    },
    cartRow: {
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        height: 35
    },
    blockTop: {
        flexDirection: 'row',
        height: 220
    },
    textTHead: {
        fontSize: 16,
        fontWeight: '600',
        textAlign: 'center',
        marginLeft: 12,
        alignSelf: 'center',
        color: Colors.iosNativeBlue
    },
    currency: {
        paddingLeft: 20,
        paddingRight: 20,
        fontSize: 16,
        textAlign: 'center',
        color: Colors.darkGrey
    },
    textInRow: {
        flexDirection: 'row',
        marginBottom: 10
    },
    textBlockBottom: {
        flexDirection: 'row',
        marginBottom: 3
    },
    textTitle: {
        flex: 0.8,
        textAlign: 'right',
        marginRight: 35,
        fontSize: 16,
        fontWeight: 'bold'
    },
    textLeftTitleBottom:{
        fontStyle: 'italic',
        color: Colors.darkGrey,
        paddingRight: 15,
        paddingBottom: 5,
        fontSize: 14,
        fontWeight: 'bold'
    },
    textTitleBottom: {
        flex: 0.8,
        textAlign: 'right',
        fontStyle: 'italic',
        color: Colors.darkGrey,
        paddingRight: 15,
        paddingBottom: 5,
        fontSize: 16,
        fontWeight: 'bold'
    },
    textInfoBottom: {
        color: Colors.darkGrey,
        fontSize: 16,
        textAlign: 'right',
        paddingRight: 15,
        flex: 0.2
    },
    textInfo: {
        flex: 1
    },
    billToLeft: {
        flex: 0.4
    },
    billToRight: {
        flex: 0.6
    },
    marginRowTable: {
        margin: 0
    },
    topTable: {
        height: 55,
        borderWidth: 1,
        flexDirection: 'row',
        borderColor: Colors.grey2
    },
    centerTable: {
        flex: 1,
        borderWidth: 1,
        borderColor: Colors.grey2
    },
    bottomTableRight: {
        flex: 1
    },
    bottomTableLeft: {
        marginLeft: 50,
        flex: 1
    },
    bottomTable: {
        flexDirection: 'row',
        flex: 1,
        paddingTop: 15,
        // height: 0,
        borderWidth: 1,
        borderColor: Colors.grey2
    },
    blockCenter: {
        flex: 1
    },
    blockBottom: {
        height: 80,
        flexDirection: 'row',
        alignItems: 'center'
    }
});
