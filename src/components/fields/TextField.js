/**
 * Created by vladislav on 18/07/16.
 */

//noinspection JSUnresolvedVariable
import React, { Component, PropTypes } from 'react'
//noinspection JSUnresolvedVariable
import {
    View,
    Text,
    Alert,
    Image,
    TextInput,
    StyleSheet,
    TouchableOpacity
} from 'react-native'

import Error from '../Error'

import { Colors } from '../../global/constants'

import { validateText } from '../../validate/validateText'

export default class TextField extends Component {

    constructor (props) {
        super (props);
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

    onValueChange = value => {
        const { setValueForFields, nameField } = this.props;
        setValueForFields(nameField, value);
    };

    checkEditing(){
        const { nameField, checkEditing, validate } = this.props;
        if (checkEditing && validate) {
            return checkEditing(nameField);
        }

        return false;
    }

    render () {
        const { placeholder, button, secure, value, editable, onFocus } = this.props;
        const { error } = this.state;

        return (
            <View style={styles.container}>
                { this.checkEditing() && error ? <Error
                    message={error}
                /> : null
                }
                <TextInput
                    style={[styles.input, this.checkEditing() ? error && styles.borderError || styles.defaultBorder : styles.defaultBorder ]}
                    placeholder={placeholder}
                    autoCorrect={false}
                    autoCapitalize='none'
                    secureTextEntry={secure && true || false}
                    onChangeText={(value) => this.onValueChange(value)}
                    onFocus={() => { this.setState({error: false}); onFocus && onFocus(); }}
                    value={value}
                    editable={editable == undefined ? true : false}
                    onBlur={this._onBlur}
                />
                {button}
            </View>
        )
    }
}

TextField.defaultProps = {
    placeholder: ''
}

TextField.propTypes = {
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
    // row: {
    //     flex: 1,
    //     justifyContent: 'center'
    // },
    container: {
        // flex: 1,
        flexDirection: 'row',
        height: 42
    }
})