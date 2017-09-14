import React, { Component } from 'react';
import { Alert, AppRegistry, Button, StyleSheet, View } from 'react-native';

export default class PoopBtn extends Component {
  _onPressButton() {
    Alert.alert('You tapped the button!')
  }

  render() {
    return (
      <View style={styles.container}>
        <View style={styles.poopBtn}>
          <Button
            onPress={this._onPressButton}
            title="Poop On It"
          />
        </View>
      </View>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 10, 
    left: 0, 
    right: 0, 
    justifyContent: 
    'center', 
    alignItems: 
    'center'
  },
  poopBtn: {
    width: 200
  }
})


// skip this line if using Create React Native App
AppRegistry.registerComponent('PoopBtn', () => 'audioTester');