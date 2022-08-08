import { RouteProp } from "@react-navigation/core";
import { CompositeNavigationProp } from "@react-navigation/native";
import { StackNavigationProp } from '@react-navigation/stack';
import React from "react";
import { DeviceEventEmitter, StyleSheet } from "react-native";
import CustomComponent from "../CustomComponents/CustomComponent";
import CustomIconButton from "../CustomComponents/CustomIconButton";
import { ItemSmallCard, CustomImageButton, LoadingCover, MenuBar, PageContainer, ScrollContainer, TextButton } from "../HelperFiles/CompIndex";
import { DefaultItemData, ItemData, ItemInfo, UserData } from "../HelperFiles/DataTypes";
import Item from "../HelperFiles/Item";
import { ClosetStackParamList, UserMainStackParamList } from "../HelperFiles/Navigation";
import { bottomInset, colors, icons, menuBarStyles, styleValues } from "../HelperFiles/StyleSheet";
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
    itemsInfo?: ItemInfo[],
    imagesLoaded: boolean
}

export default class ClosetMainPage extends CustomComponent<ClosetMainProps, State> {

    constructor(props: ClosetMainProps) {
        super(props)
        const initialState = {
            userData: undefined,
            itemsInfo: undefined,
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
        const itemsInfo = await Item.getFromUser()
        this.setState({userData: userData, itemsInfo: itemsInfo})
    }

    renderAddButton() {
        return (
          /*<TextButton
            text={"Add a new item"}
            onPress={() => {
                this.props.navigation.navigate("editItem", {
                    itemID: '',
                    isNew: true
                })
            }}
          />*/
          <CustomIconButton
            name="tag-plus-outline"
            type="MaterialCommunityIcons"
            buttonStyle={{
                position: 'absolute',
                bottom: bottomInset + styleValues.mediumHeight + styleValues.mediumPadding*3,
                right: styleValues.mediumPadding,
                width: styleValues.iconLargerSize + styleValues.mediumPadding*2,
                padding: styleValues.mediumPadding,
                borderRadius: styleValues.mediumPadding,
                backgroundColor: colors.background,
            }}
            buttonProps={{animationType: 'shadow'}}
            onPress={() => {
                this.props.navigation.navigate("editItem", {
                    itemID: '',
                    isNew: true
                })
            }}
          />
        )
      }
    
    renderItems() {
        if (this.state.itemsInfo) {
            return (
                <ScrollContainer>
                    {this.state.itemsInfo.map((itemInfo, index) => {
                        return (
                            <ItemSmallCard
                                itemInfo={itemInfo}
                                onPress={() => {
                                    this.props.navigation.navigate("itemInfo", {
                                        itemID: itemInfo.item.itemID,
                                        distance: itemInfo.distance!
                                    })
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
                    {this.renderAddButton()}
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
            <PageContainer headerText={"Your Closet"}>
                {this.renderUI()}
                {this.renderLoading()}
            </PageContainer>
        );
    }
}

const styles = StyleSheet.create({

})