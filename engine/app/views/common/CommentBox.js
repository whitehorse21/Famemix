import React, {Component} from 'react';
import {View, TextInput, TouchableHighlight, Platform, PermissionsAndroid} from 'react-native';
import i18n from 'i18n-js';
import * as Languages from '../../helpers/Lang';
import {Actions} from "react-native-router-flux";
import {connect} from "react-redux";
import {WithLocalSvg} from 'react-native-svg';
import API from "../../helpers/Axios";
import {checkForDownloadOffline, msgShow, pushUserStatus} from "../../helpers/Functions";
import {store} from "../../../store/configureStore";
import AsyncStorage from "@react-native-async-storage/async-storage";
const GLOBAL = require("../../../config/Global");

class CommentBox extends Component {
    constructor(props) {
        super(props);
        this.state = {
            theme: this.props.display.darkMode ? GLOBAL.themes.dark : GLOBAL.themes.light,
            currentLanguage: this.props.language.code,
            commentBoxBottom: !!this.props.player.show ? 50 : 0,
            mini: !!this.props.player.show,
            commentText: null
        };
    }
    componentWillReceiveProps(nextProps) {
        if( this.props.player.show !==  nextProps.player.show) {
            this.setState({mini: nextProps.player.show});
        }
    };
    onViewClick() {
        console.log('clicked to view');
        alert('ok');
    };
    onChangeLanguage = (language) => {
        this.setState({ currentLanguage: language });
    };
    sendComment = () => {
        if(! this.state.commentText) {
            return false;
        }

        if(! this.props.auth.isLogged) {
            Actions.loginModal();
        }

        const data = {
            commentable_id: this.props.commentableId,
            commentable_type: `App\\Models\\${this.props.commentableType.charAt(0).toUpperCase() + this.props.commentableType.slice(1)}`,
            content: this.state.commentText
        };

        API.post('comments/add', data)
            .then(res => {
                msgShow('success', 'Your comment has been posted.');
            }).catch((error) => {
            msgShow('error', error.response.data.errors[Object.keys(error.response.data.errors)[0]][0]);
        });

    }
    render () {
        i18n.locale = this.state.currentLanguage;
        i18n.fallbacks = true;
        i18n.translations = Languages;

        return (
            <View style={{
                backgroundColor: '#252525',
                position: 'absolute',
                left: 0,
                right: 0,
                bottom: this.state.commentBoxBottom,
                paddingLeft: 12,
                paddingTop: 8,
                paddingBottom: 8,
                paddingRight: 12,
                justifyContent: 'space-between',
                flexDirection: 'row',
                borderBottomWidth: 0
            }}>
                <TextInput
                    onChangeText={(commentText) => this.setState({commentText})}
                    placeholder="Add a comment..."
                    placeholderTextColor={this.state.theme.textInput.placeholderTextColor}
                    autoCapitalize="none"
                    underlineColorAndroid="rgba(0,0,0,0)"
                    returnKeyType="send"
                    ref={"txtComment"}
                    onSubmitEditing={this.sendComment}
                    style={{
                        backgroundColor: '#3b3b3c',
                        borderRadius: 17,
                        flex: 1,
                        color: this.state.theme.textSecondaryColor,
                        fontSize: 17,
                        paddingLeft: 12,
                        paddingRight: 12,
                        paddingTop: 4,
                        paddingBottom: 4
                    }}
                    onFocus={() => {
                        this.setState({
                            commentBoxBottom : (Platform.OS === 'ios' ? 0 : 50)
                        })
                    }}
                    onBlur={() => {
                        this.setState({
                            commentBoxBottom : this.state.mini ? 50 : 0
                        })
                    }}
                />
                <TouchableHighlight
                    onPress={this.sendComment}
                    style={{
                        height: 34,
                        width: 34,
                        marginLeft: 12,
                        justifyContent: 'center',
                        alignItems: 'center'
                    }}
                >
                    <WithLocalSvg
                        fill={this.state.theme.community.sendButtonColor}
                        width={24}
                        height={24}
                        asset={require('../../../assets/icons/common/send.svg')}
                    />
                </TouchableHighlight>
            </View>
        );

    }
}


export default connect(({language, display, scroll, auth, player}) => ({language, display, scroll, auth, player}))(CommentBox);
