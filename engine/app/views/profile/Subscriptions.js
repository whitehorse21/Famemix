import React, {Component} from 'react';
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    Platform,
    StatusBar,
    ScrollView,
    ActivityIndicator,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

import Icon from 'react-native-vector-icons/Ionicons';
import NavHeader from '../common/NavHeader';
import {Actions} from "react-native-router-flux";
import {connect} from "react-redux";
import API from '../../helpers/Axios';

const GLOBAL = require("../../../config/Global");
class Subscriptions extends Component {
    static onEnter = async () => {
        let theme = await AsyncStorage.getItem('theme');
        if(theme === 'light')
            StatusBar.setBarStyle(GLOBAL.themes.light.defaultStatusBar, false)
        else if(theme === 'dark')
            StatusBar.setBarStyle(GLOBAL.themes.dark.defaultStatusBar, false)
    };
    constructor(props) {
        super(props);
        this.state = {
            theme: this.props.display.darkMode ? GLOBAL.themes.dark : GLOBAL.themes.light,
            mini: props.player.show ? props.player.show : false,
            isLoading: true,
            data: [],
            currentPlan: null,
            currentPlanId: null
        };
    }
    componentWillReceiveProps(nextProps) {
        if(this.props.display.darkMode !== nextProps.display.darkMode ) {
            nextProps.display.darkMode ? this.setState({theme: GLOBAL.themes.dark}) : this.setState({theme: GLOBAL.themes.light})
        }
        if( this.props.player.show !==  nextProps.player.show) {
            this.setState({mini: nextProps.player.show});
        }
    }
    componentDidMount() {
        API.get('settings/subscription')
            .then(res => {
                this.setState({
                    data: res.data,
                    isLoading: false
                });
            }).catch (error => {
        });
    }
    renderMarginBottom() {
        if (this.state.mini) {
            return (
                <View style={{marginBottom: 50}}/>
            )
        }
    };
    selectPlan(item) {
        this.setState({
            currentPlan: item,
            currentPlanId: item.id,
        });
    }

    renderPlan() {
        return this.state.data.map((item) =>
            {
                return (
                    <TouchableOpacity
                        onPress={() => {
                            this.selectPlan(item)
                        }}
                        style={{
                            width: '100%',
                            marginBottom: 32,
                            paddingLeft: 16,
                            paddingRight: 16,
                            flexDirection: 'row',
                            justifyContent: 'space-between',
                            backgroundColor: this.state.currentPlanId === item.id ? '#5330f5' : this.state.theme.secondaryBackgroundColor,
                            borderRadius: 8,
                            alignItems: 'center',
                            paddingTop: 24,
                            paddingBottom: 24
                        }}
                    >
                        {this.state.currentPlanId === item.id && <View style={{
                            position: 'absolute',
                            top: -4,
                            left: -4,
                            right: -4,
                            bottom: -4,
                            borderRadius: 12,
                            borderWidth: 2,
                            borderColor: '#5330f5'
                        }} />}
                        <View>
                            <Text
                                style={{
                                    fontWeight: 'bold',
                                    fontSize: 18,
                                    color: this.state.theme.textPrimaryColor,
                                    marginBottom: 4,
                                }}
                            >{item.title}</Text>
                            <Text
                                style={{
                                    fontSize: 16,
                                    color: this.state.theme.textPrimaryColor,
                                }}
                                numberOfLines={1}
                            >{item.description}</Text>
                        </View>
                        <View
                            style={{
                                flexDirection: 'row',
                                alignItems: 'center'
                            }}
                        >
                            <Text
                                style={{
                                    fontSize: 32,
                                    color: this.state.theme.textPrimaryColor,
                                    marginBottom: 4,
                                }}
                            >{item.currency_symbol}{item.price}</Text>
                            <Text
                                style={{
                                    fontSize: 16,
                                    color: this.state.theme.textPrimaryColor,
                                }}
                            >/{this.renderPeriod(item.plan_period_format)}</Text>
                        </View>
                        {this.renderTrialTip(item)}
                    </TouchableOpacity>
                )
            }
        )
    }
    renderTrialTip(item) {
        if(parseInt(item.trial))
            return (
            <View
                style={{
                    height: 24,
                    backgroundColor: 'white',
                    borderRadius: 4,
                    paddingLeft: 8,
                    paddingRight: 8,
                    position: 'absolute',
                    top: -12,
                    right: 32
                }}
            >
                <Text
                    style={{
                        lineHeight: 24,
                        fontWeight: 'bold',
                        color: this.state.currentPlanId === item.id ? '#5330f5' : '#000'
                    }}
                >{item.trial_period} {this.renderPeriod(item.plan_period_format)} Free Trial</Text>
            </View>
        )
    }
    renderPeriod(period) {
        if(period === 'D') {
            return 'Day'
        } else if(period === 'W') {
            return 'Week'
        } else if(period === 'M') {
            return 'Month'
        } else if(period === 'Y') {
            return 'Year'
        }
    }
    render () {
        if (this.state.isLoading) return (
            <ActivityIndicator color={this.state.theme.indicatorColor} style={{flex: 1, backgroundColor: this.state.theme.primaryBackgroundColor}}/>
        );
        return (
            <View style={[styles.container, {backgroundColor: this.state.theme.primaryBackgroundColor}]}>
                <NavHeader title={'Subscription'}/>
                <ScrollView showsVerticalScrollIndicator={true}>
                    <View
                        style={{
                            flex: 1,
                            justifyContent: 'center',
                            alignItems: 'center',
                            marginTop: 64,
                            marginBottom: 64,
                            paddingLeft: 32,
                            paddingRight: 32
                        }}
                    >
                        <Text
                            style={{
                                fontWeight: 'bold',
                                fontSize: 24,
                                color: this.state.theme.textPrimaryColor,
                                marginBottom: 32,
                            }}
                        >Pricing Plan</Text>
                        <Text
                            style={{
                                fontSize: 17,
                                color: this.state.theme.textSecondaryColor,
                                textAlign: 'center'
                            }}
                        >Upgrade your account and enjoy exclusive premium features.</Text>
                    </View>
                    <View
                        style={{
                            flex: 1,
                            paddingLeft: 16,
                            paddingRight: 16
                        }}
                    >
                        {this.renderPlan()}
                    </View>
                </ScrollView>
                {this.state.currentPlanId !== null &&
                (
                    <TouchableOpacity
                        onPress={ () => Actions.contextMenu({ kind:'subscription', item: this.state.currentPlan}) }
                        style={{
                            marginTop: 16,
                            marginLeft: 16,
                            marginRight: 16,
                            padding: 16,
                            backgroundColor: this.state.theme.primaryButton.backgroundColor,
                            borderRadius: 8,
                            marginBottom: 16
                        }}
                    >
                        <Text
                            style={{
                                fontSize: 19,
                                fontWeight: '600',
                                color: this.state.theme.primaryButton.textColor,
                                textAlign: 'center'
                            }}
                        >Continue</Text>
                    </TouchableOpacity>
                )}
                {this.renderMarginBottom()}
            </View>
        );
    }
}
const styles = StyleSheet.create({
    container: {
        flex: 1
    },
    setting_box: {
        height: 70,
        overflow: 'hidden',
        flexDirection: 'row',
        alignItems: 'center'
    },
    settings_text: {
        fontSize: 15,
        marginLeft: 8,
        fontWeight: 'bold'
    },
    headline: {
        fontSize: 16,
        marginTop: 32,
        marginLeft: 8,
        fontWeight: 'bold',
        marginBottom: 28
    },
    settingMenu: {
        height: 40,
        overflow: 'hidden',
        flexDirection: 'row',
        alignItems: 'center',
        paddingLeft: 16,
        width: '100%',
    },
    more: {
        position: 'absolute',
        right: 10,
    },
    settingMenu_title: {
        fontSize: 13,
        marginLeft: 10,
    },
    setting_submenu_icon: {
        width: 20,
        height: 40,
        alignItems: 'center',
        justifyContent: 'center',
    },
});


export default connect(({language, display, player}) => ({language, display, player}))(Subscriptions);
