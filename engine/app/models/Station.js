import React, { Component } from "react";
import {View, TouchableOpacity, FlatList, Text, ActivityIndicator, StyleSheet, Dimensions, Image} from "react-native";
import {connect} from "react-redux";
import {playStation} from "../helpers/Functions";
import i18n from "i18n-js";
import * as Languages from "../helpers/Lang";

const GLOBAL = require('../../config/Global');
const window = Dimensions.get('window');

class Station extends Component {
    constructor(props) {
        super(props);
        this.state = {
            layoutWidth: props.layoutWidth,
            theme: this.props.display.darkMode ? GLOBAL.themes.dark : GLOBAL.themes.light,
            currentLanguage: this.props.language.code,
        };
    }
    onChangeLanguage = (language) => {
        this.setState({ currentLanguage: language });
    };
    componentWillReceiveProps(nextProps) {
        if(this.props.display.darkMode !== nextProps.display.darkMode ) {
            nextProps.display.darkMode ? this.setState({theme: GLOBAL.themes.dark}) : this.setState({theme: GLOBAL.themes.light})
        }
        if(this.props.language.code !== nextProps.language.code ) {
            this.onChangeLanguage(nextProps.language.code)
        }
    }
    getItemWidth(){
        if(this.props.column)
            return ((this.state.layoutWidth - (16 + 8*(this.props.column-1)))/this.props.column);
        else {
            if(this.props.layoutWidth < 700) {
                return ((this.props.layoutWidth - 40) / 2)
            } else return 160;
        }
    }
    render() {
        i18n.locale = this.state.currentLanguage;
        i18n.fallbacks = true;
        i18n.translations = Languages;

        if (!this.props.stationData) {
            return <ActivityIndicator color={this.state.theme.indicatorColor} style={ styles.container }/>;
        }
        if (!this.props.stationData.length) {
            return (<View style={ styles.container }><Text style={{color: this.state.theme.noDataTextColor}}>{i18n.t('no_data')}</Text></View>);
        }
        if (this.props.horizontal)
            return (
                <FlatList
                    data={this.props.stationData}
                    horizontal={true}
                    keyExtractor={this.keyExtractor}
                    renderItem={this.renderStation.bind(this)}
                />
            );
        else
            return (
                <FlatList
                    data={this.props.stationData}
                    numColumns={this.props.column}
                    key={this.props.column}
                    keyExtractor={this.keyExtractor}
                    renderItem={this.renderStation.bind(this)}
                />
            );
    }
    keyExtractor = (item, index) => index.toString();
    renderStation = ({ item, index }) => {
        if(this.props.horizontal === true && ! this.props.search)
            return (
                <TouchableOpacity style={[styles.station_view, {width: this.getItemWidth()}]} id={item.id} onPress={ () => playStation(item) }>
                    <View style={styles.blur_background_view}>
                        <Image style={ [styles.artwork] } source={{uri:  item.artwork_url,}}/>
                    </View>
                    <Text style={[styles.textStationName, {color: this.state.theme.textPrimaryColor}]} numberOfLines={1}>{item.title}</Text>
                </TouchableOpacity>
            );
        else if(this.props.search)
            return (
                <TouchableOpacity style={[styles.search_station_view,  {width: this.getItemWidth()}, index%this.props.column===0 ? { marginLeft: 8 } : { marginLeft: 0 }, {marginRight: 8}]} onPress={ () =>  playStation(item) }>
                    <Image style={[styles.search_artwork, {width: 50, height: 50}]} source={{
                            uri:  item.artwork_url,
                    }}/>
                    <View style={styles.search_info}>
                        <Text style={[styles.search_textStationName, {color: this.state.theme.textPrimaryColor}]} numberOfLines={1}>{item.title}</Text>
                        <Text style={[styles.search_text_descr, {color: this.state.theme.textSecondaryColor}]} numberOfLines={1}>{item.description}</Text>
                    </View>
                </TouchableOpacity>
            );
        else
            return (
                <TouchableOpacity style={{
                    flex: 1,
                    flexDirection: 'row',
                    margin: 8,
                    justifyContent: 'center'
                }} onPress={ () => playStation(item) }>
                    <Image style={[styles.artwork, {width: 90, height: 90, borderRadius: 3}]} source={{uri:  item.artwork_url}}/>
                    <View
                        style={{
                            marginLeft: 8,
                            justifyContent: 'center',
                            flex: 1
                        }}
                    >
                        <Text style={[
                            styles.textStationName, {
                            color: this.state.theme.textPrimaryColor
                        }]} numberOfLines={1}>{item.title}</Text>
                        {item.description !== null && item.description !== '' &&
                            <Text style={{
                                fontSize: 13,
                                marginTop: 4,
                                color: this.state.theme.textSecondaryColor
                            }} numberOfLines={3}>{item.description}</Text>
                        }
                    </View>
                </TouchableOpacity>
            );
    };
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center'
    },
    search_station_view: {
        flexDirection: 'row',
        height: 70,
        alignItems: 'center',
    },
    search_artwork: {
        marginRight: 8,
    },
    search_info: {
        width: window.width - 72,
    },
    search_textStationName: {
        fontSize: 13,
        fontWeight:'bold',
    },
    search_text_descr: {
        fontSize: 12,
    },
    station_view: {
        borderRadius: 4,
        overflow: 'hidden',
        marginBottom: 20,
        marginRight: 8,
        marginLeft: 4
    },
    blur_background_view: {
        width: '100%',
        aspectRatio: 1,
        borderRadius: 4,
        overflow: 'hidden',
        /*backgroundColor: '#eb743a',*/
        justifyContent: 'center',
        alignItems: 'center'
    },
    artwork: {
        width: '100%',
        aspectRatio: 1
    },
    textStationName: {
        fontSize: 16,
        fontWeight:'500'
    },
});


export default connect(({routes, scroll, language, display, player, auth}) => ({routes, scroll, language, display, player, auth}))(Station);
