import React, {Component} from 'react';
import {
    Animated,
    BackHandler,
    PanResponder,
    Text,
    TouchableWithoutFeedback,
    View,
    StyleSheet,
} from 'react-native';
import { WithLocalSvg } from 'react-native-svg';

const reactions = {
    none: {
        text: 'Like',
        color: '#b0b3b8'
    },
    like: {
        text: 'Like',
        color: 'rgb(32, 120, 244)'
    },
    love: {
        text: 'Love',
        color: 'rgb(243, 62, 88)'
    },
    wow: {
        text: 'Wow',
        color: 'rgb(247, 177, 37)'
    },
    haha: {
        text: 'Haha',
        color: 'rgb(247, 177, 37)'
    },
    sad: {
        text: 'Sad',
        color: 'rgb(247, 177, 37)'
    },
    angry: {
        text: 'Angry',
        color: 'rgb(233, 113, 15)'
    }
}

const icons =  {
    like: require('../../assets/icons/reactions/like.svg'),
    love: require('../../assets/icons/reactions/love.svg'),
    wow: require('../../assets/icons/reactions/wow.svg'),
    haha: require('../../assets/icons/reactions/haha.svg'),
    sad: require('../../assets/icons/reactions/sad.svg'),
    angry: require('../../assets/icons/reactions/angry.svg'),
}


export default class Reaction extends Component {
    constructor(props) {
        super(props);
        this.state = {
            showReactions: false,
        };
        this.setState({
            showReactions: false
        });
        // Slow down speed animation here (1 = default)
        this.timeDilation = 1;

        // If duration touch longer than it, mean long touch
        this.durationLongPress = 250;

        // Variables to check
        // 0 = nothing, 1 = like, 2 = love, 3 = haha, 4 = wow, 5 = sad, 6 = angry
        this.isTouchBtn = false;

        this.isLongTouch = false;
        this.isLiked = false;
        this.whichIconUserChoose = 0;
        this.currentIconFocus = 0;
        this.previousIconFocus = 0;
        this.isDragging = false;
        this.isDraggingOutside = false;
        this.isJustDragInside = true;

        // Duration animation
        this.durationAnimationBox = 500;
        this.durationAnimationQuickTouch = 500;
        this.durationAnimationLongTouch = 150;
        this.durationAnimationIconWhenDrag = 150;
        this.durationAnimationIconWhenRelease = 1000;

        // ------------------------------------------------------------------------------
        // Animation button when quick touch button
        this.tiltIconAnim = new Animated.Value(0);
        this.zoomIconAnim = new Animated.Value(0);
        this.zoomTextAnim = new Animated.Value(0);

        // ------------------------------------------------------------------------------
        // Animation when button long touch button
        this.tiltIconAnim2 = new Animated.Value(0);
        this.zoomIconAnim2 = new Animated.Value(0);
        this.zoomTextAnim2 = new Animated.Value(0);
        // Animation of the box
        this.fadeBoxAnim = new Animated.Value(0);

        // Animation for emoticons
        this.moveRightGroupIcon = new Animated.Value(10);
        // Like
        this.pushIconLikeUp = new Animated.Value(0);
        // I don't know why, but when I set to 0.0, it seem blink,
        // so temp solution is set to 0.01
        this.zoomIconLike = new Animated.Value(0.01);
        // Love
        this.pushIconLoveUp = new Animated.Value(0);
        this.zoomIconLove = new Animated.Value(0.01);
        // Haha
        this.pushIconHahaUp = new Animated.Value(0);
        this.zoomIconHaha = new Animated.Value(0.01);
        // Wow
        this.pushIconWowUp = new Animated.Value(0);
        this.zoomIconWow = new Animated.Value(0.01);
        // Sad
        this.pushIconSadUp = new Animated.Value(0);
        this.zoomIconSad = new Animated.Value(0.01);
        // Angry
        this.pushIconUp = new Animated.Value(0);
        this.zoomIcon = new Animated.Value(0.01);

        // ------------------------------------------------------------------------------
        // Animation for zoom emoticons when drag
        this.zoomIconChosen = new Animated.Value(1);
        this.zoomIconNotChosen = new Animated.Value(1);
        this.zoomIconWhenDragOutside = new Animated.Value(1);
        this.zoomIconWhenDragInside = new Animated.Value(1);
        this.zoomBoxWhenDragInside = new Animated.Value(1);
        this.zoomBoxWhenDragOutside = new Animated.Value(0.95);

        // Animation for text description at top icon
        this.pushTextDescriptionUp = new Animated.Value(60);
        this.zoomTextDescription = new Animated.Value(1);

        // ------------------------------------------------------------------------------
        // Animation for jump emoticon when release finger
        this.zoomIconWhenRelease = new Animated.Value(1);
        this.moveUpDownIconWhenRelease = new Animated.Value(0);
        this.moveLeftIconLikeWhenRelease = new Animated.Value(20);
        this.moveLeftIconLoveWhenRelease = new Animated.Value(72);
        this.moveLeftIconHahaWhenRelease = new Animated.Value(124);
        this.moveLeftIconWowWhenRelease = new Animated.Value(173);
        this.moveLeftIconSadWhenRelease = new Animated.Value(226);
        this.moveLeftIconWhenRelease = new Animated.Value(278);
    }

    componentDidMount() {
        this.onTouchStart();
    }

    componentWillMount() {
        BackHandler.addEventListener('hardwareBackPress', this.backPress);

        this.setupPanResponder();
    }

    componentWillUnmount() {
        BackHandler.removeEventListener('hardwareBackPress', this.backPress);
    }

    // Handle the drag gesture
    setupPanResponder() {
        this.rootPanResponder = PanResponder.create({
            // prevent if user's dragging without long touch the button
            onMoveShouldSetPanResponder: (evt, gestureState) =>
                !this.isTouchBtn && this.isLongTouch,

            onPanResponderGrant: (evt, gestureState) => {
                this.handleEmoticonWhenDragging(evt, gestureState);
            },

            onPanResponderMove: (evt, gestureState) => {
                this.handleEmoticonWhenDragging(evt, gestureState);
            },

            onPanResponderRelease: (evt, gestureState) => {
                this.isDragging = false;
                this.isDraggingOutside = false;
                this.isJustDragInside = true;
                this.previousIconFocus = 0;
                this.currentIconFocus = 0;
                this.setState({});

                this.onDragRelease();
            },
        });
    }

    handleEmoticonWhenDragging = (evt, gestureState) => {
        // the margin top the box is 100
        // and plus the height of toolbar and the status bar
        // so the range we check is about 150 -> 450
        if (
            gestureState.y0 + gestureState.dy >= 150 &&
            gestureState.y0 + gestureState.dy <= 450
        ) {
            this.isDragging = true;
            this.isDraggingOutside = false;

            if (this.isJustDragInside) {
                this.controlIconWhenDragInside();
            }

            if (
                gestureState.x0 + gestureState.dx >= 35 &&
                gestureState.x0 + gestureState.dx < 88.33
            ) {
                if (this.currentIconFocus !== 1) {
                    this.handleWhenDragBetweenIcon(1);
                }
            } else if (
                gestureState.x0 + gestureState.dx >= 88.33 &&
                gestureState.x0 + gestureState.dx < 141.66
            ) {
                if (this.currentIconFocus !== 2) {
                    this.handleWhenDragBetweenIcon(2);
                }
            } else if (
                gestureState.x0 + gestureState.dx >= 141.66 &&
                gestureState.x0 + gestureState.dx < 194.99
            ) {
                if (this.currentIconFocus !== 3) {
                    this.handleWhenDragBetweenIcon(3);
                }
            } else if (
                gestureState.x0 + gestureState.dx >= 194.99 &&
                gestureState.x0 + gestureState.dx < 248.32
            ) {
                if (this.currentIconFocus !== 4) {
                    this.handleWhenDragBetweenIcon(4);
                }
            } else if (
                gestureState.x0 + gestureState.dx >= 248.32 &&
                gestureState.x0 + gestureState.dx < 301.65
            ) {
                if (this.currentIconFocus !== 5) {
                    this.handleWhenDragBetweenIcon(5);
                }
            } else if (
                gestureState.x0 + gestureState.dx >= 301.65 &&
                gestureState.x0 + gestureState.dx <= 354.98
            ) {
                if (this.currentIconFocus !== 6) {
                    this.handleWhenDragBetweenIcon(6);
                }
            }
        } else {
            this.whichIconUserChoose = 0;
            this.previousIconFocus = 0;
            this.currentIconFocus = 0;
            this.isJustDragInside = true;

            if (this.isDragging && !this.isDraggingOutside) {
                this.isDragging = false;
                this.isDraggingOutside = true;
                this.setState({});

                this.controlBoxWhenDragOutside();
                this.controlIconWhenDragOutside();
            }
        }
    };

    // Handle the touch of button
    onTouchStart = () => {
        this.isTouchBtn = true;
        this.setState({
            showReactions: true
        });
        this.setState({});

        this.timerMeasureLongTouch = setTimeout(
            this.doAnimationLongTouch,
            this.durationLongPress,
        );
    };

    onTouchEnd = () => {
        this.isTouchBtn = false;
        this.setState({});

        if (!this.isLongTouch) {
            if (this.whichIconUserChoose !== 0) {
                this.whichIconUserChoose = 0;
                this.isLiked = true;
            }
            clearTimeout(this.timerMeasureLongTouch);
            this.doAnimationQuickTouch();
        }
    };

    onReacted = (item) => {
        this.doAnimationLongTouchReverse();
        this.controlIconWhenRelease();
        setTimeout(() => {
            this.setState({
                showReactions: false
            });
        }, 1000);
        console.warn(item, this.props.comment.id)
    }

    onDragRelease = () => {
        this.doAnimationLongTouchReverse();
        this.controlIconWhenRelease();
    };

    // ------------------------------------------------------------------------------
    // Animation button when quick touch button
    doAnimationQuickTouch = () => {
        if (!this.isLiked) {
            this.isLiked = true;
            this.setState({});

            this.tiltIconAnim.setValue(0);
            this.zoomIconAnim.setValue(0);
            this.zoomTextAnim.setValue(0);
            Animated.parallel([
                Animated.timing(this.tiltIconAnim, {
                    toValue: 1,
                    duration: this.durationAnimationQuickTouch * this.timeDilation,
                    useNativeDriver: false
                }),
                Animated.timing(this.zoomIconAnim, {
                    toValue: 1,
                    duration: this.durationAnimationQuickTouch * this.timeDilation,
                    useNativeDriver: false
                }),
                Animated.timing(this.zoomTextAnim, {
                    toValue: 1,
                    duration: this.durationAnimationQuickTouch * this.timeDilation,
                    useNativeDriver: false
                }),
            ]).start();
        } else {
            this.isLiked = false;
            this.setState({});

            this.tiltIconAnim.setValue(1);
            this.zoomIconAnim.setValue(1);
            this.zoomTextAnim.setValue(1);
            Animated.parallel([
                Animated.timing(this.tiltIconAnim, {
                    toValue: 0,
                    duration: this.durationAnimationQuickTouch * this.timeDilation,
                    useNativeDriver: false
                }),
                Animated.timing(this.zoomIconAnim, {
                    toValue: 0,
                    duration: this.durationAnimationQuickTouch * this.timeDilation,
                    useNativeDriver: false
                }),
                Animated.timing(this.zoomTextAnim, {
                    toValue: 0,
                    duration: this.durationAnimationQuickTouch * this.timeDilation,
                    useNativeDriver: false
                }),
            ]).start();
        }
    };

    // ------------------------------------------------------------------------------
    // Animation when long touch button
    doAnimationLongTouch = () => {
        this.isLongTouch = true;
        this.setState({});
        this.tiltIconAnim2.setValue(0);
        this.zoomIconAnim2.setValue(1);
        this.zoomTextAnim2.setValue(1);
        this.fadeBoxAnim.setValue(0);
        this.moveRightGroupIcon.setValue(10);
        this.pushIconUp.setValue(0);
        this.zoomIcon.setValue(0.01);

        Animated.parallel([
            // Button
            Animated.timing(this.tiltIconAnim2, {
                toValue: 1,
                duration: this.durationAnimationLongTouch * this.timeDilation,
                useNativeDriver: false
            }),
            Animated.timing(this.zoomIconAnim2, {
                toValue: 0.8,
                duration: this.durationAnimationLongTouch * this.timeDilation,
                useNativeDriver: false
            }),
            Animated.timing(this.zoomTextAnim2, {
                toValue: 0.8,
                duration: this.durationAnimationLongTouch * this.timeDilation,
                useNativeDriver: false
            }),

            // Box
            Animated.timing(this.fadeBoxAnim, {
                toValue: 1,
                duration: this.durationAnimationBox * this.timeDilation,
                delay: 350,
                useNativeDriver: false
            }),

            // Group emoticon
            Animated.timing(this.moveRightGroupIcon, {
                toValue: 20,
                duration: this.durationAnimationBox * this.timeDilation,
                useNativeDriver: false
            }),

            Animated.timing(this.pushIconUp, {
                toValue: 25,
                duration: 250 * this.timeDilation,
                delay: 250,
                useNativeDriver: false
            }),
            Animated.timing(this.zoomIcon, {
                toValue: 1,
                duration: 250 * this.timeDilation,
                delay: 250,
                useNativeDriver: false
            }),
        ]).start();
    };

    doAnimationLongTouchReverse = () => {
        this.tiltIconAnim2.setValue(1);
        this.zoomIconAnim2.setValue(0.8);
        this.zoomTextAnim2.setValue(0.8);
        this.fadeBoxAnim.setValue(1);
        this.moveRightGroupIcon.setValue(20);
        this.pushIconUp.setValue(25);
        this.zoomIcon.setValue(1);

        Animated.parallel([
            // Button
            Animated.timing(this.tiltIconAnim2, {
                toValue: 0,
                duration: this.durationAnimationLongTouch * this.timeDilation,
                useNativeDriver: false
            }),
            Animated.timing(this.zoomIconAnim2, {
                toValue: 1,
                duration: this.durationAnimationLongTouch * this.timeDilation,
                useNativeDriver: false
            }),
            Animated.timing(this.zoomTextAnim2, {
                toValue: 1,
                duration: this.durationAnimationLongTouch * this.timeDilation,
                useNativeDriver: false
            }),

            // Box
            Animated.timing(this.fadeBoxAnim, {
                toValue: 0,
                duration: this.durationAnimationLongTouch * this.timeDilation,
                useNativeDriver: false
            }),

            // Group emoticon
            Animated.timing(this.moveRightGroupIcon, {
                toValue: 10,
                duration: this.durationAnimationBox * this.timeDilation,
                useNativeDriver: false
            }),

            Animated.timing(this.pushIconUp, {
                toValue: 0,
                duration: 250 * this.timeDilation,
                delay: 250,
                useNativeDriver: false
            }),
            Animated.timing(this.zoomIcon, {
                toValue: 0.01,
                duration: 250 * this.timeDilation,
                delay: 250,
                useNativeDriver: false
            }),
        ]).start(this.onAnimationLongTouchComplete);
    };

    onAnimationLongTouchComplete = () => {
        this.isLongTouch = false;
        this.setState({});
    };

    // ------------------------------------------------------------------------------
    // Animation for zoom emoticons when drag
    handleWhenDragBetweenIcon = currentIcon => {
        this.whichIconUserChoose = currentIcon;
        this.previousIconFocus = this.currentIconFocus;
        this.currentIconFocus = currentIcon;

        //this.soundIconFocus.play();

        this.controlIconWhenDrag();
    };

    controlIconWhenDrag = () => {
        this.zoomIconChosen.setValue(0.8);
        this.zoomIconNotChosen.setValue(1.8);
        this.zoomBoxWhenDragInside.setValue(1.0);

        this.pushTextDescriptionUp.setValue(60);
        this.zoomTextDescription.setValue(1.0);

        // For update logic at render function
        this.setState({});

        // Need timeout so logic check at render function can update
        setTimeout(
            () =>
                Animated.parallel([
                    Animated.timing(this.zoomIconChosen, {
                        toValue: 1.8,
                        duration: this.durationAnimationIconWhenDrag * this.timeDilation,
                        useNativeDriver: false
                    }),
                    Animated.timing(this.zoomIconNotChosen, {
                        toValue: 0.8,
                        duration: this.durationAnimationIconWhenDrag * this.timeDilation,
                        useNativeDriver: false
                    }),
                    Animated.timing(this.zoomBoxWhenDragInside, {
                        toValue: 0.95,
                        duration: this.durationAnimationIconWhenDrag * this.timeDilation,
                        useNativeDriver: false
                    }),

                    Animated.timing(this.pushTextDescriptionUp, {
                        toValue: 90,
                        duration: this.durationAnimationIconWhenDrag * this.timeDilation,
                        useNativeDriver: false
                    }),
                    Animated.timing(this.zoomTextDescription, {
                        toValue: 1.7,
                        duration: this.durationAnimationIconWhenDrag * this.timeDilation,
                        useNativeDriver: false
                    }),
                ]).start(),
            50,
        );
    };

    controlIconWhenDragInside = () => {
        this.setState({});

        this.zoomIconWhenDragInside.setValue(1.0);
        Animated.timing(this.zoomIconWhenDragInside, {
            toValue: 0.8,
            duration: this.durationAnimationIconWhenDrag * this.timeDilation,
            useNativeDriver: false
        }).start(this.onAnimationIconWhenDragInsideComplete);
    };

    onAnimationIconWhenDragInsideComplete = () => {
        this.isJustDragInside = false;
        this.setState({});
    };

    controlIconWhenDragOutside = () => {
        this.zoomIconWhenDragOutside.setValue(0.8);

        Animated.timing(this.zoomIconWhenDragOutside, {
            toValue: 1.0,
            duration: this.durationAnimationIconWhenDrag * this.timeDilation,
            useNativeDriver: false
        }).start();
    };

    controlBoxWhenDragOutside = () => {
        this.zoomBoxWhenDragOutside.setValue(0.95);

        Animated.timing(this.zoomBoxWhenDragOutside, {
            toValue: 1.0,
            duration: this.durationAnimationIconWhenDrag * this.timeDilation,
            useNativeDriver: false
        }).start();
    };

    // ------------------------------------------------------------------------------
    // Animation for jump emoticon when release finger0.01
    controlIconWhenRelease = () => {
        this.zoomIconWhenRelease.setValue(1);
        this.moveUpDownIconWhenRelease.setValue(0);
        this.moveLeftIconLikeWhenRelease.setValue(20);
        this.moveLeftIconLoveWhenRelease.setValue(72);
        this.moveLeftIconHahaWhenRelease.setValue(154);
        this.moveLeftIconWowWhenRelease.setValue(173);
        this.moveLeftIconSadWhenRelease.setValue(226);
        this.moveLeftIconWhenRelease.setValue(278);

        Animated.parallel([
            Animated.timing(this.zoomIconWhenRelease, {
                toValue: 0,
                duration: this.durationAnimationIconWhenRelease * this.timeDilation,
                useNativeDriver: false
            }),
            Animated.timing(this.moveUpDownIconWhenRelease, {
                toValue: 1,
                duration: this.durationAnimationIconWhenRelease * this.timeDilation,
                useNativeDriver: false
            }),
            Animated.timing(this.moveLeftIconWhenRelease, {
                toValue: 0,
                duration: this.durationAnimationIconWhenRelease * this.timeDilation,
                useNativeDriver: false
            }),
        ]).start();
    };

    renderGroupIcon() {
        let items = ['like', 'love', 'haha', 'wow', 'sad', 'angry']
        return (
            <Animated.View
                style={[
                    styles.viewWrapGroupIcon,
                    {marginLeft: this.moveRightGroupIcon},
                ]}>
                {items.map((item) => {
                    return (
                        <View style={styles.viewWrapIcon}>
                            {this.currentIconFocus === 6 ? (
                                <Animated.View
                                    style={[
                                        styles.viewWrapTextDescription,
                                        {
                                            bottom: this.pushTextDescriptionUp,
                                            transform: [{scale: this.zoomTextDescription}],
                                        },
                                    ]}>
                                    <Text style={styles.textDescription}>Angry</Text>
                                </Animated.View>
                            ) : null}
                            <Animated.View
                                style={{

                                    transform: [
                                        {
                                            scale: this.isDragging
                                                ? this.currentIconFocus === 6
                                                    ? this.zoomIconChosen
                                                    : this.previousIconFocus === 6
                                                        ? this.zoomIconNotChosen
                                                        : this.isJustDragInside
                                                            ? this.zoomIconWhenDragInside
                                                            : 0.8
                                                : this.isDraggingOutside
                                                    ? this.zoomIconWhenDragOutside
                                                    : this.zoomIcon,
                                        },
                                    ],
                                }}>
                                <TouchableWithoutFeedback onPress={() => {
                                    this.onReacted(item);
                                }}>
                                    <WithLocalSvg
                                        width={36}
                                        height={36}
                                        asset={icons[item]}
                                    />
                                </TouchableWithoutFeedback>

                            </Animated.View>
                        </View>
                    );
                })}
            </Animated.View>
        );
    }

    render() {
        return (
            <View style={styles.viewContainer}>
                <View style={styles.viewBody} {...this.rootPanResponder.panHandlers}>
                    <View style={styles.viewContent}>
                        {this.state.showReactions &&
                        <Animated.View
                            style={[
                                styles.viewBox,
                                {
                                    opacity: this.fadeBoxAnim,
                                    transform: [
                                        {
                                            scale: this.isDragging
                                                ? this.previousIconFocus === 0
                                                    ? this.zoomBoxWhenDragInside
                                                    : 0.95
                                                : this.isDraggingOutside
                                                    ? this.zoomBoxWhenDragOutside
                                                    : 1.0,
                                        },
                                    ],
                                },
                            ]}
                        />
                        }
                        {this.state.showReactions && this.renderGroupIcon()}
                    </View>
                </View>
            </View>
        );
    }
}

const styles = StyleSheet.create({
    viewContainer: {
        flexDirection: 'column',
    },
    viewBody: {
        flex: 1,
    },
    viewContent: {
        flex: 1,
    },

    // Box
    viewBox: {
        borderRadius: 30,
        width: 320,
        height: 50,
        top: -50,
        left: -70,
        marginLeft: 20,
        position: 'absolute',
        backgroundColor: '#242728',
        borderWidth: .5,
        borderColor: '#2b2c2c'
    },

    // Button like
    viewBtn: {
        flex: 1,
    },
    textBtn: {
        color: 'grey',
        fontSize: 14,
        fontWeight: 'bold'
    },
    imgLikeInBtn: {
        width: 25,
        height: 25
    },

    // Group icon
    viewWrapGroupIcon: {
        flexDirection: 'row',
        width: 320,
        height: 50,
        top: -50,
        left: -70,
        position: 'absolute',
        alignItems: 'flex-end',
        justifyContent: 'space-around',
        paddingLeft: 5,
        paddingRight: 5,
    },
    viewWrapIcon: {
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 5
    },
    imgIcon: {
        width: 36,
        height: 36
    },
    viewWrapTextDescription: {
        backgroundColor: 'rgba(0, 0, 0, 0.3)',
        alignItems: 'center',
        justifyContent: 'center',
        borderRadius: 10,
        paddingLeft: 7,
        paddingRight: 7,
        paddingTop: 2,
        paddingBottom: 2,
        position: 'absolute'
    },
    textDescription: {
        color: 'white',
        fontSize: 8
    },
});
