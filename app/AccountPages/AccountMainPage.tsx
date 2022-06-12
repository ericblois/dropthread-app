import { RouteProp } from "@react-navigation/core";
import { CompositeNavigationProp } from "@react-navigation/native";
import { StackNavigationProp } from '@react-navigation/stack';
import React from "react";
import { StyleSheet, Text } from "react-native";
import CustomComponent from "../CustomComponents/CustomComponent";
import { LoadingCover, MenuBar, PageContainer, TextButton } from "../HelperFiles/CompIndex";
import { auth } from "../HelperFiles/Constants";
import { DefaultItemData, ItemData, UserData } from "../HelperFiles/DataTypes";
import { ClosetStackParamList, RootStackParamList, UserMainStackParamList } from "../HelperFiles/Navigation";
import { colors, icons } from "../HelperFiles/StyleSheet";
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
            buttonFunc={() => {
                const newItemData: ItemData = {...DefaultItemData}
                this.props.navigation.navigate("editItem", {
                    itemData: newItemData,
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
                        text={"signout"}
                        showLoading
                        buttonFunc={async () => await auth.signOut()}
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
        <PageContainer>
            {this.renderUI()}
            {this.renderLoading()}
            <MenuBar
                buttonProps={[
                {
                    iconSource: icons.shoppingBag,
                    buttonFunc: () => this.props.navigation.navigate("browse")
                },
                {
                    iconSource: icons.hollowHeart,
                    buttonFunc: () => this.props.navigation.navigate("likes")
                },
                {
                    iconSource: icons.closet,
                    buttonFunc: () => this.props.navigation.navigate("closet")
                },
                {
                    iconSource: icons.profile,
                    iconStyle: {tintColor: colors.main},
                },
                ]}
            
            />
        </PageContainer>
    );
    }
}

const styles = StyleSheet.create({

})