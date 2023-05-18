import { RouteProp } from "@react-navigation/core";
import { CompositeNavigationProp } from "@react-navigation/native";
import { StackNavigationProp } from '@react-navigation/stack';
import React from "react";
import { View } from "react-native";
import { StyleSheet, Text } from "react-native";
import CustomComponent from "../CustomComponents/CustomComponent";
import { CustomModal, CustomScrollView, ItemLargeCard, ItemLikedCard, LoadingCover, MenuBar, OfferSmallCard, PageContainer, ScrollContainer } from "../HelperFiles/CompIndex";
import { ExchangeData, ItemInfo, OfferData, OfferInfo, UserData } from "../HelperFiles/DataTypes";
import Item from "../HelperFiles/Item";
import { ExchangesStackParamList, RootStackParamList, UserDetailStackParamList, UserMainStackParamList } from "../HelperFiles/Navigation";
import Offer from "../HelperFiles/Offer";
import { colors, icons, screenHeight, textStyles } from "../HelperFiles/StyleSheet";
import User from "../HelperFiles/User";

type ExchangesNavigationProp = CompositeNavigationProp<
    StackNavigationProp<ExchangesStackParamList, "main">,
    StackNavigationProp<UserMainStackParamList>
>

type ExchangesRouteProp = RouteProp<ExchangesStackParamList, "main">;

type ExchangesProps = {
    navigation: ExchangesNavigationProp,
    route: ExchangesRouteProp
}

type State = {
    offers?: OfferInfo[],
    exchanges?: ExchangeData[],
    showDetailCard?: ItemInfo,
    imagesLoaded: boolean
}

export default class ViewExchangesPage extends CustomComponent<ExchangesProps, State> {

    constructor(props: ExchangesProps) {
        super(props)
        const initialState = {
            offers: undefined,
            exchanges: undefined,
            showDetailCard: undefined,
            imagesLoaded: true
        }
        this.state = initialState
    }

    async refreshData() {
        const offers = await Offer.getWithUser()
        console.log(offers[0])
        this.setState({offers: offers})
    }
    
    renderOffers() {
        if (this.state.offers!.length > 0) {
            return (
            <View>
                <Text style={textStyles.mediumHeader}>Offers</Text>
                {this.state.offers!.map((offerInfo, index) => {
                    return (
                        <OfferSmallCard
                            offerInfo={offerInfo}
                            onPress={() => this.props.navigation.navigate('editOffer', {
                                offerInfo: offerInfo
                            })}
                            key={index.toString()}
                        />
                    )
                })}
            </View>
            )
        }
    }
    
    renderUI() {
        if (this.state.offers) {
            return (
                <CustomScrollView>
                    {this.renderOffers()}
                </CustomScrollView>
            )
        }
    }

    renderLoading() {
        if (!this.state.offers) {
            return (
              <LoadingCover size={"large"}/>
            )
          }
    }

    render() {
        return (
            <PageContainer style={{paddingTop: undefined}}>
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
            </PageContainer>
        );
    }
}

const styles = StyleSheet.create({

})