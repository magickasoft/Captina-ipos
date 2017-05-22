//noinspection JSUnresolvedVariable
import React, { Component } from 'react';
//noinspection JSUnresolvedVariable
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';

import Sketch from 'react-native-sketch';

import { connect } from 'react-redux'
import { popRoute, pushRoute } from "../redux/navigation";
import { bindActionCreators } from 'redux'
import { receiveMember } from '../store/member/actions'
import { getCartTotals } from '../store/cart/selectors'

import Form from '../components/Form'
import NavigationButton from '../components/NavigationButton'

import { Colors, GlobalStyles } from '../global/constants'

@connect(state => ({
        member: state.member,
        navigation: state.navigation,
        cart: state.cart
    }),
    dispatch => bindActionCreators({
        pushRoute,
        popRoute,
        receiveMember
    }, dispatch))

export default class Signature extends React.Component {

    constructor(props) {
        super(props);
        const { cart, member } = this.props;

        this.onReset = this.onReset.bind(this);
        this.onSave = this.onSave.bind(this);
        this.onUpdate = this.onUpdate.bind(this);
        this.state = {
            value: 0,
            encodedSignature: null
        }
    }

    onReset() {
        console.log('The drawing has been cleared!');
    }

    onSave() {
        this.sketch.saveImage(this.state.encodedSignature)
            .then((data) => console.log(data))
            .catch((error) => console.log(error));
    }

    onUpdate(base64Image) {
        this.setState({
            encodedSignature: base64Image,
        });
    }

    render() {
        const { popRoute, cart } = this.props;
        const { productsNet, taxable, discount, shipping, salesTax, tip, grandTotal } = getCartTotals(cart)

        return (
            <View style={styles.container}>
                <Form style={styles.topContainer} title='Gratuity'>
                    <View style={styles.leftTopContainer} ></View>
                    <View style={styles.currencyTopContainer}>
                        <Text style={styles.headerText}></Text>
                        <View style={styles.alignText}>
                            <Text style={styles.text}>Product Total</Text>
                            <Text style={styles.text}>Taxable</Text>
                            <Text style={styles.text}>Discount</Text>
                            <Text style={styles.text}>Shipping Cost</Text>
                            <Text style={styles.text}>Sales Tax (@ 8.25%)</Text>
                            <Text style={styles.text}>Gratuity</Text>
                            <Text style={styles.text}>---------</Text>
                            <Text style={styles.text}>Order Total</Text>
                        </View>

                    </View>
                    <View style={styles.centerTopContainer}>
                        <Text style={styles.headerText}> </Text>
                        <View>
                            <Text style={styles.text}>$</Text>
                            <Text style={styles.text}>$</Text>
                            <Text style={styles.text}>$</Text>
                            <Text style={styles.text}>$</Text>
                            <Text style={styles.text}>$</Text>
                            <Text style={styles.text}>$</Text>
                            <Text style={styles.text}>--</Text>
                            <Text style={styles.text}>$</Text>
                        </View>

                    </View>
                    <View style={styles.rightTopContainer}>
                        <Text style={styles.headerText}>ORDER SUMMARY</Text>
                        <View style={styles.alignText}>
                            <Text style={styles.text}>{productsNet}</Text>
                            <Text style={styles.text}>{taxable}</Text>
                            <Text style={styles.text}>{discount}</Text>
                            <Text style={styles.text}>{shipping}</Text>
                            <Text style={styles.text}>{salesTax}</Text>
                            <Text style={styles.text}>{tip}</Text>
                            <Text style={styles.text}>---------</Text>
                            <Text style={styles.text}>{grandTotal}</Text>
                        </View>
                    </View>
                </Form>
                <Sketch
                    fillColor="#f5f5f5"
                    strokeColor="#111111"
                    strokeThickness={2}
                    onReset={this.onReset}
                    onUpdate={this.onUpdate}
                    ref={(sketch) => {
                        this.sketch = sketch
                    }}
                    style={styles.sketch}
                />
                <View style={GlobalStyles.bottom}>
                    <NavigationButton onPress={() => popRoute()} />
                    {this.state.encodedSignature && <NavigationButton onPress={this.onSave} isNext />}
                </View>
            </View>
        );
    }

}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: 'white'
    },
    topContainer: {
        marginTop: 28,
        flexDirection: "row",
        padding: 20
    },
    leftTopContainer: {
        flex: 0.5,
        padding: 10,
        marginLeft: 100
    },
    currencyTopContainer: {
        flex: 0.2,
        padding: 10
    },
    centerTopContainer: {
        flex: 0.1,
        padding: 10
    },
    rightTopContainer: {
        flex: 0.2,
        padding: 10
    },
    instructions: {
        fontSize: 16,
        marginBottom: 20,
        textAlign: 'center'
    },
    sketch: {
        borderWidth: 1,
        borderColor: Colors.grey2,
        margin: 8,
        marginTop: 0
    },
    headerText: {
        fontSize: 15,
        fontWeight: 'bold',
        textAlign: 'left'
    },
    alignText: {
        alignItems: 'flex-end'
    },
    text: {
        color: Colors.darkGrey,
        marginTop: 3,
        fontWeight: 'bold'
    }
});