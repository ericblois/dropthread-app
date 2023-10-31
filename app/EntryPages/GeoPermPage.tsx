import { RouteProp } from "@react-navigation/core";
import { StackNavigationProp } from '@react-navigation/stack';
import { signInWithEmailAndPassword } from "firebase/auth";
import React from "react";
import { KeyboardAvoidingView, StyleSheet, Text, TextInput, View } from "react-native";
import CustomComponent from "../CustomComponents/CustomComponent";
import { CustomImageButton, BloisTextButton, BloisPage, TextButton } from "../HelperFiles/CompIndex";
import { auth } from "../HelperFiles/Constants";
import { RootStackParamList } from "../HelperFiles/Navigation";
import { icons, screenWidth, styleValues, textStyles } from "../HelperFiles/StyleSheet";
import AppUtils from "../HelperFiles/AppUtils"
import * as Location from "expo-location"

type StartNavigationProp = StackNavigationProp<RootStackParamList, "geoPerm">;

type StartRouteProp = RouteProp<RootStackParamList, "geoPerm">;

type StartProps = {
    navigation: StartNavigationProp,
    route: StartRouteProp
}

type State = {
    permDenied: boolean,
}

export default class GeoPermPage extends CustomComponent<StartProps, State> {

    constructor(props: StartProps) {
        super(props)
        this.state = {
            permDenied: false
        }
    }

    render() {
        return (
            <BloisPage style={{justifyContent: 'center'}}>
                <Text style={textStyles.largeHeader}>Location services are required to be enabled for this app.</Text>
                {this.state.permDenied ? 
                <Text style={textStyles.medium}>{"Please enable location services in Settings > dropcloset > Location services."}</Text>
                : 
                <BloisTextButton
                    text={"Click here to request location permissions!"}
                    onPress={async () => {
                        const result = await AppUtils.requestLocationPermission()
                        if (result) {
                            this.props.navigation.goBack();
                        } else {
                            this.setState({permDenied: true})
                        }
                    }}
                />
                }
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