import { RouteProp } from "@react-navigation/core";
import { CompositeNavigationProp } from "@react-navigation/native";
import { StackNavigationProp } from '@react-navigation/stack';
import React from "react";
import { StyleSheet, Text, View } from "react-native";
import CustomComponent from "../CustomComponents/CustomComponent";
import BloisIconButton from "../BloisComponents/BloisIconButton";
import { LoadingCover, BloisMenuBar, PageContainer, TextButton } from "../HelperFiles/CompIndex";
import { auth } from "../HelperFiles/Constants";
import { DefaultItemData, ItemData, UserData } from "../HelperFiles/DataTypes";
import { ClosetStackParamList, RootStackParamList, UserMainStackParamList } from "../HelperFiles/Navigation";
import { colors, icons, styleValues } from "../HelperFiles/StyleSheet";
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
                            width: styleValues.iconLargerSize,
                            borderRadius: styleValues.mediumPadding
                        }}
                        animationType={'shadowSmall'}
                    />
                    </View>
                    <BloisIconButton
                        name={"plus"}
                        type={"MaterialCommunityIcons"}
                        buttonStyle={{
                            marginTop: styleValues.mediumPadding,
                            backgroundColor: colors.background,
                            width: styleValues.iconLargerSize,
                            borderRadius: styleValues.mediumPadding
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
        <PageContainer
            headerText={"Account"}
        >
            {this.renderUI()}
            {this.renderLoading()}
        </PageContainer>
    );
    }
}

const styles = StyleSheet.create({

})