import React, { Component } from 'react';
import { ActivityIndicator, ListView, Text, View } from 'react-native';

export default class Movies extends Component {
  constructor(props) {
    super(props);
    this.state = {
      isLoading: true
    }
  }

  componentDidMount() {
    return fetch('https://facebook.github.io/react-native/movies.json')
      .then((response) => response.json())
      .then((responseJson) => {
        let ds = new ListView.DataSource({rowHasChanged: (r1, r2) => r1 !== r2});
        this.setState({
          isLoading: false,
          dataSource: ds.cloneWithRows(responseJson.movies),
        }, function() {
          // do something with new state
        });
      })
      .catch((error) => {
        console.error(error);
      });
  }

  render() {
    if (this.state.isLoading) {
      return (
        <View style={{flex: 1, paddingTop: 20}}>
          <ActivityIndicator />
        </View>
      );
    }

    return (
      <View style={{flex: 1, paddingTop: 20, position: 'absolute'}}>
        <ListView
          dataSource={this.state.dataSource}
          renderRow={(rowData) => <Text>{rowData.title}, {rowData.releaseYear}</Text>}
        />
      </View>
    );
  }
}

    //get device info
    // var device_id = DeviceInfo.getUniqueID()); 
    // post({device_id: device_id}).then((result)=>{
    //   console.log('result of saving device id', result);
    // })

// function post(data){
//   var url = 'http://localhost/api/1/devices/saveOne';
//   var prom = new Promise((res,rej)=>{
//     fetch(url, {
//       method: 'post',
//       headers: {
//         'Accept': 'application/json',
//         'Content-Type': 'application/json'
//       },
//       data: data
//     }).then(status)
//       .then(json)
//       .then(function(json){
//         res(json)
//       }).catch(function(error) {
//         console.log('request failed', error)
//     });
//   });
//   prom.then((result)=>{
//     return result;
//   }).catch((err)=>{
//     console.log(err);
//   })
//   return prom;
// }
