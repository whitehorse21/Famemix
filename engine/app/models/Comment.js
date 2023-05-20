import React, { Component } from "react";
import {
    View,
    FlatList,
    Text,
    ActivityIndicator,
    StyleSheet,
    TouchableOpacity,
} from "react-native";
import {connect} from "react-redux";
import API from "../helpers/Axios";
const GLOBAL = require('../../config/Global');
import Reaction from './Reaction';
import i18n from "i18n-js";
import {WithLocalSvg} from "react-native-svg";
import FastImage from "react-native-fast-image";
import {Actions} from 'react-native-router-flux';
import {decode} from "html-entities";

class Comment extends Component {
    constructor(props) {
        super(props);
        this.state = {
            theme: this.props.display.darkMode ? GLOBAL.themes.dark : GLOBAL.themes.light,
            data: null,
            reactions: {},
        };
    }
    async componentWillReceiveProps(nextProps, nextContent): void {
        if(this.props.display.darkMode !== nextProps.display.darkMode ) {
            nextProps.display.darkMode ? this.setState({theme: GLOBAL.themes.dark}) : this.setState({theme: GLOBAL.themes.light})
        }
    }
    componentDidMount() {
        this.props.onRef(this);
        this._fetchData(this.props.commentable_type, this.props.commentable_id);
    }
    componentWillUnmount() {
        this.props.onRef(undefined);
    }
    onClickOutSide = () => {
        console.log('Just clicked to view');
        const update = {};
        this.setState({reactions: update});
    };
    timeAgo = (time) => {
        switch (typeof time) {
            case 'number':
                break;
            case 'string':
                time = +new Date(time);
                break;
            case 'object':
                if (time.constructor === Date) time = time.getTime();
                break;
            default:
                time = +new Date();
        }
        var time_formats = [
            [60, 's', 1],
            [120, '1m', '1m'],
            [3600, 'm', 60],
            [7200, '1h', '1h'],
            [86400, 'h', 3600],
            [172800, '1d', '1d'],
            [604800, 'd', 86400],
            [1209600, 'w', 'Next week'],
            [2419200, 'weeks', 604800],
            [4838400, '1M', '1M'],
            [29030400, 'm', 2419200],
            [58060800, 'y', 'y'],
            [2903040000, 'y', 29030400]
        ];
        var seconds = (+new Date() - time) / 1000,
            token = i18n.t('ago'),
            list_choice = 1;

        if (seconds === 0) {
            return i18n.t('just_now')
        }
        if (seconds < 0) {
            seconds = Math.abs(seconds);
            token = i18n.t('from_now');
            list_choice = 2;
        }

        var i = 0,
            format;
        while (format = time_formats[i++])
            if (seconds < format[0]) {
                if (typeof format[2] == 'string')
                    return format[list_choice];
                else
                    return Math.floor(seconds / format[2]) + format[1];
            }
        return time;
    }
    _fetchData = (commentable_type, commentable_id) => {
        const { page } = this.state;
        const data = {
            commentable_type: commentable_type,
            commentable_id: commentable_id,
        };

        API.post('comments/get', data)
            .then(res => {
                this.setState((prevState, nextProps) => ({
                    data: res.data.data,
                }));
            });
    };
    renderCommentAction = (item) => {
        return (
            <View
                style={{
                    flexDirection: 'row',
                    marginLeft: 12,
                    marginTop: 4
                }}
            >
                <TouchableOpacity
                    onLongPress={() => {
                        if(this.props.auth.isLogged) {
                            const update = {};
                            update['indicator_' + item.id] = true;
                            this.setState({reactions: update});
                        } else {
                            Actions.loginModal();
                        }
                    }}
                    onPress={() => {
                        if(this.props.auth.isLogged) {
                            alert('like di');
                        } else {
                            Actions.loginModal();
                        }
                    }}
                >
                    <Text
                        style={{
                            color: this.state.theme.textSecondaryColor,
                            fontSize: 13,
                            fontWeight: '600'
                        }}
                    >Like</Text>
                </TouchableOpacity>
                {this.state.reactions['indicator_' + item.id] === true && (
                    <Reaction
                        theme={this.state.theme}
                        type={item.reacted ? item.reacted.type : 'none'}
                        comment={item}
                    />
                )
                }
                <Text
                    style={{
                        color: this.state.theme.textSecondaryColor,
                        fontSize: 17,
                        fontWeight: '600',
                        lineHeight: 17
                    }}
                > · </Text>
                <TouchableOpacity
                    onPress={() => {
                        if(this.props.auth.isLogged) {
                            alert('reply di');
                        } else {
                            Actions.loginModal();
                        }
                    }}
                >
                    <Text
                        style={{
                            color: this.state.theme.textSecondaryColor,
                            fontSize: 13,
                            fontWeight: '600'
                        }}
                    >Reply</Text>
                </TouchableOpacity>
                <Text
                    style={{
                        color: this.state.theme.textSecondaryColor,
                        fontSize: 17,
                        fontWeight: '600',
                        lineHeight: 17
                    }}
                > · </Text>
                <Text
                    style={{
                        color: this.state.theme.textSecondaryColor,
                        fontSize: 12,
                        fontWeight: '400'
                    }}
                >{this.timeAgo(item.created_at)}</Text>
            </View>
        )
    }
    commentKeyExtractor = (item, index) => index.toString();
    renderComment = ({ item, index }) => {
        return (
            <View
                style={{
                    flex: 1,
                    flexDirection: 'row',
                }}>
                <TouchableOpacity
                    style={{
                        width: 30,
                        height: 30,
                        borderRadius: 15,
                        overflow: 'hidden'
                    }}
                >
                    <FastImage
                        style={{
                            width: 30,
                            height: 30,
                        }}
                        source={{
                            uri: item.user.artwork_url,
                            priority: FastImage.priority.normal,
                        }}
                        resizeMode={FastImage.resizeMode.contain}
                    />
                </TouchableOpacity>
                <View
                    style={{
                        marginLeft: 8,
                        marginBottom: 8,
                        flex: 1
                    }}
                >
                    <View
                        style={{
                            backgroundColor: this.state.theme.comment.backgroundColor,
                            paddingLeft: 12,
                            paddingRight: 12,
                            paddingTop: 8,
                            paddingBottom: 8,
                            borderRadius: 18,
                            alignSelf: 'flex-start',
                        }}
                    >
                        <Text
                            style={{
                                color: this.state.theme.textPrimaryColor,
                                fontSize: 13,
                                fontWeight: '600',
                                lineHeight: 16
                            }}
                        >{item.user.name}</Text>
                        <Text
                            style={{
                                color: this.state.theme.textPrimaryColor,
                                fontSize: 16,
                                fontWeight: '400'
                            }}
                        >{decode(item.content)}</Text>
                        {this.renderReactions(item.reactions, item.content.length)}
                    </View>
                    {this.renderCommentAction(item)}
                    {this.renderReplies(item.replies)}
                </View>
            </View>
        );
    };
    replyKeyExtractor = (item, index) => index.toString();
    renderReply = ({ item, index }) => {
        return (
            <View
                style={{
                    flex: 1,
                    flexDirection: 'row',
                }}>
                <TouchableOpacity
                    style={{
                        width: 24,
                        height: 24,
                        borderRadius: 12,
                        overflow: 'hidden'
                    }}
                >
                    <FastImage
                        style={{
                            width: 24,
                            height: 24,
                        }}
                        source={{
                            uri: item.user.artwork_url,
                            priority: FastImage.priority.normal,
                        }}
                        resizeMode={FastImage.resizeMode.contain}
                    />
                </TouchableOpacity>
                <View
                    style={{
                        marginLeft: 8,
                        marginBottom: 8,
                        flex: 1
                    }}
                >
                    <View
                        style={{
                            backgroundColor: this.state.theme.comment.backgroundColor,
                            paddingLeft: 12,
                            paddingRight: 12,
                            paddingTop: 8,
                            paddingBottom: 8,
                            borderRadius: 18,
                            alignSelf: 'flex-start',
                        }}
                    >
                        <Text
                            style={{
                                color: this.state.theme.textPrimaryColor,
                                fontSize: 13,
                                fontWeight: '600',
                                lineHeight: 16
                            }}
                        >{item.user.name}</Text>
                        <Text
                            style={{
                                color: this.state.theme.textPrimaryColor,
                                fontSize: 16,
                                fontWeight: '400'
                            }}
                        >{decode(item.content)}</Text>
                        {this.renderReactions(item.reactions, item.content.length)}
                    </View>
                    {this.renderCommentAction(item)}
                </View>
            </View>
        );
    };
    renderReplies(replies){
        if(replies.data.length)
        return (
            <FlatList
                data={replies.data}
                keyExtractor={this.replyKeyExtractor}
                renderItem={this.renderReply}
                theme={this.state.theme}
                style={{
                    marginTop: 8,
                    marginLeft: 12
                }}

            />
        );
    }
    renderReactionIcon(type) {
        switch (type) {
            case 'like':
                return (
                    <WithLocalSvg
                        width={18}
                        height={18}
                        asset={

                            require('../../assets/icons/reactions/like.svg')
                        }
                    />
                );
            case 'haha':
                return (
                    <WithLocalSvg
                        width={18}
                        height={18}
                        asset={

                            require('../../assets/icons/reactions/haha.svg')
                        }
                    />
                );
            case 'wow':
                return (
                    <WithLocalSvg
                        width={18}
                        height={18}
                        asset={

                            require('../../assets/icons/reactions/wow.svg')
                        }
                    />
                );
            case 'love':
                return (
                    <WithLocalSvg
                        width={18}
                        height={18}
                        asset={

                            require('../../assets/icons/reactions/love.svg')
                        }
                    />
                );
            case 'sad':
                return (
                    <WithLocalSvg
                        width={18}
                        height={18}
                        asset={

                            require('../../assets/icons/reactions/sad.svg')
                        }
                    />
                );
            case 'angry':
                return (
                    <WithLocalSvg
                        width={18}
                        height={18}
                        asset={

                            require('../../assets/icons/reactions/angry.svg')
                        }
                    />
                );
        }
    }
    renderReactions(reactions, stringLength) {
        if(reactions && parseInt(reactions.length))
        return (
                <View
                    style={{
                        position: 'absolute',
                        height: 22,
                        flexDirection: 'row',
                        backgroundColor: this.state.theme.comment.reactionsBackgroundColor,
                        bottom: stringLength > 20 ? -12 : 8,
                        right: stringLength > 20 ? 12 : -32,
                        borderRadius: 12,
                        justifyContent: 'center',
                        alignItems: 'center',
                        shadowColor: "rgba(0, 0, 0, .2)",
                        shadowOffset: {
                            width: 0,
                            height: 1,
                        },
                        shadowOpacity: 1,
                        shadowRadius: 1.00,
                        elevation: 1,
                    }}
                >
                    {
                        reactions.map((l, i) => (
                            <View
                                style={{
                                    width: 22,
                                    height: 22,
                                    backgroundColor: this.state.theme.comment.reactionsBackgroundColor,
                                    justifyContent: 'center',
                                    alignItems: 'center',
                                    marginRight: -5,
                                    zIndex: -i,
                                    borderRadius: 12
                                }}
                            >
                                {this.renderReactionIcon(l.type)}
                            </View>
                        ))
                    }
                    <Text
                        style={{
                            paddingLeft: 8,
                            paddingRight: 5,
                            lineHeight: 22,
                            fontSize: 13,
                            color: this.state.theme.textSecondaryColor
                        }}
                    >{reactions.length}</Text>
                </View>
        )
    }
    render() {
        if (! this.state.data) {
            return <ActivityIndicator color={this.state.theme.indicatorColor} style={{ flex: 1}} />;
        }
        return (
            <View
                style={{
                    paddingLeft: 16,
                    paddingRight: 16,
                    flex: 1
                }}
            >
                {this.state.data && ! this.props.hideHeader &&
                    <Text
                        style={{
                            fontSize: 17,
                            fontWeight: '600',
                            color: this.state.theme.textPrimaryColor,
                            marginBottom: 32
                        }}
                    >Comments ({this.state.data.length})</Text>
                }
                <FlatList
                    data={this.state.data}
                    keyExtractor={this.commentKeyExtractor}
                    renderItem={this.renderComment}
                    theme={this.state.theme}
                    extraData={this.state}
                />
            </View>
        );
    }
}
const styles = StyleSheet.create({

});

export default connect(({language, display, auth}) => ({language, display, auth}))(Comment);
