/*
 * Created by ninacoder
 * @https://codecanyon.net/user/codenamenina
 */

'use strict';
import React, { Component } from 'react';
import {StyleSheet, Text, View, ScrollView, ActivityIndicator} from 'react-native';
import NavHeader from '../common/NavHeader';
import Album from '../../models/Album';
import Playlist from '../../models/Playlist';
import Artist from '../../models/Artist';
import Song from '../../models/Song';
import {connect} from "react-redux";
import {changeStatusBarStyle} from "../../helpers/Functions";

import API from "../../helpers/Axios";
const GLOBAL = require('../../../config/Global');

class GenreDetails extends Component {
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
            error: null
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
        API.get(`genre/${this.props.row.alt_name}/${this.props.kind}?page=${page}`)
            .then(res => {
                this.setState((prevState, nextProps) => ({
                    data:
                        page === 1
                            ? Array.from(res.data)
                            : [...this.state.data, ...res.data],
                    loading: false,
                    loadingMore: false
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
                <NavHeader title={this.props.row.name}/>
                <ScrollView ref={(scroll) => {this.scroll = scroll;}}
                            showsVerticalScrollIndicator={false}
                            onScroll={(e) => {
                                let paddingToBottom = 100;
                                paddingToBottom += e.nativeEvent.layoutMeasurement.height;
                                if(e.nativeEvent.contentOffset.y >= e.nativeEvent.contentSize.height - paddingToBottom && (this.state.data.length/(this.state.page*20) === 1)) {
                                    this._handleLoadMore();
                                }
                            }}>

                    {this.state.data.length > 0 && this.props.kind === 'songs' && (
                        <Song SongData={this.state.data} theme={this.state.theme} layoutWidth={this.state.layoutWidth}/>
                    )}

                    {this.state.data.length > 0 && this.props.kind === 'albums' && (
                        <ScrollView showsVerticalScrollIndicator={false} style={{padding: 8}}>
                            <Album AlbumData={this.state.data} theme={this.state.theme} horizontal={false} column={(this.state.layoutWidth > 1000) ? 5 : ((this.state.layoutWidth > 500) ? 3 : 2)} layoutWidth={this.state.layoutWidth}/>
                        </ScrollView>
                    )}

                    {this.state.data.length > 0 && this.props.kind === 'artists' && (
                        <ScrollView showsVerticalScrollIndicator={false} style={{padding: 8}}>
                            <Artist ArtistData={this.state.data} theme={this.state.theme} horizontal={false} column={(this.state.layoutWidth > 1000) ? 5 : ((this.state.layoutWidth > 500) ? 3 : 2)} layoutWidth={this.state.layoutWidth}/>
                        </ScrollView>
                    )}

                    {this.state.data.length > 0 && this.props.kind === 'playlists' && (
                        <ScrollView showsVerticalScrollIndicator={false} style={{padding: 8}}>
                            <Playlist PlaylistData={this.state.data} theme={this.state.theme} horizontal={false} column={(this.state.layoutWidth > 1000) ? 5 : ((this.state.layoutWidth > 500) ? 3 : 2)} layoutWidth={this.state.layoutWidth}/>
                        </ScrollView>
                    )}

                    {(this.state.loading || this.state.loadingMore) > 0 && (
                        <ActivityIndicator color={this.state.theme.indicatorColor} style={this.state.theme.activityIndicator}/>
                    )}
                    {this.renderMarginBottom()}
                </ScrollView>
            </View>
        );
    }
}

const styles = StyleSheet.create({
    container: {
        flex: 1
    },
    content: {
        paddingTop: 16,
    },
});


export default connect(({routes, scroll, language, display, player, auth}) => ({routes, scroll, language, display, player, auth}))(GenreDetails);
