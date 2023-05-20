import React, {Component} from 'react';
import {View} from 'react-native';
import {connect} from "react-redux";
import { TestIds, BannerAd, BannerAdSize} from '@react-native-firebase/admob';
import {isIphoneX} from '../../helpers/ifIphoneX';
const GLOBAL = require("../../../config/Global");

class Banner extends Component {
    constructor(props) {
        super(props);
        this.state = {
            theme: this.props.display.darkMode ? GLOBAL.themes.dark : GLOBAL.themes.light,
            isPlayerShow: false,
            isAdSupport: this.props.role.ad_support
        };
    }

    onChangeLanguage = (language) => {
        this.setState({ currentLanguage: language });
    };

    async componentWillReceiveProps(nextProps) {
        if(this.props.display.darkMode !== nextProps.display.darkMode ) {
            nextProps.display.darkMode ? this.setState({theme: GLOBAL.themes.dark}) : this.setState({theme: GLOBAL.themes.light})
        }
        if(this.props.ad.showing !== nextProps.ad.showing) {
            this.setState({isMediaAdShowing: nextProps.ad.showing})
        }
        if(this.props.player.show !== nextProps.player.show) {
            setTimeout(() => {
                this.setState({isPlayerShow: nextProps.player.show})
            }, 2000);
        }
        if(this.props.role.ad_support !== nextProps.role.ad_support) {
            setTimeout(() => {
                this.setState({isAdSupport: nextProps.role.ad_support})
            }, 2000);
        }
    }
    _isMounted = false;

    componentWillUnmount() {
        this._isMounted = false;
    }

    componentDidMount() {
        this._isMounted = true;
    }

    render () {
        if(! this.state.isAdSupport)
            return <View />
        return (
            <View style={{
                position: 'absolute',
                bottom: this.state.isPlayerShow ? (isIphoneX() ? 134 : 100) : (isIphoneX() ? 84 : 50),
                left: 0,
                right: 0,
                height: 50,
                zIndex: 0
            }}>
                <View
                    style={{
                        flex: 1,
                        height: 50
                    }}
                >
                    <BannerAd
                        unitId={GLOBAL.ADMOB_BANNER_UNIT_ID ? GLOBAL.ADMOB_BANNER_UNIT_ID : TestIds.BANNER}
                        size={BannerAdSize.SMART_BANNER}
                        requestOptions={{
                            requestNonPersonalizedAdsOnly: true,}}
                        onAdLoaded={() => {
                            console.log('Advert loaded');}}
                        onAdFailedToLoad={(error) => {
                            console.error('Advert failed to load: ', error);}}
                    />
                </View>
            </View>
        );

    }
}

export default connect(({display, ad, player, role}) => ({display, ad, player, role}))(Banner);
