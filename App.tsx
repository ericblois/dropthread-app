import { DefaultTheme, NavigationContainer, NavigationContainerRef, createNavigationContainerRef } from "@react-navigation/native";
import * as Font from 'expo-font';
import React, { Component } from "react";
import { ActivityIndicator, AppState, DeviceEventEmitter, LogBox, StatusBar, Text } from "react-native";
import PageContainer from "./app/CustomComponents/PageContainer";
import { auth } from './app/HelperFiles/Constants';
import { RootStack, RootStackParamList } from "./app/HelperFiles/Navigation";
import StartPage from "./app/StartPage";
import UserMainScreen from "./app/UserMainScreen";
import UserSignupPage from "./app/UserSignupPage";
import UserDetailScreen from './app/UserDetailScreen';
import AppUtils from './app/HelperFiles/AppUtils';
import GeoPermPage from "./app/EntryPages/GeoPermPage"
import EntryLoadingPage from './app/EntryPages/EntryLoadingPage';
import FastImage from "react-native-fast-image";
import { defaultStyles, fonts, textStyles } from "./app/HelperFiles/StyleSheet";
import CustomTextButton from "./app/CustomComponents/CustomTextButton";

//LogBox.ignoreLogs(['Calling getNode()', 'VirtualizedLists should never be nested'])

interface Props {

}

interface State {
  errorCaught: boolean
}

export default class App extends Component<Props, State> {

  navContainer = createNavigationContainerRef<RootStackParamList>()
  //rootNav: NavigationContainerRef<ReactNavigation.RootParamList> | null = null;

  constructor(props: Props) {
    super(props)
    this.state = {
      errorCaught: false
    }
    DeviceEventEmitter.addListener('goToEntry', (data) => {
      if (this.navContainer.isReady()) {
        this.navContainer.navigate('entry')
      }
    })
  }

  componentDidMount() {
    
  }

  componentDidCatch() {
      this.setState({errorCaught: true});
      console.error("Caught an error!");
  }
  

  render() {
    if (!this.state.errorCaught) {
      return (
        <>
          <StatusBar barStyle={"dark-content"}/>
          <NavigationContainer
            theme={{
              ...DefaultTheme,
              colors: {
                ...DefaultTheme.colors,
                background: "#f00"
              }
            }}
            ref={this.navContainer}
          >
              <RootStack.Navigator
                initialRouteName={"entry"}
                screenOptions={{
                  headerShown: false,
                }}
              >
                <RootStack.Screen
                  name={"entry"}
                  component={EntryLoadingPage}
                />
                <RootStack.Screen
                  name={"start"}
                  component={StartPage}
                />
                <RootStack.Screen
                  name={"userMain"}
                  component={UserMainScreen}
                />
                <RootStack.Screen
                  name={"userDetail"}
                  component={UserDetailScreen}
                />
                <RootStack.Screen
                  name={"userSignup"}
                  component={UserSignupPage}
                />
                <RootStack.Screen
                  name={"geoPerm"}
                  component={GeoPermPage}
                />
              </RootStack.Navigator>
          </NavigationContainer>
        </>
      );
    } // Error caught
    else {
      <PageContainer style={{justifyContent: 'center'}}>
        <FastImage
            source={require("./assets/entryBackground.jpg")}
            resizeMode="cover"
            style={{
                ...defaultStyles.fill,
            }}
        />
        <Text
            style={{
                ...textStyles.largest,
                fontFamily: Font.isLoaded(fonts.bold) ? fonts.bold : undefined,
                alignSelf: 'center',
            }}
        >The app experienced an error.</Text>
        <CustomTextButton
          text={"Reload"}
          onPress={() => this.setState({errorCaught: false})}
        />
      </PageContainer>
    }
  }
}
