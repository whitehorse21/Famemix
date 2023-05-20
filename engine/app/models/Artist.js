import React, { Component } from "react";
import {
    View, TouchableOpacity, Image, FlatList, Text, ActivityIndicator, StyleSheet, Platform,
    Dimensions
} from "react-native";
import {Actions} from 'react-native-router-flux';
import {connect} from "react-redux";
import FastImage from "react-native-fast-image";
const GLOBAL = require('../../config/Global');

class Artist extends Component {
    constructor(props) {
        super(props);
        this.state = {
            theme: this.props.display.darkMode ? GLOBAL.themes.dark : GLOBAL.themes.light,
        };
        Dimensions.addEventListener('change', () => {
            try {
                this.setState({window: Dimensions.get('window')});
            } catch (e) {

            }
        });
    }
    async componentWillReceiveProps(nextProps, nextContent): void {
        if(this.props.display.darkMode !== nextProps.display.darkMode ) {
            nextProps.display.darkMode ? this.setState({theme: GLOBAL.themes.dark}) : this.setState({theme: GLOBAL.themes.light})
        }
    }
    getItemWidth(){
        if(this.props.column)
            return ((this.props.layoutWidth - (32 + 8*(this.props.column-1)))/this.props.column);
        else {
            if(this.props.layoutWidth < 700) {
                return ((this.props.layoutWidth - 40) / 2)
            } else return 160;
        }
    }
    render() {
        if (!this.props.ArtistData) {
            return <ActivityIndicator color={this.state.theme.indicatorColor} style={ styles.container }/>;
        }
        if (!this.props.ArtistData.length) {
            return (<View style={ styles.container }><Text style={{color: this.state.theme.noDataTextColor}}>No data has been found</Text></View>);
        }
        if (this.props.horizontal)
            return (
                <FlatList
                    data={this.props.ArtistData}
                    horizontal={true}
                    keyExtractor={this.keyExtractor}
                    renderItem={this.renderArtist}
                    theme={this.state.theme}
                />
            );
        else
            return (
                <FlatList
                    data={this.props.ArtistData}
                    numColumns={this.props.column}
                    key={this.props.column}
                    keyExtractor={this.keyExtractor}
                    renderItem={this.renderArtist}
                    theme={this.state.theme}
                />
            );
    }
    keyExtractor = (item, index) => index.toString();
    renderArtist = ({ item, index }) => {
        if(this.props.element === "activity") {
            if(this.props.ArtistData.length === 1) {
                return (
                    <View style={{flexDirection: 'row'}}>
                        <TouchableOpacity onPress={() => {Actions.artistShow({ artist: item})}} style={{height: 80, width: 80, float: 'left'}}>
                            <FastImage
                                style={{width: 80, height: 80, borderRadius: 40}}
                                source={{
                                    uri: item.artwork_url,
                                    priority: FastImage.priority.normal,
                                }}
                            />
                        </TouchableOpacity>
                        <View style={{flex: 1, paddingLeft: 10}}>
                            <Text style={{fontWeight: 'bold', color: '#f77f00', marginBottom: 3}} numberOfLines={1}>{item.name}</Text>
                        </View>
                    </View>
                );
            } else {
                return (
                    <TouchableOpacity onPress={() => {Actions.artistShow({ artist: item})}} style={{height: 40, width: 40, marginRight: 3}}>
                        <FastImage
                            style={{width: 40, height: 40, borderRadius: 20}}
                            source={{
                                uri: item.artwork_url,
                                priority: FastImage.priority.normal,
                            }}
                        />
                    </TouchableOpacity>
                );
            }
        } else if(this.props.column && ! this.props.search)
            return (
                    <TouchableOpacity style={[styles.item_view, {padding: 8, width: (100/this.props.column) + '%'}]} id={item.id} onPress={ () => Actions.artistShow({ artist: item}) } >
                        <FastImage
                            style={ [styles.artwork, {width: '100%', aspectRatio: 1, borderRadius: this.getItemWidth() / 2}] }
                            source={{
                                uri: item.artwork_url,
                                priority: FastImage.priority.normal,
                            }}
                        />
                        <Text style={[styles.item_title_text, {color: this.state.theme.textPrimaryColor}]} numberOfLines={1}>{item.name}</Text>
                    </TouchableOpacity>
            );
        else if(this.props.search)
            return (
                <TouchableOpacity style={[styles.item_search_view,  {width: '100%'}]} onPress={ () => Actions.artistShow({ artist: item}) }>
                    <FastImage
                        style={ [styles.search_artwork] }
                        source={{
                            uri: item.artwork_url,
                            priority: FastImage.priority.normal,
                        }}
                    />
                    <Text style={[styles.search_item_title_text, {color: this.state.theme.textPrimaryColor}]} numberOfLines={1}>{item.name}</Text>
                </TouchableOpacity>
            );
        else
            //horizontal list view
            return (
                <TouchableOpacity style={[styles.item_view, {marginLeft: index === 0 ? 16 : 8, marginRight: (index+1) === this.props.ArtistData.length ? 16 : 0, width: this.getItemWidth()}]} onPress={ () => Actions.artistShow({ artist: item}) }>
                    <FastImage
                        style={[styles.artwork, {width: this.getItemWidth(), aspectRatio: 1, borderRadius: this.getItemWidth() / 2}]}
                        source={{
                            uri: item.artwork_url,
                            priority: FastImage.priority.normal,
                        }}
                    />
                    <Text style={[styles.item_title_text, {color: this.state.theme.textPrimaryColor}]} numberOfLines={1}>{item.name}</Text>
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
    item_search_view: {
        flexDirection: 'row',
        height: 70,
        alignItems: 'center',
        paddingLeft: 16
    },
    search_artwork: {
        marginRight: 8,
        borderRadius: 25,
        width: 50,
        height: 50
    },
    search_item_title_text: {
        fontSize: 13,
        fontWeight:'bold',
    },
    item_view: {
        marginBottom: 20,
    },
    blur_background_view: {
        borderRadius: 4,
        overflow: 'hidden',
        width: '100%',
        aspectRatio: 1,
        alignItems: 'center',
        justifyContent: 'center'
    },

    artwork: {
        /*...Platform.select({
            ios: {
                shadowColor: 'rgba(0, 0, 0, .5)',
                shadowOffset: { width: 0, height: 1 },
                shadowOpacity: 0.5,
                shadowRadius: 3,
            },
        }),*/
    },
    item_title_text: {
        fontSize: 14,
        marginBottom: 4,
        marginTop: 16,
        textAlign: 'center',
        fontWeight: 'bold'
    },
    item_subtitle_text: {
        fontSize: 14,
    },
});


export default connect(({routes, scroll, language, display, player, auth}) => ({routes, scroll, language, display, player, auth}))(Artist);
