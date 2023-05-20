import React, {Component} from "react";
import {
    Dimensions,
    Text,
    TouchableOpacity,
    View,
    StyleSheet,
    Animated, ActivityIndicator,
} from "react-native";
import Icon from 'react-native-vector-icons/Ionicons';
import Song from '../../models/Song';
import Parallax from '../common/Parallax'
import {connect} from "react-redux";
import Activity from '../../models/Activity';
import { Actions } from 'react-native-router-flux';
import {changeStatusBarStyle} from "../../helpers/Functions";
import API from "../../helpers/Axios";
import {Tab, Tabs, TabHeading, ScrollableTab} from "native-base";
import i18n from "i18n-js";
import NavHeader from "../common/NavHeader";
import {WithLocalSvg} from "react-native-svg";
import User from "../../models/User";
import Comment from "../../models/Comment";

const GLOBAL = require('../../../config/Global');
const window = Dimensions.get('window');
class PlaylistShow extends Component {
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
            data: null,
            theme: this.props.display.darkMode ? GLOBAL.themes.dark : GLOBAL.themes.light,
            layoutWidth: window.width,
            SongData: [],
            renderData: [],
            SongsCount: 0,
            ActivitiesData: [],
            isLoading: true,
            loadSubscribers: false,
            loadCollaborators: false,
            loadComments: false
        };
    };
    renderMarginBottom() {
        if (this.state.mini) {
            return (
                <View style={{marginBottom: 50}}/>
            )
        }
    };
    componentWillReceiveProps(nextProps) {
        if(this.props.display.darkMode !== nextProps.display.darkMode ) {
            nextProps.display.darkMode ? this.setState({theme: GLOBAL.themes.dark}) : this.setState({theme: GLOBAL.themes.light})
        }

    };
    componentDidMount() {
        API.get('playlist/' + this.props.playlist.id)
            .then(res => {
                this.setState({
                    data: res.data,
                    isLoading: false,
                    renderData: res.data.songs.slice(0, 10),
                    SongData: res.data.songs,
                    SongsCount: res.data.songs.length,
                    ActivitiesData: res.data.activities.data
                });
            });
    }
    showFullSongs(){
        this.setState({renderData: this.state.SongData, isFull: true})
    }
    renderShowFullButton(){
        if(!this.state.isFull && this.state.SongsCount > 10) return (
            <TouchableOpacity onPress={ () => this.showFullSongs() } style={{width: '100%', height: 48, justifyContent: 'center', alignItems: 'center'}}>
                <WithLocalSvg
                    fill={this.state.theme.textSecondaryColor}
                    width={16}
                    height={16}
                    asset={require('../../../assets/icons/common/down-arrow.svg')}
                />
            </TouchableOpacity>
        )
    }
    renderActivities(){
        if (this.state.ActivitiesData.length) return (
            <View>
                <TouchableOpacity onPress={() => {Actions.playlistActivity({playlist: this.props.playlist})}} style={{width: '100%', height: 24, marginTop: 16, marginBottom: 16, justifyContent: 'center'}}>
                    <Text style={[styles.headline, {color: this.state.theme.headlineColor}]}>Activity</Text>
                    <Text style={[styles.texMmore, {color: this.state.theme.moreTextColor}]}>See all</Text>
                </TouchableOpacity>
                <Activity ActivitiesData={this.state.ActivitiesData} theme={this.state.theme}/>
            </View>
        )
    };
    onChangeTab(i, tab){
        if(tab === 'subscribers' && ! this.state.loadSubscribers) {
            API.get(`playlist/${this.props.playlist.id}/subscribers`)
                .then(res => {
                    this.setState({
                        loadSubscribers: true,
                        subscribers: res.data.data
                    });

                });
        } else if(tab === 'collaborators' && ! this.state.loadCollaborators) {
            API.get(`playlist/${this.props.playlist.id}/collaborators`)
                .then(res => {
                    this.setState({
                        loadCollaborators: true,
                        collaborators: res.data.data
                    });

                });
        } else if(tab === 'comments' && ! this.state.loadComments) {
            this.setState({
                loadComments: true,
            });
        }
    };
    render() {
        return (
            <View style={[styles.container, {backgroundColor: this.state.theme.primaryBackgroundColor}]} onLayout={this.onLayoutScreen}>
                <NavHeader title={this.props.playlist.title} noBorder={true}/>
                <Tabs
                    prerenderingSiblingsNumber={3}
                    onChangeTab={({i, ref}) => {
                        this.onChangeTab(i, ref.props.tab);
                    }}
                    renderTabBar={() => <ScrollableTab
                        style={{
                            backgroundColor: this.state.theme.primaryBackgroundColor,
                            borderBottomColor: this.state.theme.tabBorderBottomColor,
                            height: 48,
                            justifyContent: 'center',
                            alignItems: 'center'
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
                                item={this.props.playlist}
                                kind={'playlist'}
                                theme={this.state.theme}
                                songs={this.props.songs ? this.props.songs: this.state.SongData}
                                isLoading={this.state.isLoading}
                                shoudRenderForeground={true}
                                renderForeground={() => (
                                    <View>
                                        <Song SongData={this.props.songs ? this.props.songs: this.state.renderData} layoutWidth={this.state.layoutWidth} theme={this.state.theme}/>
                                        {this.renderShowFullButton()}
                                        {this.renderActivities()}
                                        <View style={{
                                            marginTop: 32
                                        }}>
                                        </View>
                                    </View>
                                )}
                            />
                        </View>
                        {this.renderMarginBottom()}
                    </Tab>
                    <Tab heading={i18n.t('comments') + ' (' + this.props.playlist.comment_count + ')'} tab={'comments'} style={{backgroundColor: this.state.theme.primaryBackgroundColor}}>
                        {this.state.loadComments && (
                            <View style={{
                                marginTop: 16,
                                flex: 1
                            }}>
                                <Comment commentable_type={'App\\Models\\Playlist'} commentable_id={this.props.playlist.id} hideHeader={true}/>
                            </View>
                        )}
                        {this.renderMarginBottom()}
                    </Tab>
                    <Tab heading={i18n.t('subscribers')} tab={'subscribers'} style={{backgroundColor: this.state.theme.primaryBackgroundColor}}>
                        {! this.state.loadSubscribers && <ActivityIndicator color={this.state.theme.indicatorColor} style={{flex:1, backgroundColor: this.state.theme.primaryBackgroundColor}}/>}
                        {this.state.loadSubscribers && <User UserData={this.state.subscribers} search={true} theme={this.state.theme} noDataString={'Playlist does not have any Subscribers yet.'}/>}
                        {this.renderMarginBottom()}
                    </Tab>
                    <Tab heading={i18n.t('collaborators')} tab={'collaborators'} style={{backgroundColor: this.state.theme.primaryBackgroundColor}}>
                        {! this.state.loadCollaborators && <ActivityIndicator color={this.state.theme.indicatorColor} style={{flex:1, backgroundColor: this.state.theme.primaryBackgroundColor}}/>}
                        {this.state.loadCollaborators && <User UserData={this.state.collaborators} search={true} theme={this.state.theme}  noDataString={'Playlist does not have any Collaborators yet.'}/>}
                        {this.renderMarginBottom()}
                    </Tab>
                </Tabs>
            </View>
        )
    }
}
const styles = StyleSheet.create({
    container: {
        flex: 1
    },
    headline: {
        fontSize: 16,
        marginLeft: 8,
        fontWeight: 'bold',
    },
    texMmore: {
        fontSize: 13,
        fontWeight: 'bold',
        position: 'absolute',
        right: 8,
    },
});


export default connect(({routes, scroll, language, display, player, auth}) => ({routes, scroll, language, display, player, auth}))(PlaylistShow);
