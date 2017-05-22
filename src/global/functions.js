import { Alert } from 'react-native'
import { Map } from 'immutable'

export function makePaymentInfo(isUseCardReader, creditCardNumber, cvv, expiryMonth, expiryYear) {
    return {
        isUseCardReader,
        creditCardNumber: creditCardNumber.value.replace(/-/g, ``),
        cvv: cvv.value,
        expires: Map({
            month: expiryMonth.value,
            year: expiryYear.value
        })
    }
}

export function keepOnlyDigits(text) {
    let result = []
    for (let i = 0; i < text.length; ++i) {
        if (Number.isInteger(parseInt(text[i]))) {
            result.push(text[i])
        }
    }
    return result.join('')
}

export function trimCreditCardNumber(text) {
    if (!text || !text.length) return ``
    return text.replace(/-/g, ``)
}

export function makeCreditCardNumber(text) {
    if (!text || !text.length) return ``
    return text.replace(/-/g, ``).match(new RegExp('.{1,4}', 'g')).join("-")
}

export function hideCardNumber(number) {
        number = trimCreditCardNumber(number);

    let numberCard = [];
    for (var i = 0; i < number.length; i++) {
        if (i > 0 && i < number.length - 4) {
            numberCard.push('X');
        } else {
            numberCard.push(number[i]);
        }
    }

    return makeCreditCardNumber(numberCard.join(''))
}

export function trimNoDigits(str) {
    let digits = []
    for (let i = 0; i < str.length; ++i) {
        if (Number.isInteger(parseInt(str[i]))) {
            digits.push(str[i])
        }
    }
    return digits.join('')
}

export function getArrayOfShippingOptions(options) {
    let arrayOptions = [];

    for (let option of options.shippingOptions) {
        arrayOptions.push({
            value: option[0],
            title: option[1]
        });
    }

    return arrayOptions;
}

export function makeFullAddress(addr1, addr2, city, state, postal) {
    let addr = addr1
    if (addr2.length) {
        addr += ` ${addr2}`
    }
    if (city.length) {
        addr += ` ${city}`
    }
    if (state.length) {
        addr += `, ${state}`
    }
    if (postal.length) {
        addr += ` ${postal}`
    }
    return addr
}

export function displayValidationError(invalidFieldsTitles) {
    return (
        Alert.alert(
            'Not all fields are filled in correctly!!!',
            `Check the following fields: ${invalidFieldsTitles.join(', ')}`,
            [
                {text: 'OK', onPress: () => console.log('OK Pressed!')}
            ]
        )
    )
}
