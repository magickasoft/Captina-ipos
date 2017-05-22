import React, { PropTypes } from 'react'
//noinspection JSUnresolvedVariable
import {
    View,
    StyleSheet,
    Dimensions,
    Text,
    Image,
    TextInput,
    TouchableOpacity
} from 'react-native'
import { Colors } from '../global/constants'

export default class SuccessPage extends React.Component {

    render() {
        return (
            <View style={Styles.container}>
                <View style={Styles.topContainer}></View>
                <View style={Styles.resultContainer}>
                    <View style={Styles.success}>
                        <Image
                            style={Styles.image}
                            source={require('../global/image/like.png')}
                        />
                        <Text style={Styles.textSuccess}>Success</Text>
                        <Image
                            style={[Styles.image, {transform: [{skewY: '180deg'}]}]}
                            source={require('../global/image/like.png')}
                        />
                    </View>

                    <Text style={[Styles.text, {marginBottom: 20}]}>Congratulations !</Text>
                    <Text style={Styles.text}>Thanks for placing this order with us.</Text>
                    <Text style={Styles.text}>You are a valued customer for us.</Text>
                </View>
                <View style={Styles.bottomContainer}>
                    <TouchableOpacity
                        style={Styles.button}
                        // onPress={}
                    >
                    <Text style={Styles.buttonText}>Start a new order</Text>
                    </TouchableOpacity>
                </View>
            </View>
        )
    }

}

const { height } = Dimensions.get('window');

const Styles = StyleSheet.create({
    container: {
        backgroundColor: 'white',
        justifyContent: 'center'
    },
    success: {
        flexDirection: 'row',
        // alignItems: 'center'
    },
    image: {
        flex: 0.3,
        height: 90,
        resizeMode: 'contain',
    },
    textSuccess: {
        flex: 0.4,
        fontSize: 55,
        fontWeight: 'bold',
        textAlign: 'center',
        color: Colors.skyBlue,
        marginBottom: 80
    },
    resultContainer: {
        justifyContent: 'center',
        height: Math.max(height-110),
        // borderWidth: 1,
        // borderColor: Colors.skyBlue
    },
    bottomContainer: {
        height: 110,
        // borderWidth: 1,
        // borderColor: Colors.skyBlue
    },
    topContainer: {
        height: 30
    },
    text: {
        fontSize: 33,
        fontWeight: 'bold',
        textAlign: 'center',
        // color: Colors.skyBlue
    },
    button: {
        // justifyContent: 'center',
        margin: 10,
        height: 60,
        borderRadius: 6,
        alignItems: 'center',
        padding: 20,
        backgroundColor: 'white'
    },
    buttonText: {
        color: Colors.iosNativeBlue,
        fontSize: 14,
        fontWeight: 'bold',
        fontStyle: 'italic'
    }
})
