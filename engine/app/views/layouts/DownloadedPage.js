/*
 * Created by ninacoder
 * @https://codecanyon.net/user/codenamenina
 */

import React, {Component} from "react";
import {
    Animated,
    Dimensions,
    Platform,
    StyleSheet,
    TouchableOpacity,
    Keyboard,
    View,
    ScrollView,
    TextInput,
    findNodeHandle,
    ActivityIndicator,
    StatusBar,
    Text
} from "react-native";

import {ScrollableTab, Tab, TabHeading, Tabs} from "native-base";
import Album from '../../models/Album';
import Playlist from '../../models/Playlist';
import Artist from '../../models/Artist';
import Song from '../../models/Song';
import User from '../../models/User';
const GLOBAL = require('../../../config/Global');
import NavHeader from '../common/NavHeader';
import {connect} from "react-redux";
import {changeStatusBarStyle} from "../../helpers/Functions";
import API from "../../helpers/Axios";
import i18n from 'i18n-js';
import database from "@react-native-firebase/database";
import AsyncStorage from "@react-native-async-storage/async-storage";

class DownloadedPage extends Component {
    static onEnter = async () => {
        changeStatusBarStyle();
    };
    constructor(props) {
        super(props);
        this.state = {
            activeTab: 0,
            page: 1,
            loading: false,
            mini: props.player.show ? props.player.show : false,
            theme: this.props.display.darkMode ? GLOBAL.themes.dark : GLOBAL.themes.light,
            term: null,
            offlineSongs: null
        };
    }
    componentWillReceiveProps(nextProps) {
        if( this.props.player.show !==  nextProps.player.show) {
            this.setState({mini: nextProps.player.show});
        }
        if(this.props.display.darkMode !== nextProps.display.darkMode ) {
            nextProps.display.darkMode ? this.setState({theme: GLOBAL.themes.dark}) : this.setState({theme: GLOBAL.themes.light})
        }
    }
    renderMarginBottom() {
        if (this.state.mini) {
            return (
                <View style={{marginBottom: 50}}/>
            )
        }
    }

    async componentDidMount() {
        const device_key = await AsyncStorage.getItem('device_key');
        var offlineSongListRef = await database().ref(`offline/${this.props.auth.user.id}/${device_key}/songs`);
        offlineSongListRef.on('value', (snapshot) => {
            if(snapshot.val()) {
                var objects = snapshot.val();
                var output = Object.keys(objects).map(function(key){
                    return objects[key];
                })
                this.setState({offlineSongs: output});
            }
        });
    }
    render(){
        return (
            <View style={[{flex: 1, backgroundColor: this.state.theme.primaryBackgroundColor}]} onLayout={this.onLayoutScreen}>
                <NavHeader title={`Downloaded Songs`} noBorder={true}/>
                <ScrollView
                    style={{flex: 1}}
                    contentContainerStyle={{flexGrow: 1}}
                >
                    {!this.state.offlineSongs && (
                        <ActivityIndicator color={this.state.theme.indicatorColor} style={{flex: 1, backgroundColor: this.state.theme.primaryBackgroundColor}}/>
                    )}

                    {(this.state.offlineSongs) && (
                        <Song SongData={this.state.offlineSongs} layoutWidth={this.state.layoutWidth} theme={this.state.theme}/>
                    )}

                    {this.renderMarginBottom()}
                </ScrollView>
            </View>
        )
    }

}

const styles = StyleSheet.create({

});


export default connect(({routes, scroll, language, display, player, auth}) => ({routes, scroll, language, display, player, auth}))(DownloadedPage);
