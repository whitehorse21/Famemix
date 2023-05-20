/**
 * Created by ninacoder
 * @https://codecanyon.net/user/codenamenina
 */

import React, { Component } from "react";
import {View, Dimensions, FlatList, ActivityIndicator, StyleSheet, ScrollView, TouchableOpacity, Text, RefreshControl, ImageBackground,} from "react-native";
import {Actions} from "react-native-router-flux";
const GLOBAL = require('../../../config/Global');
import {connect} from "react-redux";
import {changeStatusBarStyle} from "../../helpers/Functions";
import API from "../../helpers/Axios";
import i18n from 'i18n-js';
import * as Languages from '../../helpers/Lang';
import NavHeader from "../common/NavHeader";
const window = Dimensions.get('window');

class RadioCategory extends Component {
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
            slides: [],
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
        API.get('radio/categories')
            .then(res => {
                this.setState({
                    isLoading: false,
                    data: res.data,
                    refreshing: false,
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
                numColumns={(this.state.layoutWidth > 1000) ? 5 : ((this.state.layoutWidth > 500) ? 3 : 2)}
                key={(this.state.layoutWidth > 1000) ? 5 : ((this.state.layoutWidth > 500) ? 3 : 2)}
                data={this.state.data}
                keyExtractor={this.keyExtractor}
                renderItem={this.renderRadio.bind(this)}
            />
        )
    }
    keyExtractor = (item, index) => index.toString();
    renderRadio = ({ item, index }) => {
        return (
            <TouchableOpacity
                onPress={ () => Actions.stationsAll({ row: item}) }
                style={{
                    padding: 8,
                    width: (this.state.layoutWidth > 1000) ? '20%' : ((this.state.layoutWidth > 500) ? '33.3333%' : '50%'),
                    aspectRatio:  1.777
                }}
            >
                <View style={{borderRadius: 6, flex: 1, backgroundColor: 'rgba(0,0,0,.5)'}}>
                    <ImageBackground style={{flex: 1, alignItems: 'center', justifyContent: 'center'}} source={{uri: item.artwork_url}} imageStyle={{ borderRadius: 6}}>
                        <Text style={styles.text} numberOfLines={1}>{item.name}</Text>
                    </ImageBackground>
                </View>
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
                <NavHeader title={'Radio Categories'}/>
                <View style={{padding: 8, flex: 1}}>
                    <ScrollView
                        style={{flex: 1}}
                        contentContainerStyle={{flexGrow: 1}}
                        showsVerticalScrollIndicator={false}
                        refreshControl={
                        <RefreshControl
                            refreshing={this.state.refreshing}
                            onRefresh={this._onRefresh}
                            tintColor={this.state.theme.indicatorColor}
                            titleColor={this.state.theme.indicatorColor}
                        />
                    }>
                        {this.renderRadioCategory()}
                    </ScrollView>
                    {this.renderMarginBottom()}
                </View>
            </View>

        );
    }
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    content: {
        paddingLeft: 8
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
    }
});


export default connect(({routes, scroll, language, display, player, auth}) => ({routes, scroll, language, display, player, auth}))(RadioCategory);
