import { Lato_400Regular, Lato_400Regular_Italic, Lato_700Bold } from '@expo-google-fonts/lato';
import { Poppins_400Regular, Poppins_400Regular_Italic, Poppins_500Medium, Poppins_700Bold } from '@expo-google-fonts/poppins';
import { Montserrat_400Regular, Montserrat_400Regular_Italic, Montserrat_500Medium, Montserrat_700Bold } from '@expo-google-fonts/montserrat';
import { Nunito_400Regular, Nunito_400Regular_Italic, Nunito_700Bold } from '@expo-google-fonts/nunito';
import { Roboto_400Regular, Roboto_400Regular_Italic, Roboto_700Bold } from '@expo-google-fonts/roboto';
import { RobotoSlab_400Regular, RobotoSlab_700Bold } from '@expo-google-fonts/roboto-slab';
import { Rubik_400Regular, Rubik_400Regular_Italic, Rubik_500Medium } from '@expo-google-fonts/rubik';
import { SourceSansPro_400Regular, SourceSansPro_400Regular_Italic, SourceSansPro_700Bold } from '@expo-google-fonts/source-sans-pro';
import * as Font from 'expo-font';
import { RouteProp } from "@react-navigation/core";
import { StackNavigationProp } from '@react-navigation/stack';
import { signInWithEmailAndPassword } from "firebase/auth";
import React from "react";
import { AppState, KeyboardAvoidingView, StyleSheet, Text, TextInput, View } from "react-native";
import CustomComponent from "../CustomComponents/CustomComponent";
import { CustomImage, CustomImageButton, BloisTextButton, BloisPage, TextButton } from "../HelperFiles/CompIndex";
import { auth } from "../HelperFiles/Constants";
import { RootStackParamList } from "../HelperFiles/Navigation";
import { defaultStyles, fonts, icons, screenWidth, styleValues, textStyles } from "../HelperFiles/StyleSheet";
import AppUtils from "../HelperFiles/AppUtils"
import FastImage from "react-native-fast-image";
import { BlurView } from "expo-blur";
import User from "../HelperFiles/User"
import { EventArg, StackNavigationState } from '@react-navigation/native';

type EntryNavigationProp = StackNavigationProp<RootStackParamList, "entry">;

type EntryRouteProp = RouteProp<RootStackParamList, "entry">;

type EntryProps = {
    navigation: EntryNavigationProp,
    route: EntryRouteProp
}

type State = {
    fontsLoaded: boolean
}

export default class EntryLoadingPage extends CustomComponent<EntryProps, State> {

    constructor(props: EntryProps) {
        super(props)
        this.state = {
            fontsLoaded: false
        }
    }

    componentDidMount() {
        this.entryInit();
    }

    async entryInit() {
        // Listener for when app is opened from background
        AppState.addEventListener('change', async (state) => {
            if (state === 'active') {
                if (!await AppUtils.hasLocationPermission()) {
                    this.props.navigation.navigate('geoPerm');
                }
                try {
                    await User.getCurrent()
                } catch {
                    this.props.navigation.navigate('start');
                }
            }
        })
        // Load fonts BEFORE navigation listener
        await this.loadFonts();
        // This is run whenever the app is freshly opened or this page is navigated to
        this.props.navigation.addListener('state', async (e) => {
            const routes = e.data.state.routes
            if (routes[routes.length - 1].name === 'entry') {
                try {
                    const user = User.getCurrent()
                    await user.reload()
                    this.props.navigation.navigate('userMain');
                } catch {
                    this.props.navigation.navigate('start');
                }
            }
        })
        // Initial behaviour
        if (!await AppUtils.hasLocationPermission()) {
            this.props.navigation.navigate('geoPerm');
        }
        try {
            const user = User.getCurrent()
            await user.reload()
            this.props.navigation.navigate('userMain');
        } catch {
            this.props.navigation.navigate('start');
        }
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
          this.setState({fontsLoaded: true});
        } catch (e) {
          console.error(e)
        }
      }

    render() {
        return (
            <BloisPage style={{justifyContent: 'center'}}>
                    <FastImage
                        source={require("../../assets/entryBackground.jpg")}
                        resizeMode="cover"
                        style={{
                            ...defaultStyles.fill,
                        }}
                    />
                    <Text
                        style={{
                            ...textStyles.largerst,
                            // Fonts may not be loaded yet when this is rendered
                            fontFamily: Font.isLoaded(fonts.bold) ? fonts.bold : undefined,
                            alignSelf: 'center',
                        }}
                    >dropcloset</Text>
            </BloisPage>
        );
    }
}

const styles = StyleSheet.create({
    signinContainer: {
        position: "absolute",
        bottom: "10%",
        width: screenWidth*2/3,
        alignItems: "center"
    },
    signinElement: {
        width: screenWidth*0.75,
        height: screenWidth/8,
        backgroundColor: "#fff",
        borderWidth: 2,
        borderColor: "#e34f4f",
        borderRadius: styleValues.mediumPadding,
        marginBottom: styleValues.mediumPadding
    },
    buttonText: {
        color: "#ff7070",
        fontSize: styleValues.mediumTextSize,
    },
    responseText: {
        color: "#fff",
        height: styleValues.iconMediumSize,
    },
    logo: {
        position: "absolute",
        top: "20%",
        left: screenWidth*3/8,
        height: screenWidth/4,
        width: screenWidth/4,
        tintColor: "#fff"
    },
    background: {
        height: "100%",
        width: "100%"
    }
})