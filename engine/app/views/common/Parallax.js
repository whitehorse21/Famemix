import React, {Component} from "react";
import {
    Animated,
    Dimensions,
    Platform,
    Text,
    TouchableOpacity,
    View,
    StyleSheet,
    StatusBar,
    ActivityIndicator,
    ImageBackground,
    Linking,
    TextInput, TouchableHighlight,
} from "react-native";

import AsyncStorage from '@react-native-async-storage/async-storage';

import { Actions } from 'react-native-router-flux';
import { SvgXml, WithLocalSvg } from 'react-native-svg';
import {ifIphoneX} from "../../helpers/ifIphoneX";
import {connect} from "react-redux";
import {shufflePlay, addToCart, doFavorite, playSong, msgShow} from '../../helpers/Functions';
import LinearGradient from "react-native-linear-gradient";
import FastImageBackground from "../../helpers/FastImageBackground";
import { format } from "date-fns";
import {InAppBrowser} from "react-native-inappbrowser-reborn";
import CommentBox from "./CommentBox";
import Moment from 'moment';
import i18n from "i18n-js";
import * as Languages from "../../helpers/Lang";

const GLOBAL = require('../../../config/Global');
const window = Dimensions.get('window');

class Parallax extends Component {
    onLayoutScreen = (e) => {
        let width = e.nativeEvent.layout.width;
        if (width !== this.state.layoutWidth) {
            this.setState({
                layoutWidth: width
            })
        }
    };
    nScroll = new Animated.Value(0);
    scroll = new Animated.Value(0);
    imgScale = this.nScroll.interpolate({
        inputRange: [-25, 0],
        outputRange: [1.2, 1],
        extrapolateRight: "clamp"
    });
    constructor(props) {
        super(props);
        this.nScroll.addListener(Animated.event([{value: this.scroll}], {useNativeDriver: false}));
        this.state = {
            currentLanguage: this.props.language.code,
            layoutWidth: window.width,
            mini: !!this.props.player.show,
            theme: this.props.display.darkMode ? GLOBAL.themes.dark : GLOBAL.themes.light,
            fav: !!this.props.item.favorite,
            linearColor: this.props.display.darkMode ? GLOBAL.themes.dark.parallax.colors : GLOBAL.themes.light.parallax.colors,
        };
    }
    onChangeLanguage = (language) => {
        this.setState({ currentLanguage: language });
    };
    componentWillReceiveProps(nextProps) {
        if(this.props.display.darkMode !== nextProps.display.darkMode ) {
            if(nextProps.display.darkMode){
                this.setState({linearColor: GLOBAL.themes.dark.parallax.colors});
                this.setState({theme: GLOBAL.themes.dark});
            } else {
                this.setState({linearColor: GLOBAL.themes.light.parallax.colors});
                this.setState({theme: GLOBAL.themes.light})
            }
        }
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
    async componentDidMount() {
        let user = JSON.parse(await AsyncStorage.getItem('user'));
        if(user && user.id != null) {
            this.setState({user: user});
        }
    }
    componentWillUnmount() {
    }
    renderMarginBottom() {
        if (this.state.mini) {
            return (
                <View style={{marginBottom: 100}}/>
            )
        } else {
            return (
                <View style={{marginBottom: 50}}/>
            )
        }
    }
    async toggleFav(){
        doFavorite(this.props.kind, this.props.item, ! this.state.fav);
        this.setState({fav: !this.state.fav});
    }

    async redirectToThirdParty(url) {
        try {
            if (await InAppBrowser.isAvailable()) {
                InAppBrowser.open(url, '', {
                    ephemeralWebSession: false,
                    showTitle: false,
                    enableUrlBarHiding: true,
                    enableDefaultShare: false,
                    forceCloseOnRedirection: false
                }).then((response) => {

                })
            } else Linking.openURL(url)
        } catch (error) {
            Linking.openURL(url)
        }
    }

    render() {
        i18n.locale = this.state.currentLanguage;
        i18n.fallbacks = true;
        i18n.translations = Languages;

        return (
            <View
                behavior= {(Platform.OS === 'ios') ? "padding" : null}
                style={[styles.container, {backgroundColor: this.state.theme.primaryBackgroundColor}]}
                onLayout={this.onLayoutScreen}
            >
                <Animated.ScrollView
                    scrollEventThrottle={5}
                    showsVerticalScrollIndicator={false}
                    onScroll={
                        Animated.event([
                                {nativeEvent: {contentOffset: {y: this.nScroll}}}
                            ],
                            {useNativeDriver: true})
                    }>

                    <Animated.View
                        style={{
                            position: 'absolute',
                            top: 0,
                            height: 300,
                            width: '100%',
                            transform: [
                                {translateY: Animated.multiply(this.nScroll, 0)},
                                {scale: this.imgScale}
                            ]
                        }}>
                        <ImageBackground
                            blurRadius={40}
                            source={{uri: this.props.item.artwork_url}}
                            style={ styles.blur_background }>
                        </ImageBackground>
                        <LinearGradient
                            colors={[this.state.linearColor[0], this.state.linearColor[1], this.state.linearColor[2]]}
                            style={{
                                position: 'absolute',
                                flex: 1,
                                width: '100%',
                                height: 300,
                                bottom: 0
                            }}
                        />
                    </Animated.View>
                    <View style={{width:'100%', alignItems: 'center', justifyContent: 'center'}}>
                        <FastImageBackground
                            style={ styles.avatar }
                            source={{uri:  this.props.item.artwork_url}}
                            imageStyle={{ borderRadius: 3}}
                        >
                            {(this.props.kind !== 'artist') &&
                                <TouchableOpacity
                                    style={{
                                        width: 60,
                                        height: 60,
                                        backgroundColor: 'rgba(0,0,0,.65)',
                                        borderRadius: 30,
                                        padding: 1
                                    }}
                                    onPress={
                                        () => {
                                            if(this.props.kind === 'song') {
                                                playSong(this.props.item);
                                            } else {
                                                shufflePlay(this.props.songs ? this.props.songs : []);
                                            }
                                        }
                                    }
                                >
                                    <View style={{
                                        borderWidth: 2,
                                        borderColor: 'white',
                                        flex: 1,
                                        borderRadius: 28,
                                        justifyContent: 'center',
                                        alignItems: 'center'
                                    }}>
                                        <SvgXml
                                            xml={`<svg fill="white" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 42 48"><path fill-rule="evenodd" clip-rule="evenodd" d="M0,3.7c0-3.3,2.3-4.7,5.2-3L39.8,21c2.9,1.7,2.9,4.4,0,6.1L5.2,47.3C2.3,49,0,47.6,0,44.3V3.7z"></path></svg>`}
                                            width="16" height="16"
                                            style={{fontSize: 24, color: this.state.theme.profile.actionsIconColor}}/>
                                    </View>
                                </TouchableOpacity>
                            }
                            {this.props.kind === 'playlist' &&
                                <View style={{
                                    position: 'absolute',
                                    width: '75%',
                                    height: 6,
                                    top: -12,
                                    borderTopLeftRadius: 3,
                                    borderTopRightRadius: 3,
                                    backgroundColor: 'hsla(0,0%,100%,.15)',
                                }}/>
                            }
                            {this.props.kind === 'playlist' &&
                                <View style={{
                                    position: 'absolute',
                                    width: '90%',
                                    height: 6,
                                    top: -6,
                                    borderTopLeftRadius: 3,
                                    borderTopRightRadius: 3,
                                    backgroundColor: 'hsla(0,0%,100%,.35)',
                                }}/>
                            }
                        </FastImageBackground>
                        <Text
                            style={[{
                                fontSize: 24,
                                fontWeight: '500',
                                marginBottom: 4,
                                marginLeft: 32,
                                marginRight: 32,
                            }, {color: this.state.theme.textPrimaryColor}]}
                            numberOfLines={1}
                        >
                            {this.props.item.title ? this.props.item.title : this.props.item.name}
                        </Text>
                        {this.props.kind === 'playlist' &&
                            <Text style={[
                                {
                                    fontSize: 16,
                                    fontWeight: '500',
                                }
                                , {color: this.state.theme.textSecondaryColor}]}>
                                {this.props.item.user && this.props.item.user.name}
                            </Text>
                        }
                        {(this.props.kind === 'song' || this.props.kind === 'album') &&
                        <Text style={[
                            {
                                fontSize: 16,
                                fontWeight: '500',
                            }
                            , {color: this.state.theme.textSecondaryColor}]}>
                            {this.props.item.artists && this.props.item.artists.map(function (artist) {return artist.name}).join(", ")}
                        </Text>
                        }
                        {this.props.kind === 'artist' &&
                            <View
                                style={{
                                    flexDirection: 'row',
                                    justifyContent: 'center',
                                    alignItems: 'center',
                                    marginBottom: 16
                                }}
                            >
                                {this.props.item.website &&
                                <TouchableOpacity
                                    style={[styles.connectedSocial, {backgroundColor: this.state.theme.parallax.secondaryButtonColor}]}
                                    onPress={
                                        () => {
                                            this.redirectToThirdParty(this.props.item.website)
                                        }
                                    }
                                >
                                    <WithLocalSvg
                                        style={{
                                            width: 16,
                                            height: 16
                                        }}
                                        fill={this.state.theme.navIconColor}
                                        width={16}
                                        height={16}
                                        asset={require('../../../assets/icons/social/globe.svg')}
                                    />
                                </TouchableOpacity>
                                }
                                {this.props.item.twitter &&
                                <TouchableOpacity
                                    style={[styles.connectedSocial, {backgroundColor: this.state.theme.parallax.secondaryButtonColor}]}
                                    onPress={
                                        () => {
                                            this.redirectToThirdParty(this.props.item.twitter)
                                        }
                                    }
                                >
                                    <WithLocalSvg
                                        style={{
                                            width: 16,
                                            height: 16
                                        }}
                                        fill={this.state.theme.navIconColor}
                                        width={16}
                                        height={16}
                                        asset={require('../../../assets/icons/social/twitter.svg')}
                                    />
                                </TouchableOpacity>
                                }
                                {this.props.item.facebook &&
                                <TouchableOpacity
                                    style={[styles.connectedSocial, {backgroundColor: this.state.theme.parallax.secondaryButtonColor}]}
                                    onPress={
                                        () => {
                                            this.redirectToThirdParty(this.props.item.facebook)
                                        }
                                    }
                                >
                                    <WithLocalSvg
                                        style={{
                                            width: 16,
                                            height: 16
                                        }}
                                        fill={this.state.theme.navIconColor}
                                        width={16}
                                        height={16}
                                        asset={require('../../../assets/icons/social/facebook.svg')}
                                    />
                                </TouchableOpacity>
                                }
                                {this.props.item.youtube &&
                                <TouchableOpacity
                                    onPress={
                                        () => {
                                            this.redirectToThirdParty(this.props.item.youtube)
                                        }
                                    }
                                    style={[styles.connectedSocial, {backgroundColor: this.state.theme.parallax.secondaryButtonColor}]}
                                >
                                    <WithLocalSvg
                                        style={{
                                            width: 16,
                                            height: 16
                                        }}
                                        fill={this.state.theme.navIconColor}
                                        width={16}
                                        height={16}
                                        asset={require('../../../assets/icons/social/youtube.svg')}
                                    />
                                </TouchableOpacity>
                                }
                                {this.props.item.instagram &&
                                <TouchableOpacity
                                    onPress={
                                        () => {
                                            this.redirectToThirdParty(this.props.item.instagram)
                                        }
                                    }
                                    style={[styles.connectedSocial, {backgroundColor: this.state.theme.parallax.secondaryButtonColor}]}
                                >
                                    <WithLocalSvg
                                        style={{
                                            width: 16,
                                            height: 16
                                        }}
                                        fill={this.state.theme.navIconColor}
                                        width={16}
                                        height={16}
                                        asset={require('../../../assets/icons/social/instagram.svg')}
                                    />
                                </TouchableOpacity>
                                }
                                {this.props.item.soundcloud &&
                                <TouchableOpacity
                                    onPress={
                                        () => {
                                            this.redirectToThirdParty(this.props.item.soundcloud)
                                        }
                                    }
                                    style={[styles.connectedSocial, {backgroundColor: this.state.theme.parallax.secondaryButtonColor}]}
                                >
                                    <WithLocalSvg
                                        style={{
                                            width: 16,
                                            height: 16
                                        }}
                                        fill={this.state.theme.navIconColor}
                                        width={16}
                                        height={16}
                                        asset={require('../../../assets/icons/social/soundcloud.svg')}
                                    />
                                </TouchableOpacity>
                                }
                            </View>
                        }
                        {this.props.kind !== 'artist' &&
                            <View style={{
                                justifyContent: 'center',
                                alignItems: 'center',
                                flexDirection: 'row',
                                marginTop: 16,
                                marginBottom: 16
                            }}>
                                {(this.props.kind !== 'playlist' && this.props.kind !== 'album') &&
                                <View style={{
                                    flexDirection: 'row',
                                    alignItems: 'center',
                                    marginLeft: 8,
                                    marginRight: 8
                                }}>
                                    <WithLocalSvg
                                        style={{
                                            width: 16,
                                            height: 16
                                        }}
                                        fill={this.state.theme.textSecondaryColor}
                                        width={16}
                                        height={16}
                                        asset={require('../../../assets/icons/common/fav.svg')}
                                    />
                                    <Text
                                        style={{
                                            color: this.state.theme.textSecondaryColor,
                                            fontWeight: '500',
                                            fontSize: 14,
                                            marginLeft: 4
                                        }}
                                    >{this.props.item.loves}</Text>
                                </View>
                                }
                                {(this.props.kind === 'song') &&
                                <View style={{
                                    flexDirection: 'row',
                                    alignItems: 'center',
                                    marginLeft: 8,
                                    marginRight: 8
                                }}>
                                    <WithLocalSvg
                                        style={{
                                            width: 16,
                                            height: 16
                                        }}
                                        fill={this.state.theme.textSecondaryColor}
                                        width={16}
                                        height={16}
                                        asset={require('../../../assets/icons/common/play.svg')}
                                    />
                                    <Text
                                        style={{
                                            color: this.state.theme.textSecondaryColor,
                                            fontWeight: '500',
                                            fontSize: 14,
                                            marginLeft: 4
                                        }}
                                    >{this.props.item.plays}</Text>
                                </View>
                                }
                                {(this.props.kind === 'song') &&
                                <View style={{
                                    flexDirection: 'row',
                                    alignItems: 'center',
                                    marginLeft: 8,
                                    marginRight: 8
                                }}>
                                    <WithLocalSvg
                                        style={{
                                            width: 16,
                                            height: 16
                                        }}
                                        fill={this.state.theme.textSecondaryColor}
                                        width={16}
                                        height={16}
                                        asset={require('../../../assets/icons/common/check.svg')}
                                    />
                                    <Text
                                        style={{
                                            color: this.state.theme.textSecondaryColor,
                                            fontWeight: '500',
                                            fontSize: 14,
                                            marginLeft: 4
                                        }}
                                    >{this.props.item.collectors}</Text>
                                </View>
                                }
                                <View style={{
                                    flexDirection: 'row',
                                    alignItems: 'center',
                                    marginLeft: 8,
                                    marginRight: 8
                                }}>
                                    <WithLocalSvg
                                        style={{
                                            width: 16,
                                            height: 16
                                        }}
                                        fill={this.state.theme.textSecondaryColor}
                                        width={16}
                                        height={16}
                                        asset={require('../../../assets/icons/common/comment.svg')}
                                    />
                                    <Text
                                        style={{
                                            color: this.state.theme.textSecondaryColor,
                                            fontWeight: '500',
                                            fontSize: 14,
                                            marginLeft: 4
                                        }}
                                    >{this.props.item.comment_count}</Text>
                                </View>
                                {this.props.kind === 'playlist' && <View style={{
                                    flexDirection: 'row',
                                    alignItems: 'center',
                                    marginLeft: 8,
                                    marginRight: 8
                                }}>
                                    <WithLocalSvg
                                        style={{
                                            width: 16,
                                            height: 16
                                        }}
                                        fill={this.state.theme.textSecondaryColor}
                                        width={16}
                                        height={16}
                                        asset={require('../../../assets/icons/common/collaborators.svg')}
                                    />
                                    <Text
                                        style={{
                                            color: this.state.theme.textSecondaryColor,
                                            fontWeight: '500',
                                            fontSize: 14,
                                            marginLeft: 4
                                        }}
                                    >{this.props.item.collaboration}</Text>
                                </View>}
                                {(this.props.kind === 'playlist' || this.props.kind === 'album' || this.props.kind === 'artist') && <View style={{
                                    flexDirection: 'row',
                                    alignItems: 'center',
                                    marginLeft: 8,
                                    marginRight: 8
                                }}>
                                    <WithLocalSvg
                                        style={{
                                            width: 16,
                                            height: 16
                                        }}
                                        fill={this.state.theme.textSecondaryColor}
                                        width={16}
                                        height={16}
                                        asset={require('../../../assets/icons/common/songs.svg')}
                                    />
                                    <Text
                                        style={{
                                            color: this.state.theme.textSecondaryColor,
                                            fontWeight: '500',
                                            fontSize: 14,
                                            marginLeft: 4,
                                        }}
                                    >{this.props.item.song_count}</Text>
                                </View>}
                                {(this.props.kind === 'playlist' || this.props.kind === 'artist') && <View style={{
                                    flexDirection: 'row',
                                    alignItems: 'center',
                                    marginLeft: 8,
                                    marginRight: 8
                                }}>
                                    <WithLocalSvg
                                        fill={this.state.theme.textSecondaryColor}
                                        width={16}
                                        height={16}
                                        asset={require('../../../assets/icons/common/followers.svg')}
                                    />
                                    <Text
                                        style={{
                                            color: this.state.theme.textSecondaryColor,
                                            fontWeight: '500',
                                            fontSize: 14,
                                            marginLeft: 4
                                        }}
                                    >{this.props.item.subscriber_count}</Text>
                                </View>}
                                {(this.props.kind === 'playlist' || (this.props.kind === 'song' && this.props.item.released_at)) &&
                                    <View style={{
                                        flexDirection: 'row',
                                        alignItems: 'center',
                                        marginLeft: 8,
                                        marginRight: 8
                                    }}>
                                        <WithLocalSvg
                                            style={{
                                                width: 16,
                                                height: 16
                                            }}
                                            fill={this.state.theme.textSecondaryColor}
                                            width={16}
                                            height={16}
                                            asset={require('../../../assets/icons/common/clock.svg')}
                                        />
                                        <Text
                                            style={{
                                                color: this.state.theme.textSecondaryColor,
                                                fontWeight: '500',
                                                fontSize: 14,
                                                marginLeft: 4
                                            }}
                                        >{this.props.kind === 'playlist' ? format(new Date(this.props.item.created_at), "MMM d") : format(new Date(Moment(this.props.item.released_at).toDate()), "MMM d")}</Text>
                                    </View>
                                }
                                {(this.props.kind === 'album' && this.props.item.released_at) &&
                                <View style={{
                                    flexDirection: 'row',
                                    alignItems: 'center',
                                    marginLeft: 8,
                                    marginRight: 8
                                }}>
                                    <WithLocalSvg
                                        style={{
                                            width: 16,
                                            height: 16
                                        }}
                                        fill={this.state.theme.textSecondaryColor}
                                        width={16}
                                        height={16}
                                        asset={require('../../../assets/icons/common/clock.svg')}
                                    />
                                    <Text
                                        style={{
                                            color: this.state.theme.textSecondaryColor,
                                            fontWeight: '500',
                                            fontSize: 14,
                                            marginLeft: 4
                                        }}
                                    >{this.props.kind === 'playlist' ? format(new Date(this.props.item.created_at), "MMM d") : format(new Date(Moment(this.props.item.released_at).toDate()), "MMM d")}</Text>
                                </View>
                                }
                            </View>
                        }
                        <View style={{
                            flexDirection: 'row',
                            alignItems: 'center',
                            justifyContent: 'center'
                        }}>
                            {this.props.kind === 'song' && (parseInt(this.props.item.selling) === 1) &&
                            <TouchableOpacity
                                onPress={() => {
                                    if(this.props.auth.isLogged) {
                                        addToCart('App\\Models\\Song', this.props.item.id);
                                    } else {
                                        Actions.loginModal();
                                    }
                                }}
                                style={[
                                    styles.primaryButton,
                                    {
                                        backgroundColor: this.state.theme.primaryButton.backgroundColor
                                    }
                                ]}
                            >
                                <Text
                                    style={{
                                        color: 'white',
                                        fontWeight: '600',
                                        fontSize: 16,
                                        marginLeft: 4
                                    }}
                                >Buy ${this.props.item.price}</Text>
                            </TouchableOpacity>
                            }
                            {this.props.kind === 'song' && ! this.props.item.selling &&
                            <TouchableOpacity
                                onPress={() => {
                                    playSong(this.props.item)
                                }}
                                style={[
                                    styles.primaryButton,
                                    {
                                        backgroundColor: this.state.theme.primaryButton.backgroundColor
                                    }
                                ]}
                            >
                                <Text
                                    style={{
                                        color: 'white',
                                        fontWeight: '600',
                                        fontSize: 16,
                                        marginLeft: 4
                                    }}
                                >Play</Text>
                            </TouchableOpacity>
                            }
                            {this.props.kind === 'playlist' &&
                                <TouchableOpacity
                                    style={[
                                        styles.primaryButton,
                                        {
                                            backgroundColor: this.state.theme.primaryButton.backgroundColor
                                        }
                                    ]}
                                    onPress={
                                        () => {
                                            this.toggleFav();
                                        }
                                    }
                                >
                                    <SvgXml
                                        xml={`<svg fill="white" height="512" viewBox="0 0 511.333 511.333" xmlns="http://www.w3.org/2000/svg"><path d="m415.667 74.667h-320c-11.598 0-21 9.402-21 21v320c0 11.598 9.402 21 21 21h320c11.598 0 21-9.402 21-21v-320c0-11.598-9.403-21-21-21zm-21 320h-278v-278h278z"/><path d="m223.667 362c35.106 0 63.667-28.561 63.667-63.666 0-10.436 0-84.546 0-94.021l33.608 16.805c10.376 5.185 22.988.982 28.175-9.392s.981-22.988-9.392-28.175l-64-32c-13.938-6.967-30.392 3.175-30.392 18.783v64.333h-21.667c-35.106 0-63.667 28.561-63.667 63.667.001 35.105 28.562 63.666 63.668 63.666zm0-85.333h21.667v21.667c0 11.946-9.72 21.666-21.667 21.666s-21.667-9.72-21.667-21.666c0-11.948 9.72-21.667 21.667-21.667z"/><path d="m490.333 106.667c-11.598 0-21 9.402-21 21v256c0 11.598 9.402 21 21 21s21-9.402 21-21v-256c0-11.598-9.402-21-21-21z"/><path d="m21 106.667c-11.598 0-21 9.402-21 21v256c0 11.598 9.402 21 21 21s21-9.402 21-21v-256c0-11.598-9.402-21-21-21z"/></svg>`}
                                        width="24" height="24" style={{color: this.state.theme.profile.actionsIconColor}}/>
                                    <Text
                                        style={{
                                            color: 'white',
                                            fontWeight: '500',
                                            fontSize: 16,
                                            marginLeft: 4
                                        }}
                                    >{this.state.fav ? 'Unsubscribe' : 'Subscribe'}</Text>
                                </TouchableOpacity>
                            }
                            {this.props.kind === 'album' &&
                            <TouchableOpacity
                                style={[
                                    styles.primaryButton,
                                    {
                                        backgroundColor: this.state.theme.primaryButton.backgroundColor
                                    }
                                ]}
                            >
                                <WithLocalSvg
                                    style={{
                                        width: 20,
                                        height: 20
                                    }}
                                    fill={this.state.theme.navIconColor}
                                    width={20}
                                    height={20}
                                    asset={require('../../../assets/icons/common/add-song.svg')}
                                />
                                <Text
                                    style={{
                                        color: 'white',
                                        fontWeight: '500',
                                        fontSize: 16,
                                        marginLeft: 4
                                    }}
                                >Add To Playlist</Text>
                            </TouchableOpacity>
                            }
                            {this.props.kind === 'artist' &&
                            <TouchableOpacity
                                style={[
                                    styles.primaryButton,
                                    {
                                        backgroundColor: this.state.theme.primaryButton.backgroundColor
                                    }
                                ]}
                                onPress={
                                    () => {
                                        this.toggleFav();
                                    }
                                }
                            >
                                <WithLocalSvg
                                    style={{
                                        width: 20,
                                        height: 20
                                    }}
                                    fill={this.state.theme.primaryButton.textColor}
                                    width={20}
                                    height={20}
                                    asset={require('../../../assets/icons/common/follow.svg')}
                                />
                                <Text
                                    style={{
                                        color: this.state.theme.primaryButton.textColor,
                                        fontWeight: '500',
                                        fontSize: 16,
                                        marginLeft: 4
                                    }}
                                >{this.state.fav ? 'UnFollow' : 'Follow'}</Text>
                            </TouchableOpacity>
                            }
                            <TouchableOpacity
                                onPress={ () => Actions.contextMenu({ kind: this.props.kind, item: this.props.item, songs: this.props.songs}) }
                                style={[
                                    styles.secondaryButton,
                                    {
                                        backgroundColor: this.state.theme.parallax.secondaryButtonColor,
                                    }
                                ]}
                            >
                                <WithLocalSvg
                                    style={{
                                        width: 20,
                                        height: 20
                                    }}
                                    fill={this.state.theme.textPrimaryColor}
                                    width={20}
                                    height={20}
                                    asset={require('../../../assets/icons/common/more.svg')}
                                />
                            </TouchableOpacity>
                        </View>
                        {(this.props.kind === 'artist') &&
                            <View
                                style={{
                                    flexDirection: 'row',
                                    marginTop: 24
                                }}
                            >
                                <View style={styles.artistInfoContainer}>
                                    <Text style={[styles.infoPrimaryText, {color: this.state.theme.textPrimaryColor}]}>{this.props.item.follower_count}</Text>
                                    <Text style={[styles.infoSecondaryText, {color: this.state.theme.textSecondaryColor}]}>Followers</Text>
                                </View>
                                <View style={styles.artistInfoContainer}>
                                    <Text style={[styles.infoPrimaryText, {color: this.state.theme.textPrimaryColor}]}>{this.props.item.song_count}</Text>
                                    <Text style={[styles.infoSecondaryText, {color: this.state.theme.textSecondaryColor}]}>Tracks</Text>
                                </View>
                                <View style={styles.artistInfoContainer}>
                                    <Text style={[styles.infoPrimaryText, {color: this.state.theme.textPrimaryColor}]}>{this.props.item.album_count}</Text>
                                    <Text style={[styles.infoSecondaryText, {color: this.state.theme.textSecondaryColor}]}>Albums</Text>
                                </View>
                            </View>
                        }
                    </View>
                    {this.props.item.description !== null && <Text
                        style={{
                            color: this.state.theme.textSecondaryColor,
                            textAlign: 'center',
                            marginTop: 16,
                            marginLeft: 32,
                            marginRight: 32
                        }}
                    >{this.props.item.description}</Text>}
                    {this.props.shoudRenderForeground && (
                        <View style={{marginTop: 0, paddingTop: 40, zIndex: 10, backgroundColor: this.state.theme.primaryBackgroundColor}}>
                            {this.props.isLoading ?  <ActivityIndicator color={this.state.theme.indicatorColor} style={[styles.container, {backgroundColor: this.state.theme.primaryBackgroundColor}]}/> : this.props.renderForeground()}
                        </View>
                    )}
                    {this.renderMarginBottom()}
                </Animated.ScrollView>
                <CommentBox commentableType={this.props.kind} commentableId={this.props.item.id}/>
            </View>
        )
    }
}

const styles = StyleSheet.create({
    container: {
        flex: 1
    },
    stickyHeader: {
        position: "absolute",
        width: "100%",
        zIndex: 450,
        justifyContent: 'center',
        alignItems: 'center',
        ...ifIphoneX({
            height: 78,
            paddingTop: 30
        }, {
            height: 60,
            paddingTop: Platform.OS === 'ios' ? 15 : 0,
        }),
    },
    blur_background: {
        width: '100%',
        ...Platform.select({
            ios: {
                height: 300,
            },
            android: {
                height: 300,
            },
        }),
        justifyContent: 'center',
        alignItems: 'center',
    },
    backgroundOverlay: {
        ...StyleSheet.absoluteFillObject,
        backgroundColor: 'rgba(0, 0, 0, 0.7)',
    },
    Overlay: {
        ...StyleSheet.absoluteFillObject,
        backgroundColor: 'rgba(0, 0, 0, 0.3)',
        flex: 1
    },

    headerClose: {
        position: 'absolute',
        ...ifIphoneX({
            top: 34
        }, {
            top: Platform.OS === 'android' ? StatusBar.currentHeight : 20,
        }),
        left: 0,
        height: 50,
        justifyContent: 'center',
        alignItems: 'center',
        zIndex: 600,
    },
    headerCloseButton: {
        ...Platform.select({
            ios: {
                padding: 15,
            },
            android: {
                padding: 13,
            },
        }),
    },
    parallaxHeaderActions: {
        position: 'absolute',
        ...ifIphoneX({
            top: 34
        }, {
            top: Platform.OS === 'android' ? StatusBar.currentHeight : 20,
        }),
        right: 0,
        flexDirection: 'row',
        height: 50,
        justifyContent: 'center',
        alignItems: 'center',
        zIndex: 600,
    },
    avatar: {
        marginBottom: 12,
        borderRadius: 3,
        marginTop: 46,
        width: 160,
        aspectRatio: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    primaryButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        height: 48,
        fontWeight: '500',
        paddingLeft: 24,
        paddingRight: 24,
        borderRadius: 4,
    },
    secondaryButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        height: 48,
        fontWeight: '500',
        paddingLeft: 16,
        paddingRight: 16,
        borderRadius: 4,
        marginLeft: 8,
    },
    text_header: {
        fontSize: 16,
        fontWeight: 'bold'
    },
    text_sticker_header: {
        fontSize: 14,
        fontWeight: 'bold',
        textAlign: 'center'
    },
    text_descr: {
        fontSize: 12,
    },
    text_sticker_descr: {
        fontSize: 12,
    },
    type: {
        padding: 2,
        borderWidth: 1,
        borderColor: 'rgba(255, 255, 255, .6)',
        borderRadius: 10,
        paddingLeft: 8,
        paddingRight: 8,
        marginTop: 8
    },
    text_type: {
        fontSize: 10,
    },
    stickyButton: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        height: Platform.OS === 'ios' ? 50 : 35,
        marginBottom: 30

    },
    stickyBackground: {
        backgroundColor: 'rgba(0, 0, 0, 0)',
        position: 'absolute',
        left: 0,
        right: 0,
        bottom: 10,
        top: 0,
    },
    playButton: {
        marginTop: 14,
        paddingTop: 10,
        paddingBottom: 10,
        paddingLeft: 70,
        paddingRight: 70,
        borderRadius: 20,
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center'
    },
    playButtonText: {
        fontSize: 13,
        fontWeight: 'bold'
    },
    artwork: {
        borderRadius: 4,
    },
    headline: {
        fontSize: 16,
        marginTop: 16,
        marginLeft: 8,
        marginBottom: 16,
        fontWeight: 'bold',
    },
    more_artwork: {
        marginBottom: 8,
        borderRadius: 4
    },
    artistInfoContainer: {
        marginLeft: 16,
        marginRight: 16,
        justifyContent: 'center',
        alignItems: 'center'
    },
    infoPrimaryText: {
        marginBottom: 4,
        fontWeight: 'bold',
        fontSize: 24
    },
    infoSecondaryText: {
        fontSize: 14
    },
    connectedSocial: {
        width: 40,
        height: 40,
        marginLeft: 4,
        marginRight: 4,

        borderRadius: 20,
        marginTop: 16,
        justifyContent: 'center',
        alignItems: 'center'
    }
});


export default connect(({routes, scroll, language, display, player, auth}) => ({routes, scroll, language, display, player, auth}))(Parallax);
