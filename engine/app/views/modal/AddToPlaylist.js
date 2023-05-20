import React, {Component} from 'react';
import {
    View,
    Text,
    StyleSheet,
    TextInput,
    TouchableOpacity,
    FlatList,
    Platform,
    ScrollView,
    Image,
    StatusBar
} from 'react-native';
import { Actions } from 'react-native-router-flux';
import Icon from 'react-native-vector-icons/MaterialIcons';
import {connect} from "react-redux";
const GLOBAL = require('../../../config/Global');
import {ifIphoneX} from "../../helpers/ifIphoneX";
import {Tab, Tabs} from "native-base";
import {addToPlaylist, changeStatusBarStyle} from "../../helpers/Functions";
import API from "../../helpers/Axios";

class AddToPlaylist extends Component {
    static onEnter = async () => {
        changeStatusBarStyle();
    };
    constructor(props) {
        super(props);
        this.state = {
            LoadedData: null,
            user: null,
            playlistName: null,
            theme: this.props.display.darkMode ? GLOBAL.themes.dark : GLOBAL.themes.light,
            PlaylistData: [],
            CollaborateData: []
        };
    }
    componentDidMount (): void {
        API.post('auth/user/playlists')
            .then(res => {
                this.setState({
                    PlaylistData: res.data,
                });
            });
        API.post('auth/user/playlists/collaborative')
            .then(res => {
                this.setState({
                    CollaborateData: res.data
                });
            });
    }
    keyExtractor = (item, index) => index.toString();
    renderPlaylist = ({ item, index }) => {
        return (
            <TouchableOpacity
                onPress={
                    () => {
                        console.log(item);
                        addToPlaylist(item.id, item.title, this.props.row.title, this.props.mediaType, this.props.row.id);
                        setTimeout(() => {
                            Actions.pop()
                        }, 300);
                    }
                }>
                <View style={{height: 56, paddingBottom: 8, paddingTop: 8, flexDirection: 'row', alignItems: 'center'}}>
                    <Image style={{borderRadius: 3}} source={{
                        uri: item.artwork_url,
                        width: 40,
                        height: 40
                    }}/>
                    <Text style={{marginLeft: 8, fontWeight: 'bold', color: this.state.theme.textPrimaryColor}} numberOfLines={1}>{item.title}</Text>
                </View>
            </TouchableOpacity>
        );
    };
    createPlaylist() {
        let playlistName = this.state.playlistName;
        const data = {
            playlistName: playlistName,
        };
        API.post('auth/user/createPlaylist', data)
            .then(res => {
                addToPlaylist(res.data.id, res.data.title, this.props.row.title, this.props.mediaType, this.props.row.id);
                Actions.pop();
            });
    }
    render () {
        return (
            <View style={[styles.container, {backgroundColor: this.state.theme.primaryBackgroundColor}]}>
                <View style={styles.header}>
                    <Icon style={ styles.headerClose } color={this.state.theme.modal.closeButtonColor} onPress={ Actions.pop } name="close" size={24} />
                    <Text style={[styles.headerText, {color: this.state.theme.modal.titleColor}]}>Add to playlist</Text>
                </View>
                <Tabs
                    tabBarPosition={'top'}
                    tabBarUnderlineStyle={{backgroundColor: this.state.theme.tabUnderlineColor, height: 2}}>
                    <Tab
                         tabStyle={{backgroundColor: this.state.theme.primaryBackgroundColor}}
                         activeTabStyle={{backgroundColor: this.state.theme.primaryBackgroundColor}}
                         textStyle={{fontSize: 13, fontWeight: 'bold', color: this.state.theme.textSecondaryColor}}
                         activeTextStyle={{fontSize: 13, fontWeight: 'bold', color: this.state.theme.textPrimaryColor}}
                         heading="Your Playlists"
                         style={[styles.tabContent, { backgroundColor: this.state.theme.primaryBackgroundColor}]}>
                        <View style={styles.create_box}>
                            <TextInput
                                style={[styles.textInput, {borderColor: this.state.theme.textInput.borderColor, backgroundColor: this.state.theme.textInput.backgroundColor, color: this.state.theme.textInput.textColor,  marginBottom: 16}]}
                                placeholder="Create a new playlist"
                                onChangeText={(playlistName) => this.setState({playlistName})}
                                placeholderTextColor={this.state.theme.textInput.placeholderTextColor}
                                autoCapitalize="words"
                                underlineColorAndroid="rgba(0,0,0,0)"
                                onSubmitEditing={() => this.createPlaylist}
                                returnKeyType="send"
                            />
                            <TouchableOpacity style={styles.submitButton} onPress={ () => { this.createPlaylist(); }}>
                                <Icon name="arrow-forward" size={20} color={this.state.theme.modal.createPlaylistButtonColor}/>
                            </TouchableOpacity>
                        </View>
                        <ScrollView style={styles.scrollView}>
                            <FlatList
                                data={this.state.PlaylistData}
                                keyExtractor={this.keyExtractor}
                                renderItem={this.renderPlaylist}
                            />
                        </ScrollView>
                    </Tab>
                    <Tab
                        tabStyle={{backgroundColor: this.state.theme.primaryBackgroundColor}}
                        activeTabStyle={{backgroundColor: this.state.theme.primaryBackgroundColor}}
                        textStyle={{fontSize: 13, fontWeight: 'bold', color: this.state.theme.textSecondaryColor}}
                        activeTextStyle={{fontSize: 13, fontWeight: 'bold', color: this.state.theme.textPrimaryColor}}
                        heading="Collaborates"
                        style={[styles.tabContent, { backgroundColor: this.state.theme.primaryBackgroundColor}]}>
                        <ScrollView style={styles.scrollView}>
                            <FlatList
                                data={this.state.CollaborateData}
                                keyExtractor={this.keyExtractor}
                                renderItem={this.renderPlaylist}
                            />
                        </ScrollView>
                    </Tab>
                </Tabs>
            </View>
        );

    }
}
const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    header: {
        ...ifIphoneX({
           marginTop: 34
        }, {
            marginTop: Platform.OS === 'android' ? (StatusBar.currentHeight) : 20,
        }),
        height: 50,
        justifyContent: 'center',
        alignItems: 'center',
    },
    headerClose: {
        position: 'absolute',
        justifyContent: 'center',
        alignItems: 'center',
        left: 16,
        zIndex: 20
    },
    headerText:{
        fontSize: 15,
        fontWeight: 'bold'
    },
    create_box:{
        marginTop: 16,
        width: '100%',
        height: 40,
        paddingLeft: 16,
        paddingRight: 16
    },
    submitButton:{
        height: 40,
        width: 40,
        position: 'absolute',
        right: 16,
        alignItems: 'center',
        justifyContent: 'center'
    },
    textInput: {
        height: 40,
        borderWidth: 1,
        padding: 8,
        borderRadius: 20,
        textAlign: 'center'
    },
    scrollView:{
        width: '100%',
        padding: 8,
    },
});

export default connect(({routes, scroll, language, display, player, auth}) => ({routes, scroll, language, display, player, auth}))(AddToPlaylist);
