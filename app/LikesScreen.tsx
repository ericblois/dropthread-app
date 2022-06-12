import { RouteProp } from "@react-navigation/core";
import { StackNavigationProp } from '@react-navigation/stack';
import React from "react";
import { StyleSheet } from "react-native";
import CustomComponent from "./CustomComponents/CustomComponent";
import { LikesStack, UserMainStackParamList } from "./HelperFiles/Navigation";
import { LikesMainPage } from "./HelperFiles/PageIndex";

type LikesNavigationProp = StackNavigationProp<UserMainStackParamList, "likes">;

type LikesRouteProp = RouteProp<UserMainStackParamList, "likes">;

type LikesProps = {
    navigation: LikesNavigationProp,
    route: LikesRouteProp
}

type State = {
}

export default class LikesScreen extends CustomComponent<LikesProps, State> {

    constructor(props: LikesProps) {
        super(props)
        this.state = {

        }
    }

  render() {
    return (
            <LikesStack.Navigator
                screenOptions={{headerShown: false}}
                initialRouteName="main"
            >
                <LikesStack.Screen
                    name={"main"}
                    component={LikesMainPage}
                    
                />
            </LikesStack.Navigator>
    );
  }
}

const styles = StyleSheet.create({

})