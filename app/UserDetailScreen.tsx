import { RouteProp } from "@react-navigation/core";
import { StackNavigationProp } from '@react-navigation/stack';
import React from "react";
import { StyleSheet, View } from "react-native";
import AccountScreen from "./AccountScreen";
import ClosetScreen from "./ClosetScreen";
import CustomComponent from "./CustomComponents/CustomComponent";
import { RootStackParamList, UserDetailStack } from "./HelperFiles/Navigation";
import { subscribeNotifications } from "./HelperFiles/Notifications";
import ExchangesScreen from "./ExchangesScreen";
import ViewItemsPage from "./UserMainPages/ViewItemsPage";
import * as Notifications from 'expo-notifications'
import BrowsePage from "./UserMainPages/BrowsePage";
import EditOfferPage from "./UserMainPages/EditOfferPage";
import MenuBar from "./CustomComponents/MenuBar";
import { bottomInset, colors, displayHeight, icons, screenHeight, screenWidth, styleValues } from "./HelperFiles/StyleSheet";
import ViewOfferPage from "./UserDetailPages/ViewOfferPage";

type UserDetailNavigationProp = StackNavigationProp<RootStackParamList, "userDetail">;

type UserDetailRouteProp = RouteProp<RootStackParamList, "userDetail">;

type UserDetailProps = {
    navigation: UserDetailNavigationProp,
    route: UserDetailRouteProp
}

type State = {
}
// This class is used fro presenting pages that provide more detail about something than the main user screen would
export default class UserDetailScreen extends CustomComponent<UserDetailProps, State> {

    constructor(props: UserDetailProps) {
        super(props)
        this.state = {

        }
    }

  render() {
    return (
            <UserDetailStack.Navigator
                screenOptions={{
                    headerShown: false
                }}
                initialRouteName={"viewOffer"}
            >
                <UserDetailStack.Screen
                    name={"viewOffer"}
                    component={ViewOfferPage}
                    options={{
                        animationEnabled: false
                    }}
                />
            </UserDetailStack.Navigator>
    );
  }
}

const styles = StyleSheet.create({

})