export function validateText(text, field) {
    if (!text) {
        return 'Field ' + field + ' cannot be empty'
    }
    return false
}