import React, {Component} from 'react';
import {View, Text, StyleSheet, ActivityIndicator, Dimensions, TouchableOpacity, FlatList, Image} from 'react-native';
import i18n from 'i18n-js';
import * as Languages from '../../helpers/Lang';
import { Actions } from 'react-native-router-flux';
import { Icon } from 'native-base';
import {connect} from "react-redux";

import {ifIphoneX} from "../../helpers/ifIphoneX";
import {changeStatusBarStyle, msgShow} from "../../helpers/Functions";
import API from "../../helpers/Axios";
const GLOBAL = require('../../../config/Global');
const window = Dimensions.get('window');

class InviteCollaborator extends Component {
    static onEnter = async () => {
        changeStatusBarStyle();
    };
    constructor(props) {
        super(props);
        this.state = {
            theme: this.props.display.darkMode ? GLOBAL.themes.dark : GLOBAL.themes.light,
            followingData: [],
            doSave: false,
            update: {}
        };
    }
    componentDidMount() {
        API.post('auth/user/playlist/collaborators')
            .then(res => {
                this.setState({followingData: res.data})
            });
    }
    cancelInvite(user) {
        const update = {};
        update['indicator_' + user.id] = false;
        this.setState(update);
        const data = {
            id: this.props.item.id,
            friendId: user.id,
            action: 'cancel',
        };
        API.post('auth/user/playlist/collaborative', data)
            .then(res => {

            })
    }
    sendInvite(user) {
        const update = {};
        update['indicator_' + user.id] = true;
        this.setState(update);
        const data = {
            id: this.props.item.id,
            friendId: user.id,
            action: 'invite',
        };
        API.post('auth/user/playlist/collaborative', data)
            .then(res => {

            })
    }
    keyExtractor = (item, index) => index.toString();
    renderUser = ({ item, index }) => {
        return (
            <View style={[styles.item_search_view,  {width: '100%'}]}>
                <Image style={ [styles.search_artwork] } source={{uri: item.artwork_url}}/>
                <Text style={[styles.search_item_title_text, {color: this.state.theme.textPrimaryColor}]} numberOfLines={1}>{item.name}</Text>
                {this.state['indicator_' + item.id] !== true && (
                    <TouchableOpacity style={{position: 'absolute', right: 8, top: 22, height: 26, borderRadius: 3, backgroundColor: this.state.theme.inviteButtonBackgroundColor, justifyContent: 'center', alignItems: 'center'}}
                                      onPress={()=> {this.sendInvite(item)}}>
                        <Text style={{color: this.state.theme.inviteButtonTextColor, paddingLeft: 16, paddingRight: 16, fontSize: 11}}>Invite</Text>
                    </TouchableOpacity>
                )}
                {this.state['indicator_' + item.id] === true && (
                    <TouchableOpacity style={{position: 'absolute', right: 8, top: 22, height: 26, borderRadius: 3, borderWidth: 1, borderColor: this.state.theme.inviteButtonBackgroundColor, justifyContent: 'center', alignItems: 'center'}}
                                      onPress={()=> {this.cancelInvite(item)}}>
                        <Text style={{color: this.state.theme.inviteButtonBackgroundColor, paddingLeft: 16, paddingRight: 16, fontSize: 11}}>Invited</Text>
                    </TouchableOpacity>
                )}
            </View>
        )
    };
    renderUsers(){
        if(this.state.followingData.length) return (
            <FlatList
                data={this.state.followingData}
                keyExtractor={this.keyExtractor}
                renderItem={this.renderUser}
                extraData={this.state}
            />
        )
    }
    render () {
        i18n.locale = this.props.lang;
        i18n.fallbacks = true;
        i18n.translations = Languages;

        return (
            <View style={[styles.container, {backgroundColor: this.state.theme.primaryBackgroundColor}]}>
                <View style={[styles.nav, {borderBottomColor: this.state.theme.navBorderColor}]}>
                    <TouchableOpacity onPress={() => {Actions.pop()}} style={styles.doneButton}>
                        <Text style={{fontWeight: 'bold', color: this.state.theme.textPrimaryColor}}>{i18n.t('done')}</Text>
                    </TouchableOpacity>
                </View>
                {this.renderUsers()}
            </View>
        )
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
    },
    nav: {
        flexDirection: 'row',
        width: '100%',
        borderBottomWidth: 1,
        height: 50,
        alignItems: 'center',
        justifyContent: 'center'
    },
    doneButton: {
        position: 'absolute',
        right: 8,
        height: 50,
        alignItems: 'center',
        justifyContent: 'center'
    },
    item_search_view: {
        flexDirection: 'row',
        height: 70,
        alignItems: 'center',
        paddingLeft: 8
    },
    search_artwork: {
        marginRight: 8,
        borderRadius: 25,
        width: 50,
        height: 50
    },
    search_item_title_text: {
        fontSize: 13,
        fontWeight:'bold',
    },
    search_item_subtitle_text: {
        fontSize: 13,
    }
});

export default connect(({routes, scroll, language, display, player, auth}) => ({routes, scroll, language, display, player, auth}))(InviteCollaborator);
