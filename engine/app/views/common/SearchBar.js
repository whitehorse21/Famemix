import React, {Component} from 'react';
import {
    View,
    Text,
    StyleSheet,
    Animated,
    Dimensions,
    TouchableOpacity,
    findNodeHandle,
    Keyboard,
    Image
} from 'react-native';
import {connect} from "react-redux";
import i18n from 'i18n-js';
import * as Languages from '../../helpers/Lang';
import { Actions } from 'react-native-router-flux';
const GLOBAL = require('../../../config/Global');
import {ifIphoneX} from "../../helpers/ifIphoneX";
import {SvgXml, WithLocalSvg} from 'react-native-svg';
import {Icon} from "native-base";

const window = Dimensions.get('window');

class SearchBar extends Component {
    constructor(props) {
        super(props);
        this.state = {
            currentLanguage: this.props.language.code,
            theme: this.props.display.darkMode ? GLOBAL.themes.dark : GLOBAL.themes.light,
            window: window,
            layoutWidth: window.width,
            cart: {
                item_count: this.props.cart.item_count
            }
        };
        Dimensions.addEventListener('change', () => {
            try {
                this.setState({window: Dimensions.get('window')});
            } catch (e) {

            }
        });
        this.searchBarWidthAnimated = new Animated.Value(this.state.layoutWidth - 32);
    }
    onChangeLanguage = (language) => {
        this.setState({ currentLanguage: language });
    };
    onLayoutScreen = (e) => {
        let width = e.nativeEvent.layout.width;
        if (width !== this.state.layoutWidth) {
            this.setState({
                layoutWidth: width
            })
        }
    };
    async componentWillReceiveProps(nextProps) {
        if(this.props.display.darkMode !== nextProps.display.darkMode ) {
            nextProps.display.darkMode ? this.setState({theme: GLOBAL.themes.dark}) : this.setState({theme: GLOBAL.themes.light})
        }
        if(this.props.language.code !== nextProps.language.code ) {
            this.onChangeLanguage(nextProps.language.code)
        }
        if(this.props.cart.item_count !== nextProps.cart.item_count ) {
            this.setState(
                {
                    cart: {
                        item_count: nextProps.cart.item_count
                    }
                }
            )
        }
    }
    focusTextInput(node) {
        try {
            TextInputState.focusTextInput(findNodeHandle(node))
        } catch (e) {
            console.log("Couldn't focus text input: ", e.message)
        }
    }
    onSearchBarPress() {
        this.focusTextInput(this.refs.searchInput);
    }
    onFocus = async () => {
        this.setState({placeholderTextColor: '#d0d0d0'});
        if( ! this.state.onSearch) {
            setTimeout(() => {
                this.expandAnimation();
            }, 50);
        }
        this.setState({
            onSearch: true,
        });
    };
    offFocus = async () => {
        Keyboard.dismiss();
        this.setState({
            placeholderTextColor: 'grey',
            keyword: '',
            onSearch: false,
        });
        setTimeout(() => {
            this.collapseAnimation();

        }, 50);
    };
    onSearch = () => {

    };
    expandAnimation = () => {
        return new Promise((resolve, reject) => {
            Animated.parallel([
                Animated.timing(this.searchBarWidthAnimated, {
                    toValue: this.state.layoutWidth - 86,
                    duration: 200,
                }).start(),
            ]);
            resolve();
        });
    };
    collapseAnimation = async () => {
        return new Promise((resolve, reject) => {
            Animated.parallel([
                Animated.timing(this.searchBarWidthAnimated, {
                    toValue: this.state.layoutWidth - 32,
                    duration: 200,
                }).start(),
            ]);
            resolve();
        });
    };
    render () {
        i18n.locale = this.state.currentLanguage;
        i18n.fallbacks = true;
        i18n.translations = Languages;
        return (
            <View style={styles.searchBox} onLayout={this.onLayoutScreen}>
                <View style={{
                    position: 'absolute',
                    right: 16,
                    justifyContent: 'center',
                    alignItems: 'center',
                }}>
                    {this.state.theme.name === 'light' && <Image
                        style={{
                            width: 24,
                            height: 24
                        }}
                        fill={this.state.theme.topBar.iconColor}
                        width={24}
                        height={24}
                        source={require('../../../assets/icons/logo/logo-light.png')}
                    />}
                    {this.state.theme.name === 'dark' && <Image
                        style={{
                            width: 24,
                            height: 24
                        }}
                        fill={this.state.theme.topBar.iconColor}
                        width={24}
                        height={24}
                        source={require('../../../assets/icons/logo/logo-dark.png')}
                    />}
                </View>
                {!this.props.auth.isLogged && (
                    <TouchableOpacity
                        style={styles.buttonIcon}
                        onPress={() => {
                            Actions.loginModal();
                        }}>

                        <SvgXml fill={this.state.theme.topBar.iconColor} xml={`<svg version="1.1" id="Capa_1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" x="0px" y="0px" viewBox="0 0 55 55" style="enable-background:new 0 0 55 55;" xml:space="preserve"><path d="M55,27.5C55,12.337,42.663,0,27.5,0S0,12.337,0,27.5c0,8.009,3.444,15.228,8.926,20.258l-0.026,0.023l0.892,0.752c0.058,0.049,0.121,0.089,0.179,0.137c0.474,0.393,0.965,0.766,1.465,1.127c0.162,0.117,0.324,0.234,0.489,0.348c0.534,0.368,1.082,0.717,1.642,1.048c0.122,0.072,0.245,0.142,0.368,0.212c0.613,0.349,1.239,0.678,1.88,0.98c0.047,0.022,0.095,0.042,0.142,0.064c2.089,0.971,4.319,1.684,6.651,2.105c0.061,0.011,0.122,0.022,0.184,0.033c0.724,0.125,1.456,0.225,2.197,0.292c0.09,0.008,0.18,0.013,0.271,0.021C25.998,54.961,26.744,55,27.5,55c0.749,0,1.488-0.039,2.222-0.098c0.093-0.008,0.186-0.013,0.279-0.021c0.735-0.067,1.461-0.164,2.178-0.287c0.062-0.011,0.125-0.022,0.187-0.034c2.297-0.412,4.495-1.109,6.557-2.055c0.076-0.035,0.153-0.068,0.229-0.104c0.617-0.29,1.22-0.603,1.811-0.936c0.147-0.083,0.293-0.167,0.439-0.253c0.538-0.317,1.067-0.648,1.581-1c0.185-0.126,0.366-0.259,0.549-0.391c0.439-0.316,0.87-0.642,1.289-0.983c0.093-0.075,0.193-0.14,0.284-0.217l0.915-0.764l-0.027-0.023C51.523,42.802,55,35.55,55,27.5z M2,27.5C2,13.439,13.439,2,27.5,2S53,13.439,53,27.5c0,7.577-3.325,14.389-8.589,19.063c-0.294-0.203-0.59-0.385-0.893-0.537l-8.467-4.233c-0.76-0.38-1.232-1.144-1.232-1.993v-2.957c0.196-0.242,0.403-0.516,0.617-0.817c1.096-1.548,1.975-3.27,2.616-5.123c1.267-0.602,2.085-1.864,2.085-3.289v-3.545c0-0.867-0.318-1.708-0.887-2.369v-4.667c0.052-0.52,0.236-3.448-1.883-5.864C34.524,9.065,31.541,8,27.5,8s-7.024,1.065-8.867,3.168c-2.119,2.416-1.935,5.346-1.883,5.864v4.667c-0.568,0.661-0.887,1.502-0.887,2.369v3.545c0,1.101,0.494,2.128,1.34,2.821c0.81,3.173,2.477,5.575,3.093,6.389v2.894c0,0.816-0.445,1.566-1.162,1.958l-7.907,4.313c-0.252,0.137-0.502,0.297-0.752,0.476C5.276,41.792,2,35.022,2,27.5z"/></svg>`} width="24" height="24" />
                    </TouchableOpacity>
                )}
                {this.props.auth.isLogged && (
                    <TouchableOpacity
                        style={styles.buttonIcon}
                        onPress={() => {
                            Actions.notifications();
                        }}>
                        <WithLocalSvg
                            style={{
                                width: 20,
                                height: 20
                            }}
                            fill={this.state.theme.topBar.iconColor}
                            width={20}
                            height={20}
                            asset={require('../../../assets/icons/common/bell.svg')}
                        />
                    </TouchableOpacity>
                )}
                <TouchableOpacity
                    style={styles.buttonIcon}
                    onPress={() => {
                        Actions.settingsPage();
                    }}>
                    <WithLocalSvg
                        style={{
                            width: 20,
                            height: 20
                        }}
                        fill={this.state.theme.topBar.iconColor}
                        width={20}
                        height={20}
                        asset={require('../../../assets/icons/common/settings.svg')}
                    />
                </TouchableOpacity>
                {this.props.auth.isLogged && GLOBAL.ENABLE_STORE &&
                <TouchableOpacity
                    onPress={Actions.cartShow}
                    style={styles.buttonIcon}
                >
                    <WithLocalSvg
                        fill={this.state.theme.topBar.iconColor}
                        width={20}
                        height={20}
                        asset={require('../../../assets/icons/common/cart.svg')}
                    />
                    {(this.state.cart.item_count > 0) &&
                        <View
                            style={{
                                position: 'absolute',
                                right: -4,
                                top: -8,
                                width: 18,
                                height: 18,
                                backgroundColor: 'red',
                                borderRadius: 9,
                                justifyContent: 'center',
                                alignItems: 'center'
                            }}>
                            <Text style={{
                                fontSize: 10,
                                color: 'white'
                            }}>{this.state.cart.item_count}</Text>
                        </View>
                    }
                </TouchableOpacity>
                }
                <TouchableOpacity
                    style={styles.buttonIcon}
                    onPress={() => {
                        Actions.searchPage({keyword: this.state.keyword});
                    }}>
                    <WithLocalSvg
                        style={{
                            width: 20,
                            height: 20
                        }}
                        fill={this.state.theme.topBar.iconColor}
                        width={20}
                        height={20}
                        asset={require('../../../assets/icons/common/search.svg')}
                    />
                </TouchableOpacity>
            </View>
        );
    }
}


export default connect(({routes, scroll, language, display, player, auth, cart}) => ({routes, scroll, language, display, player, auth, cart}))(SearchBar);
const styles = StyleSheet.create({
    searchBox: {
        width: '100%',
        ...ifIphoneX({
            marginTop: 34
        }, {
            marginTop: 20,
        }),
        height: 50,
        flexDirection: 'row-reverse',
        alignItems: 'center',
        paddingLeft: 8,
        paddingRight: 8,
    },
    buttonIcon: {
        alignItems: 'center',
        justifyContent: 'center',
        paddingLeft: 8,
        paddingRight: 8
    }
});
