import { Lato_400Regular, Lato_400Regular_Italic, Lato_700Bold } from '@expo-google-fonts/lato';
import { Poppins_400Regular, Poppins_400Regular_Italic, Poppins_500Medium, Poppins_700Bold } from '@expo-google-fonts/poppins';
import { Montserrat_400Regular, Montserrat_400Regular_Italic, Montserrat_500Medium, Montserrat_700Bold } from '@expo-google-fonts/montserrat';
import { Nunito_400Regular, Nunito_400Regular_Italic, Nunito_700Bold } from '@expo-google-fonts/nunito';
import { Roboto_400Regular, Roboto_400Regular_Italic, Roboto_700Bold } from '@expo-google-fonts/roboto';
import { RobotoSlab_400Regular, RobotoSlab_700Bold } from '@expo-google-fonts/roboto-slab';
import { Rubik_400Regular, Rubik_400Regular_Italic, Rubik_500Medium } from '@expo-google-fonts/rubik';
import { SourceSansPro_400Regular, SourceSansPro_400Regular_Italic, SourceSansPro_700Bold } from '@expo-google-fonts/source-sans-pro';
import { DefaultTheme, NavigationContainer } from "@react-navigation/native";
import * as Font from 'expo-font';
import React, { Component } from "react";
import { ActivityIndicator, LogBox, StatusBar } from "react-native";
import PageContainer from "./app/CustomComponents/PageContainer";
import { auth } from './app/HelperFiles/Constants';
import { RootStack } from "./app/HelperFiles/Navigation";
import StartPage from "./app/StartPage";
import UserMainStackScreen from "./app/UserMainScreen";
import UserSignupPage from "./app/UserSignupPage";

//LogBox.ignoreLogs(['Calling getNode()', 'VirtualizedLists should never be nested'])

interface Props {

}

interface State {
  fontsLoaded: boolean
}

export default class App extends Component<Props, State> {

  constructor(props: Props) {
    super(props)
    this.state = {
      fontsLoaded: false
    }
  }

  componentDidMount() {

    this.loadFonts()
  }

  async loadFonts() {
    try {
      await Font.loadAsync({
        SourceSansProRegular: SourceSansPro_400Regular,
        SourceSansProItalic: SourceSansPro_400Regular_Italic,
        SourceSansProBold: SourceSansPro_700Bold,
        RubikRegular: Rubik_400Regular,
        RubikItalic: Rubik_400Regular_Italic,
        RubikBold: Rubik_500Medium,
        LatoRegular: Lato_400Regular,
        LatoItalic: Lato_400Regular_Italic,
        LatoBold: Lato_700Bold,
        NunitoRegular: Nunito_400Regular,
        NunitoItalic: Nunito_400Regular_Italic,
        NunitoBold: Nunito_700Bold,
        RobotoRegular: Roboto_400Regular,
        RobotoItalic: Roboto_400Regular_Italic,
        RobotoBold: Roboto_700Bold,
        MontserratRegular: Montserrat_400Regular,
        MontserratMedium: Montserrat_500Medium,
        MontserratItalic: Montserrat_400Regular_Italic,
        MontserratBold: Montserrat_700Bold,
        RobotoSlabRegular: RobotoSlab_400Regular,
        RobotoSlabBold: RobotoSlab_700Bold,
        PoppinsRegular: Poppins_400Regular,
        PoppinsItalic: Poppins_400Regular_Italic,
        PoppinsMedium: Poppins_500Medium,
        PoppinsBold: Poppins_700Bold 
      })
      this.setState({fontsLoaded: true})
    } catch (e) {
      console.error(e)
    }
  }

  render() {
    if (this.state.fontsLoaded) {
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
          >
              <RootStack.Navigator
                initialRouteName={auth.currentUser ? "userMain" : "start"}
                screenOptions={{
                  headerShown: false,
                }}
              >
                <RootStack.Screen
                  name={"start"}
                  component={StartPage}
                />
                <RootStack.Screen
                  name={"userMain"}
                  component={UserMainStackScreen}
                />
                <RootStack.Screen
                  name={"userSignup"}
                  component={UserSignupPage}
                />
              </RootStack.Navigator>
          </NavigationContainer>
        </>
      );
    } else {
      return (
        <PageContainer>
          <ActivityIndicator
            size={"large"}
          />
        </PageContainer>
      )
    }
  }
}
