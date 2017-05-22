import React, { Component, PropTypes } from 'react'
import {
    TouchableOpacity,
    Image,
    StyleSheet
} from 'react-native'
import { bottomBarHeight } from '../global/constants'

export default class NavigationButton extends Component {
    render () {
        const { onPress, isNext } = this.props
        return (
            <TouchableOpacity style={Styles.button} onPress={onPress}>
                <Image source={require('../../img/back-arrow.png')} style={[Styles.icon, isNext && {transform: [{rotate: '180deg'}]}]} />
            </TouchableOpacity>
        )
    }
}

NavigationButton.defaultProps = {
    onPress: () => {},
    isNext: false
}

NavigationButton.propTypes = {
    onPress: PropTypes.func,
    isNext: PropTypes.bool
}

const Styles = StyleSheet.create({
    button: {
        width: bottomBarHeight/9*16,
        height: bottomBarHeight,
        alignItems: 'center',
        justifyContent: 'center'
    },
    icon: {
        width: 50,
        height: 50
    }
})
