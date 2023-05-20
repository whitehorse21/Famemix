import React, { Component } from "react";
import {View, TouchableOpacity, Image, FlatList, Text, ActivityIndicator, StyleSheet, Dimensions} from "react-native";
import {Actions} from 'react-native-router-flux';
import {connect} from "react-redux";
import FastImage from 'react-native-fast-image';
import {decode} from "html-entities";
const GLOBAL = require('../../config/Global');

class Podcast extends Component {
    constructor(props) {
        super(props);
        this.state = {
            theme: this.props.display.darkMode ? GLOBAL.themes.dark : GLOBAL.themes.light,
        };
    }
    componentWillReceiveProps(nextProps, nextContent): void {
        if(this.props.display.darkMode !== nextProps.display.darkMode ) {
            nextProps.display.darkMode ? this.setState({theme: GLOBAL.themes.dark}) : this.setState({theme: GLOBAL.themes.light})
        }
    }
    getColumns() {
        return this.props.layoutWidth > 700 ? 4 : 2;
    }
    getItemWidth(){
        if(this.props.column)
            return ((window.width - (16 + 8*(this.props.column-1)))/this.props.column);
        else {
            if(this.props.layoutWidth < 700) {
                return ((this.props.layoutWidth - 40) / 2)
            } else return 160;
        }
    }
    render() {
        if (!this.props.PodcastData) {
            return <ActivityIndicator color={this.state.theme.indicatorColor} style={[styles.container, {backgroundColor: this.state.theme.primaryBackgroundColor}]}/>;
        }
        if (!this.props.PodcastData.length) {
            return (<View style={ styles.container }><Text style={{color: this.state.theme.noDataTextColor}}>No data has been found</Text></View>);
        }
        if (this.props.horizontal)
            return (
                <FlatList
                    data={this.props.PodcastData}
                    horizontal={true}
                    showsHorizontalScrollIndicator={false}
                    keyExtractor={this.keyExtractor}
                    renderItem={this.renderCategory}
                    theme={this.state.theme}
                />
            );
        else
            return (
                <FlatList
                    data={this.props.PodcastData}
                    numColumns={this.props.column}
                    key={this.props.column}
                    keyExtractor={this.keyExtractor}
                    renderItem={this.renderCategory}
                    theme={this.state.theme}
                />
            );
    }
    keyExtractor = (item, index) => index.toString();
    renderCategory = ({ item, index }) => {
        if(this.props.column && ! this.props.search)
            //Gird view
            return (
                <TouchableOpacity style={[styles.album_view, {padding: 8, width: (100/this.props.column) + '%'}]} id={item.id} onPress={ () => Actions.podcastShow({ podcast: item}) } >
                    <FastImage
                        style={[styles.artwork, {width: '100%', aspectRatio: 1}]}
                        source={{
                            uri: item.artwork_url,
                            priority: FastImage.priority.normal,
                        }}
                        resizeMode={FastImage.resizeMode.contain}
                    />
                    <View style={styles.album_info}>
                        <Text  style={[styles.text_albumname, {color: this.state.theme.textPrimaryColor}]} numberOfLines={1}>{item.title}</Text>
                        <Text style={[styles.textArtistName, {color: this.state.theme.textSecondaryColor}]} numberOfLines={1}>{item.artist.name}</Text>
                    </View>
                </TouchableOpacity>
            );
        else if(this.props.search)
            //Search view
            return (
                <TouchableOpacity style={styles.search_album_view} id={item.id} onPress={ () => Actions.podcastShow({ podcast: item}) } >
                    <FastImage
                        style={[styles.search_artwork, {width: 50, height: 50}]}
                        source={{
                            uri: item.artwork_url,
                            priority: FastImage.priority.normal,
                        }}
                        resizeMode={FastImage.resizeMode.contain}
                    />
                    <View>
                        <Text style={[styles.text_albumname, {color: this.state.theme.textPrimaryColor}]} numberOfLines={1}>{decode(item.title)}</Text>
                        <Text style={[styles.textArtistName, {color: this.state.theme.textSecondaryColor}]} numberOfLines={1}>{decode(item.artist.name)}</Text>
                    </View>
                </TouchableOpacity>
            );
        else
            //horizontal list view
            return (
                <TouchableOpacity style={[styles.album_view, {marginLeft: index === 0 ? 16 : 8, marginRight: (index+1) === this.props.PodcastData.length ? 16 : 0, width: this.getItemWidth()}]} id={item.id} onPress={ () => Actions.podcastShow({ podcast: item}) } >
                    <FastImage
                        style={[styles.artwork, {width: this.getItemWidth(), aspectRatio: 1}]}
                        source={{
                            uri: item.artwork_url,
                            priority: FastImage.priority.normal,
                        }}
                        resizeMode={FastImage.resizeMode.contain}
                    />
                    <View style={styles.album_info}>
                        <Text style={[styles.text_albumname, {color: this.state.theme.textPrimaryColor}]} numberOfLines={1}>{decode(item.title)}</Text>
                        <Text style={[styles.textArtistName, {color: this.state.theme.textSecondaryColor}]} numberOfLines={1}>{decode(item.artist.name)}</Text>
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
    search_album_view: {
        flexDirection: 'row',
        height: 70,
        alignItems: 'center',
        width: '100%',
        paddingLeft: 12
    },
    search_artwork: {
        marginRight: 8,
        borderRadius: 4
    },
    artwork: {
        borderRadius: 4,
    },
    album_info: {
      marginTop: 8
    },
    album_view: {
        marginBottom: 16,
    },
    text_albumname: {
        fontSize: 16,
        marginBottom: 4,
        fontWeight: '500'
    },
    textArtistName: {
        fontSize: 15,
    },
});


export default connect(({routes, scroll, language, display, player, auth}) => ({routes, scroll, language, display, player, auth}))(Podcast);
