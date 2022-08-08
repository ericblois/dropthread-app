import { RouteProp } from "@react-navigation/core";
import { StackNavigationProp } from '@react-navigation/stack';
import React from "react";
import { StyleSheet } from "react-native";
import ClosetItemInfoPage from "./ClosetPages/ClosetItemInfoPage";
import ClosetMainPage from "./ClosetPages/ClosetMainPage";
import EditItemPage from "./ClosetPages/EditItemPage";
import ItemSwapsPage from "./ClosetPages/ItemSwapsPage";
import CustomComponent from "./CustomComponents/CustomComponent";
import { ClosetStack, UserMainStackParamList } from "./HelperFiles/Navigation";

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
                screenListeners={{
                    focus: (e) => {
                        if (e.target) {
                            const name = e.target.substring(0, e.target.indexOf('-'))
                            if (name === 'main') {
                                this.props.navigation.setOptions({headerShown: true})
                            } else {
                                this.props.navigation.setOptions({headerShown: false})
                            }
                        }
                    }
                }}
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