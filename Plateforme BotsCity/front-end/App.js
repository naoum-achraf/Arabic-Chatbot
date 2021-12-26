import React from 'react';
import {StyleSheet, Text, View, ScrollView, TextInput} from 'react-native';
import DataSaver from './data/DataSaver';
import Image from "react-native-web/dist/exports/Image";
import { LinearGradient } from 'expo-linear-gradient';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';


import {Button, Item, Input} from 'native-base';
import { Audio, Video } from 'expo-av';

import LottieView from "lottie-react-native";
import Chat from "./components/Chat";
import Home from "./components/home";
import {addWhitelistedInterpolationParam} from "react-native-web/dist/vendor/react-native/Animated/NativeAnimatedHelper";


// const soundObject = new Audio.Sound();
// soundObject.loadAsync(require('./assets/soso.mp3')).then(r => console.log(r));


const data = new DataSaver();
const Stack = createStackNavigator();

export default class App extends React.Component{
    constructor(props) {
        super(props);
    }

    async componentDidMount() {
        if (!data.component.length){
            await data.load();
            this.forceUpdate();
        }

    }

    render() {
        return (
            <NavigationContainer >
                <Stack.Navigator initialRouteName="Home" >
                    <Stack.Screen name="Home"  options={{ title: 'الرئيسية' }}>
                        {props => <Home {...props} data={data}/>}
                    </Stack.Screen>
                    {data.component.map((c,i)=>
                        <Stack.Screen name={c.name} options={{headerShown: false}} key={i}>
                            {props => <Chat {...props} data={data} theme={c.name} />}
                        </Stack.Screen>
                    )}
                </Stack.Navigator>
            </NavigationContainer>
        );
    }
}


// if (this.state.textValue){
//     soundObject.playAsync().then(r => {});
//     soundObject.replayAsync().then(r => {})
// }else {
//     soundObject.stopAsync().then(r => console.log(r))
// }








