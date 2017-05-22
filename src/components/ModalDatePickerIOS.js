import React, { PropTypes } from 'react'
import {
    StyleSheet,
    Modal,
    TouchableOpacity,
    DatePickerIOS,
    Text,
    Dimensions
} from 'react-native'

export default class ModalDatePickerIOS extends React.Component {

    render() {
        const { visible, date, onDateChange, closeAction } = this.props
        let minimumDate = new Date()
        minimumDate.setFullYear(minimumDate.getFullYear() - 256)
        return (
            <Modal
                animationType='fade'
                visible={visible}
                transparent
            >
                <TouchableOpacity style={Styles.container} onPress={closeAction}>
                    <TouchableOpacity activeOpacity={1} style={Styles.wrapper}>
                        <DatePickerIOS
                            date={date}
                            mode="date"
                            minimumDate={minimumDate}
                            // maximumDate={new Date()}
                            onDateChange={onDateChange}
                            style={Styles.picker}
                        />
                        <TouchableOpacity style={Styles.submitButton} onPress={closeAction}>
                            <Text style={Styles.submitButtonText}>Ok</Text>
                        </TouchableOpacity>
                    </TouchableOpacity>
                </TouchableOpacity>
            </Modal>
        )
    }

}

let date = new Date()
date.setFullYear(date.getFullYear() - 30)

ModalDatePickerIOS.defaultProps = {
    visible: false,
    date,
    onDateChange: () => {},
    closeAction: () => {}
}

ModalDatePickerIOS.propTypes = {
    visible: PropTypes.bool,
    date: PropTypes.object,
    onDateChange: PropTypes.func,
    closeAction: PropTypes.func
}

const { width } = Dimensions.get('window')
const borderRadius = 6

const Styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        backgroundColor: 'rgba(0,0,0,0.3)'
    },
    wrapper: {
        alignSelf: `center`,
        justifyContent: 'center',
        backgroundColor: 'white',
        borderRadius
    },
    picker: {
        width: width/2,
        alignSelf: `center`
    },
    submitButton: {
        height: 40,
        justifyContent: 'center',
        alignItems: 'center',
        borderRadius,
        borderColor: '#ACACAC',
        borderWidth: 1,
        margin: 4
    },
    submitButtonText: {
        fontSize: 16
    }
})
