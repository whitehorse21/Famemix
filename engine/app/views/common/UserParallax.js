import React, {Component} from "react";
import {
    Animated,
    Dimensions,
    Platform,
    Text,
    TouchableOpacity,
    Image,
    View,
    StyleSheet,
    StatusBar,
    ActivityIndicator,
    ImageBackground, ScrollView, Linking, TouchableHighlight
} from "react-native";

import { Actions } from 'react-native-router-flux';
import { WithLocalSvg } from 'react-native-svg';
import {ifIphoneX} from "../../helpers/ifIphoneX";
import {connect} from "react-redux";
import {doFavorite, timeSince} from '../../helpers/Functions';
import LinearGradient from "react-native-linear-gradient";
import NavHeader from "./NavHeader";
import {ScrollableTab, Tab, TabHeading, Tabs} from "native-base";
import i18n from "i18n-js";
import Playlist from '../../models/Playlist';
import User from '../../models/User';
import Song from "../../models/Song";
import Activity from "../../models/Activity";
import database from '@react-native-firebase/database';

import API from "../../helpers/Axios";
import FastImageBackground from "../../helpers/FastImageBackground";
import AsyncStorage from "@react-native-async-storage/async-storage";
import {InAppBrowser} from "react-native-inappbrowser-reborn";
import SubscribeTip from './SubscribeTip';

const GLOBAL = require('../../../config/Global');
const window = Dimensions.get('window');

class UserParallax extends Component {
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
            layoutWidth: window.width,
            mini: !!this.props.player.show,
            theme: this.props.display.darkMode ? GLOBAL.themes.dark : GLOBAL.themes.light,
            fav: !!this.props.item.favorite,
            linearColor: this.props.display.darkMode ? GLOBAL.themes.dark.parallax.colors : GLOBAL.themes.light.parallax.colors,
            currentLanguage: this.props.language.code,
            refreshing: false,
            overviewData: null,
            collectionData: null,
            playlistsData: null,
            followersData: null,
            followingData: null,
            feedData: null,
            height_overview: 0,
            height_feed: 0,
            height_collection: 0,
            height_playlists: 0,
            height_followers: 0,
            height_following: 0,
            height_queue: 0,
            playing: false,
            isLoading: true,
            offlineSongs: []
        };
    }
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
    }
    async componentDidMount() {
        const device_key = await AsyncStorage.getItem('device_key');
        this.fetchData("");
        if(this.props.isOwner) {
            var offlineSongListRef = await database().ref(`offline/${this.props.auth.user.id}/${device_key}/songs`);
            offlineSongListRef.on('value', (snapshot) => {
                if(snapshot.val()) {
                    var objects = snapshot.val();
                    var output = Object.keys(objects).map(function(key){
                        return objects[key];
                    })
                    this.setState({offlineSongs: output});
                } else {
                    this.setState({offlineSongs: []});
                }
            });
        }
        setTimeout(() => {
            if(this.props.isOwner) {
                this.getFriendsStatus();
            }
        }, 1000);
    }
    componentWillUnmount() {

    }

    getFriendsStatus(){
        API.get('user/' + this.props.auth.user.id + '/following')
            .then(res => {
                let data = res.data.profile.following.data;
                let self = this;
                for(let i = 0; i < data.length; i++) {
                    let username = data[i].username;
                    let connectedRef = database().ref('users/' + username + '/connections');
                    let lastOnlineRef = database().ref('users/' + username + '/lastOnline');
                    connectedRef.on('value', function(snap) {
                        if (snap.val()) {
                            self.setOnline(data[i].id);
                            lastOnlineRef.off();
                        } else {
                            self.setOffline(data[i].id);
                            lastOnlineRef.on('value', function(snap) {
                                if (snap.val()) {
                                    self.setLastTime(data[i].id, snap.val())
                                    setInterval(function(){
                                        self.setLastTime(data[i].id, snap.val())
                                    }, 60000);
                                }
                            });
                        }
                    });
                }
                this.setState({
                    userFriends: res.data.following,
                });
            });
    }
    renderMarginBottom() {
        if (this.state.mini) {
            return (
                <View style={{marginBottom: 50}}/>
            )
        }
    }
    async toggleFav(){
        doFavorite(this.props.kind, this.props.item.id, ! this.state.fav);
        this.setState({fav: !this.state.fav});
    }
    setOnline(id) {
        const user = {};
        user['isUserOnline_' + id] = true;
        this.setState(user);
    }
    setOffline(id) {
        const user = {};
        user['isUserOnline_' + id] = false;
        this.setState(user);
    }
    setLastTime(id, timeStamp){
        const user = {};
        user['userTimeSince_' + id] = timeSince(timeStamp);
        this.setState(user);
        console.log(user);
    }
    fetchData(tab){
        API.get('user/' + this.props.item.id + '/' + tab)
            .then(res => {
                if(tab === "") {
                    this.setState({
                        overviewData: res.data.profile,
                    });
                } else if(tab === "playlists") {
                    this.setState({
                        playlistsData: res.data.profile.playlists.data,
                    });
                } else if(tab === "collection") {
                    this.setState({
                        collectionData: res.data.profile.collection.data,
                    });
                } else if(tab === "feed") {
                    this.setState({
                        feedData: res.data.profile.feed.data,
                    });
                } else if(tab === "followers") {
                    this.setState({
                        followersData: res.data.profile.followers.data,
                    });
                } else if(tab === "following") {
                    this.setState({
                        followingData: res.data.profile.following.data,
                    });
                }
                this.setState({
                    isLoading: false
                });
            });
    }
    renderOverview (){
        return (
            <View
                style={{flex: 1}}
            >
                {!this.state.overviewData && <ActivityIndicator color={this.state.theme.indicatorColor} style={styles.activityIndicator} />}
                {this.state.overviewData && <View style={{flex: 1}}>
                    {(this.state.overviewData.playlists.data.length > 0) && (
                        <View>
                            <Text style={[styles.headerTitle, {color: this.state.theme.headlineColor}]}>Playlists</Text>
                            <View style={{paddingLeft: 8, paddingRight: 8}}>
                                <Playlist PlaylistData={this.state.overviewData.playlists.data} column={(this.state.layoutWidth > 1000) ? 5 : ((this.state.layoutWidth > 500) ? 4 : 2)} isProfile={true} theme={this.state.theme}/>
                            </View>
                        </View>
                    )}
                    {(this.state.overviewData.recent.data.length > 0) && (
                        <View>
                            <Text style={[styles.headerTitle, {color: this.state.theme.headlineColor}]}>Recent Listens</Text>
                            <Song SongData={this.state.overviewData.recent.data} layoutWidth={this.state.layoutWidth} theme={this.state.theme}/>
                        </View>
                    )}
                    {(this.state.offlineSongs.length > 0) && (
                        <View>
                            <TouchableOpacity
                                onPress={Actions.downloadedPage}
                                style={{
                                    flexDirection: 'row',
                                    justifyContent: 'space-between',
                                    alignItems: 'center',
                                    paddingRight: 16
                                }}
                            >
                                <Text style={[styles.headerTitle, {color: this.state.theme.headlineColor}]}>Downloaded Songs</Text>
                                <Text>See All</Text>
                            </TouchableOpacity>
                            <Song SongData={this.state.offlineSongs} layoutWidth={this.state.layoutWidth} theme={this.state.theme}/>
                        </View>
                    )}
                </View>
                }
            </View>
        )
    }
    renderPlaylists (){
        return (
            <ScrollView
                style={{flex: 1}}
                contentContainerStyle={{flexGrow: 1}}
            >
                {!this.state.playlistsData && <ActivityIndicator color={this.state.theme.indicatorColor} style={styles.activityIndicator} />}
                {this.state.playlistsData && <Playlist PlaylistData={this.state.playlistsData} column={(this.state.layoutWidth > 1000) ? 5 : ((this.state.layoutWidth > 500) ? 3 : 2)} isProfile={true} theme={this.state.theme}/>}
            </ScrollView>
        )
    }
    renderFollowers (){
        return (
            <ScrollView
                style={{flex: 1}}
                contentContainerStyle={{flexGrow: 1}}
            >
                {!this.state.followersData && <ActivityIndicator color={this.state.theme.indicatorColor} style={styles.activityIndicator} />}
                {this.state.followersData && <User UserData={this.state.followersData} horizontal={false} search={true} layoutWidth={this.state.layoutWidth} theme={this.state.theme}/>}
            </ScrollView>
        )
    }
    renderFollowing (){
        return (
            <ScrollView
                style={{flex: 1}}
                contentContainerStyle={{flexGrow: 1}}
            >
                {!this.state.followingData && <ActivityIndicator color={this.state.theme.indicatorColor} style={styles.activityIndicator} />}
                {this.state.followingData && <User UserData={this.state.followingData} horizontal={false} search={true} layoutWidth={this.state.layoutWidth} theme={this.state.theme}/>}
            </ScrollView>
        )
    }
    renderCollection (){
        return (
            <ScrollView
                style={{flex: 1}}
                contentContainerStyle={{flexGrow: 1}}
            >
                {!this.state.collectionData && <ActivityIndicator color={this.state.theme.indicatorColor} style={styles.activityIndicator} />}
                {this.state.collectionData && <Song SongData={this.state.collectionData} layoutWidth={this.state.layoutWidth} theme={this.state.theme}/>}
            </ScrollView>
        )
    }
    renderNewsFeed (){
        return (
            <ScrollView
                style={{flex: 1}}
                contentContainerStyle={{flexGrow: 1}}
            >
                {!this.state.feedData && <ActivityIndicator color={this.state.theme.indicatorColor} style={styles.activityIndicator} />}
                {this.state.feedData && <Activity ActivitiesData={this.state.feedData} layoutWidth={this.state.layoutWidth} theme={this.state.theme}/>}
            </ScrollView>
        )
    }
    onChangeTab(i, tab){
        if(tab === "collection" && this.state.collectionData === null) {
            this.fetchData('collection');
        } else if(tab === "feed" && this.state.feedData === null) {
            this.fetchData('feed');
        } else if(tab === "playlists" && this.state.playlistsData === null) {
            this.fetchData('playlists');
        } else if(tab === "followers" && this.state.followersData === null) {
            this.fetchData('followers');
        } else if(tab === "following" && this.state.followingData === null) {
            this.fetchData('following');
        }
    }
    renderPlayingBubble (){
        if(this.state.playing) return (
            <TouchableOpacity onPress={() => {Actions.nowPlaying({user: this.props.user})}} style={[styles.playingSign, {backgroundColor: this.state.theme.primaryBackgroundColor}]}>
                <Image style={{width: 15, height: 15}} source={this.props.display.darkMode ? require('../../../assets/images/white_playing_queue.gif') : require('../../../assets/images/black_playing_queue.gif')} />
            </TouchableOpacity>
        )
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
        return (
            <View style={{flex: 1}} onLayout={this.onLayoutScreen}>
                <NavHeader title={this.props.item.name} noBorder={true} isOwner={this.props.isOwner}/>
                <Tabs
                    prerenderingSiblingsNumber={3}
                    onChangeTab={({i, ref}) => {
                        this.onChangeTab(i, ref.props.tab);
                    }}
                    renderTabBar={() => <ScrollableTab
                        style={{
                            backgroundColor: this.state.theme.primaryBackgroundColor,
                            borderBottomColor: this.state.theme.tabBorderBottomColor,
                            height: 48,
                            justifyContent: 'center',
                            alignItems: 'center'
                        }}
                        renderTab={(name, page, active, onPress, onLayout) => (
                            <TouchableOpacity key={page}
                                              onPress={() => onPress(page)}
                                              onLayout={onLayout}
                                              activeOpacity={0.4}
                                              style={{
                                                  flex: 1,
                                                  justifyContent: 'center',
                                                  alignItems: 'center'
                                              }}
                            >

                                <TabHeading scrollable
                                            style={[styles.tabItem, {backgroundColor: this.state.theme.tabBackgroundColor}]}
                                            active={active}>
                                    <Animated.Text style={{
                                        fontWeight: "bold",
                                        color: this.state.theme.textPrimaryColor,
                                        fontSize: 13
                                    }}>
                                        {name}
                                    </Animated.Text>
                                </TabHeading>
                            </TouchableOpacity>
                        )}
                        underlineStyle={{backgroundColor: this.state.theme.tabUnderlineColor, height: 2}}
                    />}
                >

                    <Tab heading={i18n.t('overview')} tab={'overview'} style={{backgroundColor: this.state.theme.primaryBackgroundColor}}>
                        <View style={{flex: 1}} onLayout={this.onLayoutScreen}>
                            <View style={[styles.container, {backgroundColor: this.state.theme.primaryBackgroundColor}]} onLayout={this.onLayoutScreen}>
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
                                            {this.renderPlayingBubble()}
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
                                            imageStyle={{ borderRadius: 80}}
                                        >
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
                                        <View
                                            style={{
                                                flexDirection: 'row',
                                                justifyContent: 'center',
                                                alignItems: 'center',
                                                marginBottom: 16
                                            }}
                                        >
                                            {this.props.item.website_url &&
                                            <TouchableOpacity
                                                onPress={
                                                    () => {
                                                        this.redirectToThirdParty(this.props.item.website_url)
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
                                                    asset={require('../../../assets/icons/social/globe.svg')}
                                                />
                                            </TouchableOpacity>
                                            }
                                            {this.props.item.twitter_url &&
                                            <TouchableOpacity
                                                onPress={
                                                    () => {
                                                        this.redirectToThirdParty(this.props.item.twitter_url)
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
                                                    asset={require('../../../assets/icons/social/twitter.svg')}
                                                />
                                            </TouchableOpacity>
                                            }
                                            {this.props.item.facebook_url &&
                                            <TouchableOpacity
                                                onPress={
                                                    () => {
                                                        this.redirectToThirdParty(this.props.item.facebook_url)
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
                                                    asset={require('../../../assets/icons/social/facebook.svg')}
                                                />
                                            </TouchableOpacity>
                                            }
                                            {this.props.item.youtube_url &&
                                            <TouchableHighlight
                                                onPress={
                                                    () => {
                                                        this.redirectToThirdParty(this.props.item.youtube_url)
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
                                            </TouchableHighlight>
                                            }
                                            {this.props.item.instagram_url &&
                                            <TouchableHighlight
                                                onPress={
                                                    () => {
                                                        this.redirectToThirdParty(this.props.item.instagram_url)
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
                                            </TouchableHighlight>
                                            }
                                            {this.props.item.soundcloud_url &&
                                            <TouchableHighlight
                                                onPress={
                                                    () => {
                                                        this.redirectToThirdParty(this.props.item.soundcloud_url)
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
                                            </TouchableHighlight>
                                            }
                                        </View>
                                        <View style={{
                                            flexDirection: 'row',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            marginTop: 16
                                        }}>
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
                                                        width: 16,
                                                        height: 16
                                                    }}
                                                    fill={this.state.theme.primaryButton.textColor}
                                                    width={20}
                                                    height={20}
                                                    asset={require('../../../assets/icons/common/follow.svg')}
                                                />
                                                <Text
                                                    style={{
                                                        color: 'white',
                                                        fontWeight: '500',
                                                        fontSize: 16,
                                                        marginLeft: 4
                                                    }}
                                                >Follow</Text>
                                            </TouchableOpacity>
                                            <TouchableOpacity
                                                onPress={ () => Actions.contextMenu({kind: 'user', item: this.props.item, owner: this.props.isOwner}) }
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
                                        <View
                                            style={{
                                                flexDirection: 'row',
                                                marginTop: 24
                                            }}
                                        >
                                            <View style={styles.artistInfoContainer}>
                                                <Text style={[styles.infoPrimaryText, {color: this.state.theme.textPrimaryColor}]}>{this.props.item.collection_count}</Text>
                                                <Text style={[styles.infoSecondaryText, {color: this.state.theme.textSecondaryColor}]}>Songs</Text>
                                            </View>
                                            <View style={styles.artistInfoContainer}>
                                                <Text style={[styles.infoPrimaryText, {color: this.state.theme.textPrimaryColor}]}>{this.props.item.favorite_count}</Text>
                                                <Text style={[styles.infoSecondaryText, {color: this.state.theme.textSecondaryColor}]}>Favorites</Text>
                                            </View>
                                            <View style={styles.artistInfoContainer}>
                                                <Text style={[styles.infoPrimaryText, {color: this.state.theme.textPrimaryColor}]}>{this.props.item.playlist_count}</Text>
                                                <Text style={[styles.infoSecondaryText, {color: this.state.theme.textSecondaryColor}]}>Playlists</Text>
                                            </View>
                                            <View style={styles.artistInfoContainer}>
                                                <Text style={[styles.infoPrimaryText, {color: this.state.theme.textPrimaryColor}]}>{this.props.item.follower_count}</Text>
                                                <Text style={[styles.infoSecondaryText, {color: this.state.theme.textSecondaryColor}]}>Followers</Text>
                                            </View>
                                        </View>
                                        {this.props.isOwner && this.props.item.should_subscribe &&
                                            <SubscribeTip/>
                                        }
                                    </View>
                                    {this.props.item.bio !== null && <Text
                                        style={{
                                            color: this.state.theme.textSecondaryColor,
                                            textAlign: 'center',
                                            marginTop: 16,
                                            marginLeft: 32,
                                            marginRight: 32
                                        }}
                                    >{this.props.item.bio}</Text>}
                                    {this.renderOverview()}
                                </Animated.ScrollView>
                            </View>
                        </View>
                        {this.renderMarginBottom()}
                    </Tab>
                    <Tab heading={i18n.t('news_feed')} tab={'feed'} style={{backgroundColor: this.state.theme.primaryBackgroundColor}}>
                        {this.renderNewsFeed()}
                    </Tab>
                    <Tab heading={i18n.t('collection')} tab={'collection'} style={{backgroundColor: this.state.theme.primaryBackgroundColor}}>
                        {this.renderCollection()}
                    </Tab>
                    <Tab heading={i18n.t('playlists')} tab={'playlists'} style={{padding: 4, backgroundColor: this.state.theme.primaryBackgroundColor}}>
                        {this.renderPlaylists()}
                    </Tab>
                    <Tab heading={i18n.t('followers')} tab={'followers'} style={{backgroundColor: this.state.theme.primaryBackgroundColor}}>
                        {this.renderFollowers()}
                    </Tab>
                    <Tab heading={i18n.t('following')} tab={'following'} style={{backgroundColor: this.state.theme.primaryBackgroundColor}}>
                        {this.renderFollowing()}
                    </Tab>
                </Tabs>
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
    headerTitle: {
        fontWeight: 'bold',
        fontSize: 17,
        paddingLeft: 16,
        marginTop: 20,
        marginBottom: 20,
        textAlign: 'left'
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
    },
    playingSign: {
        position: 'absolute',
        top: 34,
        right: -16,
        width: 32,
        height: 32,
        borderRadius: 16,
        alignItems: 'center',
        justifyContent: 'center',
    },
    onlineCircle: {
        position: 'absolute',
        width: 14,
        height: 14,
        borderRadius: 7,
        top: 24,
        right: 10,
        justifyContent: 'center',
        alignItems: 'center'
    },
    onlineLight: {
        width: 10,
        height: 10,
        borderRadius: 6,
        backgroundColor: '#4eb435'
    },
    offlineCircle: {
        position: 'absolute',
        width: 22,
        height: 14,
        borderRadius: 7,
        top: 24,
        right: 5,
        justifyContent: 'center',
        alignItems: 'center'
    },
    offlineTime: {
        width: 18,
        height: 10,
        borderRadius: 5,
        backgroundColor: '#c7eebc',
        justifyContent: 'center',
        alignItems: 'center'
    },
    offlineText: {
        fontSize: 7,
        color: '#000'
    },
    notifCount: {
        position: 'absolute',
        top: -5,
        right: -5,
        width: 16,
        height: 16,
        borderRadius: 8,
        justifyContent: 'center',
        alignItems: 'center'
    },
    notifText: {
        fontSize: 9,
        alignItems: 'center',
    },
    userInfo: {position: 'absolute', top: 70, width:'100%', alignItems: 'center', justifyContent: 'center'},
    userInfoArtwork: {width: 100, height: 100,  marginBottom: 16, marginTop: 16},
    userInfoText: {
        fontSize: 13, textAlign: 'center', fontWeight: 'bold'
    },
    activityIndicator: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center'
    },
});


export default connect(({routes, scroll, language, display, player, auth}) => ({routes, scroll, language, display, player, auth}))(UserParallax);
