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

import { validateEmail } from '../../validate/validateEmail'

import Error from '../Error'

import { Colors } from '../../global/constants'


export default class EmailField extends Component {

  constructor (props) {
    super (props);
    this.state = {
      error: false
    }
  }

  onEmailChange = email => {
    const { setValueForFields, nameField } = this.props;
    setValueForFields(nameField, email);
    this.setState({ email });
  };

  _onBlur = () => {
    const { nameField } = this.props
    if (this.checkEditing()) {
      const {validate} = this.props
      this.setState({error: validate(nameField)})
    }
  };

  checkEditing(){
    const { nameField, checkEditing } = this.props;
    if (checkEditing) {
      return checkEditing(nameField);
    }

    return true;
  }
  
  render () {
    const { placeholder, button, value} = this.props;
    const { error } = this.state;
    return (
        <View style={styles.container}>
          { this.checkEditing() && error ? <Error
              message={error}
            /> : null
          }
          <TextInput
              style={[styles.input, this.checkEditing() ? error && styles.borderError || styles.defaultBorder : styles.defaultBorder]}
              placeholder={placeholder ? placeholder : 'Email'}
              autoCorrect={false}
              autoCapitalize='none'
              onChangeText={(text) => this.onEmailChange(text)}
              keyboardType='email-address'
              value={value}
              onFocus={() => this.setState({error: false})}
              onBlur={this._onBlur}
          />
          {button}
        </View>
    )
  }
}

EmailField.defaultProps = {
  placeholder: '',
  setValueForFields: () => {}
}

EmailField.propTypes = {
  placeholder: PropTypes.string,
  setValueForFields: PropTypes.func
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
  defaultBorder: { //global
    borderWidth: 0.5, //
    borderColor: Colors.grey,
    borderRadius: 6 //
  },
  borderError: { //global
    borderWidth: 0.5, //
    borderColor: Colors.red,
    borderRadius: 6 //
  },
  borderCorrectly: { //global
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
})
