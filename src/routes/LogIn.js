import React from 'react'
import {
    View,
    TextInput,
    TouchableOpacity,
    Text,
    StyleSheet,
    Alert
} from 'react-native'
import AuthenticationStep from '../components/AuthenticationStep'
import { GlobalStyles, Colors } from '../global/constants'

import { connect } from 'react-redux'
import { bindActionCreators } from 'redux'
import { popRoute, setWinesRoute } from '../redux/navigation'
import { login } from '../store/user/actions'

@connect(state => ({ user: state.user }), dispatch => bindActionCreators({popRoute, setWinesRoute, login}, dispatch))
export default class LogIn extends React.Component {

    constructor(props) {
        super(props)
        this.state = {
            email: 'lianayakovleva.allmax@gmail.com',
            password: 'Big Date Friday'
        }
    }

    componentWillReceiveProps(props) {
        const { user, setWinesRoute } = this.props
        if (props.user.login_pending === false && props.user.login_pending !== user.login_pending) {
            if (props.user.authenticated) {
                setTimeout(() => setWinesRoute(), 0)
            } else {
                setTimeout(() => Alert.alert(''+props.user.login_error), 500)
            }
        }
        //console.log('user:', user)
    }

    logIn() {
        const { login } = this.props
        const { email, password } = this.state
        //login('lianayakovleva.allmax@gmail.com', 'Big Date Friday')
        login(email, password)
    }

    onEmailChange(email) {
        this.setState({email})
    }

    onPasswordChange(password) {
        this.setState({password})
    }

    renderFirstInput() {
        const { email } = this.state
        return (
            <TextInput
                style={GlobalStyles.input}
                placeholder={'Enter Email Address'}
                autoCorrect={false}
                keyboardType='email-address'
                autoCapitalize='none'
                onChangeText={(text) => this.onEmailChange(text)}
                value={email}
                //ref={r => this.emailInput = r}
                //onFocus={(event) => this.scrollToInput(event, this.emailInput)}
                //underlineColorAndroid="transparent"
                //placeholderTextColor={Colors.greyText}
            />
        )
    }

    renderSecondInput() {
        const { password } = this.state
        return (
            <TextInput
                style={[GlobalStyles.input, GlobalStyles.next]}
                placeholder={'Enter Password'}
                autoCorrect={false}
                autoCapitalize='none'
                secureTextEntry
                onChangeText={(text) => this.onPasswordChange(text)}
                value={password}
                //ref={r => this.emailInput = r}
                //onFocus={(event) => this.scrollToInput(event, this.emailInput)}
                //underlineColorAndroid="transparent"
                //placeholderTextColor={Colors.greyText}
            />
        )
    }

    renderSubmitButtons() {
        const { popRoute, setWinesRoute } = this.props
        return (
            <View style={GlobalStyles.submitButtons}>
                <TouchableOpacity style={[GlobalStyles.button, Styles.cancelButton]} onPress={() => popRoute()}>
                    <Text style={GlobalStyles.buttonText}>Cancel</Text>
                </TouchableOpacity>
                <TouchableOpacity style={[GlobalStyles.button, Styles.loginButton]} onPress={() => this.logIn()}>
                    <Text style={GlobalStyles.buttonText}>Login</Text>
                </TouchableOpacity>
            </View>
        )
    }

    render() {
        const { user } = this.props
        return (
            <AuthenticationStep
                title='Authenticate User'
                renderFirstInput={() => this.renderFirstInput()}
                renderSecondInput={() => this.renderSecondInput()}
                renderSubmitButtons={() => this.renderSubmitButtons()}
                isLoading={user.login_pending}
            />
        )
    }

}

const submitButtonOffset = 4

const Styles = StyleSheet.create({
    cancelButton: {
        backgroundColor: Colors.red,
        marginRight: submitButtonOffset,
        flex: 1
    },
    loginButton: {
        backgroundColor: Colors.green,
        marginLeft: submitButtonOffset,
        flex: 1
    }
})
