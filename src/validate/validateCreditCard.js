import Moment from 'moment'

export const validators = {
    numbers: /\d+/g,
    characters: /\[A-Za-z]/g,
    cards: {
        visa: "^4[0-9]{12}(?:[0-9]{3})?$",
        amex: "^3[47][0-9]{13}$",
        mastercard: "^5[1-5][0-9]{14}$"
    }
}

export function validateCreditCardNumber(cardNumber) {
    cardNumber = cardNumber.split('-').join('');

    if (!cardNumber) {
        return 'Field Credit Card Number cannot be empty'
    }

    let flag = false;
    // let card = {};
    for (let card in validators.cards){
        if (!validators.cards.hasOwnProperty(card)) {
            continue
        }
        if (new RegExp(validators.cards[card], "g").test(cardNumber)) {
            flag = true;
        }

    }

    if (!flag) {
        return "Enter number card: Visa, MasterCard or American Express ";
    }

    return false
}

export function validateCreditCardCVV(cvv) {
    if (!cvv) {
        return 'Field Credit Card CVV code cannot be empty'
    }

    return false;
}

export function validateCreditCardMM(month, year) {
    if (year > Moment().year()){
        if (month < 1) { month = '1'}
    } else if (year == Moment().year()) {
        let currentMonth = Moment().month() + 1;
        if (month < currentMonth) { month = currentMonth.toString()}
    }
    if (month > 12) { month = '12' }
    if (month < 10 && month.length < 2) {
        month = '0' + month
    }

    if (!month) {
        return {month, error: 'Field Year on Credit Card cannot be empty'}
    }

    try {
        if (1 < month && month > 12){
            return {month, error: "Invalid, data must be a number."}
        }
    } catch (error) {

    }

    return {month, error: false}
}

export function validateCreditCardYY(year) {
    let currentYear = Moment().year().toString(), maxYear = (Moment().add(10, 'years')).year().toString()
    if (year > maxYear) { year = maxYear }
    if (year < currentYear) { year = currentYear}

    if (!year) {
        return {year, error: 'Field Month on Credit Card cannot be empty'}
    }

    return {year, error: false}
}