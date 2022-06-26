import { RouteProp } from "@react-navigation/core";
import { CompositeNavigationProp } from "@react-navigation/native";
import { StackNavigationProp } from '@react-navigation/stack';
import React from "react";
import { StyleSheet } from "react-native";
import CustomComponent from "../CustomComponents/CustomComponent";
import { ItemLikedCard, LoadingCover, MenuBar, PageContainer, ScrollContainer } from "../HelperFiles/CompIndex";
import { ItemInfo, UserData } from "../HelperFiles/DataTypes";
import Item from "../HelperFiles/Item";
import { LikesStackParamList, UserMainStackParamList } from "../HelperFiles/Navigation";
import { colors, icons } from "../HelperFiles/StyleSheet";
import User from "../HelperFiles/User";

type LikesMainNavigationProp = CompositeNavigationProp<
    StackNavigationProp<LikesStackParamList, "main">,
    StackNavigationProp<UserMainStackParamList>
>

type LikesMainRouteProp = RouteProp<LikesStackParamList, "main">;

type LikesMainProps = {
    navigation: LikesMainNavigationProp,
    route: LikesMainRouteProp
}

type State = {
    userData?: UserData,
    itemsInfo?: ItemInfo[],
    imagesLoaded: boolean
}

export default class LikesMainPage extends CustomComponent<LikesMainProps, State> {

    constructor(props: LikesMainProps) {
        super(props)
        const initialState = {
            userData: undefined,
            itemsInfo: undefined,
            imagesLoaded: true
        }
        this.state = initialState
    }

    async refreshData() {
        const userData = await User.get()
        const itemsInfo = await Item.getLiked()
        this.setState({userData: userData, itemsInfo: itemsInfo})
    }
    
    renderItems() {
        if (this.state.itemsInfo) {
            return (
                <ScrollContainer
                    fadeBottom={false}
                    fadeTop={false}
                >
                    {this.state.itemsInfo.map((itemInfo, index) => {
                        return (
                            <ItemLikedCard
                                itemInfo={itemInfo}
                                onPress={() => {
                                    console.log('anad')
                                }}
                                key={index.toString()}
                            />
                        )
                    })}
                </ScrollContainer>
            )
        }
    }
    
    renderUI() {
        if (this.state.userData && this.state.itemsInfo) {
            return (
                <>
                    {this.renderItems()}
                </>
            )
        }
    }

    renderLoading() {
        if (this.state.userData === undefined || this.state.itemsInfo === undefined || !this.state.imagesLoaded) {
            return (
              <LoadingCover size={"large"}/>
            )
          }
    }

    render() {
        return (
            <PageContainer headerText={"Liked Items"}>
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
                        iconStyle: {tintColor: colors.main},
                    },
                    {
                        iconSource: icons.closet,
                        buttonFunc: () => this.props.navigation.navigate("closet")
                    },
                    {
                        iconSource: icons.profile,
                        buttonFunc: () => this.props.navigation.navigate("account")
                    },
                    ]}
                
                />
            </PageContainer>
        );
    }
}

const styles = StyleSheet.create({

})