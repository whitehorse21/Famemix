import React, {Component} from 'react';
import {View, Text, StyleSheet, TouchableOpacity, FlatList} from 'react-native';
import {Actions} from 'react-native-router-flux';
import {connect} from "react-redux";
import Lightbox from '../flux/BaseLightbox';
import { Icon } from 'native-base';
import LinearGradient from 'react-native-linear-gradient';
import {playSong} from '../../helpers/Functions';
import FastImageBackground from "../../helpers/FastImageBackground";
const GLOBAL = require('../../../config/Global');


class LoginModal extends Component {
    constructor(props) {
        super(props);
        this.state = {
            info: {
                loves: '-',
                plays: '-',
                tags: []
            },
            theme: this.props.display.darkMode ? GLOBAL.themes.dark : GLOBAL.themes.light,
        };
    }
    componentDidMount() {

    }
    keyExtractor = (item, index) => index.toString();
    renderTags= ({ item, index }) => {
        return (
            <Text onPress={ () => {Actions.pop(); Actions.genreShow({ row: item})} } style={[styles.textTag, {color: this.state.theme.textSecondaryColor}]}>
                {item.name}
            </Text>
        );
    };
    render () {
        return (
            <Lightbox verticalPercent={0.5} horizontalPercent={0.9}>
                <View style={{width: '100%', backgroundColor: this.state.theme.songInfoModal.backgroundColor, borderRadius: 3}}>
                    <View style={{padding: 15}}>
                        <View style={{flexDirection: 'row'}}>
                            <View style={{height: 90, width: 90}}>
                                <FastImageBackground
                                    source={{uri: this.props.item.artwork_url,}}
                                    style={{flex: 1, borderRadius: 3, overflow: 'hidden'}}>
                                    <LinearGradient colors={['rgba(0,0,0,0)', 'rgba(0,0,0,.30)', 'rgba(0,0,0,.45)']} style={{flex: 1}}>
                                        <Text style={{position: 'absolute', left: 4, bottom: 2, color: '#fff', fontSize: 14}} numberOfLines={1}>
                                            <Icon type="SimpleLineIcons" name="heart" style={{fontSize: 12, color: '#fff'}} /> {this.state.info.loves}
                                        </Text>
                                        <Text style={{position: 'absolute', right: 4, bottom: 2, color: '#fff', fontSize: 14}} numberOfLines={1}>
                                            <Icon type="SimpleLineIcons" name="earphones" style={{fontSize: 12, color: '#fff'}} /> {this.state.info.plays}
                                        </Text>
                                    </LinearGradient>
                                </FastImageBackground>
                            </View>
                            <View style={{flex: 1, paddingLeft: 15}}>
                                <Text style={{fontWeight: 'bold', color: this.state.theme.textPrimaryColor, marginBottom: 4, fontSize: 18}} numberOfLines={1}>{this.props.item.title}</Text>
                                <Text style={{color: this.state.theme.textSecondaryColor, fontSize: 14, marginBottom: 8}} numberOfLines={1}>{this.props.item.artists.map(function (artist) {return artist.name}).join(", ")}</Text>
                                <FlatList
                                    data={this.state.info.tags}
                                    keyExtractor={this.keyExtractor}
                                    renderItem={this.renderTags}
                                    horizontal={true}
                                />
                            </View>
                        </View>
                    </View>
                    <View style={{height: 38, borderBottomLeftRadius: 3, borderBottomRightRadius: 3, backgroundColor: this.state.theme.songInfoModal.footerBackgroundColor, borderTopWidth: 1, borderTopColor: this.state.theme.songInfoModal.footerTopBorderColor, flexDirection: 'row', alignItems: 'center', justifyContent: 'flex-end'}}>
                        <TouchableOpacity onPress={() => {playSong(this.props.item); Actions.pop()}} style={[styles.button, {backgroundColor: this.state.theme.songInfoModal.buttonColor}]}>
                            <Icon type="SimpleLineIcons" name="control-play" style={{fontSize: 12, color: this.state.theme.songInfoModal.buttonTextColor, marginRight: 8}}/>
                            <Text style={{fontWeight: 'bold', color: this.state.theme.songInfoModal.buttonTextColor, fontSize: 12}} numberOfLines={1}>Play Song</Text>
                        </TouchableOpacity>
                        <TouchableOpacity style={[styles.button, {backgroundColor: this.state.theme.songInfoModal.buttonColor}]}>
                            <Icon type="SimpleLineIcons" name="heart" style={{fontSize: 12, color: this.state.theme.songInfoModal.buttonTextColor, marginRight: 8}}/>
                            <Text style={{fontWeight: 'bold', color: this.state.theme.songInfoModal.buttonTextColor, fontSize: 12}} numberOfLines={1}>Add to My Music</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </Lightbox>
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
    button: {
        flexDirection: 'row',
        height: 26,
        borderRadius: 3,
        paddingLeft: 10,
        paddingRight: 10,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 5
    },
    textTag: {
        alignSelf: 'flex-start', borderRadius: 3, overflow: 'hidden', fontWeight: 'bold', padding: 4, fontSize: 13, backgroundColor: '#ccc', marginRight: 8
    }
});

export default connect(({language, display}) => ({language, display}))(LoginModal);
