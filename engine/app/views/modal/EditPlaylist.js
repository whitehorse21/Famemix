import React, {Component} from 'react';
import {
    View,
    Text,
    KeyboardAvoidingView,
    StyleSheet,
    ActivityIndicator,
    Dimensions,
    TextInput,
    TouchableOpacity,
    Animated,
    Easing,
    Image,
    PermissionsAndroid, Platform
} from 'react-native';
import i18n from 'i18n-js';
import * as Languages from '../../helpers/Lang';
import { Actions } from 'react-native-router-flux';
import { Icon } from 'native-base';
import {connect} from "react-redux";
import Toast from "react-native-root-toast";
import ImagePicker from 'react-native-image-picker';
import SortableList from 'react-native-sortable-list';

import {ifIphoneX} from "../../helpers/ifIphoneX";
import {changeStatusBarStyle, msgShow} from "../../helpers/Functions";
import API from "../../helpers/Axios";

const GLOBAL = require('../../../config/Global');
const window = Dimensions.get('window');

class EditPlaylist extends Component {
    static onEnter = async () => {
        changeStatusBarStyle();
    };
    constructor(props) {
        super(props);
        this.state = {
            theme: this.props.display.darkMode ? GLOBAL.themes.dark : GLOBAL.themes.light,
            playlistArtwork: this.props.item.artwork_url,
            changeArtworkUrl: null,
            playlistTitle: this.props.item.title,
            SongData: [],
            update: {},
            removeIds: [],
            nextOrder: [],
            isSaving: false
        };
    }
    componentWillReceiveProps(nextProps) {
        if (this.props.active !== nextProps.active) {
            Animated.timing(this._active, {
                duration: 300,
                easing: Easing.bounce,
                toValue: Number(nextProps.active),
            }).start();
        }
    }
    async saveChanges(){
        this.setState({isSaving: true});
        const data = new FormData();
        data.append('id', this.props.item.id);
        data.append('title', this.state.playlistTitle);
        data.append('visibility', 1);

        if(this.state.changeArtworkUrl) data.append('artwork', {
            uri: this.state.changeArtworkUrl,
            type: 'image/jpeg',
            name: 'image'
        });

        API.post('auth/user/playlist/edit', data)
            .then(res => {
                msgShow('success', 'Playlist has been successfully edited.');
                Actions.pop({ refresh: {playlist: res.data} })
            }).catch (error => {
            msgShow('error', error.response.data.errors[Object.keys(error.response.data.errors)[0]][0]);
        });
    }

    saveSongs(){
        const data = new FormData();
        data.append('playlistId', this.props.item.id);
        data.append('removeIds', JSON.stringify(this.state.removeIds));
        data.append('nextOrder', JSON.stringify(this.state.nextOrder));

        API.post('auth/user/managerPlaylist', data)
            .then(res => {
                Actions.pop({ refresh: {songs: res.data} });
            }).catch (error => {
            msgShow('error', error.response.data.errors[Object.keys(error.response.data.errors)[0]][0]);
        });
    }

    playlistArtworkPickup(){
        const options = {
            title: 'Select a image',
            storageOptions: {
                skipBackup: true,
                path: 'images',
            },
        };
        ImagePicker.showImagePicker(options, async(response) => {
            if (response.didCancel) {
                console.log('User cancelled image picker');
            } else if (response.error) {
                Toast.show("Can't select image. Error: " + response.error, { position: 70, shadow: false, backgroundColor: '#b63442'});
            } else {
                this.setState({
                    changeArtworkUrl:  response.uri,
                    playlistArtwork:  response.uri
                });
            }
        });
    }

    requestCameraPermission = async () => {
        try {
            const granted = await PermissionsAndroid.request(
                PermissionsAndroid.PERMISSIONS.CAMERA,
                {
                    title: `${GLOBAL.APP_NAME} Camera Permission`,
                    message:
                        `${GLOBAL.APP_NAME} needs access to your camera ` +
                        "so you can take awesome pictures.",
                    buttonNeutral: "Ask Me Later",
                    buttonNegative: "Cancel",
                    buttonPositive: "OK"
                }
            );
            if (granted === PermissionsAndroid.RESULTS.GRANTED) {
                this.playlistArtworkPickup();
            } else {
                alert('Camera permission denied');
            }
        } catch (err) {
            console.warn(err);
        }
    };

    componentDidMount() {
        API.get('playlist/' + this.props.item.id)
            .then(res => {
                this.setState({
                    isLoading: false,
                    SongData: res.data.songs,

                });
            });
    }
    removeSong(id) {
        const update = {};
        update['indicator_' + id] = true;
        this.setState(update);
        let removeIds = this.state.removeIds;
        removeIds.push(id);
        this.setState({removeIds: removeIds})
    }
    addSong(id) {
        const update = {};
        update['indicator_' + id] = false;
        this.setState(update);
        let removeIds = this.state.removeIds;
        for( let i = 0; i < removeIds.length; i++){
            if ( removeIds[i] === id) {
                removeIds.splice(i, 1);
            }
        }
        this.setState({removeIds: removeIds})
    }
    onChangeOrder(nextOrder){
        let songOrder = [];
        for(let i=0; i < nextOrder.length; i++){
            songOrder.push(this.state.SongData[nextOrder[i]].id)
        }
        this.setState({nextOrder: songOrder})
    }
    _renderRow = ({data, active}) => {
        if(data.title) return (
            <Animated.View style={[styles.row, {backgroundColor: active ? '#8cb52d'  : this.state.theme.primaryBackgroundColor} ]}>
                <View style={{flex: 1, flexDirection: 'row', alignItems: 'center', marginRight: 50, opacity: this.state['indicator_' + data.id] === true ? .2 : 1}}>
                    <Image source={{uri: data.artwork_url}} style={styles.image} />
                    <View style={{flex: 1}}>
                        <Text style={[{fontSize: 14, fontWeight: 'bold', color: active ? '#fff' : this.state.theme.textPrimaryColor}]} numberOfLines={1}>{data.title}</Text>
                        <Text style={[{fontSize: 14, color: active ? '#fff' : this.state.theme.textSecondaryColor, marginTop: 4}]} numberOfLines={1}>{data.artists.map(function (artist) {return artist.name }).join(", ")}</Text>
                    </View>
                </View>

                {!active && this.state['indicator_' + data.id] !== true && (
                    <TouchableOpacity onPress={() => {this.removeSong(data.id)}} style={{width: 24, marginRight: 8}}>
                        <Icon name="ios-remove-circle" style={{fontSize: 24, color: '#e23137'}} type="Ionicons"/>
                    </TouchableOpacity>
                )}
                {!active && this.state['indicator_' + data.id] === true && (
                    <TouchableOpacity onPress={() => {this.addSong(data.id)}} style={{width: 24, marginRight: 8}}>
                        <Icon name="ios-add-circle" style={{fontSize: 24, color: '#58d369'}} type="Ionicons"/>
                    </TouchableOpacity>
                )}
            </Animated.View>
        );
    };
    renderSortableList(){
        if(this.state.SongData.length) return (
            <SortableList
                style={styles.list}
                contentContainerStyle={styles.contentContainer}
                data={this.state.SongData}
                renderRow={this._renderRow}
                onChangeOrder={this.onChangeOrder.bind(this)}
            />
        )
    }
    render () {
        i18n.locale = this.props.lang;
        i18n.fallbacks = true;
        i18n.translations = Languages;

        if (this.props.edit === 'info') {
            return (
                <View style={[styles.container, {backgroundColor: this.state.theme.primaryBackgroundColor}]}>
                    <View style={[styles.nav, {borderBottomColor: this.state.theme.navBorderColor,}]}>
                        <TouchableOpacity onPress={Actions.pop} style={styles.cancelButton}>
                            <Text onPress={Actions.pop} style={{fontWeight: 'bold', color: this.state.theme.textPrimaryColor}}>{i18n.t('cancel')}</Text>
                        </TouchableOpacity>
                        {this.state.isSaving && (<ActivityIndicator style={styles.saveButton}/>)}
                        {! this.state.isSaving && (
                            <TouchableOpacity onPress={this.saveChanges.bind(this)} style={styles.saveButton}>
                                <Text style={{fontWeight: 'bold', color: this.state.theme.textPrimaryColor}}>{i18n.t('save')}</Text>
                            </TouchableOpacity>
                        )}

                        <Text style={{fontWeight: 'bold', color: this.state.theme.textPrimaryColor, textAlign: 'center'}}>{i18n.t('edit_playlist')}</Text>
                    </View>
                    <KeyboardAvoidingView behavior={'padding'}>
                        <View style={styles.wrap}>
                            <TouchableOpacity onPress={() => {
                                Platform.OS === 'ios' ? this.playlistArtworkPickup() : this.requestCameraPermission();
                            }} style={{width: 120, height: 120, marginBottom: 50}}>
                                <Image style={{borderRadius: 3}} source={{
                                    uri: this.state.playlistArtwork,
                                    width: 120,
                                    height: 120
                                }}/>
                                <View style={styles.editArtworkIcon}>
                                    <Icon name="camera" style={{fontSize: 12}} type="SimpleLineIcons"/>
                                    <Text style={{fontSize: 12, marginLeft: 8}}>{i18n.t('edit')}</Text>
                                </View>
                            </TouchableOpacity>
                            <TextInput
                                style={[styles.textInput, {borderColor: this.state.theme.textInput.borderColor, backgroundColor: this.state.theme.textInput.backgroundColor, color: this.state.theme.textInput.textColor,  marginBottom: 16}]}
                                placeholder="Playlist name"
                                onChangeText={(playlistTitle) => this.setState({playlistTitle})}
                                placeholderTextColor={this.state.theme.textInput.placeholderTextColor}
                                autoCapitalize="none"
                                underlineColorAndroid="rgba(0,0,0,0)"
                                onSubmitEditing={() => this.saveChanges}
                                value={this.state.playlistTitle}
                                returnKeyType="send"
                            />
                        </View>
                    </KeyboardAvoidingView>
                </View>
            );
        } else if (this.props.edit === 'songs') {
            return (
                <View style={[styles.container, {backgroundColor: this.state.theme.primaryBackgroundColor}]}>
                    <View style={[styles.nav, {borderBottomColor: this.state.theme.navBorderColor}]}>
                        <TouchableOpacity onPress={Actions.pop} style={styles.cancelButton}>
                            <Text style={{fontWeight: 'bold', color: this.state.theme.textPrimaryColor}}>{i18n.t('cancel')}</Text>
                        </TouchableOpacity>
                        <TouchableOpacity onPress={this.saveSongs.bind(this)} style={styles.saveButton}>
                            <Text style={{fontWeight: 'bold', color: this.state.theme.textPrimaryColor}}>{i18n.t('save')}</Text>
                        </TouchableOpacity>
                    </View>
                    { this.renderSortableList() }
                </View>
            )
        }
    }
}
const styles = StyleSheet.create({
    container: {
        ...ifIphoneX({
            paddingTop: 30
        }, {
            paddingTop: 20,
        }),
        flex: 1,
        alignItems: 'center',
    },
    nav: {
        flexDirection: 'row',
        width: '100%',
        borderBottomWidth: 1,
        height: 50,
        alignItems: 'center',
        justifyContent: 'center'
    },
    cancelButton: {
        position: 'absolute',
        left: 16,
        height: 50,
        alignItems: 'center',
        justifyContent: 'center'
    },
    saveButton: {
        position: 'absolute',
        right: 16,
        height: 50,
        alignItems: 'center',
        justifyContent: 'center'
    },
    wrap: {
        width: '100%',
        marginTop: 90,
        alignItems: 'center'
    },
    textInput: {
        height: 40,
        borderWidth: 1,
        padding: 8,
        borderRadius: 20,
        textAlign: 'center',
        width: 300
    },
    editArtworkIcon: {
        position: 'absolute',
        flexDirection: 'row',
        bottom: 0,
        right: 0,
        paddingLeft: 8,
        paddingRight: 8,
        paddingTop: 4,
        paddingBottom: 4,
        backgroundColor: 'rgba(255, 255, 255, 0.7)',
        borderTopLeftRadius: 3,
        borderBottomRightRadius: 3,
        alignItems: 'center',
        justifyContent: 'center'
    },
    title: {
        fontSize: 20,
        paddingVertical: 20,
        color: '#999999',
    },

    list: {
        flex: 1,
    },

    contentContainer: {
        width: window.width,
    },

    row: {
        flexDirection: 'row',
        alignItems: 'center',
        height: 70,
        width: window.width,
        paddingLeft: 8
    },

    image: {
        width: 50,
        height: 50,
        marginRight: 8,
        borderRadius: 3,
    },

    text: {
        fontSize: 14,
        color: '#222222',
        fontWeight: 'bold'
    },


});

export default connect(({routes, scroll, language, display, player, auth}) => ({routes, scroll, language, display, player, auth}))(EditPlaylist);
