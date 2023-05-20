import React, {Component} from 'react';
import {
    View,
    ScrollView,
    StyleSheet,
    StatusBar,
    Dimensions,
    AsyncStorage,
    Platform,
    ActivityIndicator
} from 'react-native';
import Toast from "react-native-root-toast";
const GLOBAL = require('../../../config/Global');
import {ifIphoneX} from "../../helpers/ifIphoneX";
import Notification from "../../models/Notification";
import NavHeader from "../common/NavHeader";
import {connect} from "react-redux";
import {Actions} from "react-native-router-flux";
import {changeStatusBarStyle} from "../../helpers/Functions";
import API from "../../helpers/Axios";

const window = Dimensions.get('window');

class Activities extends Component {
    static onEnter = async () => {
        changeStatusBarStyle();
    }
    constructor(props) {
        super(props);
        this.state = {
            ActivitiesData: null,
            subscribersData: null,
            collaboratorsData: null,
            layoutWidth: window.width,
            theme: this.props.display.darkMode ? GLOBAL.themes.dark : GLOBAL.themes.light,
            user: this.props.auth.user
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
    componentDidMount() {
        this.fetchData();
    }
    fetchData(){
        API.get('profile/' + this.state.user.username + '/activity')
            .then(res => {
                this.setState({
                    ActivitiesData: res.data.activities
                });
            });
    }
    renderActivity (){
        if(this.state.ActivitiesData === null) {
            return (
                <ActivityIndicator color={this.state.theme.indicatorColor} style={{flex: 1}} />
            )
        } else {
            return (
                <Notification ActivitiesData={this.state.ActivitiesData} theme={this.state.theme} from={'profile'} user={this.state.user}/>
            )
        }
    }
    render () {
        return (
            <View style={[styles.container, {backgroundColor: this.state.theme.primaryBackgroundColor}]}>
                <NavHeader title={'Your Activities'}/>
                <ScrollView style={styles.content}>
                    {this.renderActivity()}
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
        padding: 8
    },
    headerClose: {
        position: 'absolute',
        ...ifIphoneX({
            top: 30
        }, {
            top: Platform.OS === 'ios' ? 15 : 0,
        }),
        left: 0,
        zIndex: 20
    }
});



export default connect(({routes, scroll, language, display, player, auth}) => ({routes, scroll, language, display, player, auth}))(Activities);
