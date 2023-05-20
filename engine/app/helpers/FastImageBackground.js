import React, { Component } from 'react'
import { View, StyleSheet } from 'react-native'
import FastImage from 'react-native-fast-image'

export default class FastImageBackground extends Component {
    render() {
        const { children, style = {}, imageStyle, imageRef, ...props } = this.props

        return (
            <View style={style} ref={this._captureRef}>
                <FastImage
                    {...props}
                    style={[
                        StyleSheet.absoluteFill,
                        {
                            width: style.width,
                            height: style.height,
                        },
                        imageStyle,
                    ]}
                />
                {children}
            </View>
        )
    }
}
