import React, { Component } from 'react'
import {
  View,
  Text,
  StyleSheet
} from 'react-native'

import { Colors } from './../global/constants'

export default class Label extends Component {

  constructor (props) {
    super(props)
  }

  render () {
    let text = this.props.text
    return (
      <View style={styles.container}>
        <Text style={styles.text}>{text}</Text>
      </View>
    )
  }
}

const styles = StyleSheet.create({
  container: {
    padding: 5,
    backgroundColor: Colors.iosNativeBlue,
    alignSelf: 'flex-start'
  },
  text: {
    color: 'white',
    fontSize: 18
  }
})