import React, { Component } from 'react';
import { AppRegistry, ScrollView, Image, Text } from 'react-native';

export default class ScrollDown extends Component {
  render() {
      return (
        <ScrollView>
          <Text style={{fontSize:200}}>Scroll me plz</Text>

          <Text style={{fontSize:400}}>If you like</Text>
 
          <Text style={{fontSize:200}}>Scrolling down</Text>

          <Text style={{fontSize:96}}>What's the best</Text>

          <Text style={{fontSize:96}}>Framework around?</Text>

          <Text style={{fontSize:80}}>React Native</Text>
        </ScrollView>
    );
  }
}

// skip these lines if using Create React Native App
AppRegistry.registerComponent(
  'AwesomeProject',
  () => ScrollDown);