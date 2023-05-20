import React, {Component, createRef} from 'react';
import {
    View,
    Text,
    StyleSheet,
    Dimensions,
    ActivityIndicator,
    TouchableOpacity,
    Platform,
    StatusBar,
} from 'react-native';
import {Actions} from 'react-native-router-flux';
import {connect} from "react-redux";
const GLOBAL = require('../../../config/Global');
import {store} from '../../../store/configureStore';
import API from '../../helpers/Axios';
import {msgShow} from '../../helpers/Functions';
import {ifIphoneX} from '../../helpers/ifIphoneX';
import DatePicker from 'react-native-date-picker'
import RNPickerSelect from 'react-native-picker-select';
import i18n from "i18n-js";
import * as Languages from "../../helpers/Lang";

class UpdateInfo extends Component {
    constructor(props) {
        super(props);
        this.state = {
            currentLanguage: this.props.language.code,
            theme: this.props.display.darkMode ? GLOBAL.themes.dark : GLOBAL.themes.light,
            window: Dimensions.get('window'),
            isLoading: true,
            countries: [],
            selectedBirth: '2020-12-31',
            selectedCountry: this.props.auth.user.country,
            selectedGender: this.props.auth.user.gender,
        };
    }
    onChangeLanguage = (language) => {
        this.setState({ currentLanguage: language });
    };
    componentDidMount() {
        API.get('countries')
            .then(res => {
                let countries = [];
                res.data.forEach(function (country) {
                    let item = {};
                    item.label = country.name;
                    item.value = country.code;
                    countries.push(item);
                })
                this.setState({
                    isLoading: false,
                    countries: countries
                });
            }).catch (error => {
            Actions.pop();
        });
    }
    componentWillUnmount() {

    }

    formatDate(date) {
        var d = new Date(date),
            month = '' + (d.getMonth() + 1),
            day = '' + d.getDate(),
            year = d.getFullYear();

        if (month.length < 2)
            month = '0' + month;
        if (day.length < 2)
            day = '0' + day;

        return [year, month, day].join('-');
    }


    submitData() {
        const data = {
            date_of_birth: this.state.selectedBirth,
            country: this.state.selectedCountry,
            gender: this.state.selectedGender,

        };
        console.log(data);
        API.post('auth/user/dob/update', data)
            .then(res => {
                API.post('auth/user')
                    .then(res => {
                        store.dispatch({type: 'UPDATE_USER_INFO', user: res.data});
                    });
                Actions.pop();
            }).catch (error => {
            msgShow('error', error.response.data.errors[Object.keys(error.response.data.errors)[0]][0]);
        });
    }

    render = () => {
        i18n.locale = this.state.currentLanguage;
        i18n.fallbacks = true;
        i18n.translations = Languages;

        if (this.state.isLoading) return (
            <View
                style={{
                    flex: 1,
                    backgroundColor: this.state.theme.primaryBackgroundColor,
                    position: 'absolute',
                    top: 0,
                    bottom: 0,
                    left: 0,
                    right: 0,
                    justifyContent: 'center',
                }}
            >
                <ActivityIndicator color={this.state.theme.indicatorColor} style={{flex: 1, backgroundColor: this.state.theme.primaryBackgroundColor}}/>
            </View>
        );
        return (
            <View
                style={{
                    flex: 1,
                    backgroundColor: this.state.theme.primaryBackgroundColor,
                    position: 'absolute',
                    top: 0,
                    bottom: 0,
                    left: 0,
                    right: 0,
                    ...ifIphoneX({
                        paddingTop: 84
                    }, {
                        paddingTop: Platform.OS === 'android' ? (50 + StatusBar.currentHeight) : 70,
                    }),
                    alignItems: 'center'
                }}
            >
                <View>
                    <Text
                        style={{
                            fontSize: 26,
                            marginBottom: 64,
                            fontWeight: 'bold',
                            color: this.state.theme.textPrimaryColor,
                            textAlign: 'center'
                        }}
                    >{i18n.t('update_your_info')}</Text>
                    <Text
                        style={{
                            fontSize: 17,
                            marginBottom: 8,
                            color: this.state.theme.textPrimaryColor,
                            textAlign: 'center'
                        }}
                    >{i18n.t('birth_form')}</Text>
                    <DatePicker
                        date={new Date(this.props.auth.user.birth)}
                        mode={'date'}
                        maximumDate={new Date("2020-12-31")}
                        minimumDate={new Date("1910-12-31")}
                        textColor={this.state.theme.textPrimaryColor}
                        style={{
                            //height: 96
                        }}
                        onDateChange={(value) => {
                            this.setState({
                                selectedBirth: this.formatDate(value)
                            });
                        }}
                    />

                    <View style={{
                        height: 96
                    }}>
                        <Text
                            style={{
                                fontSize: 17,
                                marginBottom: 8,
                                color: this.state.theme.textPrimaryColor,
                                textAlign: 'center'
                            }}
                        >{i18n.t('country_form')}</Text>
                        <RNPickerSelect
                            value={this.props.auth.user.country}
                            onValueChange={(value) => {
                                this.setState({
                                    selectedCountry: value
                                });
                            }}
                            items={this.state.countries}
                            style={pickerSelectStyles}
                            //placeholder={'Country'}
                        />
                    </View>
                    <View style={{
                        height: 96
                    }}>
                        <Text
                            style={{
                                fontSize: 17,
                                marginBottom: 8,
                                color: this.state.theme.textPrimaryColor,
                                textAlign: 'center'
                            }}
                        >{i18n.t('gender_form')}</Text>

                        <RNPickerSelect
                            value={this.props.auth.user.gender}
                            onValueChange={(value) => {
                                this.setState({
                                    selectedGender: value
                                });
                            }}
                            items={[
                                { label: 'Male', value: 'M' },
                                { label: 'Female', value: 'F' },
                                { label: 'Other', value: 'O' },
                            ]}
                            style={pickerSelectStyles}
                        />
                    </View>
                </View>
                <TouchableOpacity
                    onPress={ () => this.submitData() }
                    style={{
                        position: 'absolute',
                        left: 16,
                        right: 16,
                        bottom: 16,
                        marginTop: 16,
                        padding: 16,
                        backgroundColor: this.state.theme.primaryButton.backgroundColor,
                        borderRadius: 8,
                    }}
                >
                    <Text
                        style={{
                            fontSize: 19,
                            fontWeight: '600',
                            color: this.state.theme.primaryButton.textColor,
                            textAlign: 'center'
                        }}
                    >{i18n.t('save')}</Text>
                </TouchableOpacity>
            </View>
        );
    }
}

const pickerSelectStyles = StyleSheet.create({
    inputIOS: {
        paddingHorizontal: 16,
        fontSize: 16,
        flex: 1,
        minHeight: 48,
        maxHeight: 48,
        width: '100%',
        borderRadius: 4,
        marginBottom: 16,
        justifyContent: 'center',
        paddingTop: 8,
        paddingBottom: 8,
        backgroundColor: '#3a3b3c',
        color: 'white'
    },
    placeholder: {
        color: 'white',
    },
    viewContainer: {
        flex: 1,
    },

    inputAndroid: {
        marginLeft: 8,
        marginTop: 6,
        fontSize: 16,
        flex: 1,
        minHeight: 56,
        maxHeight: 56,
        width: '100%',
        borderRadius: 4,
        marginBottom: 16,
        justifyContent: 'center',
        paddingTop: 18,
    }
});

const styles = StyleSheet.create({
    container: {
        backgroundColor: 'rgba(0, 0, 0, .5)',
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        top: 0,
        alignItems: 'center',
        justifyContent: 'center',
        paddingLeft: 15,
        paddingRight: 15
    },
    backgroundVideo: {
        position: 'absolute',
        top: 0,
        left: 0,
        bottom: 0,
        right: 0,
    },
});

export default connect(({language, display, auth}) => ({language, display, auth}))(UpdateInfo);
