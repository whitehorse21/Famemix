import React, {Component} from 'react';
import {
    View,
    Text,
    KeyboardAvoidingView,
    StyleSheet,
    Platform,
    TextInput,
    TouchableOpacity,
    Image,
    Switch,
    ActivityIndicator,
    PermissionsAndroid
} from 'react-native';
import { Actions } from 'react-native-router-flux';
import { Icon } from 'native-base';
import {connect} from "react-redux";
import ImagePicker from 'react-native-image-picker';
import {ifIphoneX} from "../../helpers/ifIphoneX";
import {changeStatusBarStyle, msgShow} from "../../helpers/Functions";
import API from "../../helpers/Axios";
import {store} from "../../../store/configureStore";

const GLOBAL = require('../../../config/Global');

class EditProfile extends Component {
    static onEnter = async () => {
        changeStatusBarStyle();
    };
    constructor(props) {
        super(props);
        this.state = {
            theme: this.props.display.darkMode ? GLOBAL.themes.dark : GLOBAL.themes.light,
            userArtwork: this.props.auth.user.artwork_url,
            fullName: this.props.auth.user.name,
            email: this.props.auth.user.email,
            privateProfile: this.props.auth.user.activity_privacy === 1,
            isSaving: false
        };
    }
    async saveProfile(){
        this.setState({doSave: true});
        const data = new FormData();
        data.append('name', this.state.fullName);
        if(this.state.email !== this.props.auth.user.email) data.append('email', this.state.email);
        data.append('privateProfile', this.state.privateProfile === true ? 1 : 0);
        if(this.state.changeArtworkUrl) data.append('artwork', {
            uri: this.state.changeArtworkUrl,
            type: 'image/jpeg',
            name: 'image'
        });
        this.setState({
            isSaving:  true
        });
        API.post('auth/user/settings/profile', data)
            .then(res => {
                msgShow('success', 'Your profile has been successfully edited.');
                Actions.pop({ refresh: {user: res.data} })
                store.dispatch({type: 'UPDATE_USER_INFO', user: res.data});
            }).catch (error => {
            this.setState({
                isSaving:  false
            });
            msgShow('error', error.response.data.errors[Object.keys(error.response.data.errors)[0]][0]);
        });
    }
    editProfileArtwork = async () => {
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
                //Toast.show("Can't select image. Error: " + response.error, { position: 70, shadow: false, backgroundColor: '#b63442'});
            } else {
                this.setState({
                    changeArtworkUrl:  response.uri,
                    userArtwork:  response.uri
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
                this.editProfileArtwork();
            } else {
                alert('Camera permission denied');
            }
        } catch (err) {
            console.warn(err);
        }
    };

    componentDidMount() {

    }

    render () {
            return (
                <View style={[styles.container, {backgroundColor: this.state.theme.primaryBackgroundColor}]}>
                    <View style={[styles.nav, {borderBottomColor: this.state.theme.navBorderColor}]}>
                        <TouchableOpacity onPress={this.saveProfile} style={styles.cancelButton}>
                            <Text onPress={Actions.pop} style={{fontWeight: 'bold', color: this.state.theme.textPrimaryColor}}>Cancel</Text>
                        </TouchableOpacity>
                        {this.state.isSaving &&
                            <ActivityIndicator
                                color={this.state.theme.indicatorColor}
                                style={styles.saveButton}
                            />
                        }
                        {!this.state.isSaving &&
                            <TouchableOpacity onPress={this.saveProfile.bind(this)} style={styles.saveButton}>
                                <Text style={{fontWeight: 'bold', color: this.state.theme.textPrimaryColor}}>Save</Text>
                            </TouchableOpacity>
                        }
                        <Text style={{fontWeight: 'bold', color: this.state.theme.textPrimaryColor, textAlign: 'center'}}>Edit Profile</Text>
                    </View>
                    <KeyboardAvoidingView behavior={'padding'}>
                        <View style={styles.wrap}>
                            <View style={{marginBottom: 32, paddingRight: 90}}>
                                <Text style={{fontSize: 14, color: this.state.theme.textPrimaryColor}}>Private profile</Text>
                                <Text style={{fontSize: 12, color: this.state.theme.textSecondaryColor}}>I don't want my friends, or anyone else, to ever see my music activity or current song.</Text>
                                <Switch style={{position: 'absolute', right: 0, }}
                                        trackColor = {{false: this.state.theme.switch.falseColor, true: this.state.theme.switch.trueColor}}
                                        color={this.state.theme.switch.tintColor}
                                        thumbColor={Platform.OS === 'ios' ? false : this.state.theme.switch.thumbColor}
                                        onValueChange={(value) => this.setState({privateProfile: value})}
                                        value={this.state.privateProfile}
                                />
                            </View>

                            <View style={{flexDirection: 'row', alignItems: 'center'}}>
                                <TouchableOpacity onPress={() => {Platform.OS === 'ios' ? this.editProfileArtwork() : this.requestCameraPermission()}} style={{width: 120, height: 120, borderRadius: 60, marginRight: 8, overflow: 'hidden'}}>
                                    <Image style={{borderRadius: 60}} source={{
                                        uri: this.state.userArtwork,
                                        width: 120,
                                        height: 120
                                    }}/>
                                    <View style={styles.editIcon}>
                                        <Icon name="camera" style={{fontSize: 16}} type="SimpleLineIcons"/>
                                    </View>
                                </TouchableOpacity>
                                <View style={{flex: 1}}>
                                    <TextInput
                                        style={[styles.textInput, {borderColor: this.state.theme.textInput.borderColor, backgroundColor: this.state.theme.textInput.backgroundColor, color: this.state.theme.textInput.textColor,  marginBottom: 16}]}
                                        placeholder="Full name"
                                        onChangeText={(fullName) => this.setState({fullName})}
                                        placeholderTextColor={this.state.theme.textInput.placeholderTextColor}
                                        autoCapitalize="none"
                                        underlineColorAndroid="rgba(0,0,0,0)"
                                        onSubmitEditing={() => this.saveProfile.bind(this)}
                                        value={this.state.fullName}
                                        returnKeyType="next"
                                    />
                                    <TextInput
                                        style={[styles.textInput, {borderColor: this.state.theme.textInput.borderColor, backgroundColor: this.state.theme.textInput.backgroundColor, color: this.state.theme.textInput.textColor,  marginBottom: 16}]}
                                        placeholder="Your email"
                                        onChangeText={(email) => this.setState({email})}
                                        placeholderTextColor={this.state.theme.textInput.placeholderTextColor}
                                        autoCapitalize="none"
                                        underlineColorAndroid="rgba(0,0,0,0)"
                                        onSubmitEditing={() => this.saveProfile.bind(this)}
                                        value={this.state.email}
                                        returnKeyType="send"
                                    />
                                </View>
                            </View>
                        </View>
                    </KeyboardAvoidingView>
                </View>
            );

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
    editIcon: {
        position: 'absolute',
        bottom: 0,
        right: 0,
        left: 0,
        paddingLeft: 8,
        paddingRight: 8,
        paddingTop: 4,
        paddingBottom: 4,
        backgroundColor: 'rgba(255, 255, 255, 0.7)',
        alignItems: 'center',
        justifyContent: 'center'
    },
    wrap: {
        width: '100%',
        padding: 24
    },
    textInput: {
        height: 40,
        borderWidth: 1,
        padding: 8,
        borderRadius: 20,
        textAlign: 'center'
    },
});

export default connect(({display, auth}) => ({display, auth}))(EditProfile);
