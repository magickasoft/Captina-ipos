import React, { PropTypes } from 'react'
import {
    StyleSheet,
    Modal,
    TouchableOpacity,
    Picker,
    Text,
    Dimensions
} from 'react-native'

export default class ModalPicker extends React.Component {

    render() {
        const { visible, selectedValue, onValueChange, items, closeAction } = this.props
        return (
            <Modal
                animationType='fade'
                visible={visible}
                transparent
            >
                <TouchableOpacity style={Styles.container} onPress={closeAction}>
                    <TouchableOpacity activeOpacity={1} style={Styles.wrapper}>
                        <Picker
                            selectedValue={selectedValue}
                            onValueChange={onValueChange}
                            style={Styles.picker}
                        >
                            {items.map((item, i) => <Picker.Item value={item.value} label={item.label} key={i} />)}
                        </Picker>
                        <TouchableOpacity style={Styles.submitButton} onPress={closeAction}>
                            <Text style={Styles.submitButtonText}>Ok</Text>
                        </TouchableOpacity>
                    </TouchableOpacity>
                </TouchableOpacity>
            </Modal>
        )
    }

}

ModalPicker.defaultProps = {
    visible: false,
    onValueChange: () => {},
    closeAction: () => {}
}

ModalPicker.propTypes = {
    visible: PropTypes.bool,
    items: PropTypes.arrayOf(
        PropTypes.shape({
            value: PropTypes.any,
            label: PropTypes.string
        })
    ).isRequired,
    selectedValue: PropTypes.any.isRequired,
    onValueChange: PropTypes.func,
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
