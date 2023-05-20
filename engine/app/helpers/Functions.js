import {Alert, Platform, StatusBar} from "react-native";
import AsyncStorage from '@react-native-async-storage/async-storage';
import {playerQueueChange} from '../../store/Constants';
import {store} from '../../store/configureStore';
import Toast from "react-native-root-toast";
import { Actions } from 'react-native-router-flux';
import API from "./Axios";
import database from '@react-native-firebase/database';
import RNFetchBlob from "rn-fetch-blob";

const GLOBAL = require('../../config/Global');

function changeStatusBarStyle(): void {
    if(store.getState().display.darkMode) {
        StatusBar.setBarStyle(GLOBAL.themes.dark.defaultStatusBar, false);
        Platform.OS === 'android' && StatusBar.setBackgroundColor(GLOBAL.themes.dark.androidStatusBarColor);
    } else {
        StatusBar.setBarStyle(GLOBAL.themes.light.defaultStatusBar, false);
        Platform.OS === 'android' && StatusBar.setBackgroundColor(GLOBAL.themes.light.androidStatusBarColor);
    }
    Platform.OS === 'android' && StatusBar.setTranslucent(true);
}

function artistStation(artistId): void {
    msgShow('success', 'Please wait...');
    API.get('artist/' + artistId)
        .then(res => {
            AsyncStorage.setItem('SongToPlay', JSON.stringify(res.data.songs));
            let playerAction = {
                id: 0,
                action: 4,
            };
            AsyncStorage.setItem('PlayerAction', JSON.stringify(playerAction));
            store.dispatch(playerQueueChange(true));
        });
}

function userStation(username): void {
    msgShow('success', 'Please wait...');
    API.get('profile/' + username + '/collection')
        .then(res => {
            AsyncStorage.setItem('SongToPlay', JSON.stringify(res.data.songs));
            let playerAction = {
                id: 0,
                action: 4,
            };
            AsyncStorage.setItem('PlayerAction', JSON.stringify(playerAction));
            store.dispatch(playerQueueChange(true));
        });
}

function shufflePlay(items) {
    if(items.length) {
        AsyncStorage.setItem('SongToPlay', JSON.stringify(items));
        let playerAction = {
            id: 0,
            action: 3,
        };
        AsyncStorage.setItem('PlayerAction', JSON.stringify(playerAction));
        store.dispatch(playerQueueChange(true));
    }
}

function playSong(item) {
    if(item.streamable) {
        let SongToPlay = [];
        SongToPlay.push(item);
        AsyncStorage.setItem('SongToPlay', JSON.stringify(SongToPlay));
        let playerAction = {
            id: item.id,
            action: 0,
        };
        AsyncStorage.setItem('PlayerAction', JSON.stringify(playerAction));
        store.dispatch(playerQueueChange(true));
    } else {
        Actions.loginModal();
    }
}

function playStation(item) {
    let SongToPlay = [];
    SongToPlay.push(item);
    AsyncStorage.setItem('SongToPlay', JSON.stringify(SongToPlay));
    let playerAction = {
        id: item.id,
        action: 6,
    };
    AsyncStorage.setItem('PlayerAction', JSON.stringify(playerAction));
    store.dispatch(playerQueueChange(true));
}
function addToQueue(items, pos) {
    if(items.length) {
        AsyncStorage.setItem('SongToPlay', JSON.stringify(items));
        let playerAction = {
            id: 0,
            action: pos,
        };
        AsyncStorage.setItem('PlayerAction', JSON.stringify(playerAction));
        store.dispatch(playerQueueChange(false));
    }
}

async function addToPlaylist(playlistId, playlistName, objectName, objectType, objectId): void {
    const data = new FormData();
    data.append('mediaType', objectType);
    data.append('mediaId', objectId);
    data.append('playlist_id', playlistId);

    if(objectType === 'queue'){
        let QueueList = JSON.parse(await AsyncStorage.getItem('QueueList'));
        let songIds = [];
        for(let i=0; i < QueueList.length; i++){
            songIds.push(QueueList[i].id)
        }
        data.append('mediaItems', songIds.toString());
    }

    API.post('auth/user/addToPlaylist', data)
        .then(res => {
            msgShow('success', objectName + ' added to ' + playlistName);
        }).catch (error => {
        msgShow('error', error.response.data.errors[Object.keys(error.response.data.errors)[0]][0]);
    });
}

function msgShow(type, message){
    if(type === 'success'){
        Toast.show(message, {
            position: 100,
            shadow: false,
            backgroundColor: '#36383d'
        });
    } else if(type === 'error'){
        Toast.show(message, {
            position: 100,
            shadow: false,
            backgroundColor: '#b63442'
        });
    }
}

async function doFavorite(type, item, action) {
    if(store.getState().auth.isLogged) {
        const data = {
            id: item.id,
            object_type: type,
            action: action
        };
        console.log(data);
        API.post('auth/user/favorite', data)
            .then(res => {
                if(type === 'playlist') {
                    if(action) {
                        msgShow('success', `You have successfully subscribed to ${item.title}.`);
                    } else {
                        msgShow('success', `You have successfully unsubscribed to ${item.title}.`);
                    }
                } else if(type === 'song') {
                    if(action) {
                        msgShow('success', `Song successfully added!`);
                    } else {
                        msgShow('success', `Song successfully removed.`);
                    }
                } else if(type === 'artist') {
                    if(action) {
                        msgShow('success', `You are now following ${item.name}.`);
                    }
                } else if(type === 'user') {
                    if(action) {
                        msgShow('success', `You are now following ${item.name}.`);
                    }
                }
                store.dispatch({type: 'PROFILE_CHANGES'});
            })
    }else {
        noLoginAlert();
    }
}

function noLoginAlert() {
    Alert.alert(
        'Login',
        'You have to login to do this action',
        [
            {text: 'Cancel', onPress: () => console.log('Cancel Pressed'), style: 'cancel'},
            {
                text: 'Login', onPress: () => {
                    Actions.loginModal({location: 'Song', lang: this.state.lang});
                }
            },
        ],
        {cancelable: false}
    )
}

function pushUserStatus(username) {
    let myConnectionsRef = database().ref('users/' + username + '/connections');
    let lastOnlineRef = database().ref('users/' + username + '/lastOnline');
    let playingQueueRef = database().ref('users/' + username + '/queue');
    let connectedRef = database().ref('.info/connected');
    connectedRef.on('value', function(snap) {
        if (snap.val() === true) {
            let con = myConnectionsRef.push();
            con.onDisconnect().remove();
            con.set(true);
            lastOnlineRef.onDisconnect().set(database.ServerValue.TIMESTAMP);
            playingQueueRef.onDisconnect().set(null);
        }
    });
}

function setUserDisconnect(username) {
    let myConnectionsRef = database().ref('users/' + username + '/connections');
    myConnectionsRef.set(null);
    let lastOnlineRef = database().ref('users/' + username + '/lastOnline');
    lastOnlineRef.set(database.ServerValue.TIMESTAMP);
}

function writeUserQueue (username, currentId, queueIds) {
    database().ref('users/' + username + '/queue').set({
        currentId: currentId,
        queueIds : queueIds
    });
}

function clearUserQueue (username) {
    database().ref('users/' + username + '/queue').set(null);
}

function readUserQueue (username) {
    var queue = database().ref('users/' + username + '/queue');
    queue.on('value', function(snapshot) {
        var data = snapshot.val();

    });
}

function timeSince(timeStamp) {
    let now = new Date(),
        secondsPast = (now.getTime() - timeStamp) / 1000;
    if(secondsPast < 60){
        //return parseInt(secondsPast) + 's';
        return '1m';
    }
    if(secondsPast < 3600){
        return parseInt(secondsPast/60) + 'm';
    }
    if(secondsPast <= 86400){
        return parseInt(secondsPast/3600) + 'h';
    }
    if(secondsPast > 86400){
        timeStamp = new Date(timeStamp);
        let day = timeStamp.getDate();
        let month = timeStamp.toDateString().match(/ [a-zA-Z]*/)[0].replace(" ","");
        let year = timeStamp.getFullYear() === now.getFullYear() ? "" :  " "+timeStamp.getFullYear();
        return day + 'd';
    }
}

function handleCloudNotificationClick(object_type, data) {
    let object_id = data[object_type];
    API.get(object_type + '/' + object_id)
        .then(res => {
            if(object_type === 'song'){

            } else if(object_type === 'artist') {

            } else if(object_type === 'album') {

            } else if(object_type === 'playlist') {

            }
        });
}
function humanTime(duration) {
    var hrs = ~~(duration / 3600);
    var mins = ~~((duration % 3600) / 60);
    var secs = ~~duration % 60;
    var ret = "";
    if (hrs > 0) {
        ret += "" + hrs + ":" + (mins < 10 ? "0" : "");
    }
    ret += "" + mins + ":" + (secs < 10 ? "0" : "");
    ret += "" + secs;
    return ret;
}

function overviewCart() {
    API.post('cart/overview')
        .then(res => {
            store.dispatch({type: 'UPDATE_CART', cart: res.data});
        }).catch (error => {
        msgShow('error', error.response.data.errors[Object.keys(error.response.data.errors)[0]][0]);
    });
}

function addToCart(orderable_type, orderable_id) {
    const data = new FormData();
    data.append('orderable_type', orderable_type);
    data.append('orderable_id', orderable_id);

    API.post('cart/add', data)
        .then(res => {
            msgShow('success', 'Added item to cart.');
            store.dispatch({type: 'UPDATE_CART', cart: res.data});
        }).catch (error => {
        msgShow('error', error.response.data.errors[Object.keys(error.response.data.errors)[0]][0]);
    });
}

function removeFromCart(id) {
    const data = new FormData();
    data.append('id', id);

    API.post('cart/remove', data)
        .then(res => {
            msgShow('success', 'Removed item from cart.');
            Actions.refresh({key: Math.random()});
            store.dispatch({type: 'UPDATE_CART', cart: res.data});
        }).catch (error => {
        msgShow('error', error.response.data.errors[Object.keys(error.response.data.errors)[0]][0]);
    });
}

function genUid() {
    return genHash() + genHash() + '-' + genHash() + '-' + genHash() + '-' +
        genHash() + '-' + genHash() + genHash() + genHash();
}

function genHash() {
    return Math.floor((1 + Math.random()) * 0x10000)
        .toString(16)
        .substring(1);
}

async function checkForDownloadOffline(user_id) {
    const token = await AsyncStorage.getItem('access_token');
    const device_key = await AsyncStorage.getItem('device_key');
    var offlineSongListRef = await database().ref(`offline/${user_id}/${device_key}/songs`).orderByChild('downloaded').equalTo(0).limitToFirst(1);
    offlineSongListRef.on('value', (snapshot) => {
        snapshot.forEach(async (childSnapshot) => {
            var item = childSnapshot.val();
            if(! item.downloaded) {
                if(Platform.OS === 'android') {
                    /**
                            "CacheDir": "/data/user/0/com.musicengine/cache",
                            "DCIMDir": "/storage/emulated/0/DCIM",
                            "DocumentDir": "/data/user/0/com.musicengine/files",
                            "DownloadDir": "/storage/emulated/0/Download",
                            "LibraryDir": undefined,
                            "MainBundleDir": "/data/user/0/com.musicengine",
                            "MovieDir": "/storage/emulated/0/Movies",
                            "MusicDir": "/storage/emulated/0/Music",
                            "PictureDir": "/storage/emulated/0/Pictures",
                            "SDCardApplicationDir": "/storage/emulated/0/Android/data/com.musicengine",
                            "SDCardDir": "/storage/emulated/0"
                     */
                    RNFetchBlob
                        .config({
                            addAndroidDownloads : {
                                useDownloadManager : true,
                                notification : true,
                                title : item.title,
                                mime : 'audio/mpeg',
                                description : 'Downloading',
                                path: RNFetchBlob.fs.dirs.SDCardApplicationDir + "/" + item.title + ".mp3"
                            }
                        })
                        .fetch(
                            'GET',
                            `${GLOBAL.API_URL}/song/download/offline/${item.id}`,
                            {
                                Authorization: `Bearer ${token}`
                            }
                        )
                        .then(async (resp) => {
                            if(resp.path()) {
                                console.log(resp.path());
                                await database()
                                    .ref(`offline/${user_id}/${device_key}/songs/${childSnapshot.key}`)
                                    .update({
                                        downloaded: 1,
                                        stream_url: resp.path()
                                    });
                            } else {
                                msgShow('error', 'Can\'t download, please try again.');
                            }
                        });
                } else {
                    let file_name = genUid() + '.mp3';
                    RNFetchBlob.config({
                        fileCache: true,
                        appendExt: 'mp3',
                        path: RNFetchBlob.fs.dirs.DocumentDir + "/" + file_name
                    }).fetch(
                        'GET',
                        `${GLOBAL.API_URL}/song/download/offline/${item.id}`,
                        {
                            Authorization: `Bearer ${token}`
                        }
                    ).progress({ count: 1 }, (received, total) => {
                        //msgShow('error', Math.floor(received / total * 100))
                    }).then(async (res) => {
                        if(res.path()) {
                            console.log(res.path());
                            await database()
                                .ref(`offline/${user_id}/${device_key}/songs/${childSnapshot.key}`)
                                .update({
                                    downloaded: 1,
                                    stream_url: res.path()
                                });
                            msgShow('success', `${item.title} has been downloaded.`);
                        } else {
                            msgShow('error', `${item.title} can't be downloaded. Please try again later.`);
                        }
                    });
                }
            }
        });
    });
}

export {
    changeStatusBarStyle,
    shufflePlay,
    playSong,
    msgShow,
    doFavorite,
    addToPlaylist,
    noLoginAlert,
    artistStation,
    addToQueue,
    playStation,
    userStation,
    pushUserStatus,
    writeUserQueue,
    readUserQueue,
    clearUserQueue,
    setUserDisconnect,
    timeSince,
    handleCloudNotificationClick,
    humanTime,
    overviewCart,
    addToCart,
    removeFromCart,
    genUid,
    checkForDownloadOffline
};
