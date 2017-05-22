/**
 * Created by vladislav on 20/07/16.
 */


export function validatePassword(password1, password2) {

    if (!password2) {
        return 'Field Confirmation Password cannot be empty';
    }

    if (password1 !== password2) {
        return 'Passwords do not match';
    }

    return false;
}