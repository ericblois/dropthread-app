import { RouteProp } from "@react-navigation/core";
import { CompositeNavigationProp } from "@react-navigation/native";
import { StackNavigationProp } from '@react-navigation/stack';
import React from "react";
import { DeviceEventEmitter, StyleSheet } from "react-native";
import CustomComponent from "../CustomComponents/CustomComponent";
import { ClosetItem, LoadingCover, MenuBar, PageContainer, ScrollContainer, TextButton } from "../HelperFiles/CompIndex";
import { DefaultItemData, ItemData, UserData } from "../HelperFiles/DataTypes";
import Item from "../HelperFiles/Item";
import { ClosetStackParamList, UserMainStackParamList } from "../HelperFiles/Navigation";
import { colors, icons } from "../HelperFiles/StyleSheet";
import User from "../HelperFiles/User";

type ClosetMainNavigationProp = CompositeNavigationProp<
    StackNavigationProp<ClosetStackParamList, "main">,
    StackNavigationProp<UserMainStackParamList>
>

type ClosetMainRouteProp = RouteProp<ClosetStackParamList, "main">;

type ClosetMainProps = {
    navigation: ClosetMainNavigationProp,
    route: ClosetMainRouteProp
}

type State = {
    userData?: UserData,
    itemsData?: ItemData[],
    distances?: number[],
    imagesLoaded: boolean
}

export default class ClosetMainPage extends CustomComponent<ClosetMainProps, State> {

    constructor(props: ClosetMainProps) {
        super(props)
        const initialState = {
            userData: undefined,
            itemsData: undefined,
            imagesLoaded: true
        }
        this.state =initialState
        DeviceEventEmitter.addListener('refreshClosetItemData', () => {
            this.setState(initialState, () => {
                this.refreshData()
            })
        })
    }

    async refreshData() {
        const userData = await User.get()
        const itemDatas = await Item.getFromUser(undefined, true)
        const items = itemDatas.map(({item}) => item)
        const distances = itemDatas.map(({distance}) => distance)
        this.setState({userData: userData, itemsData: items, distances: distances})
    }

    renderAddButton() {
        return (
          <TextButton
            text={"Add a new item"}
            buttonFunc={() => {
                this.props.navigation.navigate("editItem", {
                    itemID: '',
                    isNew: true
                })
            }}
          />
        )
      }
    
    renderItems() {
        if (this.state.itemsData) {
            return (
                <ScrollContainer>
                    {this.state.itemsData.map((item, index) => {
                        return (
                            <ClosetItem
                                itemData={item}
                                onPress={() => {
                                    this.props.navigation.navigate("itemInfo", {
                                        itemID: item.itemID,
                                        distance: this.state.distances ? this.state.distances[index] : undefined
                                    })
                                }}
                                key={item.itemID}
                            />
                        )
                    })}
                </ScrollContainer>
            )
        }
    }
    
    renderUI() {
        if (this.state.userData && this.state.itemsData) {
            return (
                <>
                    {this.renderAddButton()}
                    {this.renderItems()}
                </>
            )
        }
    }

    renderLoading() {
        if (this.state.userData === undefined || this.state.itemsData === undefined || !this.state.imagesLoaded) {
            return (
              <LoadingCover size={"large"}/>
            )
          }
    }

    render() {
        return (
            <PageContainer headerText={"Your Closet"}>
                {this.renderUI()}
                {this.renderLoading()}
                <MenuBar
                    buttonProps={[
                    {
                        iconSource: icons.search,
                        buttonFunc: () => this.props.navigation.navigate("search")
                    },
                    {
                        iconSource: icons.shoppingBag,
                        buttonFunc: () => this.props.navigation.navigate("browse")
                    },
                    {
                        iconSource: icons.closet,
                        iconStyle: {tintColor: colors.main},
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