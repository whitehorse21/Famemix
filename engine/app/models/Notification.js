import React, { Component } from "react";
import {
    View,
    Image,
    FlatList,
    Text,
    ActivityIndicator,
    StyleSheet, TouchableOpacity,
} from "react-native";
import {connect} from "react-redux";
import { Actions } from 'react-native-router-flux';
import {SvgXml} from "react-native-svg";
import i18n from "i18n-js";
import FastImage from "react-native-fast-image";
const GLOBAL = require('../../config/Global');
class Notification extends Component {
    constructor(props) {
        super(props);
        this.state = {
            theme: this.props.theme
        };
    }
    componentWillReceiveProps(nextProps) {
        if(this.props.display.darkMode !== nextProps.display.darkMode ) {
            nextProps.display.darkMode ? this.setState({theme: GLOBAL.themes.dark}) : this.setState({theme: GLOBAL.themes.light})
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
        if((item.details && item.details.object) || (item.details.model && item.details.objects)) {
            return (
                <View style={styles.module_feed_event}>

                    {(item.action !== 'addSong' && item.action !== 'addEvent') &&
                        <TouchableOpacity onPress={() => {
                            Actions.userShow({user: item.host})
                        }} style={styles.feed_user_image}>
                            <FastImage
                                style={styles.author_image_medium}
                                source={{
                                    uri: item.details.host.artwork_url,
                                    priority: FastImage.priority.normal,
                                }}
                                resizeMode={FastImage.resizeMode.contain}
                            />
                            <View
                                style={[styles.feed_icon, {backgroundColor: this.state.theme.feedItem[item.action + 'BackgroundColor']}]}>
                                {item.action !== "reactComment" && <SvgXml
                                    xml={GLOBAL.icons[item.action] ? GLOBAL.icons[item.action] : GLOBAL.icons['default']}
                                    width="16" height="16"/>}
                                {item.action === "reactComment" && <SvgXml
                                    xml={GLOBAL.reactionIcons[item.details.object.type] ? GLOBAL.reactionIcons[item.details.object.type] : GLOBAL.reactionIcons['default']}
                                    width="28" height="28"/>}

                            </View>
                        </TouchableOpacity>
                    }

                    {(item.action === 'addSong' || item.action === 'addEvent') &&
                        <TouchableOpacity onPress={() => {
                            Actions.artistShow({artist: item.details.model})
                        }} style={styles.feed_user_image}>
                            <Image style={styles.author_image_medium} source={{
                                uri: item.details.model.artwork_url,
                            }}/>
                            <View
                                style={[styles.feed_icon, {backgroundColor: this.state.theme.feedItem[item.action + 'BackgroundColor']}]}>
                                {item.action !== "reactComment" && <SvgXml
                                    xml={GLOBAL.icons[item.action] ? GLOBAL.icons[item.action] : GLOBAL.icons['default']}
                                    width="16" height="16"/>}
                                {item.action === "reactComment" && <SvgXml
                                    xml={GLOBAL.reactionIcons[item.details.object.type] ? GLOBAL.reactionIcons[item.details.object.type] : GLOBAL.reactionIcons['default']}
                                    width="28" height="28"/>}

                            </View>
                        </TouchableOpacity>
                    }

                    <View style={styles.feed_content}>
                        <Text style={styles.event_action}>
                            {(item.action !== 'addSong' && item.action !== 'addEvent') &&
                                <Text
                                    onPress={() => {
                                        Actions.userShow({user: item.host})
                                    }}
                                    style={[styles.event_author, {color: this.state.theme.activity.authorTextColor}]}>
                                    {this.props.user.id === item.details.host.id ? 'You' : item.details.host.name}
                                </Text>
                            }

                            {(item.action === 'addSong' || item.action === 'addEvent') &&
                                <Text
                                    onPress={() => {
                                        Actions.artistShow({artist: item.details.model})
                                    }}
                                    style={[styles.event_author, {color: this.state.theme.activity.authorTextColor}]}>
                                    {item.details.model.name}
                                </Text>
                            }

                            <Text style={[styles.event_action, {color: this.state.theme.activity.actionTextColor}]}>
                                {item.action === "addSong" && <Text> uploaded {item.details.objects.length} songs</Text>}
                                {item.action === "addEvent" && <Text> added an event that might interest you</Text>}

                                {item.action === "collectSong" && <Text>collected {item.objects.length} songs</Text>}
                                {item.action === "sharedMusic" && <Text> shared an (object) to you.</Text>}
                                {item.action === "reactComment" && <Text>reacted your comment "{item.details.object.content}".</Text>}
                                {item.action === "acceptedCollaboration" && <Text>accepted your invitation to collaborate the playlist <Text onPress={ () => {  } } style={styles.event_object}>{item.details.object.title}.</Text></Text>}



                                {item.action === "favoriteSong" && <Text> favorited {item.objects.length} songs</Text>}
                                {item.action === "addToPlaylist" && <Text> added {item.objects.length} songs to playlist <Text onPress={ () => { Actions.playlistShow({ playlist: item.playlist}) } } style={styles.event_object}>{item.playlist.title}</Text></Text>}
                                {item.action === "followUser" && <Text> is now following <Text onPress={ () => {  } } style={styles.event_object}>{item.details.object.id === this.props.auth.user.id ? 'you' : item.details.object.name}</Text></Text>}
                                {item.action === "followArtist" && <Text >started following <Text onPress={ () => {  } } style={styles.event_object}>{item.details.object.id === this.props.auth.user.id ? 'you' : item.details.object.name}</Text></Text>}
                                {item.action === "followPlaylist" && <Text> has subscribed </Text>}
                                {item.action === "inviteCollaborate" && <Text> added you as a collaborator on the playlist <Text onPress={ () => { Actions.playlistShow({ playlist: item.objects[0]}) } } style={styles.event_object}>{item.objects[0].title}</Text></Text>}
                            </Text>
                            <Text>.</Text>
                        </Text>
                        <Text style={[styles.event_time, {color: this.state.theme.activity.timeTextColor}]}>{this.timeAgo(item.created_at)}</Text>
                    </View>
                </View>
            );
        }
    };
    render() {
        if (!this.props.data) {
            return <ActivityIndicator color={this.state.theme.indicatorColor} style={{flux: 1}} />;
        } else if (!this.props.data.length) {
            return (<View style={ styles.container }><Text style={{textAlign: 'center', color: this.state.theme.noDataTextColor}}>You have no notifications.</Text></View>);
        }
        return (
            <FlatList
                numColumns={1}
                data={this.props.data}
                keyExtractor={this.keyExtractor}
                renderItem={this.renderActivity}
                scrollEnabled={false}
            />
        );
    }
}
const styles = StyleSheet.create({
    container: {
      flex: 1,
      alignItems: 'center',
      justifyContent: 'center'
    },
    module_feed_event: {
        width: '100%',
        alignItems: 'center',
        flexDirection:'row',
        padding: 16
    },
    feed_icon: {
        height: 28,
        width: 28,
        position: 'absolute',
        top: 16,
        left: 25,
        borderRadius: 15,
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 100
    },
    feed_user_image: {height: 40, width: 40},
    author_image_medium: {
        borderRadius: 20,
        width: 40,
        height: 40
    },
    feed_content: {
        flex: 1,
        paddingLeft: 24
    },
    event_author: {
        fontSize: 16,
        fontWeight: '500'
    },
    event_object: {
        fontSize: 16,
        fontWeight: 'bold'
    },
    event_action: {
        fontSize: 16
    },
    event_time: {
        marginTop: 4,
        fontSize: 13
    },
});


export default connect(({routes, scroll, language, display, player, auth}) => ({routes, scroll, language, display, player, auth}))(Notification);
