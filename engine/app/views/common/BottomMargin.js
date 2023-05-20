import React, {Component} from 'react';
import {View} from 'react-native';
import {connect} from "react-redux";
const GLOBAL = require("../../../config/Global");

class BottomMargin extends Component {
    constructor(props) {
        super(props);
        this.state = {
            theme: this.props.display.darkMode ? GLOBAL.themes.dark : GLOBAL.themes.light,
            isPlayerShow: false,
            isAdSupport: this.props.role.ad_support
        };
    }

    onChangeLanguage = (language) => {
        this.setState({ currentLanguage: language });
    };

    async componentWillReceiveProps(nextProps) {
        if(this.props.player.show !== nextProps.player.show) {
            setTimeout(() => {
                this.setState({isPlayerShow: nextProps.player.show})
            }, 2000);
        }
        if(this.props.role.ad_support !== nextProps.role.ad_support) {
            setTimeout(() => {
                this.setState({isAdSupport: nextProps.role.ad_support})
            }, 2000);
        }
    }
    _isMounted = false;

    componentWillUnmount() {
        this._isMounted = false;
    }

    componentDidMount() {
        this._isMounted = true;
    }

    render () {
        return (
            <View
                style={{
                    marginBottom: this.state.isPlayerShow ? (this.state.isAdSupport ? 100 : 50) : (this.state.isAdSupport ? 50 : 0)
                }}
            />
        )
    }
}

export default connect(({display, ad, player, role}) => ({display, ad, player, role}))(BottomMargin);
