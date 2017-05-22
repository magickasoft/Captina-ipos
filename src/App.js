import React from 'react'
import { Provider } from 'react-redux'
import configureStore from './store/configureStore'
import Navigator from './Navigator'

const Store = configureStore();

export default class App extends React.Component {

    render() {
        return (
            <Provider store={Store}>
                <Navigator />
            </Provider>
        )
    }

}