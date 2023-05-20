import React, {Component} from 'react';
import {
  Platform,
  I18nManager,
  ActivityIndicator,
  BackHandler,
  Alert,
  YellowBox,
  PermissionsAndroid,
  KeyboardAvoidingView
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

import { connect, Provider } from 'react-redux';
import {Scene, Router, Actions, Overlay, Tabs, Modal, Stack, Lightbox} from 'react-native-router-flux';

import {store, persistor} from './engine/store/configureStore';
import { PersistGate } from 'redux-persist/lib/integration/react';
import firebase from '@react-native-firebase/app';
import NetInfo from "@react-native-community/netinfo";

import * as RNLocalize from "react-native-localize";
const RouterWithRedux = connect()(Router);
import TabIcon from "./engine/app/views/common/TabIcon";

import ArtistShow from './engine/app/views/layouts/ArtistShow';
import CartShow from './engine/app/views/layouts/CartShow';
import SongShow from './engine/app/views/layouts/SongShow';
import UserShow from './engine/app/views/layouts/UserShow';
import ArtistDetails from './engine/app/views/layouts/ArtistDetails';
import AlbumShow from './engine/app/views/layouts/AlbumShow';
import PodcastShow from './engine/app/views/layouts/PodcastShow';
import EpisodesShow from './engine/app/views/layouts/EpisodesShow';
import PlaylistShow from './engine/app/views/layouts/PlaylistShow';
import HomePage from './engine/app/views/tabs/HomePage';
import Explore from './engine/app/views/tabs/Explore';
import CollectionDetails from './engine/app/views/layouts/CollectionDetails';
import ContextMenu from './engine/app/views/common/ContextMenu';
import Discover from './engine/app/views/layouts/Discover';
import Community from './engine/app/views/tabs/Community';
import Stations from './engine/app/views/layouts/Stations';
import Genre from './engine/app/views/layouts/Genre';
import GenreDetails from './engine/app/views/layouts/GenreDetails';
import Artists from './engine/app/views/layouts/Artists';
import Users from './engine/app/views/layouts/Users';
import Profile from './engine/app/views/tabs/Profile';
import LoginModal from './engine/app/views/modal/Login';
import SongInfoModal from './engine/app/views/lightbox/SongInfo';
import AdModal from './engine/app/views/lightbox/Ad';
import UpdateInfoModal from './engine/app/views/lightbox/UpdateInfo';
import SearchPage from './engine/app/views/layouts/SearchPage';
import DownloadedPage from './engine/app/views/layouts/DownloadedPage';
import Subscriptions from './engine/app/views/profile/Subscriptions';

import RadioCategory from './engine/app/views/layouts/RadioCategory';

//user for settings tab
import Settings from './engine/app/views/layouts/SettingsPage';
import CommonPage from "./engine/app/views/settings/StaticPage";
import ChangeLanguages from "./engine/app/views/settings/Languages";

//Playlist modal, the one show up when user touch in to "Add to playlist"
import InviteCollaboratorModal from './engine/app/views/modal/InviteCollaborator';
import AddToPlaylistModal from './engine/app/views/modal/AddToPlaylist';
import PlaylistActivity from './engine/app/views/layouts/PlaylistActivity';
import SubscriptionModal from './engine/app/views/modal/SubscriptionModal';

//Import player
import BestPlayer from './engine/app/views/player/EnginePlayer';
import Notifications from './engine/app/views/profile/Notifications';
import NowPlaying from './engine/app/views/profile/NowPlaying';
import Activities from './engine/app/views/profile/Activities';

import editPlaylistModal from './engine/app/views/modal/EditPlaylist';
import editProfileModal from './engine/app/views/modal/EditProfile';
import SelectMediaModal from './engine/app/views/modal/SelectMediaModal';
import Radio from "./engine/app/views/tabs/Radio";
import Podcast from "./engine/app/views/tabs/Podcast";
import TrackPlayer from "react-native-track-player";
import {switchLanguage} from './engine/reducers/lang';
import {msgShow, pushUserStatus, checkForDownloadOffline, genUid} from './engine/app/helpers/Functions';
import API from "./engine/app/helpers/Axios";

//Get lang, theme design color from GLOBAL values
const GLOBAL = require('./engine/config/Global');

import {ifIphoneX} from "./engine/app/helpers/ifIphoneX";

const isHermes = () => global.HermesInternal != null;

console.disableYellowBox = true;

type Props = {};

export default class App extends Component<Props> {
  constructor(props) {
    super(props);
    I18nManager.forceRTL(false);
    this.state = {
      theme: store.getState().display.darkMode ? GLOBAL.themes.dark : GLOBAL.themes.light,
      activeTab: "tab_1",
      doubleBackToExitPressedOnce: false,
      allowRender: false,
      access_token: null
    };
    const unsubscribe = NetInfo.addEventListener(state => {
      if(state.isConnected) {
        store.dispatch({type: 'NET_ONLINE'});
      } else {
        store.dispatch({type: 'NET_OFFLINE'});
      }
    });
  }
  async componentWillMount(): void {
    //Get language
    let lang = await AsyncStorage.getItem('lang');
    //If there is not selected language by user before
    //Try to get user locales, it it match with lang file then use that language, else use english
    if(!lang ) {
      let locale = RNLocalize.getLocales()[0].languageCode;
      if(GLOBAL.languages.includes(locale)) lang = locale;
      else lang = GLOBAL.languages[0];
    }
    store.dispatch(switchLanguage(lang));
  }
  componentWillUnmount(): void {
    /*this.notificationDisplayedListener();
    this.notificationListener();
    this.notificationOpenedListener();
    */
  }
  async componentDidMount(): void {
    API.get('role')
        .then(res => {
          setTimeout(() => {
            store.dispatch({type: 'UPDATE_ROLE', role: res.data});
          }, 1000);
        });

    let device_key = await AsyncStorage.getItem('device_key');
    if(! device_key) {
      AsyncStorage.setItem('device_key', genUid());
    }

    let access_token = await AsyncStorage.getItem('access_token');
    if(access_token) {
      this.setState({access_token: access_token})
      API.post('auth/user')
          .then(res => {
            msgShow('success', 'Welcome back ' + res.data.name);
            store.dispatch({type: 'UPDATE_USER_INFO', user: res.data});
            pushUserStatus(res.data.username);
            this.setState({allowRender: true});
            setTimeout(async() => {
              if(Platform.OS === "android") {
                await PermissionsAndroid.check(PermissionsAndroid.PERMISSIONS.WRITE_EXTERNAL_STORAGE).then(async(response) => {
                  if(response) {
                    await checkForDownloadOffline(res.data.id)
                  }
                });
              } else {
                await checkForDownloadOffline(res.data.id);
              }
            }, 1000);

            if(res.data.should_update_dob) {
              setTimeout(async() => {
                Actions.updateInfoModal();
              }, 3000);
            }
          }).catch((error) => {
        this.setState({allowRender: true});
        AsyncStorage.setItem('access_token', '');
        setTimeout(() => {
          store.dispatch({type: 'TOGGLE_AUTH', user: {}});
        }, 1000)
      });
    }
    setTimeout(() => {
      Platform.OS === 'android' && store.dispatch({type: 'RESET_PLAYER'});
    }, 1000);
  }

  async getToken() {
    let fcmToken = await AsyncStorage.getItem('fcmToken');
    if (!fcmToken) {
      fcmToken = await firebase.messaging().getToken();
      if (fcmToken) {
        // user has a device token
        await AsyncStorage.setItem('fcmToken', fcmToken);
      }
    }
  }

  async requestPermission() {
    try {
      await firebase.messaging().requestPermission();
      // User has authorised
    } catch (error) {
      msgShow('error', 'Can not get notification permission.')
    }
  }
  routerBackAndroidHandler = async () => {
    /** Handle Android back button */
    if(store.getState().player.full === true) {
      //if player are show up, then hide the contectMenu or other modal, else hide the player
      if(Actions.currentScene === "contextMenu"){
        Actions.pop();
      } else {
        store.dispatch({type: 'TOGGLE_FULL'});
      }
      return true;
    } else {
      if(Actions.currentScene === "homePage" || Actions.currentScene === "communityPage" || Actions.currentScene === "radioPage" || Actions.currentScene === "profilePage" || Actions.currentScene === "settingsPage" ){
        //if engine at the root scene of engine and user still press back button
        let currentTrackId = await TrackPlayer.getCurrentTrack();
        if(currentTrackId !== undefined && currentTrackId) {
          //check if is playing
          Alert.alert(
              'Exit the App',
              'Song is playing! Tap Back again to exit the app.',
              [
                {text: 'Cancel', onPress: () => console.log('Cancel Pressed'), style: 'cancel'},
                {
                  text: 'Exit', onPress: () => {
                    //if not playing then exit the engine
                    BackHandler.exitApp();
                  }
                },
              ],
              {cancelable: false}
          )
        } else {
          BackHandler.exitApp();
        }

      } else {
        Actions.pop();
      }
      return true;
    }
  };
  render() {
    return (
        <Provider store={store}>
          <PersistGate loading={<ActivityIndicator color={this.state.theme.indicatorColor} style={{flex:1}}/>} persistor={persistor}>
            <KeyboardAvoidingView
                behavior={Platform.OS === 'ios' ? 'padding' : null}
                style={{
                  flex:1,
                  backgroundColor: this.state.theme.primaryBackgroundColor,
                  ...ifIphoneX({marginBottom: 84}, {marginBottom: 50}),
                }}
            >
            <Router
                backAndroidHandler={this.routerBackAndroidHandler}
                key="key0"
            >
              <Overlay key="overlay">
                <Lightbox key="lightbox">
                  <Modal
                      key="modal"
                      hideNavBar={true}
                      transparent={true}
                  >
                    <Overlay key="playerOverlay">
                      <Stack key="root">
                        <Scene
                            /** disable or enable swipe to back (only iOS supported)
                            panHandlers={null}
                            */
                            initial key="main_scene"
                            hideNavBar={true}
                        >
                          <Tabs
                              key="tabbar"
                              showLabel={false}
                              hideNavBar={true}
                              tabBarPosition={'bottom'}
                              lazy={true}
                              hideTabBar={true}
                          >
                            <Stack
                                key="tab_0"
                                tabTitleKey="explore"
                                icon={TabIcon}
                                iconName="compass"
                            >
                              <Scene
                                  key="homePage"
                                  component={HomePage}
                                  hideNavBar={true}
                                  initial
                              />
                              <Scene
                                  key="searchPage"
                                  component={SearchPage}
                                  hideNavBar={true}
                                  clone={true}
                              />
                              <Scene
                                  key="downloadedPage"
                                  component={DownloadedPage}
                                  hideNavBar={true}
                                  clone={true}
                              />
                              <Scene
                                  key="artistShow"
                                  component={ArtistShow}
                                  hideNavBar={true}
                                  clone={true}
                              />
                              <Scene
                                  key="songShow"
                                  component={SongShow}
                                  hideNavBar={true}
                                  clone={true}
                              />
                              <Scene
                                  key="cartShow"
                                  component={CartShow}
                                  hideNavBar={true}
                                  clone={true}
                              />
                              <Scene
                                  key="userShow"
                                  component={UserShow}
                                  hideNavBar={true}
                                  clone={true}
                              />
                              <Scene
                                  key="artistDetails"
                                  component={ArtistDetails}
                                  hideNavBar={true}
                                  clone={true}
                              />
                              <Scene
                                  key="genreShow"
                                  component={Genre}
                                  hideNavBar={true}
                                  clone={true}
                              />
                              <Scene
                                  key="genreDetails"
                                  component={GenreDetails}
                                  hideNavBar={true}
                                  clone={true}
                              />
                              <Scene
                                  key="artistAll"
                                  component={Artists}
                                  hideNavBar={true}
                                  clone={true}
                              />
                              <Scene
                                  key="userAll"
                                  component={Users}
                                  hideNavBar={true}
                                  clone={true}
                              />
                              <Scene
                                  key="albumShow"
                                  component={AlbumShow}
                                  hideNavBar={true}
                                  clone={true}
                              />
                              <Scene
                                  key="podcastShow"
                                  component={PodcastShow}
                                  hideNavBar={true}
                                  clone={true}
                              />
                              <Scene
                                  key="episodesShow"
                                  component={EpisodesShow}
                                  hideNavBar={true}
                                  clone={true}
                              />
                              <Scene
                                  key="playlistShow"
                                  component={PlaylistShow}
                                  hideNavBar={true}
                                  clone={true}
                              />
                              <Scene
                                  key="playlistActivity"
                                  component={PlaylistActivity}
                                  hideNavBar={true}
                                  clone={true}
                              />
                              <Scene
                                  key="discoverList"
                                  component={Discover}
                                  title="Discover"
                                  hideNavBar={true}
                              />
                              <Scene
                                  key="collectionDetails"
                                  component={CollectionDetails}
                                  hideNavBar={true}
                                  clone={true}
                              />
                              <Scene
                                  key="settingsPage"
                                  component={Settings}
                                  hideNavBar={true}
                                  clone={true}
                              />
                              <Scene
                                  key="commonPage"
                                  component={CommonPage}
                                  hideNavBar={true}
                              />
                              <Scene
                                  key="settingsLanguages"
                                  component={ChangeLanguages}
                                  hideNavBar={true}
                              />
                              <Scene
                                  key="notifications"
                                  component={Notifications}
                                  hideNavBar={true}
                                  clone={true}
                              />
                            </Stack>
                            <Stack
                                key="tab_1"
                                tabTitleKey="explode"
                                icon={TabIcon}
                                iconName="diamond"
                            >
                              <Scene
                                  key="explorePage"
                                  component={Explore}
                                  hideNavBar={true}
                                  initial
                              />
                            </Stack>
                            <Stack
                                key="tab_2"
                                tabTitleKey="community"
                                icon={TabIcon}
                                iconName="diamond"
                            >
                              <Scene
                                  key="communityPage"
                                  component={Community}
                                  hideNavBar={true}
                                  initial
                              />
                            </Stack>
                            <Stack
                                key="tab_3"
                                tabTitleKey="radio"
                                icon={TabIcon}
                                iconName="feed"
                            >
                              <Scene
                                  key="radioPage"
                                  component={Radio}
                                  hideNavBar={true}
                                  initial
                              />
                              <Scene
                                  key="radioCategory"
                                  component={RadioCategory}
                                  hideNavBar={true}
                              />
                              <Scene
                                  key="stationsAll"
                                  component={Stations}
                                  hideNavBar={true}
                              />
                            </Stack>
                            <Stack
                                key="tab_4"
                                tabTitleKey="radio"
                                icon={TabIcon}
                                iconName="feed"
                            >
                              <Scene
                                  key="podcastPage"
                                  component={Podcast}
                                  hideNavBar={true}
                                  initial
                              />
                              <Scene
                                  key="podcastCategory"
                                  component={RadioCategory}
                                  hideNavBar={true}
                              />
                              <Scene
                                  key="podcastDetails"
                                  component={Stations}
                                  hideNavBar={true}
                              />
                            </Stack>
                            <Stack
                                key="tab_5"
                                tabTitleKey="my_music"
                                icon={TabIcon}
                                iconName="music-tone-alt"
                                theme={this.state.theme}
                            >
                              <Scene
                                  key="profilePage"
                                  component={Profile}
                                  hideNavBar={true}
                              />
                              <Scene
                                  key="activities"
                                  component={Activities}
                                  hideNavBar={true}
                              />
                              <Scene
                                  key="nowPlaying"
                                  component={NowPlaying}
                                  hideNavBar={true}
                              />
                              <Scene
                                  key="subscriptions"
                                  component={Subscriptions}
                                  hideNavBar={true}
                              />
                            </Stack>
                          </Tabs>
                        </Scene>
                      </Stack>
                    </Overlay>
                    <Scene key="inviteCollaboratorModal" component={InviteCollaboratorModal}/>
                    <Scene key="addToPlaylistModal" component={AddToPlaylistModal}/>
                    <Scene key="loginModal" component={LoginModal}/>
                    <Scene key="editPlaylistModal" component={editPlaylistModal}/>
                    <Scene key="editProfileModal" component={editProfileModal}/>
                    <Scene key="selectMediaModal" component={SelectMediaModal}/>
                    <Scene key="subscriptionModal" component={SubscriptionModal}/>
                  </Modal>
                  <Scene key="contextMenu" component={ContextMenu}/>
                  <Scene key="songInfoModal" component={SongInfoModal}/>
                  <Scene key="adModal" component={AdModal}/>
                  <Scene key="updateInfoModal" component={UpdateInfoModal}/>
                </Lightbox>
              </Overlay>
            </Router>
            </KeyboardAvoidingView>
            <BestPlayer />
          </PersistGate>
        </Provider>
    );
  }
}
