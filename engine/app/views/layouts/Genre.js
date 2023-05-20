/*
 * Created by ninacoder
 * @https://codecanyon.net/user/codenamenina
 */

'use strict';
import React, { Component } from 'react';
import {StyleSheet, Text, View, ScrollView, ActivityIndicator, Dimensions, TouchableOpacity} from 'react-native';
import NavHeader from '../common/NavHeader';
import Album from '../../models/Album';
import Playlist from '../../models/Playlist';
import Artist from '../../models/Artist';
import Song from '../../models/Song';
import {connect} from "react-redux";
import i18n from 'i18n-js';
import {changeStatusBarStyle} from "../../helpers/Functions";
import * as Languages from '../../helpers/Lang';
import API from "../../helpers/Axios";
const GLOBAL = require('../../../config/Global');
import {Actions} from "react-native-router-flux";
import Slider from "../../models/Slider";
import Channel from "../../models/Channel";

class Genre extends Component {
    static onEnter = async () => {
        changeStatusBarStyle();
    };
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
    constructor(props) {
        super(props);
        this.state = {
            currentLanguage: this.props.language.code,
            layoutWidth: window.width,
            AlbumData: [],
            SongData: [],
            ArtistData: [],
            PlaylistData: [],
            mini: props.player.show ? props.player.show : false,
            theme: this.props.display.darkMode ? GLOBAL.themes.dark : GLOBAL.themes.light,
            isLoading: true
        };
        Dimensions.addEventListener('change', () => {
            try {
                this.setState({window: Dimensions.get('window')});
            } catch (e) {

            }
        });
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
    componentDidMount() {
        API.get('genre/' + this.props.row.alt_name)
            .then(res => {
                this.setState({
                    slides: res.data.slides,
                    channels: res.data.channels,
                    SongData: res.data.genre.songs.data,
                    isLoading: false
                });
            });
    }
    renderAlbum(){
        if(this.state.AlbumData.length) return (
            <View>
                <TouchableOpacity onPress={ () => { Actions.genreDetails({row: this.props.row, kind: 'albums'}) } } style={styles.headlineArea}>
                    <Text style={[styles.headline, {color: this.state.theme.headlineColor}]}>Albums</Text>
                    <Text style={[styles.textMore, {color: this.state.theme.moreTextColor}]}>{i18n.t('see_all')}</Text>
                </TouchableOpacity>
                <ScrollView showsHorizontalScrollIndicator={false} horizontal={true} style={{paddingLeft: 8}}>
                    <Album AlbumData={this.state.AlbumData} horizontal={true} theme={this.state.theme}/>
                </ScrollView>
            </View>)
    }
    renderArtist(){
        if(this.state.ArtistData.length) return (
            <View>
                <TouchableOpacity onPress={ () => { Actions.genreDetails({row: this.props.row, kind: 'artists'}) } } style={styles.headlineArea}>
                    <Text style={[styles.headline, {color: this.state.theme.headlineColor}]}>Artists</Text>
                    <Text style={[styles.textMore, {color: this.state.theme.moreTextColor}]}>{i18n.t('see_all')}</Text>
                </TouchableOpacity>
                <ScrollView showsHorizontalScrollIndicator={false} horizontal={true} style={{paddingLeft: 8}}>
                    <Artist ArtistData={this.state.ArtistData} horizontal={true} theme={this.state.theme}/>
                </ScrollView>
            </View>)
    }
    renderPlaylist(){
        if(this.state.PlaylistData.length) return (
            <View>
                <TouchableOpacity onPress={ () => { Actions.genreDetails({row: this.props.row, kind: 'playlists'}) } } style={styles.headlineArea}>
                    <Text style={[styles.headline, {color: this.state.theme.headlineColor}]}>Playlists</Text>
                    <Text style={[styles.textMore, {color: this.state.theme.moreTextColor}]}>{i18n.t('see_all')}</Text>
                </TouchableOpacity>
                <ScrollView showsHorizontalScrollIndicator={false} horizontal={true} style={{paddingLeft: 8}}>
                    <Playlist PlaylistData={this.state.PlaylistData} horizontal={true} theme={this.state.theme}/>
                </ScrollView>
            </View>)
    }
    renderSong(){
        i18n.locale = this.state.currentLanguage;
        i18n.fallbacks = true;
        i18n.translations = Languages;

        if(this.state.SongData.length) return (
            <View>
                <TouchableOpacity onPress={ () => { Actions.genreDetails({row: this.props.row, kind: 'songs'}) } } style={styles.headlineArea}>
                    <Text style={[styles.headline, {color: this.state.theme.headlineColor}]}>Songs</Text>
                    <Text style={[styles.textMore, {color: this.state.theme.moreTextColor}]}>{i18n.t('see_all')}</Text>
                </TouchableOpacity>
                <Song SongData={this.state.SongData} theme={this.state.theme} layoutWidth={this.state.layoutWidth}/>
            </View>
        )
    }
    renderContent() {
        if (this.state.isLoading === true) {
            return (<ActivityIndicator color={this.state.theme.indicatorColor} style={[styles.container, {backgroundColor: this.state.theme.primaryBackgroundColor}]}/>);
        } else {
            return (
                <ScrollView showsVerticalScrollIndicator={false}>
                    {this.state.slides && <Slider data={this.state.slides}/>}
                    {this.state.channels && <Channel data={this.state.channels}/>}
                    {/*this.renderSong()*/}
                    {this.renderMarginBottom()}
                </ScrollView>
            )
        }
    }
    render(){
        return (
            <View style={[styles.container, {backgroundColor: this.state.theme.primaryBackgroundColor}]} onLayout={this.onLayoutScreen}>
                <NavHeader title={this.props.row.name}/>
                {this.renderContent()}
            </View>
        );
    }
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    content: {
        paddingTop: 8,
    },
    headlineArea: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingLeft: 8
    },
    headline: {
        fontSize: 16,
        marginTop: 16,
        marginLeft: 8,
        marginBottom: 16,
        fontWeight: 'bold',
    },
    textMore: {
        fontSize: 13,
        fontWeight: 'bold',
        position: 'absolute',
        right: 16,
    },
});


export default connect(({routes, scroll, language, display, player, auth}) => ({routes, scroll, language, display, player, auth}))(Genre);
