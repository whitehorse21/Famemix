import React, { Component } from "react";
import {
    View,
    Image,
    FlatList,
    Text,
    ActivityIndicator,
    StyleSheet,
    TouchableOpacity,
} from "react-native";
import i18n from 'i18n-js';
import {SvgXml, WithLocalSvg} from 'react-native-svg';
import * as Languages from '../helpers/Lang';
import { Actions } from 'react-native-router-flux';
import {connect} from "react-redux";
import Song from "./Song";
import User from "./User";
import Artist from "./Artist";
import Playlist from "./Playlist";
import FastImage from "react-native-fast-image";
const GLOBAL = require('../../config/Global');

const icons =  {
    default: require('../../assets/icons/community/default.svg'),
    addToPlaylist: require('../../assets/icons/community/addToPlaylist.svg'),
    collectSong: require('../../assets/icons/community/collectSong.svg'),
    favoriteSong: require('../../assets/icons/community/favoriteSong.svg'),
    followUser: require('../../assets/icons/community/followUser.svg'),
    playSong: require('../../assets/icons/community/playSong.svg'),
    shareMusic: require('../../assets/icons/community/shareMusic.svg'),
}

class Activity extends Component {
    constructor(props) {
        super(props);
        this.state = {
            currentLanguage: this.props.language.code,
            theme: this.props.display.darkMode ? GLOBAL.themes.dark : GLOBAL.themes.light,
        };
    }
    onChangeLanguage = (language) => {
        this.setState({ currentLanguage: language });
    };

    async componentWillReceiveProps(nextProps, nextContent): void {
        if(this.props.display.darkMode !== nextProps.display.darkMode ) {
            nextProps.display.darkMode ? this.setState({theme: GLOBAL.themes.dark}) : this.setState({theme: GLOBAL.themes.light})
        }
        if(this.props.language.code !== nextProps.language.code ) {
            this.onChangeLanguage(nextProps.language.code)
        }
    }
    timeAgo = (time) => {
        switch (typeof time) {
            case 'number':
                break;
            case 'string':
                time = +new Date(time);
                break;
            case 'object':
                if (time.constructor === Date) time = time.getTime();
                break;
            default:
                time = +new Date();
        }
        var time_formats = [
            [60, 'seconds', 1], // 60
            [120, '1 minute ago', '1 minute from now'],
            [3600, 'minutes', 60],
            [7200, '1 hour ago', '1 hour from now'],
            [86400, 'hours', 3600],
            [172800, 'Yesterday', 'Tomorrow'],
            [604800, 'days', 86400],
            [1209600, 'Last week', 'Next week'],
            [2419200, 'weeks', 604800],
            [4838400, 'Last month', 'Next month'],
            [29030400, 'months', 2419200],
            [58060800, 'Last year', 'Next year'],
            [2903040000, 'years', 29030400],
            [5806080000, 'Last century', 'Next century'],
            [58060800000, 'centuries', 2903040000]
        ];
        var seconds = (+new Date() - time) / 1000,
            token = i18n.t('ago'),
            list_choice = 1;

        if (seconds === 0) {
            return i18n.t('just_now')
        }
        if (seconds < 0) {
            seconds = Math.abs(seconds);
            token = i18n.t('from_now');
            list_choice = 2;
        }
        var i = 0,
            format;
        while (format = time_formats[i++])
            if (seconds < format[0]) {
                if (typeof format[2] == 'string')
                    return format[list_choice];
                else
                    return Math.floor(seconds / format[2]) + ' ' + format[1] + ' ' + token;
            }
        return time;
    }
    keyExtractor = (item, index) => index.toString();
    renderActivity = ({ item, index }) => {
        i18n.locale = this.state.currentLanguage;
        i18n.fallbacks = true;
        i18n.translations = Languages;

        if(item.details && item.details.objects && item.details.objects.length) {
            return (
                <View style={[styles.module_feed_event, {borderBottomColor: this.state.theme.activity.borderColor}]}>
                    <TouchableOpacity onPress={ () => { Actions.userShow({ user: item.user}) } } style={styles.feed_user_image}>
                        <FastImage
                            style={styles.author_image_medium}
                            source={{
                                uri: item.user.artwork_url,
                                priority: FastImage.priority.normal,
                            }}
                            resizeMode={FastImage.resizeMode.contain}
                        />
                    </TouchableOpacity>
                    <View style={[styles.feed_icon, {backgroundColor: this.state.theme.feedItem[item.action + 'BackgroundColor']}]}>
                        <WithLocalSvg
                            style={{
                                width: 16,
                                height: 16,
                            }}
                            fill={this.state.theme.navIconColor}
                            width={16}
                            height={16}
                            asset={icons[item.action] ? icons[item.action] : icons['default']}
                        />
                    </View>
                    <View style={[styles.feed_content, {borderLeftColor: this.state.theme.activity.borderColor}]}>
                        <Text style={styles.event_action}>
                            <Text onPress={ () => { Actions.userShow({ user: item.user }) } } style={[styles.event_author, {color: this.state.theme.activity.authorTextColor}]}>{item.user.name} </Text>
                            <Text style={{color: this.state.theme.activity.actionTextColor}}>
                                {item.action === "collectSong" && <Text>collected {item.details.objects.length} songs</Text>}
                                {item.action === "playSong" && <Text>{i18n.t('activity_listened').replace('{num}', item.details.objects.length)}</Text>}
                                {item.action === "favoriteSong" && <Text>{i18n.t('activity_favorited').replace('{num}', item.details.objects.length)}</Text>}
                                {item.action === "followUser" && <Text>{i18n.t('activity_following_user').replace('{num}', item.details.objects.length)}</Text>}
                                {item.action === "followArtist" && <Text>{i18n.t('activity_following_artist').replace('{num}', item.details.objects.length)}</Text>}
                                {item.action === "followPlaylist" && <Text>{i18n.t('activity_subscribed').replace('{num}', item.details.objects.length)}</Text>}
                                {item.action === "addToPlaylist" && <Text>{i18n.t('activity_add_to_playlist').replace('{num}', item.details.objects.length)} <Text style={{fontWeight: 'bold', color: this.state.theme.activity.objectTextColor}}>{item.details.model.title}</Text></Text>}
                            </Text>
                        </Text>
                        {(item.action === "playSong" || item.action === "favoriteSong" || item.action === "collectSong" || item.action === "addToPlaylist") && item.details.objects.length && <Song SongData={item.details.objects} element={'activity'} theme={this.props.theme}/>}
                        {(item.action === "followUser") && item.details.objects.length && <User UserData={item.details.objects} element={'activity'} horizontal={true} theme={this.props.theme}/>}
                        {(item.action === "followArtist") && item.details.objects.length && <Artist ArtistData={item.details.objects} element={'activity'} horizontal={true} theme={this.props.theme}/>}
                        {(item.action === "followPlaylist") && item.details.objects.length && <Playlist PlaylistData={item.details.objects} element={'activity'} horizontal={true} theme={this.props.theme}/>}
                    </View>
                    <Text style={[styles.event_time, {color: this.state.theme.activity.timeTextColor}]}>{this.timeAgo(item.created_at)}</Text>
                </View>
            );
        }
    };
    render() {
        if (!this.props.ActivitiesData) {
            return <ActivityIndicator color={this.state.theme.indicatorColor} style={{flex: 1}} />;
        } else if (!this.props.ActivitiesData.length) {
            return (
                <View style={{flex: 1, justifyContent: 'center', alignItems: 'center'}}>
                    <Text style={{color: this.state.theme.noDataTextColor, textAlign: 'center'}}>No activity yet.</Text>
                </View>);
        }
        return (
            <FlatList
                numColumns={1}
                data={this.props.ActivitiesData}
                keyExtractor={this.keyExtractor}
                renderItem={this.renderActivity}
                scrollEnabled={false}
                lang={this.state.currentLanguage}
                theme={this.state.theme}
            />
        );
    }
}
const styles = StyleSheet.create({
    module_feed_event: {
        width: '100%'
    },
    feed_user_image: {
        height: 40,
        width: 40,
        position: 'absolute',
        top: 12,
        left: 16
    },
    author_image_medium: {
        borderRadius: 20,
        width: 40,
        height: 40
    },
    feed_icon: {
        height: 28,
        width: 28,
        position: 'absolute',
        top: 16,
        left: 64,
        borderRadius: 15,
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 100
    },
    feed_content: {
        borderLeftWidth: 1,
        marginLeft: 78,
        paddingLeft: 24,
        paddingTop: 8,
        paddingBottom: 32
    },
    event_author: {
        fontSize: 16,
        marginBottom: 10,
        fontWeight: 'bold'
    },
    event_action: {
        fontSize: 16,
        marginBottom: 8,
        marginRight: 16,
        textAlign: 'left'
    },
    event_time: {
        position: 'absolute',
        bottom: 8,
        right: 16,
        fontSize: 11
    },
});


export default connect(({routes, scroll, language, display, player, auth}) => ({routes, scroll, language, display, player, auth}))(Activity);
