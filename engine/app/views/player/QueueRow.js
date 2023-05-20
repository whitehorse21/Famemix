import React, {Component} from 'react';
import {
    View,
    Text,
    StyleSheet,
    Animated,
    TouchableOpacity,
    Image,
    Platform,
    Dimensions,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import {ifIphoneX, isIphoneX} from '../../helpers/ifIphoneX';
const GLOBAL = require("../../../config/Global");
import FastImage from "react-native-fast-image";
import {decode} from "html-entities";

const ANIMATION_DURATION = 250;
const ROW_HEIGHT = 60;

export default class QueueRow extends Component {
    constructor(props) {
        super(props);
        this.state = {
            theme: this.props.theme,

        };
        this._animated = new Animated.Value(1);
    }

    componentDidMount() {
        Animated.timing(this._animated, {
            toValue: 1,
            duration: ANIMATION_DURATION,
        }).start();
    }
    onRemove = () => {
        const { onRemove } = this.props;
        if (onRemove) {
            onRemove();
        }
        /*if (onRemove) {
            Animated.timing(this._animated, {
                toValue: 0,
                duration: ANIMATION_DURATION,
            }).start(() => onRemove());
        }*/
    };
    onPlaySong = () => {
        const { onPlaySong } = this.props;
        if (onPlaySong) {
            onPlaySong();
        }
    };
    render() {
        let theme = this.props.theme.name === 'light' ? GLOBAL.themes.light : GLOBAL.themes.dark;

        let markplaying;
        if(this.props.songPlaying.id === this.props.item.id){
            markplaying = <Image style={{width: 15, height: 15}} source={theme.name === 'light' ? require('../../../assets/images/black_playing_queue.gif') : require('../../../assets/images/white_playing_queue.gif')}  />;
        }else {
            markplaying = <Text style={{color: theme.player.queueNumberTextColor}}>{this.props.index+1}</Text>;
        }

        const rowStyles = [
            styles.song_list_view,
            /*
            {
                height: this._animated.interpolate({
                    inputRange: [0, 1],
                    outputRange: [0, ROW_HEIGHT],
                    extrapolate: 'clamp',
                }),
            },
            { opacity: this._animated },
            {
                transform: [
                    {
                        translateX: this._animated.interpolate({
                            inputRange: [0, 1],
                            outputRange: [300, 0],
                            extrapolate: 'clamp',
                        })
                    }
                ],
            },
             */
        ];

        return (
            <TouchableOpacity onPress={this.onPlaySong}>
                <Animated.View style={rowStyles}>
                    <View style={styles.queue_index}>
                        {markplaying}
                    </View>
                    <FastImage
                        style={{marginLeft: 8, borderRadius: 3, width: 40, height: 40}}
                        source={{
                            uri: this.props.item.artwork_url,
                            priority: FastImage.priority.normal,
                        }}
                        resizeMode={FastImage.resizeMode.contain}
                    />
                    <View style={styles.song_info}>
                        <Text style={[styles.textSongName, {color: theme.player.songTitleColor}]} numberOfLines={1}>{decode(this.props.item.title)}</Text>
                        <Text style={[styles.textArtistName, {color: theme.player.songArtistColor}]} numberOfLines={1}>{this.props.item.artists.constructor === Array && this.props.item.artists.map(function(artist){return artist.name}).join(", ")}</Text>
                    </View>
                    <TouchableOpacity onPress={this.onRemove} style={{position: 'absolute', right: 0, paddingLeft: 8, width: 40, height: 60, justifyContent: 'center', alignItems: 'center'}}>
                        <Icon name="close-circle" size={24} color={theme.player.buttonColor}/>
                    </TouchableOpacity>
                </Animated.View>
            </TouchableOpacity>
        );
    }
}
const styles = StyleSheet.create({
    panelContainer: {
        position: 'absolute',
        top: 0,
        bottom: 0,
        left: 0,
        right: 0
    },
    container: {
        flex: 1,
    },
    queue_index: {
        width: 20,
        height: 50,
        alignItems: 'center',
        justifyContent: 'center',
    },
    song_info: {
        flex: 1,
        height: 60,
        justifyContent: 'center',
        marginRight: 60,
    },
    song_list_view: {
        height: 60,
        overflow: 'hidden',
        flexDirection: 'row',
        alignItems: 'center'
    },
    more: {

    },
    moreIcon: {
        alignSelf: 'flex-end',
        justifyContent: 'center',
        alignItems: 'center',
        color: '#494949',
        marginTop: 12,
    },
    textSongName: {
        fontSize: 13,
        marginLeft: 8,
        fontWeight: 'bold'
    },
    textArtistName: {
        fontSize: 13,
        marginLeft: 8,
    },
    miniPlayerButton: {
        marginLeft: 8,
        marginRight: 8,
    }
});
