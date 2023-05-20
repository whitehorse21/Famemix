import React, {Component} from 'react';
import {View, StyleSheet, Dimensions, Platform} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

import Toast from "react-native-root-toast";
import {connect} from "react-redux";
const GLOBAL = require('../../../config/Global');
import RNFetchBlob from 'rn-fetch-blob';
import {changeStatusBarStyle} from "../../helpers/Functions";

const window = Dimensions.get('window');

class Download extends Component {
    static onEnter = async () => {
        changeStatusBarStyle();
    };
    constructor(props) {
        super(props);
        this.state = {
            SongData: [],
            isDownloading: false,
            progress: 0
        };
    }
    async componentWillReceiveProps(nextProps) {
        if(this.props.redux.download == true) {
            let Download = JSON.parse(await AsyncStorage.getItem('Download'));
            this.setState({SongData: Download});
            this.DownloadSync();
            this.props.dispatch({type: 'DOWNLOAD_OFF'});
        }
    }
    componentDidMount() {
        setTimeout(async() => {
            let Download = JSON.parse(await AsyncStorage.getItem('Download'));
            if(Download && Download.length) {
                //Toast.show('Continuing download songs.', { position: 70, shadow: false, backgroundColor: '#36383d'});
                this.setState({SongData: Download});
                this.DownloadSync();
            }
        }, 10000);
    }
    guid() {
        return this.s4() + this.s4() + '-' + this.s4() + '-' + this.s4() + '-' +
            this.s4() + '-' + this.s4() + this.s4() + this.s4();
    }
    s4() {
        return Math.floor((1 + Math.random()) * 0x10000)
            .toString(16)
            .substring(1);
    }
    async DownloadSync(){
        //Stop if is downloading
        if(this.state.isDownloading) return;
        let Download = this.state.SongData;
        if(Download && Download.length) {
            let count = Download.length;
            for(var i = 0; i < count; i++){
                let index = i;
                if(Download[index].download == false) {
                    this.setState({isDownloading: true});
                    if(Platform.OS === 'android'){
                        RNFetchBlob
                            .config({
                                addAndroidDownloads : {
                                    useDownloadManager : true,
                                    notification : true,
                                    title : Download[index].title + ' - ' + Download[index].artistname ? Download[index].artistname : Download[index].artists.map(function(artist){return artist.name}).join(", "),
                                    mime : 'audio/mpeg',
                                    description : 'Downloading',
                                    path: RNFetchBlob.fs.dirs.DownloadDir + "/" + Download[index].title + ".mp3"
                                }
                            })
                            .fetch('GET', GLOBAL.API_URL + '/stream.php?track_id=' + Download[index].id)
                            .then(async (resp) => {
                                if(resp.path()) {
                                    //Call for offline songs again
                                    let Download = JSON.parse(await AsyncStorage.getItem('Download'));
                                    Download[index].download = true;
                                    Download[index].url = resp.path();
                                    AsyncStorage.setItem('Download', JSON.stringify(Download));
                                    this.setState({SongData: Download, isDownloading: false});
                                    Toast.show(Download[index].title + ' download finished.', {
                                        position: 70,
                                        shadow: false,
                                        backgroundColor: '#36383d'
                                    });
                                    this.DownloadSync();
                                    this.props.dispatch({type: 'UPDATE_DOWNLOADED_ON'});
                                } else {
                                    Toast.show("Can't download, please try again.", { position: 70, shadow: false, backgroundColor: '#b63442'});
                                }
                            });



                    } else {
                        //Download song mp3 file
                        let file_name = this.guid() + '.mp3';
                        RNFetchBlob.config({
                            fileCache: true,
                            appendExt: 'mp3',
                            path: RNFetchBlob.fs.dirs.DocumentDir + "/" + file_name
                        }).fetch('GET', GLOBAL.API_URL + '/stream.php?track_id=' + Download[index].id).progress({ count: 1 }, (received, total) => {
                            this.setState({progress: (received / total)});
                            Toast.show("Downloading (percent): " + Math.floor(received / total * 100), {
                                position: 70,
                                shadow: false,
                                backgroundColor: '#36383d'
                            });
                        }).then(async (res) => {
                            if(res.path()) {
                                //Call for offline songs again
                                let Download = JSON.parse(await AsyncStorage.getItem('Download'));
                                Download[index].download = true;
                                Download[index].url = file_name;
                                AsyncStorage.setItem('Download', JSON.stringify(Download));
                                this.setState({SongData: Download, isDownloading: false});
                                Toast.show(Download[index].title + ' download finished.', {
                                    position: 70,
                                    shadow: false,
                                    backgroundColor: '#36383d'
                                });
                                this.DownloadSync();
                                this.props.dispatch({type: 'UPDATE_DOWNLOADED_ON'});
                            } else {
                                Toast.show("Can't download, please try again.", { position: 70, shadow: false, backgroundColor: '#b63442'});
                            }
                        });
                    }
                    return
                }
            }
        }
    }

    render () {
        /*return (
            <View style={ styles.container }>
                <Text style={styles.textSongName} numberOfLines={1}>Downloading name</Text>
                <Progress.Bar progress={this.state.progress} width={styles.progressBar} />
            </View>
        );*/
        return (
            <View/>
        );
    }
}
const styles = StyleSheet.create({
    container: {
        height: 35,
        width: window.width,
        alignItems: 'center',
        justifyContent: 'center'
    },
    textSongName: {
        fontSize: 11,
    },
    sliderTrack: {
        height: 2,
        backgroundColor: 'green',
    },
    progressBar: {
        width: window - 30,
    },
});

export default connect(({routes, scroll, language, display, player, auth}) => ({routes, scroll, language, display, player, auth}))(Download);
