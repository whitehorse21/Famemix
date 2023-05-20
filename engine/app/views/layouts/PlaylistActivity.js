import React, {Component} from 'react';
import {View, ScrollView, StyleSheet, Dimensions, Platform, ActivityIndicator} from 'react-native';
const GLOBAL = require('../../../config/Global');
import Activity from "../../models/Activity";
import NavHeader from "../common/NavHeader";
import {connect} from "react-redux";
import {changeStatusBarStyle} from "../../helpers/Functions";
import API from "../../helpers/Axios";

const window = Dimensions.get('window');

class PlaylistActivity extends Component {
    static onEnter = async () => {
        changeStatusBarStyle();
    };
    constructor(props) {
        super(props);
        this.state = {
            ActivitiesData: null,
            subscribersData: null,
            collaboratorsData: null,
            layoutWidth: window.width,
            theme: this.props.display.darkMode ? GLOBAL.themes.dark : GLOBAL.themes.light,
        };
    }
    componentDidMount() {
        this.fetchData();
    }
    fetchData(){
        API.get('playlist/' + this.props.playlist.id + '/activities')
            .then(res => {
                this.setState({
                    ActivitiesData: res.data.activities,
                });
            });
    }
    renderActivity () {
        if (this.state.ActivitiesData === null) {
            return (
                <ActivityIndicator color={this.state.theme.indicatorColor} style={{flex: 1}}/>
            )
        } else {
            return (
                <ScrollView style={{flex: 1}}>
                    <Activity ActivitiesData={this.state.ActivitiesData} from={'playlist'} theme={this.state.theme}/>
                </ScrollView>
            )
        }
    }
    render () {
        return (
            <View style={[styles.container, {backgroundColor: this.state.theme.primaryBackgroundColor}]}>
                <NavHeader title={this.props.playlist.title + ' Activity'} noBorder={true}/>
                {this.renderActivity()}
            </View>
        );

    }
}
const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    tabContent: {
        justifyContent: 'center',
        paddingLeft: 8,
        paddingRight: 8,
    },
    headerCloseButton: {
        ...Platform.select({
            ios: {
                padding: 15,
            },
            android: {
                padding: 13,
            },
        }),
    }
});


export default connect(({routes, scroll, language, display, player, auth}) => ({routes, scroll, language, display, player, auth}))(PlaylistActivity)
