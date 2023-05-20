import React, {Component} from 'react';
import {View, Text, StyleSheet, Dimensions, ActivityIndicator, TouchableOpacity} from 'react-native';
import {Actions} from 'react-native-router-flux';
import {connect} from "react-redux";
import Video from 'react-native-video';
const GLOBAL = require('../../../config/Global');
import HTML from 'react-native-render-html';
import {store} from '../../../store/configureStore';
import API from '../../helpers/Axios';
import TrackPlayer from 'react-native-track-player';
import {msgShow} from '../../helpers/Functions';

class Ad extends Component {
    constructor(props) {
        super(props);
        this.state = {
            timeLeft: 0,
            theme: this.props.display.darkMode ? GLOBAL.themes.dark : GLOBAL.themes.light,
            window: Dimensions.get('window'),
            isLoading: true,
            banner: {}
        };
    }
    componentDidMount() {
        API.post('ad/get')
            .then(res => {
                this.setState({
                    isLoading: false,
                    banner: res.data
                });
                TrackPlayer.pause();
                setTimeout(() => {
                    store.dispatch({type: 'SHOW_MEDIA_AD'});
                }, 1000)
            }).catch (error => {
            Actions.pop();
        });
    }
    componentWillUnmount() {

    }
    onBuffer () {

    };
    videoError() {

    };
    endVideo() {
        store.dispatch({type: 'HIDE_MEDIA_AD'});
        TrackPlayer.play();
        setTimeout(() => {
            Actions.pop();
        }, 200);
    }
    onProgress = (data) => {
        if (data.playableDuration !== 0 && data.playableDuration > data.currentTime) {
            this.setState({
                timeLeft: parseInt(data.playableDuration - data.currentTime)
            })
        }
    }
    render () {
        if (this.state.isLoading) return (
            <View
                style={{
                    flex: 1,
                    backgroundColor: this.state.theme.primaryBackgroundColor,
                    position: 'absolute',
                    top: 0,
                    bottom: 0,
                    left: 0,
                    right: 0,
                    justifyContent: 'center',
                }}
            >
                <ActivityIndicator color={this.state.theme.indicatorColor} style={{flex: 1, backgroundColor: this.state.theme.primaryBackgroundColor}}/>
            </View>
        );
        return (
            <View
                style={{
                    flex: 1,
                    backgroundColor: this.state.theme.primaryBackgroundColor,
                    position: 'absolute',
                    top: 0,
                    bottom: 0,
                    left: 0,
                    right: 0,
                    justifyContent: 'center',
                }}
            >
                {this.state.banner.skippable &&
                <TouchableOpacity
                    onPress={() => {
                        this.endVideo()
                    }}
                    style={{
                        flex: 1,
                        backgroundColor: this.state.theme.buttonColor,
                        position: 'absolute',
                        top: 72,
                        left: 32,
                        height: 32,
                        borderRadius: 4,
                        paddingLeft: 8,
                        paddingRight: 8,
                        justifyContent: 'center',
                        alignContent: 'center',
                        zIndex: 5
                    }}
                >
                    <Text
                        style={{
                            color: this.state.theme.primaryButton.textColor,
                            textAlign: 'center',
                            fontWeight: 'bold'
                        }}
                    >Close</Text>
                </TouchableOpacity>
                }
                <View
                    style={{
                        flex: 1,
                        backgroundColor: this.state.theme.primaryButton.backgroundColor,
                        position: 'absolute',
                        top: 72,
                        right: 32,
                        width: 40,
                        height: 40,
                        borderRadius: 20,
                        justifyContent: 'center',
                        alignContent: 'center',
                    }}
                >
                    <Text
                        style={{
                            color: this.state.theme.primaryButton.textColor,
                            textAlign: 'center',
                            fontWeight: 'bold'
                        }}
                    >{this.state.timeLeft}</Text>
                </View>
                <Video
                    source={{
                        uri: this.state.banner.stream_url
                    }}
                    ref={(ref) => {
                        this.player = ref
                    }}
                    onBuffer={this.onBuffer}
                    onError={this.videoError}
                    style={styles.backgroundVideo}
                    onProgress={this.onProgress}
                    onEnd={() => this.endVideo()}
                />
                <View
                    style={{
                        position: 'absolute',
                        bottom: 50
                    }}
                >
                    <Text
                        style={{
                            color: this.state.theme.textPrimaryColor,
                            textAlign: 'center',
                            marginBottom: 8
                        }}
                    >{this.state.banner.description}</Text>
                    {this.state.banner.code &&
                    <HTML
                        source={{ html: this.state.banner.code }}
                        baseFontStyle={{fontSize: 15, color: this.state.theme.staticPage.fontColor}}
                        imagesMaxWidth={(this.state.window.width - 32)}
                    />
                    }
                </View>
            </View>
        );
    }
}

const styles = StyleSheet.create({
    container: {
        backgroundColor: 'rgba(0, 0, 0, .5)',
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        top: 0,
        alignItems: 'center',
        justifyContent: 'center',
        paddingLeft: 15,
        paddingRight: 15
    },
    backgroundVideo: {
        position: 'absolute',
        top: 0,
        left: 0,
        bottom: 0,
        right: 0,
    },
});

export default connect(({language, display, ad}) => ({language, display, ad}))(Ad);
