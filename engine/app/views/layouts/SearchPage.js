/*
 * Created by ninacoder
 * @https://codecanyon.net/user/codenamenina
 */

import React, {Component} from "react";
import {Animated, Dimensions, Platform, StyleSheet, TouchableOpacity, Keyboard, View, ScrollView, TextInput, findNodeHandle, ActivityIndicator, StatusBar} from "react-native";

import {ScrollableTab, Tab, TabHeading, Tabs} from "native-base";
import Album from '../../models/Album';
import Playlist from '../../models/Playlist';
import Artist from '../../models/Artist';
import Song from '../../models/Song';
import User from '../../models/User';
const GLOBAL = require('../../../config/Global');
import NavHeader from '../common/NavHeader';
import {connect} from "react-redux";
import {changeStatusBarStyle} from "../../helpers/Functions";
import API from "../../helpers/Axios";
import i18n from 'i18n-js';

const AnimatedTextInput = Animated.createAnimatedComponent(TextInput);

const window = Dimensions.get('window');

class SearchPage extends Component {
    static onEnter = async () => {
        changeStatusBarStyle();
    };
    constructor(props) {
        super(props);
        this.state = {
            activeTab: 0,
            page: 1,
            loading: false,
            mini: props.player.show ? props.player.show : false,
            theme: this.props.display.darkMode ? GLOBAL.themes.dark : GLOBAL.themes.light,
            term: null
        };
    }
    componentWillReceiveProps(nextProps) {
        if( this.props.player.show !==  nextProps.player.show) {
            this.setState({mini: nextProps.player.show});
        }
        if(this.props.display.darkMode !== nextProps.display.darkMode ) {
            nextProps.display.darkMode ? this.setState({theme: GLOBAL.themes.dark}) : this.setState({theme: GLOBAL.themes.light})
        }
    }
    renderMarginBottom() {
        if (this.state.mini) {
            return (
                <View style={{marginBottom: 50}}/>
            )
        }
    }
    onFocus = async () => {
        this.setState({placeholderTextColor: '#d0d0d0'});
    };
    _fetchData = (term, type) => {
        const { page } = this.state;
        API.get(`search/${type}?q=${term}&limit=20`)
            .then(res => {
                if(type === 'song') {
                    this.setState({SongData: res.data.data});
                } else if(type === 'album') {
                    this.setState({AlbumData: res.data.data});
                } else if(type === 'artist') {
                    this.setState({ArtistData: res.data.data});
                } else if(type === 'playlist') {
                    this.setState({PlaylistData: res.data.data});
                } else if(type === 'station') {
                    this.setState({stationData: res.data.data});
                } else if(type === 'user') {
                    this.setState({UserData: res.data.data});
                }
            });
    };

    componentDidMount() {

    }
    onChangeText = text => {
        if(this.state.activeTab === 0) {
            this._fetchData(text, 'song');
        } else if(this.state.activeTab === 1) {
            this._fetchData(text, 'artist');
        } else if(this.state.activeTab === 2) {
            this._fetchData(text, 'album');
        } else if(this.state.activeTab === 3) {
            this._fetchData(text, 'playlist');
        } else if(this.state.activeTab === 4) {
            this._fetchData(text, 'user');
        }
        this.setState({term: text ? text : null});
    }
    render(){
        return (
            <View style={[{flex: 1, backgroundColor: this.state.theme.primaryBackgroundColor}]} onLayout={this.onLayoutScreen}>
                <NavHeader title={`Search`} noBorder={true}/>
                <View
                    style={{
                        marginLeft: 16,
                        marginRight: 16,
                        backgroundColor: this.state.theme.searchBar.backgroundColor,
                        width: this.searchBarWidthAnimated,
                        borderRadius: 3
                    }}
                >
                    <TextInput
                        ref="searchInput"
                        style={[{
                            height: 36,
                            paddingLeft: 8,
                            paddingRight: 8,

                        }, {color: this.state.theme.searchBar.placeholderTextColor}]}
                        editable={this.props.editable}
                        onChangeText={this.onChangeText}
                        placeholder={i18n.t('search_bar_placeholder')}
                        placeholderTextColor={this.state.theme.searchBar.placeholderTextColor}
                        autoCorrect={false}
                        returnKeyType={'search'}
                        keyboardType={'default'}
                        autoCapitalize={'none'}
                        onFocus={this.onFocus}
                        underlineColorAndroid="transparent"
                        blurOnSubmit={false}
                    />
                </View>
                {this.state.term &&
                    <Tabs
                        prerenderingSiblingsNumber={3}
                        onChangeTab={({i}) => {
                            this.setState({activeTab: i});
                            if (i === 0) {
                                this._fetchData(this.state.term, 'song');
                            } else if (i === 1) {
                                this._fetchData(this.state.term, 'artist');
                            } else if (i === 2) {
                                this._fetchData(this.state.term, 'album');
                            } else if (i === 3) {
                                this._fetchData(this.state.term, 'playlist');
                            } else if (i === 4) {
                                this._fetchData(this.state.term, 'user');
                            }
                        }}
                        renderTabBar={() => <ScrollableTab
                            style={{
                                backgroundColor: this.state.theme.primaryBackgroundColor,
                                borderBottomColor: this.state.theme.tabBorderBottomColor
                            }}
                            renderTab={(name, page, active, onPress, onLayout) => (
                                <TouchableOpacity
                                    key={page}
                                    onPress={() => onPress(page)}
                                    onLayout={onLayout}
                                    activeOpacity={0.4}
                                    style={{
                                        flex: 1,
                                    }}
                                >
                                    <TabHeading
                                        scrollable
                                        style={[{
                                            width: (window.width / 4),
                                        }, {backgroundColor: this.state.theme.tabBackgroundColor}]}
                                        active={active}
                                    >
                                        <Animated.Text style={{
                                            fontWeight: "bold",
                                            color: this.state.theme.textPrimaryColor,
                                            fontSize: 13
                                        }}>
                                            {name}
                                        </Animated.Text>
                                    </TabHeading>
                                </TouchableOpacity>
                            )}
                            underlineStyle={{backgroundColor: this.state.theme.tabUnderlineColor, height: 2}}
                        />}
                    >
                        <Tab heading="Song" style={{backgroundColor: this.state.theme.primaryBackgroundColor}}>
                            <ScrollView
                                style={{flex: 1}}
                                contentContainerStyle={{flexGrow: 1}}
                            >
                                <Song SongData={this.state.SongData} theme={this.state.theme}/>
                                {this.renderMarginBottom()}
                            </ScrollView>
                        </Tab>
                        <Tab heading="Artist" style={{backgroundColor: this.state.theme.primaryBackgroundColor}}>
                            <ScrollView
                                style={{flex: 1}}
                                contentContainerStyle={{flexGrow: 1}}
                            >
                                <Artist ArtistData={this.state.ArtistData} horizontal={false} search={true} column={'1'}
                                        theme={this.state.theme}/>
                            </ScrollView>
                            {this.renderMarginBottom()}
                        </Tab>
                        <Tab heading="Album" style={{backgroundColor: this.state.theme.primaryBackgroundColor}}>
                            <Album AlbumData={this.state.AlbumData} horizontal={false} search={true} column={'1'}
                                   theme={this.state.theme}/>
                            {this.renderMarginBottom()}
                        </Tab>
                        <Tab heading="Playlist" style={{backgroundColor: this.state.theme.primaryBackgroundColor}}>
                            <ScrollView
                                style={{flex: 1}}
                                contentContainerStyle={{flexGrow: 1}}
                            >
                                <Playlist PlaylistData={this.state.PlaylistData} horizontal={false} search={true}
                                          column={'1'} theme={this.state.theme}/>
                                {this.renderMarginBottom()}
                            </ScrollView>
                        </Tab>
                        <Tab heading="User" style={{backgroundColor: this.state.theme.primaryBackgroundColor}}>
                            <ScrollView
                                style={{flex: 1}}
                                contentContainerStyle={{flexGrow: 1}}
                            >
                                <User UserData={this.state.UserData} horizontal={false} search={true} column={'1'}
                                      theme={this.state.theme}/>
                                {this.renderMarginBottom()}
                            </ScrollView>
                        </Tab>
                    </Tabs>
                }
            </View>
        )
    }

}

const styles = StyleSheet.create({
    loading: {
        width: window.width,
        height: 50,
        alignItems: 'center',
        justifyContent: 'center',
    },
});


export default connect(({routes, scroll, language, display, player, auth}) => ({routes, scroll, language, display, player, auth}))(SearchPage);
