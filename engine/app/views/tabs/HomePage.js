'use strict';
import React, {Component} from 'react';
import PropTypes from 'prop-types';
import {
    StyleSheet,
  Text,
    View,
    Dimensions,
    ScrollView,
    TouchableOpacity,
    Platform,
    RefreshControl,
    ActivityIndicator,
    Image
} from 'react-native';
import {connect} from "react-redux";
import {Actions} from 'react-native-router-flux';
import {changeStatusBarStyle, playStation} from "../../helpers/Functions";
import i18n from 'i18n-js';
import API from '../../helpers/Axios';
import * as Languages from '../../helpers/Lang';
import { ifIphoneX } from '../../helpers/ifIphoneX';
const GLOBAL = require('../../../config/Global');

import Slider from '../../models/Slider';
import Channel from '../../models/Channel';
import SearchBar from '../common/SearchBar';
import {WithLocalSvg} from "react-native-svg";
import BottomMargin from '../common/BottomMargin';

const window = Dimensions.get('window');

class HomePage extends Component {
    static propTypes = {
        routes: PropTypes.object,
        redux: PropTypes.object,
    };
    static onEnter = async () => {
        changeStatusBarStyle();
    };
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
    constructor(props) {
        super(props);

        this.state = {
            currentLanguage: this.props.language.code,
            refreshing: false,
            layoutWidth: window.width,
            window: window,
            CategoryData: null,
            keyword: '',
            placeholderTextColor: 'grey',
            onSearch: false,
            mini: props.player.show ? props.player.show : false,
            theme: this.props.display.darkMode ? GLOBAL.themes.dark : GLOBAL.themes.light,
            showAd: false,
            isOnline: true,
            OfflineData: [],
            isLoading: true,
            internet: this.props.internet.online
        };

        Dimensions.addEventListener('change', () => {
            try {
                this.setState({window: Dimensions.get('window')});
            } catch (e) {

            }
        });
    }
    async componentWillReceiveProps(nextProps) {
        if( this.props.player.show !==  nextProps.player.show) {
            this.setState({mini: nextProps.player.show});
        }
        if(this.props.display.darkMode !== nextProps.display.darkMode ) {
            nextProps.display.darkMode ? this.setState({theme: GLOBAL.themes.dark}) : this.setState({theme: GLOBAL.themes.light})
        }
        if(this.props.language.code !== nextProps.language.code ) {
            this.onChangeLanguage(nextProps.language.code)
        }
        if(nextProps.scroll.home && this.props.scroll.home !== nextProps.scroll.home ) {
            this.scrollView.scrollTo({x: 0, y: 0, animated: true});
        }
        if (this.props.internet.online !== nextProps.internet.online) {
            this.setState({ internet: nextProps.internet.online });
        }
    }
    _isMounted = false;
    componentWillUnmount() {
        this._isMounted = false;
    }
     componentDidMount() {
        this._isMounted = true;
        this.fetchData();
    }
    fetchData(){
        API.get('homepage')
            .then(res => {
                if (this._isMounted) {
                    this.setState({
                        isLoading: false,
                        slides: res.data.slides,
                        channels: res.data.channels,
                        refreshing: false,

                    });
                }
            });
        API.get('discover')
            .then(res => {
                if (this._isMounted) {
                    this.setState({
                        CategoryData: res.data,

                    });
                }
            });
    }
    _onRefresh = () => {
        this.setState({refreshing: true});
        this.fetchData();
    }
    renderMarginBottom() {
        if (this.state.mini) {
            return (
                <View style={{marginBottom: 50}}/>
            )
        }
    }

    render() {
        i18n.locale = this.state.currentLanguage;
        i18n.fallbacks = true;
        i18n.translations = Languages;

        if (this.state.internet) {
            if (this.state.isLoading) return (
                <ActivityIndicator color={this.state.theme.indicatorColor} style={{flex: 1, backgroundColor: this.state.theme.primaryBackgroundColor}}/>
            );
            return (
                <View
                    style={[
                        styles.mainScrollView,
                        {backgroundColor: this.state.theme.primaryBackgroundColor}
                    ]}
                    onLayout={this.onLayoutScreen}
                >
                    <SearchBar theme={this.state.theme} lang={this.state.currentLanguage}/>
                    <ScrollView style={{flex: 1}} showsVerticalScrollIndicator={false} ref={(ref) => {
                        this.scrollView = ref;
                    }} refreshControl={
                        <RefreshControl
                            refreshing={this.state.refreshing}
                            onRefresh={this._onRefresh}
                            tintColor={this.state.theme.indicatorColor}
                            titleColor={this.state.theme.indicatorColor}
                        />
                    }>
                        {this.state.slides && <Slider data={this.state.slides}/>}
                        {this.state.channels && <Channel data={this.state.channels}/>}
                    </ScrollView>
                    <BottomMargin />
                </View>
            );
        } else {
            return (
                <View
                    style={[
                        styles.mainScrollView,
                        {backgroundColor: this.state.theme.primaryBackgroundColor}
                    ]}
                    onLayout={this.onLayoutScreen}
                >
                    <SearchBar theme={this.state.theme} lang={this.state.currentLanguage}/>
                    <View
                        style={{
                            flex: 1,
                            justifyContent: 'center',
                            alignItems: 'center'
                        }}
                    >
                        <WithLocalSvg
                            style={{
                                width: 200,
                                height: 200,
                                marginBottom: 64
                            }}
                            width={200}
                            height={200}
                            asset={require('../../../assets/icons/common/offline-landing.svg')}
                        />

                        <Text
                            style={{
                                color: this.state.theme.textPrimaryColor,
                                fontSize: 17,
                                fontWeight: 'bold',
                                marginBottom: 16
                            }}
                        >No internet? No problem!</Text>
                        <Text
                            style={{
                                color: this.state.theme.textPrimaryColor,
                                fontSize: 15,
                            }}
                        >Now's the time to enjoy your downloaded songs.</Text>
                    </View>
                </View>
            );
        }

    }

}

const styles = StyleSheet.create({
    offline: {
        flex: 1,
        alignItems: 'center',
        ...ifIphoneX({
            paddingTop: 60
        }, {
            paddingTop: Platform.OS === 'ios' ? 40 : 20,
        }),
    },
    text_offline: {
        fontSize: 13,
        justifyContent: 'center',
        alignItems: 'center',
        textAlign: 'center',
        paddingHorizontal: 40
    },
    mainScrollView: {
        flex: 1,
    },
    wrapper: {
        marginBottom: 15,
        width: '100%',
        aspectRatio: 1.7777,
    },
    backgroundOverlay: {
        ...StyleSheet.absoluteFillObject,
        backgroundColor: 'rgba(100, 0, 0, 0.2)',
    },
    separateHeadline: {
        alignItems: 'flex-start',
        marginTop: 32,
        marginLeft: 16,
        marginRight: 16,
        marginBottom: 16
    },
    headline: {
        fontSize: 18,
        fontWeight: '500',
    },
    headlineDescription: {
        marginTop: 6,
        fontSize: 14,
    },
    textMore: {
        fontSize: 13,
        fontWeight: 'bold',
        position: 'absolute',
        right: 0,
    },
});

export default connect(({routes, scroll, language, display, player, auth, internet}) => ({routes, scroll, language, display, player, auth, internet}))(HomePage);
