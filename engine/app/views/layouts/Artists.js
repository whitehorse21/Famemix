import React, { Component } from "react";
import {View, ActivityIndicator, StyleSheet, ScrollView, Dimensions, StatusBar} from "react-native";
import Toast from "react-native-root-toast";
import NavHeader from '../common/NavHeader';
import Artist from '../../models/Artist';
import {ifIphoneX} from "../../helpers/ifIphoneX";
import {connect} from "react-redux";
import {changeStatusBarStyle} from "../../helpers/Functions";
const GLOBAL = require('../../../config/Global');

const window = Dimensions.get('window');

class Artists extends Component {
    static onEnter = async () => {
        changeStatusBarStyle();
    };
    onLayoutScreen = (e) => {
        let width = e.nativeEvent.layout.width;
        if (width !== this.state.layoutWidth) {
            this.setState({
                layoutWidth: width,
            })
        }
    };
    constructor(props) {
        super(props);
        this.state = {
            layoutWidth: window.width,
            LoadedData: null,
            mini: props.player.show,
            theme: this.props.display.darkMode ? GLOBAL.themes.dark : GLOBAL.themes.light,
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
        fetch(GLOBAL.API_URL + '/api.php?do=collection&id=' + this.props.id)
            .then((response) => response.json())
            .then((responseJson) => {
                if(responseJson.status === "success") {
                    this.setState({
                        LoadedData: responseJson.data,
                    });
                }
            })
            .catch((error) => {
            });

    }
    render() {
        return (
            <View style={[styles.container, {backgroundColor: this.state.theme.primaryBackgroundColor}]} onLayout={this.onLayoutScreen}>
                <NavHeader title={this.props.title}/>
                <ScrollView showsVerticalScrollIndicator={true} style={{padding: 4}}>
                    <Artist ArtistData={this.state.LoadedData} horizontal={false} column={(this.state.layoutWidth > 1000) ? 5 : ((this.state.layoutWidth > 500) ? 3 : 2)} layoutWidth={this.state.layoutWidth} theme={this.state.theme}/>
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
});


export default connect(({routes, scroll, language, display, player, auth}) => ({routes, scroll, language, display, player, auth}))(Artists);
