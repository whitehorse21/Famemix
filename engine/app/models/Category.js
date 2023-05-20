import React, { Component } from "react";
import {
    View,
    ImageBackground,
    FlatList,
    Text,
    ActivityIndicator,
    StyleSheet,
    TouchableOpacity,
} from "react-native";
import {Actions} from "react-native-router-flux";
import {connect} from "react-redux";
import FastImageBackground from "../helpers/FastImageBackground";

class Category extends Component {
    constructor(props) {
        super(props);
        this.state = {
            theme: this.props.theme
        };
    }
    getColumns() {
        return this.props.layoutWidth > 700 ? 4 : 2;
    }
    render() {
        if (!this.props.CategoryData) {
            return <ActivityIndicator color={this.state.theme.indicatorColor} style={[styles.container, {backgroundColor: this.state.theme.primaryBackgroundColor}]}/>;
        }
        return (
            <View style={styles.container}>
                <FlatList
                    data={this.props.CategoryData}
                    numColumns={this.getColumns()}
                    key={this.getColumns()}
                    keyExtractor={this.keyExtractor}
                    renderItem={this.renderCategory}
                />
            </View>
        );
    }
    keyExtractor = (item, index) => index.toString();
    renderCategory = ({ item }) => {
        return (
            <TouchableOpacity style={[
                styles.category,
                {
                    flexBasis: (1 / this.getColumns()) * 100 + '%',
                    maxWidth: (1 / this.getColumns()) * 100 + '%',
                }
            ]} onPress={ () => Actions.genreShow({ row: item}) }>
                <FastImageBackground
                    source={{uri: item.artwork_url}}
                    style={styles.category_background}>
                    <View style={styles.overlay} />
                    <Text style={[styles.text, {color: this.state.theme.genreTextColor}]}>{item.name}</Text>
                </FastImageBackground>
            </TouchableOpacity>
        );
    };
}

const styles = StyleSheet.create({
    container: {
        alignItems: 'center',
        justifyContent: 'center',
        paddingLeft: 24,
        paddingRight: 24,
        flex: 1,
        marginLeft: -12,
        marginRight: -12
    },
    category: {
        flex: .5,
        aspectRatio: 1.777,
        padding: 4,
    },
    category_background: {
        justifyContent: 'center',
        alignItems: 'center',
        flex: 1,
        borderRadius: 4,
        overflow: 'hidden',
    },
    text: {
        fontSize: 20,
        fontWeight: 'bold',
    },
    overlay: {
        ...StyleSheet.absoluteFillObject,
        backgroundColor: 'rgba(1, 1, 1, 0.4)',
    }
});


export default connect(({routes, scroll, language, display, player, auth}) => ({routes, scroll, language, display, player, auth}))(Category);
