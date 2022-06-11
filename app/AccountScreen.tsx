import { RouteProp } from "@react-navigation/core";
import { StackNavigationProp } from '@react-navigation/stack';
import React from "react";
import { StyleSheet } from "react-native";
import CustomComponent from "./CustomComponents/CustomComponent";
import { AccountStack, UserMainStackParamList } from "./HelperFiles/Navigation";
import { AccountMainPage } from "./HelperFiles/PageIndex";

type AccountNavigationProp = StackNavigationProp<UserMainStackParamList, "account">;

type AccountRouteProp = RouteProp<UserMainStackParamList, "account">;

type AccountProps = {
    navigation: AccountNavigationProp,
    route: AccountRouteProp
}

type State = {
}

export default class AccountScreen extends CustomComponent<AccountProps, State> {

    constructor(props: AccountProps) {
        super(props)
        this.state = {

        }
    }

  render() {
    return (
            <AccountStack.Navigator
                screenOptions={{headerShown: false}}
                initialRouteName="main"
            >
                <AccountStack.Screen
                    name={"main"}
                    component={AccountMainPage}
                    
                />
            </AccountStack.Navigator>
    );
  }
}

const styles = StyleSheet.create({

})