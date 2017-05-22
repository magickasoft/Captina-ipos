import React, { Component } from 'react'
import {
    View,
    Text,
    TextInput,
    StyleSheet,
    ActivityIndicator
} from 'react-native'

import Error from '../Error'

import { Colors } from '../../global/constants'
import { trimNoDigits } from '../../global/functions'

export default class ZipField extends Component {

    constructor(props) {
        super(props);

        this.state = {
            error: false
        }
    }

    _onBlur = () => {
        if (this.checkEditing()) {
            const { validate, nameField, sendToZipCode, zipcode } = this.props
            if (this.lastValidatedZipcode !== zipcode) {
                this.lastValidatedZipcode = zipcode
                let error = validate(nameField)
                if (!error) {
                    sendToZipCode(zipcode)
                }
                this.setState({error: error})
            }
        }
    };

    onZipCodeChange = zipCode => {
        const { setValueForFields, nameField } = this.props
        zipCode = trimNoDigits(zipCode)
        setValueForFields(nameField, zipCode)
    };

    checkEditing(){
        const { nameField, checkEditing } = this.props;
        if (checkEditing) {
            return checkEditing(nameField);
        }

        return true;
    }

    render () {
        const { zipcode, city, state, isLoading, onFocus } = this.props;
        const { error } = this.state;
        return (
            <View style={[styles.container]}>
                { this.checkEditing() && error ? <Error message={error}/> : null }
                <TextInput
                    autoCapitalize="none"
                    placeholder="Zip"
                    autoCorrect={false}
                    style={[styles.zipField, this.checkEditing() ? error && styles.borderError || styles.defaultBorder : styles.defaultBorder]}
                    onChangeText={(zipCode) => this.onZipCodeChange(zipCode)}
                    value={zipcode}
                    onFocus={() => { this.setState({error: false}); onFocus && onFocus(); }}
                    onBlur={this._onBlur}
                    editable={!isLoading}
                    maxLength={5}
                    keyboardType="numeric"
                />
                {isLoading && (
                    <ActivityIndicator
                        style={styles.activityIndicator}
                        //size="large"
                    />
                )}
                {!isLoading && (
                    <View style={styles.blockCityInput}>
                        <TextInput
                            autoCapitalize="none"
                            placeholder="City"
                            editable={false}
                            style={[{flex: 1, textAlign: 'center'}]}
                            // onChangeText={(city) => this.onCityChange(city)}
                            value={city}
                        />
                    </View>
                )}
                {!isLoading && (
                    <View style={styles.blockStateInput}>
                        <TextInput
                            autoCapitalize="none"
                            placeholder="State"
                            autoCorrect={false}
                            editable={false}
                            // onChangeText={(state) => this.onStateChange(state)}
                            style={[{flex: 1, textAlign: 'center'}]}
                            value={state}
                        />
                    </View>
                )}
            </View>
        )
    }
}

const blockCityInputFlex = 0.5
const blockStateInputFlex = 0.2
const styles = StyleSheet.create({
    container: {
        flexDirection: 'row',
        height: 42
    },
    blockCityInput: {
        flex: blockCityInputFlex,
        marginLeft: 6,
        borderBottomWidth: 1,
        borderColor: Colors.grey
    },
    blockStateInput: {
        flex: blockStateInputFlex,
        marginLeft: 6,
        borderBottomWidth: 1,
        borderColor: Colors.grey
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
    zipField: {
        textAlign: 'center',
        flex: 0.3
    },
    field: {
        height: 42,
        flexDirection: "row"
    },
    next: {
        marginTop: 16
    },
    activityIndicator: {
        flex: blockCityInputFlex + blockStateInputFlex
    }
});