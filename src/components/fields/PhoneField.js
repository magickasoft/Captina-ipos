import React, { Component, PropTypes } from 'react'
import {
    View,
    Text,
    TextInput,
    StyleSheet
} from 'react-native'

import Error from '../Error'

import { Colors } from '../../global/constants'
import { trimNoDigits } from '../../global/functions'

export default class PhoneField extends Component {

    constructor(props) {
        super(props);
        this.state = {
            error: false
        }
    }

    _onBlur = () => {
        if (this.checkEditing()) {
            const {validate, nameField} = this.props;
            this.setState({
                error: validate ? validate(nameField) : false
            });
        }
    };

    onPhoneChange = phone => {
        const { setValueForFields, nameField, value } = this.props
        if (phone.endsWith(` `)) {
            phone = phone.substr(0, phone.length - 1)
        }
        if (phone === value.substr(0, value.length - 1) && value.endsWith(`)`)) {
            phone = phone.substr(0, phone.length - 1)
        }
        phone = trimNoDigits(phone)
        phone = phone.substr(0, 10)
        if (phone.length) {
            phone = `(${phone}`
        }
        if (phone.length > 3) {
            phone = `${phone.substr(0, 4)})${phone.substr(4)}`
        }
        if (phone.length > 5) {
            phone = `${phone.substr(0, 5)} ${phone.substr(5)}`
        }
        if (phone.length > 9) {
            phone = `${phone.substr(0, 9)}-${phone.substr(9)}`
        }
        setValueForFields(nameField, phone)
    }

    checkEditing(){
        const { nameField, checkEditing, validate } = this.props;
        if (checkEditing && validate) {
            return checkEditing(nameField);
        }

        return false;
    }

    render () {
        const { placeholder, button, value, onFocus } = this.props;
        const { error } = this.state;
        return (
            <View style={[styles.container]}>
                { this.checkEditing() && error ? <Error
                        message={error}
                    /> : null
                }
                <TextInput
                    style={[styles.input, this.checkEditing() ? error && styles.borderError || styles.defaultBorder: styles.defaultBorder]}
                    placeholder={placeholder ? placeholder : 'Phone'}
                    autoCorrect={false}
                    autoCapitalize="none"
                    keyboardType="numeric"
                    onChangeText={(value) => this.onPhoneChange(value)}
                    value={value}
                    maxLength={14}
                    onFocus={() => { this.setState({error: false}); onFocus && onFocus(); }}
                    onBlur={this._onBlur}
                />
                {button}
            </View>
        )
    }
}

PhoneField.defaultProps = {
    placeholder: ''
}

PhoneField.propTypes = {
    placeholder: PropTypes.string
}

const styles = StyleSheet.create({
    image: {
        width: 26,
        height: 26,
        marginLeft: 5
    },
    input: {
        flex: 1,
        height: 42,
        borderWidth: 1,
        borderColor: Colors.grey,
        borderRadius: 6,
        paddingHorizontal: 16
    },
    defaultBorder: {
        borderWidth: 0.5, //
        borderColor: Colors.grey,
        borderRadius: 6 //
    },
    borderError: {
        borderWidth: 0.5, //
        borderColor: Colors.red,
        borderRadius: 6 //
    },
    borderCorrectly: {
        borderWidth: 0.5, //
        borderColor: Colors.green,
        borderRadius: 6 //
    },
    textError: {
        height: 40,
        color: Colors.red,
        flex: 1
    },
    container: {
        // flex: 1,
        flexDirection: 'row',
        height: 42
    }
});