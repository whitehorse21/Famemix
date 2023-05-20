import React, { Component } from "react";
import {View, TouchableOpacity, Image, FlatList, Text, ActivityIndicator, StyleSheet, Dimensions} from "react-native";
import {Actions} from 'react-native-router-flux';
import {connect} from "react-redux";
import FastImage from "react-native-fast-image";
const GLOBAL = require('../../config/Global');

class Playlist extends Component {
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
    getItemWidth(){
        if(this.props.column)
            return ((this.props.layoutWidth - (16 + 8*(this.props.column-1)))/this.props.column);
        else {
            if(this.props.layoutWidth < 700) {
                return ((this.props.layoutWidth - 40) / 2)
            } else return 160;
        }
    }
    render() {
        if (!this.props.PlaylistData) {
            return <ActivityIndicator color={this.state.theme.indicatorColor} style={ styles.container }/>;
        }
        if (!this.props.PlaylistData.length) {
            return (<View style={ styles.container }><Text style={{color: this.state.theme.noDataTextColor}}>No data has been found</Text></View>);
        }
        if (this.props.horizontal)
            return (
                <FlatList
                    data={this.props.PlaylistData}
                    horizontal={true}
                    showsHorizontalScrollIndicator={false}
                    keyExtractor={this.keyExtractor}
                    renderItem={this.renderPlaylist}
                    scrollEnabled={false}
                    theme={this.state.theme}
                />
            );
        else
            return (
                <FlatList
                    data={this.props.PlaylistData}
                    numColumns={this.props.column}
                    key={this.props.column}
                    keyExtractor={this.keyExtractor}
                    renderItem={this.renderPlaylist}
                    scrollEnabled={false}
                    theme={this.state.theme}
                />
            );
    }
    keyExtractor = (item, index) => index.toString();
    renderPlaylist = ({ item, index }) => {
        if(this.props.element === "activity") {
            if(this.props.PlaylistData.length === 1) {
                return (
                    <View style={{flexDirection: 'row'}}>
                        <TouchableOpacity onPress={() => { Actions.playlistShow({ playlist: item}) }} style={{height: 80, width: 80, float: 'left'}}>
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
                            <Text style={{fontWeight: 'bold', color: '#f77f00', marginBottom: 3}} numberOfLines={1}>{item.name}</Text>
                        </View>
                    </View>
                );
            } else {
                return (
                    <TouchableOpacity onPress={() => {  Actions.playlistShow({ playlist: item}) }} style={{height: 40, width: 40, marginRight: 3}}>
                        <FastImage
                            style={{
                                width: 40, height: 40, borderRadius: 3
                            }}
                            source={{
                                uri: item.artwork_url,
                                priority: FastImage.priority.normal,
                            }}
                            resizeMode={FastImage.resizeMode.contain}
                        />
                    </TouchableOpacity>
                );
            }
        } else if(this.props.column && ! this.props.search)
            return (
                <TouchableOpacity style={[styles.playlist_view, {padding: 8, width: (100/this.props.column) + '%'}]} id={item.id} onPress={ () => Actions.playlistShow({ playlist: item}) } >
                    <FastImage
                        style={[
                            styles.artwork
                        ]}
                        source={{
                            uri: item.artwork_url,
                            priority: FastImage.priority.normal,
                        }}
                        resizeMode={FastImage.resizeMode.contain}
                    />
                    <Text style={[styles.playlistName, {color: this.state.theme.textPrimaryColor}]} numberOfLines={1}>{item.title}</Text>
                </TouchableOpacity>
            );
        else if(this.props.search)
            return (
                <TouchableOpacity style={styles.search_playlist_view} id={item.id} onPress={ () => Actions.playlistShow({ playlist: item}) } >
                    <FastImage
                        style={[
                            styles.searchArtwork,
                            {
                                width: 50,
                                height: 50
                            }
                        ]}
                        source={{
                            uri: item.artwork_url,
                            priority: FastImage.priority.normal,
                        }}
                        resizeMode={FastImage.resizeMode.contain}
                    />
                    <Text style={[styles.searchPlaylistName, {color: this.state.theme.textPrimaryColor}]} numberOfLines={1}>{item.title}</Text>
                </TouchableOpacity>
            );
        else
            return (
            <TouchableOpacity style={[styles.playlist_view, {marginLeft: index === 0 ? 16 : 8, marginRight: (index+1) === this.props.PlaylistData.length ? 16 : 0, width: this.getItemWidth()}]} id={item.id} onPress={ () => Actions.playlistShow({ playlist: item}) } >
                <View>
                    <FastImage
                        style={
                            [
                                styles.artwork,
                                {
                                    width: this.getItemWidth(),
                                    height: this.getItemWidth(),
                                }
                            ]
                        }
                        source={{
                            uri: item.artwork_url,
                            priority: FastImage.priority.normal,
                        }}
                    />
                    <Text style={[styles.playlistName, {color: this.state.theme.textPrimaryColor}]} numberOfLines={1}>{item.title}</Text>
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
    search_playlist_view: {
        flexDirection: 'row',
        height: 70,
        alignItems: 'center',
        paddingLeft: 16
    },
    searchArtwork: {
        marginRight: 8,
        borderRadius: 4
    },
    playlist_view: {
        marginBottom: 16,
    },
    artwork: {
        borderRadius: 4,
        width: '100%',
        aspectRatio: 1
    },
    searchPlaylistName: {
        fontSize: 14,
        fontWeight: 'bold'
    },
    playlistName: {
        marginTop: 16,
        fontSize: 14,
        fontWeight: 'bold'
    },
});


export default connect(({routes, scroll, language, display, player, auth}) => ({routes, scroll, language, display, player, auth}))(Playlist);
