import React from 'react'
import ReactNative, {
    View,
    StyleSheet,
    Switch,
    Text,
    TextInput,
    Image,
    TouchableOpacity,
    Alert,
    KeyboardAvoidingView,
    Dimensions
} from 'react-native'

import Moment from 'moment'
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view'
import { connect } from 'react-redux'
import { popRoute, pushRoute, disableUpdatingRoutes } from "../redux/navigation";
import { bindActionCreators } from 'redux'

import Form, { formMargin } from '../components/Form'
import { GlobalStyles, Routes, Fields, bottomBarHeight, takenShippingOptionValue, shippingMethodTitle, Holds, dateFormat } from '../global/constants'
import { makeCreditCardNumber, getArrayOfShippingOptions, displayValidationError } from '../global/functions'
import Totals from '../components/Totals'
import Button from '../components/Button'
import ModalPicker from '../components/ModalPicker'
import ModalDatePickerIOS from '../components/ModalDatePickerIOS'
import Loader from '../components/Loader'
import NavigationButton from '../components/NavigationButton'

import ZipField from '../components/fields/ZipField'
import EmailField from '../components/fields/EmailField'
import TextField from '../components/fields/TextField'
import PhoneField from '../components/fields/PhoneField'
import CreditCard from '../components/CreditCard'

import { findMemberByEmail, updateMemberInfo, requestBillingAddress, requestShippingAddress } from '../store/member/actions'

import { validateText } from '../validate/validateText'
import { validateEmail } from '../validate/validateEmail'
import { validatePhone } from '../validate/validatePhone'
import { validateZipCode } from '../validate/validateZipCode'
import { 
    validateCreditCardNumber,
    validateCreditCardCVV,
    validateCreditCardMM,
    validateCreditCardYY
} from '../validate/validateCreditCard'

@connect(state => ({
      member: state.member,
      navigation: state.navigation,
      cart: state.cart,
      options: state.options
    }),
    dispatch => bindActionCreators({
      pushRoute,
      popRoute,
      disableUpdatingRoutes,
      updateMemberInfo,
      requestBillingAddress,
      requestShippingAddress,
      findMemberByEmail
    }, dispatch))

export default class Checkout extends React.Component {

  constructor(props) {
    super(props);

    this.validateCreditCardMM(Fields.cc_exp_mo);
    this.validateCreditCardYY(Fields.cc_exp_yr);

    this.state = {
      cc_num: {error: false, title: 'Credit Card Number', editing: this.getStatusEditing(Fields.cc_num)},
      cc_cvv: {error: false, title: 'Credit Card CVV', editing: this.getStatusEditing(Fields.cc_cvv)},
      cc_exp_mo: {error: false, title: 'Credit Card Month', editing: this.getStatusEditing(Fields.cc_exp_mo)},
      cc_exp_yr: {error: false, title: 'Credit Card Year', editing: this.getStatusEditing(Fields.cc_exp_yr)},

      bill_email: {error: false, title: 'Email', editing: this.getStatusEditing(Fields.bill_email)},
      bill_name: {error: false, title: 'User Name', editing: this.getStatusEditing(Fields.bill_name)},
      bill_addr1: {error: false, title: 'Billing Info Address', editing: this.getStatusEditing(Fields.bill_addr1)},
      bill_addr2: {error: false, title: 'Billing Info Address 2', editing: this.getStatusEditing(Fields.bill_addr2)},
      bill_postal: {error: false, title: 'Billing Info Zip Code', editing: this.getStatusEditing(Fields.bill_postal)},
      bill_city: {error: false, title: 'Billing Info City', editing: this.getStatusEditing(Fields.bill_city)},
      bill_state: {error: false, title: 'Billing Info Country', editing: this.getStatusEditing(Fields.bill_state)},
      bill_phone: {error: false, title: 'Billing Info Phone', editing: this.getStatusEditing(Fields.bill_phone)},

      ship_name: {error: false, title: 'Recipient', editing: this.getStatusEditing(Fields.ship_name)},
      ship_addr1: {value: '', error: false, title: 'Shipping Address', editing: this.getStatusEditing(Fields.ship_addr1)},
      ship_addr2: {value: '', error: false, title: 'Shipping Address 2', editing: this.getStatusEditing(Fields.ship_addr2)},
      ship_postal: {value: '', error: false, title: 'Shipping Zip Code', editing: this.getStatusEditing(Fields.ship_postal)},
      ship_city: {value: '', error: false, title: 'Shipping City', editing: this.getStatusEditing(Fields.ship_city)},
      ship_state: {value: '', error: false, title: 'Shipping Country', editing: this.getStatusEditing(Fields.ship_state)},
      ship_phone: {value: '', error: false, title: 'Shipping Phone', editing: this.getStatusEditing(Fields.ship_phone)},

      isShippingPickerVisible: false,
      isHoldVisible: false,
      isDatePickerVisible: false,
      holdDate: new Date(),
      shopperZipCodeIsLoading: false,
      shippingZipCodeIsLoading: false,

      isUseCardReader: false
    }
  }

  getStatusEditing(nameField) {
    return this.getValueByNameOfMember(nameField) && true || false;
  }

  goClubMembership() { 
    const { pushRoute } = this.props 
    pushRoute(Routes.ClubMembership) 
  }

  //help functions
  getValueByNameOfMember(nameField) {
    const { member } = this.props;
    try {
      return member.get(nameField);
    } catch (error) {
      console.log(error);
      return '';
    }
  }

  getTitleByNameOfState(nameField) {
    try {
      return this.state[nameField].title;
    } catch (error) {
      console.log(error);
      return '';
    }
  }

  getShippingOptions(nameField) {
    const { options }  = this.props;
    try {
      return options.shippingOptions.get(this.getValueByNameOfMember(nameField))
    } catch (error) {
      console.log(error)
    }
  }

  updateMemberInfo(object) {
    const { updateMemberInfo } = this.props;

    updateMemberInfo(object);
  }
  //end help

  checkBillingInfo() {
    let fields = [
      Fields.bill_email, Fields.bill_postal,
      Fields.cc_num, Fields.cc_cvv, Fields.cc_exp_mo, Fields.cc_exp_yr
    ]
    if (this.getValueByNameOfMember(Fields.club_ship_meth_pref) !== takenShippingOptionValue) {
      fields.push(Fields.bill_addr1, Fields.bill_phone, Fields.ship_name, Fields.ship_addr1, Fields.ship_postal, Fields.ship_city, Fields.ship_state, Fields.ship_phone)
    }

    let error = false

    const { pushRoute } = this.props;

    let fieldsError = [];
    for (let i = 0, len = fields.length; i < len; i++) {
      let nameField = fields[i];
      let fieldInState = this.state[nameField];
      if (fieldInState.error || !this.getValueByNameOfMember(nameField)) {
        fieldsError.push(fieldInState.title);
        error = true;
      }
    }

    if (error) {
      displayValidationError(fieldsError)
      return false;
    } else {
      pushRoute(Routes.OrderReview)
    }
  }

  setValueForFields(nameField, valueField, error=false){
    let field = {};
    const { updateMemberInfo } = this.props;
    field[nameField] = valueField;

    updateMemberInfo(field);
    field[nameField] = {
      error: error,
      title: this.state[nameField].title,
      editing: true
    };
    this.setState(field)
  }

  checkEditing(nameField) {
    try {
      return this.state[nameField].editing;
    } catch (error) {
      console.log(error);
      return true;
    }
  }

  //email
  validateEmail(nameField) {
    let email = this.getValueByNameOfMember(nameField);
    let error = validateEmail(email);
    this.setValueForFields(nameField, email, error);
    return error;
  }

  findMemberByEmail(nameField) {
    const { findMemberByEmail } = this.props;
    if (!this.state[nameField].error) {
      findMemberByEmail(this.getValueByNameOfMember(nameField))
    } else {
      this.validateEmail()
    }
  }

  imageLookupEmail(nameField = Fields.bill_email) {
    const { member } = this.props
    if (member.get(`isFindingMemberByEmail`)) {
      return <Loader style={Styles.findingMemberByEmailLoader} />
    }
    return (
      <TouchableOpacity onPress={() => this.findMemberByEmail(nameField)}>
        <Image style={[Styles.image]} source={require('../global/image/lookup.png')} />
      </TouchableOpacity>
    )
  }
  //end email
  
  //textFields
  validateTextField(nameField){
    try {
      let value = this.getValueByNameOfMember(nameField);
      let title = this.getTitleByNameOfState(nameField);
      let error = validateText(value, title);
      this.setValueForFields(nameField, value, error);
      return error;
    } catch (error) {
      console.log(error)
    }
  }

  imageLookupName(){
    return (
        <TouchableOpacity onPress={() => console.log('name')}>
          <Image
              style={[Styles.image]}
              source={require('../global/image/lookup.png')}
          />
        </TouchableOpacity>
    )
  }

  imageCopy() {
    return (
        <TouchableOpacity onPress={() => this.cloneAddress()}>
          <Image
              style={[Styles.image]}
              source={require('../global/image/copy.png')}
          />
        </TouchableOpacity>
    );
  }

  cloneAddress() {
    this.updateMemberInfo({
      ship_addr1: this.getValueByNameOfMember('bill_addr1'),
      ship_addr2: this.getValueByNameOfMember('bill_addr2')
    });
  }
  //end textFields

  //phone
  validatePhone(nameField) {
    try {
      let value = this.getValueByNameOfMember(nameField);
      let title = this.getTitleByNameOfState(nameField);
      let error = validatePhone(value, title);
      this.setValueForFields(nameField, value, error);
      return error;
    } catch (error) {
      console.log(error)
    }
  }
  //end phone
  
  //zipCode
  validateZipCode(nameField) {
    try {
      let value = this.getValueByNameOfMember(nameField);
      let title = this.getTitleByNameOfState(nameField);
      let error = validateZipCode(value, title);
      this.setValueForFields(nameField, value, error);
      return error;
    } catch (error) {
      console.log(error)
    }
  }

  //api zip code
  sendToBillingZipCode(zipCode) {
    const { requestBillingAddress } = this.props;
    this.setState({shopperZipCodeIsLoading: true});

    requestBillingAddress(zipCode, (address) => {
      this.updateMemberInfo({
        bill_state: address.state,
        bill_city: address.city
      });
      this.setState({ shopperZipCodeIsLoading: false })
    })
  }

  sendToShippingZipCode(zipCode) {
    const { requestShippingAddress } = this.props;
    this.setState({shippingZipCodeIsLoading: true})

    requestShippingAddress(zipCode, (address) => {
      this.updateMemberInfo({
        ship_state: address.state,
        ship_city: address.city
      });
      this.setState({ shippingZipCodeIsLoading: false })
    })
  }
  //end api
  //end zipCode

  //creditCard
  validateCreditCardNumber(nameField) {
    try {
      let value = this.getValueByNameOfMember(nameField);
      let error = validateCreditCardNumber(value);
      //console.log(nameField, value);
      this.setValueForFields(nameField, value, error);
      return error;
    } catch (error) {
      console.log(error)
    }
  }
  
  validateCreditCardCVV(nameField) {
    try {
      let value = this.getValueByNameOfMember(nameField);
      let error = validateCreditCardCVV(value);
      this.setValueForFields(nameField, value, error);
      return error;
    } catch (error) {
      console.log(error)
    }
  }
  
  validateCreditCardMM(nameField) {
    try {
      let value = this.getValueByNameOfMember(nameField);
      const { month, error } = validateCreditCardMM(value, this.getValueByNameOfMember(Fields.cc_exp_yr))
      this.setValueForFields(nameField, month, error)
      return error
    } catch (error) {
      console.log(error)
    }
  }
  
  validateCreditCardYY(nameField) {
    try {
      const { year, error } = validateCreditCardYY(this.getValueByNameOfMember(nameField))
      this.setValueForFields(nameField, year, error)
      return error
    } catch (error) {
      console.log(error)
    }
  }
  //end creditCard

  //button
  imageHandshake () {
    return (
      <TouchableOpacity style={Styles.handshakeContainer} onPress={() => this.goClubMembership()}>
        <Image
            style={[Styles.imageHandshake]}
            source={require('../global/image/handshake.png')}
        />
      </TouchableOpacity>
    )
  }
  //button end

  scrollToInput(event, reactNode) {
    const node = ReactNative.findNodeHandle(reactNode)
    this.refs.scrollView.scrollToFocusedInput(event, node)
  }

  render () {
    const {
        holdDate, isDatePickerVisible, isShippingPickerVisible, isHoldVisible,
        shopperZipCodeIsLoading, shippingZipCodeIsLoading
    } = this.state;
    const { options, cart, member, updateMemberInfo, popRoute } = this.props;
    const isTaken = this.getValueByNameOfMember(Fields.club_ship_meth_pref) === takenShippingOptionValue
    const ship_hold_index = member.get(`ship_hold_index`)
    const ship_hold_date = member.get(`ship_hold_date`)
    return (
          <View style={Styles.container}>
            <KeyboardAwareScrollView style={Styles.scrollView} ref='scrollView'>
              <View style={Styles.topAndCenter}>
                <View style={Styles.topContainer}>
                  <Form style={Styles.topForm} title='Payment Info'>
                    <CreditCard
                        setValueForFields={this.setValueForFields.bind(this)}
                        validate={this.validateCreditCardNumber.bind(this)}
                        validateCVV={this.validateCreditCardCVV.bind(this)}
                        validateMM={this.validateCreditCardMM.bind(this)}
                        validateYY={this.validateCreditCardYY.bind(this)}
                        checkEditing={this.checkEditing.bind(this)}
                        nameFieldCard={Fields.cc_num}
                        nameFieldCVV={Fields.cc_cvv}
                        nameFieldMM={Fields.cc_exp_mo}
                        nameFieldYY={Fields.cc_exp_yr}
                        number={makeCreditCardNumber(this.getValueByNameOfMember(Fields.cc_num))}
                        cvv={this.getValueByNameOfMember(Fields.cc_cvv)}
                        expiryMonth={this.getValueByNameOfMember(Fields.cc_exp_mo)}
                        expiryYear={this.getValueByNameOfMember(Fields.cc_exp_yr)}
                    />
                  </Form>
                  {this.imageHandshake()}
                </View>
                <View style={Styles.center}>
                  <Form style={[Styles.leftForm, Styles.centerForm]} title='Billing Info'>
                    <View style={Styles.row}>
                      <EmailField
                          placeholder="Enter email address here"
                          setValueForFields={this.setValueForFields.bind(this)}
                          validate={this.validateEmail.bind(this)}
                          button={this.imageLookupEmail()}
                          nameField={Fields.bill_email}
                          value={this.getValueByNameOfMember(Fields.bill_email)}
                          checkEditing={this.checkEditing.bind(this)}
                      />
                    </View>
                    <View style={Styles.row}>
                      <TextField
                          placeholder={'Enter User Name here'}
                          setValueForFields={this.setValueForFields.bind(this)}
                          nameField={Fields.bill_name}
                          value={this.getValueByNameOfMember(Fields.bill_name)}
                          button={this.imageLookupName()}
                          ref={ref => this.bill_bill_nameField = ref}
                          onFocus={(event) => this.scrollToInput(event, this.bill_bill_nameField)}
                      />
                    </View>
                    <View style={Styles.row}>
                      <TextField
                          placeholder={'Address Line 1'}
                          setValueForFields={this.setValueForFields.bind(this)}
                          validate={!isTaken ? this.validateTextField.bind(this) : null}
                          nameField={Fields.bill_addr1}
                          value={this.getValueByNameOfMember(Fields.bill_addr1)}
                          checkEditing={this.checkEditing.bind(this)}
                          ref={ref => this.bill_addr1Field = ref}
                          onFocus={(event) => this.scrollToInput(event, this.bill_addr1Field)}
                      />
                    </View>
                    <View style={Styles.row}>
                      <TextField
                          placeholder={'Address Line 2'}
                          setValueForFields={this.setValueForFields.bind(this)}
                          nameField={Fields.bill_addr2}
                          value={this.getValueByNameOfMember(Fields.bill_addr2)}
                          ref={ref => this.bill_addr2Field = ref}
                          onFocus={(event) => this.scrollToInput(event, this.bill_addr2Field)}
                      />
                    </View>
                    <View style={Styles.row}>
                      <ZipField
                          sendToZipCode={this.sendToBillingZipCode.bind(this)}
                          validate={this.validateZipCode.bind(this)}
                          setValueForFields={this.setValueForFields.bind(this)}
                          checkEditing={this.checkEditing.bind(this)}
                          nameField={Fields.bill_postal}
                          zipcode={this.getValueByNameOfMember(Fields.bill_postal)}
                          city={this.getValueByNameOfMember(Fields.bill_city)}
                          state={this.getValueByNameOfMember(Fields.bill_state)}
                          isLoading={shopperZipCodeIsLoading}
                          ref={ref => this.bill_postalField = ref}
                          onFocus={(event) => this.scrollToInput(event, this.bill_postalField)}
                      />
                    </View>
                    <View style={Styles.row}>
                      <PhoneField
                          setPhone={this.setValueForFields.bind(this)}
                          validate={!isTaken ? this.validatePhone.bind(this) : null}
                          nameField={Fields.bill_phone}
                          setValueForFields={this.setValueForFields.bind(this)}
                          checkEditing={this.checkEditing.bind(this)}
                          value={this.getValueByNameOfMember(Fields.bill_phone)}
                          ref={ref => this.bill_phoneField = ref}
                          onFocus={(event) => this.scrollToInput(event, this.bill_phoneField)}
                      />
                    </View>
                    <View style={Styles.row} />
                  </Form>
                  <Form style={[Styles.rightForm, Styles.centerForm]} title='Shipping Info'>
                    <View style={Styles.row}>
                      {
                        this.getShippingOptions(Fields.club_ship_meth_pref) == undefined ?
                        <Loader /> :
                        <Button
                          style={Styles.pickerButton}
                          title={`${shippingMethodTitle}: ` + this.getShippingOptions(Fields.club_ship_meth_pref)}
                          onPress={() => this.setState({isShippingPickerVisible: true})}
                        />
                      }
                    </View>
                    <View style={Styles.row}>
                      {!isTaken &&
                        <TextField
                            placeholder={'Recipient'}
                            setValueForFields={this.setValueForFields.bind(this)}
                            validate={this.validateTextField.bind(this)}
                            nameField={Fields.ship_name}
                            value={this.getValueByNameOfMember(Fields.ship_name)}
                            checkEditing={this.checkEditing.bind(this)}
                            ref={ref => this.ship_nameField = ref}
                            onFocus={(event) => this.scrollToInput(event, this.ship_nameField)}
                        />
                      }
                    </View>
                    <View style={Styles.row}>
                      {!isTaken &&
                        <TextField
                            placeholder={'Address Line 1'}
                            setValueForFields={this.setValueForFields.bind(this)}
                            validate={this.validateTextField.bind(this)}
                            nameField={Fields.ship_addr1}
                            button={this.imageCopy()}
                            value={this.getValueByNameOfMember(Fields.ship_addr1)}
                            checkEditing={this.checkEditing.bind(this)}
                            ref={ref => this.ship_addr1Field = ref}
                            onFocus={(event) => this.scrollToInput(event, this.ship_addr1Field)}
                        />
                      }
                    </View>
                    <View style={Styles.row}>
                      {!isTaken &&
                        <TextField
                            placeholder={'Address Line 2'}
                            setValueForFields={this.setValueForFields.bind(this)}
                            validate={this.validateTextField.bind(this)}
                            nameField={Fields.ship_addr2}
                            value={this.getValueByNameOfMember(Fields.ship_addr2)}
                            checkEditing={this.checkEditing.bind(this)}
                            ref={ref => this.ship_addr2Field = ref}
                            onFocus={(event) => this.scrollToInput(event, this.ship_addr2Field)}
                        />
                      }
                    </View>
                    <View style={Styles.row}>
                      {!isTaken &&
                        <ZipField
                            sendToZipCode={this.sendToShippingZipCode.bind(this)}
                            validate={this.validateZipCode.bind(this)}
                            setValueForFields={this.setValueForFields.bind(this)}
                            nameField={Fields.ship_postal}
                            checkEditing={this.checkEditing.bind(this)}
                            zipcode={this.getValueByNameOfMember(Fields.ship_postal)}
                            city={this.getValueByNameOfMember(Fields.ship_city)}
                            state={this.getValueByNameOfMember(Fields.ship_state)}
                            isLoading={shippingZipCodeIsLoading}
                            ref={ref => this.ship_postalField = ref}
                            onFocus={(event) => this.scrollToInput(event, this.ship_postalField)}
                        />
                      }
                    </View>
                    <View style={Styles.row}>
                      {!isTaken &&
                        <PhoneField
                            setPhone={this.setValueForFields.bind(this)}
                            validate={this.validatePhone.bind(this)}
                            nameField={Fields.ship_phone}
                            setValueForFields={this.setValueForFields.bind(this)}
                            checkEditing={this.checkEditing.bind(this)}
                            value={this.getValueByNameOfMember(Fields.ship_phone)}
                            ref={ref => this.ship_phoneField = ref}
                            onFocus={(event) => this.scrollToInput(event, this.ship_phoneField)}
                        />
                      }
                    </View>
                    <View style={[Styles.row, Styles.inLine]}>
                      {!isTaken &&
                        <Button style={Styles.pickerButton} title={Holds[ship_hold_index]} text={' Hold'} onPress={() => this.setState({isHoldVisible: true})} />
                      }
                      {!isTaken && ship_hold_index == '1' &&
                        <Button style={Styles.pickerButton} title={Moment(ship_hold_date).format(dateFormat)} onPress={() => this.setState({isDatePickerVisible: true})} />
                      }
                    </View>
                  </Form>
                </View>
              </View>
            </KeyboardAwareScrollView>
            <View style={GlobalStyles.bottom}>
              <NavigationButton onPress={() => popRoute()} />
              <Totals cart={cart} />
              <NavigationButton onPress={() => this.checkBillingInfo()} isNext />
            </View>
            {
              this.getShippingOptions(Fields.club_ship_meth_pref)  == undefined ? null :
              <ModalPicker
                visible={isShippingPickerVisible}
                selectedValue={this.getValueByNameOfMember(Fields.club_ship_meth_pref)}
                onValueChange={(selectedShipping) => this.updateMemberInfo({club_ship_meth_pref: selectedShipping})}
                items={getArrayOfShippingOptions(options).map((shipping, i) => ({ value: shipping.value, label: shipping.title }))}
                closeAction={() => this.setState({isShippingPickerVisible: false})}
              />
            }
            <ModalPicker
                visible={isHoldVisible}
                selectedValue={ship_hold_index}
                onValueChange={(ship_hold_index) => updateMemberInfo({ship_hold_index})}
                items={Holds.map((hold, i) => ({ value: i, label: hold}))}
                closeAction={() => this.setState({isHoldVisible: false})}
            />
            <ModalDatePickerIOS
                visible={isDatePickerVisible}
                date={ship_hold_date}
                onDateChange={(ship_hold_date) => updateMemberInfo({ship_hold_date})}
                closeAction={() => this.setState({isDatePickerVisible: false})}
            />
          </View>
    )
  }
}


const columnOffcet = 8
const { width, height } = Dimensions.get('window')

const Styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'white',
    paddingTop: 20
  },
  textHold: {
    alignSelf: 'flex-start',
    paddingHorizontal: columnOffcet
  },
  inLine: {
    flexDirection: 'row'
  },
  topContainer: {
    height: 110,
    flexDirection: 'row'
  },
  topForm: {
    flex: 1,
    // height: 100,
    marginBottom: 0
  },
  imageTotal: {
    flex: 1,
    width: 60,
    height: 60,
    marginLeft: 8,
    marginRight: 8
  },
  image: {
    width: 40,
    height: 40,
    marginLeft: 5
  },
  findingMemberByEmailLoader: {
    marginLeft: 9
  },
  lookupContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10
  },
  imageLookup: {
    width: 60,
    height: 60,
    marginLeft: 7,
    marginRight: 7
  },
  handshakeContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10
  },
  imageHandshake: {
    width: 60,
    height: 60,
    marginLeft: 7,
    marginRight: 7
  },
  imageBankCards: {
    width: 40,
    height: 40,
    marginLeft: 7,
    marginRight: 7
  },
  scrollView: {
    flex: 1
  },
  topAndCenter: {
    width,
    height: height - bottomBarHeight - 20
  },
  center: {
    flex: 1,
    flexDirection: 'row',
  },
  addressCopy: {
    flexDirection: 'row'
  },
  leftForm: {
    flex: 1,
    marginRight: formMargin/2
  },
  rightForm: {
    flex: 1,
    marginLeft: formMargin/2
  },
  centerForm: {
    paddingHorizontal: 32
  },
  row: {
    flex: 1,
    justifyContent: 'center'
  },
  rowDirection: {
    flexDirection: 'row',
    alignItems: 'center'
  },
  checkBox: {
    alignSelf: 'center',
    flexDirection: 'row',
    alignItems: 'center'
  },
  checkBoxTitle: {
    marginLeft: 4
  },
  next: {
    marginTop: 12
  },
  pickerButton: {
    alignSelf: 'center',
    paddingHorizontal: columnOffcet
  },
  column: {
    flex: 1,
    alignSelf: 'center'
  },
  nextColumn: {
    marginLeft: columnOffcet
  },
  prePayText: {
    textAlign: 'center',
    marginLeft: columnOffcet
  }
})
