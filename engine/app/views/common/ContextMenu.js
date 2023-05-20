import React, {Component, createRef} from 'react';
import {
    View,
    Text,
    StyleSheet,
    Dimensions,
    TouchableOpacity,
    Image,
    Share,
    Linking,
    Alert,
    Animated, PermissionsAndroid, Platform,
} from 'react-native';

import AsyncStorage from '@react-native-async-storage/async-storage';

import i18n from 'i18n-js';
import * as Languages from '../../helpers/Lang';
import { Actions } from 'react-native-router-flux';
import Icon from 'react-native-vector-icons/SimpleLineIcons';
const GLOBAL = require('../../../config/Global');
import RNFetchBlob from 'rn-fetch-blob'
import {
    msgShow,
    noLoginAlert,
    artistStation,
    doFavorite,
    addToQueue,
    userStation,
    setUserDisconnect,
    overviewCart,
    playSong,
    removeFromCart,
    genUid,
    checkForDownloadOffline
} from "../../helpers/Functions";
import {connect} from "react-redux";
import {ifIphoneX} from "../../helpers/ifIphoneX";
import ActionSheet from "react-native-actions-sheet";
import {WithLocalSvg} from "react-native-svg";
import { InAppBrowser } from 'react-native-inappbrowser-reborn'
const actionSheetMessageRef = createRef();
import FastImage from "react-native-fast-image";
import database from "@react-native-firebase/database";
import {decode} from "html-entities";

const window = Dimensions.get('window');
const Screen = {
    width: Dimensions.get('window').width,
    height: Dimensions.get('window').height - 75
}


class ContextMenu extends Component {
    constructor(props) {
        super(props);
        this.state = {
            currentLanguage: this.props.language.code,
            opacity: new Animated.Value(0),
            offset: new Animated.Value(+window.height),
            user: this.props.auth.isLogged ? this.props.auth.user : null,
            theme: this.props.display.darkMode ? GLOBAL.themes.dark : GLOBAL.themes.light,
            panResponder: {},
            currentSong: {},
            value: 'paypal'
        };
        this._deltaY = new Animated.Value(Screen.height-100);

        setTimeout(async() => {
            let lang = await AsyncStorage.getItem('lang');
            if(lang !== this.props.lang) {
                this.setState({ currentLanguage: lang });
            }
        }, 10);
    }
    async componentDidMount(): void {
        actionSheetMessageRef.current?.setModalVisible();
        Linking.addEventListener('url', this.handleOpenURL);
    }
    componentWillUnmount() {
        Linking.removeEventListener('url', this.handleOpenURL);
    }
    async handleOpenURL(event): void {
        const route = event.url.replace(/.*?:\/\//g, '');
        if(route === 'payment/success') {
            if (await InAppBrowser.isAvailable()) {
                await InAppBrowser.close();
            }
            setTimeout(() => {
                actionSheetMessageRef.current?.setModalVisible(false);
                overviewCart();
            }, 500);
        }
    }
    closeModal = () => {
        actionSheetMessageRef.current?.setModalVisible(false);
    };
    hasId(data, id) {
        return data.some(function (el) {
            return el.id === id;
        });
    }
    requestStoragePermission = async () => {
        try {
            const granted = await PermissionsAndroid.request(
                PermissionsAndroid.PERMISSIONS.WRITE_EXTERNAL_STORAGE,
                {
                    title: "Write Permission",
                    message:
                        "To be able to download music " +
                        "you have to grant write permission for the app.",
                    buttonNeutral: "Ask Me Later",
                    buttonNegative: "Cancel",
                    buttonPositive: "OK"
                }
            );
            if (granted === PermissionsAndroid.RESULTS.GRANTED) {
                await this.sendDownloadOfflineRequest(true);
            } else {
                return false;
            }
        } catch (err) {
            console.warn(err);
        }
    };
    async sendDownloadOfflineRequest(shouldStartStore = false) {
        const device_key = await AsyncStorage.getItem('device_key');
        var checkForDuplicate = await database().ref(`offline/${this.state.user.id}/${device_key}/songs`).orderByChild('id').equalTo(this.props.item.id).limitToFirst(1);
        await checkForDuplicate.once('value', async(snap) => {
            if (snap.val()) {
                msgShow('success', 'Song already there!');
                this.closeModal();
            } else {
                var offlineSongListRef = await database().ref(`offline/${this.state.user.id}/${device_key}/songs`);
                var newSongRef = offlineSongListRef.push();
                var song = this.props.item;
                song.downloaded = 0;
                newSongRef.set(song);
                msgShow('success', `${song.title} is being downloaded...`);
                this.closeModal();
            }
        });

        if(shouldStartStore) {
            setTimeout(async() => {
                await checkForDownloadOffline(this.props.auth.user.id);
            }, 3000);
        }
    }
    async contextAction (action){
        i18n.locale = this.state.currentLanguage;
        i18n.fallbacks = true;
        i18n.translations = Languages;

        if(action === "edit-playlist"){
            this.closeModal();
            setTimeout(() => {
                Actions.editPlaylistModal({item: this.props.item, edit: 'info', lang: this.state.currentLanguage});
            }, 300);
        } else if(action === "edit-profile"){
            this.closeModal();
            setTimeout(() => {
                Actions.editProfileModal({item: this.props.item, edit: 'info', lang: this.state.currentLanguage});
            }, 300);
        } else if(action === "invite-collaborator"){
            this.closeModal();
            setTimeout(() => {
                Actions.inviteCollaboratorModal({item: this.props.item, lang: this.state.currentLanguage});
            }, 300);
        } else if(action === "manager-playlist-song"){
            this.closeModal();
            setTimeout(() => {
                Actions.editPlaylistModal({item: this.props.item, edit: 'songs', lang: this.state.currentLanguage});
            }, 300);
        }else if(action === "viewPlaylistActivity"){
            this.closeModal();
            setTimeout(() => {
                Actions.playlistActivity({playlist: this.props.item})
            }, 300);
        }else if(action === "activities"){
            this.closeModal();
            setTimeout(() => {
                Actions.activities({lang: this.state.currentLanguage});
            }, 300);
        }else if(action === "logout"){
            this.closeModal();
            setUserDisconnect(this.state.user.username);
            AsyncStorage.setItem('access_token', '');
            this.props.dispatch({type: 'TOGGLE_AUTH', user: {}});
        } else if(action === "add-song-to-playlist"){
            this.closeModal();
            setTimeout(() => {
                if(this.state.user && this.state.user.id !== undefined) Actions.addToPlaylistModal({row: this.props.item, mediaType: 'song'});
                else Actions.loginModal();
            }, 500);

        } else if(action === "add-album-to-playlist"){
            this.closeModal();
            setTimeout(() => {
                if(this.state.user && this.state.user.id !== undefined) Actions.addToPlaylistModal({row: this.props.item, mediaType: 'album'});
                else Actions.loginModal();
            }, 500);

        } else if(action === "songShow"){
            this.closeModal();
            setTimeout(() => {
                Actions.songShow({song: this.props.item});
            }, 500);

        } else if(action === "add-playlist-to-playlist"){
            this.closeModal();
            setTimeout(() => {
                if(this.state.user && this.state.user.id !== undefined) Actions.addToPlaylistModal({row: this.props.item, mediaType: 'playlist'});
                else Actions.loginModal();
            }, 500);

        } else if(action === "start-artist-station"){
            this.closeModal();
            setTimeout(() => {
                artistStation(this.props.item.id);
            }, 500);
        } else if(action === "start-user-station"){
            this.closeModal();
            setTimeout(() => {
                userStation(this.props.item.username);
            }, 500);
        } else if(action === "add-song-to-favorite"){
            this.closeModal();
            doFavorite('song', this.props.item.id, ! this.props.item.favorite);
        } else if(action === "delete-playlist"){
            Alert.alert(
                'Delete playlist',
                'Are you sure want to delete this playlist?',
                [
                    {text: 'Cancel'},
                    {
                        text: 'Confirm', onPress: () => {
                            fetch(GLOBAL.API_URL + '/api.php?do=playlist&action=delete&id=' + this.props.item.id + '&user_id=' + this.state.user.id + '&password=' +  this.state.user.password).then((response) => response.json())
                                .then((responseJson) => {
                                    if (responseJson.status === 'success') {
                                        msgShow('success', 'Playlist has been deleted. Please wait...');
                                        this.closeModal();
                                        setTimeout(() => {
                                            Actions.reset('profilePage');
                                        }, 1000);
                                    }
                                });
                        }
                    },
                ],
                {cancelable: false}
            )
        } else if(action === "song-queue-next"){
            addToQueue([this.props.item], 1);
            this.closeModal();
        } else if(action === "song-queue-last"){
            addToQueue([this.props.item], 2);
            this.closeModal();
        } else if(action === "multi-song-queue-next"){
            this.props.songs && this.props.songs.length &&  addToQueue(this.props.songs, 1);
            this.closeModal();
        } else if(action === "multi-song-queue-last"){
            this.props.songs && this.props.songs.length && addToQueue(this.props.songs, 2);
            this.closeModal();
        } else if(action === "share"){
            this.closeModal();
            let sharingItemText;
            if(this.props.kind === 'song') {
                sharingItemText = i18n.t('share_song')
                    .replace(':ObjectName', decode(this.props.item.permalink_url))
                    .replace(':SongName', decode(this.props.item.title))
                    .replace(':ArtistName', this.props.item.artists.map(function (artist) {return decode(artist.name)}).join(", "));
            } else if(this.props.kind === 'artist') {
                sharingItemText = i18n.t('share_artist')
                    .replace(':ObjectName', decode(this.props.item.permalink_url))
                    .replace(':ArtistName', decode(this.props.item.name));
            } else if(this.props.kind === 'album') {
                sharingItemText = i18n.t('share_album')
                    .replace(':ObjectName', decode(this.props.item.permalink_url))
                    .replace(':AlbumName', decode(this.props.item.title))
                    .replace(':ArtistName', this.props.item.artists.map(function (artist) {return decode(artist.name)}).join(", "))
            } else if(this.props.kind === 'playlist') {
                sharingItemText = i18n.t('share_playlist')
                    .replace(':ObjectName', decode(this.props.item.permalink_url))
                    .replace(':PlaylistName', decode(this.props.item.title))
                    .replace(':UserName', decode(this.props.item.user.name));
            } else if(this.props.kind === 'podcast') {
                sharingItemText = i18n.t('share_podcast')
                    .replace(':ObjectName', decode(this.props.item.permalink_url))
                    .replace(':ObjectName', decode(this.props.item.title))
                    .replace(':ArtistName', decode(this.props.item.artist.name));
            } else if(this.props.kind === 'episode') {
                sharingItemText = i18n.t('share_episode')
                    .replace(':ObjectName', decode(this.props.item.permalink_url))
                    .replace(':ObjectName', decode(this.props.item.title))
                    .replace(':Show', decode(this.props.item.podcast.title))
            } else if(this.props.kind === 'user') {
                sharingItemText = i18n.t('share_user')
                    .replace(':ObjectName', decode(this.props.item.permalink_url))
                    .replace(':ObjectName', decode(this.props.item.permalink_url));
            } else if(this.props.kind === 'station') {
                sharingItemText = i18n.t('share_station')
                    .replace(':ObjectName', decode(this.props.item.permalink_url))
                    .replace(':StationName', decode(this.props.item.title));
            } else {
                return false;
            }

            sharingItemText = sharingItemText.replace(':Url', decode(this.props.item.permalink_url));

            Share.share({
                message: sharingItemText,
                url: this.props.item.permalink_url,
                title: this.props.item.title
            }, {
                // Android only:
                dialogTitle: `Listen to ${decode(this.props.item.title)} by ${this.props.item.artists.map(function (artist) {return decode(artist.name)}).join(", ")}}`,
                // iOS only:
                excludedActivityTypes: [
                    'com.apple.UIKit.activity.PostToTwitter'
                ]
            });
            this.closeModal();
        } else if(action === "delete-offline") {
            const device_key = await AsyncStorage.getItem('device_key');
            var getOfflineSongRef = await database().ref(`offline/${this.props.auth.user.id}/${device_key}/songs`).orderByChild('id').equalTo(this.props.item.id).limitToFirst(1);
            await getOfflineSongRef.once('value', (snapshot) => {
                snapshot.forEach(async (childSnapshot) => {
                    await database()
                        .ref(`offline/${this.props.auth.user.id}/${device_key}/songs${childSnapshot.key}`)
                        .remove();
                });
            });
            if (this.props.item.downloaded) {
                RNFetchBlob.fs.unlink(this.props.item.stream_url).then(() => {
                    msgShow('success', this.props.item.title + ' has been deleted.');
                })
            }
            this.closeModal();
        } else if(action === "play-song"){
            playSong(this.props.item);
            this.closeModal();
        } else if(action === "remove-from-cart") {
            removeFromCart(this.props.cartItem.id);
            this.closeModal();
        } else if(action === "download-offline") {
            if(Platform.OS === "android") {
                await PermissionsAndroid.check(PermissionsAndroid.PERMISSIONS.WRITE_EXTERNAL_STORAGE).then(async(response) => {
                    if(response) {
                        await this.sendDownloadOfflineRequest()
                    } else {
                        await this.requestStoragePermission();
                    }
                });
            } else {
                await this.sendDownloadOfflineRequest()
            }
        } else if(this.state.user != null && this.state.user.id){
            if(action === "favorite"){
                fetch(GLOBAL.API_URL + '/api.php?do=favorite&object_type=10&user_id=' + this.state.user.user_id + '&item_id=' + this.props.item.id + '&action=add')
                    .then((response) => response.json())
                    .then((responseJson) => {
                        if(responseJson.status === 'success'){
                            //Toast.show(this.props.item.title + ' added to favorites', { position: 70, shadow: false, backgroundColor: '#36383d'});
                        } else {
                            alert('Server response error!');
                        }
                    }).catch((error) => {
                });
                this.closeModal();
            }else if(action === "unfavorite"){
                fetch(GLOBAL.API_URL + '/api.php?do=favorite&object_type=10&user_id=' + this.state.user.user_id + '&item_id=' + this.props.item.id + '&action=remove')
                    .then((response) => response.json())
                    .then((responseJson) => {
                        if(responseJson.status === 'success'){
                        } else {
                            alert('Server response error!');
                        }
                    }).catch((error) => {
                });
                this.closeModal();
            }
        } else {
            noLoginAlert();
        }
    }
    renderContextMenu(title, icon, action){
        return (
            <TouchableOpacity style={styles.menuItem} onPress={() =>{this.contextAction(action)}}>
                <Icon name={icon} size={16} color={this.state.theme.contextMenuIconColor} />
                <Text style={[styles.menuTitleStyle, {color: this.state.theme.textPrimaryColor}]}>{title}</Text>
            </TouchableOpacity>
        )
    }
    render () {
        i18n.locale = this.state.currentLanguage;
        i18n.fallbacks = true;
        i18n.translations = Languages;

        return (
            <View style={styles.container}>
                <ActionSheet
                    bounceOnOpen={true}
                    bounciness={8}
                    gestureEnabled={true}
                    defaultOverlayOpacity={0.5}
                    ref={actionSheetMessageRef}
                    onClose={Actions.pop}
                    containerStyle={{
                        backgroundColor: this.state.theme.contextMenuBackgroundColor,
                    }}
                >
                    {(this.props.kind !== 'checkout' && this.props.kind !== 'subscription') &&
                    <View style={styles.menuItemInfo}>
                        <View style={styles.menuItemImageView}>
                            <FastImage
                                style={{borderRadius: this.props.kind === 'user' ? 25 : 3, width: 50, height: 50}}
                                source={{
                                    uri: this.props.item.artwork_url,
                                    priority: FastImage.priority.normal,
                                }}
                                resizeMode={FastImage.resizeMode.contain}
                            />
                        </View>
                        <View style={styles.menuTitle}>
                            {(this.props.kind === 'song' || this.props.kind === 'cart' || this.props.kind === 'playlist' || this.props.kind === 'album') &&
                            <Text style={[styles.menuSubHeader, {color: this.state.theme.textPrimaryColor}]} numberOfLines={1}>{decode(this.props.item.title)}</Text>}
                            {(this.props.kind === 'artist') &&
                            <Text style={[styles.menuSubHeader, {color: this.state.theme.textPrimaryColor}]}
                                  numberOfLines={1}>{decode(this.props.item.name)}</Text>}
                            {(this.props.kind === 'song' || this.props.kind === 'cart' || this.props.kind === 'album') &&
                            <Text style={[styles.menuSubByline, {color: this.state.theme.textSecondaryColor}]}
                                  numberOfLines={1}>{this.props.item.name ? decode(this.props.item.name) : this.props.item.artists.map(function (artist) {
                                return decode(artist.name)
                            }).join(", ")}</Text>}
                            {this.props.kind === 'playlist' &&
                            <Text style={[styles.menuSubHeader, {color: this.state.theme.textSecondaryColor}]}
                                  numberOfLines={1}>{decode(this.props.item.user.name)}</Text>}
                            {this.props.kind === 'user' &&
                            <Text style={[styles.menuSubHeader, {color: this.state.theme.textPrimaryColor}]}
                                  numberOfLines={1}>{decode(this.props.item.name)}</Text>}

                            {this.state.currentSong && this.state.currentSong.id &&
                            <Text style={[styles.menuSubHeader, {color: this.state.theme.textSecondaryColor}]}
                                  numberOfLines={1}>
                                <Image style={{width: 15, height: 15}}
                                       source={this.props.display.darkMode ? require('../../../assets/images/white_playing_queue.gif') : require('../../../assets/images/black_playing_queue.gif')}/>
                                {this.state.currentSong.title} - {this.state.currentSong.artists.map(function (artist) {
                                return decode(artist.name)
                            }).join(", ")}
                            </Text>
                            }
                        </View>
                    </View>
                    }
                    {this.props.kind === 'song' && this.props.auth.isLogged && ! this.props.item.hasOwnProperty("downloaded") && this.renderContextMenu(i18n.t('download_offline'), 'cloud-download', 'download-offline')}
                    {this.props.kind === 'song' && this.renderContextMenu(this.props.item.favorite ? i18n.t('unfavourite') : i18n.t('add_to_favorite'), 'heart', 'add-song-to-favorite')}
                    {this.props.kind === 'song' && this.renderContextMenu(i18n.t('play_song_next'), 'control-play', 'song-queue-next')}
                    {this.props.kind === 'song' && this.renderContextMenu(i18n.t('play_song_last'), 'control-end', 'song-queue-last')}
                    {this.props.kind === 'song' && this.renderContextMenu(i18n.t('add_to_playlist'), 'playlist', 'add-song-to-playlist')}
                    {this.props.kind === 'song' && this.renderContextMenu(i18n.t('share'), 'share', 'share')}
                    {this.props.kind === 'song' && this.renderContextMenu(i18n.t('go_to_song'), 'music-tone-alt', 'songShow')}
                    {this.props.kind === 'song' && this.props.auth.isLogged && this.props.item.hasOwnProperty("downloaded") && this.renderContextMenu(i18n.t('delete_from_this_device'), 'trash', 'delete-offline')}

                    {(this.props.kind === 'playlist' || this.props.kind === 'album') && this.renderContextMenu(i18n.t('play_next'), 'control-play', 'multi-song-queue-next')}
                    {(this.props.kind === 'playlist' || this.props.kind === 'album') && this.renderContextMenu(i18n.t('play_last'), 'control-end', 'multi-song-queue-last')}

                    {this.props.kind === 'album' && this.renderContextMenu(i18n.t('add_to_playlist'), 'playlist', 'add-album-to-playlist')}
                    {this.props.kind === 'album' && this.renderContextMenu(i18n.t('share'), 'share', 'share')}

                    {this.props.kind === 'artist' && this.renderContextMenu(i18n.t('share'), 'share', 'share')}
                    {this.props.kind === 'artist' && this.renderContextMenu(i18n.t('play_station'), 'feed', 'start-artist-station')}

                    {this.props.kind === 'playlist' && this.renderContextMenu(i18n.t('add_to_playlist'), 'playlist', 'add-playlist-to-playlist')}
                    {this.props.kind === 'playlist' && this.renderContextMenu(i18n.t('view_activity'), 'energy', 'viewPlaylistActivity')}
                    {this.props.kind === 'playlist' && this.renderContextMenu(i18n.t('share'), 'share', 'queue')}
                    {this.props.kind === 'playlist' && this.state.user && this.state.user.id === this.props.item.user.id && this.renderContextMenu(i18n.t('invite_collaborator'), 'user-follow', 'invite-collaborator')}
                    {this.props.kind === 'playlist' && this.state.user && this.state.user.id === this.props.item.user.id && this.renderContextMenu(i18n.t('edit_playlist'), 'note', 'edit-playlist')}
                    {this.props.kind === 'playlist' && this.state.user && this.state.user.id === this.props.item.user.id && this.renderContextMenu(i18n.t('manager_playlist_songs'), 'layers', 'manager-playlist-song')}
                    {this.props.kind === 'playlist' && this.state.user && this.state.user.id === this.props.item.user.id && this.renderContextMenu(i18n.t('delete_playlist'), 'minus', 'delete-playlist')}

                    {this.props.kind === 'user' && this.renderContextMenu(i18n.t('play_station'), 'feed', 'start-user-station')}
                    {this.props.kind === 'user'  && this.state.user && this.state.user.id === this.props.item.id && this.renderContextMenu(i18n.t('edit_profile'), 'note', 'edit-profile')}
                    {this.props.kind === 'user'  && this.state.user && this.state.user.id === this.props.item.id && this.renderContextMenu(i18n.t('your_activities'), 'energy', 'activities')}
                    {this.props.kind === 'user'  && this.state.user && this.state.user.id === this.props.item.id && this.renderContextMenu(i18n.t('logout'), 'logout', 'logout')}

                    {this.props.kind === 'cart' && this.renderContextMenu(i18n.t('play_song'), 'control-play', 'play-song')}
                    {this.props.kind === 'cart' && this.renderContextMenu(i18n.t('go_to_song'), 'music-tone-alt', 'songShow')}
                    {this.props.kind === 'cart' && this.renderContextMenu(i18n.t('remove_from_cart'), 'close', 'remove-from-cart')}

                    {this.props.kind === 'checkout' &&
                    <View
                        style={{
                            marginLeft: 16,
                            marginRight: 16
                        }}
                    >
                        <View
                            style={{
                                flex: 1,
                                justifyContent: 'space-between',
                                alignItems: 'center',
                                flexDirection: 'row',
                                height: 64,
                                borderBottomWidth: 1,
                                borderColor: 'white',
                            }}
                        >
                            <Text
                                style={{
                                    color: this.state.theme.textPrimaryColor,
                                    fontWeight: '500',
                                    fontSize: 17
                                }}
                            >Pay for ({this.props.item.items.length}) items</Text>
                            <Text
                                style={{
                                    color: this.state.theme.textPrimaryColor,
                                    fontWeight: '500',
                                    fontSize: 17
                                }}
                            >${this.props.item.subtotal}</Text>
                        </View>
                        <View
                            style={{
                                flex: 1,
                                marginTop: 8,
                                marginBottom: 16
                            }}
                        >
                            <TouchableOpacity
                                onPress={() => this.setState({ value: 'paypal' })}
                                style={{
                                    flexDirection: 'row',
                                    alignItems: 'center',
                                    height: 48,
                                    justifyContent: 'space-between'
                                }}
                            >
                                <View
                                    style={{
                                        flex: 1,
                                        alignItems: 'center',
                                        flexDirection: 'row'
                                    }}
                                >
                                    <View
                                        style={{
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            width: 48,
                                            height: 32,
                                            backgroundColor: '#ffc23b',
                                            borderRadius: 4
                                        }}
                                    >
                                        <WithLocalSvg
                                            fill={this.state.theme.textSecondaryColor}
                                            width={16}
                                            height={16}
                                            asset={require('../../../assets/icons/common/paypal.svg')}
                                        />
                                    </View>
                                    <Text
                                        style={{
                                            color: this.state.theme.textPrimaryColor,
                                            fontWeight: '500',
                                            fontSize: 17,
                                            marginLeft: 8
                                        }}
                                    >PayPal</Text>
                                </View>
                                <View style={styles.circle}>
                                    { this.state.value === 'paypal' && (<View style={styles.checkedCircle} />) }
                                </View>
                            </TouchableOpacity>
                            <TouchableOpacity
                                onPress={() => this.setState({ value: 'stripe' })}
                                style={{
                                    flexDirection: 'row',
                                    alignItems: 'center',
                                    height: 48,
                                    justifyContent: 'space-between'
                                }}
                            >
                                <View
                                    style={{
                                        flex: 1,
                                        alignItems: 'center',
                                        flexDirection: 'row'
                                    }}
                                >
                                    <View
                                        style={{
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            width: 48,
                                            height: 32,
                                            backgroundColor: '#6671e4',
                                            borderRadius: 4
                                        }}
                                    >
                                        <Text
                                            style={{
                                                color: 'white',
                                                fontWeight: '700',
                                                fontSize: 14,
                                            }}
                                        >stripe</Text>
                                    </View>
                                    <Text
                                        style={{
                                            color: this.state.theme.textPrimaryColor,
                                            fontWeight: '500',
                                            fontSize: 17,
                                            marginLeft: 8
                                        }}
                                    >Stripe</Text>
                                </View>
                                <View style={styles.circle}>
                                    { this.state.value === 'stripe' && (<View style={styles.checkedCircle} />) }
                                </View>
                            </TouchableOpacity>
                        </View>
                        <Text
                            style={{
                                color: this.state.theme.textSecondaryColor
                            }}
                        >By clicking the confirmation button you accept the product(s) License Agreement</Text>
                        <TouchableOpacity
                            onPress={async() => {
                                try {
                                    const token = await AsyncStorage.getItem('access_token');
                                    const url = `${GLOBAL.API_URL}/purchase/${this.state.value}/authorization?api-token=${token}`
                                        ;

                                    if (await InAppBrowser.isAvailable()) {
                                        const result = await InAppBrowser.open(url, {
                                            // iOS Properties
                                            dismissButtonStyle: 'cancel',
                                            preferredBarTintColor: '#52607f',
                                            preferredControlTintColor: 'white',
                                            readerMode: false,
                                            animated: true,
                                            modalPresentationStyle: 'fullScreen',
                                            modalTransitionStyle: 'coverVertical',
                                            modalEnabled: true,
                                            enableBarCollapsing: false,
                                            // Android Properties
                                            showTitle: true,
                                            toolbarColor: '#52607f',
                                            secondaryToolbarColor: 'black',
                                            enableUrlBarHiding: true,
                                            enableDefaultShare: true,
                                            forceCloseOnRedirection: false,
                                            showInRecents: true,
                                            animations: {
                                                startEnter: 'slide_in_right',
                                                startExit: 'slide_out_left',
                                                endEnter: 'slide_in_left',
                                                endExit: 'slide_out_right'
                                            },
                                            headers: {
                                                "my-custom-header": "backend",
                                                Authorization: `Bearer ${token}`
                                            }
                                        })
                                        //Alert.alert(JSON.stringify(result))
                                    }
                                    else Linking.openURL(url)
                                } catch (error) {
                                    alert(error.message)
                                }
                            }}
                            style={{
                                marginTop: 24,
                                marginBottom: 24,
                                flex: 1,
                                padding: 16,
                                backgroundColor: this.state.theme.primaryButton.backgroundColor,
                                borderRadius: 8
                            }}
                        >
                            <Text
                                style={{
                                    fontSize: 19,
                                    fontWeight: '600',
                                    color: this.state.theme.primaryButton.textColor,
                                    textAlign: 'center'
                                }}
                            >Confirm</Text>
                        </TouchableOpacity>
                    </View>
                    }
                    {this.props.kind === 'subscription' &&
                    <View
                        style={{
                            marginLeft: 16,
                            marginRight: 16
                        }}
                    >
                        <View
                            style={{
                                flex: 1,
                                justifyContent: 'space-between',
                                alignItems: 'center',
                                flexDirection: 'row',
                                height: 64,
                                borderBottomWidth: 1,
                                borderColor: 'white',
                            }}
                        >
                            <Text
                                style={{
                                    color: this.state.theme.textPrimaryColor,
                                    fontWeight: '500',
                                    fontSize: 17
                                }}
                            >Subscription Plan: {this.props.item.title}</Text>
                            <Text
                                style={{
                                    color: this.state.theme.textPrimaryColor,
                                    fontWeight: '500',
                                    fontSize: 17
                                }}
                            >{this.props.item.currency}{this.props.item.price}</Text>
                        </View>
                        <View
                            style={{
                                flex: 1,
                                marginTop: 8,
                                marginBottom: 16
                            }}
                        >
                            <TouchableOpacity
                                onPress={() => this.setState({ value: 'paypal' })}
                                style={{
                                    flexDirection: 'row',
                                    alignItems: 'center',
                                    height: 48,
                                    justifyContent: 'space-between'
                                }}
                            >
                                <View
                                    style={{
                                        flex: 1,
                                        alignItems: 'center',
                                        flexDirection: 'row'
                                    }}
                                >
                                    <View
                                        style={{
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            width: 48,
                                            height: 32,
                                            backgroundColor: '#ffc23b',
                                            borderRadius: 4
                                        }}
                                    >
                                        <WithLocalSvg
                                            fill={this.state.theme.textSecondaryColor}
                                            width={16}
                                            height={16}
                                            asset={require('../../../assets/icons/common/paypal.svg')}
                                        />
                                    </View>
                                    <Text
                                        style={{
                                            color: this.state.theme.textPrimaryColor,
                                            fontWeight: '500',
                                            fontSize: 17,
                                            marginLeft: 8
                                        }}
                                    >PayPal</Text>
                                </View>
                                <View style={styles.circle}>
                                    { this.state.value === 'paypal' && (<View style={styles.checkedCircle} />) }
                                </View>
                            </TouchableOpacity>
                            <TouchableOpacity
                                onPress={() => this.setState({ value: 'stripe' })}
                                style={{
                                    flexDirection: 'row',
                                    alignItems: 'center',
                                    height: 48,
                                    justifyContent: 'space-between'
                                }}
                            >
                                <View
                                    style={{
                                        flex: 1,
                                        alignItems: 'center',
                                        flexDirection: 'row'
                                    }}
                                >
                                    <View
                                        style={{
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            width: 48,
                                            height: 32,
                                            backgroundColor: '#6671e4',
                                            borderRadius: 4
                                        }}
                                    >
                                        <Text
                                            style={{
                                                color: 'white',
                                                fontWeight: '700',
                                                fontSize: 14,
                                            }}
                                        >stripe</Text>
                                    </View>
                                    <Text
                                        style={{
                                            color: this.state.theme.textPrimaryColor,
                                            fontWeight: '500',
                                            fontSize: 17,
                                            marginLeft: 8
                                        }}
                                    >Stripe</Text>
                                </View>
                                <View style={styles.circle}>
                                    { this.state.value === 'stripe' && (<View style={styles.checkedCircle} />) }
                                </View>
                            </TouchableOpacity>
                        </View>
                        <Text
                            style={{
                                color: this.state.theme.textSecondaryColor
                            }}
                        >By clicking the confirmation button you accept the product(s) License Agreement</Text>


                        <TouchableOpacity
                            onPress={async() => {
                                try {
                                    const token = await AsyncStorage.getItem('access_token');
                                    const url = `${GLOBAL.API_URL}/subscription/${this.state.value}/${this.props.item.id}?api-token=${token}`;

                                    if (await InAppBrowser.isAvailable()) {
                                        const result = await InAppBrowser.open(url, {
                                            // iOS Properties
                                            dismissButtonStyle: 'cancel',
                                            preferredBarTintColor: '#52607f',
                                            preferredControlTintColor: 'white',
                                            readerMode: false,
                                            animated: true,
                                            modalPresentationStyle: 'fullScreen',
                                            modalTransitionStyle: 'coverVertical',
                                            modalEnabled: true,
                                            enableBarCollapsing: false,
                                            // Android Properties
                                            showTitle: true,
                                            toolbarColor: '#52607f',
                                            secondaryToolbarColor: 'black',
                                            enableUrlBarHiding: true,
                                            enableDefaultShare: true,
                                            forceCloseOnRedirection: false,
                                            showInRecents: true,
                                            animations: {
                                                startEnter: 'slide_in_right',
                                                startExit: 'slide_out_left',
                                                endEnter: 'slide_in_left',
                                                endExit: 'slide_out_right'
                                            },
                                            headers: {
                                                "my-custom-header": "backend",
                                                Authorization: `Bearer ${token}`
                                            }
                                        })
                                        //Alert.alert(JSON.stringify(result))
                                    }
                                    else Linking.openURL(url)
                                } catch (error) {
                                    alert(error.message)
                                }
                            }}
                            style={{
                                marginTop: 24,
                                marginBottom: 24,
                                flex: 1,
                                padding: 16,
                                backgroundColor: this.state.theme.primaryButton.backgroundColor,
                                borderRadius: 8
                            }}
                        >
                            <Text
                                style={{
                                    fontSize: 19,
                                    fontWeight: '600',
                                    color: this.state.theme.primaryButton.textColor,
                                    textAlign: 'center'
                                }}
                            >Confirm</Text>
                        </TouchableOpacity>
                    </View>
                    }
                    <TouchableOpacity style={[styles.closeButton, {backgroundColor: this.state.theme.secondaryBackgroundColor}]} onPress={() =>{ this.closeModal() }}>
                        <Text style={[styles.closeButtonText, {color: this.state.theme.textPrimaryColor}]}>{i18n.t('close')}</Text>
                    </TouchableOpacity>
                </ActionSheet>
            </View>
        );
    }
}

const styles = StyleSheet.create({
    container: {
        backgroundColor: 'rgba(0, 0, 0, .5)',
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        top: 0,
    },
    menuView: {
        position: 'absolute',
        bottom: 0,
    },
    menuItemIconView: {
        width: 30,
        height: 40,
        alignItems: 'center',
        justifyContent: 'center',
    },
    menuItemIcon: {
        marginLeft: 8,
    },
    menuTitle: {
        flex: 1,
        justifyContent: 'center',
        marginLeft: 8,
    },
    menuSubHeader: {
        fontSize: 16,
        fontWeight: '500',
        marginBottom: 4,
    },
    menuSubByline: {
        fontSize: 15,
    },
    menuItem: {
        paddingLeft: 16,
        height: 45,
        overflow: 'hidden',
        flexDirection: 'row',
        alignItems: 'center',
    },
    menuItemInfo: {
        height: 60,
        overflow: 'hidden',
        flexDirection: 'row',
    },
    menuItemImageView: {
        width: 60,
        height: 60,
        alignItems: 'center',
        justifyContent: 'center',
        marginLeft: 8
    },
    menuTitleStyle: {
        fontSize: 16,
        marginLeft: 16,
    },
    menuHeader: {
        fontSize: 14,
        marginLeft: 8,
        fontWeight: 'bold'
    },
    closeButton: {
        width: '100%',
        alignItems: 'center',
        justifyContent: 'center',
        ...ifIphoneX({
            paddingBottom: 34
        }, {
            paddingBottom: 0
        })
    },
    closeButtonText: {
        lineHeight: 45,
        fontWeight: '600',
        fontSize: 16
    },
    buttonContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 30,
    },
    circle: {
        height: 20,
        width: 20,
        borderRadius: 10,
        borderWidth: 1,
        borderColor: '#ACACAC',
        alignItems: 'center',
        justifyContent: 'center',
    },
    checkedCircle: {
        width: 12,
        height: 12,
        borderRadius: 6,
        backgroundColor: '#025EF7',
    },
});

export default connect(({routes, scroll, language, display, player, auth}) => ({routes, scroll, language, display, player, auth}))(ContextMenu);
