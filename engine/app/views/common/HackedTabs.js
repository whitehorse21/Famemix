import React, {Component} from 'react';
import {View, Text, TouchableOpacity, Animated} from 'react-native';
import {ifIphoneX} from "../../helpers/ifIphoneX";
import i18n from 'i18n-js';
import * as Languages from '../../helpers/Lang';
import {Actions} from "react-native-router-flux";
import {connect} from "react-redux";
import {WithLocalSvg} from 'react-native-svg';
const GLOBAL = require("../../../config/Global");

const icons =  {
    home: require('../../../assets/icons/tabs/home.svg'),
    explore: require('../../../assets/icons/tabs/explore.svg'),
    community: require('../../../assets/icons/tabs/community.svg'),
    'my-music': require('../../../assets/icons/tabs/my-music.svg'),
    podcast: require('../../../assets/icons/tabs/podcast.svg'),
    radio: require('../../../assets/icons/tabs/radio.svg'),
}

class HackedTabs extends Component {
    constructor(props) {
        super(props);
        this.state = {
            user: null,
            activeTab: 'tab_0',
            theme: this.props.display.darkMode ? GLOBAL.themes.dark : GLOBAL.themes.light,
            currentLanguage: this.props.language.code,
            isMediaAdShowing: false
        };
    }
    onChangeLanguage = (language) => {
        this.setState({ currentLanguage: language });
    };
    async componentWillReceiveProps(nextProps) {
        if(this.props.display.darkMode !== nextProps.display.darkMode ) {
            nextProps.display.darkMode ? this.setState({theme: GLOBAL.themes.dark}) : this.setState({theme: GLOBAL.themes.light})
        }
        if(this.props.language.code !== nextProps.language.code ) {
            this.onChangeLanguage(nextProps.language.code)
        }
        if(this.props.ad.showing !== nextProps.ad.showing) {
            this.setState({isMediaAdShowing: nextProps.ad.showing})
        }
    }
    _isMounted = false;
    componentWillUnmount() {
        this._isMounted = false;
    }
    componentDidMount() {
        this._isMounted = true;
    }
    tabBarOnPress (tab) {
        if(this.state.activeTab !== tab) {
            Actions.jump(tab);
            this.setState({activeTab: tab});
            return true;
        } else if(this.state.activeTab === tab) {
            if(tab === 'tab_0') {
                Actions.currentScene === 'homePage' ? (! this.props.scroll.home && this.props.dispatch({type: 'SCROLL_HOME'})) : Actions.pop();
            } else if(tab === "tab_3") {
                Actions.currentScene === 'radioPage' ? (! this.props.scroll.radio && this.props.dispatch({type: 'SCROLL_RADIO'})) : Actions.pop();
            } else if(tab === "tab_5") {
                Actions.currentScene === 'profilePage' ? (! this.props.scroll.music && this.props.dispatch({type: 'SCROLL_PROFILE'})) : Actions.pop();
            } else if(tab === "tab_2") {
                Actions.currentScene === 'communityPage' ? (! this.props.scroll.community && this.props.dispatch({type: 'SCROLL_COMMUNITY'}))  : Actions.pop();
            } else if(tab === "tab_1") {
                Actions.currentScene === 'explorePage' ? (! this.props.scroll.explore && this.props.dispatch({type: 'SCROLL_EXPLORE'})) : Actions.pop();
            } else if(tab === "tab_4") {
                Actions.currentScene === 'podcastPage' ? (! this.props.scroll.podcast && this.props.dispatch({type: 'SCROLL_PODCAST'})) : Actions.pop();
            }
            return true;
        }
    };
    renderTabItem(tab, icon, name){
        return (
            <TouchableOpacity
                onPress={()=> {this.tabBarOnPress(tab);}}
                activeOpacity={1}
                style={{
                    flex: 1,
                    height: 50,
                    justifyContent: 'center',
                    alignItems: 'center',
                }}>
                <View
                    style={{
                        width: 20,
                        height: 20
                    }}
                >
                    <WithLocalSvg
                        style={{
                            width: 20,
                            height: 20
                        }}
                        fill={this.state.activeTab === tab ? this.state.theme.barIconColorActive : this.state.theme.barIconColor}
                        width={20}
                        height={20}
                        asset={icons[icon]}
                    />
                </View>
                {GLOBAL.SHOW_TAB_MENU_NAME &&
                <Text
                    style={{
                        marginTop: 4,
                        fontSize: 11,
                        color: this.state.activeTab === tab ? this.state.theme.barIconColorActive : this.state.theme.barIconColor
                    }}>{name}</Text>
                }
            </TouchableOpacity>
        )
    }
    render () {
        i18n.locale = this.state.currentLanguage;
        i18n.fallbacks = true;
        i18n.translations = Languages;

        return (
            <View
                style={{
                    justifyContent: 'space-between',
                    flexDirection: 'row',
                    width: '100%',
                    ...ifIphoneX({height: 84}, {height: 50,}),
                    backgroundColor: this.state.theme.bottomTabBar.backgroundColor,
                    borderTopWidth: .5,
                    borderTopColor: this.state.theme.bottomTabBar.borderTopColor}}
            >
                {this.renderTabItem('tab_0', 'home', i18n.t('home'))}
                {this.renderTabItem('tab_1', 'explore', i18n.t('explore'))}
                {this.renderTabItem('tab_2', 'community', i18n.t('community'))}
                {GLOBAL.ENABLE_RADIO && this.renderTabItem('tab_3', 'radio', i18n.t('radio'))}
                {GLOBAL.ENABLE_PODCAST && this.renderTabItem('tab_4', 'podcast', i18n.t('podcast'))}
                {this.renderTabItem('tab_5', 'my-music', i18n.t('my_music'))}
                {this.state.isMediaAdShowing && <View style={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    backgroundColor: this.state.theme.primaryBackgroundColor,
                    opacity: 0.5
                }}/>}
            </View>
        );

    }
}

export default connect(({language, display, scroll, ad}) => ({language, display, scroll, ad}))(HackedTabs);
