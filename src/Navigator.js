import React from 'react'
import {
    StyleSheet,
    NavigationExperimental,
    Easing,
    View
} from 'react-native'
import { Routes } from './global/constants'

import { connect } from 'react-redux'

import Authentication from './routes/Authentication'
import LogIn from './routes/LogIn'
import Wines from './routes/Wines'
import ClubMembership from './routes/ClubMembership'
import Checkout from './routes/Checkout'
import Signature from './routes/Signature'
import OrderReview from './routes/OrderReview'
import SuccessPage from './routes/SuccessPage'

const {
    Transitioner: NavigationTransitioner,
    Card: NavigationCard,
    CardStack: NavigationCardStack
} = NavigationExperimental

@connect(state => ({
    navigation: state.navigation
}))

export default class App extends React.Component {

    renderRoute(props) {
        switch (props.scene.route.key) {
            case Routes.Authentication:
                return <Authentication />
            case Routes.LogIn:
                return <LogIn />
            case Routes.Wines:
                return <Wines />
            case Routes.ClubMembership:
                return <ClubMembership />
	          case Routes.Checkout:
                return <Checkout />      
            case Routes.Signature:
                return <Signature />
            case Routes.OrderReview:
                return <OrderReview />
            case Routes.SuccessPage:
                return <SuccessPage />
        }
    }

    renderCard(props) {
        return (
            <NavigationCard
                renderScene={(props) => this.renderRoute(props)}
                key={props.scene.route.key}
                {...props}
            />
        )
    }

    render() {
        const { navigation } = this.props
        return (
            <NavigationTransitioner
                navigationState={navigation}
                render={(props) => this.renderCard(props)}
                style={Styles.container}
                //configureTransition={() => ({duration: 5000, easing: Easing.inOut(Easing.ease)})}
            />
        )
    }

}

const Styles = StyleSheet.create({
    container: {
        flex: 1
    }
})
