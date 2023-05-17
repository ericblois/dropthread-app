import { RouteProp } from "@react-navigation/core";
import { StackNavigationProp } from '@react-navigation/stack';
import React from "react";
import { StyleSheet, View } from "react-native";
import AccountScreen from "./AccountScreen";
import ClosetScreen from "./ClosetScreen";
import CustomComponent from "./CustomComponents/CustomComponent";
import { RootStackParamList, UserMainStack } from "./HelperFiles/Navigation";
import { subscribeNotifications } from "./HelperFiles/Notifications";
import ExchangesScreen from "./ExchangesScreen";
import ViewItemsPage from "./UserMainPages/ViewItemsPage";
import * as Notifications from 'expo-notifications'
import BrowsePage from "./UserMainPages/BrowsePage";
import CreateOfferPage from "./UserMainPages/CreateOfferPage";
import MenuBar from "./CustomComponents/MenuBar";
import { bottomInset, colors, displayHeight, icons, screenHeight, screenWidth, styleValues } from "./HelperFiles/StyleSheet";
import EditOfferPage from "./UserMainPages/EditOfferPage";

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

    componentDidMount() {
        subscribeNotifications()
        Notifications.addNotificationReceivedListener((event) => {
            console.log(event.request)
        })
        super.componentDidMount()
    }

  render() {
    return (
            <UserMainStack.Navigator
                screenOptions={{
                    header: (props) => {
                        //console.log(props.route)
                        if (['browse', 'exchanges', 'closet', 'account'].includes(props.route.name)) {
                            return (
                            <MenuBar
                                menuBarStyle={{
                                    bottom: undefined,
                                    top: displayHeight - bottomInset - styleValues.mediumHeight - styleValues.mediumPadding
                                }}
                                buttonProps={[
                                    {
                                    iconSource: icons.shoppingBag,
                                    iconStyle: {
                                        tintColor: props.route.name === 'browse' ? colors.main : colors.darkGrey
                                    },
                                    onPress: () => {
                                        if (props.route.name !== 'browse') {
                                            props.navigation.navigate('browse')
                                        }
                                    }
                                    },
                                    {
                                    iconSource: icons.hollowHeart,
                                    iconStyle: {
                                        tintColor: props.route.name === 'exchanges' ? colors.main : colors.darkGrey
                                    },
                                    onPress: () => {
                                        if (props.route.name !== 'exchanges') {
                                            props.navigation.navigate('exchanges')
                                        }
                                    }
                                    },
                                    {
                                    iconSource: icons.closet,
                                    iconStyle: {
                                        tintColor: props.route.name === 'closet' ? colors.main : colors.darkGrey
                                    },
                                    onPress: () => {
                                        if (props.route.name !== 'closet') {
                                            props.navigation.navigate('closet')
                                        }
                                    }
                                    },
                                    {
                                    iconSource: icons.profile,
                                    iconStyle: {
                                        tintColor: props.route.name === 'account' ? colors.main : colors.darkGrey
                                    },
                                    onPress: () => {
                                        if (props.route.name !== 'account') {
                                            props.navigation.navigate('account')
                                        }
                                    }
                                    },
                                ]}
                            />
                            )
                        }
                    },
                    headerStyle: {
                        bottom: bottomInset
                    },
                    animationEnabled: false
                }}
                initialRouteName={"browse"}
            >
                <UserMainStack.Screen
                    name={"browse"}
                >
                    {props => <BrowsePage {...props} refreshOnNavigate={false}/>}
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

const styles = StyleSheet.create({

})