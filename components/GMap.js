import React, { Component } from 'react';
import { AppRegistry, StyleSheet, View, Text, Dimensions, Button, Alert } from 'react-native';
import MapView, { PROVIDER_GOOGLE } from 'react-native-maps';
// import RetroMapStyles from './MapStyles/RetroMapStyles.json';
let { width, height } = Dimensions.get('window');
const ASPECT_RATIO = width / height;
const LATITUDE = 52.5243700;
const LONGITUDE = 13.4105300;
const LATITUDE_DELTA = 0.0922;
const LONGITUDE_DELTA = LATITUDE_DELTA * ASPECT_RATIO;
const G_KEY = 'AIzaSyAQ1HQf-B9HQIN6IcDqIqA187xCTUFeDvc';
const G_URL = 'https://maps.googleapis.com/maps/api/place/nearbysearch/json?';

export default class Map extends Component {
  constructor() {
    super();
    this.state = {
      places: false,
      region: {
        latitude: LATITUDE,
        longitude: LONGITUDE,
        latitudeDelta: LATITUDE_DELTA,
        longitudeDelta: LONGITUDE_DELTA,
      }
    };
  }
  componentDidMount() {
    navigator.geolocation.getCurrentPosition(
      position => {
        this.setState({
          region: {
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
            latitudeDelta: LATITUDE_DELTA,
            longitudeDelta: LONGITUDE_DELTA,
          }
        });
      },
    (error) => console.log(error.message),
    { enableHighAccuracy: true, timeout: 20000, maximumAge: 1000 },
    );
    this.watchID = navigator.geolocation.watchPosition(
      position => {
        this.setState({
          region: {
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
            latitudeDelta: LATITUDE_DELTA,
            longitudeDelta: LONGITUDE_DELTA,
          }
        });
      }
    );
  }
  componentWillUnmount() {
    navigator.geolocation.clearWatch(this.watchId);
  }
  _onPressButton() {
    // Alert.alert('You tapped the button!')
    this.setState({places: true})
  }

  render() {
  	console.log(this.state.region);
  	var now = this.state.region;
    var Marker = (<MapView.Marker
          coordinate={ this.state.region }
        />)

    var Places;
    if(this.state.places){
      Places = (
        <View style={styles.placesContainer}>
          <Text>places</Text>
        </View>
      )
    } else {
      Places = (
        <View style={styles.placesContainer}>
          <Text>no places</Text>
        </View>
      )
    }
    return (
      <View>
        <MapView
          provider={ PROVIDER_GOOGLE }
          style={ styles.container }
          showsUserLocation={ true }
          region={ this.state.region }
          onRegionChange={ region => this.setState({region}) }
          onRegionChangeComplete={ region => this.setState({region}) }
        >
        {Marker}
        </MapView>
        <View style={styles.btnContainer}>
          <View style={styles.poopBtn}>
            <Button
              onPress={this._onPressButton.bind(this)}
              title="Poop On It"
            />
          </View>
        </View>
        {Places}
      </View>
    );
  }
}
const styles = StyleSheet.create({
  container: {
    height: '100%',
    width: '100%'
  },
  btnContainer: {
    position: 'absolute',
    top: 10, 
    left: 0, 
    right: 0, 
    justifyContent: 
    'center', 
    alignItems: 'center'
  },
  poopBtn: {
    width: 200
  },
  placesContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    justifyContent: 
    'center', 
    alignItems: 'center'
  }
});

AppRegistry.registerComponent('GMap', () => 'audioTester');