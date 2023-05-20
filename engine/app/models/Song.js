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
import {playSong} from '../helpers/Functions';
import FastImage from "react-native-fast-image";
import Icon from 'react-native-vector-icons/Feather';
import {decode} from "html-entities";

const GLOBAL = require('../../config/Global');

class Song extends Component {
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
        if (!this.props.SongData) {
            return <ActivityIndicator color={this.state.theme.indicatorColor} style={ styles.container } />;
        }
        if (!this.props.SongData.length) {
            return (<View style={ styles.container }><Text style={{color: this.state.theme.noDataTextColor, textAlign: 'center'}}>No data has been found</Text></View>);
        }
        return (
            <FlatList
                data={this.props.SongData}
                keyExtractor={this.keyExtractor}
                renderItem={this.renderSong}
                numColumns={(this.props.layoutWidth > 700) ? 2 : 1}
                key={(this.props.layoutWidth > 700) ? 2 : 1}
                horizontal={this.props.element === "activity" && this.props.SongData.length !== 1}
                showsHorizontalScrollIndicator={false}
                scrollEnabled={this.props.element === "activity"}
                theme={this.state.theme}
            />
        );
    }
    onSongPress(item){
        playSong(item)
    }
    hasId(data, id) {
        return data.some(function (el) {
            return el.id === id;
        });
    }
    renderArtists(item){
        if(item.downloaded)
            return (<View
                style={{
                    flexDirection: 'row',
                    alignItems: 'center',
                    marginLeft: 8,
                    marginTop: 6,
                }}
            >
                <Icon name="smartphone" size={12} color={this.state.theme.moreIconColor} />
                <Text style={{fontSize: 15, color: this.state.theme.textSecondaryColor}}
                      numberOfLines={1}>{item.name ? decode(item.name) : item.artists.map(function (artist) {
                    return decode(artist.name)
                }).join(", ")}</Text>
            </View>);
        else
            return  (
                <Text style={[styles.textSongArtist, {color: this.state.theme.textSecondaryColor}]}
                      numberOfLines={1}>{item.name ? decode(item.name) : item.artists.map(function (artist) {
                    return decode(artist.name)
                }).join(", ")}</Text>
            );
    }
    keyExtractor = (item, index) => index.toString();
    renderSong = ({ item, index }) => {
        let moreButton;
        if( this.props.Offline && item.download === false ){
            moreButton = <ActivityIndicator color={this.state.theme.indicatorColor} style={{marginRight: 8}}/>;
        } else {
            moreButton = (
                <TouchableOpacity id={item.id} onPress={ () => Actions.contextMenu({ kind:'song', item: item}) } style={styles.more}>
                    <Icon name="more-vertical" size={16} color={this.state.theme.moreIconColor} />
                </TouchableOpacity>
            )
        }
        if(!item.id) return false;
        if(this.props.element === "activity") {
            if(this.props.SongData.length === 1) {
                return (
                    <View style={{flexDirection: 'row'}}>
                        <TouchableOpacity onPress={() => {Actions.songInfoModal({item: item})}} style={{height: 80, width: 80, float: 'left'}}>
                            <FastImage
                                style={{width: 80, height: 80, borderRadius: 3}}
                                source={{
                                    uri: item.artwork_url,
                                    priority: FastImage.priority.normal,
                                }}
                                resizeMode={FastImage.resizeMode.contain}
                            />
                        </TouchableOpacity>
                        <View style={{flex: 1, paddingLeft: 10}}>
                            <Text style={{fontWeight: '500', color:  this.state.theme.textPrimaryColor, marginBottom: 3, fontSize: 16}} numberOfLines={1}>{decode(item.title)}</Text>
                            <Text style={{fontWeight: '400', color:  this.state.theme.textSecondaryColor, fontSize: 15}} numberOfLines={1}>{item.artists.map(function (artist) {return artist.name}).join(", ")}</Text>
                        </View>
                    </View>
                );
            } else {
                return (
                    <TouchableOpacity onPress={() => {Actions.songInfoModal({item: item})}} style={{height: 40, width: 40, marginRight: 3}}>
                        <FastImage
                            style={{width: 40, height: 40, borderRadius: 3}}
                            source={{
                                uri: item.artwork_url,
                                priority: FastImage.priority.normal,
                            }}
                            resizeMode={FastImage.resizeMode.contain}
                        />
                    </TouchableOpacity>
                );
            }
        } else {
            return (
                <TouchableOpacity id={item.id} onPress={() => {this.onSongPress(item)}} delayLongPress={500} onLongPress={() => Actions.contextMenu({ kind:'song', item: item}) } style={[styles.songListView, {paddingLeft: this.props.carousel ? 4 : 16, width: (this.props.layoutWidth > 700) ? '50%' : '100%'}]}>
                    <FastImage
                        style={[
                            styles.artwork,
                            {
                                width: 50,
                                height: 50}
                            ]}
                        source={{
                            uri: item.artwork_url,
                            priority: FastImage.priority.normal,
                        }}
                        resizeMode={FastImage.resizeMode.contain}
                    />
                    <View style={styles.song_info}>
                        <Text style={[styles.textSongTitle, {color: this.state.theme.textPrimaryColor}]}
                              numberOfLines={1}>{decode(item.title)}</Text>
                        {this.renderArtists(item)}
                    </View>
                    {moreButton}
                </TouchableOpacity>
            );
        }
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


export default connect(({routes, scroll, language, display, player, auth}) => ({routes, scroll, language, display, player, auth}))(Song);
