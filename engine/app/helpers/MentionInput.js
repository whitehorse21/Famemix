import React, { Fragment, Component } from 'react'
import ParsedText from 'react-native-parsed-text'
import { Keyboard, TextInput, TouchableOpacity, StyleSheet } from 'react-native'
import { getWidthRatio } from './UI'

import MentionBox, { HEIGHT } from './MentionBox'
import {connect} from "react-redux";
const GLOBAL = require('../../config/Global');

class MentionInput extends Component {
    constructor(props) {
        super(props)

        this.mainData = []
        this.cursorPostion = {
            start: 0,
            end: 0
        }

        this.state = {
            text: '',
            showMentionBox: false,
            isInputFieldActive: false,
            mentionBoxDimension: {
                top: 0,
                right: 0,
                width: 0,
                height: HEIGHT
            },
            theme: this.props.display.darkMode ? GLOBAL.themes.dark : GLOBAL.themes.light,
        }
    }

    async componentWillReceiveProps(nextProps) {
        if(this.props.display.darkMode !== nextProps.display.darkMode ) {
            nextProps.display.darkMode ? this.setState({theme: GLOBAL.themes.dark}) : this.setState({theme: GLOBAL.themes.light})
        }
    }

    /**
     * Text field on change text event callback
     */
    onChangeText = text => {
        this.setState({ text })
        this.props.onChangeText(text)
        this.mentioningChangeText(text)
    }

    composeData = words => {
        let wordRelativeIndex = 0

        return words.map((word, index) => {
            const hasToMention = word.includes("@")
            const wordAbsoluteIndex = index
            const wordLength = word.length
            if (index > 0) {
                wordRelativeIndex = wordRelativeIndex + words[index - 1].length + 1
            }

            return {
                word,
                wordLength,
                hasToMention,
                wordAbsoluteIndex,
                wordRelativeIndex
            }
        })
    }

    checkIfCursorIsAtTheWord = (word, cursor) =>
        cursor.start >= word.wordRelativeIndex + 1 &&
        cursor.start <= word.wordRelativeIndex + word.wordLength

    mentioningChangeText = text => {
        this.splittedText = text.split(" ")
        this.splittedTextCount = this.splittedText.length
        this.mainData = this.composeData(this.splittedText)

        this.mainData = this.mainData.map(item => {
            return {
                ...item,
                isCursorActive: this.checkIfCursorIsAtTheWord(item, this.cursorPostion)
            }
        })

        const wordAtCursor = this.mainData.find(item => item.isCursorActive)

        if (wordAtCursor && wordAtCursor.hasToMention) {
            this.setState({ showMentionBox: true })
            const words = wordAtCursor.word.split('@')
            this.props.mentioningChangeText(words[words.length - 1])
        } else {
            this.setState({ showMentionBox: false })
        }

        this.lastCursorPosition = this.cursorPostion
    }

    onSelectionChange = ({ nativeEvent }) => {
        this.cursorPostion = nativeEvent.selection
        this.mainData = this.mainData.map(item => {
            return {
                ...item,
                isCursorActive: this.checkIfCursorIsAtTheWord(item, this.cursorPostion)
            }
        })
    }

    onContentSizeChange = ({ nativeEvent }) => {
        this.setState(oldState => ({
            mentionBoxDimension: {
                ...oldState.mentionBoxDimension,
                top: nativeEvent.contentSize.height + 10
            }
        }))
    }

    onCellPress = item => {
        this.setState({ showMentionBox: false })
        this.mainData = this.mainData.map(data => {
            if (data.isCursorActive) {
                const words = data.word.split('@')
                const word = data.word.replace(`@${words[words.length - 1]}`, `@${item.name}`)

                return {
                    ...data,
                    word
                }
            }

            return data
        })

        let combinedText = ''
        this.mainData.forEach((word, index) => {
            const space = index === 0 ? '' : ' '
            combinedText = combinedText + space + word.word
        })
        this.setState({ text: combinedText })
        this.props.onChangeText(combinedText)
    }

    /**
     * Called by fake button that focuses or dismisses the text field.
     */
    toggleTextField = () => {
        this.setState(
            prevState => ({
                isInputFieldActive: !prevState.isInputFieldActive
            }),
            () => {
                this.state.isInputFieldActive
                    ? this.inputField.focus()
                    : Keyboard.dismiss()
            }
        )
    }

    handleNamePress = text => {
        // console.log('------xxxx', text)
    }

    /**
     * On TextInput layout
     */
    onLayout = ({ nativeEvent }) => {
        // console.log('onLayout', nativeEvent)
        this.setState(oldState => ({
            mentionBoxDimension: {
                ...oldState.mentionBoxDimension,
                width: nativeEvent.layout.width
            }
        }))
    }

    renderText(matchingString, matches) {
        let pattern = /@[A-Za-z0-9._-]*/;
        let match = matchingString.match(pattern);
        return `^^${match[1]}^^`;
    }

    render() {
        return (
            <Fragment>
                <Fragment>
                    <TextInput
                        multiline
                        ref={comp => {
                            this.inputField = comp
                            this.props.reference(comp)
                        }}
                        onLayout={this.onLayout}
                        onChangeText={this.onChangeText}
                        placeholder={this.props.placeholder}
                        onSelectionChange={this.onSelectionChange}
                        onContentSizeChange={this.onContentSizeChange}
                        style={[styles.inputField, {backgroundColor: this.state.theme.community.shareBoxBackgroundColor, color: this.state.theme.community.textColor}]}
                        placeholderStyle={styles.inputPlaceholder}
                        placeholderTextColor={'#656565'}
                    >
                        <ParsedText
                            style={styles.text}
                            parse={[
                                {
                                    pattern: /@[A-Za-z0-9._-]*/,
                                    style: styles.username,
                                    onPress: this.handleNamePress
                                },
                                {
                                    pattern: /#(\w+)/,
                                    style: styles.hashTag
                                }
                            ]}
                        >
                            {this.state.text}
                        </ParsedText>
                    </TextInput>
                </Fragment>
                {this.state.showMentionBox && (
                    <MentionBox
                        data={this.props.mentionData}
                        style={this.state.mentionBoxDimension}
                        renderCell={({ item, index }) => (
                            <TouchableOpacity onPress={() => this.onCellPress(item)}>
                                {this.props.renderMentionCell({ item, index })}
                            </TouchableOpacity>
                        )}
                    />
                )}
            </Fragment>
        )
    }
}

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

const styles = StyleSheet.create({
    mainContainer: {
        flex: 1
    },
    subContainer: {
        flex: 1,
        padding: 8,
        marginTop: 80
    },
    // Header
    profileHeader: {
        flexDirection: 'row'
    },
    profilePic: {
        width: 40,
        height: 40,
        borderRadius: 40 / 2
    },
    titlesContainer: {
        paddingHorizontal: 8
    },
    subtitlesContainer: {
        marginTop: 4,
        flexDirection: 'row',
        maxWidth: getWidthRatio(70)
    },
    titleText: {
        fontSize: 12
    },
    sutitleButton: {
        marginRight: 2
    },
    // inputfield
    inputFieldContainer: {
        flex: 1,
        // backgroundColor: 'blue'
    },
    inputField: {
        borderRadius: 18,
        width: '100%',
        paddingLeft: 12,
        paddingRight: 12,
        paddingTop: 6,
        paddingBottom: 8,
        lineHeight: 22,
        fontSize: 16
    },
    inputPlaceholder: {
        color: 'white'
    },
    overlappingButton: {
        position: 'absolute',
        top: 0,
        left: 0,
        bottom: 0,
        right: 0,
        backgroundColor: colors.transparent
    },
    // Action Buttons
    actionButtonContainer: {
        justifyContent: 'flex-end'
    },
    actionButton: {
        height: 44,
        flexDirection: 'row',
        marginVertical: 2,
        paddingHorizontal: 16,
        alignItems: 'center',
        backgroundColor: colors.lightestGray
    },
    actionButtonIcon: {
        tintColor: colors.black,
        width: 20,
        height: 20,
        resizeMode: 'contain'
    },
    actionButtonTitle: {
        paddingHorizontal: 12,
        color: colors.darkGray
    },

    inputMocText: {
        color: 'blue',
        paddingTop: 2,
        position: 'absolute',
        zIndex: -1
    },
    username: {
        color: colors.iosBlue,
        fontWeight: 'bold'
    },
    hashTag: {
        color: colors.iosBlue,
        fontWeight: 'bold'
    },
});

export default connect(({routes, scroll, language, display, player, auth}) => ({routes, scroll, language, display, player, auth}))(MentionInput);
