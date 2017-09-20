import React, { Component } from 'react';
import { AppRegistry, StyleSheet, View, Text, Dimensions, Button, Alert, Image, ScrollView, TouchableHighlight, TouchableOpacity, TextInput, Modal} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons'

import MapView, { PROVIDER_GOOGLE } from 'react-native-maps';

//WINDOW SIZE & ASPECT RATIO
let { width, height } = Dimensions.get('window');
const ASPECT_RATIO = width / height;
const LATITUDE_DELTA = 0.0922;
const LONGITUDE_DELTA = LATITUDE_DELTA * ASPECT_RATIO;

//currently fetching images client side, but image url should be fetched and added to data via the server
const G_Photo_URL = 'https://maps.googleapis.com/maps/api/place/photo?maxwidth=400&photoreference='
const G_KEY = 'AIzaSyAQ1HQf-B9HQIN6IcDqIqA187xCTUFeDvc';
const G_URL = 'https://maps.googleapis.com/maps/api/place/nearbysearch/json?';
const G_Search_URL = 'https://maps.googleapis.com/maps/api/place/autocomplete/json?';
const G_Place_URL = 'https://maps.googleapis.com/maps/api/place/details/json?placeid=';



export default class PoopMap extends Component {
  constructor() {
    super();
    this.state = {
      place: false,
      showNearPlaces: false,
      places: false,
      showSearch: false,
      showSearchPredictions: false,
      searchPredictions: false,
      markers: [],
      newMarker: false,
      hideButtons: false,
      modalVisible: false
    };
  }

  componentDidMount() {
    $this = this;
    //current position
    navigator.geolocation.getCurrentPosition(
      position => {
        //set position
        $this.setState({
          region: {
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
            latitudeDelta: LATITUDE_DELTA,
            longitudeDelta: LONGITUDE_DELTA,
          }
        }, function(){
            //SEARCH FOR PLACES NEARBY (currently seraching by type restaurant)
            var lat = $this.state.region.latitude;
            var lng =  $this.state.region.longitude;
            console.log('INITIAL LAT LNG', lat, lng);
            gFetch('locations', {coordinates: {latitude: lat, longitude: lng}}).then((json)=>{
                //set nearby places and top result
                $this.setState({places: json.results, place: json.results[0]})
            });
        });
      },
    (error) => console.log(error.message),
    { enableHighAccuracy: true, timeout: 20000, maximumAge: 1000 },
    );


    //watch the device location
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

    //create poop marker and add it to marker array
    var markerArray = $this.state.markers;
    var latitude = $this.state.place.geometry.location.lat;
    var longitude = $this.state.place.geometry.location.lng;
    var marker = {location:{latitude: latitude, longitude: longitude}};
    marker.name = $this.state.place.name;
    markerArray.push(marker);
    $this.setState({markers: markerArray, modalVisible: true})
  }


  selectNearbyPlace(val){
    //when user selects a nearby place
    var $this = this;
    $this.setState({place: val, 
      showNearPlaces: false,
      showSearch: false, 
      showSearchPredictions: false,
      region: {
            latitude: val.geometry.location.lat,
            longitude: val.geometry.location.lng,
            latitudeDelta: LATITUDE_DELTA,
            longitudeDelta: LONGITUDE_DELTA,
          }
    }, function(){
      var lat = $this.state.region.latitude;
      var lng =  $this.state.region.longitude;
      // var latLng = lat + ',' + lng;
      // var url = G_URL + 'location='+ latLng +'&radius=500&sensor=false&key=' + G_KEY;
      gFetch('locations', {coordinates: {latitude: lat, longitude: lng}}).then((json)=>{
        $this.setState({places: json.results, place: val, newMarker: true})
      });
    });
  }

  _showNearbyPlaces(){
    var $this = this;
    $this.setState({showNearPlaces: true})
  }

  _searchFocus(){
    //hide absolute buttons when user is typing
    var $this = this;
    $this.setState({hideButtons: true})
  }

  _searchBlur(){
    //show buttons when user exits the search input
    var $this = this;
    $this.setState({hideButtons: false})    
  }

  autocompleteSearch(text){
    var $this = this;
    gFetch('autocomplete', {text: text}).then((result)=>{
      $this.setState({searchPredictions: result.predictions, showSearchPredictions: true})
    }); 
  }

  selectSearch(place){
    var $this = this;
    place.name = place.description
    gFetch('place_id', {place_id: place.place_id}).then((json)=>{
      var place = json.result
      $this.setState({place: place, 
        showNearPlaces: false,
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
        var lat = $this.state.region.latitude;
        var lng =  $this.state.region.longitude;
        gFetch('locations', {coordinates: {latitude: lat, longitude: lng}}).then((json)=>{
          $this.setState({places: json.results, newMarker: true})
        });
      });
    });
  }

  _closeLocations(){
    var $this = this;
    $this.setState({showNearPlaces: false, showSearchPredictions: false, hideButtons: false})
  }


  showMarker(val){
    var lat = $this.state.region.latitude;
    var lng =  $this.state.region.longitude;
    gFetch('locations',{coordinates: {latitude: lat, longitude: lng}}).then((json)=>{
      $this.setState({places: json.results, place: json.results[0]})
    });
  }

  setModalVisible() {
    var $this = this;
    console.log('modal lcicked');
    var visible = $this.state.modalVisible;
    $this.setState({modalVisible: !visible});
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

    //SEARCH INPUT
    var Search;
    if($this.state.showNearPlaces){
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

    //NEARBY PLACES
    var nearbyPlaces;
    if($this.state.places && $this.state.showNearPlaces && !$this.state.showSearchPredictions){
      var nPlaces = $this.state.places.map( place =>
        <TouchableHighlight style={styles.placeInScroll} onPress={$this.selectNearbyPlace.bind($this,place)} key={place.id}>
          <View style={styles.placeInScroll}>
            <Image source={{uri: ((place.photos && place.photos[0]) ? (G_Photo_URL + place.photos[0].photo_reference + '&key=' + G_KEY) : ('https://image.freepik.com/free-icon/instagram-photo-camera-logo-outline_318-56004.jpg'))}} style={{flex: 3, height: undefined, width: undefined}}/>
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

    //SEARCH PREDICTIONS
    var searchPredictions;
    if($this.state.searchPredictions && $this.state.showSearchPredictions && $this.state.searchPredictions.length > 0){
      var sPlaces = $this.state.searchPredictions.map( place =>
        <TouchableHighlight onPress={$this.selectSearch.bind($this, place)} key={place.id}>
          <View style={{height: 50}}>
            <Text> {place.description} </Text>
          </View>
        </TouchableHighlight>
        );
      searchPredictions = (<View style={styles.placesContainer}><ScrollView style={styles.placesScroll}>{sPlaces}</ScrollView></View>)
    } else {
      searchPredictions = (<View></View>)
    }


    //POOP MARKER
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

    //LOADED MARKERS
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

    //POOP ON IT and SEARCH BUTTONS
    var Buttons;
    if(!$this.state.hideButtons && !$this.state.modalVisible){
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
            <TouchableOpacity onPress={$this._showNearbyPlaces.bind($this)} style={{
               alignItems:'center',
               justifyContent:'center',
               width:50,
               height:50,
               backgroundColor:'black',
               borderRadius:100,
               paddingLeft: 7
            }}> 
              <Icon.Button name="magnify" backgroundColor="transparent" onPress={$this._showNearbyPlaces.bind($this)}>
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

    var ReviewModal;
    if($this.state.modalVisible){
      ReviewModal = (
        <View>
          <Modal
              animationType="slide"
              transparent={true}
              visible={$this.state.modalVisible}
              onRequestClose={() => {alert("Modal has been closed.")}}
              >
              <View style={{
                  flex: 1,
                  flexDirection: 'column',
                  justifyContent: 'center',
                  alignItems: 'center',
                }}>
                <Text style={{fontSize: 20, fontWeight: 'bold', margin: 20, backgroundColor: 'black', padding: 10, color: 'white'}}>You just pooped on it!</Text>
               
                <TouchableOpacity style={{
                   alignItems:'center',
                   justifyContent:'center',
                   height:60,
                   backgroundColor:'black',
                   borderRadius: 10,
                   marginTop: 10
                  }}>
                  <Icon.Button name="share" backgroundColor="transparent" >
                      <Text style={{fontFamily: 'Arial', fontSize: 15, color: 'white', textAlign: 'center'}}>Tell the world</Text>
                  </Icon.Button>
                </TouchableOpacity>
                
                <TouchableOpacity style={{
                   alignItems:'center',
                   justifyContent:'center',
                   height:60,
                   backgroundColor:'black',
                   borderRadius: 10,
                   marginTop: 10
                  }}>
                  <Icon.Button name="message-plus" backgroundColor="transparent" >
                      <Text style={{fontFamily: 'Arial', fontSize: 15, color: 'white', textAlign: 'center'}}>Add a comment</Text>
                  </Icon.Button>
                </TouchableOpacity>

                <TouchableOpacity style={{
                   alignItems:'center',
                   justifyContent:'center',
                   height:60,
                   backgroundColor:'black',
                   borderRadius: 10,
                   marginTop: 10
                  }}>
                  <Icon.Button name="emoticon-poop" backgroundColor="transparent" onPress={$this.setModalVisible.bind($this)} >
                      <Text style={{fontFamily: 'Arial', fontSize: 15, color: 'white', textAlign: 'center'}}>Keep pooping</Text>
                  </Icon.Button>
                </TouchableOpacity>

              </View>
            </Modal>
        </View>
      )
    } else {
      ReviewModal = (<View></View>)
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
          {searchPredictions}
          {Buttons}
          {ReviewModal}
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

//HELPER FUNCTIONS

function status(response) {
  if (response.status >= 200 && response.status < 300) {
    return response
  }
  throw new Error(response.statusText)
}

function json(response) {
  return response.json()
}

//fetch data 
function gFetch(type, data){
  var url;
  switch(type){
    case 'locations':
    url = G_URL + 'location='+ data.coordinates.latitude + ',' + data.coordinates.longitude +'&radius=500&sensor=false&key=' + G_KEY;
    break;
    case 'place_id':
    url = G_Place_URL + data.place_id + '&sensor=true&key=' + G_KEY;
    break;
    case 'autocomplete':
    url = G_Search_URL + 'input=' + data.text+ '&key=' + G_KEY;
    break;
    default:
    break;
  }
  if(!url){
    return;
  }

  var prom = new Promise((res, rej)=>{
    makeRequest(url).then((response)=>{
      res(response);
    });
  })
  prom.then((result)=>{
    return result;
  }).catch((err)=>{
    console.log('gfetch failed', err);  
  })
  return prom;
}

function makeRequest(url){
  var prom = new Promise((res, rej)=>{
    fetch(url, {
      method: 'get',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json'
      }
    }).then(status)
      .then(json)
      .then(function(json){
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

//STYLES
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



AppRegistry.registerComponent('audioTester', () => PoopMap);