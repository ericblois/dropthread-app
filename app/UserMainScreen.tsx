import { RouteProp } from "@react-navigation/core";
import { StackNavigationProp } from "@react-navigation/stack";
import React from "react";
import { StyleSheet, View } from "react-native";
import AccountScreen from "./AccountScreen";
import ClosetScreen from "./ClosetScreen";
import CustomComponent from "./CustomComponents/CustomComponent";
import { RootStackParamList, UserMainStack } from "./HelperFiles/Navigation";
import { subscribeNotifications } from "./HelperFiles/Notifications";
import ExchangesScreen from "./ExchangesScreen";
import ViewItemsPage from "./UserMainPages/ViewItemsPage";
import * as Notifications from "expo-notifications";
import BrowsePage from "./UserMainPages/BrowsePage";
import CreateOfferPage from "./UserMainPages/CreateOfferPage";
import BloisMenuBar from "./BloisComponents/BloisMenuBar";
import {
    bottomInset,
    colors,
    displayHeight,
    icons,
    screenHeight,
    screenWidth,
    styVals,
} from "./HelperFiles/StyleSheet";
import EditOfferPage from "./UserMainPages/EditOfferPage";

type UserMainNavigationProp = StackNavigationProp<
    RootStackParamList,
    "userMain"
>;

type UserMainRouteProp = RouteProp<RootStackParamList, "userMain">;

type UserMainProps = {
    navigation: UserMainNavigationProp;
    route: UserMainRouteProp;
};

type State = {};

export default class UserMainScreen extends CustomComponent<
    UserMainProps,
    State
> {
    constructor(props: UserMainProps) {
        super(props);
        this.state = {};
    }

    componentDidMount() {
        subscribeNotifications();
        Notifications.addNotificationReceivedListener((event) => {
            console.log(event.request);
        });
        super.componentDidMount();
    }

    render() {
        return (
            <UserMainStack.Navigator
                screenOptions={{
                    header: (props) => {
                        //console.log(props.route)
                        if (
                            [
                                "browse",
                                "exchanges",
                                "closet",
                                "account",
                            ].includes(props.route.name)
                        ) {
                            return (
                                <BloisMenuBar
                                    menuBarStyle={{
                                        bottom: undefined,
                                        top:
                                            displayHeight -
                                            bottomInset -
                                            styVals.mediumHeight -
                                            styVals.mediumPadding,
                                    }}
                                    buttons={[
                                        {
                                            icon: {
                                                type: "MaterialCommunityIcons",
                                                name: "shopping-search",
                                            },
                                            iconStyle: {
                                                color: props.route.name === "browse" ? colors.valid : colors.darkGrey
                                            },
                                            onPress: () => {
                                                if (
                                                    props.route.name !==
                                                    "browse"
                                                ) {
                                                    props.navigation.navigate(
                                                        "browse"
                                                    );
                                                }
                                            },
                                        },
                                        {
                                            icon: {
                                                type: "MaterialCommunityIcons",
                                                name: "handshake-outline",
                                            },
                                            iconStyle: {
                                                color: props.route.name === "exchanges" ? colors.valid : colors.darkGrey
                                            },
                                            onPress: () => {
                                                if (
                                                    props.route.name !==
                                                    "exchanges"
                                                ) {
                                                    props.navigation.navigate(
                                                        "exchanges"
                                                    );
                                                }
                                            },
                                        },
                                        {
                                            icon: {
                                                type: "MaterialCommunityIcons",
                                                name: "hanger",
                                            },
                                            iconStyle: {
                                                color: props.route.name === "closet" ? colors.valid : colors.darkGrey
                                            },
                                            onPress: () => {
                                                if (
                                                    props.route.name !==
                                                    "closet"
                                                ) {
                                                    props.navigation.navigate(
                                                        "closet"
                                                    );
                                                }
                                            },
                                        },
                                        {
                                            icon: {
                                                type: "Ionicons",
                                                name: "person-circle-outline",
                                            },
                                            iconStyle: {
                                                color: props.route.name === "account" ? colors.valid : colors.darkGrey
                                            },
                                            onPress: () => {
                                                if (
                                                    props.route.name !==
                                                    "account"
                                                ) {
                                                    props.navigation.navigate(
                                                        "account"
                                                    );
                                                }
                                            },
                                        },
                                    ]}
                                />
                            );
                        }
                    },
                    headerStyle: {
                        bottom: bottomInset,
                    },
                    animationEnabled: false,
                }}
                initialRouteName={"browse"}
            >
                <UserMainStack.Screen name={"browse"}>
                    {(props) => (
                        <BrowsePage {...props} refreshOnNavigate={false} />
                    )}
                </UserMainStack.Screen>
                <UserMainStack.Screen
                    name={"exchanges"}
                    component={ExchangesScreen}
                />
                <UserMainStack.Screen
                    name={"closet"}
                    component={ClosetScreen}
                />
                <UserMainStack.Screen
                    name={"account"}
                    component={AccountScreen}
                />
                <UserMainStack.Screen
                    name={"viewItems"}
                    component={ViewItemsPage}
                    options={{
                        animationEnabled: true
                    }}
                />
                <UserMainStack.Screen
                    name={"createOffer"}
                    component={CreateOfferPage}
                />
                <UserMainStack.Screen
                    name={"editOffer"}
                    component={EditOfferPage}
                />
            </UserMainStack.Navigator>
        );
    }
}

const styles = StyleSheet.create({});
