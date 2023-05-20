import React, {Component} from "react";
import {TouchableOpacity, View, Text} from 'react-native';
import UserParallax from '../common/UserParallax';
import {Actions} from "react-native-router-flux";
import {connect} from "react-redux";
import {changeStatusBarStyle, pushUserStatus} from "../../helpers/Functions";
import LinearGradient from "react-native-linear-gradient";

const GLOBAL = require("../../../config/Global");

class Profile extends Component {
    static onEnter = async() => {
        changeStatusBarStyle();
    };
    constructor(props) {
        super(props);
        this.state = {
            user: this.props.auth.isLogged ? this.props.auth.user : null,
            theme: this.props.display.darkMode ? GLOBAL.themes.dark : GLOBAL.themes.light,
        };
        this.offlineSongs = [];
    }
    componentWillReceiveProps(nextProps) {
        if(this.props.auth.isLogged !== nextProps.auth.isLogged ) {
            if(nextProps.auth.isLogged) {
                setTimeout(() => {
                    this.setState({
                        user: this.props.auth.user
                    });
                    pushUserStatus(this.props.auth.user.username);
                }, 100);
            } else {
                this.setState({
                    isLogged: false,
                    user: null
                });
            }
        }
        if(this.props.display.darkMode !== nextProps.display.darkMode ) {
            nextProps.display.darkMode ? this.setState({theme: GLOBAL.themes.dark}) : this.setState({theme: GLOBAL.themes.light})
        }
        if(this.props.user && this.props.user.id) {
            this.setState({
                user: this.props.user
            });
        }
    }
    componentDidMount() {

    }

    render() {
        if(! this.props.auth.isLogged || ! this.state.user) {
            return (
                <View style={{flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: this.state.theme.primaryBackgroundColor}}>
                    <LinearGradient
                        colors={['#286060', '#555555']}
                        style={{flex: 1, width: "100%", justifyContent: 'center', alignItems: 'center'}}
                    >
                        <Text style={{fontWeight: 'bold', fontSize: 30, color: 'white', marginBottom: 32, marginLeft: 32, marginRight: 32, textAlign: 'center'}}>Get The Full Music Experience On FameMix.</Text>
                        <TouchableOpacity onPress={Actions.loginModal} style={{width: 200, height: 40, borderRadius: 20, alignItems: 'center', justifyContent: 'center', backgroundColor: 'white'}}>
                            <Text style={{fontWeight: 'bold', fontSize: 14, color: '#ff5353'}}>Login</Text>
                        </TouchableOpacity>
                    </LinearGradient>
                </View>
            );
        } else {
            return (
                <UserParallax
                    lang={this.state.currentLanguage}
                    item={this.state.user}
                    isOwner={true}
                />
            )
        }
    }
}


export default connect(({routes, scroll, language, display, player, auth}) => ({routes, scroll, language, display, player, auth}))(Profile);
