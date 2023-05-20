import React, {Component} from 'react';
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    Platform,
    StatusBar,
    ScrollView,
    Switch,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

import i18n from 'i18n-js';
import * as Languages from '../../helpers/Lang';
import Icon from 'react-native-vector-icons/Ionicons';
import {ifIphoneX} from "../../helpers/ifIphoneX";
import {Actions} from "react-native-router-flux";
import {connect} from "react-redux";
import NavHeader from "../common/NavHeader";
import {WithLocalSvg} from "react-native-svg";
const GLOBAL = require("../../../config/Global");

class SettingsPage extends Component {
    constructor(props) {
        super(props);
        this.state = {
            currentLanguage: this.props.language.code,
            user: null,
            mini: props.player.show ? props.player.show : false,
            theme: this.props.display.darkMode ? GLOBAL.themes.dark : GLOBAL.themes.light,
            darkMode: this.props.display.darkMode
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
        if( this.props.player.show !==  nextProps.player.show) {
            this.setState({mini: nextProps.player.show});
        }
        if(nextProps.scroll.settings && this.props.scroll.settings !== nextProps.scroll.settings ) {
            this.scrollView.scrollTo({x: 0, y: 0, animated: true});
        }
    }
    renderMarginBottom() {
        if (this.state.mini) {
            return (
                <View style={{marginBottom: 50}}/>
            )
        }
    }
    menuAction(action) {
        if(action.type === 'changeLanguage') {
            Actions.settingsLanguages({navTitle: 'Languages'})
        } else if(action.type === 'staticPage') {
            Actions.commonPage({navTitle: 'About Us', pageId: action.pageId})
        }
    }
    renderMenu(icon, title, action) {
        return(
            <TouchableOpacity style={styles.menu} onPress={() => this.menuAction(action)}>
                <View style={styles.menuIcon}>
                    <Icon name={icon} size={24} color={this.state.theme.profileIconColor}/>
                </View>
                <Text style={[styles.menuTitle, {color: this.state.theme.textPrimaryColor}]}>{title}</Text>
                <Icon
                    style={{
                        position: 'absolute',
                        right: 16
                    }}
                    name={'chevron-forward'}
                    size={16}
                    color={this.state.theme.profileIconColor}
                />
            </TouchableOpacity>
        )
    }
    render () {
        i18n.locale = this.state.currentLanguage;
        i18n.fallbacks = true;
        i18n.translations = Languages;
        return (
            <View style={[styles.container, {backgroundColor: this.state.theme.primaryBackgroundColor}]}>
                <NavHeader title={i18n.t('settings')}/>
                <ScrollView showsVerticalScrollIndicator={true} ref={(ref) => {this.scrollView = ref;}}>
                    <Text style={[styles.headline, {color: this.state.theme.headlineColor}]}>{i18n.t('application')}</Text>

                    <View style={styles.menu}>
                        <View style={styles.menuIcon}>
                            <Icon name={'ios-moon'} size={24} color={this.state.theme.profileIconColor}/>
                        </View>
                        <Text style={[styles.menuTitle, {color: this.state.theme.textPrimaryColor}]}>{i18n.t('dark_mode')}</Text>
                        <Switch style={{position: 'absolute', right: 16}}
                                trackColor = {{false: this.state.theme.switch.falseColor, true: this.state.theme.switch.trueColor}}
                                color={this.state.theme.switch.tintColor}
                                thumbColor={Platform.OS === 'ios' ? false : this.state.theme.switch.thumbColor}
                                onValueChange={(value) => {
                                    this.setState({darkMode: value});
                                    this.props.dispatch({type: 'TOGGLE_DARK_MODE'});
                                    AsyncStorage.setItem('theme', value ? 'dark' : 'light');
                                }}
                                value={this.state.darkMode}
                        />
                    </View>

                    {this.renderMenu('language', i18n.t('language'), {type: 'changeLanguage'})}
                    <Text style={[styles.headline, {color: this.state.theme.headlineColor}]}>{i18n.t('pages')}</Text>
                    {this.renderMenu('ios-copy', i18n.t('terms_and_conditions_of_use'), {type: 'staticPage', pageId: 2})}
                    {this.renderMenu('ios-shield-checkmark', i18n.t('privacy_policy'), {type: 'staticPage', pageId: 4})}
                    {this.renderMenu('ios-key', i18n.t('cookies_and_personal_data'), {type: 'staticPage', pageId: 6})}
                    {this.renderMenu('ios-information-circle', i18n.t('legal_information'), {type: 'staticPage', pageId: 5})}
                    {this.renderMenu('business', i18n.t('about_us'), {type: 'staticPage', pageId: 3})}
                    {this.renderMarginBottom()}
                </ScrollView>
            </View>
        );

    }
}

const styles = StyleSheet.create({
    container: {
        flex: 1
    },
    header: {
        ...ifIphoneX({
            paddingTop: 34,
        }, {
            paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight : 20,
        }),
        paddingLeft: 16,
        height: 100,
        overflow: 'hidden',
        flexDirection: 'row',
        alignItems: 'center'
    },
    headerIcon: {
    },
    headerTitle: {
        fontSize: 20,
        marginLeft: 16,
        fontWeight: 'bold'
    },
    headline: {
        fontSize: 16,
        marginTop: 32,
        marginLeft: 16,
        fontWeight: 'bold',
        marginBottom: 28,
        textAlign: 'left'
    },
    menu: {
        height: 40,
        overflow: 'hidden',
        flexDirection: 'row',
        alignItems: 'center',
        paddingLeft: 16,
        width: '100%',
    },
    directionIcon: {
        position: 'absolute',
        right: 24,
    },
    menuTitle: {
        fontSize: 14,
        marginLeft: 10,
    },
    menuIcon: {
        width: 20,
        height: 40,
        alignItems: 'center',
        justifyContent: 'center',
    },
});

export default connect(({routes, scroll, language, display, player, auth}) => ({routes, scroll, language, display, player, auth}))(SettingsPage);
