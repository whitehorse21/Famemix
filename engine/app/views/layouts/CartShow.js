import React, {Component} from "react";
import {
    Dimensions,
    Text,
    TouchableOpacity,
    ScrollView,
    Image,
    View,
    StyleSheet,
    FlatList,
    ActivityIndicator
} from "react-native";
import {connect} from "react-redux";
import {changeStatusBarStyle, humanTime} from "../../helpers/Functions";
import API from "../../helpers/Axios";
import NavHeader from "../common/NavHeader";
import {WithLocalSvg} from "react-native-svg";
import {Actions} from "react-native-router-flux";
import FastImage from "react-native-fast-image";
import {decode} from "html-entities";
import i18n from "i18n-js";
import * as Languages from "../../helpers/Lang";

const GLOBAL = require('../../../config/Global');

const window = Dimensions.get('window');

class CartShow extends Component {
    static onEnter = async() => {
        changeStatusBarStyle();
    };
    onLayoutScreen = (e) => {
        let width = e.nativeEvent.layout.width;
        if (width !== this.state.layoutWidth) {
            this.setState({
                layoutWidth: width
            })
        }
    };
    constructor(props) {
        super(props);
        this.state = {
            layoutWidth: window.width,
            theme: this.props.display.darkMode ? GLOBAL.themes.dark : GLOBAL.themes.light,
            items: [],
            cart: null,
            mini: props.player.show ? props.player.show : false,
            currentLanguage: this.props.language.code,
        };
    }
    onChangeLanguage = (language) => {
        this.setState({ currentLanguage: language });
    };
    renderMarginBottom() {
        if (this.state.mini) {
            return (
                <View style={{marginBottom: 50}}/>
            )
        }
    };
    componentWillReceiveProps(nextProps) {
        if(this.props.display.darkMode !== nextProps.display.darkMode ) {
            nextProps.display.darkMode ? this.setState({theme: GLOBAL.themes.dark}) : this.setState({theme: GLOBAL.themes.light})
        }
        if( this.props.player.show !==  nextProps.player.show) {
            this.setState({mini: nextProps.player.show});
        }
        if(this.props.language.code !== nextProps.language.code ) {
            this.onChangeLanguage(nextProps.language.code)
        }
    }
    async componentDidMount() {
        API.post('cart/overview')
            .then(res => {
                this.setState({
                    cart: res.data,
                    items: res.data.items
                });
            });
    }
    keyExtractor = (item, index) => index.toString();
    renderCartItem = ({ item, index }) => {
        return (
            <View
                style={{
                    flex: 1,
                    paddingTop: 16,
                    paddingBottom: 16,
                    borderBottomWidth: 1,
                    borderColor: this.state.theme.navBorderColor
                }}
            >
                <View
                    style={{
                        flex: 1,
                        alignItems: 'center',
                        flexDirection: 'row',
                        justifyContent: 'space-between'
                    }}
                >
                    <FastImage
                        style={{
                            width: 50,
                            height: 50,
                            borderRadius: 3
                        }}
                        source={{
                            uri: item.associatedModel.artwork_url,
                            priority: FastImage.priority.normal,
                        }}
                        resizeMode={FastImage.resizeMode.contain}
                    />
                    <View
                        style={{
                            flex: 1,
                            justifyContent: 'center',
                            marginLeft: 8,
                        }}
                    >
                        <Text
                            style={{
                                fontSize: 16,
                                fontWeight: '600',
                                color: this.state.theme.textPrimaryColor,
                            }}
                            numberOfLines={2}
                        >{decode(item.associatedModel.title)}</Text>
                        <Text
                            style={{
                                fontSize: 15,
                                fontWeight: '500',
                                color: this.state.theme.textSecondaryColor,
                                marginTop: 4
                            }}
                        >Song · {humanTime(item.associatedModel.duration)}</Text>
                    </View>
                    <TouchableOpacity
                        onPress={ () => Actions.contextMenu({kind: 'cart', itemType: 'song', item: item.associatedModel, cartItem: item}) }
                        style={{
                            width: 24,
                            height: 24,
                            marginLeft: 16
                        }}
                    >
                        <WithLocalSvg
                            style={{
                                width: 16,
                                height: 16,
                            }}
                            fill={this.state.theme.textSecondaryColor}
                            width={16}
                            height={16}
                            asset={require('../../../assets/icons/common/more.svg')}
                        />
                    </TouchableOpacity>
                </View>
                <View
                    style={{
                        flexDirection: 'row-reverse'
                    }}
                >
                    <Text
                        style={{
                            fontSize: 17,
                            fontWeight: '600',
                            color: this.state.theme.textPrimaryColor,
                        }}
                    >${item.price}</Text>
                </View>
            </View>
        )
    }
    render() {
        i18n.locale = this.state.currentLanguage;
        i18n.fallbacks = true;
        i18n.translations = Languages;

        return (
                <View
                    style={{
                        flex: 1,
                        backgroundColor: this.state.theme.primaryBackgroundColor
                    }}
                    onLayout={this.onLayoutScreen}
                >
                    <NavHeader title={'Cart (' + this.props.cart.item_count + ')'} noBorder={true}/>

                    <ScrollView
                        style={{
                            flex: 1,
                        }}
                        contentContainerStyle={{flexGrow: 1}}
                    >
                        {! this.state.cart && <ActivityIndicator color={this.state.theme.indicatorColor} style={{flex: 1, backgroundColor: this.state.theme.primaryBackgroundColor}}/>}

                        {this.state.cart &&
                        <View
                            style={{
                                padding: 16,
                            }}
                        >
                            <FlatList
                                data={this.state.items}
                                keyExtractor={this.keyExtractor}
                                renderItem={this.renderCartItem}
                                horizontal={false}
                                scrollEnabled={true}
                            />
                            <View
                                style={{
                                    flex: 1,
                                    flexDirection: 'row',
                                    justifyContent: 'space-between',
                                    alignItems: 'center',
                                    marginTop: 32
                                }}
                            >
                                <Text
                                    style={{
                                        fontSize: 19,
                                        fontWeight: '600',
                                        color: this.state.theme.textPrimaryColor,
                                    }}
                                >{i18n.t('sub_total')}</Text>
                                <Text
                                    style={{
                                        fontSize: 19,
                                        fontWeight: '600',
                                        color: this.state.theme.textPrimaryColor,
                                    }}
                                >${this.state.cart.subtotal}</Text>
                            </View>
                            <TouchableOpacity
                                onPress={ () => Actions.contextMenu({ kind:'checkout', item: this.state.cart}) }
                                style={{
                                    marginTop: 32,
                                    padding: 16,
                                    backgroundColor: this.state.theme.primaryButton.backgroundColor,
                                    borderRadius: 8,
                                    marginBottom: 16
                                }}
                            >
                                <Text
                                    style={{
                                        fontSize: 19,
                                        fontWeight: '600',
                                        color: this.state.theme.primaryButton.textColor,
                                        textAlign: 'center'
                                    }}
                                >{i18n.t('checkout')}</Text>
                            </TouchableOpacity>
                            {this.renderMarginBottom()}
                        </View>}
                    </ScrollView>
                </View>
            )
        }
}

const styles = StyleSheet.create({

});


export default connect(({routes, scroll, language, display, player, auth, cart}) => ({routes, scroll, language, display, player, auth, cart}))(CartShow);
