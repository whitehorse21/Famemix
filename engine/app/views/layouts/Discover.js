import React, { Component } from "react";
import {
    View,
    Dimensions,
    FlatList,
    Text,
    ActivityIndicator,
    StyleSheet,
    Platform,
    ScrollView,
    TouchableOpacity,
    StatusBar
} from "react-native";
import {Actions} from "react-native-router-flux";
import Toast from "react-native-root-toast";
import NavHeader from '../common/NavHeader';
const GLOBAL = require('../../../config/Global');
import {connect} from "react-redux";
import PropTypes from "prop-types";
import {changeStatusBarStyle} from "../../helpers/Functions";
import API from "../../helpers/Axios";
import FastImageBackground from "../../helpers/FastImageBackground";
const window = Dimensions.get('window');

class Discover extends Component {
    static propTypes = {
        routes: PropTypes.object,
        redux: PropTypes.object,
    };
    static onEnter = async () => {
        changeStatusBarStyle();
    };
    onLayoutScreen = (e) => {
        let width = e.nativeEvent.layout.width;
        if (width !== this.state.layoutWidth) {
            this.setState({
                layoutWidth: width
            })
        }
    };
    constructor(props) {
        super(props);
        this.state = {
            layoutWidth: window.width,
            LoadedData: null,
            mini: props.player.show ? props.player.show : false,
            theme: this.props.display.darkMode ? GLOBAL.themes.dark : GLOBAL.themes.light,
            isLoading: true
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
        API.get('discover')
            .then(res => {
                this.setState({
                    LoadedData: res.data,
                    isLoading: false
                });
            });
    }
    keyExtractor = (item, index) => index.toString();
    renderCategory = ({ item, index }) => {
        return (
            <TouchableOpacity onPress={ () => Actions.genreShow({ row: item}) } style={[styles.category, {width: (this.state.layoutWidth > 900) ? '20%' : ((this.state.layoutWidth > 600) ? '25%' : '50%')}]} id={item.id}>
                <View style={styles.category_background}>
                    <FastImageBackground
                        source={{uri: item.artwork_url}}
                        style={styles.backgroundImage}
                        imageStyle={{ borderRadius: 6}}
                    >
                        <View style={styles.overlay} />
                        <Text style={[styles.text, {color:this.state.theme.genreTextColor}]}>{item.name}</Text>
                    </FastImageBackground>
                </View>
            </TouchableOpacity>
        );
    };
    render() {

        return (
            <View style={[styles.container, {backgroundColor: this.state.theme.primaryBackgroundColor}]} onLayout={this.onLayoutScreen}>
                <NavHeader title={'Discover'}/>
                {this.state.isLoading ? <ActivityIndicator color={this.state.theme.indicatorColor} style={[styles.container, {backgroundColor: this.state.theme.primaryBackgroundColor}]}/> :
                <ScrollView showsVerticalScrollIndicator={false}>
                    <FlatList
                        numColumns={(this.state.layoutWidth > 900) ? 5 : ((this.state.layoutWidth > 600) ? 4 : 2)}
                        key={(this.state.layoutWidth > 900) ? 5 : ((this.state.layoutWidth > 600) ? 4 : 2)}
                        data={this.state.LoadedData}
                        keyExtractor={this.keyExtractor}
                        renderItem={this.renderCategory}
                        style={styles.content}
                    />
                </ScrollView>}
                {this.renderMarginBottom()}
            </View>

        );
    }
}

const styles = StyleSheet.create({
    container: {
        flex: 1
    },
    content: {
        padding: 4,
        paddingTop: 16,
    },
    category: {
        aspectRatio: 1.7777,
        paddingHorizontal: 4,
        marginBottom: 8,

    },
    category_background: {
        backgroundColor: '#eb743a',
        borderRadius: 6,
        flex: 1
    },
    backgroundImage: {
        justifyContent: 'center',
        alignItems: 'center',
        flex: 1,
    },
    text: {
        fontSize: 20,
        fontWeight: 'bold',
    },
    overlay: {
        ...StyleSheet.absoluteFillObject,
        backgroundColor: 'rgba(255, 0, 0, 0.3)',
        borderRadius: 4,
    }
});
export default connect(({routes, scroll, language, display, player, auth}) => ({routes, scroll, language, display, player, auth}))(Discover);
