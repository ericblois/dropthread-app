import { RouteProp } from "@react-navigation/core";
import { CompositeNavigationProp } from "@react-navigation/native";
import { StackNavigationProp } from '@react-navigation/stack';
import React from "react";
import { StyleSheet } from "react-native";
import CustomComponent from "../CustomComponents/CustomComponent";
import { CustomModal, ItemLargeCard, ItemLikedCard, LoadingCover, BloisMenuBar, BloisPage, ScrollContainer } from "../HelperFiles/CompIndex";
import { ItemInfo, UserData } from "../HelperFiles/DataTypes";
import Item from "../HelperFiles/Item";
import { ExchangesStackParamList, UserMainStackParamList } from "../HelperFiles/Navigation";
import { colors, icons, screenHeight, styVals } from "../HelperFiles/StyleSheet";
import User from "../HelperFiles/User";

type ViewLikesNavigationProp = CompositeNavigationProp<
    StackNavigationProp<ExchangesStackParamList, "likes">,
    StackNavigationProp<UserMainStackParamList>
>

type ViewLikesRouteProp = RouteProp<ExchangesStackParamList, "likes">;

type ViewLikesProps = {
    navigation: ViewLikesNavigationProp,
    route: ViewLikesRouteProp
}

type State = {
    userData?: UserData,
    itemsInfo?: ItemInfo[],
    showDetailCard?: ItemInfo,
    imagesLoaded: boolean
}

export default class ViewLikesPage extends CustomComponent<ViewLikesProps, State> {

    constructor(props: ViewLikesProps) {
        super(props)
        const initialState = {
            userData: undefined,
            itemsInfo: undefined,
            showDetailCard: undefined,
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
                                    this.setState({showDetailCard: itemInfo})
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
            <BloisPage
                style={{paddingTop: undefined}}
            >
                <CustomModal
                    visible={!!this.state.showDetailCard}
                    onClose={() => this.setState({showDetailCard: undefined})}
                >
                    {this.state.showDetailCard ?
                    <ItemLargeCard
                        itemInfo={this.state.showDetailCard}
                        style={{
                            //width: '50%',
                            height: screenHeight*0.7
                        }}
                    />
                    : undefined}
                </CustomModal>
                {this.renderUI()}
                {this.renderLoading()}
                
            </BloisPage>
        );
    }
}

const styles = StyleSheet.create({

})