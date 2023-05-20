import React, { Component } from "react";
import {
    View,
    FlatList,
    Text,
    ActivityIndicator,
    StyleSheet,
    Image,
    TouchableOpacity, Platform,
} from "react-native";
import {WithLocalSvg} from "react-native-svg";
import {Actions} from 'react-native-router-flux';
import {connect} from "react-redux";
import {humanTime, playSong} from '../helpers/Functions';
import FastImage from "react-native-fast-image";
import {decode} from "html-entities";
const GLOBAL = require('../../config/Global');
import Moment from 'moment';

class Episode extends Component {
    constructor(props) {
        super(props);
        this.state = {
            theme: this.props.display.darkMode ? GLOBAL.themes.dark : GLOBAL.themes.light,
        };
    }
    async componentWillReceiveProps(nextProps, nextContent): void {
        if(this.props.display.darkMode !== nextProps.display.darkMode ) {
            nextProps.display.darkMode ? this.setState({theme: GLOBAL.themes.dark}) : this.setState({theme: GLOBAL.themes.light})
        }
    }
    render() {
        if (!this.props.EpisodeData) {
            return <ActivityIndicator color={this.state.theme.indicatorColor} style={ styles.container } />;
        }
        if (!this.props.EpisodeData.length) {
            return (<View style={ styles.container }><Text style={{color: this.state.theme.noDataTextColor, textAlign: 'center'}}>No data has been found</Text></View>);
        }
        return (
            <FlatList
                data={this.props.EpisodeData}
                keyExtractor={this.keyExtractor}
                renderItem={this.renderSong}
                numColumns={(this.props.layoutWidth > 700) ? 2 : 1}
                key={(this.props.layoutWidth > 700) ? 2 : 1}
                horizontal={this.props.element === "activity" && this.props.EpisodeData.length !== 1}
                showsHorizontalScrollIndicator={false}
                scrollEnabled={this.props.element === "activity"}
                theme={this.state.theme}
            />
        );
    }
    onSongPress(item){
        playSong(item)
    }
    keyExtractor = (item, index) => index.toString();
    renderSong = ({ item, index }) => {
        return (
            <TouchableOpacity
                onPress={() => {
                    item.artists = [item.artist];
                    item.artwork_url = item.podcast.artwork_url;
                    this.onSongPress(item)}
                }
                style={{
                    width: '100%',
                    borderBottomWidth: 1,
                    borderBottomColor: this.state.theme.activity.borderColor,
                    paddingTop: 16,
                    paddingBottom: 16
                }}
            >
                <Text
                    style={{
                        color: this.state.theme.textSecondaryColor,
                        fontSize: 15,
                        fontWeight: '500',
                        marginBottom: 4
                    }}
                >{Moment(item.created_at).format('d MMM Y')}</Text>
                <Text
                    style={{
                        color: this.state.theme.textPrimaryColor,
                        fontSize: 17,
                        fontWeight: '500'
                    }}
                    numberOfLines={2}
                >{decode(item.title)}</Text>
                <Text
                    style={{
                        color: this.state.theme.textSecondaryColor,
                        fontSize: 15,
                        fontWeight: '500',
                        marginTop: 8
                    }}
                    numberOfLines={2}
                >{item.description}</Text>
                <View
                    style={{
                        flexDirection: 'row',
                        marginTop: 12
                    }}
                >
                    <TouchableOpacity
                        style={{
                            marginRight: 24
                        }}
                    >
                        <Text
                            style={{
                                color: this.state.theme.textSpotlightColor,
                                fontSize: 16,
                            }}
                        >Details</Text>
                    </TouchableOpacity>
                    <Text
                        style={{
                            color: this.state.theme.textSecondaryColor,
                            fontSize: 16,
                        }}
                    >{humanTime(item.duration)}</Text>
                </View>
            </TouchableOpacity>
        );

    };
}
const styles = StyleSheet.create({
    container: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center'
    },
    artwork: {
        borderRadius: 3,
    },
    song_info: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'flex-start'
    },
    songListView: {
        height: 70,
        borderRadius: 4,
        overflow: 'hidden',
        flexDirection: 'row',
        alignItems: 'center',
    },
    more: {
        width: 40,
        height: 50,
        alignItems: 'center',
        justifyContent: 'center',
    },
    textSongTitle: {
        fontSize: 16,
        marginLeft: 8,
        fontWeight: '500'
    },
    textSongArtist: {
        fontSize: 15,
        marginLeft: 8,
        marginTop: 6,
        fontWeight: '400'
    },
});


export default connect(({routes, scroll, language, display, player, auth}) => ({routes, scroll, language, display, player, auth}))(Episode);
