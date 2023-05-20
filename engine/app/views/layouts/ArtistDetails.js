import React, {Component} from "react";
import {Dimensions, Platform, StyleSheet, TouchableOpacity, View, ScrollView, Text} from "react-native";
import AsyncStorage from '@react-native-async-storage/async-storage';
import Album from '../../models/Album';
import { Actions } from 'react-native-router-flux';
import Artist from '../../models/Artist';
import Song from '../../models/Song';
import Icon from 'react-native-vector-icons/MaterialIcons';
const GLOBAL = require('../../../config/Global');
import NavHeader from '../common/NavHeader';
import {connect} from "react-redux";
import {changeStatusBarStyle} from "../../helpers/Functions";
import API from "../../helpers/Axios";

const window = Dimensions.get('window');

class ArtistDetails extends Component {
    static onEnter = async () => {
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
            layoutWidth: window.width,
            activeTab: 0,
            page: 1,
            loading: false,
            mini: props.player.show ? props.player.show : false,
            theme: this.props.display.darkMode ? GLOBAL.themes.dark : GLOBAL.themes.light,
        };
    }
    componentWillReceiveProps(nextProps) {
        if( this.props.player.show !==  nextProps.player.show) {
            this.setState({mini: nextProps.player.show});
        }
    }
    renderMarginBottom() {
        if (this.state.mini) {
            return (
                <View style={{marginBottom: 50}}/>
            )
        }
    }
    async componentDidMount() {
        API.post(`artist/${this.props.artist.id}/songs`)
            .then(res => {
                this.setState({
                    SongData: res.songs,
                });
            });
    }
    render(){
        if(this.props.kind === 'songs')
            return (
                <View style={[styles.artist_container, {backgroundColor: this.state.theme.primaryBackgroundColor}]} onLayout={this.onLayoutScreen}>
                    <NavHeader title={this.props.artist.name + '\'s songs'}/>
                    <ScrollView showsVerticalScrollIndicator={true}>
                        <TouchableOpacity onPress={ () => {
                            //Get random id to play shuffle
                            let maxIndex = this.state.PopularData.length - 1;
                            let randomSongIndex = Math.floor(Math.random() * (maxIndex - 0 + 1)) + 0;
                            //Send data to player
                            Actions.player({ shuffle: true, songIndex: randomSongIndex , songs: this.state.PopularData});
                            AsyncStorage.setItem('QueueList', JSON.stringify(this.state.PopularData));
                        }}
                        >
                            <View style={[styles.playButton, {backgroundColor: this.state.theme.buttonColor}]}>
                                <Icon name="play-circle-filled" size={18} style={{marginRight: 10, color: 'rgba(255, 255, 255, .8)'}}/>
                                <Text style={[styles.playButtonText, {color: this.state.theme.buttonTextColor}]}>
                                    SHUFFLE PLAY
                                </Text>
                            </View>
                        </TouchableOpacity>
                        <Song SongData={this.state.PopularData} theme={this.state.theme}/>
                        {this.renderMarginBottom()}
                    </ScrollView>
                </View>
            );
        else if(this.props.kind === 'artists')
            return (
                <View style={[styles.artist_container, {backgroundColor: this.state.theme.primaryBackgroundColor}]} onLayout={this.onLayoutScreen}>
                    <NavHeader title={this.props.artist.name + '\'s related artist'}/>
                    <ScrollView showsVerticalScrollIndicator={false} style={styles.artist_content}>
                        <Artist ArtistData={this.state.ArtistData} horizontal={false} column={(this.state.layoutWidth > 1000) ? 6 : ((this.state.layoutWidth > 500) ? 4 : 3)} layoutWidth={this.state.layoutWidth} theme={this.state.theme}/>
                    </ScrollView>
                    {this.renderMarginBottom()}
                </View>
            );
        else if(this.props.kind === 'albums')
            return (
                <View style={[styles.artist_container, {backgroundColor: this.state.theme.primaryBackgroundColor}]} onLayout={this.onLayoutScreen}>
                    <NavHeader title={this.props.artist.name + '\'s albums'}/>
                    <ScrollView showsVerticalScrollIndicator={false} style={styles.album_content}>
                        <Album AlbumData={this.state.AlbumData} horizontal={false} column={(this.state.layoutWidth > 1000) ? 5 : ((this.state.layoutWidth > 500) ? 3 : 2)} layoutWidth={this.state.layoutWidth} theme={this.state.theme}/>
                    </ScrollView>
                    {this.renderMarginBottom()}
                </View>
            )

    }

}

const styles = StyleSheet.create({
    loading: {
        width: window.width,
        height: 50,
        alignItems: 'center',
        justifyContent: 'center',
    },
    container: {
        zIndex: 1,
        width: "100%",
    },
    artist_container: {
        zIndex: 1,
        width: "100%",
        flex: 1
    },
    artist_content: {
        flex: 1,
    },
    album_content: {
        flex: 1,
    },
    tabItem: {
        width: window.width / 2,
        height: Platform.OS === "ios" ? 40 : 47,
    },
    playButtonArea: {
        flex: 1,
        alignItems: 'center',
        height: 35,
    },
    playButton: {
        marginTop: 20,
        borderRadius: 20,
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        height: 35,
        width: 250,
        marginLeft: (window.width - 250) / 2,
        marginBottom: 20,
    },
    playButtonText: {
        fontSize: 13,
        fontWeight: 'bold'
    },
});


export default connect(({routes, scroll, language, display, player, auth}) => ({routes, scroll, language, display, player, auth}))(ArtistDetails);
