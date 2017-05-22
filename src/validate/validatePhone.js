/**
 * Created by vladislav on 19/07/16.
 */
export function validatePhone(phoneNumber, title) {
    // let _phone = [];

    if (!phoneNumber) {
        return 'Field ' + title + ' cannot be empty'
    }

    // for(let i = 0; i < phoneNumber.length; i++) {
    //     if(Number.isInteger(parseInt(phoneNumber[i]))) {
    //         _phone.push(phoneNumber[i]);
    //     }
    // }
    //
    // return (phoneNumber.length > 0 ? '+' : '') + _phone.join('');
    return false
}