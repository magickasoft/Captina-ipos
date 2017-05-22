/**
 * Created by vladislav on 18/07/16.
 */
//noinspection JSUnresolvedVariable
import React, {Component, PropTypes} from 'react'

//noinspection JSUnresolvedVariable
import {
    Alert,
    Image,
    StyleSheet,
    TouchableOpacity
} from 'react-native'


export default class Error extends Component {

    constructor (props) {
        super (props);

        this.state = {

        }
    }

    displayAlert () {
        
        const { message } = this.props;
        
        return (
            Alert.alert(
                'Error!!!',
                message,
                [
                    {
                        text: 'OK', onPress: () => {
                            console.log('Error!!!', message)
                        }
                    }
                ]
            )
        )
    }

    render () {

        // const {} = this.props;

        return (
            <TouchableOpacity style={[Styles.container]} onPress={ () => this.displayAlert()}>
                <Image
                    style={[Styles.image]}
                    source={require('../global/image/error.png')}
                />
            </TouchableOpacity>
        )
    }
}

// Error.defaultProps = {
//     title: '',
//     message: ''
// };
//
// Error.propTypes = {
//     title: PropTypes.string,
//     message: PropTypes.string
// };

const Styles = StyleSheet.create({
    container: {
        flex: 0.13,
        alignItems: 'center',
        justifyContent: 'center'
    },
    image: {
        width: 26,
        height: 26,
        marginLeft: 5
    }
});