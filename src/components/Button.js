import React, { PropTypes } from 'react'
import {
    Text,
    TouchableOpacity
} from 'react-native'
import { GlobalStyles } from '../global/constants'

export default class Button extends React.Component {

    render() {
        const { style, text, titleStyle, title, onPress, activeOpacity } = this.props
        return (
            <TouchableOpacity style={[GlobalStyles.iosNativeButton, style, {flexDirection: 'row'}]} onPress={onPress} activeOpacity={activeOpacity}>
                <Text style={[GlobalStyles.iosNativeButtonText, titleStyle]}>{title}</Text>
                {text != null && <Text>{text}</Text>}
            </TouchableOpacity>
        )
    }

}

Button.defaultProps = {
    text: '',
    title: '',
    onPress: null
}

Button.propTypes = {
    text: PropTypes.string,
    title: PropTypes.string,
    onPress: PropTypes.func,
    activeOpacity: PropTypes.number
}