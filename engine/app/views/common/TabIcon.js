import React, {Component} from "react";
import i18n from 'i18n-js';
import * as Languages from '../../helpers/Lang';

import {View, Text} from 'react-native';
import { Icon } from 'native-base';
import {connect} from "react-redux";
const GLOBAL = require("../../../config/Global");


class TabIcon extends Component {
    constructor(props) {
        super(props);
        this.state = {
            currentLanguage: 'en',
            title: this.props.title,
            theme: this.props.theme === 'light' ? GLOBAL.themes.light : GLOBAL.themes.dark,
        };
    }
    onChangeLanguage = (language) => {
        this.setState({ currentLanguage: language });
        i18n.locale = language;
        i18n.fallbacks = true;
        i18n.translations = Languages;

        if(this.props.tabTitleKey === "explore"){
            this.setState({title: i18n.t('explore')})
        } else if(this.props.tabTitleKey === "community") {
            this.setState({title: i18n.t('community')})
        } else if(this.props.tabTitleKey === "my_music") {
            this.setState({title: i18n.t('my_music')})
        } else if(this.props.tabTitleKey === "settings") {
            this.setState({title: i18n.t('settings')})
        }
    };
    render(){
        return (
            <View/>
        )
    }
}



export default connect(({routes, scroll, language, display, player, auth}) => ({routes, scroll, language, display, player, auth}))(TabIcon);
