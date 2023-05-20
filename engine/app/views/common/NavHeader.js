/*
 * Created by ninacoder
 * @https://codecanyon.net/user/codenamenina
 */

import React, { Component } from "react";
import {View, Platform, Text, StyleSheet, TouchableOpacity, StatusBar} from "react-native";
import { Icon } from 'native-base';
import {Actions} from 'react-native-router-flux';
import {ifIphoneX} from "../../helpers/ifIphoneX";
import {connect} from "react-redux";
import {WithLocalSvg} from "react-native-svg";
const GLOBAL = require('../../../config/Global');

class NavHeader extends Component {
    constructor(props) {
        super(props);
        this.state = {
            theme: this.props.display.darkMode ? GLOBAL.themes.dark : GLOBAL.themes.light,
            cart: {
                item_count: this.props.cart.item_count
            }
        };
    }
    componentWillReceiveProps(nextProps) {
        if(this.props.display.darkMode !== nextProps.display.darkMode ) {
            nextProps.display.darkMode ? this.setState({theme: GLOBAL.themes.dark}) : this.setState({theme: GLOBAL.themes.light})
        }
    }
    render() {
        return(
        <View style={[styles.Nav, {backgroundColor: this.state.theme.navBackgroundColor}]}>
            <View
                style={{
                    flex: 1,
                    height: 50,
                    position: 'absolute',
                    alignItems: 'center',
                    paddingLeft: 16,
                    paddingRight: 16,
                    justifyContent: 'center',
                    width: '100%',
                    bottom: 0,
                    backgroundColor: this.state.theme.navBackgroundColor,
                    borderBottomColor: this.state.theme.navBorderColor, borderBottomWidth: this.props.noBorder ? 0 : .5
                }}
            >
                <Text
                    style={[styles.Title, {color: this.state.theme.textPrimaryColor}]}
                    numberOfLines={1}
                >{this.props.title}</Text>
                {! this.props.isOwner &&
                    <TouchableOpacity onPress={Actions.pop} style={styles.headerClose}>
                        <WithLocalSvg
                            fill={this.state.theme.navIconColor}
                            width={16}
                            height={16}
                            asset={Platform.OS === 'android' ? require('../../../assets/icons/common/back-android.svg') : require('../../../assets/icons/common/back-ios.svg')}
                        />
                    </TouchableOpacity>
                }
            </View>
        </View>
        )
    }
}

const styles = StyleSheet.create({
    Nav: {
        ...ifIphoneX({
            height: 84
        }, {
            height: Platform.OS === 'android' ? (50 + StatusBar.currentHeight) : 70,
        }),
    },
    headerClose: {
        position: 'absolute',
        left: 16,
        height: 30,
        width: 30,
        flexDirection: 'row',
        alignItems: 'center',
    },
    Title: {
        fontWeight: '600',
        fontSize: 17,
        marginLeft: 40,
        marginRight: 64,
    },
});


export default connect(({routes, scroll, language, display, player, auth, cart}) => ({routes, scroll, language, display, player, auth, cart}))(NavHeader);
