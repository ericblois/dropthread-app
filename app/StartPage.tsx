import { RouteProp } from "@react-navigation/core";
import { StackNavigationProp } from '@react-navigation/stack';
import { signInWithEmailAndPassword } from "firebase/auth";
import React from "react";
import { KeyboardAvoidingView, StyleSheet, Text, TextInput, View } from "react-native";
import CustomComponent from "./CustomComponents/CustomComponent";
import { IconButton, PageContainer, TextButton } from "./HelperFiles/CompIndex";
import { auth } from "./HelperFiles/Constants";
import { RootStackParamList } from "./HelperFiles/Navigation";
import { icons, styleValues, textStyles } from "./HelperFiles/StyleSheet";

type StartNavigationProp = StackNavigationProp<RootStackParamList, "start">;

type StartRouteProp = RouteProp<RootStackParamList, "start">;

type StartProps = {
    navigation: StartNavigationProp,
    route: StartRouteProp
}

type State = {
    userText: string,
    passText: string,
    responseText: string
}

export default class StartPage extends CustomComponent<StartProps, State> {

    constructor(props: StartProps) {
        super(props)
        this.state = {
            userText: "",
            passText: "",
            responseText: ""
        }
    }

    attemptSignin() {
        const user = this.state.userText;
        const pass = this.state.passText;
        this.setState({hideAll: true});
        signInWithEmailAndPassword(auth, user, pass).then(() => {
            this.props.navigation.navigate("userMain")
        },
        (e: any) => {
            console.error(e);
            this.setState({hideAll: false, responseText: "Invalid email/password."});
        })
    }

    renderLoginInput() {
        return (
            <KeyboardAvoidingView style={styles.signinContainer} behavior={"position"}>
                            <TextInput
                                style={styles.signinElement}
                                onChangeText={(text) => {
                                    this.setState({userText: text})
                                }}
                                placeholder={"Email"}
                                textAlign={"center"}
                                autoCapitalize={"none"}
                                autoCorrect={false}
                                textContentType={"emailAddress"}
                                autoComplete={"email"}
                                clearButtonMode={"while-editing"}
                            >
                                {this.state.userText}
                            </TextInput>
                        <TextInput
                            style={styles.signinElement}
                            onChangeText={(text) => {
                                this.setState({passText: text})
                            }}
                            placeholder={"Password"}
                            textAlign={"center"}
                            autoCapitalize={"none"}
                            autoCorrect={false}
                            textContentType={"password"}
                            autoComplete={"password"}
                            secureTextEntry={true}
                            clearButtonMode={"while-editing"}
                        >
                            {this.state.passText}
                        </TextInput>
                        <View style={{flexDirection: "row", justifyContent: "space-between", alignItems: "center"}}>
                            <IconButton
                                iconSource={icons.chevron}
                                iconStyle={{tintColor: "#fff"}}
                                buttonStyle={{marginBottom: styleValues.mediumPadding}}
                                buttonFunc={() => this.setState({showLogin: false, responseText: ""})}
                            />
                            <Text
                                style={{...textStyles.small, ...styles.responseText}}
                            >
                                {this.state.responseText}
                            </Text>
                            <IconButton
                                iconSource={icons.enter}
                                iconStyle={{tintColor: "#fff"}}
                                buttonStyle={{marginBottom: styleValues.mediumPadding}}
                                buttonFunc={() => this.attemptSignin()}
                            />
                        </View>
                </KeyboardAvoidingView>
        )
    }

  render() {
    return (
        <PageContainer>
            <TextButton
                text={"Go to main page"}
                buttonFunc={() => {
                    this.props.navigation.navigate("userMain")
                }}
            />
            <TextButton
                text={"Go to signup page"}
                buttonFunc={() => {
                    this.props.navigation.navigate("userSignup")
                }}
            />
            {this.renderLoginInput()}
        </PageContainer>
    );
  }
}

const styles = StyleSheet.create({
    signinContainer: {
        position: "absolute",
        bottom: "10%",
        width: styleValues.winWidth*2/3,
        alignItems: "center"
    },
    signinElement: {
        width: styleValues.winWidth*0.75,
        height: styleValues.winWidth/8,
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
        left: styleValues.winWidth*3/8,
        height: styleValues.winWidth/4,
        width: styleValues.winWidth/4,
        tintColor: "#fff"
    },
    background: {
        height: "100%",
        width: "100%"
    }
})