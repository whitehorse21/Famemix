import React, {Component} from 'react';
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    Image,
    ActivityIndicator,
    Platform,
    Dimensions,
    StatusBar,
    FlatList,
    Easing,
    Share,
    ScrollView,
    ImageBackground,
    Animated as RNAnimated
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

import i18n from 'i18n-js';
import * as Languages from '../../helpers/Lang';
import { Actions } from 'react-native-router-flux';
import TrackPlayer from "react-native-track-player";
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
//import {AdMobBanner} from "react-native-admob";
import LinearGradient from 'react-native-linear-gradient';
import {connect} from "react-redux";
import {ifIphoneX, isIphoneX} from '../../helpers/ifIphoneX';
import HackedTabs from "../common/HackedTabs";
const GLOBAL = require("../../../config/Global");
import Slider from "react-native-slider";
import Carousel from 'react-native-snap-carousel';
import Station from "../../models/Station";
import {store} from '../../../store/configureStore';
import {playerToggleShow} from '../../../store/Constants';
import {toggleLockUp, toggleLockDown} from '../../../reducers/player';
import {doFavorite, changeStatusBarStyle, msgShow, writeUserQueue, clearUserQueue} from "../../helpers/Functions";
import Interactable from '../../../app/helpers/Interactable';
import Animated from 'react-native-reanimated';
import API from "../../helpers/Axios";
import {WithLocalSvg} from 'react-native-svg';
import FastImage from "react-native-fast-image";
import QueueRow from "./QueueRow";
import {decode} from "html-entities";
import ytdl from "react-native-ytdl"
import Banner from '../admob/Banner';

const window = Dimensions.get('window');
const IMAGE_HEIGHT = Platform.OS === 'ios' ? 544 : 552;
const HEADER_HEIGHT = 80;
const SCROLL_HEIGHT = IMAGE_HEIGHT - HEADER_HEIGHT;
const THEME_COLOR = "#fff";
const ANIMATION_DURATION = 250;
const ROW_HEIGHT = 60;


const Screen = {
    width: Dimensions.get('window').width,
    height: Dimensions.get('window').height - 75,
};

const onPlaybackState = (args: any) => {
    let message;

    switch (args.state) {
        case TrackPlayer.STATE_BUFFERING: message = 'STATE_BUFFERING'; break;
        case TrackPlayer.STATE_NONE: message = 'STATE_NONE'; break;
        case TrackPlayer.STATE_PAUSED: message = 'STATE_PAUSED'; break;
        case TrackPlayer.STATE_PLAYING: message = 'STATE_PLAYING'; break;
        case TrackPlayer.STATE_READY: message = 'STATE_READY'; TrackPlayer.play(); break;
        case TrackPlayer.STATE_STOPPED: message = 'STATE_STOPPED'; break;
        default: message = `unknow state const ${args.state}`; break;
    }

    console.warn('playback-state', message);
}

class EnginePlayer extends Component {
    onLayoutScreen = (e) => {
        let width = e.nativeEvent.layout.width;
        if (width !== this.state.layoutWidth) {
            this.setState({
                layoutWidth: width,
                layoutHeight: window.height
            });
        }
    };
    nScroll = new RNAnimated.Value(0);
    scroll = new RNAnimated.Value(0);
    stickHeaderOpacity = this.nScroll.interpolate({
        inputRange: [0, SCROLL_HEIGHT],
        outputRange: [-6, 1],
    });
    tabBg = this.scroll.interpolate({
        inputRange: [0, SCROLL_HEIGHT],
        outputRange: ["white", THEME_COLOR],
        extrapolate: "clamp"
    });
    tabY = this.nScroll.interpolate({
        inputRange: [0, SCROLL_HEIGHT, SCROLL_HEIGHT + 1],
        outputRange: [0, 0, 1]
    });
    imgScale = this.nScroll.interpolate({
        inputRange: [-25, 0],
        outputRange: [1.1, 1],
        extrapolateRight: "clamp"
    });

    constructor(props){
        super(props);
        this.nScroll.addListener(RNAnimated.event([{value: this.scroll}], {useNativeDriver: false}));
        this.state = {
            currentLanguage: this.props.language.code,
            height: Dimensions.get('screen').height,
            layoutWidth: window.width,
            window: window,
            playing: true,
            currentTime: 0,
            songDuration: 0,
            currentBuffered: 0,
            queueList: [],
            spinValue: new RNAnimated.Value(0),
            radio: false,
            userStation: false,
            fav: false,
            user: null,
            loading: true,
            showAd: false,
            status: null,
            theme: this.props.display.darkMode ? GLOBAL.themes.dark : GLOBAL.themes.light,
            playerVisible: false,
            getColor: false,
            songPlaying: {
                artists: []
            },
            panelVisible: false,
            similarStations: [],
            showPlayer: false,
            showUpByTouch: false,
            repeat: 0,
            shuffle: false,
            bottomNavBarH: StatusBar.currentHeight > 24 ? (Dimensions.get('screen').height - Dimensions.get('window').height - StatusBar.currentHeight) : (Dimensions.get('screen').height - Dimensions.get('window').height),
            internet: this.props.internet.online,
            isMediaAdShowing: false,
        };
        Dimensions.addEventListener('change', () => {
            try {
                this.setState({
                    window: Dimensions.get('window'),
                    height: Dimensions.get('screen').height,
                    bottomNavBarH: StatusBar.currentHeight > 24 ? (Dimensions.get('screen').height - Dimensions.get('window').height - StatusBar.currentHeight) : (Dimensions.get('screen').height - Dimensions.get('window').height)
                });
                if(this.props.player.show && this.props.player.full) {
                    setTimeout(()=> {
                        this.slideUp()
                    }, 500)
                } else {
                    setTimeout(()=> {
                        this.slideDown()
                    }, 500)
                }
            } catch (e) {
                console.log(e);
            }
        });

        this._deltaY = new Animated.Value(window.height);
        this._deltaX = new Animated.Value(0);
        this._lockPlayer = false;
        this._onScroll = this._onScroll.bind(this);
    }
    _onScroll (event) {
        const scrollPosition = event && event.nativeEvent && event.nativeEvent.contentOffset && event.nativeEvent.contentOffset.y;
        if(scrollPosition < -100) {
            this._isMounted && this._isMounted && this.refs['headInstance'].snapTo({index: 1});
        }
    }
    onChangeLanguage = (language) => {
        this.setState({ currentLanguage: language });
    };
    async componentWillReceiveProps(nextProps, nextContent): void {
        if(this._isMounted) {
            if (this.props.player.full !== nextProps.player.full) {
                if (nextProps.player.full) {
                    !nextProps.player.lock && this.slideUp();
                } else {
                    !nextProps.player.lock && nextProps.player.show && this.slideDown();
                }
            }

            if (this.props.player.show !== nextProps.player.show) {
                if (nextProps.player.show && !nextProps.player.full) {
                    this.refs['headInstance'].snapTo({index: 1});
                }
            }

            if (this.props.player.queue !== nextProps.player.queue) {
                this.onQueueChange();
            }

            if (this.props.display.darkMode !== nextProps.display.darkMode) {
                nextProps.display.darkMode ? this.setState({theme: GLOBAL.themes.dark}) : this.setState({theme: GLOBAL.themes.light})
            }

            if (this.props.language.code !== nextProps.language.code) {
                this.onChangeLanguage(nextProps.language.code)
            }

            if (this.props.internet.online !== nextProps.internet.online) {
                this.setState({ internet: nextProps.internet.online });
            }

            if(this.props.ad.showing !== nextProps.ad.showing) {
                this.setState({isMediaAdShowing: nextProps.ad.showing})
            }

            if(this.props.ad.frequency !== nextProps.ad.frequency) {
                this.mediaAd();
            }
        }
    }
    _isMounted = false;
    componentWillUnmount() {
        this._isMounted = false;
        this._onTrackChanged.remove();
        this._onStateChanged.remove();
    }
    async componentDidMount(): void {
        this._isMounted = true;
        this.getPlayerReady();
        //this.getPrevSession();
        //Start with empty queue
        AsyncStorage.setItem('QueueList', '[]');
    }
    mediaAd() {
        if(GLOBAL.ENABLE_MEDIA_AD !== undefined && GLOBAL.ENABLE_MEDIA_AD === true && this.props.role.ad_frequency !== 0) {
            if(this.props.ad.frequency % this.props.role.ad_frequency === 0) {
                this.slideDown();
                setTimeout(() => {
                    Actions.adModal({
                        adType: 'media'
                    });
                }, 1000);
            }
        }
    }
    async getPrevSession() {
        let currentTrackId = await TrackPlayer.getCurrentTrack();
        if(currentTrackId) {
            alert("still playing");
        }
    }
    async slideUp(): void {
        this._isMounted && this.setState({panelVisible: true, showPlayer: true, showUpByTouch: true});
        this._isMounted && this.refs['headInstance'].snapTo({index: 0});
    }
    async slideDown(): void{
        this._isMounted && this.setState({panelVisible: false, showUpByTouch: false});
        this._isMounted && this.refs['headInstance'].snapTo({index: 1});
    }
    async getPlayerReady(){
        TrackPlayer.setupPlayer({
            waitForBuffer: true
        }).then(async () => {
            TrackPlayer.updateOptions({
                stopWithApp: true,
                capabilities: [
                    TrackPlayer.CAPABILITY_PLAY,
                    TrackPlayer.CAPABILITY_PAUSE,
                    //TrackPlayer.CAPABILITY_JUMP_FORWARD,
                    //TrackPlayer.CAPABILITY_JUMP_BACKWARD,
                    //TrackPlayer.CAPABILITY_STOP,
                    TrackPlayer.CAPABILITY_SEEK_TO,
                    TrackPlayer.CAPABILITY_SKIP_TO_NEXT,
                    TrackPlayer.CAPABILITY_SKIP_TO_PREVIOUS
                ],
                compactCapabilities: [
                    TrackPlayer.CAPABILITY_PLAY,
                    TrackPlayer.CAPABILITY_PAUSE
                ],
                jumpInterval: 15
            });
        });

        TrackPlayer.registerPlaybackService(() => {
            return async() => {
                TrackPlayer.addEventListener('remote-play', () => {
                    TrackPlayer.play()
                });

                TrackPlayer.addEventListener('remote-pause', () => {
                    TrackPlayer.pause()
                });

                TrackPlayer.addEventListener('remote-next', () => {
                    this.goForward();
                });

                TrackPlayer.addEventListener('remote-previous', () => {
                    this.goBackward();
                });

                TrackPlayer.addEventListener('remote-seek', async (event) => {
                    TrackPlayer.seekTo(event.position);
                });

                TrackPlayer.addEventListener("remote-jump-forward",  async (event) => {
                    let position = await TrackPlayer.getPosition();
                    let newPosition = position + event.interval;
                    await TrackPlayer.seekTo(newPosition);
                });

                TrackPlayer.addEventListener("remote-jump-backward",  async (event) => {
                    let position = await TrackPlayer.getPosition();
                    let newPosition = position > 9 ? position - event.interval : 0;
                    await TrackPlayer.seekTo(newPosition);
                });

                TrackPlayer.addEventListener('remote-stop', () => {
                    TrackPlayer.destroy()
                });

                TrackPlayer.addEventListener('playback-state', onPlaybackState);

                TrackPlayer.addEventListener('playback-queue-ended', () => {
                    if(! this._lockPlayer) {
                        this.onPlayBackEnd();
                    }
                });

                TrackPlayer.addEventListener('playback-error', function () {

                });
            }
        });
        this._onTrackChanged = TrackPlayer.addEventListener('playback-track-changed',(data) => {
            this.onPlayBackTrackChanged(data);
        });
        this._onStateChanged = TrackPlayer.addEventListener('playback-state', (data) => {
            this.setState({status: data.state});
            if(data.state === 'playing' || data.state === 3) {
                this.runAnimation();
                this.getPlayingTime();
            } else {
                this.stopAnimation();
                clearInterval(this.interval);
            }
        });
    }
    getPlayingTime(){
        this.interval = setInterval(async () => {
            let Position = await TrackPlayer.getPosition();
            let Duration = await TrackPlayer.getDuration();
            let Buffered = await TrackPlayer.getBufferedPosition();
            this.setState({currentTime: Math.floor(Position), songDuration: Math.floor(Duration), currentBuffered: Math.floor(Buffered)});
        }, 1000);
    }
    onPlayBackEnd() {
        if(this.state.repeat === 1) {
            TrackPlayer.pause();
            setTimeout(() => {
                TrackPlayer.seekTo( 0 ).then(() => TrackPlayer.play());
            }, 200)
        } else if(this.state.repeat === 2) {
            this.playerStart(this.state.queueList[0]);
        } else {
            this.goForward();
        }
    }
    onPlayBackTrackChanged(data): void {
        setTimeout(async () => {
            let currentTrackId = await TrackPlayer.getCurrentTrack();
            if(currentTrackId) {
                let QueueList = this.state.queueList;
                let index = QueueList.findIndex(x => x.id === parseInt(currentTrackId));
                let track = QueueList[index];
                if(track && (track.id !== this.state.songPlaying.id)) {
                    this.updateCurrentTrack( track );
                    this.state.userStation && this.refs.carousel.snapToItem (index, true, true);
                }
                if(this.props.auth.isLogged && ! this.state.radio) {
                    let songIds = [];
                    let num = QueueList.length;
                    for(let i = 0;i < num; i ++){
                        let songId = QueueList[i].id;
                        songIds.push(songId);
                    }
                    writeUserQueue(this.props.auth.user.username, currentTrackId, songIds)
                }
                if(this.state.radio) {
                    clearUserQueue(this.props.auth.user.username);
                }

            }
        }, 200);
        setTimeout(() => {
            API.post('stream/onTrackPlayed/' + this.state.songPlaying.id, data)
                .then(res => {
                });
        }, 5000)
    }
    runAnimation() {
        this.state.spinValue.setValue(0);
        RNAnimated.timing(this.state.spinValue, {
                toValue: 1,
                duration: 30000,
                easing: Easing.linear,
                useNativeDriver: true,
            }
        ).start((done) => {
            if (done.finished) {
                this.runAnimation()
            }
        });
    }
    stopAnimation() {
        RNAnimated.timing(
            this.state.spinValue
        ).stop();
    }
    queueBuild(SongToPlay, CurrentQueue, QueueList, songsCount){
        if (SongToPlay.length > 0) {
            for (let i = 0; i < songsCount; i++) {
                if(!this.hasId(QueueList, SongToPlay[i].id)) {
                    CurrentQueue.push(SongToPlay[i]);
                    QueueList.push(SongToPlay[i]);
                }
            }
            this.playerStart(CurrentQueue[0]);
            AsyncStorage.setItem('QueueList', JSON.stringify(QueueList));
        }
    }
    async playerStart(song) {
        this._lockPlayer = true;
        await TrackPlayer.reset();

        setTimeout(async() => {
            await TrackPlayer.add({
                id: song.id.toString(),
                url: parseInt(song.downloaded) ? 'file://' + song.stream_url : song.stream_url,
                title: decode(song.title),
                artist: song.artists.constructor === Array && song.artists.map(function (artist) {
                    return decode(artist.name)
                }).join(", "),
                artwork: song.artwork_url,
                //duration: song.duration,
                type: parseInt(song.downloaded) ? 'default' : (parseInt(song.hls) ? 'hls' : 'default')
            });
            await TrackPlayer.play();
        }, 300)

        setTimeout(() => {
            store.dispatch({type: 'INCREASE_FREQUENCY'});
        }, 1000);

        setTimeout(() => {
            this._lockPlayer = false;
        }, 5000);

        /*
        const youtubeURL = 'http://www.youtube.com/watch?v=W3Zj8e7GNSs';
        const urls = await ytdl(youtubeURL, { quality: 'highestaudio' });
        const playingUrl = urls[0].url;
        if(playingUrl !== undefined) {
            await TrackPlayer.add({
                id: song.id.toString(),
                url: playingUrl,
                title: song.title,
                artist: song.artists.constructor === Array && song.artists.map(function (artist) {
                    return artist.name
                }).join(", "),
                artwork: song.artwork_url,
                //duration: song.duration,
                type: 'default'
            });
            await TrackPlayer.play();
        }
        */
    }

    async playerBuild(SongToPlay, PlayerAction): void{
        if(PlayerAction.action === 0 || PlayerAction.action === 1 || PlayerAction.action === 2) {
            //Add song to queue then play
            let QueueList;
            let CurrentQueue;
            let songsCount;
            if(this.state.radio || this.state.userStation){
                QueueList = [];
                CurrentQueue = [];
                songsCount = SongToPlay.length;
            } else {
                QueueList = await AsyncStorage.getItem('QueueList');
                if(! QueueList) QueueList = [];
                else QueueList = JSON.parse(QueueList);
                CurrentQueue = [];
                songsCount = SongToPlay.length;
            }
            if(PlayerAction.action === 0){
                this.queueBuild(SongToPlay, CurrentQueue, QueueList, songsCount);
                this.setState({currentTime: 0, songDuration: 0, userStation: false, radio: false});
                this.updateCurrentTrack(SongToPlay[0]);
                setTimeout(() => {
                    this.setState({queueList: QueueList});
                }, 300);
            } else if(PlayerAction.action === 1) {
                //add to queue at next position by current playing song
                if(SongToPlay.length === 1 && this.state.songPlaying.id === SongToPlay[0].id){
                    msgShow('success', 'Song is currently playing')
                } else {
                    if (SongToPlay.length > 0) {
                        let songsToAdd = [];
                        for (let i = 0; i < songsCount; i++) {
                            //if song not in queue yet, then add by the next of playing song
                            if(!this.hasId(QueueList, SongToPlay[i].id)) {
                                CurrentQueue.push(SongToPlay[i]);
                                songsToAdd.push(SongToPlay[i]);
                            } else {
                                //if song already in queue then remove then, after that add it by the next of playing song
                                //remove from render queue
                                QueueList = QueueList.filter(x => {
                                    return x.id !== SongToPlay[i].id;
                                });
                                //add to render queue again
                                songsToAdd.push(SongToPlay[i]);
                                CurrentQueue.push(SongToPlay[i]);
                            }
                        }
                        //find playing position
                        let index = QueueList.findIndex(x => x.id === this.state.songPlaying.id);
                        QueueList.splice((index+1), 0, ...songsToAdd);
                        this.setState({queueList: QueueList, userStation: false, radio: false});
                        AsyncStorage.setItem('QueueList', JSON.stringify(QueueList));
                        msgShow('success', "Added " + CurrentQueue.length + ' in to queue');
                    }
                }
            } else if(PlayerAction.action === 2) {
                this.queueBuild(SongToPlay, CurrentQueue, QueueList, songsCount);
                this.setState({currentTime: 0, songDuration: 0, queueList: QueueList, userStation: false, radio: false});
                msgShow('success', "Added " + SongToPlay.length + ' in to queue');
            }
        } else if(PlayerAction.action === 3) {
            let QueueList = [];
            let CurrentQueue = [];
            let songsCount = SongToPlay.length;
            this.queueBuild(SongToPlay, CurrentQueue, QueueList, songsCount);
            this.setState({currentTime: 0, songDuration: 0, userStation: false, radio: false});
            this.updateCurrentTrack(SongToPlay[0]);
            setTimeout(() => {
                this.setState({queueList: QueueList});
            }, 300);
        } else if(PlayerAction.action === 4) {
            let QueueList = [];
            let CurrentQueue = [];
            let songsCount = SongToPlay.length;
            this.queueBuild(SongToPlay, CurrentQueue, QueueList, songsCount);
            this.setState({currentTime: 0, songDuration: 0, radio: false, userStation: true});
            this.updateCurrentTrack(SongToPlay[0]);
            setTimeout(() => {
                this.setState({queueList: QueueList});
            }, 300);
        } else if(PlayerAction.action === 6) {
            let QueueList = [];
            let CurrentQueue = [];
            let songsCount = SongToPlay.length;
            SongToPlay[0].artists = [{name: 'Radio Station'}];
            this.queueBuild(SongToPlay, CurrentQueue, QueueList, songsCount);
            this.setState({currentTime: 0, songDuration: 0, radio: true, userStation: false});
            this.updateCurrentTrack(SongToPlay[0]);
            setTimeout(() => {
                this.getSimilarStations();
            }, 300);
        }
    }
    async onQueueChange(): void {
        let SongToPlay = JSON.parse(await AsyncStorage.getItem('SongToPlay'));
        let PlayerAction = JSON.parse(await AsyncStorage.getItem('PlayerAction'));
        //0 is add to queue and play, 2 is add to queue, 3 is clean player and shuffle, 4 start artist station, 5 start user station, 6 is start radio station
        if(SongToPlay &&  SongToPlay.length) {
            AsyncStorage.setItem('SongToPlay', '[]');
            //If player not show up yet and there are song in queue, then show player
            if( ! this.state.playerVisible && ! this.state.queueList.length ) {
                this.setState({playerVisible: true});
            }
            this.playerBuild(SongToPlay, PlayerAction);
        }
    }
    hasId(data, id) {
        return data.some(function (el) {
            return el.id === id;
        });
    }
    async updateCurrentTrack(track): void {
        this.setState({
            currentTime: 0, songDuration: 0, songPlaying: track, getColor: true, fav: parseInt(track.favorite) === 1
        });
    }
    async togglePlay(){
        try {
            if(this.state.status === 'paused' || this.state.status === 2) {
                TrackPlayer.play();
            } else if(this.state.status === 'playing' || this.state.status === 3) {
                TrackPlayer.pause();
            } else {
                TrackPlayer.play();
            }
        } catch (error) {
            alert("There is a problem with player!");
        }
    }
    toggleRepeat(){
        this.setState({ repeat: this.state.repeat === 0 ? 1 : (this.state.repeat === 1 ? 2 : 0) });
    }

    toggleShuffle(){
        this.setState({ shuffle: !this.state.shuffle });
    }
    SkipTo(song){
        this.playerStart(song);
    }
    async goBackward(){
        let currentTrackId = await TrackPlayer.getCurrentTrack();
        if(currentTrackId) {
            let QueueList = this.state.queueList;
            let index = QueueList.findIndex(x => x.id === parseInt(currentTrackId));
            if(typeof QueueList[index-1] === 'undefined') {
                alert('There no song to prev')
            } else {
                this.playerStart(QueueList[index-1]);
            }
        }
    }
    async goForward(){
        let QueueList = this.state.queueList;
        if(this.state.shuffle){
            let maxIndex = QueueList.length - 1;
            let randomSongIndex =  Math.floor(Math.random() * (maxIndex + 1));
            this.playerStart(QueueList[randomSongIndex]);
        } else {
            let currentTrackId = await TrackPlayer.getCurrentTrack();
            if(currentTrackId) {
                let QueueList = this.state.queueList;
                let index = QueueList.findIndex(x => x.id === parseInt(currentTrackId));
                if(typeof QueueList[index+1] === 'undefined') {
                    alert('There is no song to next')
                } else {
                    this.playerStart(QueueList[index+1]);
                }
            }
        }
    }
    scrollToIndex(index) {
        this.flatListRef.scrollToIndex({animated: true, index: index});
    }
    emptyQueue () {
        store.dispatch(playerToggleShow());
        AsyncStorage.setItem('QueueList','[]');
        TrackPlayer.reset();
        this.setState({queueList: []});
        setTimeout(() => {
            this.refs['headInstance'].snapTo({index: 2});
        }, 200);
    }
    onSlidingStart(){
    }

    onSlidingChange(value){
    }
    onSlidingComplete(value){
        let newPosition = value * this.state.songDuration;
        TrackPlayer.seekTo( newPosition );
        setTimeout(() => {
            TrackPlayer.play();
        }, 1000);
        this.setState({ currentTime: newPosition });
    }
    shareButton(){
        let songPlaying = this.state.songPlaying;
        let item = this.state.queueList.find(function (obj) { return obj.id === songPlaying.id; });
        Share.share({
            message: `Listen to ${decode(item.title)} by ${item.artists.map(function (artist) {return decode(artist.name)}).join(", ")}`,
            url: item.permalink_url,
            title: decode(item.title)
        }, {
            // Android only:
            dialogTitle: `Listen to ${decode(item.title)} by ${item.artists.map(function (artist) {return decode(artist.name)}).join(", ")}`,
            // iOS only:
            excludedActivityTypes: [
                'com.apple.UIKit.activity.PostToTwitter'
            ]
        })
    }
    shareRadioButton(){
        let songPlaying = this.state.songPlaying;
        Share.share({

            message: 'Listen to the radio ' + decode(songPlaying.title),
            url: songPlaying.share_url,
            title: decode(songPlaying.title)
        }, {
            // Android only:
            dialogTitle: 'Listen to the radio ' + decode(songPlaying.title),
            // iOS only:
            excludedActivityTypes: [
                'com.apple.UIKit.activity.PostToTwitter'
            ]
        })
    }
    removeFromQueue = async(id) => {
        let queueList = this.state.queueList;
        let index = queueList.findIndex(x => x.id === parseInt(id));

        let currentTrackId = await TrackPlayer.getCurrentTrack();
        if(currentTrackId && parseInt(currentTrackId) === parseInt(id)) {
            if(this.state.queueList.length === 1) {
                this.emptyQueue()
            } else {
                this.goForward()
            }
        }

        queueList.splice(index, 1);
        setTimeout(()=> {
            this.setState({queueList: queueList});
        }, 200);
    }
    keyExtractor = (item, index) => index.toString();
    renderQueue() {
        if(this.state.queueList.length) return (
            <FlatList
                ref={(ref) => { this.flatListRef = ref; }}
                data={this.state.queueList}
                keyExtractor={this.keyExtractor}
                songPlaying={this.state.songPlaying}
                renderItem={({ item, index }) => (
                    <QueueRow
                        item={item}
                        index={index}
                        onPlaySong={() => this.SkipTo(item)}
                        onRemove={() => this.removeFromQueue(item.id)}
                        theme={this.state.theme}
                        songPlaying={this.state.songPlaying}
                    />
                )}
            />
        );
    }
    getSimilarStations(){
        /** TODO
         * get similar stations, update state similarStations
         */
    }
    renderSimilarStations(){
        if(this.state.similarStations.length) {
            return (
                <ScrollView horizontal={true} showsHorizontalScrollIndicator={false} style={{flex: 1, width: '100%'}}>
                    <Station stationData={this.state.similarStations} horizontal={true} theme={this.state.theme}/>
                </ScrollView>
            )
        }
    }
    renderMiniPlayerSlider(){
        if(this.state.playerVisible && !this.state.radio) return (
            <View style={{ position: 'absolute', top: -0.5, left: 0, right: 0, height: 2, backgroundColor: this.state.theme.miniPlayer.timeProcess.processedColor, width: this.state.songDuration !== 0 ? (this.state.currentTime * 100 / this.state.songDuration) + '%' : 0}}/>
        )
    }
    renderCarouselItem ({item}) {
        return (
            <FastImage
                style={ {width: '100%', aspectRatio: 1, borderRadius: 6}}
                source={{
                    uri: item.artwork_url,
                    priority: FastImage.priority.normal,
                }}
                resizeMode={FastImage.resizeMode.contain}
            />
        )
    }
    onCarouselSnapToItem(slideIndex){
        this.SkipTo(this.state.queueList[slideIndex]);
    }
    async toggleFav(): void {
        let user = JSON.parse(await AsyncStorage.getItem('user'));
        if(user && user.id != null) {
            if(this.state.fav === true){
                this.setState({fav: false});
                doFavorite('song', this.state.songPlaying.id, false);
            } else {
                this.setState({fav: true});
                doFavorite('song', this.state.songPlaying.id, true);
            }

        } else {
            Actions.loginModal();
        }
    }
    async onSaveButtonPress() {
        if(this.props.auth.isLogged) {
            Actions.addToPlaylistModal({row: {id: 100, title: i18n.t('queue')}, mediaType: 'queue'});
        } else {
            Actions.loginModal();
        }
    }
    async onStopInteraction(event) {
        const pos = event.nativeEvent.y;
        if(pos < 0) {
            Platform.OS === 'android'  && StatusBar.setBackgroundColor(GLOBAL.themes.light.androidStatusBarTranslucentColor);
            this.props.display.darkMode ?  StatusBar.setBarStyle('light-content', false) : StatusBar.setBarStyle('dark-content', false);
            if(!this.state.showUpByTouch) {
                //alert("keo len ma deo noi j"); chuyen trang thai thanh xuong o day
                store.dispatch(toggleLockUp());
                this.setState({showUpByTouch: true});
            }
        } else {
            changeStatusBarStyle();
            if(this.state.showUpByTouch) {
                //alert("keo xuong ma deo noi j"); chuyen trang thai thanh xuong o day
                store.dispatch(toggleLockDown());
                this.setState({showUpByTouch: false});
            }
        }
    }
    render() {
        i18n.locale = this.state.currentLanguage;
        i18n.fallbacks = true;
        i18n.translations = Languages;

        let songPercentage;
        if( this.state.songDuration !== undefined && this.state.songDuration !== 0 ){
            songPercentage = this.state.currentTime / this.state.songDuration;
        } else {
            songPercentage = 0;
        }
        let playButton;
        if( this.state.status === "playing" || this.state.status === 3){
            playButton = (<TouchableOpacity
                onPress={ this.togglePlay.bind(this) }
                style={ styles.play }
            >
                <WithLocalSvg
                    fill={this.state.theme.buttonColor}
                    width={50}
                    height={50}
                    asset={require('../../../assets/icons/player/pause.svg')}
                />
            </TouchableOpacity>);
        } else if( this.state.status === "loading" || this.state.status === 6 ) {
            playButton = <View style={ [{height: 50, width: 50, justifyContent: 'center', alignItems: 'center'}] }><ActivityIndicator size="large" color={this.state.theme.buttonColor} /></View>;
        } else {
            playButton = (<TouchableOpacity
                onPress={ this.togglePlay.bind(this) }
            >
                <WithLocalSvg
                    fill={this.state.theme.buttonColor}
                    width={50}
                    height={50}
                    asset={require('../../../assets/icons/player/play.svg')}
                />
            </TouchableOpacity>);
        }

        let forwardButton;
        forwardButton = (<TouchableOpacity
            onPress={() => {
                this.goForward()
            }}
            style={ styles.forward }
        >
            <WithLocalSvg
                fill={this.state.theme.player.buttonColor}
                width={20}
                height={20}
                asset={require('../../../assets/icons/player/next.svg')}
            />
        </TouchableOpacity>);

        let prevButton
        prevButton = (<TouchableOpacity
            onPress={ () => {
                this.goBackward()
            }}
            style={ styles.back }
        >
            <WithLocalSvg
                fill={this.state.theme.player.buttonColor}
                width={20}
                height={20}
                asset={require('../../../assets/icons/player/prev.svg')}
            />
        </TouchableOpacity>);;

        let repeatButton;
        if( this.state.repeat === 1){
            repeatButton = (<TouchableOpacity
                onPress={ this.toggleRepeat.bind(this) }
                style={ styles.repeat }
            >
                <WithLocalSvg
                    fill={this.state.theme.player.actionsActiveIconColor}
                    width={18}
                    height={18}
                    asset={require('../../../assets/icons/player/repeat-one.svg')}
                />
            </TouchableOpacity>);
        } else  if( this.state.repeat === 2) {
            repeatButton = (<TouchableOpacity
                    onPress={ this.toggleRepeat.bind(this) }
                    style={ styles.repeat }
                >
                    <WithLocalSvg
                        fill={this.state.theme.player.actionsActiveIconColor}
                        width={18}
                        height={18}
                        asset={require('../../../assets/icons/player/repeat.svg')}
                    />
                </TouchableOpacity>);
        } else {
            repeatButton = (<TouchableOpacity
                onPress={ this.toggleRepeat.bind(this) }
                style={ styles.repeat }
            >
                <WithLocalSvg
                    fill={this.state.theme.player.actionsInactiveIconColor}
                    width={18}
                    height={18}
                    asset={require('../../../assets/icons/player/repeat.svg')}
                />
            </TouchableOpacity>);
        }

        let shuffleButton;
        if( this.state.shuffle ){
            shuffleButton = (<TouchableOpacity
                    onPress={ this.toggleShuffle.bind(this) }
                    style={ styles.shuffle }
                >
                    <WithLocalSvg
                        fill={this.state.theme.player.actionsActiveIconColor}
                        width={18}
                        height={18}
                        asset={require('../../../assets/icons/player/shuffle.svg')}
                    />
                </TouchableOpacity>);
        } else {
            shuffleButton = (<TouchableOpacity
                onPress={ this.toggleShuffle.bind(this) }
                style={ styles.shuffle }
            >
                <WithLocalSvg
                    fill={this.state.theme.player.actionsInactiveIconColor}
                    width={18}
                    height={18}
                    asset={require('../../../assets/icons/player/shuffle.svg')}
                />
            </TouchableOpacity>);
        }
        let favButton = (<TouchableOpacity
            onPress={ this.toggleFav.bind(this) }
            style={ styles.shuffle }
        >
            <WithLocalSvg
                fill={this.state.theme.player.actionsInactiveIconColor}
                width={18}
                height={18}
                asset={require('../../../assets/icons/player/fav.svg')}
            />
        </TouchableOpacity>);

        let moreButton;
        moreButton = (<TouchableOpacity
            onPress={ () => Actions.contextMenu({ kind:'song', item: this.state.songPlaying}) }
            style={ styles.shuffle }
        >
            <WithLocalSvg
                fill={this.state.theme.player.actionsInactiveIconColor}
                width={18}
                height={18}
                asset={require('../../../assets/icons/player/more.svg')}
            />
        </TouchableOpacity>);


        let miniPlayButton;
        if( this.state.status === "playing" || this.state.status === 3){
            miniPlayButton = (<TouchableOpacity
                    onPress={ this.togglePlay.bind(this) }
                    style={ {marginLeft: 10, marginRight: 10} }
                >
                    <WithLocalSvg
                        fill={this.state.theme.miniPlayer.iconColor}
                        width={16}
                        height={16}
                        asset={require('../../../assets/icons/player/pause-simple.svg')}
                    />
                </TouchableOpacity>);
        } else if( this.state.status === "loading" || this.state.status === 6 ) {
            miniPlayButton = <View style={ {height: 40, width: 40, marginLeft: 10, marginRight: 10, justifyContent: 'center', alignItems: 'center'} }><ActivityIndicator color={this.state.theme.indicatorColor} size="small" color={this.state.theme.buttonColor} /></View>;
        } else {
            miniPlayButton = (<TouchableOpacity
                onPress={ this.togglePlay.bind(this) }
                style={ {marginLeft: 10, marginRight: 10} }
            >
                <WithLocalSvg
                    fill={this.state.theme.miniPlayer.iconColor}
                    width={16}
                    height={16}
                    asset={require('../../../assets/icons/player/play-simple.svg')}
                />
            </TouchableOpacity>);
        }

        let stickyPlayButton;
        if( this.state.status === "playing" || this.state.status === 3){
            stickyPlayButton = (<TouchableOpacity
                onPress={() => {
                    this.goBackward()
                }}
                style={ {marginLeft: 10, marginRight: 10} }
            >
                <WithLocalSvg
                    fill={this.state.theme.buttonColor}
                    width={16}
                    height={16}
                    asset={require('../../../assets/icons/player/pause-simple.svg')}
                />
            </TouchableOpacity>);
        } else if( this.state.status === "loading" || this.state.status === 6 ) {
            stickyPlayButton = <ActivityIndicator color={this.state.theme.indicatorColor} size="small" color={this.state.theme.buttonColor} />;
        } else {
            stickyPlayButton = (<TouchableOpacity
                onPress={() => {
                    this.togglePlay()
                }}
                style={ {marginLeft: 10, marginRight: 10} }
            >
                <WithLocalSvg
                    fill={this.state.theme.buttonColor}
                    width={16}
                    height={16}
                    asset={require('../../../assets/icons/player/play-simple.svg')}
                />
            </TouchableOpacity>);
        }

        let miniForwardButton;
        miniForwardButton = (<TouchableOpacity
            onPress={() => {
                this.goForward();
            }}
            style={styles.miniPlayerButton}
        >
            <WithLocalSvg
                fill={this.state.theme.miniPlayer.iconColor}
                width={16}
                height={16}
                asset={require('../../../assets/icons/player/next.svg')}
            />
        </TouchableOpacity>);;
        let miniBackForwardButton;
        miniBackForwardButton = (<TouchableOpacity
            onPress={ this.goBackward.bind(this) }
            style={styles.miniPlayerButton}
        >
            <WithLocalSvg
                fill={this.state.theme.miniPlayer.iconColor}
                width={16}
                height={16}
                asset={require('../../../assets/icons/player/prev.svg')}
            />
        </TouchableOpacity>);

        const spin = this.state.spinValue.interpolate({
            inputRange: [0, 1],
            outputRange: ['0deg', '360deg']
        });

        let queuePlayingIndex = this.state.queueList.findIndex(x => x.id === this.state.songPlaying.id) + 1;

        return (
            <View style={styles.panelContainer} pointerEvents={'box-none'}>
                {this.state.internet && <Banner/>}
                <Animated.View
                    pointerEvents={'box-none'}
                    style={[styles.panelContainer, {
                        backgroundColor: 'transparent',

                    }]} />
                <Interactable.View
                    ref='headInstance'
                    verticalOnly={true}
                    snapPoints={[
                        {y: -50},
                        {
                            ...ifIphoneX({
                                y: parseInt(this.state.height-134)
                            }, {
                                y: parseInt(Platform.OS === 'android' ? (this.state.queueList.length ? (this.state.height - (99 + this.state.bottomNavBarH)) : this.state.height  + this.state.bottomNavBarH + 100) : (this.state.height-100))
                            }),
                         },
                        {y: this.state.queueList.length ? (isIphoneX() ? (this.state.height-134) : (parseInt(Platform.OS === 'android' ? (this.state.height - (99 + this.state.bottomNavBarH)) : (this.state.height-100)))) : this.state.height}
                    ]}
                    boundaries={{top: -50}}
                    initialPosition={{y: this.state.height}}
                    animatedValueY={this._deltaY}
                    animatedValueX={this._deltaX}
                    onStop={this.onStopInteraction.bind(this)}
                    style={{
                        zIndex: 1
                    }}
                >
                    <View>
                        <TouchableOpacity onPress={() => { this.refs['headInstance'].snapTo({index: 0}) }} style={{height: 50}} activeOpacity={100}>
                            <View style={[styles.headerLayoutStyle, {width: '100%', backgroundColor: this.state.theme.miniPlayer.backgroundColor}]}>
                                <View style={{height: 50, width: '100%', flexDirection: 'row', alignItems: 'center', borderTopWidth: .5, borderTopColor: this.state.theme.miniPlayer.borderTopColor }}>
                                    {this.renderMiniPlayerSlider()}
                                    <View style={{height: 40, width: 40, marginLeft: 4}}>
                                        <View style={{shadowColor: 'rgba(0, 0, 0, .8)', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.5, shadowRadius: 3, width: 40, height: 40}}>
                                            <RNAnimated.Image
                                                style={{
                                                    transform: [{rotate: spin}],
                                                    borderRadius: 20,
                                                }} source={{
                                                uri: this.state.songPlaying.artwork_url,
                                                width: 40,
                                                height: 40
                                            }}/>
                                        </View>
                                    </View>
                                    <View style={{marginLeft: 8, flex:1, overflow: 'hidden'}}>
                                        <Text style={{color: this.state.theme.miniPlayer.songColor}} numberOfLines={1}>{decode(this.state.songPlaying.title)}</Text>
                                        {!this.state.radio && <Text style={{color: this.state.theme.miniPlayer.artistColor, fontSize: 12}} numberOfLines={1}>{this.state.songPlaying.artists.constructor === Array && this.state.songPlaying.artists.map(function (artist) {return artist.name}).join(", ")}</Text>}
                                    </View>
                                    <View style={{flexDirection: 'row', marginRight: 8, marginLeft: 16, alignItems: 'center'}}>
                                        {!this.state.radio && miniBackForwardButton}
                                        {miniPlayButton}
                                        {!this.state.radio && miniForwardButton}
                                    </View>
                                    {this.state.isMediaAdShowing && <TouchableOpacity style={{
                                        position: 'absolute',
                                        top: 0,
                                        left: 0,
                                        right: 0,
                                        bottom: 0,
                                        backgroundColor: this.state.theme.primaryBackgroundColor,
                                        opacity: 0.5
                                    }}/>}
                                </View>
                            </View>
                        </TouchableOpacity>
                        <View style={[styles.slidingPanelLayoutStyle, {width: '100%', height: Platform.OS === 'android' ? (StatusBar.currentHeight > 24 ? (this.state.window.height + StatusBar.currentHeight) : this.state.window.height) : this.state.window.height, backgroundColor: this.state.theme.primaryBackgroundColor}]}>
                            <TouchableOpacity style={ styles.headerClose } onPress={() => { this.refs['headInstance'].snapTo({index: 1}) }}>
                                <Icon name="chevron-down" size={25} color={this.state.theme.player.buttonColor} />
                            </TouchableOpacity>
                            <RNAnimated.View style={{position: "absolute", width: "100%", top: 0, left: 0, right: 0, opacity: this.stickHeaderOpacity, flexDirection: 'row', alignItems: 'center', paddingTop: 30, backgroundColor: this.state.theme.primaryBackgroundColor, zIndex: 1, height: HEADER_HEIGHT}}>
                                <View style={{marginLeft: 60}}>
                                    <Text style={{fontSize: 13, color: this.state.theme.player.songTitleColor, fontWeight: 'bold'}} numberOfLines={1}>{decode(this.state.songPlaying.title)}</Text>
                                    {!this.state.radio && <Text style={{fontSize: 12, color: this.state.theme.player.songArtistColor}} numberOfLines={1}>{this.state.songPlaying.artists.constructor === Array && this.state.songPlaying.artists.map(function (artist) {return artist.name}).join(", ")}</Text>}
                                </View>
                                <View style={{position: "absolute", right: 8, bottom: 12, width: 30, height: 30, alignItems: 'center', justifyContent: 'center'}}>
                                    {stickyPlayButton}
                                </View>
                            </RNAnimated.View>
                            {!this.state.radio && this.state.userStation && (
                                <View style={{flex:1, width: '100%', height: this.state.window.height, backgroundColor: this.state.theme.queueBackgroundColor}}>
                                    <ImageBackground blurRadius={10} source={{uri: this.state.songPlaying.artwork_url}} style={{flex: 1}}>
                                        <LinearGradient style={{flex: 1, alignItems: 'center'}} colors={ this.state.theme.name === 'light' ? ['rgba(239,239,239,.55)', 'rgba(239,239,239,.80)', 'rgba(239,239,239,1)'] : ['rgba(27, 27, 27,.6)', 'rgba(27, 27, 27,.80)', 'rgba(27, 27, 27,1)']}>
                                            <View style={{marginTop: 40, marginBottom: 40}}>
                                                <Text style={{fontSize: 14, fontWeight: 'bold', textAlign: 'center', color: this.state.theme.player.songTitleColor}} numberOfLines={1}>{decode(this.state.songPlaying.title)}</Text>
                                                <Text style={{fontSize: 13, fontWeight: 'bold', textAlign: 'center', color: this.state.theme.player.songArtistColor}} numberOfLines={1}>{this.state.songPlaying.artists.constructor === Array &&  this.state.songPlaying.artists.map(function (artist) {return decode(artist.name)}).join(", ")}</Text>
                                            </View>
                                            <Carousel
                                                ref={'carousel'}
                                                layout={'default'}
                                                data={this.state.queueList}
                                                renderItem={this.renderCarouselItem}
                                                sliderWidth={this.state.window.width}
                                                itemWidth={this.state.window.width > 500 ? 375 : (this.state.window.width-80)}
                                                onSnapToItem={this.onCarouselSnapToItem.bind(this)}
                                            />
                                            <View style={{width: '90%', marginTop: 50, marginBottom: 20}}>
                                                <View style={{position: 'absolute', left: 0, top: -30}}>{favButton}</View>
                                                <View style={{position: 'absolute', right: 0, top: -30}}>{moreButton}</View>
                                                <View style={{position: 'absolute', top: 8, left: 0, right: 0, height: 4, backgroundColor: this.state.theme.player.timeProcess.processColor, width: '100%', borderRadius: 2}}/>
                                                <View style={{position: 'absolute', top: 8, left: 0, right: 0, height: 4, backgroundColor: 'rgba(17,17,17,0.15)', borderRadius: 2, width: this.state.currentBuffered !== 0 && this.state.songDuration !==0 ? (this.state.currentBuffered * 100 / this.state.songDuration) + '%' : 0}}/>
                                                {<Slider
                                                    onSlidingStart={ this.onSlidingStart.bind(this) }
                                                    onSlidingComplete={ this.onSlidingComplete.bind(this) }
                                                    onValueChange={ this.onSlidingChange.bind(this) }
                                                    minimumTrackTintColor={this.state.theme.player.timeProcess.processedColor}
                                                    style={ styles.slider }
                                                    trackStyle={ [styles.sliderTrack, {backgroundColor: 'transparent'}] }
                                                    thumbStyle={ styles.sliderThumb }
                                                    value={ songPercentage }
                                                />}
                                                <View style={ styles.timeInfo }>
                                                    <Text style={ [styles.time, {color: this.state.theme.player.timeTextColor}] }>{ formattedTime(this.state.currentTime) }</Text>
                                                    <Text style={ [styles.timeRight, {color: this.state.theme.player.timeTextColor}] }>{ formattedTime( this.state.songDuration) }</Text>
                                                </View>
                                                <View style={ styles.controls }>
                                                    <View style={{position: 'absolute', left: 0}}>{shuffleButton}</View>
                                                    { prevButton }
                                                    <View
                                                        style={ styles.play }
                                                    >
                                                        { playButton }
                                                    </View>
                                                    { forwardButton }
                                                    <View style={{position: 'absolute', right: 0}}>{repeatButton}</View>
                                                </View>
                                            </View>
                                        </LinearGradient>
                                    </ImageBackground>
                                </View>
                            )}
                            {this.state.radio && !this.state.userStation && (
                                <View style={{flex:1, width: '100%', height: this.state.window.height, backgroundColor: this.state.theme.queueBackgroundColor}}>
                                    <ImageBackground blurRadius={10} source={{uri: this.state.songPlaying.artwork_url}} style={{flex: 1}}>
                                        <LinearGradient style={{flex: 1, alignItems: 'center'}} colors={ this.state.theme.name === 'light' ? ['rgba(239,239,239,.55)', 'rgba(239,239,239,.80)', 'rgba(239,239,239,1)'] : ['rgba(27, 27, 27,.6)', 'rgba(27, 27, 27,.80)', 'rgba(27, 27, 27,1)']}>
                                            <View style={{marginTop: 130,  width: 160, height: 160}}>
                                                <FastImage
                                                    style={[styles.songImage]}
                                                    source={{
                                                        uri: this.state.songPlaying.artwork_url,
                                                        priority: FastImage.priority.normal,
                                                    }}
                                                    resizeMode={FastImage.resizeMode.contain}
                                                />
                                            </View>
                                            <View style={{marginTop: 40, marginBottom: 40}}>
                                                <Text style={{fontSize: 14, fontWeight: 'bold', textAlign: 'center', color: this.state.theme.player.songTitleColor}} numberOfLines={1}>{decode(this.state.songPlaying.title)}</Text>
                                                <Text style={{fontSize: 13, fontWeight: 'bold', textAlign: 'center', color: this.state.theme.player.songArtistColor}} numberOfLines={1}>{this.state.songPlaying.artists.constructor === Array &&  this.state.songPlaying.artists.map(function (artist) {return decode(artist.name)}).join(", ")}</Text>
                                            </View>
                                            <View style={{position: 'absolute', bottom: 32, width: '100%'}}>
                                                {this.renderSimilarStations()}
                                                <View style={ styles.controls }>
                                                    <View
                                                        style={ styles.play }
                                                    >
                                                        { playButton }
                                                    </View>
                                                </View>
                                            </View>
                                        </LinearGradient>
                                    </ImageBackground>
                                </View>
                            )}
                            {!this.state.userStation && !this.state.radio && (
                                <RNAnimated.ScrollView
                                    scrollEventThrottle={5}
                                    showsVerticalScrollIndicator={false}
                                    onScroll={RNAnimated.event(
                                        [{nativeEvent: {contentOffset: {y: this.nScroll}}}],
                                        {
                                            listener: (event)=>{
                                                this._onScroll(event)
                                            },
                                            useNativeDriver: true
                                        }
                                    )}
                                    ref={(ref) => {this.scrollView = ref}}
                                    style={{flex:1, width: '100%', height: this.state.window.height, backgroundColor: this.state.theme.queueBackgroundColor}}>
                                    <RNAnimated.View style={{
                                        transform: [{translateY: RNAnimated.multiply(this.nScroll, 0)}, {scale: this.imgScale}],
                                        backgroundColor: this.state.theme.primaryBackgroundColor,
                                        height: IMAGE_HEIGHT,
                                        position: 'absolute',
                                        top: 0,
                                        width: '100%',
                                    }}>
                                        <ImageBackground blurRadius={10} source={{uri: this.state.songPlaying.artwork_url}} style={{width: '100%', height: this.state.userStation ? this.state.window.height : IMAGE_HEIGHT}}>
                                            <LinearGradient style={{flex: 1}} colors={ this.state.theme.name === 'light' ? ['rgba(239,239,239,.55)', 'rgba(239,239,239,.80)', 'rgba(239,239,239,1)'] : ['rgba(27, 27, 27,.6)', 'rgba(27, 27, 27,.80)', 'rgba(27, 27, 27,1)']} />
                                        </ImageBackground>
                                    </RNAnimated.View>
                                    <View style={{width: '100%', alignItems: 'center', height: (this.state.radio || this.state.userStation) ? this.state.window.height : 'auto'}}>
                                        <View style={{marginTop: 130,  width: 160, height: 160}}>
                                            <FastImage
                                                style={[styles.songImage]}
                                                source={{
                                                    uri: this.state.songPlaying.artwork_url,
                                                    priority: FastImage.priority.normal,
                                                }}
                                                resizeMode={FastImage.resizeMode.contain}
                                            />
                                        </View>
                                        <View style={{marginTop: 24, marginLeft: 32, marginRight: 32}}>
                                            <Text style={{fontSize: 16, fontWeight: 'bold', textAlign: 'center', color: this.state.theme.player.songTitleColor}} numberOfLines={1}>{decode(this.state.songPlaying.title)}</Text>
                                            {!this.state.radio && <Text style={{fontSize: 14, marginTop: 4, fontWeight: 'bold', textAlign: 'center', color: this.state.theme.player.songArtistColor}} numberOfLines={1}>{this.state.songPlaying.artists.constructor === Array &&  this.state.songPlaying.artists.map(function (artist) {return artist.name}).join(", ")}</Text>}
                                        </View>
                                        <View style={{width: '90%', marginTop: 50, marginBottom: 20}}>
                                            <View style={{position: 'absolute', left: 0, top: -30}}>{favButton}</View>
                                            <View style={{position: 'absolute', right: 0, top: -30}}>{moreButton}</View>
                                            <View style={{ position: 'absolute', top: 8, left: 0, right: 0, height: 4, backgroundColor: this.state.theme.player.timeProcess.processColor, width: '100%', borderRadius: 2}}/>
                                            <View style={{ position: 'absolute', top: 8, left: 0, right: 0, height: 4, backgroundColor: 'rgba(17,17,17,0.15)', borderRadius: 2, width: this.state.currentBuffered !== 0 && this.state.songDuration !==0 ? (this.state.currentBuffered * 100 / this.state.songDuration) + '%' : 0}}/>
                                            {<Slider
                                                onSlidingStart={ this.onSlidingStart.bind(this) }
                                                onSlidingComplete={ this.onSlidingComplete.bind(this) }
                                                onValueChange={ this.onSlidingChange.bind(this) }
                                                minimumTrackTintColor={this.state.theme.player.timeProcess.processedColor}
                                                style={ styles.slider }
                                                trackStyle={ [styles.sliderTrack, {backgroundColor: 'transparent'}] }
                                                thumbStyle={ styles.sliderThumb }
                                                value={ songPercentage }
                                            />}
                                            <View style={ styles.timeInfo }>
                                                <Text style={ [styles.time, {color: this.state.theme.player.timeTextColor}] }>{ formattedTime(this.state.currentTime) }</Text>
                                                <Text style={ [styles.timeRight, {color: this.state.theme.player.timeTextColor}] }>{ formattedTime( this.state.songDuration) }</Text>
                                            </View>
                                            <View style={ styles.controls }>
                                                <View style={{position: 'absolute', left: 0}}>{shuffleButton}</View>
                                                { prevButton }
                                                <View
                                                    style={ styles.play }
                                                >
                                                    { playButton }
                                                </View>
                                                { forwardButton }
                                                <View style={{position: 'absolute', right: 0}}>{repeatButton}</View>
                                            </View>
                                        </View>
                                    </View>
                                    <RNAnimated.View style={{transform: [{translateY: this.tabY}], zIndex: 1, flexDirection: 'row', width:'100%', height: 50, alignItems: 'center', backgroundColor: this.state.theme.player.queueHeaderBackgroundColor, borderTopWidth: .5, borderTopColor: this.state.theme.player.queueBorderTopColor}}>
                                        <Text style={{color: this.state.theme.player.queueHeaderTextColor, fontWeight: 'bold', marginLeft: 16}}>{i18n.t('queue')} {queuePlayingIndex}/{this.state.queueList.length} {i18n.t('songs')}</Text>
                                        <View style={{position: 'absolute', right: 16, flexDirection: 'row', alignSelf: 'flex-end', height: 30, top: 10}}>
                                            <TouchableOpacity onPress={() => {this.emptyQueue()}} style={{borderRadius: 15, paddingLeft: 20, paddingRight: 20, alignItems: 'center', justifyContent: 'center'}}>
                                                <Text style={{color: this.state.theme.player.queueHeaderTextColor, fontWeight: 'bold'}}>{i18n.t('clear')}</Text>
                                            </TouchableOpacity>
                                            <TouchableOpacity onPress={this.onSaveButtonPress.bind(this)} style={{backgroundColor: '#e23137', borderRadius: 15, paddingLeft: 20, paddingRight: 20, alignItems: 'center', justifyContent: 'center'}}>
                                                <Text style={{color: '#fff', fontWeight: 'bold'}}>{i18n.t('save')}</Text>
                                            </TouchableOpacity>
                                        </View>
                                    </RNAnimated.View>
                                    <View style={{paddingLeft: 16, paddingRight: 16}}>
                                        {this.renderQueue()}
                                    </View>
                                </RNAnimated.ScrollView>
                            )}
                        </View>
                    </View>
                </Interactable.View>
                <Animated.View style={{
                    position: 'absolute',
                    bottom: !this.state.playerVisible ? 0 :  this._deltaY.interpolate({
                        inputRange: [0, Platform.OS === 'android' ?  (this.state.height-(100 + this.state.bottomNavBarH)) : (isIphoneX() ? (this.state.height-134) : (this.state.height-(100 + this.state.bottomNavBarH)))],
                        outputRange: [isIphoneX() ? -84 : -50, 0],
                        extrapolateRight: 'clamp'
                    }),
                    left: 0,
                    right: 0,
                    ...ifIphoneX({
                        height: 84,
                    }, {
                        height: 50,
                    }),
                    zIndex: 100
                }}>
                    {this.state.internet && <HackedTabs/>}

                    {! this.state.internet &&
                    <View style={{
                        width: '100%',
                        justifyContent: 'space-between',
                        flexDirection: 'row',
                        paddingLeft: 16,
                        paddingRight: 16,
                        ...ifIphoneX({height: 84}, {height: 50,}),
                        backgroundColor: this.state.theme.bottomTabBar.backgroundColor,
                        borderTopWidth: .5,
                        borderTopColor: this.state.theme.bottomTabBar.borderTopColor
                    }}>
                        <Text
                            style={{
                                color: this.state.theme.textPrimaryColor,
                                fontSize: 17,
                                fontWeight: '500',
                                lineHeight: 50
                            }}
                        >Offline mode</Text>
                        <TouchableOpacity
                            onPress={
                                () => {
                                    Actions.downloadedPage()
                                }
                            }
                            style={{
                                alignItems: 'center',
                                justifyContent: 'center',
                                backgroundColor: this.state.theme.primaryButton.backgroundColor,
                                height: 32,
                                borderRadius: 20,
                                paddingLeft: 16,
                                paddingRight: 16,
                                marginTop: 9
                            }}
                        >
                            <Text
                                style={{
                                    color: this.state.theme.primaryButton.textColor,
                                    fontSize: 17,
                                    fontWeight: '500'
                                }}
                            >Your Library</Text>
                        </TouchableOpacity>
                    </View>}
                </Animated.View>

            </View>
        )
    }
}
const styles = StyleSheet.create({
    panelContainer: {
        position: 'absolute',
        top: 0,
        bottom: 0,
        left: 0,
        right: 0
    },
    container: {
        flex: 1,
    },
    bodyViewStyle: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    headerLayoutStyle: {
        height: 50,
        justifyContent: 'center',
        alignItems: 'center',
    },
    slidingPanelLayoutStyle: {
        backgroundColor: '#2c2d30',
        justifyContent: 'center',
        alignItems: 'center',
        zIndex: 0
    },
    commonTextStyle: {
        color: 'white',
        fontSize: 18,
    },
    NaviBackground: {
        alignItems: 'center',
        width: '100%',
    },
    backgroundOverlay: {
        ...StyleSheet.absoluteFillObject,
        backgroundColor: 'rgba(0, 0, 0, 0.6)',
    },
    header: {
        ...ifIphoneX({
            marginTop: 40
        }, {
            marginTop: Platform.OS === 'ios' ? 24 : 10,
        }),
        marginBottom: 17,
        width: '100%' - 140,
    },
    headerClose: {
        position: 'absolute',
        ...ifIphoneX({
            top: 35
        }, {
            top: 20,
        }),
        left: 0,
        padding: 20,
        zIndex: 100
    },
    headerText: {
        color: "rgba(255, 255, 255, .8)",
        fontSize: 13,
        textAlign: 'center',
        fontWeight: 'bold'
    },
    headerSubText: {
        color: "rgba(255, 255, 255, .6)",
        fontSize: 12,
        textAlign: 'center',
        marginTop: 8
    },
    playerSwiper: {
        ...ifIphoneX({
            position: 'absolute',
            top: 88,
            alignItems: 'center',
        }, {
            ...Platform.select({
                ios: {
                    position: 'absolute',
                    top: 0,
                    bottom: 110,
                    alignItems: 'center',
                },
                android: {
                    height: window.height - 200,
                    width: '100%',
                },
            }),
        }),
    },
    swiperSongInfo: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    adBanner: {
        width: 300,
        height: 250,
        backgroundColor: "rgba(0, 0, 0, .4)",
    },
    swiperQueue: {
        flex: 1,
        marginTop: 24,
        paddingLeft: 8,
        paddingRight: 8
    },
    songImage: {
        borderRadius: 3,
        width: 160,
        height: 160,
    },
    actions: {
        flexDirection: 'row',
        position: 'absolute',
        bottom:0,
        left: 0,
        right: 0,
        alignItems: 'center',
        justifyContent: 'center',
    },
    action_icon: {
        marginLeft: 30,
        marginRight: 30,
        padding: 10
    },
    description: {
        position: 'absolute',
        bottom: 120,
        left: 20,
        right: 20
    },
    descriptionText: {
        color: "rgba(255, 255, 255, .6)",
        fontSize: 12,
        textAlign: 'justify',
    },
    controls: {
        flexDirection: 'row',
        marginTop: 0,
        alignItems: 'center',
        justifyContent: 'center',
        height: 60,
    },
    back: {
        marginLeft: 30,
    },
    play: {
        marginLeft: 30,
        marginRight: 30,
        width: 50,
        height: 50,
        alignItems: 'center',
        justifyContent: 'center'
    },
    forward: {
        marginRight: 30,
    },
    shuffle: {
    },
    repeat: {
    },
    bottomPlayer: {
        position: 'absolute',
        ...ifIphoneX({
            bottom: 20
        }, {
            bottom: Platform.OS === 'ios' ? 0 : 0,
        }),
        justifyContent: 'center',
        alignItems: 'center',
        width: window.width > 700 ? 400 : '100%'
    },
    sliderContainer: {
        width: '90%',
    },
    timeInfo: {
        flexDirection: 'row',
        marginTop: 8,
        marginBottom: 16,
    },
    time: {
        fontSize: 12,
    },
    timeRight: {
        textAlign: 'right',
        flex: 1,
        fontSize: 12,
    },
    slider: {
        height: 20,
    },
    sliderTrack: {
        height: 4,
    },
    sliderThumb: {
        width: 14,
        height: 14,
        backgroundColor: '#fff',
        borderRadius: 7,
        shadowColor: 'rgba(0,0,0,.1)',
        shadowOffset: {
            width: 0,
            height: 0
        },
        shadowRadius: 2,
        shadowOpacity: 1,
    },
    queue_index: {
        width: 20,
        height: 50,
        alignItems: 'center',
        justifyContent: 'center',
    },
    song_info: {
        flex: 1,
        height: 60,
        justifyContent: 'center',
        marginRight: 60,
    },
    song_list_view: {
        height: 60,
        overflow: 'hidden',
        flexDirection: 'row',
        alignItems: 'center'
    },
    more: {
        /*alignSelf: 'flex-end',*/
    },
    moreIcon: {
        alignSelf: 'flex-end',
        justifyContent: 'center',
        alignItems: 'center',
        color: '#494949',
        marginTop: 12,
    },
    textSongName: {
        fontSize: 13,
        marginLeft: 8,
        fontWeight: 'bold'
    },
    textArtistName: {
        fontSize: 13,
        marginLeft: 8,
    },
    miniPlayerButton: {
        marginLeft: 8,
        marginRight: 8,
    }
});


function withLeadingZero(amount){
    if (amount < 10 ){
        return `0${ amount }`;
    } else {
        return `${ amount }`;
    }
}

function formattedTime( timeInSeconds ){
    let minutes = Math.floor(timeInSeconds / 60);
    let seconds = timeInSeconds - minutes * 60;

    if( isNaN(minutes) || isNaN(seconds) ){
        return "";
    } else {
        return(`${ withLeadingZero( minutes ) }:${ withLeadingZero( seconds.toFixed(0) ) }`);
    }
}
export default connect(({routes, scroll, language, display, player, auth, internet, ad, role}) => ({routes, scroll, language, display, player, auth, internet, ad, role}))(EnginePlayer);
