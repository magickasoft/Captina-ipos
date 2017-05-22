import React from 'react'
import {
    View,
    TextInput,
    TouchableOpacity,
    Text,
    StyleSheet,
    ListView,
    LayoutAnimation,
    Picker,
    Switch
} from 'react-native'

import {GlobalStyles, Colors, borderSize, borderColor, Routes} from '../global/constants'

import Button from '../components/Button'
import Totals from '../components/Totals'
import ModalPicker from '../components/ModalPicker'
import Loader from '../components/Loader'
import NavigationButton from '../components/NavigationButton'

import {connect} from 'react-redux'
import {bindActionCreators} from 'redux'
import {setInitialRoute} from '../redux/navigation'
import {fetchProducts} from '../store/products/actions'
import {isLoadingProducts, getProductCatSizes, getVisibleProducts, getProductClusters, getCluster} from '../store/products/selectors'
import {setProductInCart, removeProductFromCart} from '../store/cart/actions'
import {pushRoute} from "../redux/navigation"

@connect(state => ({
        cart: state.cart,
        products: state.products,
        user: state.user
    }),
    dispatch => bindActionCreators({
        pushRoute,
        setInitialRoute,
        //clearCart,
        fetchProducts,
        setProductInCart,
        removeProductFromCart
    }, dispatch)
)
export default class Wines extends React.Component {

    constructor(props) {
        super(props)

        this.dataSource = new ListView.DataSource({rowHasChanged: (r1, r2) => r1 !== r2})
        this.referrers = [`Select Referrer`, `referrer1`, `referrer2`, `referrer3`]
        this.allWines = getVisibleProducts(props.products)
        this.clusters = getProductClusters(props.products)
        const firstCluster = this.clusters.first()

        this.state = {
            wines: this.allWines,
            selectedWineId: null,
            winesCounts: {},
            winesCatSizesIds: {},
            isReferrerPickerVisible: false,
            selectedReferrerIndex: 0,
            selectedCategoryId: firstCluster ? firstCluster['cluster_id'] : null,
            filteringText: ``,
            isShowingOnlyWinesInCart: false
        }

        this.filter(props, undefined, undefined, undefined, false)
    }

    componentWillReceiveProps(props) {
        const { products } = props
        const { selectedCategoryId } = this.state
        this.allWines = getVisibleProducts(products)
        this.clusters = getProductClusters(products)
        if (!selectedCategoryId) {
            const firstCluster = this.clusters.first()
            if (firstCluster) {
                this.state = {...this.state, selectedCategoryId: firstCluster['cluster_id']}
            }
        }
        //this.productsByClusters = {}
        //this.clusters.forEach((cluster) => this.productsByClusters[cluster.cluster_id] = this.allWines.filter(product => { return product.get('cluster_id') === cluster.cluster_id}))
        //Object.keys(productsByClusters).forEach((key) => console.log(productsByClusters[key].toJS()))
        this.filter(props)
    }

    exit() {
        const {setInitialRoute} = this.props
        //clearCart()
        setInitialRoute()
    }

    toggleSelectedWine(wineId) {
        const {selectedWineId} = this.state
        LayoutAnimation.easeInEaseOut()
        this.setState({selectedWineId: wineId === selectedWineId ? null : wineId})
    }

    decrement(wineId, customCounts) {
        let {winesCounts} = this.state
        let count = winesCounts[wineId] || 0
        const indexOfCustomCounts = customCounts.indexOf(count)
        if (indexOfCustomCounts > 0) {
            winesCounts[wineId] = customCounts[indexOfCustomCounts - 1]
        } else if (indexOfCustomCounts === 0) {
            winesCounts[wineId] = 0
        } else {
            winesCounts[wineId] = Math.max(--count, 0)
        }
        this.setState({winesCounts})
    }

    increment(wineId, customCounts) {
        let {winesCounts} = this.state
        let count = `${winesCounts[wineId] || 0}`
        const indexOfCustomCounts = customCounts.indexOf(count)
        if (customCounts.length && indexOfCustomCounts < customCounts.length - 1) {
            winesCounts[wineId] = customCounts[indexOfCustomCounts + 1]
        } else if (customCounts.length) {
            winesCounts[wineId] = customCounts[customCounts.length - 1]
        } else {
            winesCounts[wineId] = Math.min(++count, 36)
        }
        this.setState({winesCounts})
    }

    selectCatSizeId(wineId, catSizeId) {
        let {winesCatSizesIds} = this.state
        winesCatSizesIds[wineId] = catSizeId
        this.setState({winesCatSizesIds})
    }

    setInCart(wine) {
        const wineId = wine.cat_id
        const {setProductInCart, removeProductFromCart, cart} = this.props
        const {winesCounts, isShowingOnlyWinesInCart, wines, winesCatSizesIds} = this.state
        const count = winesCounts[wineId] || 0
        const catSizeId = winesCatSizesIds[wineId]
        if (count) {
            setProductInCart(wineId, count, catSizeId)
        } else {
            removeProductFromCart(wineId)
            if (isShowingOnlyWinesInCart) {
                const winesInCart = wines.filter((wine) => wine.cat_id !== wineId)
                this.setState({wines: winesInCart})
            }
        }
        LayoutAnimation.easeInEaseOut()
        this.setState({selectedWineId: null})
    }

    makePrice(wine) {
        let price
        let packageSize
        if (wine.size) {
            price = wine.get(`price`)
            packageSize = wine.get(`package_size`)
        } else {
            price = wine.price
            packageSize = wine.package_size
        }
        return `$ ${price}${packageSize}`
    }

    refresh() {
        const {fetchProducts} = this.props
        fetchProducts()
    }

    filter(props, filteringText = this.state.filteringText, isShowingOnlyWinesInCart = this.state.isShowingOnlyWinesInCart, selectedCategoryId = this.state.selectedCategoryId, needSetState = true) {
        const {products, cart} = props || this.props
        let wines = this.allWines

        if (isShowingOnlyWinesInCart) {
            wines = wines.filter(product => cart.hasIn(['quantityById', product.get('cat_id')]))   // .filter(wine => cart.getIn(['quantityById', wine.cat_id]))
        } else {
            wines = wines.filter(product => product.get('cluster_id') === selectedCategoryId)
        }

        if (filteringText.length) {
            const lowerCaseFilteringText = filteringText.toLowerCase()
            wines = wines.filter(
                wine =>
                (wine.get(`description`) || ``).toLowerCase().indexOf(lowerCaseFilteringText) !== -1 ||
                this.makePrice(wine).toLowerCase().indexOf(lowerCaseFilteringText) !== -1
            )
        }
        //console.log(wines.toJS().map(wine => ({name: wine.description, custom_qtys: wine.custom_qtys})))
        //console.log(wines.toJS())
        if (needSetState) {
            this.setState({filteringText, isShowingOnlyWinesInCart, selectedCategoryId, wines})
        } else {
            this.state = {...this.state, wines}
        }
    }

    filterByText(filteringText) {
        this.filter(undefined, filteringText)
    }

    filterByCart(isShowingOnlyWinesInCart) {
        const {cart} = this.props
        const winesCounts = cart.get(`quantityById`).toJS()
        let winesCatSizesIds = {}

        cart.get(`lzCartArrayMap`).map(cartItem => winesCatSizesIds[cartItem.get(`cat_id`)] = cartItem.get(`cat_size_id`))
        this.setState({
            winesCounts,
            winesCatSizesIds
        })
        this.filter(undefined, undefined, isShowingOnlyWinesInCart)
    }

    selectCategory(selectedCategoryId) {
        this.filter(undefined, undefined, undefined, selectedCategoryId)
    }

    renderClusters() {
        //console.time('renderClusters')
        const { isShowingOnlyWinesInCart, selectedCategoryId } = this.state
        const clusters = this.clusters.map( category => {
            // const category = Categories[categoryId]
            const categoryId = category.cluster_id
            let onPress
            let titleStyle
            let activeOpacity
            if (isShowingOnlyWinesInCart) {
                titleStyle = Styles.disabledCategoryButtonTitle
                activeOpacity = 1
            } else {
                if (categoryId === selectedCategoryId) {
                    titleStyle = Styles.selectedCategoryButtonTitle
                    activeOpacity = 1
                } else {
                    onPress = () => this.selectCategory(categoryId)
                }
            }
            return (
                <View style={Styles.category} key={categoryId}>
                    <Button title={category.name} onPress={onPress} titleStyle={titleStyle}
                            activeOpacity={activeOpacity}/>
                </View>
            )
        })
        //console.timeEnd('renderClusters')
        return clusters
    }

    renderCatSizesPickerIfNeed(catSizes, needCatSizesPicker, wineId) {
        const {winesCatSizesIds} = this.state
        if (needCatSizesPicker) {
            return (
                <Picker
                    selectedValue={winesCatSizesIds[wineId] || catSizes.first().get(`id`)}
                    onValueChange={(catSizeId) => this.selectCatSizeId(wineId, catSizeId)}
                    style={Styles.colorPicker}
                >
                    {catSizes.map((catSize, i) => <Picker.Item value={catSize.get(`id`)} label={catSize.get(`sizeString`)}
                                                               key={i}/>)}
                </Picker>
            )
        }
    }

    renderWineEditorIfNeed(wine) {
        const {selectedWineId, winesCounts} = this.state
        const {products} = this.props
        const wineId = wine.cat_id
        const catSizes = getProductCatSizes(products, wineId)
        const needCatSizesPicker = catSizes.size > 0
        const customCountsString = wine.custom_qtys || ''
        const customCounts = customCountsString.split(`,`).filter((countString) => countString.trim().length)
        if (wineId === selectedWineId) {
            return (
                <View style={Styles.wineEditor}>
                    <View
                        style={[Styles.countBox, needCatSizesPicker ? Styles.countBoxFlexWithColorPicker : Styles.countBoxFlexWithoutColorPicker]}>
                        <Text style={Styles.label}>Quantity:</Text>
                        <Button title='–' onPress={() => this.decrement(wineId, customCounts)} titleStyle={Styles.quantityButtonTitle} />
                        <Text style={Styles.count}>{(winesCounts[wineId] || 0).toString().split(`~`)[0]}</Text>
                        <Button title='+' onPress={() => this.increment(wineId, customCounts)} titleStyle={Styles.quantityButtonTitle} />
                    </View>
                    {this.renderCatSizesPickerIfNeed(catSizes, needCatSizesPicker, wineId)}
                    <View
                        style={[Styles.addInCartContainer, needCatSizesPicker ? Styles.addInCartContainerFlexWithColorPicker : Styles.addInCartContainerFlexWithoutColorPicker]}>
                        <Button title='Ok' style={Styles.addInCartButton} onPress={() => this.setInCart(wine)} titleStyle={Styles.addInCartButtonTitle} />
                    </View>
                </View>
            )
        }
    }

    renderWine(wine, sectionId, rowId) {
        const {wines} = this.state
        const isLast = rowId == wines.size - 1
        return (
            <View style={[Styles.row, isLast && Styles.lastRow]}>
                <TouchableOpacity style={Styles.wine} onPress={() => this.toggleSelectedWine(wine.cat_id)}>
                    <View style={[Styles.cell, Styles.wineName]}>
                        <Text style={Styles.wineText}>{wine.description}</Text>
                    </View>
                    <View style={[Styles.cell, Styles.winePrice]}>
                        <Text style={Styles.wineText}>{this.makePrice(wine)}</Text>
                    </View>
                </TouchableOpacity>
                {this.renderWineEditorIfNeed(wine)}
            </View>
        )
    }

    render() {
        const { cart, pushRoute, products, user } = this.props
        const { wines, isReferrerPickerVisible, selectedReferrerIndex, filteringText, selectedCategoryId, isShowingOnlyWinesInCart } = this.state
        const user_details = user.user_details
        //console.log(this.props.visibleProducts().toJS())
        //console.log(this.props.visibleProducts().toJS().map(wine => ({name: wine.description, custom_qtys: wine.custom_qtys})))
        return (
            <View style={Styles.container}>
                <View style={Styles.top}>
                    <Button style={Styles.exitButton} title='Log Out' onPress={() => this.exit()}/>
                    <Text style={Styles.userFullNameText}>{`${user_details.name_first} ${user_details.name_last}`}</Text>
                    <TextInput
                        style={[GlobalStyles.input, Styles.filterInput]}
                        placeholder={'Search'}
                        autoCorrect={false}
                        autoCapitalize='none'
                        onChangeText={(text) => this.filterByText(text)}
                        value={filteringText}
                        //ref={r => this.emailInput = r}
                        //onFocus={(event) => this.scrollToInput(event, this.emailInput)}
                        //underlineColorAndroid="transparent"
                        //placeholderTextColor={Colors.greyText}
                    />
                    <Text style={Styles.filterByCartLabel}>Cart items</Text>
                    <Switch onValueChange={value => this.filterByCart(value)} value={isShowingOnlyWinesInCart}/>
                    <Button title={this.referrers[selectedReferrerIndex]}
                            onPress={() => this.setState({isReferrerPickerVisible: true})}/>
                </View>
                <View style={Styles.center}>
                    <View style={Styles.left}>
                        {isLoadingProducts(products) ? (
                            <Loader />
                        ) : this.renderClusters()
                        }
                    </View>
                    <View style={Styles.content}>
                        {isLoadingProducts(products) ? (
                            <Loader />
                        ) : (
                            <ListView
                                dataSource={this.dataSource.cloneWithRows(wines.toJS())}
                                renderRow={(rowData, sectionId, rowId) => this.renderWine(rowData, sectionId, rowId)}
                                style={Styles.wines}
                                enableEmptySections
                                //pageSize={10}
                            />
                        )}
                    </View>
                </View>
                <View style={GlobalStyles.bottom}>
                    <Button title='Refresh' onPress={() => this.refresh()} style={Styles.refreshButton} />
                    <Totals cart={cart} />
                    <NavigationButton onPress={() => pushRoute(Routes.Checkout)} isNext />
                </View>
                <ModalPicker
                    visible={isReferrerPickerVisible}
                    selectedValue={selectedReferrerIndex}
                    onValueChange={(referrerIndex) => this.setState({selectedReferrerIndex: referrerIndex})}
                    items={this.referrers.map((referrer, i) => ({value: i, label: referrer}))}
                    closeAction={() => this.setState({isReferrerPickerVisible: false})}
                />
            </View>
        )
    }

}

const gridBorderColor = Colors.grey2
const gridBorderSize = 1

const Styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: 'white'
    },
    top: {
        height: 64,
        flexDirection: 'row',
        alignItems: 'center',
        paddingTop: 20,
        borderBottomWidth: borderSize,
        borderColor
    },
    left: {
        flex: 1,
        borderRightWidth: 1,
        borderRightWidth: borderSize,
        borderColor
    },
    content: {
        flex: 5,
        justifyContent: 'center'
    },
    exitButton: {

    },
    filterInput: {
        flex: 3
    },
    filterByCartLabel: {
        marginLeft: 16,
        marginRight: 2,
        fontSize: 18
    },
    userFullNameText: {
        fontWeight: 'bold',
        fontSize: 18,
        marginRight: 16
    },
    label: {
        fontWeight: 'bold',
        fontSize: 18
    },
    center: {
        flex: 1,
        flexDirection: 'row'
    },
    category: {
        flex: 1,
        justifyContent: 'center'
    },
    selectedCategoryButtonTitle: {
        color: Colors.iosNateveGreen
    },
    disabledCategoryButtonTitle: {
        color: Colors.iosNativeGray
    },
    wines: {
        flex: 1
    },
    wine: {
        flexDirection: 'row',
        justifyContent: 'center',
        height: 60
    },
    row: {
        borderColor: gridBorderColor,
        borderLeftWidth: gridBorderSize,
        borderRightWidth: gridBorderSize,
        borderTopWidth: gridBorderSize
    },
    lastRow: {
        borderColor: gridBorderColor,
        borderBottomWidth: gridBorderSize
    },
    cell: {
        borderColor: gridBorderColor,
        justifyContent: 'center',
        paddingHorizontal: 16
    },
    wineName: {
        flex: 4
    },
    winePrice: {
        flex: 1,
        borderLeftWidth: gridBorderSize
    },
    wineText: {
        fontSize: 16
    },
    wineEditor: {
        alignItems: 'center',
        flexDirection: 'row',
        borderColor: gridBorderColor,
        borderTopWidth: gridBorderSize,
        paddingVertical: 8
    },
    countBox: {
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center'
    },
    countBoxFlexWithColorPicker: {
        flex: 1,
    },
    countBoxFlexWithoutColorPicker: {
        flex: 1,
    },
    quantityButtonTitle: {
        fontSize: 40,
        marginBottom: 4,
        fontWeight: '300'
    },
    addInCartButtonTitle: {
        fontSize: 20,
        fontWeight: '600'
    },
    colorPicker: {
        flex: 2
    },
    addInCartContainer: {},
    addInCartContainerFlexWithColorPicker: {
        flex: 1
    },
    addInCartContainerFlexWithoutColorPicker: {
        flex: 1
    },
    count: {
        fontSize: 16
    },
    addInCartButton: {
        flex: 1
    },
    refreshButton: {
        marginLeft: 16
    }
})
