import React, {Component} from "react";
import UserParallax from '../common/UserParallax';
import {connect} from "react-redux";
import {changeStatusBarStyle} from "../../helpers/Functions";
const GLOBAL = require('../../../config/Global');

class UserShow extends Component {
    static onEnter = async() => {
        changeStatusBarStyle();
    };
    constructor(props) {
        super(props);
        this.state = {
            currentLanguage: this.props.language.code,
            theme: this.props.display.darkMode ? GLOBAL.themes.dark : GLOBAL.themes.light,
        };
    }
    render() {
        return (
            <UserParallax
                theme={this.state.theme}
                lang={this.state.currentLanguage}
                item={this.props.user}
                isOwner={false}
            />
        )
    }
}


export default connect(({routes, scroll, language, display, player, auth}) => ({routes, scroll, language, display, player, auth}))(UserShow);
