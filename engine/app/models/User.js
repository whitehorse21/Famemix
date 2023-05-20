import React, { Component } from "react";
import {
    View, TouchableOpacity, Image, FlatList, Text, ActivityIndicator, StyleSheet, Platform,
    Dimensions
} from "react-native";
import {Actions} from 'react-native-router-flux';
import {WithLocalSvg} from "react-native-svg";
import {connect} from "react-redux";
import FastImage from "react-native-fast-image";
const GLOBAL = require('../../config/Global');

class User extends Component {
    constructor(props) {
        super(props);
        this.state = {
            theme: this.props.display.darkMode ? GLOBAL.themes.dark : GLOBAL.themes.light,
        };
        Dimensions.addEventListener('change', () => {
            try {
                this.setState({window: Dimensions.get('window')});
            } catch (e) {

            }
        });
    }
    componentWillReceiveProps(nextProps, nextContent): void {
        if(this.props.display.darkMode !== nextProps.display.darkMode ) {
            nextProps.display.darkMode ? this.setState({theme: GLOBAL.themes.dark}) : this.setState({theme: GLOBAL.themes.light})
        }
    }
    getItemWidth(){
        if(this.props.column)
            return ((this.props.layoutWidth - (16 + 8*(this.props.column-1)))/this.props.column);
        else return 160;
    }
    keyExtractor = (item, index) => index.toString();
    renderUser = ({ item, index }) => {
        if(this.props.element === "activity") {
            if(this.props.UserData.length === 1) {
                return (
                    <View style={{flexDirection: 'row'}}>
                        <TouchableOpacity onPress={() => { Actions.userShow({ user: item}) }} style={{height: 80, width: 80, float: 'left'}}>
                            <FastImage
                                style={{width: 80, height: 80, borderRadius: 40}}
                                source={{
                                    uri: item.artwork_url,
                                    priority: FastImage.priority.normal,
                                }}
                                resizeMode={FastImage.resizeMode.contain}
                            />
                        </TouchableOpacity>
                        <View style={{flex: 1, paddingLeft: 10}}>
                            <Text style={{fontWeight: 'bold', color: '#f77f00', marginBottom: 3}} numberOfLines={1}>{item.name}</Text>
                        </View>
                    </View>
                );
            } else {
                return (
                    <TouchableOpacity onPress={() => { Actions.userShow({ user: item}) }} style={{height: 40, width: 40, marginRight: 3}}>
                        <FastImage
                            style={{width: 40, height: 40, borderRadius: 20}}
                            source={{
                                uri: item.artwork_url,
                                priority: FastImage.priority.normal,
                            }}
                            resizeMode={FastImage.resizeMode.contain}
                        />
                    </TouchableOpacity>
                );
            }
        } else if(this.props.column && ! this.props.search)
            return (
                <TouchableOpacity style={[styles.item_view, {padding: 4, width: (100/this.props.column) + '%'}]} id={item.id} onPress={ () => Actions.userShow({ user: item}) }>
                    <FastImage
                        style={ [styles.artwork, {width: '100%', aspectRatio: 1, borderRadius: this.getItemWidth() / 2}] }
                        source={{
                            uri: item.artwork_url,
                            priority: FastImage.priority.normal,
                        }}
                        resizeMode={FastImage.resizeMode.contain}
                    />
                    <Text style={[styles.item_title_text, {color: this.state.theme.textPrimaryColor}]} numberOfLines={1}>{item.name}</Text>
                </TouchableOpacity>
            );
        else if(this.props.search)
            return (
                <TouchableOpacity style={[styles.item_search_view,  {width: '100%'}]} onPress={ () => Actions.userShow({ user: item}) }>
                    <Image style={ [styles.search_artwork] } source={{uri: item.artwork_url,}}/>
                    <View style={{flex: 1}}>
                        <Text style={[styles.search_item_title_text, {color: this.state.theme.textPrimaryColor}]} numberOfLines={1}>{item.name}</Text>
                        <View
                            style={{
                                flexDirection: 'row',
                                alignItems: 'center',
                                marginTop: 4
                            }}>
                            <View
                                style={{
                                    flexDirection: 'row',
                                    alignItems: 'center',
                                    width: 32
                                }}
                            >
                                <WithLocalSvg
                                    fill={this.state.theme.textSecondaryColor}
                                    width={12}
                                    height={12}
                                    asset={require('../../assets/icons/common/fav.svg')}
                                />
                                <Text
                                    style={{
                                        color: this.state.theme.textSecondaryColor,
                                        marginLeft: 4,
                                        fontSize: 13
                                    }}
                                >{item.collection_count}</Text>
                            </View>
                            <View
                                style={{
                                    flexDirection: 'row',
                                    alignItems: 'center',
                                    marginLeft: 16,
                                    width: 32
                                }}
                            >
                                <WithLocalSvg
                                    fill={this.state.theme.textSecondaryColor}
                                    width={12}
                                    height={12}
                                    asset={require('../../assets/icons/common/follow.svg')}
                                />
                                <Text
                                    style={{
                                        color: this.state.theme.textSecondaryColor,
                                        marginLeft: 4,
                                        fontSize: 13
                                    }}
                                >{item.following_count}</Text>
                            </View>
                                <View
                                    style={{
                                        flexDirection: 'row',
                                        alignItems: 'center',
                                        marginLeft: 16,
                                        width: 32
                                    }}
                                >
                                    <WithLocalSvg
                                        fill={this.state.theme.textSecondaryColor}
                                        width={12}
                                        height={12}
                                        asset={require('../../assets/icons/common/follow.svg')}
                                    />
                                    <Text
                                        style={{
                                            color: this.state.theme.textSecondaryColor,
                                            marginLeft: 4,
                                            fontSize: 13
                                        }}
                                    >{item.follower_count}</Text>
                            </View>
                        </View>
                    </View>
                     <TouchableOpacity style={{
                         position: 'absolute',
                         right: 16,
                         height: 30,
                         borderRadius: 3,
                         backgroundColor: this.state.theme.buttonColor,
                         justifyContent: 'center',
                         alignItems: 'center'
                     }}>
                        <Text
                            style={{
                                color: this.state.theme.buttonTextColor,
                                paddingLeft: 16,
                                paddingRight: 16,
                                fontSize: 15,
                                fontWeight: '500'
                            }}>Follow</Text>
                    </TouchableOpacity>
                </TouchableOpacity>
            );
        else if(this.props.collaborate)
            return (
                <View style={[styles.item_search_view,  {width: '100%'}]}>
                    <FastImage
                        style={ [styles.search_artwork] }
                        source={{
                            uri: item.artwork_url,
                            priority: FastImage.priority.normal,
                        }}
                        resizeMode={FastImage.resizeMode.contain}
                    />
                    <Text style={[styles.search_item_title_text, {color: this.state.theme.textPrimaryColor}]} numberOfLines={1}>{item.name}</Text>
                    <TouchableOpacity style={{position: 'absolute', right: 8, top: 22, height: 26, borderRadius: 3, backgroundColor: this.state.theme.inviteButtonBackgroundColor, justifyContent: 'center', alignItems: 'center'}}>
                        <Text style={{color: '#fff', paddingLeft: 16, paddingRight: 16, fontSize: 11}}>Invite</Text>
                    </TouchableOpacity>
                </View>
            );
        else
            return (
                <TouchableOpacity style={[styles.item_view, index===0 ? { marginLeft: 4 } : { marginLeft: 0 }, {marginRight: 4, width: this.getItemWidth(), paddingRight: 4, paddingLeft: 4, paddingTop: 4}]} onPress={ () => Actions.userShow({ user: item}) }>
                    <View style={ [styles.artwork, {width: '100%', aspectRatio: 1, borderRadius: (this.getItemWidth() - 8) / 2}] }>
                        <FastImage
                            style={ [styles.artwork, {width: '100%', aspectRatio: 1, borderRadius: (this.getItemWidth() - 8) / 2}] }
                            source={{
                                uri: item.artwork_url,
                                priority: FastImage.priority.normal,
                            }}
                            resizeMode={FastImage.resizeMode.contain}
                        />
                    </View>
                    <Text style={[styles.item_title_text, {color: this.state.theme.textPrimaryColor}]} numberOfLines={1}>{item.name}</Text>
                </TouchableOpacity>
            );
    };
    render() {
        if (!this.props.UserData) {
            return (
                <View style={ styles.container }>
                    <ActivityIndicator color={this.state.theme.indicatorColor} style={{flex: 1}}/>
                </View>
            );
        }
        if (!this.props.UserData.length) {
            return (<View style={ styles.container }><Text style={{color: this.state.theme.noDataTextColor, fontWeight: 'bold', fontSize: 17}}>{this.props.noDataString ? this.props.noDataString : 'No data has been found'}</Text></View>);
        }
        if (this.props.horizontal)
            return (
                <FlatList
                    data={this.props.UserData}
                    horizontal={true}
                    keyExtractor={this.keyExtractor}
                    renderItem={this.renderUser}
                    scrollEnabled={false}
                    theme={this.state.theme}
                />
            );
        else
            return (
                <FlatList
                    data={this.props.UserData}
                    numColumns={this.props.column}
                    key={this.props.column}
                    keyExtractor={this.keyExtractor}
                    renderItem={this.renderUser}
                    scrollEnabled={false}
                    theme={this.state.theme}
                />
            );
    }
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center'
    },
    item_search_view: {
        flexDirection: 'row',
        height: 70,
        alignItems: 'center',
        paddingLeft: 16
    },
    search_artwork: {
        marginRight: 8,
        borderRadius: 25,
        width: 50,
        height: 50
    },
    search_item_title_text: {
        fontSize: 17,
        fontWeight:'500',
    },
    search_item_subtitle_text: {
        fontSize: 13,
    },
    item_view: {
        borderRadius: 4,
        overflow: 'hidden',
        marginBottom: 20,
        marginTop: 8
    },
    blur_background_view: {
        borderRadius: 4,
        overflow: 'hidden',
        width: '100%',
        aspectRatio: 1,
        alignItems: 'center',
        justifyContent: 'center'
    },

    artwork: {
        ...Platform.select({
            ios: {
                shadowColor: 'rgba(0, 0, 0, .5)',
                shadowOffset: { width: 0, height: 1 },
                shadowOpacity: 0.5,
                shadowRadius: 3,
            },
        }),
    },
    item_title_text: {
        fontSize: 14,
        marginTop: 16,
        textAlign: 'center',
        fontWeight: 'bold'
    },
});


export default connect(({routes, scroll, language, display, player, auth}) => ({routes, scroll, language, display, player, auth}))(User);
