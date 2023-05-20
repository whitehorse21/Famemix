import React, { Component } from "react";
import {
    View,
    TouchableOpacity,
    Text,
    StyleSheet,
    Dimensions,
    ScrollView
} from "react-native";
import {connect} from "react-redux";
import {Actions} from "react-native-router-flux";
import Carousel from "react-native-snap-carousel";
import i18n from "i18n-js";
import * as Languages from "../helpers/Lang";
import Artist from "./Artist";
import Album from "./Album";
import Podcast from "./Podcast";
import Playlist from "./Playlist";
import User from "./User";
import Song from "./Song";
const GLOBAL = require('../../config/Global');
const window = Dimensions.get('window');

Object.defineProperty(Array.prototype, 'chunk_inefficient', {
    value: function(chunkSize) {
        let array = this;
        return [].concat.apply([],
            array.map(function(elem, i) {
                return i % chunkSize ? [] : [array.slice(i, i + chunkSize)];
            })
        );
    }
});

class Channel extends Component {
    onLayoutScreen = (e) => {
        let width = e.nativeEvent.layout.width;
        if (width !== this.state.layoutWidth) {
            this.setState({
                layoutWidth: width
            });
        }
    };
    onChangeLanguage = (language) => {
        this.setState({ currentLanguage: language });
    };
    constructor(props) {
        super(props);
        this.state = {
            currentLanguage: this.props.language.code,
            layoutWidth: window.width,
            theme: this.props.display.darkMode ? GLOBAL.themes.dark : GLOBAL.themes.light,
        };
        Dimensions.addEventListener('change', () => {
            try {
                this.setState({window: Dimensions.get('window')});
            } catch (e) {

            }
        });
    }
    async componentWillReceiveProps(nextProps) {
        if(this.props.display.darkMode !== nextProps.display.darkMode ) {
            nextProps.display.darkMode ? this.setState({theme: GLOBAL.themes.dark}) : this.setState({theme: GLOBAL.themes.light})
        }
        if(this.props.language.code !== nextProps.language.code ) {
            this.onChangeLanguage(nextProps.language.code)
        }
    }
    renderCollections(){
        i18n.locale = this.state.currentLanguage;
        i18n.fallbacks = true;
        i18n.translations = Languages;

        return this.props.data.map((item) => {
            if(item.objects.data.length) {
                let collectionHeader = (
                    <TouchableOpacity style={styles.separateHeadline} onPress={() => { Actions.collectionDetails({title: item.title, item: item}) }}>
                        <Text style={[styles.headline, {color: this.state.theme.headlineColor}]}>{item.title}</Text>
                        {item.description !== '' && <Text style={[styles.headlineDescription, {color: this.state.theme.textSecondaryColor}]}>{item.description}</Text>}
                        <Text style={[styles.textMore, {color: this.state.theme.moreTextColor}]}>{i18n.t('see_all')}</Text>
                    </TouchableOpacity>
                );
                if(item.object_type === "artist") {
                    return (
                        <View key={item.id}>
                            {collectionHeader}
                            <ScrollView showsHorizontalScrollIndicator={false} horizontal={true}>
                                <Artist ArtistData={item.objects.data} horizontal={true} layoutWidth={this.state.layoutWidth} theme={this.state.theme}/>
                            </ScrollView>
                        </View>
                    );
                } else if(item.object_type === "album") {
                    return (
                        <View key={item.id}>
                            {collectionHeader}
                            <ScrollView showsHorizontalScrollIndicator={false} horizontal={true} style={{padding: 0}}>
                                <Album AlbumData={item.objects.data} horizontal={true} layoutWidth={this.state.layoutWidth} theme={this.state.theme}/>
                            </ScrollView>
                        </View>
                    );
                } else if(item.object_type === "podcast") {
                    return (
                        <View key={item.id}>
                            {collectionHeader}
                            <ScrollView showsHorizontalScrollIndicator={false} horizontal={true} style={{padding: 0}}>
                                <Podcast PodcastData={item.objects.data} horizontal={true} layoutWidth={this.state.layoutWidth} theme={this.state.theme}/>
                            </ScrollView>
                        </View>
                    );
                } else if(item.object_type === "playlist") {
                    return (
                        <View key={item.id} >
                            {collectionHeader}
                            <ScrollView showsHorizontalScrollIndicator={false} horizontal={true}>
                                <Playlist PlaylistData={item.objects.data} horizontal={true} theme={this.state.theme} layoutWidth={this.state.layoutWidth}/>
                            </ScrollView>
                        </View>
                    );
                } else if(item.object_type === "user") {
                    return (
                        <View key={item.id}>
                            {collectionHeader}
                            <ScrollView showsHorizontalScrollIndicator={false} horizontal={true}>
                                <User UserData={item.objects.data} horizontal={true} theme={this.state.theme} layoutWidth={this.state.layoutWidth}/>
                            </ScrollView>
                        </View>
                    );
                } else if(item.object_type === "song") {
                    if(this.state.layoutWidth > 700) {
                        return (
                            <View key={item.id}>
                                {collectionHeader}
                                <Song SongData={item.objects.data} theme={this.state.theme} layoutWidth={this.state.layoutWidth}/>
                            </View>
                        )
                    } else {
                        return (
                            <View key={item.id}>
                                {collectionHeader}
                                <Carousel
                                    data={item.objects.data.chunk_inefficient(3)}
                                    renderItem={({item, index}) => {
                                        return <Song SongData={item} theme={this.state.theme} layoutWidth={this.state.layoutWidth} carousel={true}/>
                                    }}
                                    sliderWidth={this.state.layoutWidth}
                                    itemWidth={this.state.layoutWidth < 700 ? (this.state.layoutWidth-24) : 375}
                                    inactiveSlideScale={1}
                                    inactiveSlideOpacity={1}
                                    loop={false}
                                    removeClippedSubviews={false}
                                    extraData={this.state}
                                    autoplay={false}
                                />
                            </View>
                        )
                    }
                }
            }
        });
    }

    render() {
        return (
            <View style={{flex:1}} onLayout={this.onLayoutScreen}>
                {this.renderCollections()}
            </View>
        );
    }

}

const styles = StyleSheet.create({
    separateHeadline: {
        alignItems: 'flex-start',
        marginTop: 32,
        marginLeft: 16,
        marginRight: 16,
        marginBottom: 16
    },
    headline: {
        fontSize: 18,
        fontWeight: '500',
    },
    headlineDescription: {
        marginTop: 6,
        fontSize: 14,
    },
    textMore: {
        fontSize: 13,
        fontWeight: 'bold',
        position: 'absolute',
        right: 0,
    },
});

export default connect(({display, auth, language}) => ({display, auth, language}))(Channel);
