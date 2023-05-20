import React, {Component} from 'react';
import {View, ScrollView, StyleSheet, Dimensions, Image, ActivityIndicator, Text, TouchableOpacity} from 'react-native';
const GLOBAL = require('../../../config/Global');
import database from '@react-native-firebase/database';
import NavHeader from "../common/NavHeader";
import {connect} from "react-redux";
import {Actions} from "react-native-router-flux";
import {changeStatusBarStyle} from "../../helpers/Functions";
import API from "../../helpers/Axios";
import Song from '../../models/Song';

const window = Dimensions.get('window');

class NowPlaying extends Component {
    static onEnter = async () => {
        changeStatusBarStyle();
    };
    constructor(props) {
        super(props);
        this.state = {
            currentLanguage: this.props.language.code,
            ActivitiesData: null,
            subscribersData: null,
            queueSongs: null,
            layoutWidth: window.width,
            theme: this.props.display.darkMode ? GLOBAL.themes.dark : GLOBAL.themes.light,
            mini: props.player.show ? props.player.show : false,
        };
    }
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
    async componentWillReceiveProps(nextProps) {
        if(this.props.display.darkMode !== nextProps.display.darkMode ) {
            if(nextProps.display.darkMode){
                this.setState({theme: GLOBAL.themes.dark});
            } else {
                this.setState({theme: GLOBAL.themes.light})
            }
        }
        if( this.props.player.show !==  nextProps.player.show) {
            this.setState({mini: nextProps.player.show});
        }
        if(this.props.language.code !== nextProps.language.code ) {
            this.onChangeLanguage(nextProps.language.code)
        }
    }
    componentDidMount() {
        /** get playing song for user context menu */
        let queueRef = database().ref('users/' + this.props.user.username + '/queue');
        let self = this;
        queueRef.on('value', function(snap) {
            if (snap.val()) {
                let data = snap.val();
                const queueData = {
                    currentId: data.currentId,
                    queueIds : data.queueIds
                };
                API.post('user/' + this.props.user.id + 'now-playing', queueData)
                    .then(res => {
                        self.setState({
                            currentSong: res.data.currentSong,
                            queueSongs: res.data.queueSongs
                        });
                    });
            } else {
                self.setState({playing: false})
            }
        });
    }
    renderMarginBottom() {
        if (this.state.mini) {
            return (
                <View style={{marginBottom: 50}}/>
            )
        }
    }
    renderUserQueue (){
        if(this.state.queueSongs === null) {
            return (
                <ActivityIndicator color={this.state.theme.indicatorColor} style={{flex: 1}} />
            )
        } else {
            return (
                <ScrollView style={styles.content}>
                    <Text style={[styles.headerTitle, {color: this.state.theme.headlineColor}]}>Now Playing Song</Text>
                    <View style={{flexDirection: 'row'}}>
                        <TouchableOpacity onPress={() => {Actions.songInfoModal({item: this.state.currentSong})}} style={{marginLeft: 16, height: 80, width: 80, float: 'left', borderRadius: 3, overflow: 'hidden'}}>
                            <Image source={{
                                uri: this.state.currentSong.artwork_url,
                                width: 80,
                                height: 80,
                            }}/>
                        </TouchableOpacity>
                        <View style={{flex: 1, paddingLeft: 10}}>
                            <Text style={{fontWeight: 'bold', color: this.state.theme.textPrimaryColor, marginBottom: 3, fontSize: 18}} numberOfLines={1}>{this.state.currentSong.title}</Text>
                            <Text style={{fontWeight: 'bold', color: this.state.theme.textSecondaryColor, fontSize: 12}} numberOfLines={1}>{this.state.currentSong.artists.map(function (artist) {return artist.name}).join(", ")}</Text>
                        </View>
                    </View>
                    <Text style={[styles.headerTitle, {color: this.state.theme.headlineColor}]}>Songs In Queue</Text>
                    <Song SongData={this.state.queueSongs} layoutWidth={this.state.layoutWidth} theme={this.state.theme}/>
                    {this.renderMarginBottom()}
                </ScrollView>
            )
        }
    }
    render () {
        return (
            <View style={[styles.container, {backgroundColor: this.state.theme.primaryBackgroundColor}]}>
                <NavHeader title={this.props.user.name + '\'s Queue'}/>
                {this.renderUserQueue()}
            </View>
        );

    }
}
const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    content: {
    },
    headerTitle: {
        fontWeight: 'bold', fontSize: 17, paddingLeft: 16, marginTop: 20, marginBottom: 20, textAlign: 'left'
    },
});



export default connect(({routes, scroll, language, display, player, auth}) => ({routes, scroll, language, display, player, auth}))(NowPlaying);
