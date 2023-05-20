import React, {Component} from "react";
import {
    Dimensions,
    Text,
    TouchableOpacity,
    ScrollView,
    View,
    StyleSheet,
    Alert,
    StatusBar,
    ActivityIndicator
} from "react-native";
import {connect} from "react-redux";
import {changeStatusBarStyle} from "../../helpers/Functions";
import API from "../../helpers/Axios";
import NavHeader from "../common/NavHeader";
import FastImage from "react-native-fast-image";
import {WithLocalSvg} from "react-native-svg";
import Episode from "../../models/Episode";

const GLOBAL = require('../../../config/Global');

const window = Dimensions.get('window');

class PodcastShow extends Component {
    static onEnter = async() => {
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
            theme: this.props.display.darkMode ? GLOBAL.themes.dark : GLOBAL.themes.light,
            episodes: null,
            AlbumData: [],
            isLoading: true
        };
    }
    renderMarginBottom() {
        if (this.state.mini) {
            return (
                <View style={{marginBottom: 50}}/>
            )
        }
    };
    componentWillReceiveProps(nextProps) {
        if(this.props.display.darkMode !== nextProps.display.darkMode ) {
            nextProps.display.darkMode ? this.setState({theme: GLOBAL.themes.dark}) : this.setState({theme: GLOBAL.themes.light})
        }
    }
    async componentDidMount() {
        API.get('podcast/' + this.props.podcast.id)
            .then(res => {
                this.setState({
                    isLoading: false,
                    episodes: res.data.episodes,
                });
            });
    }
    render() {
        return (
            <View style={{flex: 1}} onLayout={this.onLayoutScreen}>
                <NavHeader title={this.props.podcast.title} noBorder={true}/>
                <ScrollView
                    style={{
                        flex: 1,
                        backgroundColor: this.state.theme.primaryBackgroundColor,
                        paddingLeft: 16,
                        paddingRight: 16,
                        paddingTop: 16
                    }}
                    contentContainerStyle={{flexGrow: 1}}
                >
                    <View
                        style={{
                            width: '100%',
                            flexDirection: 'row'
                        }}
                    >
                        <FastImage
                            style={{width: 140, height: 140, borderRadius: 3}}
                            source={{
                                uri: this.props.podcast.artwork_url,
                                priority: FastImage.priority.normal,
                            }}
                            resizeMode={FastImage.resizeMode.contain}
                        />
                        <View
                            style={{
                                flex: 1,
                                marginLeft: 16,
                                marginTop: 8,
                            }}
                        >
                            <Text
                                style={{
                                    color: this.state.theme.textPrimaryColor,
                                    fontWeight: 'bold',
                                    fontSize: 20
                                }}
                            >{this.props.podcast.title}</Text>
                            <Text
                                style={{
                                    color: this.state.theme.textSecondaryColor,
                                    fontSize: 17,
                                    marginTop: 8
                                }}
                            >{this.props.podcast.artist.name}</Text>

                            <View
                                style={{
                                    flex: 1,
                                    position: 'absolute',
                                    bottom: 0,
                                    right: 0,
                                    left: 0,
                                    justifyContent: 'space-between',
                                    alignItems: 'center',
                                    flexDirection: 'row',
                                }}
                            >
                                <TouchableOpacity
                                    style={{
                                        height: 36,
                                        justifyContent: 'center',
                                        alignItems: 'center',
                                        backgroundColor: this.state.theme.primaryButton.backgroundColor,
                                        borderRadius: 18,
                                    }}
                                >
                                    <Text
                                        style={{
                                            color: this.state.theme.primaryButton.textColor,
                                            fontWeight: '500',
                                            marginLeft: 16,
                                            marginRight: 16
                                        }}
                                    >SUBSCRIBE</Text>
                                </TouchableOpacity>
                                <TouchableOpacity
                                    style={{
                                        height: 36,
                                        justifyContent: 'center',
                                        alignItems: 'center',
                                        backgroundColor: this.state.theme.parallax.secondaryButtonColor,
                                        borderRadius: 18,
                                        width: 36
                                    }}
                                >
                                    <WithLocalSvg
                                        style={{
                                            width: 20,
                                            height: 20,
                                            transform:[
                                                { rotateZ: "90deg" }
                                            ]
                                        }}
                                        fill={this.state.theme.primaryButton.textColor}
                                        width={20}
                                        height={20}
                                        asset={
                                            require('../../../assets/icons/common/more.svg')
                                        }
                                    />
                                </TouchableOpacity>
                            </View>
                        </View>
                    </View>
                    <View
                        style={{
                            marginTop: 32,
                        }}
                    >
                        <Text
                            style={{
                                color: this.state.theme.textPrimaryColor,
                                fontSize: 17
                            }}
                        >{this.props.podcast.description}</Text>
                    </View>
                    <View
                        style={{
                            marginTop: 32,
                            borderTopWidth: 1,
                            borderTopColor: this.state.theme.activity.borderColor,
                            paddingTop: 16,
                            marginBottom: 32
                        }}
                    >
                        <Text
                            style={{
                                color: this.state.theme.textPrimaryColor,
                                fontSize: 24,
                                fontWeight: 'bold'
                            }}
                        >Episodes</Text>
                    </View>
                    {! this.state.episodes && <ActivityIndicator color={this.state.theme.indicatorColor} style={styles.activityIndicator} />}
                    {this.state.episodes && <Episode EpisodeData={this.state.episodes} />}
                </ScrollView>
            </View>
        )
    }
}

const styles = StyleSheet.create({
    container: {
        flex: 1
    },
    headline: {
        fontSize: 16,
        marginTop: 16,
        marginLeft: 8,
        marginBottom: 16,
        fontWeight: 'bold',
    },
    more_artwork: {
        marginBottom: 8,
        borderRadius: 4
    },
});


export default connect(({routes, scroll, language, display, player, auth}) => ({routes, scroll, language, display, player, auth}))(PodcastShow);
