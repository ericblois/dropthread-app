import { RouteProp } from "@react-navigation/core";
import { CompositeNavigationProp } from "@react-navigation/native";
import { StackNavigationProp } from '@react-navigation/stack';
import React from "react";
import { StyleSheet, Text, View } from "react-native";
import CustomComponent from "../CustomComponents/CustomComponent";
import BloisIconButton from "../BloisComponents/BloisIconButton";
import { LoadingCover, BloisMenuBar, BloisPage, TextButton } from "../HelperFiles/CompIndex";
import { auth } from "../HelperFiles/Constants";
import { DefaultItemData, ItemData, UserData } from "../HelperFiles/DataTypes";
import { ClosetStackParamList, RootStackParamList, UserMainStackParamList } from "../HelperFiles/Navigation";
import { colors, icons, styVals } from "../HelperFiles/StyleSheet";
import User from "../HelperFiles/User";

type AccountMainNavigationProp = CompositeNavigationProp<
    StackNavigationProp<ClosetStackParamList, "main">,
    CompositeNavigationProp<
        StackNavigationProp<UserMainStackParamList, "account">,
        StackNavigationProp<RootStackParamList>
    >
>

type AccountMainRouteProp = RouteProp<ClosetStackParamList, "main">;

type AccountMainProps = {
    navigation: AccountMainNavigationProp,
    route: AccountMainRouteProp
}

type State = {
    userData?: UserData,
    imagesLoaded: boolean,
}

export default class AccountMainPage extends CustomComponent<AccountMainProps, State> {

    constructor(props: AccountMainProps) {
        super(props)
        this.state = {
            userData: undefined,
            imagesLoaded: true,
        }
    }

    async refreshData() {
        const userData = await User.get()
        this.setState({userData: userData})
    }

    renderViewLikesButton() {
        return (
          <TextButton
            text={"View liked items"}
            onPress={() => {
                const newItemData: ItemData = {...DefaultItemData}
                this.props.navigation.navigate("editItem", {
                    itemID: newItemData.itemID,
                    isNew: true
                })
            }}
          />
        )
      }
    
    renderUI() {
        if (this.state.userData) {
            return (
                <>
                    <Text>Account main</Text>
                    {this.renderViewLikesButton()}
                    <TextButton
                        text={"Log Out"}
                        showLoading
                        onPress={async () => {
                            await auth.signOut()
                            this.props.navigation.reset({
                                routes: [{
                                    name: 'entry'
                                }]
                            })
                            //this.props.navigation.navigate('start')
                        }}
                    />
                    <View
                        style={{
                            width: 200,
                            height: 200,
                            backgroundColor: colors.lightGrey,
                            alignItems: 'center',
                            justifyContent: 'center'
                        }}
                    >
                    <BloisIconButton
                        name={"plus"}
                        type={"MaterialCommunityIcons"}
                        buttonStyle={{
                            backgroundColor: colors.lightGrey,
                            width: styVals.iconLargerSize,
                            borderRadius: styVals.mediumPadding
                        }}
                        animationType={'shadowSmall'}
                    />
                    </View>
                    <BloisIconButton
                        name={"plus"}
                        type={"MaterialCommunityIcons"}
                        buttonStyle={{
                            marginTop: styVals.mediumPadding,
                            backgroundColor: colors.background,
                            width: styVals.iconLargerSize,
                            borderRadius: styVals.mediumPadding
                        }}
                        animationType={'shadowSmall'}
                    />
                </>
            )
        }
    }

    renderLoading() {
        if (this.state.userData === undefined) {
            return (
              <LoadingCover size={"large"}/>
            )
          }
    }

    render() {
    return (
        <BloisPage
            headerText={"Account"}
        >
            {this.renderUI()}
            {this.renderLoading()}
        </BloisPage>
    );
    }
}

const styles = StyleSheet.create({

})