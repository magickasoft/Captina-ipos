import React, { PropTypes } from 'react'
import {
    Text,
    View,
    StyleSheet
} from 'react-native'
import { Colors } from '../global/constants'

export default class Form extends React.Component {

    render() {
        const { style, title, children } = this.props
        return (
            <View style={[Styles.container, style]}>
                <Text style={Styles.title}>{title}</Text>
                {children}
            </View>
        )
    }

}

Form.defaultProps = {
    title: ''
}

Form.propTypes = {
    title: PropTypes.string
}

export const formMargin = 8

const Styles = StyleSheet.create({
    container: {
        margin: formMargin,
        borderWidth: 1,
        borderColor: Colors.grey2,
        padding: 8,
        paddingTop: 28
    },
    title: {
        fontSize: 16,
        position: 'absolute',
        top: 4,
        left: 4
    }
})
