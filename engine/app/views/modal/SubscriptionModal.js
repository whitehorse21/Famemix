import React, {Component} from 'react';
import {
    View,
    Text,
    KeyboardAvoidingView,
    StyleSheet,
    TextInput,
    TouchableOpacity,
    ScrollView, Animated, Dimensions, ActivityIndicator, FlatList, Image,
} from 'react-native';
import { Actions } from 'react-native-router-flux';
import {connect} from "react-redux";
import {ifIphoneX} from "../../helpers/ifIphoneX";
import {changeStatusBarStyle} from "../../helpers/Functions";
import API from "../../helpers/Axios";
import FastImage from "react-native-fast-image";
const GLOBAL = require('../../../config/Global');

class SubscriptionModal extends Component {
    static onEnter = async () => {
        changeStatusBarStyle();
    };
    constructor(props) {
        super(props);
        this.state = {
            theme: this.props.display.darkMode ? GLOBAL.themes.dark : GLOBAL.themes.light,
            items: [],
            isLoading: true,
            kind: this.props.kind
        };
    }
    _fetchData = (term, type) => {
        const { page } = this.state;
        API.get(`search/${type}?q=${term}&limit=20`)
            .then(res => {
                this.setState({
                    items: res.data.data,
                    isLoading: false
                });
            });
    };
    componentDidMount() {
        this._fetchData('a', this.props.kind);
    }
    onChangeText = text => {
        this._fetchData(text, this.props.kind);
    }
    keyExtractor = (item, index) => index.toString();
    renderItem = ({ item, index }) => {
        return (
            <TouchableOpacity
                style={{
                    flexDirection: 'row',
                    flex: 1,
                    alignItems: 'center',
                    paddingLeft: 16,
                    paddingRight: 16,
                    marginBottom: 16
                }}
                onPress={() => {
                    Actions.pop();
                    setTimeout(() => {
                        Actions.refresh({
                            share: item,
                            shareKind: this.props.kind
                        });
                    }, 0);
                }}
            >
                <FastImage
                    style={{
                        width: 50,
                        height: 50,
                        borderRadius: 3
                    }}
                    source={{
                        uri: item.artwork_url,
                        priority: FastImage.priority.normal,
                    }}
                />
                <View style={{
                    marginLeft: 12,
                    marginRight: 128
                }}>
                    <Text style={{
                        color: this.state.theme.textPrimaryColor,
                        fontWeight: '500',
                        marginBottom: 4,
                        fontSize: 17
                    }}
                          numberOfLines={1}
                    >{(this.props.kind === 'song' || this.props.kind === 'playlist' || this.props.kind === 'album') && item.title}{(this.props.kind === 'artist') && item.name}</Text>
                    {(this.props.kind === 'song' || this.props.kind === 'playlist' || this.props.kind === 'album') &&
                    <Text
                        style={{
                            color: this.state.theme.textSecondaryColor
                        }}
                        numberOfLines={1}
                    >{this.props.kind === 'playlist' && item.user.name}{(this.props.kind === 'song' || this.props.kind === 'album') && item.artists.map(function (artist) {return artist.name}).join(", ")}</Text>
                    }
                </View>
                <View
                    style={{
                        position: 'absolute',
                        right: 16,
                        justifyContent: 'center',
                        alignItems: 'center',
                        backgroundColor: this.state.theme.primaryButton.backgroundColor,
                        paddingLeft: 8,
                        paddingRight: 8,
                        paddingBottom: 4,
                        paddingTop: 4,
                        borderRadius: 3
                    }}
                >
                    <Text
                        style={{
                            color: this.state.theme.primaryButton.textColor,
                            fontSize: 14,
                            fontWeight: 'bold'
                        }}
                    >Select</Text>
                </View>
            </TouchableOpacity>
        );
    };
    render () {
        return (
            <View style={[styles.container, {backgroundColor: this.state.theme.primaryBackgroundColor}]}>
                <View style={[styles.nav, {borderBottomColor: this.state.theme.navBorderColor}]}>
                    <TouchableOpacity onPress={this.saveProfile} style={styles.cancelButton}>
                        <Text
                            onPress={Actions.pop}
                            style={{
                                fontWeight: 'bold',
                                fontSize: 17,
                                color: this.state.theme.textPrimaryColor
                            }}
                        >Cancel</Text>
                    </TouchableOpacity>
                </View>
            </View>
        );

    }
}
const styles = StyleSheet.create({
    container: {
        ...ifIphoneX({
            paddingTop: 34
        }, {
            paddingTop: 20,
        }),
        flex: 1,
    },
    nav: {
        flexDirection: 'row',
        width: '100%',
        borderBottomWidth: 1,
        height: 50,
        alignItems: 'center',
        justifyContent: 'center'
    },
    cancelButton: {
        position: 'absolute',
        left: 16,
        height: 50,
        alignItems: 'center',
        justifyContent: 'center'
    },
    saveButton: {
        position: 'absolute',
        right: 16,
        height: 50,
        alignItems: 'center',
        justifyContent: 'center'
    },
    editIcon: {
        position: 'absolute',
        bottom: 0,
        right: 0,
        left: 0,
        paddingLeft: 8,
        paddingRight: 8,
        paddingTop: 4,
        paddingBottom: 4,
        backgroundColor: 'rgba(255, 255, 255, 0.7)',
        alignItems: 'center',
        justifyContent: 'center'
    },
    wrap: {
        width: '100%',
        padding: 24
    },
    inputField: {
        padding: 8,
        margin: 16,
        borderRadius: 3,
    },
    inputPlaceholder: {
        color: 'white'
    },
});

export default connect(({display, auth}) => ({display, auth}))(SubscriptionModal);
