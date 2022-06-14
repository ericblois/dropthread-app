import { RouteProp } from "@react-navigation/core";
import { CompositeNavigationProp } from "@react-navigation/native";
import { StackNavigationProp } from '@react-navigation/stack';
import React from "react";
import { DeviceEventEmitter, StyleSheet } from "react-native";
import CustomComponent from "../CustomComponents/CustomComponent";
import { ItemClosetCard, IconButton, LoadingCover, MenuBar, PageContainer, ScrollContainer, TextButton } from "../HelperFiles/CompIndex";
import { DefaultItemData, ItemData, ItemInfo, UserData } from "../HelperFiles/DataTypes";
import Item from "../HelperFiles/Item";
import { ClosetStackParamList, LikesStackParamList, UserMainStackParamList } from "../HelperFiles/Navigation";
import { bottomInset, colors, icons, menuBarStyles, styleValues } from "../HelperFiles/StyleSheet";
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
        this.state =initialState
        DeviceEventEmitter.addListener('refreshClosetItemData', () => {
            this.setState(initialState, () => {
                this.refreshData()
            })
        })
    }

    async refreshData() {
        const userData = await User.get()
        const itemsInfo = await Item.getFromUser(undefined, true)
        this.setState({userData: userData, itemsInfo: itemsInfo})
    }

    renderAddButton() {
        return (
          /*<TextButton
            text={"Add a new item"}
            buttonFunc={() => {
                this.props.navigation.navigate("editItem", {
                    itemID: '',
                    isNew: true
                })
            }}
          />*/
          <IconButton
            iconSource={icons.plus}
            buttonStyle={{
                position: "absolute",
                bottom: menuBarStyles.lightHover.height + bottomInset + styleValues.mediumPadding*3,
                right: styleValues.mediumPadding*2,
                width: styleValues.iconLargesterSize,
                height: styleValues.iconLargesterSize,
                zIndex: 100,
                elevation: 100
            }}
            iconStyle={{tintColor: colors.main}}
            buttonFunc={() => {}}
          />
        )
      }
    
    renderItems() {
        if (this.state.itemsInfo) {
            return (
                <ScrollContainer>
                    {this.state.itemsInfo.map((itemInfo, index) => {
                        return (
                            <ItemClosetCard
                                itemData={itemInfo.item}
                                onPress={() => {}}
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