import React, { Component } from 'react'
import {
    StyleSheet,
    ActivityIndicator
} from 'react-native'

export default class Loader extends Component {

    render () {
        const { style } = this.props
        return (
            <ActivityIndicator
                style={[Styles.activityIndicator, style]}
                size="large"
            />
        )
    }
}

const Styles = StyleSheet.create({
    activityIndicator: {
        height: 80,
        alignSelf: 'center'
    }
})