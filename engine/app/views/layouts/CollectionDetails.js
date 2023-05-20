/*
 * Created by ninacoder
 * @https://codecanyon.net/user/codenamenina
 */

'use strict';
import React, { Component } from 'react';
import {StyleSheet, View, ScrollView, ActivityIndicator, Text, Animated} from 'react-native';
import NavHeader from '../common/NavHeader';
import Album from '../../models/Album';
import Playlist from '../../models/Playlist';
import Artist from '../../models/Artist';
import Song from '../../models/Song';
import Station from '../../models/Station';
import {connect} from "react-redux";
import {changeStatusBarStyle} from "../../helpers/Functions";

import API from "../../helpers/Axios";
import Podcast from "../../models/Podcast";
const GLOBAL = require('../../../config/Global');

class CollectionDetails extends Component {
    static onEnter = async () => {
        changeStatusBarStyle();
    };
    onLayoutScreen = (e) => {
        let width = e.nativeEvent.layout.width;
        if (width !== this.state.layoutWidth) {
            this.setState({
                layoutWidth: width,
            })
        }
    };
    constructor(props) {
        super(props);
        this.state = {
            layoutWidth: window.width,
            mini: props.player.show ? props.player.show : false,
            theme: this.props.display.darkMode ? GLOBAL.themes.dark : GLOBAL.themes.light,
            data: [],
            page: 1,
            loading: true,
            loadingMore: false,
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
    componentDidMount() {
        this._fetchData();
    }
    _fetchData = () => {
        const { page } = this.state;
        API.get(`channel/${this.props.item.alt_name}?page=${page}`)
            .then(res => {
                this.setState((prevState, nextProps) => ({
                    data:
                        page === 1
                            ? Array.from(res.data.objects.data)
                            : [...this.state.data, ...res.data.objects.data],
                    loading: false,
                    loadingMore: false,
                    refreshing: false,
                }));
            });
    };
    _handleLoadMore = () => {
        if(this.state.page < 6) this.setState(
            (prevState, nextProps) => ({
                page: prevState.page + 1,
                loadingMore: true
            }),
            () => {
                this._fetchData();
            }
        );
    };
    render(){
        return (
            <View style={[styles.container, {backgroundColor: this.state.theme.primaryBackgroundColor}]} onLayout={this.onLayoutScreen}>
                <NavHeader title={this.props.title}/>
                <ScrollView ref={(scroll) => {this.scroll = scroll;}}
                            showsVerticalScrollIndicator={false}
                            onScroll={(e) => {
                                let paddingToBottom = 100;
                                paddingToBottom += e.nativeEvent.layoutMeasurement.height;
                                if(e.nativeEvent.contentOffset.y >= e.nativeEvent.contentSize.height - paddingToBottom && (this.state.data.length/(this.state.page*20) === 1)) {
                                    this._handleLoadMore();
                                }
                            }}
                            scrollEventThrottle={16}

                >
                    <View style={{
                        margin: 16
                    }}>
                        <Text
                            style={{
                                fontSize: 24,
                                fontWeight: '600',
                                color: this.state.theme.textPrimaryColor,
                                marginBottom: 4
                            }}
                        >{this.props.item.title}</Text>
                        <Text
                            style={{
                                color: this.state.theme.textSecondaryColor,
                            }}
                        >{this.props.item.description}</Text>
                    </View>
                    {this.state.data.length > 0 && this.props.item.object_type === 'song' && (
                        <Song SongData={this.state.data} theme={this.state.theme} layoutWidth={this.state.layoutWidth}/>
                    )}

                    {this.state.data.length > 0 && this.props.item.object_type === 'album' && (
                        <ScrollView showsVerticalScrollIndicator={false} style={{padding: 8}}>
                            <Album AlbumData={this.state.data} theme={this.state.theme} horizontal={false} column={(this.state.layoutWidth > 1000) ? 5 : ((this.state.layoutWidth > 500) ? 3 : 2)} layoutWidth={this.state.layoutWidth}/>
                        </ScrollView>
                    )}

                    {this.state.data.length > 0 && this.props.item.object_type === 'artist' && (
                        <ScrollView showsVerticalScrollIndicator={false} style={{padding: 8}}>
                            <Artist ArtistData={this.state.data} theme={this.state.theme} horizontal={false} column={(this.state.layoutWidth > 1000) ? 5 : ((this.state.layoutWidth > 500) ? 3 : 2)} layoutWidth={this.state.layoutWidth}/>
                        </ScrollView>
                    )}

                    {this.state.data.length > 0 && this.props.item.object_type === 'playlist' && (
                        <ScrollView showsVerticalScrollIndicator={false} style={{padding: 8}}>
                            <Playlist PlaylistData={this.state.data} theme={this.state.theme} horizontal={false} column={(this.state.layoutWidth > 1000) ? 5 : ((this.state.layoutWidth > 500) ? 3 : 2)} layoutWidth={this.state.layoutWidth}/>
                        </ScrollView>

                    )}

                    {this.state.data.length > 0 && this.props.item.object_type === 'station' && (
                        <ScrollView showsVerticalScrollIndicator={false} style={{padding: 8}}>
                            <Station stationData={this.state.data} horizontal={false} />
                        </ScrollView>
                    )}

                    {this.state.data.length > 0 && this.props.item.object_type === 'podcast' && (
                        <ScrollView showsVerticalScrollIndicator={false} style={{padding: 8}}>
                            <Podcast PodcastData={this.state.data} horizontal={false} column={(this.state.layoutWidth > 1000) ? 5 : ((this.state.layoutWidth > 500) ? 3 : 2)} layoutWidth={this.state.layoutWidth}/>
                        </ScrollView>
                    )}

                    {(this.state.loading || this.state.loadingMore) > 0 && (
                        <ActivityIndicator color={this.state.theme.indicatorColor} style={this.state.theme.activityIndicator}/>
                    )}
                </ScrollView>
                {this.renderMarginBottom()}
            </View>
        );
    }
}

const styles = StyleSheet.create({
    container: {
        flex: 1
    },
    content: {
        paddingTop: 8,
    },
});

export default connect(({routes, scroll, language, display, player, auth}) => ({routes, scroll, language, display, player, auth}))(CollectionDetails);
