import React, {Component} from 'react';
import {View, Text, StyleSheet, TouchableOpacity, Platform, StatusBar, ScrollView} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

import Icon from 'react-native-vector-icons/Ionicons';
import NavHeader from '../common/NavHeader';
import {ifIphoneX} from "../../helpers/ifIphoneX";
import {Actions} from "react-native-router-flux";
import {connect} from "react-redux";

import {switchLanguage} from '../../../reducers/lang';


const GLOBAL = require("../../../config/Global");
class Languages extends Component {
    static onEnter = async () => {
        let theme = await AsyncStorage.getItem('theme');
        if(theme === 'light')
            StatusBar.setBarStyle(GLOBAL.themes.light.defaultStatusBar, false)
        else if(theme === 'dark')
            StatusBar.setBarStyle(GLOBAL.themes.dark.defaultStatusBar, false)
    };
    constructor(props) {
        super(props);
        this.state = {
            theme: this.props.display.darkMode ? GLOBAL.themes.dark : GLOBAL.themes.light,
        };
    }
    renderLanguageMenu(langCode, langName){
        return (
            <TouchableOpacity style={styles.settingMenu}  onPress={() => {
                this.props.dispatch(switchLanguage(langCode));
                AsyncStorage.setItem('lang', langCode);
                Actions.pop()}
            }>
                <View style={styles.setting_submenu_icon}>
                    <Icon name={this.props.language.code === langCode ? 'ios-radio-button-on' : 'ios-radio-button-off'} size={20} color={this.state.theme.profileIconColor}/>
                </View>
                <Text style={[styles.settingMenu_title, {color: this.state.theme.textPrimaryColor,}]}>{langName}</Text>
            </TouchableOpacity>
        )
    }
    render () {
        return (
            <View style={[styles.container, {backgroundColor: this.state.theme.primaryBackgroundColor}]}>
                <NavHeader title={this.props.navTitle}/>
                <ScrollView showsVerticalScrollIndicator={true}>
                    {this.renderLanguageMenu('en', 'English')}
                    {this.renderLanguageMenu('kin', 'Kinyarwanda')}
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
            paddingTop: 30,
        }, {
            paddingTop: Platform.OS === 'ios' ? 20 : 0,
        }),
    },
    setting_box: {
        height: 70,
        overflow: 'hidden',
        flexDirection: 'row',
        alignItems: 'center'
    },
    settings_text: {
        fontSize: 15,
        marginLeft: 8,
        fontWeight: 'bold'
    },
    headline: {
        fontSize: 16,
        marginTop: 32,
        marginLeft: 8,
        fontWeight: 'bold',
        marginBottom: 28
    },
    settingMenu: {
        height: 40,
        overflow: 'hidden',
        flexDirection: 'row',
        alignItems: 'center',
        paddingLeft: 16,
        width: '100%',
    },
    more: {
        position: 'absolute',
        right: 10,
    },
    settingMenu_title: {
        fontSize: 13,
        marginLeft: 10,
    },
    setting_submenu_icon: {
        width: 20,
        height: 40,
        alignItems: 'center',
        justifyContent: 'center',
    },
});


export default connect(({language, display}) => ({language, display}))(Languages);
