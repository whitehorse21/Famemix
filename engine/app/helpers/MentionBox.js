import React from 'react'
import { View, StyleSheet, FlatList, Text } from 'react-native'

const colors = {
    red: '#ff0000',
    gray: '#808080',
    blue: '#0000ff',
    white: '#ffffff',
    black: '#000000',
    green: '#00ff00',
    orange: '#ffa500',
    yellow: '#ffff00',
    iosBlue: '#0e66d0',
    mildGray: '#D8D8D8',
    darkBlue: '#202D69',
    disabledGrey: '#DDD',
    lightGray: '#EEEEEE',
    darkGreen: '#499d49',
    brightBlue: '#007AFF',
    lightYellow: '#FEC867',
    fadeDarkBlue: '#4879A4',
    darkBlue1: '#528EC0',
    lightestGray: '#f8f8f8',
    lightestGray1: '#F7F6FB',
    darkGray: 'rgba(52, 52, 52, 0.88)',
    transparentGray: 'rgba(52, 52, 52, 0.4)',
    transparentMildGray: 'rgba(52, 52, 52, 0.1)',
    transparent: 'transparent',
    appColor1: '#142358',
    appColor2: '#62A8E5',
    appColor3: '#F2E9DB',
    appColor4: '#F5F5F1',
    appColor5: '#477AA4',
    gradient: {
        blue: ['#3570A3', '#528EC0']
    }
}

export const HEIGHT = 134

const styles = StyleSheet.create({
    mainContainer: {
        flex: 1,
        zIndex: 10,
        elevation: 10,
        borderRadius: 5,
        height: HEIGHT,
        position: 'absolute',
        shadowRadius: 5,
        shadowColor: colors.darkGray,
        shadowOffset: { width: 0, height: 0 },
        shadowOpacity: 0.5,
        backgroundColor: 'white'
    },
    subContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center'
    },
    noSuggestionText: {}
})

class MentionBox extends React.Component {

    render() {
        if (this.props.data.length === 0) {
            return (
                <View style={[styles.mainContainer, this.props.style]}>
                    <View style={styles.subContainer}>
                        <Text style={styles.noSuggestionText}>No Suggestions</Text>
                    </View>
                </View>
            )
        }

        return (
            <View style={[styles.mainContainer, this.props.style]}>
                <FlatList
                    data={this.props.data}
                    renderItem={this.props.renderCell}
                    keyboardShouldPersistTaps="always"
                />
            </View>
        )
    }
}

export default MentionBox
