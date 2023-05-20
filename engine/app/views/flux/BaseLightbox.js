import React, { Component } from 'react';
import PropTypes from 'prop-types';
import {View, StyleSheet, Animated, Dimensions, Button, TouchableHighlight} from 'react-native';
import { Actions } from 'react-native-router-flux';

const { height: deviceHeight, width: deviceWidth } = Dimensions.get('window');

export default class BaseLightbox extends Component {
  static propTypes = {
    children: PropTypes.any,
    horizontalPercent: PropTypes.number,
    verticalPercent: PropTypes.number,
  };

  constructor(props) {
    super(props);

    this.state = {
      opacity: new Animated.Value(0),
    };
  }

  componentDidMount() {
    Animated.timing(this.state.opacity, {
      duration: 500,
      toValue: 1,
    }).start();
  }

  closeModal = () => {
    Animated.timing(this.state.opacity, {
      duration: 500,
      toValue: 0,
    }).start(Actions.pop);
  };

  _renderLightBox = () => {
    const { children, horizontalPercent = 1, verticalPercent = 1 } = this.props;
    const width = horizontalPercent ? deviceWidth * horizontalPercent : deviceWidth;
    return (
      <View
        style={{
          width,
          justifyContent: 'center',
          alignItems: 'center',
        }}
      >
        {children}
      </View>
    );
  };

  render() {
    return (
        <Animated.View style={[styles.container, { opacity: this.state.opacity }]}>
          <TouchableHighlight onPress={this.closeModal} activeOpacity={ 100 } underlayColor="transparent" style={{position: 'absolute',
            top: 0,
            bottom: 0,
            left: 0,
            right: 0}}>
            <View style={{flex: 1,}}></View>
          </TouchableHighlight>
          {this._renderLightBox()}
        </Animated.View>
    )
  }
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: 'rgba(0,0,0,0.5)',
    position: 'absolute',
    top: 0,
    bottom: 0,
    left: 0,
    right: 0,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
