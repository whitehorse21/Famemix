'use strict';
import React, { Component } from 'react';
import {
    StyleSheet,
    Dimensions,
    View,
    ScrollView,
    Platform,
    StatusBar,
    Text,
    TouchableOpacity
} from 'react-native';
import Toast from "react-native-root-toast";
import NavHeader from '../common/NavHeader';
import Station from '../../models/Station';
import {connect} from "react-redux";
import {changeStatusBarStyle} from "../../helpers/Functions";
import API from "../../helpers/Axios";
const window = Dimensions.get('window');
const GLOBAL = require('../../../config/Global');

class StationList extends Component {
    static onEnter = async () => {
        changeStatusBarStyle();
    };
    onLayoutScreen = (e) => {
        let width = e.nativeEvent.layout.width;
        if (width !== this.state.layoutWidth) {
            this.setState({
                layoutWidth: width,
                theme: this.props.display.darkMode ? GLOBAL.themes.dark : GLOBAL.themes.light
            })
        }
    };
    constructor(props) {
        super(props);
        this.state = {
            layoutWidth: window.width,
            mini: props.player.show ? props.player.show : false,
            theme: this.props.display.darkMode ? GLOBAL.themes.dark : GLOBAL.themes.light,
            data: null,
            page: 1,
            loading: true,
            loadingMore: false,
            error: null
        };
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
    componentDidMount() {
        this._fetchData();
    }
    _fetchData = () => {
        const { page } = this.state;
        API.get(`radio/category/${this.props.row.alt_name}?page=${page}`)
            .then(res => {
                this.setState((prevState, nextProps) => ({
                    data:
                        page === 1
                            ? Array.from(res.data.stations.data)
                            : [...this.state.data, ...res.data.stations.data],
                    loading: false
                }));

            });
    };
    _handleLoadMore = () => {
        this.setState(
            (prevState, nextProps) => ({
                page: prevState.page + 1,
                loadingMore: true
            }),
            () => {
                this._fetchData();
            }
        );
    };
    render(){
        return (
            <View style={[styles.container, {backgroundColor: this.state.theme.primaryBackgroundColor}]} onLayout={this.onLayoutScreen}>
                <NavHeader title={this.props.row.name + ' radio'}/>
                <ScrollView
                    style={{flex: 1, padding: 8}}
                    contentContainerStyle={{flexGrow: 1}}
                    ref={(scroll) => {this.scroll = scroll;}}
                            showsVerticalScrollIndicator={false}
                            onScroll={(e) => {
                                let paddingToBottom = 50;
                                paddingToBottom += e.nativeEvent.layoutMeasurement.height;
                                if(e.nativeEvent.contentOffset.y >= e.nativeEvent.contentSize.height - paddingToBottom) {
                                    this._handleLoadMore();
                                }
                            }}>
                    <Station stationData={this.state.data} horizontal={false} />
                </ScrollView>
                {this.renderMarginBottom()}
            </View>
        );
    }
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    content: {
        ...Platform.select({
            ios: {
                paddingTop: 68,
            },
            android: {
                paddingTop: 60
            },
        }),
    },
});


export default connect(({routes, scroll, language, display, player, auth}) => ({routes, scroll, language, display, player, auth}))(StationList);
