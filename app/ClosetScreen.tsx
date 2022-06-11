import { RouteProp } from "@react-navigation/core";
import { StackNavigationProp } from '@react-navigation/stack';
import React from "react";
import { StyleSheet } from "react-native";
import CustomComponent from "./CustomComponents/CustomComponent";
import { ClosetStack, UserMainStackParamList } from "./HelperFiles/Navigation";
import { ClosetItemInfoPage, ClosetMainPage, EditItemPage, ItemSwapsPage } from "./HelperFiles/PageIndex";

type ClosetNavigationProp = StackNavigationProp<UserMainStackParamList, "closet">;

type ClosetRouteProp = RouteProp<UserMainStackParamList, "closet">;

type ClosetProps = {
    navigation: ClosetNavigationProp,
    route: ClosetRouteProp
}

type State = {
}

export default class ClosetScreen extends CustomComponent<ClosetProps, State> {

    constructor(props: ClosetProps) {
        super(props)
        this.state = {

        }
    }

  render() {
    return (
            <ClosetStack.Navigator
                screenOptions={{headerShown: false}}
                initialRouteName="main"
            >
                <ClosetStack.Screen
                    name={"main"}
                    component={ClosetMainPage}
                    
                />
                <ClosetStack.Screen
                    name={"editItem"}
                    component={EditItemPage}
                    
                />
                <ClosetStack.Screen
                    name={"itemInfo"}
                    component={ClosetItemInfoPage}
                    
                />
                <ClosetStack.Screen
                    name={"itemSwaps"}
                    component={ItemSwapsPage}
                    
                />
            </ClosetStack.Navigator>
    );
  }
}

const styles = StyleSheet.create({

})