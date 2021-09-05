import React from "react";
import { Text,View ,TouchableOpacity,StyleSheet, TextInput,Image, KeyboardAvoidingView,ToastAndroid} from "react-native";
import * as Permissions from 'expo-permissions';
import {BarCodeScanner} from 'expo-barcode-scanner';
import { askAsync } from "expo-permissions";
import * as firebase from 'firebase';
import db from '../config';


export default class Transactionscreen extends React.Component{
  constructor(){
   super();
   this.state = {hascamerapermission:null,scanned:false,scannedata:'',
   buttonstate:'normal',scanbookid:'',scanstudentid:'',transactionMssg:''}
  }
  getcampermission=async(id)=>{
    const {status} = await Permissions.askAsync(Permissions.CAMERA)
    this.setState({
      hascamerapermission:status==="granted",
      buttonstate:id,
      scanned:false,
    })
  }
  handlebarscanned=async({type,data})=>{
    this.setState({
      scanned:true,
      scannedata:data,
      buttonstate:'normal' 
    })
  }
  handleTransaction= async ()=>{
   var transmssg 
   db.collection("books").doc(this.state.scanbookid).get().then((doc)=> {
     var book = doc.data()
     if(book.bookAvailability){
       this.initiateBookIssue()
       transmssg = "bookIssued"
     }
     else{
       this.initiateBookReturn()
       transmssg = "bookreturned"
     }
   })

   this.setState({
    transactionMssg : transmssg
   })
  }

  initiateBookIssue = async()=>{
    db.collection("Transactions").add({
      'studentId': this.state.scanstudentid,
      'bookId'   : this.state.scanbookid,
      //'date'     : firebase.firestore.Timestamp.now().toDate(),
      'transactiontype' : "Issued"
    })
    db.collection("books").doc(this.state.scanbookid).update({
       'bookAvailability' : false
    })
   /* db.collection("students").doc(this.state.scanstudentid).update({
      'numberOfBooksIssued' : firebase.firestore.FieldValue.increment(1)
   })
*/
    //ToastAndroid.show("bookIssued",ToastAndroid.SHORT)
    alert("bookIssued")

    this.setState({
      scanbookid : '',
      scanstudentid : ''
    })

  }

  initiateBookReturn = async()=>{
    db.collection("Transactions").add({
      'studentId': this.state.scanstudentid,
      'bookId'   : this.state.scanbookid,
      //'date'     : firebase.firestore.Timestamp.now().toDate(),
      'transactiontype' : "Returned"
    })
    db.collection("books").doc(this.state.scanbookid).update({
       'bookAvailability' : true
    })
   // db.collection("students").doc(this.state.scanstudentid).update({
     // 'numberOfBooksIssued' : firebase.firestore.FieldValue.increment(-1)
   //})

   alert("bookReturned")

    this.setState({
      scanbookid : '',
      scanstudentid : '',
    })
    
  }
  render(){

    const hascamerapermission = this.state.hascamerapermission;
    const scanned = this.state.scanned;
    const buttonstate = this.state.buttonstate;

    if(buttonstate !=="normal" && hascamerapermission){
      return(
       < BarCodeScanner 
         onBarCodeScanned = {scanned? undefined:this.handlebarscanned}
         style ={StyleSheet.absoluteFillObject}
       />
      )

    }

    else if(buttonstate==="normal"){
    return(
      
      <KeyboardAvoidingView style = {styles.container} behavior="padding" enabled> 
         <View>
          <View>
              <Image source={require("../assets/booklogo.jpg")} style={{width:200,height:200}}/>
              <Text style={{textAlign:"center",fontSize:30}}> WILY APP </Text>
            </View>
          <View style={styles.inputview}>
            <TextInput style={styles.inputbox} placeholder="BookID"  
            onChangeText={text=>this.setState({scanbookid:text})} value={this.state.scanbookid} 
           />
            <TouchableOpacity style={styles.scanButton} onPress={()=>{this.getcampermission("BookId")}}>
            <Text style={styles.buttonText}>Scan</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.inputview}>
            <TextInput style={styles.inputbox} placeholder="StudentID"    
            onChangeText={text=>this.setState({scanstudentid:text})}
            value={this.state.scanstudentid}/>
            <TouchableOpacity style={styles.scanButton} onPress={()=>{this.getcampermission("StudentId")}}>
            <Text style={styles.buttonText}>Scan</Text>
            </TouchableOpacity>
          </View>

          <TouchableOpacity style={styles.submitbutton} onPress={async()=>{this.handleTransaction()}}><Text style={styles.submitbuttontext}>submit</Text></TouchableOpacity>

          </View>
          </KeyboardAvoidingView>

      )
  }  
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center'
  },
  displayText:{
    fontSize: 15,
    textDecorationLine: 'underline'
  },
  scanButton:{
    backgroundColor: '#2196F3',
    padding: 10,
    margin: 10,
  },
  buttonText:{
    fontSize: 20,
    textalign:"center",
    marginTop:10,
  },
  inputview:{
    flexDirection:"row",
    margin:20,
    
  },
  inputbox:{
    width:200,
    height:40,
    borderWidth:1.5,
    borderRightWidth:0,
    fontSize:20
  },
  scanButton:{
    backgroundColor:"#66BB6A",
    width:50,
    borderWidth:1.5,
    borderLeftWidth:0
  },
  submitbutton:{
    backgroundColor:"#FBC02D",
    width:100,
    height:50,
  },
  submitbuttontext:{
    padding:10,
    textAlign:"center",
    textSize:20,
    fontWeight:"bold",
    color:"white"
  }

});
