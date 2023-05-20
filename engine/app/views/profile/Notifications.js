import React, {Component} from 'react';
import {
    View,
    ScrollView,
    StyleSheet,
    Dimensions,
    Platform,
    ActivityIndicator
} from 'react-native';
const GLOBAL = require('../../../config/Global');
import {ifIphoneX} from "../../helpers/ifIphoneX";
import Notification from "../../models/Notification";
import NavHeader from "../common/NavHeader";
import {connect} from "react-redux";
import {changeStatusBarStyle} from "../../helpers/Functions";
import API from "../../helpers/Axios";

const window = Dimensions.get('window');

class Notifications extends Component {
    static onEnter = async () => {
        changeStatusBarStyle();
    };
    constructor(props) {
        super(props);
        this.state = {
            layoutWidth: window.width,
            theme: this.props.display.darkMode ? GLOBAL.themes.dark : GLOBAL.themes.light,
            user: this.props.auth.user,
            mini: props.player.show ? props.player.show : false,
        };
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
    }
    renderMarginBottom() {
        if (this.state.mini) {
            return (
                <View style={{marginBottom: 50}}/>
            )
        }
    };
    componentDidMount() {
        this.fetchData();
    }
    fetchData(){
        API.post('auth/user/notifications')
            .then(res => {
                console.log(res.data);

                this.setState({
                    data: res.data
                });
            });
    }
    renderActivity (){
        if(! this.state.data) {
            return (
                <ActivityIndicator color={this.state.theme.indicatorColor} style={{flex: 1}} />
            )
        } else {
            return (
                <Notification data={this.state.data} theme={this.state.theme} from={'home'} user={this.state.user}/>
            )
        }
    }
    render () {
        return (
            <View style={[styles.container, {backgroundColor: this.state.theme.primaryBackgroundColor}]}>
                <NavHeader title={'Notifications'}/>
                <ScrollView
                    style={styles.content}
                    contentContainerStyle={{flexGrow: 1}}
                >
                    {this.renderActivity()}
                    {this.renderMarginBottom()}
                </ScrollView>
            </View>
        );

    }
}
const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    content: {
        padding: 8,
    }
});



export default connect(({routes, scroll, language, display, player, auth}) => ({routes, scroll, language, display, player, auth}))(Notifications);
