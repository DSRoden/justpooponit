import React from 'react';
import { StyleSheet, Text, View } from 'react-native';

// components
import HelloWorld from './components/HelloWorld.js'
import Image from './components/Image.js'
import LotsOfGreetings from './components/Greetings.js'
import BlinkApp from './components/Blink.js'
import LotsOfStyles from './components/Styles.js'
import FixedDimensionsBasics from './components/FixedDimensions.js'
import FlexDimensionsBasics from './components/FlexDimensions.js'
import FlexDirectionsBasics from './components/FlexDirections.js'
import JustifyContentBasics from './components/JustifyContent.js'
import AlignItemsBasics from './components/AlignItems.js'
import PizzaTranslator from './components/Input.js'
import ScrollDown from './components/ScrollView.js'
import FlatListBasics from './components/FlatListBasics.js'
import SectionListBasics from './components/SectionListBasics.js'
import ButtonBasics from './components/ButtonBasics.js'
import Touchables from './components/Touchables.js'
import Movies from './components/Fetch.js'
import Map from './components/GMap.js'
import PoopMap from './components/PoopMap.js'

export default class App extends React.Component {
  render() {
    return (
      <View>
        <PoopMap />
      </View>
    );
  }
}


const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
  },
});
