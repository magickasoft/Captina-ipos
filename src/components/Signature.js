import React, { Component } from 'react';
import { View } from 'react-native';

// var SignaturePad = require('react-native-signature-pad');
//
// export default class Signature extends React.Component {
//     render = () => {
//         return (
//             <View style={{flex: 1}}>
//                 <SignaturePad onError={this._signaturePadError}
//                               onChange={this._signaturePadChange}
//                               style={{flex: 1, backgroundColor: 'white'}}/>
//             </View>
//         )
//     };
//
//     _signaturePadError = (error) => {
//         console.error(error);
//     };
//
//     _signaturePadChange = ({base64DataUrl}) => {
//         console.log("Got new signature: " + base64DataUrl);
//     };
// }

var SignatureCapture = require('react-native-signature-capture');

export default class Signature extends React.Component {
    _onSaveEvent(result) {
        //result.encoded - for the base64 encoded png
        //result.pathName - for the file path name
        console.log(result);
    }

    render() {
        return (
            <SignatureCapture
                rotateClockwise={true}
                square={true}
                onSaveEvent={this._onSaveEvent}/>
        );
    }
};