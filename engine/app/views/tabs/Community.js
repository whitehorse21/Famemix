/**
 * Created by ninacoder
 * @https://codecanyon.net/user/codenamenina
 */

import React, { Component } from "react";
import {
    View,
    Text,
    Image,
    Dimensions,
    ActivityIndicator,
    StyleSheet,
    Platform,
    ScrollView,
    StatusBar,
    RefreshControl,
    TouchableWithoutFeedback,
    TouchableOpacity
} from "react-native";
import AsyncStorage from '@react-native-async-storage/async-storage';

const GLOBAL = require('../../../config/Global');
import {connect} from "react-redux";
import {ifIphoneX} from "../../helpers/ifIphoneX";
import SearchBar from '../common/SearchBar';
import Slider from '../../models/Slider';
import Channel from '../../models/Channel';
import Activity from '../../models/Activity';
import API from "../../helpers/Axios";
import MentionInput from "../../helpers/MentionInput";
import MentionCell from "../../helpers/MentionCell";
import { SvgXml, WithLocalSvg } from 'react-native-svg';

import {Actions} from 'react-native-router-flux';
import FastImage from "react-native-fast-image";
import {changeStatusBarStyle} from "../../helpers/Functions";
const window = Dimensions.get('window');




const unique = array => {
    return [...new Set(array.map(s => JSON.stringify(s)))].map(s =>
        JSON.parse(s)
    )
}
const users = [
    /*{id: 1, name: 'spiderman', image: 'https://vignette.wikia.nocookie.net/marvel-contestofchampions/images/a/a9/Spider-Man_%28Stark_Enhanced%29_portrait.png/revision/latest?cb=20170722100121'},
    {id: 3, name: 'ironman', image: 'https://mheroesgb.gcdn.netmarble.com/mheroesgb/DIST/Forum/hero_ironman01_S04.png'},
    {id: 4, name: 'captain_america', image: 'https://pbs.twimg.com/profile_images/685896589362216963/N2j7Rc9E_400x400.png'},
    {id: 5, name: 'wolverine', image: 'https://i.pinimg.com/474x/b3/b6/90/b3b6909a070bb5e7da45f30988646390--wolverine-movie-the-wolverine.jpg'},
    {id: 6, name: 'blackwidow', image: 'https://a.wattpad.com/useravatar/blackwidowisawesome.256.764312.jpg'},
    {id: 7, name: 'batman', image: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQhbPvo9yMCxs2Yzy6TD6ikA_PfFOLNN0ebrpuffqqHSHvCEWkx'}

     */
]


class Community extends Component {
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
    onChangeLanguage = (language) => {
        this.setState({ currentLanguage: language });
    };
    constructor(props) {
        super(props);
        this.state = {
            currentLanguage: this.props.language.code,
            refreshing: false,
            layoutWidth: window.width,
            window: window,
            placeholderTextColor: 'grey',
            mini: props.player.show ? props.player.show : false,
            showAd: false,
            theme: this.props.display.darkMode ? GLOBAL.themes.dark : GLOBAL.themes.light,
            data: [],
            page: 1,
            loading: true,
            loadingMore: false,
            user: this.props.auth.isLogged ? this.props.auth.user : null,
            inputText: '',
            isMentionBoxShown: false,
            isInputFieldActive: false,
            mentionSuggestions: [],
            allUniqueSuggestions: [], // suggestions shown in that instance. Eg first time suggestions shown are [1, 3, 4]
            // Second time shown are [2, 5, 6]. then `allUniquesSuggestions` -> [1, 2, 3, 4, 5, 6]
        };
        Dimensions.addEventListener('change', () => {
            try {
                this.setState({window: Dimensions.get('window')});
            } catch (e) {

            }
        });
        setTimeout(async() => {
            let lang = await AsyncStorage.getItem('lang');
            if(lang !== this.props.lang) {
                this.setState({ currentLanguage: lang });
            }
        }, 10);

    }
    async componentWillReceiveProps(nextProps) {
        if(this.props.display.darkMode !== nextProps.display.darkMode ) {
            nextProps.display.darkMode ? this.setState({theme: GLOBAL.themes.dark}) : this.setState({theme: GLOBAL.themes.light})
        }
        if(this.props.language.code !== nextProps.language.code ) {
            this.onChangeLanguage(nextProps.language.code)
        }
        if( this.props.player.show !==  nextProps.player.show) {
            this.setState({mini: nextProps.player.show});
        }
        if(nextProps.scroll.community && this.props.scroll.community !== nextProps.scroll.community ) {
            this.scrollView.scrollTo({x: 0, y: 0, animated: true});
        }
    }
    _isMounted = false;
    componentWillUnmount() {
        this._isMounted = false;
    }
    componentDidMount() {
        this._isMounted = true;
        this._fetchData();
    }
    _fetchData = () => {
        const { page } = this.state;
        API.get(`community?page=${page}`)
            .then(res => {
                this.setState((prevState, nextProps) => ({
                    data:
                        page === 1
                            ? Array.from(res.data.community.activities.data)
                            : [...this.state.data, ...res.data.community.activities.data],
                    slides: res.data.slides,
                    channels: res.data.channels,
                    loading: false,
                    loadingMore: false,
                    refreshing: false,
                }));
                if(page === 1) {
                    this.setState((prevState, nextProps) => ({
                        slides: res.data.slides,
                        channels: res.data.channels,
                    }));
                }
            });
    };
    renderMarginBottom() {
        if (this.state.mini) {
            return (
                <View style={{marginBottom: 50}}/>
            )
        }
    }
    _onRefresh = () => {
        this.setState(
            (prevState, nextProps) => ({
                page: 1,
                loadingMore: true,
                refreshing: true
            }),
            () => {
                this._fetchData();
            }
        );
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

    /**
     * InputText `onchangeText` callback
     */
    onChangeText = text => {
        this.setState({ inputText: text })
    }

    /**
     * Called by fake button that focuses or dismisses the text field.
     */
    toggleTextField = () => {
        this.setState(
            prevState => ({
                isInputFieldActive: !prevState.isInputFieldActive
            }),
            () => {
                this.state.isInputFieldActive
                    ? this.inputField.focus()
                    : Keyboard.dismiss()
            }
        )
    }

    searchUser = text => {
        return users.filter(usr => usr.name.search(text))
    }

    /**
     * Text field on change text event callback
     */
    mentioningChangeText = text => {
        const data = users;
        const suggestions = data.filter(user => user.name.toUpperCase().includes(text.toUpperCase()))
        // to remove space between name 'Shark James' -> 'SharkJames'
        const transformedSuggestions = suggestions.map(item => ({
            ...item,
            name: item.name.replace(/\s/g, '')
        }))
        const allSuggestions = [...this.state.mentionSuggestions, ...transformedSuggestions]
        const allUniqueSuggestions = unique(allSuggestions)
        this.setState({ mentionSuggestions: transformedSuggestions, allUniqueSuggestions })
    }
    render() {
        return (
            <View style={[styles.container,  {backgroundColor: this.state.theme.primaryBackgroundColor}]} onLayout={this.onLayoutScreen}>
                <SearchBar theme={this.state.theme} lang={this.state.currentLanguage}/>
                <ScrollView showsVerticalScrollIndicator={true} ref={(ref) => {this.scrollView = ref;}}
                            refreshControl={
                                <RefreshControl
                                    refreshing={this.state.refreshing}
                                    onRefresh={this._onRefresh}
                                    tintColor={this.state.theme.indicatorColor}
                                    titleColor={this.state.theme.indicatorColor}
                                />
                            }
                            onScroll={(e) => {
                                let paddingToBottom = 100;
                                paddingToBottom += e.nativeEvent.layoutMeasurement.height;
                                if(e.nativeEvent.contentOffset.y >= e.nativeEvent.contentSize.height - paddingToBottom && (this.state.data.length/(this.state.page*20) === 1)) {
                                    this._handleLoadMore();
                                }
                            }}
                >
                    <View style={{
                        flex: 1,
                        marginLeft: 16,
                        marginRight: 16,
                        backgroundColor: this.state.theme.primaryBackgroundColor,
                        borderBottomWidth: 1,
                        borderColor: this.state.theme.community.boxBorderColor
                    }}>
                        <View style={{
                            flexDirection: 'row',
                            width: '100%',
                            marginBottom: 8
                        }}>
                            <MentionInput
                                reference={comp => {
                                    this.inputField = comp
                                }}
                                placeholder="Share something with your follower"
                                onChangeText={this.onChangeText}
                                mentionData={this.state.mentionSuggestions}
                                mentioningChangeText={this.mentioningChangeText}
                                renderMentionCell={({ item }) => {
                                    return <MentionCell name={item.name} image={item.avatar} />
                                }}
                                style={styles.inputField}
                            />
                            <TouchableOpacity
                                style={{
                                    width: 24,
                                    height: 24,
                                    position: 'absolute',
                                    right: 8,
                                    bottom: 6,
                                    justifyContent: 'center',
                                    alignItems: 'center',
                                }}
                            >
                                <WithLocalSvg
                                    fill={this.state.theme.community.sendButtonColor}
                                    width={16}
                                    height={16}
                                    asset={require('../../../assets/icons/common/send.svg')}
                                />
                            </TouchableOpacity>
                        </View>
                        {this.props.share &&
                        <View style={{
                            flexDirection: 'row',
                            flex: 1,
                            alignItems: 'center',
                            marginBottom: 8
                        }}>
                            <FastImage
                                style={{
                                    width: 40,
                                    height: 40,
                                    borderRadius: 3
                                }}
                                source={{
                                    uri: this.props.share.artwork_url,
                                    priority: FastImage.priority.normal,
                                }}
                                resizeMode={FastImage.resizeMode.contain}
                            />
                            <View style={{
                                marginLeft: 12,
                                marginRight: 96
                            }}>
                                <Text
                                    style={{
                                        color: this.state.theme.textSecondaryColor,
                                        fontWeight: '500',
                                        marginBottom: 4,
                                        fontSize: 17,
                                    }}
                                    numberOfLines={1}
                                >{(this.props.shareKind === 'song' || this.props.shareKind === 'playlist' || this.props.shareKind === 'album') && this.props.share.title}{(this.props.shareKind === 'artist') && this.props.share.name}</Text>

                                {(this.props.shareKind === 'song' || this.props.shareKind === 'playlist' || this.props.shareKind === 'album') &&
                                <Text
                                    style={{
                                        color: this.state.theme.textSecondaryColor
                                    }}
                                    numberOfLines={1}
                                >{this.props.shareKind === 'playlist' && this.props.share.user.name}{(this.props.shareKind === 'song' || this.props.shareKind === 'album') && this.props.share.artists.map(function (artist) {return artist.name}).join(", ")}</Text>
                                }
                            </View>
                            <TouchableOpacity
                                style={{
                                    position: 'absolute',
                                    right: 0,
                                    justifyContent: 'center',
                                    alignItems: 'center'
                                }}
                                onPress={() => {
                                    setTimeout(() => {
                                        Actions.refresh({
                                            share: null,
                                            shareKind: null
                                        });
                                    }, 0);
                                }}
                            >
                                <SvgXml fill={this.state.theme.textSecondaryColor}
                                        xml={`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 511.76 511.76" style="enable-background:new 0 0 511.76 511.76;" xml:space="preserve"><path d="M436.896,74.869c-99.84-99.819-262.208-99.819-362.048,0c-99.797,99.819-99.797,262.229,0,362.048c49.92,49.899,115.477,74.837,181.035,74.837s131.093-24.939,181.013-74.837C536.715,337.099,536.715,174.688,436.896,74.869z M361.461,331.317c8.341,8.341,8.341,21.824,0,30.165c-4.16,4.16-9.621,6.251-15.083,6.251c-5.461,0-10.923-2.091-15.083-6.251l-75.413-75.435l-75.392,75.413c-4.181,4.16-9.643,6.251-15.083,6.251c-5.461,0-10.923-2.091-15.083-6.251c-8.341-8.341-8.341-21.845,0-30.165l75.392-75.413l-75.413-75.413c-8.341-8.341-8.341-21.845,0-30.165c8.32-8.341,21.824-8.341,30.165,0l75.413,75.413l75.413-75.413c8.341-8.341,21.824-8.341,30.165,0c8.341,8.32,8.341,21.824,0,30.165l-75.413,75.413L361.461,331.317z"/></svg>`}
                                        width="16" height="16"/>
                            </TouchableOpacity>
                        </View>
                        }
                        {!this.props.share &&
                        <View style={{
                            flexDirection: 'row',
                            flex: 1,
                            justifyContent: 'space-between',
                            alignItems: 'center',
                        }}>
                            <TouchableOpacity style={{
                                width: '25%',
                                height: 48,
                                justifyContent: 'center',
                                alignItems: 'center',
                                flexDirection: 'row'
                            }}
                                              onPress={() => {
                                                  Actions.selectMediaModal({kind: 'song'})
                                              }}
                            >
                                <SvgXml fill={this.state.theme.textSecondaryColor}
                                        xml={`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 415.963 415.963" style="enable-background:new 0 0 415.963 415.963;" xml:space="preserve"><path d="M340.681,135.739c-13.152-26.976-35.744-42.112-57.568-56.736c-16.288-10.912-31.68-21.216-42.56-35.936l-1.952-2.624c-6.432-8.64-13.696-18.432-14.848-26.656c-1.152-8.32-8.704-14.24-16.96-13.76c-8.384,0.576-14.88,7.52-14.88,15.936v285.12c-13.408-8.128-29.92-13.12-48-13.12c-44.096,0-80,28.704-80,64s35.904,64,80,64s80-28.704,80-64V72.955c12.544,13.312,27.136,23.104,41.376,32.64c19.168,12.832,37.28,24.96,46.656,44.192c5.888,12,8.704,25.088,8,36.736c-1.76,28.512-12.512,57.184-28.032,74.88c-5.856,6.624-5.216,16.736,1.44,22.56c6.592,5.888,16.704,5.184,22.56-1.44c20.032-22.752,33.824-58.784,35.968-94.016C352.936,171.131,349.065,152.891,340.681,135.739z"/></svg>`}
                                        width="16" height="16"/>
                                <Text style={{
                                    fontSize: 16,
                                    fontWeight: '500',
                                    color: this.state.theme.textSecondaryColor,
                                    marginLeft: 8
                                }}>Song</Text>
                            </TouchableOpacity>
                            <TouchableOpacity
                                style={{
                                    width: '25%',
                                    height: 40,
                                    justifyContent: 'center',
                                    alignItems: 'center',
                                    flexDirection: 'row',
                                }}
                                onPress={() => {
                                    Actions.selectMediaModal({kind: 'abum'})
                                }}
                            >
                                <SvgXml fill={this.state.theme.textSecondaryColor}
                                        xml={`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" style="enable-background:new 0 0 512 512;" xml:space="preserve"><path d="M496,128H16c-8.832,0-16,7.168-16,16v352c0,8.832,7.168,16,16,16h480c8.832,0,16-7.168,16-16V144C512,135.168,504.832,128,496,128z M336,286.016c-8.832,0-16-7.168-16-16c0-21.376-17.504-33.6-32-40.032V400c0,26.912-28.096,48-64,48s-64-21.088-64-48s28.096-48,64-48c11.808,0,22.592,2.464,32,6.464V208c0-4.768,2.112-9.28,5.792-12.32s8.512-4.256,13.184-3.392C301.632,197.28,352,219.968,352,270.016C352,278.848,344.832,286.016,336,286.016z"/><path d="M448,80c0-8.832-7.168-16-16-16H80c-8.832,0-16,7.168-16,16v16h384V80z"/><path d="M384,16c0-8.832-7.168-16-16-16H144c-8.832,0-16,7.168-16,16v16h256V16z"/></svg>`}
                                        width="16" height="16"/>
                                <Text style={{
                                    fontSize: 16,
                                    fontWeight: '500',
                                    color: this.state.theme.textSecondaryColor,
                                    marginLeft: 8
                                }}>Album</Text>
                            </TouchableOpacity>
                            <TouchableOpacity
                                style={{
                                    width: '25%',
                                    height: 40,
                                    justifyContent: 'center',
                                    alignItems: 'center',
                                    flexDirection: 'row',
                                }}
                                onPress={() => {
                                    Actions.selectMediaModal({kind: 'playlist'})
                                }}
                            >
                                <SvgXml fill={this.state.theme.textSecondaryColor}
                                        xml={`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 448.138 448.138" style="enable-background:new 0 0 448.138 448.138;" xml:space="preserve"><path d="M436.768,151.845c-13.152-26.976-35.744-42.08-57.6-56.704C362.88,84.229,347.52,73.925,336.64,59.173l-2.016-2.72c-6.4-8.608-13.696-18.368-14.816-26.56c-1.12-8.288-7.648-14.048-16.928-13.792C294.496,16.677,288,23.653,288,32.069v285.12c-13.408-8.128-29.92-13.12-48-13.12c-44.096,0-80,28.704-80,64s35.904,64,80,64c44.128,0,80-28.704,80-64V181.573c24.032,9.184,63.36,32.576,74.176,87.2c-2.016,2.976-3.936,6.208-6.176,8.736c-5.856,6.624-5.184,16.736,1.44,22.56c6.592,5.888,16.704,5.184,22.56-1.44c20.032-22.752,33.824-58.784,35.968-94.016C449.024,187.237,445.152,168.997,436.768,151.845z"/><path d="M16,48.069h192c8.832,0,16-7.168,16-16s-7.168-16-16-16H16c-8.832,0-16,7.168-16,16S7.168,48.069,16,48.069z"/><path d="M16,144.069h192c8.832,0,16-7.168,16-16s-7.168-16-16-16H16c-8.832,0-16,7.168-16,16S7.168,144.069,16,144.069z"/><path d="M112,208.069H16c-8.832,0-16,7.168-16,16s7.168,16,16,16h96c8.832,0,16-7.168,16-16S120.832,208.069,112,208.069z"/><path d="M112,304.069H16c-8.832,0-16,7.168-16,16s7.168,16,16,16h96c8.832,0,16-7.168,16-16S120.832,304.069,112,304.069z"/></svg>`}
                                        width="16" height="16"/>
                                <Text style={{
                                    fontSize: 16,
                                    fontWeight: '500',
                                    color: this.state.theme.textSecondaryColor,
                                    marginLeft: 8
                                }}>Playlist</Text>
                            </TouchableOpacity>
                            <TouchableOpacity
                                style={{
                                    width: '25%',
                                    height: 40,
                                    justifyContent: 'center',
                                    alignItems: 'center',
                                    flexDirection: 'row',
                                }}
                                onPress={() => {
                                    Actions.selectMediaModal({kind: 'artist'})
                                }}
                            >
                                <SvgXml fill={this.state.theme.textSecondaryColor}
                                        xml={`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512.027 512.027" style="enable-background:new 0 0 512.027 512.027;" xml:space="preserve"><path d="M507.347,49.954L462.099,4.706c-6.24-6.24-16.384-6.24-22.624,0l-45.248,45.248c-6.24,6.24-6.24,16.384,0,22.624L281.939,184.802l-59.488-93.248c-3.488-5.472-9.952-8.32-16.384-7.136c-6.4,1.184-11.424,6.144-12.768,12.512l-21.728,105.088L9.235,277.986c-5.888,2.752-9.536,8.832-9.216,15.36c0.352,6.496,4.64,12.16,10.816,14.24l144.256,49.312l49.312,144.288c2.112,6.144,7.744,10.432,14.272,10.784c0.288,0.032,0.576,0.032,0.864,0.032c6.176,0,11.84-3.552,14.496-9.216l76.448-163.328l95.872-31.776c5.952-1.984,10.144-7.2,10.88-13.408c0.672-6.176-2.272-12.224-7.616-15.456l-81.664-49.44l111.52-111.52c6.24,6.24,16.384,6.24,22.624,0l45.248-45.248C513.587,66.338,513.587,56.194,507.347,49.954z M235.347,331.33c-3.136,3.104-7.232,4.672-11.328,4.672s-8.192-1.568-11.328-4.672l-32-32c-6.24-6.24-6.24-16.384,0-22.624s16.384-6.24,22.624,0l32,32C241.587,314.946,241.587,325.058,235.347,331.33z"/></svg>`}
                                        width="16" height="16"/>
                                <Text style={{
                                    fontSize: 16,
                                    fontWeight: '500',
                                    color: this.state.theme.textSecondaryColor,
                                    marginLeft: 8
                                }}>Artist</Text>
                            </TouchableOpacity>
                        </View>
                        }
                    </View>

                    {this.state.slides && <Slider data={this.state.slides}/>}
                    {this.state.channels && <Channel data={this.state.channels}/>}

                    {/* Below button fakes the focusing of the input field */}
                    <View style={{ flex: 1 }}>
                        <TouchableWithoutFeedback
                            style={styles.overlappingButton}
                            onPress={this.toggleTextField}
                        >
                            <View style={styles.overlappingButton} />
                        </TouchableWithoutFeedback>
                    </View>

                    {this.state.data.length > 0 && (
                        <Activity ActivitiesData={this.state.data} theme={this.props.theme} lang={this.state.currentLanguage}/>
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
    inputField: {
        backgroundColor: 'red',

    },
    offline: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
    },
    text_offline: {
        fontSize: 13,
        justifyContent: 'center',
        alignItems: 'center',
        textAlign: 'center',
        paddingHorizontal: 40
    },
    container: {
        flex: 1
    }
});

export default connect(({routes, scroll, language, display, player, auth}) => ({routes, scroll, language, display, player, auth}))(Community);
