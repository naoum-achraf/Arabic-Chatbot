import React from 'react';
import {Button, View, Text, StyleSheet, Image,TouchableOpacity} from 'react-native';
import { ListItem } from 'react-native-elements'

export default function Home( props ) {
    console.log(props.data.component);
    return (
        <View style={{ flex: 1, paddingTop: 20 }}>
                {props.data.component.map((c,i)=>{
                    console.log(c["name"]);
                    return <TouchableOpacity style={styles.shadow} key={i} onPress={()=>{ props.data.loadModel(c["name"]);props.navigation.navigate(c["name"])}}>
                        <View style={{width:'25%',borderRadius:20, height: '70%', marginVertical:'5%',marginLeft:'5%',borderWidth:2}}>
                            <Image
                                style={{borderRadius:20,width:'100%',height:"78%",resizeMode:'cover'}}
                                source={require('../assets/netflix.png')}
                            />
                        </View>
                        <View style={{width:'70%',padding:'5%'}}>
                            <Text style={{fontSize:20}}>{c["name"]}</Text>
                            <Text style={{borderRadius:5,paddingVertical:3,paddingHorizontal:10,color:'white',backgroundColor:'green',maxWidth:50,textAlign:'center',alignSelf:'flex-end'}}>متاح</Text>
                            <Text style={{marginTop:20}}>{c["describtion"]}</Text>
                        </View>
                    </TouchableOpacity>
                })}
        </View>
    );
}

const styles = StyleSheet.create({
    shadow: {
        backgroundColor:'white',
        shadowColor: "#000",
        shadowOffset: {
            width: 0,
            height: 10,
        },
        shadowOpacity: 0.53,
        shadowRadius: 13.97,
        elevation: 21,
        borderRadius: 20,
        height: 130,
        width: '90%',
        marginHorizontal: '5%',
        marginBottom:20,
        flexDirection: 'row'
    }
});

// <ListItem
//     key={i}
//     leftAvatar={{ source: { uri: c["uri"] } }}
//     title={c["name"]}
//     subtitle={c["describtion"]}
//     bottomDivider
//     onPress={()=>{
//         props.data.loadModel(c["name"])
//         props.navigation.navigate(c["name"])
//     }}
// />
