import React, { Component } from "react";
import {View, StyleSheet, ScrollView, Dimensions, ActivityIndicator} from "react-native";
import NavHeader from '../common/NavHeader';
import {connect} from "react-redux";
import HTML from 'react-native-render-html';
import {changeStatusBarStyle} from "../../helpers/Functions";
import API from "../../helpers/Axios";
const GLOBAL = require('../../../config/Global');
class StaticPage extends Component {
    static onEnter = async () => {
        changeStatusBarStyle();
    };
    constructor(props) {
        super(props);
        this.state = {
            title: null,
            content: null,
            theme: this.props.display.darkMode ? GLOBAL.themes.dark : GLOBAL.themes.light,
            window: Dimensions.get('window')
        };
        Dimensions.addEventListener('change', () => {
            try {
                this.setState({window: Dimensions.get('window')});
            } catch (e) {
                console.log(e);
            }
        });
    }
    componentWillReceiveProps(nextProps) {
        if( this.props.player.show !==  nextProps.player.show) {
            this.setState({mini: nextProps.player.show});
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
        API.get('page/' + this.props.pageId)
            .then(res => {
                this.setState({
                    title: res.data.title,
                    content: res.data.content,
                });
            })
    }
    renderHTML(){
        if(this.state.content === null) {
            return <ActivityIndicator color={this.state.theme.indicatorColor} style={{flex: 1, justifyContent: 'center', alignItems: 'center'}} />;
        } else {
            return (
                <HTML html={this.state.content} baseFontStyle={{fontSize: 15, color: this.state.theme.staticPage.fontColor}} imagesMaxWidth={this.state.window.width} />
            )
        }
    }
    render() {
        return (
            <View style={[styles.container, {backgroundColor: this.state.theme.primaryBackgroundColor}]}>
                <NavHeader title={this.state.title}/>
                <ScrollView style={{ flex: 1}}>
                    <View
                        style={{
                            padding: 16
                        }}
                    >
                    {this.renderHTML()}
                    </View>
                </ScrollView>
                {this.renderMarginBottom()}
            </View>

        );
    }
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    }
});


export default connect(({language, display, player}) => ({language, display, player}))(StaticPage);
