import React, {Component} from "react";
import {
    Animated, Dimensions, Platform, Text, TouchableOpacity, ScrollView, ImageBackground, Image, View, StyleSheet, Alert, StatusBar
} from "react-native";
import Parallax from '../common/Parallax'
import { Share } from 'react-native';
import Song from '../../models/Song';
import Album from '../../models/Album';
import Toast from "react-native-root-toast";
import {connect} from "react-redux";
import {changeStatusBarStyle} from "../../helpers/Functions";
import API from "../../helpers/Axios";
import NavHeader from "../common/NavHeader";
import {ScrollableTab, Tab, TabHeading, Tabs} from "native-base";
import i18n from "i18n-js";

const GLOBAL = require('../../../config/Global');

const window = Dimensions.get('window');

class AlbumShow extends Component {
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
            songs: [],
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
        API.get('album/' + this.props.album.id)
            .then(res => {
                console.log(res.data);
                this.setState({
                    isLoading: false,
                    songs: res.data.songs,
                });
            });
    }
    onChangeTab(i, tab) {

    };
    render() {
        return (
            <View style={{flex: 1}} onLayout={this.onLayoutScreen}>
                <NavHeader title={this.props.album.title} noBorder={true}/>
                <Tabs
                    prerenderingSiblingsNumber={3}
                    onChangeTab={({i, ref}) => {
                        this.onChangeTab(i, ref.props.tab);
                    }}
                    renderTabBar={() => <ScrollableTab
                        style={{
                            backgroundColor: this.state.theme.primaryBackgroundColor,
                            borderBottomColor: this.state.theme.tabBorderBottomColor
                        }}
                        renderTab={(name, page, active, onPress, onLayout) => (
                            <TouchableOpacity key={page}
                                              onPress={() => onPress(page)}
                                              onLayout={onLayout}
                                              activeOpacity={0.4}
                                              style={{
                                                  flex: 1,
                                                  justifyContent: 'center',
                                                  alignItems: 'center'
                                              }}
                            >

                                <TabHeading scrollable
                                            style={[styles.tabItem, {backgroundColor: this.state.theme.tabBackgroundColor}]}
                                            active={active}>
                                    <Animated.Text style={{
                                        fontWeight: "bold",
                                        color: this.state.theme.textPrimaryColor,
                                        fontSize: 13
                                    }}>
                                        {name}
                                    </Animated.Text>
                                </TabHeading>
                            </TouchableOpacity>
                        )}
                        underlineStyle={{backgroundColor: this.state.theme.tabUnderlineColor, height: 2}}
                    />}
                >

                    <Tab heading={i18n.t('overview')} tab={'overview'} style={{backgroundColor: this.state.theme.primaryBackgroundColor}}>
                        <View style={{flex: 1}} onLayout={this.onLayoutScreen}>
                            <Parallax
                                item={this.props.album}
                                kind={'album'}
                                theme={this.state.theme}
                                songs={this.state.songs}
                                isLoading={this.state.isLoading}
                                shoudRenderForeground={true}
                                renderForeground={() => (
                                    <Song SongData={this.state.songs} layoutWidth={this.state.layoutWidth} theme={this.state.theme}/>
                                )}
                            />
                        </View>
                        {this.renderMarginBottom()}
                    </Tab>
                    <Tab heading={i18n.t('related')} tab={'subscribers'} style={{backgroundColor: this.state.theme.primaryBackgroundColor}}>
                        <Album
                            AlbumData={this.state.AlbumData}
                            theme={this.state.theme}
                            layoutWidth={this.state.layoutWidth}
                        />
                        {this.renderMarginBottom()}
                    </Tab>
                </Tabs>
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


export default connect(({routes, scroll, language, display, player, auth}) => ({routes, scroll, language, display, player, auth}))(AlbumShow);
