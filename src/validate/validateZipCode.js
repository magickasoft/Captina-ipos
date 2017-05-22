/**
 * Created by vladislav on 19/07/16.
 */
export function validateZipCode(zipCode, title) {
    let pattern = /^\d{5}(?:[-\s]*\d{4})?$/;
    if (!zipCode) {
        return 'Field ' + title + ' cannot be empty'
    }

    let postal = pattern.test(zipCode);
    
    if (!postal) {
        return 'Please enter your zipcode. (Note: enter zipcode only; city and state information are retrieved automatically)';
    }
    
    return false
}