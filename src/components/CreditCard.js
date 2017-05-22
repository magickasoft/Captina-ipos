import React, { Component, PropTypes } from 'react'

import {
    Image,
    View,
    TextInput,
    Switch,
    Text,
    StyleSheet,
    TouchableOpacity
} from 'react-native'

import { Colors, Validators } from '../global/constants'
import { keepOnlyDigits, makeCreditCardNumber } from '../global/functions'
import Error from './Error'
import { Map } from 'immutable'


import { getCatalog } from './../services/api/index'

export default class CreditCard extends Component {

  constructor (props) {
    super(props)

    this.state = {
      error: false,
      errorCVV: false,
      errorExpMM: false,
      errorExpYY: false,
    }
  }

  //number
  onNumberChange(number) {
    const { setValueForFields, nameFieldCard } = this.props
    console.log(11111);
    number = keepOnlyDigits(number)
    // number = makeCreditCardNumber(number)
    console.log(number)
    setValueForFields(nameFieldCard, number)
  }

  _onBlurNumber = () => {
    const {validate, nameFieldCard} = this.props;
    if (this.checkEditing(nameFieldCard)) {
      this.setState({
        error: validate(nameFieldCard)
      });
    }
  };
  //end number

  //cvv
  onCVVChange(cvv) {
    const { setValueForFields, nameFieldCVV } = this.props
    setValueForFields(nameFieldCVV, cvv)
  }

  _onBlurCVV = () => {
    const { validateCVV, nameFieldCVV } = this.props;
    if (this.checkEditing(nameFieldCVV)) {
      this.setState({
        errorCVV: validateCVV(nameFieldCVV)
      });
    }
  };
  //end cvv

  //month
  onExpiryMonthChange(expiryMonth) {
    const { setValueForFields, nameFieldMM } = this.props
    setValueForFields(nameFieldMM, expiryMonth)
  }

  _onBlurCardExpMM = () => {
    const { validateMM, nameFieldMM } = this.props;
    if (this.checkEditing(nameFieldMM)) {
      this.setState({ errorExpMM: validateMM(nameFieldMM) });
    }
  };
  //end month

  //year
  onExpiryYearChange(expiryYear) {
    const { setValueForFields, nameFieldYY } = this.props
    setValueForFields(nameFieldYY, expiryYear)
  }

  _onBlurCardExpYY = () => {
    const { validateYY, nameFieldYY } = this.props;
    if (this.checkEditing(nameFieldYY)) {
      this.setState({ errorExpYY: validateYY(nameFieldYY) });
    }
  };
  //end year

  onPress () {
    getCatalog().then(res => console.log(res))
  }

  checkEditing(nameField){
    const { checkEditing } = this.props;
    if (checkEditing) {
      return checkEditing(nameField);
    }

    return true;
  }

  render () {
    const { error, errorCVV, errorExpMM, errorExpYY } = this.state;
    const { nameFieldCard, nameFieldCVV, nameFieldMM, nameFieldYY, number, cvv, expiryMonth, expiryYear, isUseCardReader } = this.props;

    return (
        <View style={styles.container}>
          <View style={styles.dataCard}>
            <Image source={require('../../img/pos-terminal-gray.png')} style={styles.cardReaderIcon} />
            <View style={[styles.cardNumberField, styles.fieldWrap]}>
              { this.checkEditing(nameFieldCard) && error ? <Error
                  message={error}
                /> : null
              }
              <TextInput
                  keyboardType="numeric"
                  placeholder="Credit Card Number"
                  style={[styles.inputField, this.checkEditing(nameFieldCard) ? error ? styles.borderError : styles.defaultBorder : styles.defaultBorder]}
                  onChangeText={number => this.onNumberChange(number)}
                  value={number}
                  onFocus={() => this.setState({error: false})}
                  editable={!isUseCardReader}
                  onBlur={this._onBlurNumber}
              />
            </View>
            <View style={[styles.cvvField, styles.fieldWrap]}>
              <Text
                  style={styles.inputLabel}>CVV</Text>
              <TextInput
                  keyboardType="numeric"
                  placeholder="CVV"
                  secureTextEntry={true}
                  maxLength={4}
                  style={[styles.inputField, this.checkEditing(nameFieldCVV) ? errorCVV ? styles.borderError : styles.defaultBorder : styles.defaultBorder]}
                  onChangeText={ cvv => this.onCVVChange(cvv)}
                  value={cvv}
                  editable={!isUseCardReader}
                  onBlur={this._onBlurCVV}
              />
            </View>
            <View style={[styles.expireDateField, styles.fieldWrap]}>
              <Text style={styles.inputLabel}>Expires</Text>
              <View style={styles.inputWrap}>
                <TextInput
                    keyboardType="numeric"
                    style={[styles.inputField, this.checkEditing(nameFieldMM) ? errorExpMM ? styles.borderError : styles.defaultBorder : styles.defaultBorder, {marginRight: 6}]}
                    placeholder="MM"
                    maxLength={2}
                    onChangeText={(mm) => {this.onExpiryMonthChange(mm)}}
                    value={expiryMonth}
                    editable={!isUseCardReader}
                    onBlur={this._onBlurCardExpMM}
                />
              </View>
              <View style={styles.inputWrap}>
                <TextInput
                    keyboardType="numeric"
                    style={[styles.inputField, this.checkEditing(nameFieldYY) ? errorExpYY ? styles.borderError : styles.defaultBorder : styles.defaultBorder]}
                    placeholder="YYYY"
                    maxLength={4}
                    onChangeText={(yy) => {this.onExpiryYearChange(yy)}}
                    value={expiryYear}
                    editable={!isUseCardReader}
                    onBlur={this._onBlurCardExpYY}
                />
              </View>
            </View>
            { this.props.imageHandshake ? this.props.imageHandshake : null }
          </View>
        </View>
    )
  }
}

CreditCard.defaultProps = {
  defaultCreditCardNumber: ``,
  defaultCVV: ``,
  defaultExpires: Map({
    month: ``,
    year: ``
  }),
  setValueForFields: () => {}
}

CreditCard.propTypes = {
  // imageHandshake: PropTypes.object.isRequired,
  // imageBankCards: PropTypes.object.isRequired
  defaultCreditCardNumber: PropTypes.string,
  defaultCVV: PropTypes.string,
  defaultExpires: PropTypes.object,
  setValueForFields: PropTypes.func
};

const styles = StyleSheet.create({
  container: {
    // flexDirection: 'row',
    height: 42,
    justifyContent: 'center',
    alignItems: 'center'
  },
  cardReaderIcon: {
    width: 40,
    height: 40,
    marginLeft: 8
  },
  borderCorrectly: {
    borderWidth: 0.5, //
    borderColor: Colors.green,
    borderRadius: 6 //
  },
  defaultBorder: {
    borderWidth: 0.5, //
    borderColor: Colors.grey,
    borderRadius: 6 //
  },
  borderError: {
    borderWidth: 1,
    borderColor: Colors.red
  },
  textError: {
    fontWeight: 'normal',
    color: Colors.red,
    flex: 1
  },
  dataCard: {
    flex: 1,
    flexDirection: 'row'
  },
  cardNumberField: {
    flex: 5
  },
  cvvField: {
    flex: 1
  },
  expireDateField: {
    flex: 2
  },
  fieldWrap: {
    paddingHorizontal: 20,
    flexDirection: 'row',
    justifyContent: 'center'
  },
  inputLabel: {
    fontWeight: 'bold',
    paddingRight: 10,
    alignSelf: 'center'
  },
  inputField: {
    borderWidth: 1,
    borderColor: Colors.grey,
    borderRadius: 6,
    height: 42,
    flex: 1,
    paddingLeft: 5
  },
  inputWrap: {
    flex: 1,
  }
})