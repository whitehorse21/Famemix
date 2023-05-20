'use strict';
import React, {Component} from 'react';
import PropTypes from 'prop-types';
import {StyleSheet, Text, View, Dimensions, ScrollView, Platform, ActivityIndicator, Image, RefreshControl, FlatList, TouchableOpacity} from 'react-native';
import {connect} from "react-redux";
import {Actions} from 'react-native-router-flux';
import {changeStatusBarStyle, playSong} from "../../helpers/Functions";
import i18n from 'i18n-js';
import API from '../../helpers/Axios';
import * as Languages from '../../helpers/Lang';
const GLOBAL = require('../../../config/Global');
import Slider from '../../models/Slider';
import Channel from '../../models/Channel';
import { SvgXml } from 'react-native-svg';
import FastImage from "react-native-fast-image";

const window = Dimensions.get('window');

class Trending extends Component {
    static propTypes = {
        routes: PropTypes.object,
        redux: PropTypes.object,
    };
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
            refreshing: false,
            layoutWidth: window.width,
            window: window,
            songs: [],
            onSearch: false,
            mini: props.player.show ? props.player.show : false,
            theme: this.props.display.darkMode ? GLOBAL.themes.dark : GLOBAL.themes.light,
            showAd: false,
            isLoading: true,
        };

        Dimensions.addEventListener('change', () => {
            try {
                this.setState({window: Dimensions.get('window')});
            } catch (e) {

            }
        });
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
    _isMounted = false;
    componentWillUnmount() {
        this._isMounted = false;
    }
    componentDidMount() {
        this._isMounted = true;
        this.fetchData();
    }
    fetchData(){
        API.get('trending')
            .then(res => {
                if (this._isMounted) {
                    this.setState({
                        isLoading: false,
                        slides: res.data.slides,
                        channels: res.data.channels,
                        songs: res.data.songs,
                        refreshing: false,
                    });
                }
            });
    }
    _onRefresh = () => {
        this.setState({refreshing: true});
        this.fetchData();
    }
    renderMarginBottom() {
        if (this.state.mini) {
            return (
                <View style={{marginBottom: 50}}/>
            )
        }
    }
    keyExtractor = (item, index) => index.toString();
    renderSong = ({ item, index }) => {
        return (
            <TouchableOpacity
                style={{
                    flex: 1,
                    flexDirection: 'row',
                    marginLeft: 16,
                    marginRight: 16,
                    marginBottom: 16
                }}
                onPress={
                    () => {
                        playSong(item)
                    }
                }
                delayLongPress={500}
                onLongPress={
                    () => Actions.contextMenu({ kind:'song', item: item})
                }
            >
                <FastImage
                    style={{
                        width: 100,
                        height: 100,
                        borderRadius: 6
                    }}
                    source={{
                        uri: item.artwork_url,
                        priority: FastImage.priority.normal,
                    }}
                />
                <View
                    style={{
                        flex: 1,
                        marginLeft: 16,
                        justifyContent: 'center'
                    }}
                >
                    <View
                        style={{
                            backgroundColor: '#e23137',
                            height: 20,
                            paddingLeft: 8,
                            paddingRight: 8,
                            justifyContent: 'center',
                            alignItems: 'center',
                            alignSelf: 'flex-start',
                            borderRadius: 20,
                            marginBottom: 4
                        }}
                    >
                        <Text style={{color: 'white', fontWeight: '600'}}>#{index+1}</Text>
                    </View>
                    <Text
                        style={{
                            color: this.state.theme.textPrimaryColor,
                            fontSize: 18,
                            marginBottom: 4,
                            fontWeight: '600'
                        }}
                        numberOfLines={1}
                    >{item.title}</Text>
                    <Text
                        style={{color: this.state.theme.textSecondaryColor}}
                        numberOfLines={1}
                    >{item.artists.map(function (artist) {return artist.name}).join(", ")}</Text>
                    <View
                        style={{
                            marginTop: 4,
                            flexDirection: 'row',
                            alignItems: 'center',
                        }}
                    >
                        <SvgXml fill={this.state.theme.textSecondaryColor} xml={`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" xml:space="preserve"><path d="M256,0C114.833,0,0,114.844,0,256s114.833,256,256,256s256-114.844,256-256S397.167,0,256,0z M357.771,264.969l-149.333,96c-1.75,1.135-3.771,1.698-5.771,1.698c-1.75,0-3.521-0.438-5.104-1.302C194.125,359.49,192,355.906,192,352V160c0-3.906,2.125-7.49,5.563-9.365c3.375-1.854,7.604-1.74,10.875,0.396l149.333,96c3.042,1.958,4.896,5.344,4.896,8.969S360.813,263.01,357.771,264.969z"/></svg>`} width="12" height="12"/>
                        <Text style={{color: this.state.theme.textSecondaryColor, marginLeft: 4, fontSize: 12}}>{item.total_plays} {i18n.t('plays')}</Text>
                    </View>
                </View>
            </TouchableOpacity>
        )
    };
    render(){
        i18n.locale = this.state.currentLanguage;
        i18n.fallbacks = true;
        i18n.translations = Languages;

        if(this.state.isLoading) return (
            <ActivityIndicator color={this.state.theme.indicatorColor} style={{flex: 1, backgroundColor: this.state.theme.primaryBackgroundColor}} />
        );

        return (
            <View style={[styles.mainScrollView, {backgroundColor: this.state.theme.primaryBackgroundColor}]} onLayout={this.onLayoutScreen}>
                <ScrollView style={{flex: 1}} showsVerticalScrollIndicator={false} ref={(ref) => {
                    this.scrollView = ref;
                }} refreshControl={
                    <RefreshControl
                        refreshing={this.state.refreshing}
                        onRefresh={this._onRefresh}
                        tintColor={this.state.theme.indicatorColor}
                        titleColor={this.state.theme.indicatorColor}
                    />
                }>
                    {this.state.slides && <Slider data={this.state.slides}/>}
                    {this.state.channels && <Channel data={this.state.channels}/>}
                    <Text
                        style={{
                            fontSize: 20,
                            color: this.state.theme.textPrimaryColor,
                            margin: 16
                        }}
                    >Today's Trending</Text>
                    <FlatList
                        data={this.state.songs}
                        keyExtractor={this.keyExtractor}
                        renderItem={this.renderSong}
                        theme={this.state.theme}
                    />
                    {this.renderMarginBottom()}
                </ScrollView>
            </View>
        );
    }
}

const styles = StyleSheet.create({
    mainScrollView: {
        flex: 1,
    },
    headline: {
        fontSize: 18,
        fontWeight: '500',
    },
    headlineDescription: {
        marginTop: 6,
        fontSize: 14,
    },
    textMore: {
        fontSize: 13,
        fontWeight: 'bold',
        position: 'absolute',
        right: 0,
    },
});

export default connect(({routes, scroll, language, display, player, auth}) => ({routes, scroll, language, display, player, auth}))(Trending);
