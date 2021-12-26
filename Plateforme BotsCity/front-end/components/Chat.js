import React from "react";
import {ScrollView, StyleSheet, Text, View, Image, Modal, TouchableHighlight,TouchableOpacity,TextInput} from "react-native";
import LottieView from "lottie-react-native";
import {Button, Input, Item, } from "native-base";
import { Overlay } from 'react-native-elements';

export default class Chat extends React.Component{
    constructor(props) {
        super(props);
        this.state = {
            textValue: '',
            modalVisible: false,
            doneVisible: false,
            tr:true,
            question: '',
            response: ''
        };
    }

    Typing = (text) => {
        this.setState({textValue: text});
        // this.tAnimation.play(0,34);
        // this.tAnimation.onAnimationFinish = ()=> {
        //     this.tAnimation.play(35,80);
        // };
        // if(!text){
        //     this.tAnimation.reset();
        //     this.tAnimation.onAnimationFinish = null;
        // }
    };

    onSend = async ()=>{
        await this.props.data.addMsgRequest(this.props.theme,this.state.textValue);
        this.setState({textValue: ''});
        this.forceUpdate();

    };
    setModalVisible = () => {
        this.setState({ modalVisible: !this.state.modalVisible });
    };
    setDoneVisible = (i) => {
        this.setState({ doneVisible: i });
    };

    handleLP = (i)=>{
        let a = this.props.data.chatHistory[this.props.theme][i];
        if(a.from){
            this.setState({question: this.props.data.chatHistory[this.props.theme][i-1].text, response:a.text});
        }else {
            this.setState({response: this.props.data.chatHistory[this.props.theme][i+1].text, question:a.text});
        }
        this.setModalVisible();
    };

    componentDidMount() {
        this.props.navigation.navigate(this.props.theme);
    }


    render() {

        return (
            <View style={styles.container}>
                <Modal
                    animationType="none"
                    transparent={true}
                    visible={this.state.doneVisible}
                    >
                    <View style={styles.centeredView}>
                        <View style={styles.modalView}>
                            <Text style={styles.modalText}>تم إدراج اقتراحك بنجاح</Text>
                            <TouchableHighlight
                                style={{ ...styles.openButton, backgroundColor: "#2196F3",width:'50%' }}
                                onPress={() => {
                                    this.setDoneVisible(false)
                                }}
                            >
                                <Text style={styles.textStyle}>شكرا</Text>
                            </TouchableHighlight>
                        </View>
                    </View>
                </Modal>

                <Modal
                    animationType="slide"
                    transparent={true}
                    visible={this.state.modalVisible}
                    onRequestClose={() => {
                        Alert.alert("Modal has been closed.");
                    }}
                >
                    <View style={styles.centeredView}>
                        <View style={styles.modalView}>
                            <Item rounded style={{width:'100%', height: 45, paddingHorizontal: 20, marginBottom:5}}>
                                <Input value={this.state.question} placeholder='' onChangeText={text => this.setState({question: text})}/>
                            </Item>

                            <Item rounded style={{width:'100%', height: 45, paddingHorizontal: 20, marginBottom:5}}>
                                <Input value={this.state.response} placeholder='' onChangeText={text => this.setState({response: text})}/>
                            </Item>

                            <View  style={{flexDirection:'row'}}>
                                <TouchableHighlight
                                    style={{ ...styles.openButton, backgroundColor: "#2196F3",width:'50%' }}
                                    onPress={() => {
                                        this.props.data.sendSuggestion(this.props.theme, this.state.question, this.state.response);
                                        this.setDoneVisible(true);
                                        this.setModalVisible();
                                    }}
                                >
                                    <Text style={styles.textStyle}>أرسل الإقتراح</Text>
                                </TouchableHighlight>
                                <TouchableHighlight
                                    style={{ ...styles.openButton, backgroundColor: "orange" ,width:'50%'}}
                                    onPress={() => {
                                        this.setModalVisible();
                                    }}
                                >
                                    <Text style={styles.textStyle}>إلغاء</Text>
                                </TouchableHighlight>
                            </View>
                        </View>
                    </View>
                </Modal>
                <View style={{alignItems: 'center'}}>
                    <Button onPress={()=>this.props.navigation.navigate('Home')} style={{position:'absolute',left:10  }} transparent>
                        <Image source={require('../assets/back.png')} style={{ width: 50, height: 50,}}/>
                    </Button>
                    <LottieView style={{height: 200}} source={require('../assets/Body_Animation.json')}  autoPlay loop />
                </View>
                <ScrollView style={{flex: 1, flexDirection: 'column', paddingHorizontal:20}} ref={ref => {this.scrollView = ref}} onContentSizeChange={() => this.scrollView.scrollToEnd({animated: true})} >
                    {
                        this.props.data.chatHistory[this.props.theme].map((c,i) => {
                                return <TouchableOpacity style={{...styles.textView, alignSelf: c.from ? 'flex-start' : 'flex-end', backgroundColor:c.from?'#de212f':'#0958b1', borderTopLeftRadius:c.from?3:100, borderTopRightRadius:c.from?100:3,}}  key={i}
                                             onLongPress={()=>{this.handleLP(i)} }
                                ><Text style={styles.msgTextColor}>{c.text}</Text></TouchableOpacity>
                            }
                        )
                    }
                </ScrollView>
                <View style={{height:60, flexDirection:'row', paddingVertical: 10, color: 'bleu'}}>

                    <TouchableHighlight
                        style={{ ...styles.openButton, backgroundColor: "#0958b1" ,width:'20%',height:45,paddingVertical: 13}}
                        onPress={() => {
                            this.onSend();
                        }}
                    >
                        <Text style={styles.textStyle}>إرسال</Text>
                    </TouchableHighlight>
                    {/*<TextInput*/}
                    {/*    style={{ width: 280, backgroundColor: '#e4d8f7', borderRadius: 30, paddingHorizontal:30 ,marginLeft:10}}*/}
                    {/*    onChangeText={text => console.log(text)}*/}
                    {/*/>*/}
                    <Item rounded style={{width:'80%', height: 45, paddingHorizontal: 20, marginBottom:5,borderRadius:20}}>
                        <Input onChangeText={text => this.setState({textValue: text})} autoFocus={false} value={this.state.textValue} placeholder='أدخل هنا'/>
                    </Item>
                </View>
            </View>
        );
    }
}



const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#fff',
        paddingTop: 50,
        paddingHorizontal: 10
    },
    textView: {
        maxWidth: 250,
        paddingHorizontal: 20,
        paddingVertical: 15,
        backgroundColor: '#FE6D83',
        marginBottom: 10,
        borderRadius: 100,
    },
    msgTextColor: {
        color: '#fff',
        fontWeight: "bold"
    },

    bgBot:{
        backgroundColor:'rgb(32,37,88)'
    },
    centeredView: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        marginTop: 22
    },
    modalView: {
        margin: 20,
        backgroundColor: "white",
        borderRadius: 20,
        padding: 35,
        alignItems: "center",
        shadowColor: "#000",
        shadowOffset: {
            width: 0,
            height: 2
        },
        shadowOpacity: 0.25,
        shadowRadius: 3.84,
        elevation: 5
    },
    openButton: {
        backgroundColor: "#F194FF",
        borderRadius: 20,
        padding: 10,
        elevation: 2
    },
    textStyle: {
        color: "white",
        fontWeight: "bold",
        textAlign: "center"
    },
    modalText: {
        marginBottom: 15,
        textAlign: "center"
    }
});