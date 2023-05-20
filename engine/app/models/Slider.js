import React, { Component } from "react";
import {
    View,
    TouchableOpacity,
    Text,
    StyleSheet,
    Dimensions,
    Image
} from "react-native";
import {connect} from "react-redux";
import {playSong, playStation} from "../helpers/Functions";
import {Actions} from "react-native-router-flux";
import Carousel from "react-native-snap-carousel";
import FastImage from "react-native-fast-image";
import {decode} from "html-entities";
const GLOBAL = require('../../config/Global');
const window = Dimensions.get('window');

class Slider extends Component {
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
            theme: this.props.display.darkMode ? GLOBAL.themes.dark : GLOBAL.themes.light,
        };
        Dimensions.addEventListener('change', () => {
            try {
                this.setState({window: Dimensions.get('window')});
            } catch (e) {

            }
        });
    }
    async componentWillReceiveProps(nextProps) {
        if(this.props.display.darkMode !== nextProps.display.darkMode ) {
            nextProps.display.darkMode ? this.setState({theme: GLOBAL.themes.dark}) : this.setState({theme: GLOBAL.themes.light})
        }
        if(this.props.language.code !== nextProps.language.code ) {
            this.onChangeLanguage(nextProps.language.code)
        }
    }
    sliderAction(item){
        if(item.object_type === "song"){
            playSong(item.object);
        } else if(item.object_type === "station") {
            playStation(item.object)
        } else if(item.object_type === "artist") {
            Actions.artistShow({ artist: item.object});
        } else if(item.object_type === "album") {
            Actions.albumShow({ album: item.object});
        }
    }
    renderCarouselItem = ({item, index}) => {
        return (
            <View style={{paddingLeft: 4, paddingRight: 4}}>
                <TouchableOpacity activeOpacity={1}  onPress={ () => { this.sliderAction(item) }} >
                    <View style={{marginBottom: 8}}>
                        <Text style={[{fontSize: 12, marginBottom: 4, textTransform: 'uppercase'}, {color:  this.state.theme.textSpotlightColor}]} numberOfLines={1}>{decode(item.title)}</Text>
                        <Text style={[{fontSize: 16, marginBottom: 4}, {color: this.state.theme.textPrimaryColor}]} numberOfLines={1}>{item.object && (item.object.title ? decode(item.object.title) : decode(item.object.name))}</Text>
                        <Text style={[{fontSize: 14}, {color: this.state.theme.textSecondaryColor}]} numberOfLines={1}>{decode(item.description)}</Text>
                    </View>
                    <View
                        style={{
                            width: '100%',
                            borderRadius: 6,
                            overflow: 'hidden',
                        }}
                    >
                        <FastImage
                            style={{
                                width: '100%',
                                aspectRatio: 1.7,
                            }}
                            source={{
                                uri: item.artwork_url,
                                priority: FastImage.priority.normal,
                            }}
                        />
                    </View>
                </TouchableOpacity>
            </View>
        );
    }
    render() {
        return (
            <View style={{flex:1, marginTop: 16}} onLayout={this.onLayoutScreen}>
                <Carousel
                    data={this.props.data}
                    renderItem={this.renderCarouselItem}
                    sliderWidth={this.state.layoutWidth}
                    itemWidth={this.state.layoutWidth < 700 ? (this.state.layoutWidth - 24) : ((this.state.layoutWidth -24)/3)}
                    inactiveSlideScale={1}
                    inactiveSlideOpacity={1}
                    loop={true}
                    loopClonesPerSide={2}
                    //autoplay={true}
                    autoplayDelay={500}
                    autoplayInterval={8000}
                    removeClippedSubviews={false}
                    extraData={this.state}
                />
            </View>
        );
    }

}

const styles = StyleSheet.create({

});

export default connect(({display, auth}) => ({display, auth}))(Slider);
