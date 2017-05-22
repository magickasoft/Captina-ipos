import React from 'react'
import ReactNative, {
    View,
    StyleSheet,
    Switch,
    Text,
    Image,
    TextInput,
    TouchableOpacity,
    Dimensions
} from 'react-native'
import Form, { formMargin } from '../components/Form'
import { GlobalStyles, shippingMethodTitle, takenShippingOptionValue, bottomBarHeight, dateFormat, storedDateFormat } from '../global/constants'
import { trimCreditCardNumber, makeCreditCardNumber, getArrayOfShippingOptions, displayValidationError } from '../global/functions'
import Totals from '../components/Totals'
import Button from '../components/Button'
import ModalPicker from '../components/ModalPicker'
import ModalDatePickerIOS from '../components/ModalDatePickerIOS'
import Moment from 'moment'
import Loader from '../components/Loader'
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view'

import { bindActionCreators } from 'redux'
import { connect } from 'react-redux'
import { receiveMember, requestBillingAddress, requestShippingAddress, updateMemberInfo } from '../store/member/actions'
import { popRoute, pushRoute } from "../redux/navigation";

import ZipField from '../components/fields/ZipField'
import EmailField from '../components/fields/EmailField'
import PhoneField from '../components/fields/PhoneField'
import TextField from '../components/fields/TextField'
import CreditCard from '../components/CreditCard'

import { validateText } from '../validate/validateText'
import { validateEmail } from '../validate/validateEmail'
import { validatePhone } from '../validate/validatePhone'
import { validateZipCode } from '../validate/validateZipCode'
import { validatePassword } from '../validate/validatePassword'
import { validateCreditCardNumber, validateCreditCardCVV, validateCreditCardMM, validateCreditCardYY } from '../validate/validateCreditCard'

import { findMemberByEmail } from '../services/api'

@connect(state => ({
    cart: state.cart,
    address: state.address,
    shippingInfo: state.shippingInfo,
    member: state.member,
    options: state.options
}), dispatch => bindActionCreators({
    requestBillingAddress,
    requestShippingAddress,
    popRoute,
    pushRoute,
    receiveMember,
    updateMemberInfo
}, dispatch))
export default class ClubMembership extends React.Component {

    constructor(props) {
        super(props)

        const { member } = props
        const bill_email = member.get(`bill_email`)
        const bill_pass = member.get(`bill_pass`)
        const bill_addr1 = member.get(`bill_addr1`)
        const bill_postal = member.get(`bill_postal`)
        const bill_city = member.get(`bill_city`)
        const bill_state = member.get(`bill_state`)
        const bill_phone = member.get(`bill_phone`)

        const ship_addr1 = member.get('ship_addr1') 
        const ship_addr2 = member.get('ship_addr2') 
        const ship_city = member.get('ship_city') 
        const ship_state = member.get('ship_state') 
        const ship_postal = member.get('ship_postal') 
        const ship_phone = member.get('ship_phone')
        const ship_name = member.get('ship_name')
        const special_instructions = member.get(`special_instructions`)

        this.clubs = [`Select Club`, `Club 1`, `Club 2`, `Club 3`]

        this.state = {
            cc_is_cardreader: member.get(`cc_is_cardreader`),
            cc_num: {value: makeCreditCardNumber(member.get(`cc_num`)), error: false, title: 'Credit Card Number', editing: false},
            cc_cvv: {value: member.get(`cc_cvv`), error: false, title: 'Credit Card CVV', editing: false},
            cc_exp_mo: {value: member.get(`cc_exp_mo`), error: false, title: 'Credit Card Month', editing: false},
            cc_exp_yr: {value: member.get(`cc_exp_yr`), error: false, title: 'Credit Card Year', editing: false},

            bill_is_club_order: member.get(`bill_is_club_order`),
            bill_email: {value: bill_email, error: false, title: 'Email', editing: bill_email.length > 0},
            bill_pass: {value: bill_pass, error: false, title: 'Password', editing: bill_pass.length > 0},
            bill_confirm_pass: {value: bill_pass, error: false, title: 'Confirmation Password', editing: bill_pass.length > 0},
            bill_addr1: {value: bill_addr1, error: false, title: 'Billing Info Address', editing: bill_addr1.length > 0},
            bill_postal: {value: bill_postal, error: false, title: 'Billing Info Zip Code', editing: bill_postal.length > 0},
            bill_city: {value: bill_city, error: false, title: 'Billing Info City', editing: bill_city.length > 0},
            bill_state: {value: bill_state, error: false, title: 'Billing Info State', editing: bill_state.length > 0},
            bill_phone: {value: bill_phone, error: false, title: 'Billing Info Phone', editing: bill_phone.length > 0},

            ship_name: {value: ship_name, error: false, title: 'Ship To', editing: ship_name.length > 0},
            ship_addr1: {value: ship_addr1, error: false, title: 'Shipping Address', editing: ship_addr1.length > 0},
            ship_addr2: {value: ship_addr2, error: false, title: 'Shipping Address 2', editing: ship_addr2.length > 0},
            ship_postal: {value: ship_postal, error: false, title: 'Shipping Info Zip Code', editing: ship_postal.length > 0},
            ship_city: {value: ship_city, error: false, title: 'Shipping Info City', editing: ship_city.length > 0},
            ship_state: {value: ship_state, error: false, title: 'Shipping Info State', editing: ship_state.length > 0},
            ship_phone: {value: ship_phone, error: false, title: 'Shipping Info Phone', editing: ship_phone.length > 0},
            special_instructions: {value: special_instructions, error: false, title: 'Special instructions', editing: special_instructions.length > 0},  

            isClubPickerVisible: false, 
            selectedClubIndex: 0,
            isShippingMethodPickerVisible: false,
            club_ship_meth_pref: member.get('club_ship_meth_pref'),
            isDateBirthPickerVisible: false,
            ship_dob: new Date(member.get(`ship_dob`)), 
            billingZipCodeIsLoading: false, 
            shippingZipCodeIsLoading: false,
            isFindingMemberByEmail: false
        }
    }

    join = () => {
        const { popRoute, receiveMember } = this.props
        const {
            cc_is_cardreader, cc_num, cc_cvv, cc_exp_mo, cc_exp_yr, ship_name,
            bill_is_club_order, bill_email, bill_pass, bill_postal, bill_city, bill_state, bill_addr1, bill_phone,
            club_ship_meth_pref, ship_addr1, ship_addr2, ship_postal, ship_city, ship_state, ship_phone, ship_dob, special_instructions
        } = this.state

        let validationFields = [
            `bill_email`, `bill_pass`, `bill_confirm_pass`, `bill_postal`,
            `cc_num`, `cc_cvv`, `cc_exp_mo`, `cc_exp_yr`
        ]
        if (club_ship_meth_pref !== takenShippingOptionValue) {
            validationFields.push(`bill_addr1`, `bill_phone`, `ship_name`, `ship_addr1`, `ship_postal`, `ship_city`, `ship_state`, `ship_phone`)
        }
        let isValid = true

        let invalidFieldsTitles = []
        for (let i = 0; i < validationFields.length; ++i) {
            const fieldName = validationFields[i]
            let fieldInState = this.state[fieldName]
            if (fieldInState.error || !fieldInState.value.length) {
                invalidFieldsTitles.push(fieldInState.title)
                isValid = false
            }
        }

        if (isValid) {
            receiveMember({
                cc_is_cardreader,
                cc_num: trimCreditCardNumber(cc_num.value),
                cc_cvv: cc_cvv.value,
                cc_exp_mo: cc_exp_mo.value,
                cc_exp_yr: cc_exp_yr.value,

                bill_is_club_order,
                bill_email: bill_email.value,
                bill_pass: bill_pass.value,
                bill_addr1: bill_addr1.value,
                bill_postal: bill_postal.value,
                bill_city: bill_city.value,
                bill_state: bill_state.value,
                bill_phone: bill_phone.value,

                club_ship_meth_pref,
                ship_name: ship_name.value,
                ship_addr1: ship_addr1.value,
                ship_addr2: ship_addr2.value,
                ship_city: ship_city.value,
                ship_state: ship_state.value,
                ship_postal: ship_postal.value,
                ship_phone: ship_phone.value,
                ship_dob: Moment(ship_dob).format(storedDateFormat),
                special_instructions: special_instructions.value
            })
            popRoute(true)
        } else {
            displayValidationError(invalidFieldsTitles)
            return false
        }
    }
    
    setValueForFields(nameField, valueField, error=false) {
        if (nameField == "bill_confirm_pass") {
            const { bill_pass } = this.state
            let bill_confirm_pass = this.state[nameField]
            if (bill_pass.editing && bill_confirm_pass.editing) {
                validatePassword(bill_pass.value, valueField)
            }
        }
        let state = {}
        state[nameField] = {
            value: valueField,
            error: error,
            title: this.state[nameField].title,
            editing: true
        }
        this.setState(state)
    }

    checkEditing(nameField) {
        return this.state[nameField].editing
    }

    //password
    validatePassword(nameField) {
        const { bill_confirm_pass, bill_pass } = this.state;
        let error = validatePassword(bill_pass.value, bill_confirm_pass.value);
        let cPassword = this.state.bill_confirm_pass;
        cPassword['error'] = error;
        this.setState({
            bill_confirm_pass: cPassword
        });
        return error
    }
    //end password

    //email
    validateEmail(nameField = `bill_email`) {
        const bill_email = this.state[nameField].value
        let error = validateEmail(bill_email)
        this.setValueForFields('bill_email', bill_email, error)
        return error
    }

    async findMemberByEmail () {
        const { bill_email } = this.state
        if (!bill_email.error) {
            this.setState({isFindingMemberByEmail: true})
            const response = await findMemberByEmail(bill_email.value)
            //console.log(response)
            const member = response.data
            if (!member.error) {
                let {
                    cc_num, cc_cvv, cc_exp_mo, cc_exp_yr,
                    bill_pass, bill_confirm_pass, bill_addr1, bill_postal, bill_city, bill_state, bill_phone,
                    club_ship_meth_pref, ship_name, ship_addr1, ship_addr2, ship_postal, ship_city, ship_state, ship_phone, special_instructions
                } = this.state
                cc_num.value = ``
                cc_cvv.value = ``
                cc_exp_mo.value = member.cc_exp_mo
                cc_exp_yr.value = member.cc_exp_yr
                bill_pass.value = ``
                bill_confirm_pass.value = ``
                bill_addr1.value = member.bill_addr1
                bill_postal.value = member.bill_postal
                bill_city.value = member.bill_city
                bill_state.value = member.bill_state
                bill_phone.value = member.bill_phone
                ship_name.value = member.ship_name
                ship_addr1.value = member.ship_addr1
                ship_addr2.value = member.ship_addr2
                ship_postal.value = member.ship_postal
                ship_city.value = member.ship_city
                ship_state.value = member.ship_state
                ship_phone.value = member.ship_phone
                special_instructions.value = member.special_instructions
                this.setState({
                    isFindingMemberByEmail: false,
                    cc_num, cc_cvv, cc_exp_mo, cc_exp_yr,
                    bill_is_club_order: false, bill_pass, bill_confirm_pass, bill_addr1, bill_postal, bill_city, bill_state, bill_phone,
                    club_ship_meth_pref: member.club_ship_meth_pref, ship_name, ship_addr1, ship_addr2, ship_postal, ship_city, ship_state, ship_phone, ship_dob: new Date(member.ship_dob), special_instructions
                })
            } else {
                this.setState({isFindingMemberByEmail: false})
            }
        } else {
            this.validateEmail()
        }
    }

    imageLookupEmail() {
        const { isFindingMemberByEmail } = this.state
        if (isFindingMemberByEmail) {
            return <Loader style={Styles.findingMemberByEmailLoader} />
        }
        return (
            <TouchableOpacity onPress={() => this.findMemberByEmail()}>
                <Image style={[Styles.image]} source={require('../global/image/lookup.png')} />
            </TouchableOpacity>
        )
    }
    //end email

    //textFields
    validateTextField(nameField){
        try {
            let field = this.state[nameField];
            let value = field.value, title = field.title;
            let error = validateText(value, title);
            this.setValueForFields(nameField, value, error);
            return error;
        } catch (error) {
            console.log(error)
        }
    }

    // imageLookupName(){
    //     return (
    //         <TouchableOpacity onPress={() => console.log('name')}>
    //             <Image
    //                 style={[Styles.image]}
    //                 source={require('../global/image/lookup.png')}
    //             />
    //         </TouchableOpacity>
    //     )
    // }

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
        this.setState({ship_addr1: this.state.bill_addr1})
    }
    //end textFields

    //creditCard
    validateCreditCardNumber(nameField){
        try {
            let field = this.state[nameField];
            let value = field.value;
            let error = validateCreditCardNumber(value);
            this.setValueForFields(nameField, value, error);
            return error;
        } catch (error) {
            console.log(error)
        }
    }

    validateCreditCardCVV(nameField){
        try {
            let field = this.state[nameField];
            let value = field.value;
            let error = validateCreditCardCVV(value);
            this.setValueForFields(nameField, value, error);
            console.log(error);
            return error;
        } catch (error) {
            console.log(error)
        }
    }

    validateCreditCardMM(nameField){
        try {
            const { cc_exp_yr } = this.state
            const { month, error } = validateCreditCardMM(this.state[nameField].value, cc_exp_yr.value)
            this.setValueForFields(nameField, month, error)
            return error
        } catch (error) {
            console.log(error)
        }
    }

    validateCreditCardYY(nameField){
        try {
            const { year, error } = validateCreditCardYY(this.state[nameField].value)
            this.setValueForFields(nameField, year, error)
            return error
        } catch (error) {
            console.log(error)
        }
    }
    //end creditCard

    //phone
    validatePhone(nameField) {
        try {
            let field = this.state[nameField];
            let value = field.value, title = field.title;
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
            let field = this.state[nameField];
            let value = field.value, title = field.title;
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
        this.setState({billingZipCodeIsLoading: true}) 
        requestBillingAddress(zipCode, (address) => { 
            this.setState({
                bill_city: {value: address ? address.city : ``, error: false, title: 'Billing Info City'}, 
                billingCountry: {value: address ? address.state : ``, error: false, title: 'Billing Info Country'}, 
                billingZipCodeIsLoading: false 
            }) 
        }) 
    }  

    sendToShippingZipCode(zipCode) { 
        const { requestShippingAddress } = this.props; 
        this.setState({shippingZipCodeIsLoading: true}) 
        requestShippingAddress(zipCode, (address) => { 
            this.setState({
                ship_city: {value: address ? address.city : ``, error: false, title: 'Shipping Info City'}, 
                shippingCountry: {value: address ? address.state : ``, error: false, title: 'Shipping Info Country'}, 
                shippingZipCodeIsLoading: false 
            }) 
        }) 
    }
    //end api
    //end zipCode

    scrollToInput(event, reactNode) {
        const node = ReactNative.findNodeHandle(reactNode)
        this.refs.scrollView.scrollToFocusedInput(event, node)
    }

    render() {
        const { cart, member, popRoute, options, updateMemberInfo } = this.props
        const {
            bill_is_club_order, 
            isClubPickerVisible, 
            selectedClubIndex,
            bill_pass,
            bill_confirm_pass,
            club_ship_meth_pref,
            isShippingMethodPickerVisible,
            ship_dob, 
            isDateBirthPickerVisible,
            bill_email,
            bill_addr1,
            ship_name,
            special_instructions,

            bill_postal,
            bill_city,
            bill_state,
            bill_phone,

            ship_addr1,
            ship_addr2,
            ship_postal,
            ship_city,
            ship_state,
            ship_phone,

            cc_num,
            cc_cvv,
            cc_exp_mo,
            cc_exp_yr,
            cc_is_cardreader,  

            billingZipCodeIsLoading, 
            shippingZipCodeIsLoading
        } = this.state
        const isTaken = club_ship_meth_pref === takenShippingOptionValue
        return (
            <View style={Styles.container}>
                <KeyboardAwareScrollView style={Styles.scrollView} ref='scrollView'>
                    <View style={Styles.topAndCenter}>
                        <Form style={Styles.topForm} title='Payment Info'>
                            <CreditCard
                                setValueForFields={this.setValueForFields.bind(this)}
                                validate={this.validateCreditCardNumber.bind(this)}
                                validateCVV={this.validateCreditCardCVV.bind(this)}
                                validateMM={this.validateCreditCardMM.bind(this)}
                                validateYY={this.validateCreditCardYY.bind(this)}
                                checkEditing={this.checkEditing.bind(this)}
                                nameFieldCard="cc_num"
                                nameFieldCVV="cc_cvv"
                                nameFieldMM="cc_exp_mo"
                                nameFieldYY="cc_exp_yr"
                                number={cc_num.value}
                                cvv={cc_cvv.value}
                                expiryMonth={cc_exp_mo.value}
                                expiryYear={cc_exp_yr.value}
                                isUseCardReader={cc_is_cardreader}
                            />
                        </Form>
                        <View style={Styles.center}>
                            <Form style={[Styles.leftForm, Styles.centerForm]} title='Billing Info'>
                                <View style={Styles.row}>
                                    <View style={Styles.checkBox}>
                                        <Switch onValueChange={(bill_is_club_order) => this.setState({bill_is_club_order})} value={bill_is_club_order} />
                                        <Text style={Styles.checkBoxTitle}>Make current order an order for this club</Text>
                                    </View>
                                </View>
                                <View style={Styles.row}>
                                    <EmailField
                                        placeholder="Enter email address here"
                                        setValueForFields={this.setValueForFields.bind(this)}
                                        validate={this.validateEmail.bind(this)}
                                        button={this.imageLookupEmail()}
                                        value={bill_email.value}
                                        nameField={'bill_email'}
                                        checkEditing={this.checkEditing.bind(this)}
                                    />
                                </View>
                                <View style={Styles.row}>
                                    <TextField
                                        placeholder={'Password'}
                                        setValueForFields={this.setValueForFields.bind(this)}
                                        validate={this.validateTextField.bind(this)}
                                        nameField={'bill_pass'}
                                        value={bill_pass.value}
                                        checkEditing={this.checkEditing.bind(this)}
                                        secure={true}
                                        ref={ref => this.bill_passField = ref}
                                        onFocus={(event) => this.scrollToInput(event, this.bill_passField)}
                                    />
                                </View>
                                <View style={Styles.row}>
                                    <TextField
                                        placeholder={'Password (again)'}
                                        setValueForFields={this.setValueForFields.bind(this)}
                                        validate={this.validatePassword.bind(this)}
                                        nameField={'bill_confirm_pass'}
                                        checkEditing={this.checkEditing.bind(this)}
                                        value={bill_confirm_pass.value}
                                        secure={true}
                                        ref={ref => this.bill_pass_againField = ref}
                                        onFocus={(event) => this.scrollToInput(event, this.bill_pass_againField)}
                                    />
                                </View>
                                <View style={Styles.row}>
                                    <TextField
                                        placeholder={'Address'}
                                        setValueForFields={this.setValueForFields.bind(this)}
                                        validate={!isTaken ? this.validateTextField.bind(this) : null}
                                        nameField={'bill_addr1'}
                                        checkEditing={this.checkEditing.bind(this)}
                                        value={bill_addr1.value}
                                        ref={ref => this.bill_addr1Field = ref}
                                        onFocus={(event) => this.scrollToInput(event, this.bill_addr1Field)}
                                    />
                                </View>
                                <View style={Styles.row}>
                                    <ZipField
                                        sendToZipCode={this.sendToBillingZipCode.bind(this)}
                                        address={member.get('bill_postal') }
                                        validate={this.validateZipCode.bind(this)}
                                        setValueForFields={this.setValueForFields.bind(this)}
                                        nameField="bill_postal"
                                        nameFieldCity="bill_city"
                                        nameFieldState="bill_state"
                                        checkEditing={this.checkEditing.bind(this)}
                                        zipcode={bill_postal.value}
                                        city={bill_city.value}
                                        state={bill_state.value}
                                        isLoading={billingZipCodeIsLoading}
                                        ref={ref => this.bill_postalField = ref}
                                        onFocus={(event) => this.scrollToInput(event, this.bill_postalField)}
                                    />
                                </View>
                                <View style={Styles.row}>
                                    <Button
                                        style={Styles.pickerButton}
                                        title={this.clubs[selectedClubIndex]}
                                        onPress={() => this.setState({isClubPickerVisible: true})}/>
                                </View>
                                <View style={Styles.row}>
                                    <PhoneField
                                        setPhone={this.setValueForFields.bind(this)}
                                        validate={!isTaken ? this.validatePhone.bind(this) : null}
                                        nameField={'bill_phone'}
                                        setValueForFields={this.setValueForFields.bind(this)}
                                        checkEditing={this.checkEditing.bind(this)}
                                        value={bill_phone.value}
                                        ref={ref => this.bill_phoneField = ref}
                                        onFocus={(event) => this.scrollToInput(event, this.bill_phoneField)}
                                    />
                                </View>
                            </Form>
                            <Form style={[Styles.rightForm, Styles.centerForm]} title='Shipping Info'>
                                <View style={Styles.row}>
                                    {
                                        options.shippingOptions.get(member.get(`club_ship_meth_pref`)) == undefined ?
                                            <Loader /> :
                                            <Button
                                                style={Styles.pickerButton}
                                                title={`${shippingMethodTitle}: ${options.shippingOptions.get(club_ship_meth_pref)}`}
                                                onPress={() => this.setState({isShippingMethodPickerVisible: true})}
                                            />
                                    }
                                </View>
                                <View style={Styles.row}>
                                    {!isTaken &&
                                        <TextField
                                            placeholder={'Ship To'}
                                            setValueForFields={this.setValueForFields.bind(this)}
                                            validate={!isTaken ? this.validateTextField.bind(this) : null}
                                            nameField={'ship_name'}
                                            value={ship_name.value}
                                            checkEditing={this.checkEditing.bind(this)}
                                            ref={ref => this.ship_nameField = ref}
                                            onFocus={(event) => this.scrollToInput(event, this.ship_nameField)}
                                        />
                                    }
                                </View>
                                <View style={Styles.row}>
                                    {!isTaken &&
                                        <TextField
                                            placeholder={'Shipping address 1'}
                                            setValueForFields={this.setValueForFields.bind(this)}
                                            validate={!isTaken ? this.validateTextField.bind(this) : null}
                                            nameField={'ship_addr1'}
                                            checkEditing={this.checkEditing.bind(this)}
                                            button={this.imageCopy()}
                                            value={ship_addr1.value}
                                            ref={ref => this.ship_addr1Field = ref}
                                            onFocus={(event) => this.scrollToInput(event, this.ship_addr1Field)}
                                        />
                                    }
                                </View>
                                <View style={Styles.row}>
                                    {!isTaken &&
                                        <TextField
                                            placeholder={'Shipping address 2'}
                                            setValueForFields={this.setValueForFields.bind(this)}
                                            //validate={this.validateTextField.bind(this)}
                                            nameField={'ship_addr2'}
                                            //checkEditing={this.checkEditing.bind(this)}
                                            value={ship_addr2.value}
                                            ref={ref => this.ship_addr2Field = ref}
                                            onFocus={(event) => this.scrollToInput(event, this.ship_addr2Field)}
                                        />
                                    }
                                </View>
                                <View style={Styles.row}>
                                    {!isTaken &&
                                        <ZipField
                                            sendToZipCode={this.sendToShippingZipCode.bind(this)}
                                            address={member.get('ship_postal') }
                                            validate={!isTaken ? this.validateZipCode.bind(this) : null}
                                            setValueForFields={this.setValueForFields.bind(this)}
                                            nameField="ship_postal"
                                            nameFieldCity="ship_city"
                                            nameFieldState="ship_state"
                                            checkEditing={this.checkEditing.bind(this)}
                                            zipcode={ship_postal.value}
                                            city={ship_city.value}
                                            state={ship_state.value}
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
                                            validate={!isTaken ? this.validatePhone.bind(this) : null}
                                            nameField={'ship_phone'}
                                            setValueForFields={this.setValueForFields.bind(this)}
                                            checkEditing={this.checkEditing.bind(this)}
                                            value={ship_phone.value}
                                            ref={ref => this.ship_phoneField = ref}
                                            onFocus={(event) => this.scrollToInput(event, this.ship_phoneField)}
                                        />
                                    }
                                </View>
                                <View style={Styles.row}>
                                    {!isTaken &&
                                        <Button
                                            style={Styles.pickerButton}
                                            title={ship_dob ? Moment(ship_dob).format(dateFormat) : 'Select date of Birth'}
                                            onPress={() => this.setState({isDateBirthPickerVisible: true})}
                                        />
                                    }
                                </View>
                                <View style={Styles.row}>
                                    {!isTaken &&
                                        <TextField
                                            placeholder={'Special instructions'}
                                            setValueForFields={this.setValueForFields.bind(this)}
                                            //validate={this.validateTextField.bind(this)}
                                            nameField={'special_instructions'}
                                            value={special_instructions.value}
                                            //checkEditing={this.checkEditing.bind(this)}
                                            ref={ref => this.instructionsField = ref}
                                            onFocus={(event) => this.scrollToInput(event, this.instructionsField)}
                                        />
                                    }
                                </View>
                            </Form>
                        </View>
                    </View>
                </KeyboardAwareScrollView>
                <View style={[GlobalStyles.bottom, Styles.bottom]}>
                    <Button title="Cancel" onPress={() => popRoute()} />
                    <Totals cart={cart} />
                    <Button title="Join" onPress={this.join} />
                </View>
                <ModalPicker
                    visible={isClubPickerVisible}
                    selectedValue={selectedClubIndex}
                    onValueChange={(selectedClubIndex) => this.setState({selectedClubIndex})}
                    items={this.clubs.map((club, i) => ({ value: i, label: club}))}
                    closeAction={() => this.setState({isClubPickerVisible: false})}
                />
                <ModalPicker
                    visible={isShippingMethodPickerVisible}
                    selectedValue={club_ship_meth_pref}
                    onValueChange={(club_ship_meth_pref) => this.setState({club_ship_meth_pref})}
                    items={getArrayOfShippingOptions(options).map((shipping, i) => ({ value: shipping.value, label: shipping.title }))}
                    closeAction={() => this.setState({isShippingMethodPickerVisible: false})}
                />
                <ModalDatePickerIOS
                    visible={isDateBirthPickerVisible}
                    date={ship_dob}
                    onDateChange={(ship_dob) => this.setState({ship_dob})}
                    closeAction={() => this.setState({isDateBirthPickerVisible: false})}
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
    scrollView: {
        flex: 1
    },
    topAndCenter: {
        width,
        height: height - bottomBarHeight - 20
    },
    image: {
        width: 40,
        height: 40,
        marginLeft: 5
    },
    findingMemberByEmailLoader: {
        marginLeft: 9
    },
    topForm: {
        height: 100,
        marginBottom: 0
    },
    center: {
        flex: 1,
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
        alignSelf: 'flex-start',
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
    },
    bottom: {
        paddingHorizontal: 16
    }
})
