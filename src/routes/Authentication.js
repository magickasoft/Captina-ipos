import React from 'react'
import {
    View,
    TextInput,
    TouchableOpacity,
    Text,
    StyleSheet
} from 'react-native'
import AuthenticationStep from '../components/AuthenticationStep'
import { GlobalStyles, Colors, Routes } from '../global/constants'

import { connect } from 'react-redux'
import { bindActionCreators } from 'redux'
import { pushRoute } from '../redux/navigation'

@connect(state => ({ }),
    dispatch => bindActionCreators({
        pushRoute
    }, dispatch)
)

export default class Authentication extends React.Component {

    renderFirstInput() {
        return (
            <TextInput
                style={GlobalStyles.input}
                placeholder={'Domain'}
                autoCorrect={false}
                autoCapitalize='none'
                //onChangeText={(email) => this.setState({email})}
                //ref={r => this.emailInput = r}
                //onFocus={(event) => this.scrollToInput(event, this.emailInput)}
                //underlineColorAndroid="transparent"
                //placeholderTextColor={Colors.greyText}
            />
        )
    }

    renderSecondInput() {
        return (
            <TextInput
                style={[GlobalStyles.input, GlobalStyles.next]}
                placeholder={'Authentication code'}
                autoCorrect={false}
                autoCapitalize='none'
                secureTextEntry
                //onChangeText={(email) => this.setState({email})}
                //ref={r => this.emailInput = r}
                //onFocus={(event) => this.scrollToInput(event, this.emailInput)}
                //underlineColorAndroid="transparent"
                //placeholderTextColor={Colors.greyText}
            />
        )
    }

    renderSubmitButtons() {
        const { pushRoute } = this.props
        return (
            <View style={GlobalStyles.submitButtons}>
                <TouchableOpacity style={[GlobalStyles.button, Styles.submitButton]} onPress={() => pushRoute(Routes.LogIn)}>
                    <Text style={GlobalStyles.buttonText}>Next</Text>
                </TouchableOpacity>
            </View>
        )
    }

    render() {
        return (
            <AuthenticationStep
                title='Authentication'
                renderFirstInput={() => this.renderFirstInput()}
                renderSecondInput={() => this.renderSecondInput()}
                renderSubmitButtons={() => this.renderSubmitButtons()}
            />
        )
    }

}

const Styles = StyleSheet.create({
    submitButton: {
        flex: 1
    }
})
