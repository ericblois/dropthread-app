import { RouteProp } from "@react-navigation/core";
import { StackNavigationProp } from "@react-navigation/stack";
import { CommonActions } from "@react-navigation/native";
import { signInWithEmailAndPassword, createUserWithEmailAndPassword } from "firebase/auth";
import React from "react";
import {
    KeyboardAvoidingView,
    StyleSheet,
    Text,
    TextInput,
    View,
} from "react-native";
import CustomComponent from "./CustomComponents/CustomComponent";
import {
    BloisBadge,
    BloisTextButton,
    BloisTextInput,
    CustomImageButton,
    PageContainer,
    TextButton,
} from "./HelperFiles/CompIndex";
import { auth } from "./HelperFiles/Constants";
import { RootStackParamList } from "./HelperFiles/Navigation";
import {
    icons,
    screenWidth,
    styleValues,
    textStyles,
} from "./HelperFiles/StyleSheet";
import BloisIconButton from "./BloisComponents/BloisIconButton";

type StartNavigationProp = StackNavigationProp<RootStackParamList, "start">;

type StartRouteProp = RouteProp<RootStackParamList, "start">;

type StartProps = {
    navigation: StartNavigationProp;
    route: StartRouteProp;
};

type State = {
    userText: string;
    passText: string;
    responseText: string;
};

export default class StartPage extends CustomComponent<StartProps, State> {
    constructor(props: StartProps) {
        super(props);
        this.state = {
            userText: "",
            passText: "",
            responseText: "",
        };
        /*props.navigation.addListener('state', (e) => {
            const routes = e.data.state.routes
            if (routes[routes.length - 1].name === 'start' && routes.length > 1) {
                props.navigation.dispatch(
                    CommonActions.reset({routes: [{
                            name: routes[routes.length - 1].name,
                            key: routes[routes.length - 1].key,
                            params: routes[routes.length - 1].params
                    }]})
                )
            }
        })*/
    }

    attemptSignin() {
        const user = this.state.userText;
        const pass = this.state.passText;
        this.setState({ hideAll: true });
        signInWithEmailAndPassword(auth, user, pass).then(
            () => {
                this.props.navigation.navigate("userMain");
            },
            (e: any) => {
                if (__DEV__) {
                    createUserWithEmailAndPassword(auth, user, pass)
                }
                console.error(e);
                this.setState({
                    hideAll: false,
                    responseText: "Invalid email/password.",
                });
            }
        );
    }

    renderLoginInput() {
        return (
            <KeyboardAvoidingView
                style={styles.signinContainer}
                behavior={"position"}
            >
                <TextInput
                    style={styles.signinElement}
                    onChangeText={(text) => {
                        this.setState({ userText: text });
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
                        this.setState({ passText: text });
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
                <View
                    style={{
                        flexDirection: "row",
                        justifyContent: "space-between",
                        alignItems: "center",
                    }}
                >
                    <CustomImageButton
                        iconSource={icons.chevron}
                        iconStyle={{ tintColor: "#fff" }}
                        buttonStyle={{
                            marginBottom: styleValues.mediumPadding,
                        }}
                        onPress={() =>
                            this.setState({
                                showLogin: false,
                                responseText: "",
                            })
                        }
                    />
                    <Text
                        style={{ ...textStyles.small, ...styles.responseText }}
                    >
                        {this.state.responseText}
                    </Text>
                    <CustomImageButton
                        iconSource={icons.enter}
                        iconStyle={{ tintColor: "#fff" }}
                        buttonStyle={{
                            marginBottom: styleValues.mediumPadding,
                        }}
                        onPress={() => this.attemptSignin()}
                    />
                </View>
            </KeyboardAvoidingView>
        );
    }

    render() {
        return (
            <PageContainer>
                <BloisTextButton
                    text={"Go to main page (Tester1)"}
                    onPress={() => {
                        this.setState(
                            {
                                userText: "test@example.com",
                                passText: "asdfasdf",
                            },
                            () => {
                                this.attemptSignin()
                            }
                        );
                    }}
                />
                <BloisTextButton
                    text={"Go to main page (Tester2)"}
                    onPress={() => {
                        this.setState(
                            {
                                userText: "test2@example.com",
                                passText: "asdfasdf",
                            },
                            () => {
                                this.attemptSignin();
                            }
                        );
                    }}
                />
                <BloisTextButton
                    text={"Go to main page (Tester3)"}
                    onPress={() => {
                        this.setState(
                            {
                                userText: "test3@example.com",
                                passText: "asdfasdf",
                            },
                            () => {
                                this.attemptSignin();
                            }
                        );
                    }}
                />
                <BloisTextButton
                    text={"Go to signup page"}
                    onPress={() => {
                        this.props.navigation.navigate("userSignup");
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
        width: (screenWidth * 2) / 3,
        alignItems: "center",
    },
    signinElement: {
        width: screenWidth * 0.75,
        height: screenWidth / 8,
        backgroundColor: "#fff",
        borderWidth: 2,
        borderColor: "#e34f4f",
        borderRadius: styleValues.mediumPadding,
        marginBottom: styleValues.mediumPadding,
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
        left: (screenWidth * 3) / 8,
        height: screenWidth / 4,
        width: screenWidth / 4,
        tintColor: "#fff",
    },
    background: {
        height: "100%",
        width: "100%",
    },
});
