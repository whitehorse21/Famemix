import React, {Component} from "react";
import {
    Dimensions,
    Text,
    TouchableOpacity,
    ScrollView,
    View,
    StyleSheet,
    Animated,
    ActivityIndicator
} from "react-native";
import Parallax from '../common/Parallax'
import { Actions } from 'react-native-router-flux';
import Icon from 'react-native-vector-icons/MaterialIcons';
import Song from '../../models/Song';
import Album from '../../models/Album';
import Artist from '../../models/Artist';
import {connect} from "react-redux";
import {changeStatusBarStyle} from "../../helpers/Functions";
import API from "../../helpers/Axios";
import NavHeader from "../common/NavHeader";
import {ScrollableTab, Tab, TabHeading, Tabs} from "native-base";
import i18n from "i18n-js";
import User from "../../models/User";

const GLOBAL = require('../../../config/Global');
const window = Dimensions.get('window');

class ArtistShow extends Component {
    static onEnter = async() => {
        changeStatusBarStyle();
    };
    onLayoutScreen = (e) => {
        let width = e.nativeEvent.layout.width;
        if (width !== this.state.layoutWidth) {
            this.setState({
                layoutWidth: width
            })
        }
    };
    constructor(props) {
        super(props);
        this.state = {
            layoutWidth: window.width,
            theme: this.props.display.darkMode ? GLOBAL.themes.dark : GLOBAL.themes.light,
            PopularData: [],
            SongData: [],
            AlbumData: [],
            data: null,
            isLoading: true,
            loadAlbums: false
        };
    }
    componentWillReceiveProps(nextProps) {
        if(this.props.display.darkMode !== nextProps.display.darkMode ) {
            nextProps.display.darkMode ? this.setState({theme: GLOBAL.themes.dark}) : this.setState({theme: GLOBAL.themes.light})
        }
    }
    componentDidMount() {
        API.get('artist/' + this.props.artist.id)
            .then(res => {
                this.setState({
                    isLoading: false,
                    SongData: res.data.artist.songs.data,
                    AlbumData: res.data.artist.albums,
                    data: res.data.artist,
                });
            });
    }
    renderMarginBottom() {
        if (this.state.mini) {
            return (
                <View style={{marginBottom: 50}}/>
            )
        }
    };
    renderArtistAlbums(){
        //Hide if there is no album
        if(this.state.AlbumData && this.state.AlbumData.length) return (
            <View>
                <TouchableOpacity
                    style={styles.touch_headline}
                >
                    <Text style={[styles.headline, {color: this.state.theme.headlineColor}]}>Full Albums / Singles & EPs</Text>
                    <View style={{position: "absolute", right: 0, flexDirection: 'row',}}>
                        <Text style={[styles.text_more, {color: this.state.theme.moreTextColor}]}>More</Text>
                        <Text style={{color: this.state.theme.moreIconColor}}><Icon name="keyboard-arrow-right" size={16}/></Text>
                    </View>
                </TouchableOpacity>
                <ScrollView horizontal={true} showsHorizontalScrollIndicator={false}>
                    <Album AlbumData={this.state.AlbumData} horizontal={true} layoutWidth={this.state.layoutWidth} theme={this.state.theme}/>
                </ScrollView>
            </View>
        )
    }
    renderNewSongs(){
        if(this.state.SongData && this.state.SongData.length) return (
            <View>
                <TouchableOpacity style={styles.touch_headline}
                                  onPress={() => Actions.artistDetails({
                                      artist: this.props.artist,
                                      kind: 'songs'
                                  })}>
                    <Text
                        style={[styles.headline, {color: this.state.theme.headlineColor}]}>Tracks</Text>
                    <View style={{position: "absolute", right: 8, flexDirection: 'row',}}>
                        <Text style={[styles.text_more, {color: this.state.theme.moreTextColor}]}>See All</Text>
                    </View>
                </TouchableOpacity>
                <Song SongData={this.state.SongData} layoutWidth={this.state.layoutWidth} theme={this.state.theme}/>
            </View>
        )
    }
    renderRelatedArtists(){
        if(this.state.ArtistData && this.state.ArtistData.length) return (
            <View>
                <TouchableOpacity style={styles.touch_headline} onPress={() =>  Actions.artistDetails({artist: this.props.artist, kind: 'artists'})}>
                    <Text style={[styles.headline, {color: this.state.theme.headlineColor}]}>Related artists</Text>
                    <View style={{position: "absolute", right: 0, flexDirection: 'row',}}>
                        <Text style={[styles.text_more, {color: this.state.theme.moreTextColor}]}>More</Text>
                    </View>
                </TouchableOpacity>
                <Artist ArtistData={this.state.ArtistData} horizontal={false} search={true} column={'1'} theme={this.state.theme}/>
            </View>
        )
    }
    onChangeTab(i, tab) {
        if(tab === 'albums' && ! this.state.loadAlbums) {
            API.get(`artist/${this.props.artist.id}/albums`)
                .then(res => {
                    this.setState({
                        loadAlbums: true,
                        albums: res.data.artist.albums.data
                    });

                });
        } else if(tab === 'similar-artists' && ! this.state.loadSimilar) {
            API.get(`artist/${this.props.artist.id}/similar-artists`)
                .then(res => {
                    this.setState({
                        loadSimilar: true,
                        similar: res.data.artist.similar.data
                    });

                });
        } else if(tab === 'followers' && ! this.state.loadFollowers) {
            API.get(`artist/${this.props.artist.id}/followers`)
                .then(res => {
                    this.setState({
                        loadFollowers: true,
                        followers: res.data.artist.followers.data
                    });

                });
        } else if(tab === 'events' && ! this.state.loadEvents) {
            API.get(`artist/${this.props.artist.id}/events`)
                .then(res => {
                    this.setState({
                        loadEvents: true,
                        events: res.data.artist.events.data
                    });

                });
        }
    };
    render() {
        return (
            <View style={{flex: 1}} onLayout={this.onLayoutScreen}>
                <NavHeader title={this.props.artist.name} noBorder={true}/>
                {! this.state.data &&
                    <ActivityIndicator color={this.state.theme.indicatorColor} style={{flex: 1, backgroundColor: this.state.theme.primaryBackgroundColor}} />
                }
                {this.state.data &&
                    <Tabs
                        prerenderingSiblingsNumber={3}
                        onChangeTab={({i, ref}) => {
                            this.onChangeTab(i, ref.props.tab);
                        }}
                        renderTabBar={() => <ScrollableTab
                            style={{
                                backgroundColor: this.state.theme.primaryBackgroundColor,
                                borderBottomColor: this.state.theme.tabBorderBottomColor
                            }}
                            renderTab={(name, page, active, onPress, onLayout) => (
                                <TouchableOpacity key={page}
                                                  onPress={() => onPress(page)}
                                                  onLayout={onLayout}
                                                  activeOpacity={0.4}
                                                  style={{
                                                      flex: 1,
                                                      justifyContent: 'center',
                                                      alignItems: 'center'
                                                  }}
                                >

                                    <TabHeading scrollable
                                                style={[styles.tabItem, {backgroundColor: this.state.theme.tabBackgroundColor}]}
                                                active={active}>
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
                        <Tab heading={i18n.t('overview')} tab={'overview'} style={{backgroundColor: this.state.theme.primaryBackgroundColor}}>
                            <View style={{flex: 1}} onLayout={this.onLayoutScreen}>
                                <Parallax
                                    item={this.state.data}
                                    kind={'artist'}
                                    theme={this.state.theme}
                                    isLoading={this.state.isLoading}
                                    shoudRenderForeground={true}
                                    renderForeground={() => (
                                        <View>
                                            {this.renderArtistAlbums()}
                                            {this.renderNewSongs()}
                                            {this.renderRelatedArtists()}
                                        </View>
                                    )}
                                />
                            </View>
                            {this.renderMarginBottom()}
                        </Tab>
                        <Tab heading={i18n.t('albums')} tab={'albums'} style={{backgroundColor: this.state.theme.primaryBackgroundColor}}>
                            {! this.state.loadAlbums && <ActivityIndicator color={this.state.theme.indicatorColor} style={{flex:1, backgroundColor: this.state.theme.primaryBackgroundColor}}/>}
                            {this.state.loadAlbums && <Album AlbumData={this.state.albums} theme={this.state.theme} horizontal={false} column={(this.state.layoutWidth > 1000) ? 5 : ((this.state.layoutWidth > 500) ? 3 : 2)} layoutWidth={this.state.layoutWidth}/>}
                            {this.renderMarginBottom()}
                        </Tab>

                        <Tab heading={i18n.t('related_artists')} tab={'similar-artists'} style={{backgroundColor: this.state.theme.primaryBackgroundColor}}>
                            {this.renderMarginBottom()}
                        </Tab>
                        <Tab heading={i18n.t('followers')} tab={'followers'} style={{backgroundColor: this.state.theme.primaryBackgroundColor}}>
                            {! this.state.loadFollowers && <ActivityIndicator color={this.state.theme.indicatorColor} style={{flex:1, backgroundColor: this.state.theme.primaryBackgroundColor}}/>}
                            {this.state.followers && <User UserData={this.state.followers} search={true} theme={this.state.theme}/>}
                            {this.renderMarginBottom()}
                        </Tab>
                        <Tab heading={i18n.t('events')} tab={'events'} style={{backgroundColor: this.state.theme.primaryBackgroundColor}}>
                            {this.renderMarginBottom()}
                        </Tab>
                    </Tabs>
                }
            </View>
        )
    }
}

const styles = StyleSheet.create({
    touch_headline: {
        justifyContent: 'center'
    },
    headline: {
        fontSize: 16,
        marginTop: 16,
        marginLeft: 16,
        marginBottom: 16,
        fontWeight: 'bold',
    },
    text_more: {
        fontSize: 13,
        justifyContent: 'center',
    },
});


export default connect(({routes, scroll, language, display, player, auth}) => ({routes, scroll, language, display, player, auth}))(ArtistShow);
