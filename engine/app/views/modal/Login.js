import React, {Component} from 'react';
import {
    View,
    Text,
    KeyboardAvoidingView,
    StyleSheet,
    Platform,
    TextInput,
    TouchableOpacity,
    TouchableWithoutFeedback,
    Keyboard,
    ActivityIndicator,
    Linking, ScrollView,
} from 'react-native';
import { AppleButton } from '@invertase/react-native-apple-authentication';

import AsyncStorage from '@react-native-async-storage/async-storage';
import i18n from 'i18n-js';
import * as Languages from '../../helpers/Lang';
import { Actions } from 'react-native-router-flux';
import {connect} from "react-redux";
import {ifIphoneX} from "../../helpers/ifIphoneX";
import {changeStatusBarStyle, msgShow} from "../../helpers/Functions";
import { InAppBrowser } from 'react-native-inappbrowser-reborn';
import { appleAuth } from '@invertase/react-native-apple-authentication';
const GLOBAL = require('../../../config/Global');
import API from '../../helpers/Axios';
import {SvgXml, WithLocalSvg} from "react-native-svg";
import {store} from '../../../store/configureStore';
import BottomMargin from '../common/BottomMargin';

class Login extends Component {
    static onEnter = async () => {
        changeStatusBarStyle();
    };
    constructor(props) {
        super(props);
        this.state = {
            login: true,
            theme: this.props.display.darkMode ? GLOBAL.themes.dark : GLOBAL.themes.light,
            username: null,
            name: null,
            password: null,
            email: null,
            loginPressed: false,
            registerPressed: false,
            success: false,
            isKeyboard: false
        };
    }
    componentWillMount () {
        this.keyboardDidShowListener = Keyboard.addListener('keyboardDidShow', this._keyboardDidShow.bind(this));
        this.keyboardDidHideListener = Keyboard.addListener('keyboardDidHide', this._keyboardDidHide.bind(this));
    }

    componentWillUnmount () {
        this.keyboardDidShowListener.remove();
        this.keyboardDidHideListener.remove();
    }

    _keyboardDidShow () {
        this.setState({isKeyboard: true});
    }

    _keyboardDidHide () {
        this.setState({isKeyboard: false});
    }
    onCreateAccount() {
        this.setState({registerPressed: true});

        let name = this.state.name;
        let username = this.state.username;
        let password = this.state.password;
        let email = this.state.email;

        const data = new FormData();
        data.append('name', name);
        data.append('username', username);
        data.append('email', email);
        data.append('password', password);
        data.append('password_confirmation', password);
        API.post('auth/signup', data)
            .then(res => {
                AsyncStorage.setItem('access_token', res.data.access_token);
                API.post('auth/user')
                    .then(res => {
                        AsyncStorage.setItem('user', JSON.stringify(res.data));
                        Actions.pop();
                        this.props.dispatch({type: 'TOGGLE_AUTH', user: res.data});
                        if(res.data.should_update_dob) {
                            setTimeout(async() => {
                                Actions.updateInfoModal();
                            }, 3000);
                        }
                    });
                API.get('role')
                    .then(res => {
                        store.dispatch({type: 'UPDATE_ROLE', role: res.data});
                    });
            }).catch (error => {
            msgShow('error', error.response.data.errors[Object.keys(error.response.data.errors)[0]][0]);
            this.setState({registerPressed: false});
        });
    }

    onTokenReturn(access_token) {
        this.setState({success: true});
        msgShow('success', 'Login success, please hold on..');
        AsyncStorage.setItem('access_token', access_token);
        API.post('auth/user')
            .then(res => {
                this.props.dispatch({type: 'TOGGLE_AUTH', user: res.data});
                setTimeout(() => {
                    Actions.pop();
                }, 1000);
                if(res.data.should_update_dob) {
                    setTimeout(async() => {
                        Actions.updateInfoModal();
                    }, 3000);
                }
            }).catch(error => {
            console.log(error.response.data)
        });
        API.get('role')
            .then(res => {
                store.dispatch({type: 'UPDATE_ROLE', role: res.data});
            });
    }

    async redirectToService(service) {
        const url = `${GLOBAL.API_URL.replace('/api', '')}/connect/redirect/${service}`
        try {
            if (InAppBrowser.isAvailable()) {
                InAppBrowser.openAuth(url, '', {
                    ephemeralWebSession: false,
                    showTitle: false,
                    enableUrlBarHiding: true,
                    enableDefaultShare: false,
                    forceCloseOnRedirection: false
                }).then((response) => {
                    console.log(response);
                    if (response.type === 'success' && response.url) {
                        if(response.url.includes('login/success')) {
                            let token = response.url.replace(GLOBAL.DEEP_LINK_SCHEME + '://engine/login/success/', '');
                            console.log(token);
                            this.onTokenReturn(token);
                        } else {
                            AsyncStorage.setItem('access_token', '');
                            msgShow('error', `Your ${service} has been associated with another account.`);
                        }
                        Linking.openURL(response.url);
                    }
                })
            } else {
                alert('Can not use in-app browser.');
            }
        } catch (error) {
            alert('Please use login by username and password.');
        }
    }

    async signInWithApple() {
        const appleAuthRequestResponse = await appleAuth.performRequest({
            requestedOperation: appleAuth.Operation.LOGIN,
            requestedScopes: [appleAuth.Scope.EMAIL, appleAuth.Scope.FULL_NAME],
        });

        // get current authentication state for user
        // /!\ This method must be tested on a real device. On the iOS simulator it always throws an error.
        const credentialState = await appleAuth.getCredentialStateForUser(appleAuthRequestResponse.user);

        // use credentialState response to ensure the user is authenticated
        if (credentialState === appleAuth.State.AUTHORIZED) {
            alert(JSON.stringify(appleAuthRequestResponse));
        }
    }

    onLoginPress(){
        this.setState({loginPressed: true});
        let username = this.state.username;
        let password = this.state.password;
        const loginData = {
            username: username,
            password: password,
            remember_me: 1
        };
        API.post('auth/login', loginData)
            .then(res => {
                this.onTokenReturn(res.data.access_token);
            }).catch (error => {
            msgShow('error', error.response.data.errors[Object.keys(error.response.data.errors)[0]][0]);
            this.setState({loginPressed: false});
        });
    }

    render () {
        i18n.locale = this.props.lang;
        i18n.fallbacks = true;
        i18n.translations = Languages;

        if(this.state.success) {
            return (<ActivityIndicator color={this.state.theme.indicatorColor} style={{flex:1, backgroundColor: this.state.theme.primaryBackgroundColor}}/>)
        }

        if(! this.state.success) {
            if (this.state.login) {
                return (
                    <View style={[styles.container, {backgroundColor: this.state.theme.primaryBackgroundColor}]}>
                        <TouchableOpacity
                            style={styles.headerClose}
                            onPress={Actions.pop}
                        >
                            <WithLocalSvg
                                width={16}
                                height={16}
                                asset={
                                    require('../../../assets/icons/common/cancel.svg')
                                }
                                fill={this.state.theme.textSecondaryColor}
                            />
                        </TouchableOpacity>
                        <ScrollView
                            style={{
                                paddingTop: 72,
                                flex: 1,
                            }}
                        >
                            <View
                                style={{
                                    flex: 1,
                                    justifyContent: 'center',
                                    alignContent: 'center',
                                    flexDirection: 'row',
                                    marginBottom: 32
                                }}
                            >
                                <View style={styles.wrap}>
                                    <Text
                                        style={[styles.login_header, {color: this.state.theme.textPrimaryColor}]}>{i18n.t('login_header_text')}</Text>
                                    <View style={{
                                        marginBottom: 8
                                    }}>
                                        <Text style={[{color: this.state.theme.textPrimaryColor, fontWeight: 'bold'}]}>Email
                                            or username</Text>
                                        <TextInput
                                            style={[styles.textInput, {
                                                borderColor: this.state.theme.textInput.borderColor,
                                                backgroundColor: this.state.theme.textInput.backgroundColor,
                                                color: this.state.theme.textInput.textColor,
                                                marginBottom: 16
                                            }]}
                                            placeholder={i18n.t('your_username')}
                                            onChangeText={(username) => this.setState({username})}
                                            placeholderTextColor={this.state.theme.textInput.placeholderTextColor}
                                            autoCapitalize="none"
                                            underlineColorAndroid="rgba(0,0,0,0)"
                                            returnKeyType="next"
                                            onSubmitEditing={() => this.refs.txtPassword.focus()}
                                            autoCorrect={false}
                                        />
                                    </View>
                                    <View style={{}}>
                                        <Text style={[{
                                            color: this.state.theme.textPrimaryColor,
                                            fontWeight: 'bold'
                                        }]}>Password</Text>
                                        <TextInput
                                            style={[styles.textInput, {
                                                borderColor: this.state.theme.textInput.borderColor,
                                                backgroundColor: this.state.theme.textInput.backgroundColor,
                                                color: this.state.theme.textInput.textColor,
                                                marginBottom: 16
                                            }]}
                                            placeholder={i18n.t('your_password')}
                                            onChangeText={(password) => this.setState({password})}
                                            placeholderTextColor={this.state.theme.textInput.placeholderTextColor}
                                            autoCapitalize="none"
                                            secureTextEntry={true}
                                            underlineColorAndroid="rgba(0,0,0,0)"
                                            returnKeyType="go"
                                            ref={"txtPassword"}
                                            onSubmitEditing={() => this.onLoginPress()}
                                        />
                                    </View>
                                    <View style={styles.login_regiter_button}>
                                        <TouchableOpacity style={styles.loginButton} onPress={() => {
                                            !this.state.loginPressed && this.onLoginPress();
                                        }}>
                                            {!this.state.loginPressed &&
                                            <Text style={styles.loginButtonText}>{i18n.t('sign_in')}</Text>}
                                            {this.state.loginPressed &&
                                            <ActivityIndicator color={this.state.theme.indicatorColor}/>}
                                        </TouchableOpacity>
                                    </View>

                                    <View style={{
                                        flexDirection: 'row',
                                        justifyContent: 'center',
                                        alignItems: 'center',
                                        marginTop: 24,
                                        marginBottom: 24
                                    }}>
                                        <View
                                            style={{
                                                height: 1,
                                                backgroundColor: this.state.theme.navBorderColor,
                                                flex: 1
                                            }}
                                        />
                                        <Text
                                            style={{
                                                paddingLeft: 4,
                                                paddingRight: 4,
                                                color: this.state.theme.textSecondaryColor,
                                                fontWeight: 'bold'
                                            }}
                                        >OR</Text>
                                        <View
                                            style={{
                                                height: 1,
                                                backgroundColor: this.state.theme.navBorderColor,
                                                flex: 1
                                            }}
                                        />
                                    </View>
                                    {GLOBAL.SIGN_IN_WITH_FACEBOOK &&
                                    <TouchableOpacity
                                        onPress={() => {this.redirectToService('facebook')}}
                                    >
                                        <View style={[styles.facebookLoginButton, {backgroundColor: "#4267b1"}]}>
                                            <WithLocalSvg
                                                fill={'white'}
                                                style={{
                                                    width: 16,
                                                    height: 16,
                                                    position: 'absolute',
                                                    left: 16
                                                }}
                                                width={18}
                                                height={18}
                                                asset={
                                                    require('../../../assets/icons/common/facebook.svg')
                                                }
                                            />
                                            <Text style={styles.loginButtonText}>{i18n.t('sign_in_with_facebook')}</Text>
                                        </View>
                                    </TouchableOpacity>
                                    }
                                    {GLOBAL.SIGN_IN_WITH_TWITTER &&
                                    <TouchableOpacity
                                        onPress={() => {
                                            this.redirectToService('twitter')
                                        }}
                                    >
                                        <View style={[styles.facebookLoginButton, {backgroundColor: "#37a1f3"}]}>
                                            <WithLocalSvg
                                                fill={'white'}
                                                style={{
                                                    width: 16,
                                                    height: 16,
                                                    position: 'absolute',
                                                    left: 16
                                                }}
                                                width={18}
                                                height={18}
                                                asset={
                                                    require('../../../assets/icons/common/twitter.svg')
                                                }
                                            />
                                            <Text style={styles.loginButtonText}>Sign in with Twitter</Text>
                                        </View>
                                    </TouchableOpacity>
                                    }
                                    {GLOBAL.SIGN_IN_WITH_APPLE &&
                                    <TouchableOpacity
                                        onPress={
                                            () => {
                                                Platform.OS === 'ios' ? this.signInWithApple() : this.redirectToService('apple')
                                            }
                                        }
                                    >
                                        <View
                                            style={[styles.facebookLoginButton, {backgroundColor: this.props.display.darkMode ? "#ffffff" : '#000000'}]}>
                                            <WithLocalSvg
                                                fill={!this.props.display.darkMode ? "#ffffff" : '#000000'}
                                                style={{
                                                    width: 16,
                                                    height: 16,
                                                    position: 'absolute',
                                                    left: 16
                                                }}
                                                width={18}
                                                height={18}
                                                asset={
                                                    require('../../../assets/icons/common/apple.svg')
                                                }
                                            />
                                            <Text
                                                style={[styles.loginButtonText, {color: !this.props.display.darkMode ? "#ffffff" : '#000000'}]}>Sign in with Apple</Text>
                                        </View>
                                    </TouchableOpacity>
                                    }
                                    {GLOBAL.SIGN_IN_WITH_GOOGLE &&
                                    <TouchableOpacity
                                        onPress={() => {
                                            this.redirectToService('google')
                                        }}
                                    >
                                        <View style={[styles.facebookLoginButton, {backgroundColor: "#4385f3"}]}>
                                            <WithLocalSvg
                                                fill={'white'}
                                                style={{
                                                    width: 16,
                                                    height: 16,
                                                    position: 'absolute',
                                                    left: 16
                                                }}
                                                width={18}
                                                height={18}
                                                asset={
                                                    require('../../../assets/icons/common/google.svg')
                                                }
                                            />
                                            <Text style={styles.loginButtonText}>Sign in with Google</Text>
                                        </View>
                                    </TouchableOpacity>
                                    }
                                    <TouchableOpacity style={styles.registerButton} onPress={() => {
                                        this.setState({login: false})
                                    }}>
                                        <Text style={[styles.registerButtonText, {color: this.state.theme.textSecondaryColor}]}>Don't have an account? <Text style={{color: 'red'}}>Sign Up</Text></Text>
                                    </TouchableOpacity>
                                </View>
                            </View>
                            <View
                                style={{
                                    marginBottom: 72,
                                }}
                            />
                            <BottomMargin />
                        </ScrollView>
                    </View>
                );
            } else {
                return (
                    <View style={[styles.container, {backgroundColor: this.state.theme.primaryBackgroundColor}]}>
                        <TouchableOpacity
                            style={styles.headerClose}
                            onPress={Actions.pop}
                        >
                            <WithLocalSvg
                                width={16}
                                height={16}
                                asset={
                                    require('../../../assets/icons/common/cancel.svg')
                                }
                                fill={this.state.theme.textSecondaryColor}
                            />
                        </TouchableOpacity>
                        <ScrollView
                            style={{
                                paddingTop: 72,
                                flex: 1,
                            }}
                        >
                            <View
                                style={{
                                    flex: 1,
                                    justifyContent: 'center',
                                    alignContent: 'center',
                                    flexDirection: 'row',
                                    marginBottom: 32
                                }}
                            >
                                <View style={styles.wrap}>
                                    <Text
                                        style={[styles.login_header, {color: this.state.theme.textPrimaryColor}]}>{i18n.t('create_account')}</Text>
                                    <View style={{
                                        marginBottom: 8
                                    }}>
                                        <Text style={[{color: this.state.theme.textPrimaryColor, fontWeight: 'bold'}]}>Your name</Text>
                                        <TextInput
                                            style={[styles.textInput, {
                                                borderColor: this.state.theme.textInput.borderColor,
                                                backgroundColor: this.state.theme.textInput.backgroundColor,
                                                color: this.state.theme.textInput.textColor,
                                                marginBottom: 16
                                            }]}
                                            placeholder={'Type your name'}
                                            onChangeText={(name) => this.setState({name})}
                                            placeholderTextColor={this.state.theme.textInput.placeholderTextColor}
                                            autoCapitalize="none"
                                            underlineColorAndroid="rgba(0,0,0,0)"
                                            returnKeyType="next"
                                            onSubmitEditing={() => this.refs.txtUsername.focus()}
                                            autoCorrect={false}
                                        />
                                    </View>
                                    <View style={{
                                        marginBottom: 8
                                    }}>
                                        <Text style={[{color: this.state.theme.textPrimaryColor, fontWeight: 'bold'}]}>Your username</Text>
                                        <TextInput
                                            style={[styles.textInput, {
                                                borderColor: this.state.theme.textInput.borderColor,
                                                backgroundColor: this.state.theme.textInput.backgroundColor,
                                                color: this.state.theme.textInput.textColor,
                                                marginBottom: 16
                                            }]}
                                            placeholder={'Type your username'}
                                            onChangeText={(username) => this.setState({username})}
                                            placeholderTextColor={this.state.theme.textInput.placeholderTextColor}
                                            autoCapitalize="none"
                                            underlineColorAndroid="rgba(0,0,0,0)"
                                            returnKeyType="next"
                                            onSubmitEditing={() => this.refs.txtPassword.focus()}
                                            autoCorrect={false}
                                            ref={"txtUsername"}
                                        />
                                    </View>
                                    <View style={{
                                        marginBottom: 8
                                    }}>
                                        <Text style={[{color: this.state.theme.textPrimaryColor, fontWeight: 'bold'}]}>Your password</Text>
                                        <TextInput
                                            style={[styles.textInput, {
                                                borderColor: this.state.theme.textInput.borderColor,
                                                backgroundColor: this.state.theme.textInput.backgroundColor,
                                                color: this.state.theme.textInput.textColor,
                                                marginBottom: 16
                                            }]}
                                            placeholder={'Type your password'}
                                            onChangeText={(password) => this.setState({password})}
                                            placeholderTextColor={this.state.theme.textInput.placeholderTextColor}
                                            autoCapitalize="none"
                                            underlineColorAndroid="rgba(0,0,0,0)"
                                            returnKeyType="next"
                                            ref={"txtPassword"}
                                            onSubmitEditing={() => this.refs.txtEmail.focus()}
                                            autoCorrect={false}
                                            secureTextEntry={true}
                                        />
                                    </View>
                                    <View style={{
                                        marginBottom: 8
                                    }}>
                                        <Text style={[{color: this.state.theme.textPrimaryColor, fontWeight: 'bold'}]}>Your email</Text>
                                        <TextInput
                                            style={[styles.textInput, {
                                                borderColor: this.state.theme.textInput.borderColor,
                                                backgroundColor: this.state.theme.textInput.backgroundColor,
                                                color: this.state.theme.textInput.textColor,
                                                marginBottom: 16
                                            }]}
                                            placeholder={'Type your email'}
                                            onChangeText={(email) => this.setState({email})}
                                            placeholderTextColor={this.state.theme.textInput.placeholderTextColor}
                                            autoCapitalize="none"
                                            underlineColorAndroid="rgba(0,0,0,0)"
                                            autoCorrect={false}
                                            ref={"txtEmail"}
                                            returnKeyType="go"
                                            onSubmitEditing={() => this.onCreateAccount()}
                                        />
                                    </View>
                                    <Text
                                        style={{
                                            color: this.state.theme.textSecondaryColor,
                                            fontSize: 12
                                        }}
                                    >By click to Sign up button, you are agree with our Terms of service & Privacy policy</Text>
                                    <TouchableOpacity onPress={() => {
                                        !this.state.registerPressed && this.onCreateAccount();
                                    }}>
                                        <View style={styles.createAccountButton}>
                                            {!this.state.registerPressed &&
                                            <Text style={styles.loginButtonText}>{i18n.t('sign_up')}</Text>}
                                            {this.state.registerPressed &&
                                            <ActivityIndicator color={this.state.theme.indicatorColor}/>}
                                        </View>
                                    </TouchableOpacity>
                                    <TouchableOpacity style={styles.registerButton} onPress={() => {
                                        this.setState({login: true})
                                    }}>
                                        <Text
                                            style={[styles.registerButtonText, {color: this.state.theme.textSecondaryColor}]}
                                        >Already have an account? <Text style={{color: 'red'}}>{i18n.t('login')}</Text></Text>
                                    </TouchableOpacity>
                                </View>
                            </View>
                            <View
                                style={{
                                    marginBottom: 72,
                                }}
                            />
                            <BottomMargin />
                        </ScrollView>
                    </View>
                );
            }
        }
    }
}
const styles = StyleSheet.create({
    container: {
        paddingTop: Platform.OS === 'ios' ? 20 : 0,
        flex: 1,
    },
    wrap: {
        width: 300,
        alignItems: 'center',
        justifyContent: 'center',
    },
    login_header:{
        fontSize: 26,
        marginBottom: 64,
        fontWeight: 'bold'
    },
    headerClose: {
        position: 'absolute',
        ...ifIphoneX({
            top: 66
        }, {
            top: 52,
        }),
        left: 16,
        width: 24,
        height: 24,
        justifyContent: 'center',
        alignItems: 'center',
        zIndex: 10
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
    textInput: {
        height: 40,
        width: 300,
        padding: 8,
        borderRadius: 4,
        marginTop: 4
    },
    login_regiter_button: {
        flexDirection: 'row',
        marginTop: 16
    },
    loginButton: {
        height: 40,
        width: 300,
        backgroundColor: '#e23137',
        borderRadius: 4,
        alignItems: 'center',
        justifyContent: 'center',
    },
    facebookLoginButton: {
        height: 40,
        flexDirection: 'row',
        width: 300,
        borderRadius: 4,
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 12
    },
    registerButton: {
        marginTop: 32,
        alignItems: 'center',
        justifyContent: 'center',
    },
    loginButtonText: {
        color: '#ffffff',
        fontSize: 16,
        fontWeight: '600'
    },
    registerButtonText: {
        fontSize: 17,
    },
    createAccountButton: {
        height: 40,
        width: 300,
        marginTop: 14,
        backgroundColor: '#e23137',
        borderRadius: 20,
        alignItems: 'center',
        justifyContent: 'center',
    }
})

export default connect(({routes, scroll, language, display, player, auth}) => ({routes, scroll, language, display, player, auth}))(Login);
