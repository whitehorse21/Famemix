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
    Image, TextInput, FlatList, Animated
} from 'react-native';
import {connect} from "react-redux";
import {Actions} from 'react-native-router-flux';
import {changeStatusBarStyle, playStation} from "../../helpers/Functions";
import i18n from 'i18n-js';
import API from '../../helpers/Axios';
import * as Languages from '../../helpers/Lang';
import { ifIphoneX } from '../../helpers/ifIphoneX';
const GLOBAL = require('../../../config/Global');

//Import common
import Category from '../../models/Category';
import Slider from '../../models/Slider';
import Channel from '../../models/Channel';
import {ScrollableTab, Tab, TabHeading, Tabs} from "native-base";
import SearchBar from '../common/SearchBar';
import { SvgXml } from 'react-native-svg';
import Trending from "../layouts/Trending";

const window = Dimensions.get('window');

class Explore extends Component {
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
            genres: [],
            keyword: '',
            placeholderTextColor: 'grey',
            onSearch: false,
            mini: props.player.show ? props.player.show : false,
            theme: this.props.display.darkMode ? GLOBAL.themes.dark : GLOBAL.themes.light,            showAd: false,
            isOnline: true,
            OfflineData: [],
            isLoading: true,
            loadTrending: false
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
        if(nextProps.scroll.explore && this.props.scroll.explore !== nextProps.scroll.explore ) {
            this.scrollView.scrollTo({x: 0, y: 0, animated: true});
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
        API.get('discover')
            .then(res => {
                if (this._isMounted) {
                    this.setState({
                        isLoading: false,
                        slides: res.data.slides,
                        channels: res.data.channels,
                        genres: res.data.genres,
                        moods: res.data.moods,
                        refreshing: false,
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
    onChangeTab(i, tab){
        if(tab === 'trending' && ! this.state.loadTrending) {
            this.setState({
                loadTrending: true
            });
        }
    };

    render(){
        i18n.locale = this.state.currentLanguage;
        i18n.fallbacks = true;
        i18n.translations = Languages;

        if(this.state.isLoading) return (
            <ActivityIndicator color={this.state.theme.indicatorColor} style={{flex: 1, backgroundColor: this.state.theme.primaryBackgroundColor}} />
        );
        return (
            <View style={[styles.mainScrollView, {backgroundColor: this.state.theme.primaryBackgroundColor}]} onLayout={this.onLayoutScreen}>
                <SearchBar theme={this.state.theme} lang={this.state.currentLanguage} />
                <Tabs
                    locked={Platform.OS === 'android'}
                    prerenderingSiblingsNumber={3}
                    onChangeTab={({i, ref}) => {
                        this.onChangeTab(i, ref.props.tab);
                    }}
                    renderTabBar={() => <ScrollableTab
                        style={{
                            backgroundColor: this.state.theme.primaryBackgroundColor,
                            borderBottomColor: this.state.theme.tabBorderBottomColor,
                            height: 48,
                            justifyContent: 'center',
                            alignItems: 'center'
                        }}
                        renderTab={(name, page, active, onPress, onLayout) => (
                            <TouchableOpacity key={page}
                                              onPress={() => onPress(page)}
                                              onLayout={onLayout}
                                              activeOpacity={0.4}
                                              style={{
                                                  flex: 1,
                                                  justifyContent: 'center',
                                                  alignItems: 'center'
                                              }}
                            >

                                <TabHeading scrollable
                                            style={[styles.tabItem, {backgroundColor: this.state.theme.tabBackgroundColor}]}
                                            active={active}>
                                    <Animated.Text style={{
                                        fontWeight: "bold",
                                        color: this.state.theme.textPrimaryColor,
                                        fontSize: 13
                                    }}>
                                        {name}
                                    </Animated.Text>
                                </TabHeading>
                            </TouchableOpacity>
                        )}
                        underlineStyle={{backgroundColor: this.state.theme.tabUnderlineColor, height: 2}}
                    />}
                >
                    <Tab
                        tabStyle={{backgroundColor: this.state.theme.primaryBackgroundColor}}
                        activeTabStyle={{backgroundColor: this.state.theme.primaryBackgroundColor}}
                        textStyle={{fontSize: 13, fontWeight: 'bold', color: this.state.theme.textSecondaryColor}}
                        activeTextStyle={{fontSize: 13, fontWeight: 'bold', color: this.state.theme.textPrimaryColor}}
                        heading="Discover"
                        tab={'discover'}
                        style={[styles.tabContent, { backgroundColor: this.state.theme.primaryBackgroundColor}]}>

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
                                <View style={styles.separateHeadline}>
                                    <Text style={[styles.headline, {color: this.state.theme.headlineColor}]}>{i18n.t('genres')}</Text>
                                </View>
                                <Category CategoryData={this.state.genres} theme={this.state.theme} layoutWidth={this.state.layoutWidth}/>
                                <View style={styles.separateHeadline}>
                                    <Text style={[styles.headline, {color: this.state.theme.headlineColor}]}>{i18n.t('moods')}</Text>
                                </View>
                                <Category CategoryData={this.state.moods} theme={this.state.theme} layoutWidth={this.state.layoutWidth}/>
                                {this.state.channels && <Channel data={this.state.channels}/>}
                                <View style={{ height: 32}}/>
                            </ScrollView>
                            {this.renderMarginBottom()}
                    </Tab>
                    <Tab
                        tabStyle={{backgroundColor: this.state.theme.primaryBackgroundColor}}
                        activeTabStyle={{backgroundColor: this.state.theme.primaryBackgroundColor}}
                        textStyle={{fontSize: 13, fontWeight: 'bold', color: this.state.theme.textSecondaryColor}}
                        activeTextStyle={{fontSize: 13, fontWeight: 'bold', color: this.state.theme.textPrimaryColor}}
                        heading="Trending"
                        tab={'trending'}
                        style={[styles.tabContent, { backgroundColor: this.state.theme.primaryBackgroundColor}]}>
                        {this.state.loadTrending && <Trending/>}
                    </Tab>
                </Tabs>
            </View>

        );
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

export default connect(({routes, scroll, language, display, player, auth}) => ({routes, scroll, language, display, player, auth}))(Explore);
