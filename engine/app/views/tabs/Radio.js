/**
 * Created by ninacoder
 * @https://codecanyon.net/user/codenamenina
 */

import React, { Component } from "react";
import {
    View,
    Dimensions,
    FlatList,
    ActivityIndicator,
    StyleSheet,
    ScrollView,
    TouchableOpacity,
    Text,
    RefreshControl,
} from "react-native";
import {Actions} from "react-native-router-flux";
const GLOBAL = require('../../../config/Global');
import {connect} from "react-redux";
import SearchBar from "../common/SearchBar";
import {changeStatusBarStyle} from "../../helpers/Functions";
import API from "../../helpers/Axios";
import i18n from 'i18n-js';
import * as Languages from '../../helpers/Lang';
import Icon from 'react-native-vector-icons/Ionicons';
import {WithLocalSvg} from 'react-native-svg';

import Slider from '../../models/Slider';
import Channel from '../../models/Channel';

const window = Dimensions.get('window');

class Radio extends Component {
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
            LoadedData: null,
            mini: props.player.show ? props.player.show : false,
            showAd: false,
            isOnline: true,
            theme: this.props.display.darkMode ? GLOBAL.themes.dark : GLOBAL.themes.light,
            stationData: [],
            isLoading: true
        };
        Dimensions.addEventListener('change', () => {
            try {
                this.setState({window: Dimensions.get('window')});
            } catch (e) {

            }
        });
    }
    componentWillReceiveProps(nextProps) {
        if( this.props.player.show !==  nextProps.player.show) {
            this.setState({mini: nextProps.player.show});
        }
        if(nextProps.scroll.radio && this.props.scroll.radio !== nextProps.scroll.radio ) {
            this.scrollView.scrollTo({x: 0, y: 0, animated: true});
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
    fetchData(){
        API.get('radio')
            .then(res => {
                    this.setState({
                        isLoading: false,
                        slides: res.data.slides,
                        channels: res.data.channels,
                        radioData: res.data.radio.slice(0, 6),
                        refreshing: false
                    });

            });
    }
    _onRefresh = () => {
        this.setState({refreshing: true});
        this.fetchData();
    };
    componentDidMount() {
        this.fetchData();
    }
    renderRadioCategory(){
        return (
            <FlatList
                numColumns={1}
                data={this.state.radioData}
                keyExtractor={this.keyExtractor}
                renderItem={this.renderCategoryItem.bind(this)}
                style={{
                    paddingLeft: 16,
                    paddingRight: 16,
                }}
            />
        )
    }
    keyExtractor = (item, index) => index.toString();
    renderCategoryItem = ({ item, index }) => {
        return (
            <TouchableOpacity
                onPress={ () => Actions.stationsAll({ row: item}) }
                style={{
                    flexDirection: 'row',
                    alignItems: 'center',
                    borderBottomWidth: 1,
                    borderBottomColor: this.state.theme.navBorderColor,
                    paddingTop: 12,
                    paddingBottom: 12
                }}
            >
                <Text
                    style={{
                        fontSize: 20,
                        fontWeight: '400',
                        color: this.state.theme.radio.categoryTextColor
                    }}
                    numberOfLines={1}
                >{item.name}</Text>
                <WithLocalSvg
                    fill={this.state.theme.radio.categoryIconColor}
                    width={12}
                    height={12}
                    asset={require('../../../assets/icons/common/right-arrow.svg')}
                    style={[{position: 'absolute', right: 0}]}
                />
            </TouchableOpacity>
        );
    };

    render() {
        i18n.locale = this.state.currentLanguage;
        i18n.fallbacks = true;
        i18n.translations = Languages;

        if(this.state.isLoading) return (
            <ActivityIndicator color={this.state.theme.indicatorColor} style={{flex: 1, backgroundColor: this.state.theme.primaryBackgroundColor}} />
        );

        return (
            <View style={[styles.container,  {backgroundColor: this.state.theme.primaryBackgroundColor}]} onLayout={this.onLayoutScreen}>
                <SearchBar theme={this.state.theme} lang={this.state.currentLanguage} />
                <ScrollView style={styles.content} showsVerticalScrollIndicator={true} ref={(ref) => {this.scrollView = ref}}  refreshControl={
                    <RefreshControl
                        refreshing={this.state.refreshing}
                        onRefresh={this._onRefresh}
                        tintColor={this.state.theme.indicatorColor}
                        titleColor={this.state.theme.indicatorColor}
                    />
                }>

                    {this.state.slides && <Slider data={this.state.slides}/>}
                    {this.state.channels && <Channel data={this.state.channels}/>}

                    <TouchableOpacity style={styles.separateHeadline} onPress={() => { Actions.radioCategory() }}>
                        <Text style={[styles.headline, {color: this.state.theme.headlineColor}]}>Categories</Text>
                        <Text style={[styles.textMore, {color: this.state.theme.moreTextColor}]}>{i18n.t('see_all')}</Text>
                    </TouchableOpacity>
                    {this.renderRadioCategory()}
                </ScrollView>
                {this.renderMarginBottom()}
            </View>

        );
    }
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    content: {
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
    radio: {
        overflow: 'hidden',
    },
    radio_background: {
        justifyContent: 'center',
        alignItems: 'center',
        borderRadius: 8,
        flex: 1
    },
    text: {
        color: "#fefefe",
        fontSize: 20,
        paddingLeft: 16,
        paddingRight: 16,
        textAlign: 'center',
        textTransform: 'uppercase',
        textShadowColor: 'rgba(0, 0, 0, 0.75)',
        textShadowOffset: {width: -1, height: 1},
        textShadowRadius: 5
    },


    separateHeadline: {
        alignItems: 'flex-start',
        marginTop: 40,
        marginLeft: 16,
        marginBottom: 16,
        marginRight: 16,
    },
    headline: {
        fontSize: 20,
        fontWeight: 'bold',
    },
    headlineDescription: {
        fontSize: 13,
    },
    textMore: {
        fontSize: 17,
        position: 'absolute',
        right: 0,
    },
});


export default connect(({routes, scroll, language, display, player, auth}) => ({routes, scroll, language, display, player, auth}))(Radio);
