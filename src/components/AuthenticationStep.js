import React, { PropTypes } from 'react'
import {
    View,
    StyleSheet,
    Dimensions,
    Text,
    TextInput,
    TouchableOpacity
} from 'react-native'
import { Colors } from '../global/constants'
import Spinner from 'react-native-loading-spinner-overlay'

export default class AuthenticationStep extends React.Component {

    render() {
        const { title, renderFirstInput, renderSecondInput, renderSubmitButtons, isLoading } = this.props
        return (
            <View style={Styles.container}>
                <View style={Styles.form}>
                    <View style={Styles.titleContainer}>
                        <Text style={Styles.title}>{title}</Text>
                    </View>
                    {renderFirstInput()}
                    {renderSecondInput()}
                    {renderSubmitButtons()}
                </View>
                <Spinner visible={isLoading} />
            </View>
        )
    }

}

AuthenticationStep.defaultProps = {
    title: '',
    renderFirstInput: null,
    renderSecondInput: null,
    renderSubmitButtons: null,
    isLoading: false
}

AuthenticationStep.propTypes = {
    title: PropTypes.string,
    renderFirstInput: PropTypes.func.isRequired,
    renderSecondInput: PropTypes.func.isRequired,
    renderSubmitButtons: PropTypes.func.isRequired,
    isLoading: PropTypes.bool
}

const { width } = Dimensions.get('window')
const formWidth = width/2

const Styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: Colors.grey,
        justifyContent: 'center'
    },
    form: {
        width: formWidth,
        height: Math.max(formWidth/16*9, 240),
        backgroundColor: 'white',
        alignSelf: 'center',
        borderRadius: 8,
        paddingHorizontal: 32
    },
    titleContainer: {
        flex: 1,
        justifyContent: 'center'
    },
    title: {
        fontWeight: 'bold',
        alignSelf: 'center',
        textAlign: 'center',
        fontSize: 24
    }
})
