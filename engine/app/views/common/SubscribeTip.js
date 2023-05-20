import React, {Component} from 'react';
import {
    View,
    Text,
    StyleSheet,
    Animated,
    Dimensions, TouchableOpacity,
} from 'react-native';
import {connect} from "react-redux";
import i18n from 'i18n-js';
import * as Languages from '../../helpers/Lang';
import { Actions } from 'react-native-router-flux';
const GLOBAL = require('../../../config/Global');
import {WithLocalSvg} from 'react-native-svg';

const window = Dimensions.get('window');

class SubscribeTip extends Component {
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
        if(this.props.language.code !== nextProps.language.code ) {
            this.onChangeLanguage(nextProps.language.code)
        }
    }
    render () {
        i18n.locale = this.state.currentLanguage;
        i18n.fallbacks = true;
        i18n.translations = Languages;

        return (
            <TouchableOpacity
                onPress={Actions.subscriptions}
                style={{
                    width: '100%',
                    paddingLeft: 16,
                    paddingRight: 16,
                    marginTop: 32,
                    marginBottom: 32
                }}
            >
                <View style={{
                    width: '100%',
                    backgroundColor: '#5330f5',
                    borderRadius: 8,
                    flexDirection: 'row',
                    alignItems: 'center'
                }}>
                    <View
                        style={{
                            width: 80,
                            height: 80,
                            justifyContent: 'center',
                            alignItems: 'center'
                        }}
                    >
                        <WithLocalSvg
                            style={{
                                width: 50,
                                height: 50,
                            }}
                            fill={this.state.theme.navIconColor}
                            width={50}
                            height={50}
                            asset={require('../../../assets/icons/premium/bass-guitar.svg')}
                        />
                    </View>
                    <View
                        style={{
                            flex: 1
                        }}
                    >
                        <Text
                            style={{
                                fontSize: 17,
                                color: 'white',
                                fontWeight: 'bold'
                            }}
                        >{i18n.t('subscribe_tip_title')}</Text>
                        <Text
                            style={{
                                fontSize: 15,
                                color: 'white',
                            }}
                        >{i18n.t('subscribe_tip_subtitle')}</Text>
                    </View>
                    <WithLocalSvg
                        style={{
                            width: 16,
                            height: 16,
                            marginRight: 8
                        }}
                        fill={this.state.theme.navIconColor}
                        width={16}
                        height={16}
                        asset={require('../../../assets/icons/common/right-arrow.svg')}
                    />
                </View>
            </TouchableOpacity>
        );
    }
}


export default connect(({routes, scroll, language, display, player, auth, cart}) => ({routes, scroll, language, display, player, auth, cart}))(SubscribeTip);
const styles = StyleSheet.create({

});
