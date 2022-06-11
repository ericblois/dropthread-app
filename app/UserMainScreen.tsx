import { RouteProp } from "@react-navigation/core";
import { StackNavigationProp } from '@react-navigation/stack';
import React from "react";
import { StyleSheet } from "react-native";
import AccountScreen from "./AccountScreen";
import ClosetScreen from "./ClosetScreen";
import CustomComponent from "./CustomComponents/CustomComponent";
import { RootStackParamList, UserMainStack } from "./HelperFiles/Navigation";
import { BrowsePage, SearchPage } from "./HelperFiles/PageIndex";

type UserMainNavigationProp = StackNavigationProp<RootStackParamList, "userMain">;

type UserMainRouteProp = RouteProp<RootStackParamList, "userMain">;

type UserMainProps = {
    navigation: UserMainNavigationProp,
    route: UserMainRouteProp
}

type State = {
}

export default class UserMainScreen extends CustomComponent<UserMainProps, State> {

    constructor(props: UserMainProps) {
        super(props)
        this.state = {

        }
    }

  render() {
    return (
            <UserMainStack.Navigator
                screenOptions={{
                    headerShown: false,
                    animationEnabled: false
                }}
                initialRouteName={"browse"}
            >
                <UserMainStack.Screen
                    name={"search"}
                    component={SearchPage}
                />
                <UserMainStack.Screen
                    name={"browse"}
                    component={BrowsePage}
                />
                <UserMainStack.Screen
                    name={"closet"}
                    component={ClosetScreen}
                    
                />
                <UserMainStack.Screen
                    name={"account"}
                    component={AccountScreen}
                    
                />
            </UserMainStack.Navigator>
    );
  }
}

const styles = StyleSheet.create({

})