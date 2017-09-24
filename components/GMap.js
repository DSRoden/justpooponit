import React, { Component } from 'react';
import { AppRegistry, StyleSheet, View, Text, Dimensions, Button, Alert, Image, ScrollView, TouchableHighlight, TouchableOpacity, TextInput} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons'
import MapView, { PROVIDER_GOOGLE } from 'react-native-maps';
// import Place from './Place.js';
// import RetroMapStyles from './MapStyles/RetroMapStyles.json';
let { width, height } = Dimensions.get('window');
const ASPECT_RATIO = width / height;
const LATITUDE_DELTA = 0.0922;
const LONGITUDE_DELTA = LATITUDE_DELTA * ASPECT_RATIO;
const G_KEY = 'AIzaSyAQ1HQf-B9HQIN6IcDqIqA187xCTUFeDvc';
const G_URL = 'https://maps.googleapis.com/maps/api/place/nearbysearch/json?';
const G_Photo_URL = 'https://maps.googleapis.com/maps/api/place/photo?maxwidth=400&photoreference='
const G_Search_URL = 'https://maps.googleapis.com/maps/api/place/autocomplete/json?';
const G_Place_URL = 'https://maps.googleapis.com/maps/api/place/details/json?placeid=';
export default class Map extends Component {
  constructor() {
    super();
    this.state = {
      place: false,
      showNearbyPlaces: false,
      places: false,
      showSearch: false,
      searchText: '',
      showSearchPredictions: false,
      searchPredictions: false,
      markers: [],
      newMarker: false,
      hideButtons: false
    };
  }
  componentDidMount() {
    $this = this;
    navigator.geolocation.getCurrentPosition(
      position => {
        console.log('Positin', position);
        $this.setState({
          region: {
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
            latitudeDelta: LATITUDE_DELTA,
            longitudeDelta: LONGITUDE_DELTA,
          }
        }, function(){
            //get the most likely location
            var latLng = $this.state.region.latitude + ',' + $this.state.region.longitude;
            var url = G_URL + 'location='+ latLng +'&radius=500&type=restaurant&sensor=false&key=' + G_KEY;
            gFetch(url).then((json)=>{
                $this.setState({places: json.results, place: json.results[0]})
            });
        });
      },
    (error) => console.log(error.message),
    { enableHighAccuracy: true, timeout: 20000, maximumAge: 1000 },
    );


    $this.watchID = navigator.geolocation.watchPosition(
      position => {
        $this.setState({
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

  poopOnIt() {
    var $this = this;
    console.log('poop on this place >>>>', $this.state.place);
    var latitude = $this.state.place.geometry.location.lat;
    var longitude = $this.state.place.geometry.location.lng;
    var marker = {location:{latitude: latitude, longitude: longitude}};
    var markerArray = $this.state.markers;

    marker.name = $this.state.place.name;
    markerArray.push(marker);
    $this.setState({markers: markerArray})
    //need to send lat, lng, address
  }

  _searchPlaces(){
    var $this = this;
    console.log('search');
    $this.setState({showNearbyPlaces: true})
  }

  changePlace(val){
    var $this = this;
    $this.setState({place: val, 
      showNearbyPlaces: false,
      showSearch: false, 
      showSearchPredictions: false,
      region: {
            latitude: val.geometry.location.lat,
            longitude: val.geometry.location.lng,
            latitudeDelta: LATITUDE_DELTA,
            longitudeDelta: LONGITUDE_DELTA,
          }
    }, function(){
      //get the most likely location
      var latLng = $this.state.region.latitude + ',' + $this.state.region.longitude;
      var url = G_URL + 'location='+ latLng + '&radius=500&type=restaurant&sensor=false&key=' + G_KEY;
      gFetch(url).then((json)=>{
        $this.setState({places: json.results, place: val, newMarker: true})
      });
    });
  }

  _searchFocus(){
    var $this = this;
    $this.setState({hideButtons: true})
  }

  _searchBlur(){
    var $this = this;
    $this.setState({hideButtons: false})    
  }

  autocompleteSearch(text){
    var $this = this;
    var url = G_Search_URL + 'input=' + text+ '&key=' + G_KEY;
    gFetch(url).then((result)=>{
      $this.setState({searchPredictions: result.predictions, showSearchPredictions: true})
    }); 
  }

  selectSearch(place){
    var $this = this;
    console.log('selected search', place);
    place.name = place.description
    var url = G_Place_URL + place.place_id + '&sensor=true&key=' + G_KEY;
    gFetch(url).then((json)=>{
      var place = json.result
      $this.setState({place: place, 
        showNearbyPlaces: false,
        showSearch: false, 
        showSearchPredictions: false,
        region: {
              latitude: place.geometry.location.lat,
              longitude: place.geometry.location.lng,
              latitudeDelta: LATITUDE_DELTA,
              longitudeDelta: LONGITUDE_DELTA,
            }
      }, function(){
        //get the most likely location
        var latLng = $this.state.region.latitude + ',' + $this.state.region.longitude;
        var url = G_URL + 'location='+ latLng + '&radius=500&type=restaurant&sensor=false&key=' + G_KEY;
        gFetch(url).then((json)=>{
          console.log('json');
          $this.setState({places: json.results, newMarker: true})
        });
      });
    });
  }

  _closeLocations(){
    var $this = this;
    $this.setState({showNearbyPlaces: false, showSearchPredictions: false, hideButtons: false})
  }


  showMarker(val){
    console.log('display poop marker', val);

    var latLng = val.coordinate.latitude + ',' + val.coordinate.longitude;
    var url = G_URL + 'location='+ latLng + '&radius=500&&sensor=false&key=' + G_KEY;
    gFetch(url).then((json)=>{
      $this.setState({places: json.results, place: json.results[0]})
    });
  }

  render() {
    var $this = this;
    //main place
    if($this.state.place && !$this.state.showSearch){
      Place = (
        <View style={styles.placeContainer}>
          <Image source={{uri: (G_Photo_URL + $this.state.place.photos[0].photo_reference + '&key=' + G_KEY)}} style={{flex: 3, height: undefined, width: undefined}}/>
          <View style={{flex: 3, height: undefined, width: undefined, padding: 30}}>
            <Text style={{color: 'white', textAlign: 'center', fontSize: 15}}>{($this.state.place.name.length > 20) ? ($this.state.place.name.slice(0, 20) + '...') : $this.state.place.name}</Text>
            <Text style={{color: 'white',  textAlign: 'center'}}>stink rating 6</Text>
          </View>
          <View style={{flex: 3, height: undefined, width: undefined, backgroundColor: 'gray'}}></View>
        </View>
      )
    } else {
      Place = (
        <View></View>
      )
    }

    //search
    var Search;
    if($this.state.showNearbyPlaces){
      Search = (
          <View style={styles.searchContainer}>
            <TextInput style={{height: 100}}
            placeholder="Type here to search places"
            onChangeText={$this.autocompleteSearch.bind($this)}
            onFocus={$this._searchFocus.bind($this)}
            onBlur={$this._searchBlur.bind($this)}>
            </TextInput>
          </View>
        )
    } else {
      Search = (
          <View></View>
        )
    }

    //nearby places
    var nearbyPlaces;
    if($this.state.places && $this.state.showNearbyPlaces && !$this.state.showSearchPredictions){
      var nPlaces = $this.state.places.map( place =>
        <TouchableHighlight style={styles.placeInScroll} onPress={$this.changePlace.bind($this,place)} key={place.id}>
          <View style={styles.placeInScroll}>
            <Image source={{uri: (G_Photo_URL + place.photos[0].photo_reference + '&key=' + G_KEY)}} style={{flex: 3, height: undefined, width: undefined}}/>
            <View style={{flex: 3, height: undefined, width: undefined, padding: 30}}>
              <Text style={{color: 'white', textAlign: 'center', fontSize: 15}}>{(place.name.length > 20) ? (place.name.slice(0, 20) + '...') : place.name}</Text>
              <Text style={{color: 'white',  textAlign: 'center'}}>stink rating 6</Text>
            </View>
            <View style={{flex: 3, height: undefined, width: undefined, backgroundColor: 'gray'}}></View>
          </View>
        </TouchableHighlight>
        );
      nearbyPlaces = (<View style={styles.placesContainer}><ScrollView style={styles.placesScroll}>{nPlaces}</ScrollView></View>)
    } else {
      nearbyPlaces = (<View></View>)
    }

    //search places
    var searchPlaces;
    if($this.state.searchPredictions && $this.state.showSearchPredictions && $this.state.searchPredictions.length > 0){
      var sPlaces = $this.state.searchPredictions.map( place =>
        <TouchableHighlight onPress={$this.selectSearch.bind($this, place)} key={place.id}>
          <View style={{height: 50}}>
            <Text> {place.description} </Text>
          </View>
        </TouchableHighlight>
        );
      searchPlaces = (<View style={styles.placesContainer}><ScrollView style={styles.placesScroll}>{sPlaces}</ScrollView></View>)
    } else {
      searchPlaces = (<View></View>)
    }


    //poop marker
    var Marker;
    if($this.state.newMarker){
      Marker = (
        <MapView.Marker
        coordinate={{longitude: $this.state.place.geometry.location.lng, latitude: $this.state.place.geometry.location.lat}}
        onPress={e => $this.showMarker(e.nativeEvent)}
        title={$this.state.place.name}
      />
      )
    } else {
      Marker = (<View></View>)
    }

    //Mutlpile markers (poops)
    var Markers;
    if($this.state.markers.length > 0){
      Markers = $this.state.markers.map( m =>
        <MapView.Marker
        coordinate={ m.location}
        onPress={e => $this.showMarker(e.nativeEvent)}
        key={m.location.latitude}
        title={m.name}
        image={require('../assets/poop.png')}
        >
        </MapView.Marker>
        );
    } else {
      Markers = (
          <View></View>
        )
    }

    //buttons
    var Buttons;
    if(!$this.state.hideButtons){
      Buttons = (
        <View>
          <View style={styles.btnsContainer}>
            <View></View>
             <TouchableOpacity onPress={$this.poopOnIt.bind($this)} style={{
                 alignItems:'center',
                 justifyContent:'center',
                 height:60,
                 backgroundColor:'black',
                 borderRadius: 10
               }}>
                <Icon.Button name="emoticon-poop" backgroundColor="transparent" onPress={$this.poopOnIt.bind($this)}>
                    <Text style={{fontFamily: 'Arial', fontSize: 15, color: 'white', textAlign: 'center'}}>Poop On It</Text>
                </Icon.Button>
            </TouchableOpacity>
            <View></View>
          </View>
          <View style={styles.searchBtnsContainer}>
            <View ></View>
            <View ></View>
            <View ></View>
            <View ></View>
            <View ></View>
            <TouchableOpacity onPress={$this._searchPlaces.bind($this)} style={{
             alignItems:'center',
             justifyContent:'center',
             width:50,
             height:50,
             backgroundColor:'black',
             borderRadius:100,
             paddingLeft: 7
           }}> 
              <Icon.Button name="magnify" backgroundColor="transparent" onPress={$this._searchPlaces.bind($this)}>
              </Icon.Button>
            </TouchableOpacity>
          </View>
        </View>
      )
    } else {
      Buttons = (
        <View></View>
      )
    }

    //MAIN VIEW rendered after geolocation
    var Main;
    if($this.state && $this.state.region){
      Main = (
        <View>
          <MapView
              provider={ PROVIDER_GOOGLE }
              style={ styles.container }
              showsUserLocation={ true }
              region={ this.state.region }
              onPress={this._closeLocations.bind(this)}
              // onRegionChange={ region => this.setState({region}) }
              // onRegionChangeComplete={ region => this.setState({region}) }
          >
            {Marker}
            {Markers}
          </MapView>
          {Place}
          {Search}
          {nearbyPlaces}
          {searchPlaces}
          {Buttons}
        </View>
      )
    } else {
      Main = (
        <View><Text>Loading</Text></View>
      )
    }

    return (
      <View>
        {Main}
      </View>
    );
  }
}


function status(response) {
  if (response.status >= 200 && response.status < 300) {
    return response
  }
  throw new Error(response.statusText)
}

function json(response) {
  return response.json()
}

function fetchLocation(url){
  var prom = new Promise((res, rej)=>{
    fetch(url, {
      method: 'get',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json'
      }
    }).then(status)
      .then(json)
      .then(function(json) {
        var name = json.results[0].name;
        var geometry = json.results[0].geometry
        res({places: json.results, place: {name: name, geo: geometry} })
      }).catch(function(error) {
        console.log('request failed', error)
    });
  })
  prom.then((result)=>{
    return result;
  }).catch((err)=>{
    console.log(err)
  });
  return prom;
}


function gFetch(url){
  var prom = new Promise((res, rej)=>{
    fetch(url, {
      method: 'get',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json'
      }
    }).then(status)
      .then(json)
      .then(function(json) {
        console.log('request succeeded with json response', json)
        res(json)
      }).catch(function(error) {
        console.log('request failed', error)
    });
  })
  prom.then((result)=>{
    return result;
  }).catch((err)=>{
    console.log(err)
  });
  return prom;
}


const styles = StyleSheet.create({
  container: {
    height: '100%',
    width: '100%'
  },
  btnsContainer: {
    position: 'absolute',
    bottom: 20,
    right: 0,
    left: 0,
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 20
  },
  searchBtnsContainer: {
    position: 'absolute',
    bottom: 20,
    right: 0,
    left: 0,
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 20
  },
  optionsBtn: {
    width: 100
  },
  poopBtn: {
    height: 70,
  },
  searchBtn: {
    width: 50,
    height: 50
  },
  searchContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    backgroundColor: 'white',
    height: 100 
  },
  placeContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    backgroundColor: 'black',
    height: 100
  },
  placesContainer: {
    position: 'absolute',
    top: 100,
    left: 0,
    right: 0,
    flex: 1,
    backgroundColor: 'white'
  },
  placesScroll: {
    flex: 1,
    backgroundColor: 'white',
    maxHeight: 200
  },
  placeInScroll: {
    flex: 1,
    justifyContent: 'space-between',
    flexDirection: 'row',
    backgroundColor: 'black'
  }
});



AppRegistry.registerComponent('audioTester', () => Map);