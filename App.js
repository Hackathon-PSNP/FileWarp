import React, { Component, PureComponent } from 'react';
import {
  StyleSheet,
  View,
  Button,
  Text,
  SafeAreaView,
  FlatList
} from 'react-native';
import {
  initialize,
  startDiscoveringPeers,
  stopDiscoveringPeers,
  unsubscribeFromPeersUpdates,
  unsubscribeFromThisDeviceChanged,
  unsubscribeFromConnectionInfoUpdates,
  subscribeOnConnectionInfoUpdates,
  subscribeOnThisDeviceChanged,
  subscribeOnPeersUpdates,
  connect,
  cancelConnect,
  createGroup,
  removeGroup,
  getAvailablePeers,
  sendFile,
  receiveFile,
  getConnectionInfo,
  getGroupInfo,
  receiveMessage,
  sendMessage,
} from 'react-native-wifi-p2p';
import { PermissionsAndroid } from 'react-native';

const Item = ({ title }) => (
  <View style={styles.logText}>
    <Text>{title}</Text>
  </View>
);

const ButtonItem = (props) => (
  <View style={styles.buttonStyle}>
    <Button style={styles.welcome}
          title={props.title}
          onPress={props.functionCall}
        />
  </View>
);

export default class App extends Component {
  state = {
    devices: [],
    msg: ["Result of button will appear here"],
  };
  
  logAndDisplay = function(string, obj){
    console.log(string, obj);
    this.setState({msg: [string + JSON.stringify(obj)].concat(this.state.msg)});
  };

  async componentDidMount() {
      try {
          await initialize();
          // since it's required in Android >= 6.0
          const granted = await PermissionsAndroid.request(
              PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
              {
                  'title': 'Access to wi-fi P2P mode',
                  'message': 'ACCESS_FINE_LOCATION'
              }
          );

          this.logAndDisplay(granted === PermissionsAndroid.RESULTS.GRANTED ? "You can use the p2p mode" : "Permission denied: p2p mode will not work", "");

          subscribeOnPeersUpdates(this.handleNewPeers);
          subscribeOnConnectionInfoUpdates(this.handleNewInfo);
          subscribeOnThisDeviceChanged(this.handleThisDeviceChanged);

          const status = await startDiscoveringPeers();
          this.logAndDisplay('startDiscoveringPeers status: ', status);
      } catch (e) {
          this.logAndDisplay('In componentDidMount() Error:', e);
            // console.error(e);
      }
  }

  componentWillUnmount() {
    unsubscribeFromConnectionInfoUpdates(this.handleNewInfo);
    unsubscribeFromPeersUpdates(this.handleNewPeers);
    unsubscribeFromThisDeviceChanged(this.handleThisDeviceChanged)
  }

  handleNewInfo = (info) => {
    this.logAndDisplay('OnConnectionInfoUpdated', info);
  };

  handleNewPeers = (deviceList) => {
    this.logAndDisplay('OnPeersUpdated: ', deviceList);
    this.setState({ devices: deviceList.devices });
    this.logAndDisplay('Device List: ', this.state.devices);
  };

  handleThisDeviceChanged = (groupInfo) => {
      this.logAndDisplay('THIS_DEVICE_CHANGED_ACTION', groupInfo);
  };

  connectToFirstDevice = () => {
      this.logAndDisplay('Connect to: ', this.state.devices[0]);
      connect(this.state.devices[0].deviceAddress)
          .then(() => this.logAndDisplay('Successfully connected', {}))
          .catch(err => this.logAndDisplay('Something gone wrong. Details: ', err));
  };

  onCancelConnect = () => {
      cancelConnect()
          .then(() => this.logAndDisplay('cancelConnect', 'Connection successfully canceled', {}))
          .catch(err => this.logAndDisplay('cancelConnect ' + 'Something gone wrong. Details: ', err));
  };

  onCreateGroup = () => {
      createGroup()
          .then(() => this.logAndDisplay('Group created successfully!', {}))
          .catch(err => this.logAndDisplay('Create Group: Something gone wrong. Details: ', err));
  };

  onRemoveGroup = () => {
      removeGroup()
          .then(() => this.logAndDisplay('Currently you don\'t belong to group!', {}))
          .catch(err => this.logAndDisplay('Something gone wrong. Details: ', err));
  };

  onStopInvestigation = () => {
      stopDiscoveringPeers()
          .then(() => this.logAndDisplay('Stopping of discovering was successful', {}))
          .catch(err => this.logAndDisplay(`Something is gone wrong. Maybe your WiFi is disabled? Error details`, err));
  };

  onStartInvestigate = () => {
      startDiscoveringPeers()
          .then(status => this.logAndDisplay('startDiscoveringPeers' + 'Status of discovering peers: ', status))
          .catch(err => this.logAndDisplay('Something is gone wrong. Maybe your WiFi is disabled? Error details: ', err));
  };

  onGetAvailableDevices = () => {
      getAvailablePeers()
          .then(peers => {
            this.logAndDisplay("Get Available Devices: ", peers.devices);
            this.setState({devices: peers.devices});
            this.logAndDisplay("Device List: ", this.state.devices);
          });
  };

  onSendFile = () => {
      //const url = '/storage/sdcard0/Music/Rammstein:Amerika.mp3';
      const url = '/storage/emulated/0/Music/Bullet For My Valentine:Letting You Go.mp3';
      PermissionsAndroid.request(
                  PermissionsAndroid.PERMISSIONS.READ_EXTERNAL_STORAGE,
                  {
                      'title': 'Access to read',
                      'message': 'READ_EXTERNAL_STORAGE'
                  }
              )
          .then(granted => {
              if (granted === PermissionsAndroid.RESULTS.GRANTED) {
                  this.logAndDisplay("You can use the storage","")
              } else {
                  this.logAndDisplay("Storage permission denied", "")
              }
          })
          .then(() => {
              return PermissionsAndroid.request(
                  PermissionsAndroid.PERMISSIONS.WRITE_EXTERNAL_STORAGE,
                  {
                      'title': 'Access to write',
                      'message': 'WRITE_EXTERNAL_STORAGE'
                  }
              )
          })
          .then(() => {
              return sendFile(url)
                  .then((metaInfo) => this.logAndDisplay('File sent successfully', metaInfo))
                  .catch(err => this.logAndDisplay('Error while file sending', err));
          })
          .catch(err => this.logAndDisplay("Error", err));
  };

  onReceiveFile = () => {
      PermissionsAndroid.request(
          PermissionsAndroid.PERMISSIONS.READ_EXTERNAL_STORAGE,
          {
              'title': 'Access to read',
              'message': 'READ_EXTERNAL_STORAGE'
          }
      )
          .then(granted => {
              if (granted === PermissionsAndroid.RESULTS.GRANTED) {
                  this.logAndDisplay("You can use the storage", "")
              } else {
                  this.logAndDisplay("Storage permission denied", "")
              }
          })
          .then(() => {
              return PermissionsAndroid.request(
                  PermissionsAndroid.PERMISSIONS.WRITE_EXTERNAL_STORAGE,
                  {
                      'title': 'Access to write',
                      'message': 'WRITE_EXTERNAL_STORAGE'
                  }
              )
          })
          .then(() => {
              return receiveFile('/storage/emulated/0/Music/', 'BFMV:Letting You Go.mp3')
                  .then(() => this.logAndDisplay('File received successfully'))
                  .catch(err => this.logAndDisplay('Error while file receiving', err))
          })
          .catch(err => this.logAndDisplay("Error: ", err));
  };

  onSendMessage = () => {
      sendMessage("Hello world!")
        .then((metaInfo) => this.logAndDisplay('Message sent successfully', metaInfo))
        .catch(err => this.logAndDisplay('Error while message sending', err));
  };

  onReceiveMessage = () => {
      receiveMessage()
          .then((MSGS) => this.logAndDisplay('Message received successfully', MSGS))
          .catch(err => this.logAndDisplay('Error while message receiving', err));
  };

  onGetConnectionInfo = () => {
    getConnectionInfo()
        .then(info => this.logAndDisplay('getConnectionInfo: ', info));
  };

  onGetGroupInfo = () => {
      getGroupInfo()
        .then(info => this.logAndDisplay('getGroupInfo: ', info));
      
  };

  buttonData = [
    {title:"Connect",                 functionCall: this.connectToFirstDevice },
    {title: "Cancel connect",         functionCall: this.onCancelConnect},
    {title: "Create group",           functionCall: this.onCreateGroup},
    {title: "Remove group",           functionCall: this.onRemoveGroup},
    {title: "Investigate",            functionCall: this.onStartInvestigate},
    {title: "Prevent Investigation",  functionCall: this.onStopInvestigation},
    {title: "Get Available Devices",  functionCall: this.onGetAvailableDevices},
    {title: "Get connection Info",    functionCall: this.onGetConnectionInfo},
    {title: "Get group info",         functionCall: this.onGetGroupInfo},
    {title: "Send file",              functionCall: this.onSendFile},
    {title: "Receive file",           functionCall: this.onReceiveFile},
    {title: "Send message",           functionCall: this.onSendMessage},
    {title: "Receive message",        functionCall: this.onReceiveMessage}
  ]

  render() {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.buttonView}>
            <FlatList
                  data={this.buttonData}
                  renderItem={({ item }) => <ButtonItem title={item.title} functionCall={item.functionCall} />}
                  keyExtractor={(item, index) => item.title + index}
            />
        </View>
        
        <View style={styles.listView}>
          <FlatList
                  data={this.state.msg}
                  renderItem={({ item }) => <Item title={item} />}
                  keyExtractor={(item, index) => item + index}
              />
        </View>
        
      </SafeAreaView>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5FCFF',
  },
  welcome: {
    fontSize: 20,
    backgroundColor: "blue",
    margin: 10,
    alignSelf: 'center',
  },

  buttonView: {
    marginVertical: 1,
    flex: 3
  },

  buttonStyle: {
    marginVertical: 10,
  },

  listView: {
    flex: 1
  },

  logText: {
    textAlign: 'center',
    marginHorizontal: 10,
    marginVertical: 10,
    fontWeight: "bold",
  }

});