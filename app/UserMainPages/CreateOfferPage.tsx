import { Entypo, Feather, FontAwesome5, MaterialCommunityIcons, Octicons } from "@expo/vector-icons";
import { RouteProp } from "@react-navigation/core";
import { StackNavigationProp } from '@react-navigation/stack';
import React from "react";
import { FlatList, Pressable, StyleSheet, Text, View } from "react-native";
import CustomComponent from "../CustomComponents/CustomComponent";
import BloisIconButton from "../BloisComponents/BloisIconButton";
import { CustomCurrencyInput, CustomImage, CustomModal, CustomScrollView, BloisTextButton, ExchangeLocation, FilterSearchBar, ItemLargeCard, ItemSmallCard, LoadingCover, BloisMenuBar, PageContainer, TextButton } from "../HelperFiles/CompIndex";
import { currencyFormatter } from "../HelperFiles/Constants";
import { extractKeywords, ItemData, ItemFilter, ItemInfo, ItemPriceData, OfferData, OfferInfo, UserData } from "../HelperFiles/DataTypes";
import Item from "../HelperFiles/Item";
import { UserMainStackParamList } from "../HelperFiles/Navigation";
import Offer from "../HelperFiles/Offer";
import { bottomInset, colors, defaultStyles, fonts, icons, screenHeight, screenUnit, screenWidth, shadowStyles, styleValues, textStyles } from "../HelperFiles/StyleSheet";
import User from "../HelperFiles/User";
import OfferLargeCard from "../CustomComponents/OfferLargeCard";

type CreateOfferNavigationProp = StackNavigationProp<UserMainStackParamList, "createOffer">;

type CreateOfferRouteProp = RouteProp<UserMainStackParamList, "createOffer">;

type CreateOfferProps = {
    navigation: CreateOfferNavigationProp,
    route: CreateOfferRouteProp
}

type State = {
    offerData: OfferData,
    offerInfo?: OfferInfo,
    showDetailCard?: ItemInfo,
    otherLikedItems?: ItemInfo[],
    validityFlag: boolean,
    isLoading: boolean,
    imagesLoaded: boolean,
    errorMessage?: string
}

//const AnimatedFilterScrollBar = Animated.createAnimatedComponent(FilterScrollBar);

export default class CreateOfferPage extends CustomComponent<CreateOfferProps, State> {

  flatListComp: FlatList<ItemInfo> | null = null

    constructor(props: CreateOfferProps) {
        super(props)
        this.state = {
            offerData: props.route.params.offer,
            offerInfo: undefined,
            showDetailCard: undefined,
            otherLikedItems: undefined,
            validityFlag: false,
            isLoading: false,
            imagesLoaded: false,
            errorMessage: undefined
        }
    }
    // Refresh data
    async refreshData() {
        try {
            this.setState({isLoading: true, errorMessage: undefined})
            // Get offer info
            let [offerInfo, otherLikedItems] = await Promise.all([
                Offer.getInfo(this.state.offerData),
                Item.getLiked(this.state.offerData.toUserID)
            ]);
            // Get all unique delivery methods for user's items
            
            otherLikedItems = otherLikedItems.filter((itemInfo) => !offerInfo.offer.itemIDs.includes(itemInfo.item.itemID))
            this.setState({offerInfo: offerInfo, otherLikedItems: otherLikedItems, offerData: offerInfo.offer})
        } catch (e) {
            this.handleError(e)
        }
        this.setState({isLoading: false})
    }

    addItem(itemInfo: ItemInfo) {
        const newOfferData: OfferData = {
            ...this.state.offerData,
            itemIDs: this.state.offerData.itemIDs.concat([itemInfo.item.itemID])
        }
        this.setState({offerData: newOfferData}, () => {
            this.refreshData()
        })
    }

    removeItem(itemInfo: ItemInfo) {
        const newOfferData: OfferData = this.state.offerData
        const itemIndex = newOfferData.itemIDs.indexOf(itemInfo.item.itemID)
        if (itemIndex !== -1) {
            newOfferData.itemIDs.splice(itemIndex, 1)
        }
        this.setState({offerData: newOfferData}, () => {
            this.refreshData()
        })
    }

    renderUI() {
        return (
            <CustomScrollView
                contentContainerStyle={{paddingBottom: styleValues.mediumHeight + styleValues.mediumPadding}}
            >
                <BloisTextButton
                    text={`Browse ${this.state.offerInfo?.offer.toName}'s items`}
                    textStyle={{color: colors.grey}}
                    rightChildren={
                        <Entypo
                            name="chevron-thin-right"
                            style={{
                                fontSize: styleValues.mediumTextSize,
                                color: colors.grey
                            }}
                        />
                    }
                    onPress={() => {
                        this.props.navigation.navigate('viewItems', {
                            getItems: () => Item.getFromUser(this.state.offerInfo?.offer.toUserID),
                            addItem: async (itemInfo) => {
                                await Item.like(itemInfo);
                                this.addItem(itemInfo);
                            },
                            addedItems: this.state.offerInfo?.offer.itemIDs,
                            header: 'Add Items to Offer'
                        })
                    }}
                />
                {this.state.offerInfo ?
                <>
                {/* Offer card */}
                    <OfferLargeCard
                        offerInfo={this.state.offerInfo}
                        onPressItem={(itemInfo) => this.setState({showDetailCard: itemInfo})}
                        onLoadEnd={() => this.setState({imagesLoaded: true})}
                        removeItem={(itemInfo) => this.removeItem(itemInfo)}
                    />
                    {/* Delivery Method */}
                    <ExchangeLocation
                        offerData={this.state.offerInfo.offer}
                        showValidity={this.state.validityFlag}
                        onChange={(address => {
                            this.setState({offerData:
                                {
                                    ...this.state.offerData,
                                    deliveryAddress: address
                                }
                            })
                        })}
                    />
                </>
                : undefined}
                {/* Other liked items */}
                {this.state.otherLikedItems && this.state.otherLikedItems.length > 0 ?
                    <>
                        <Text style={{...textStyles.smallHeader, color: colors.grey}}>{`${this.state.offerInfo?.offer.toName} has also liked:`}</Text>
                        {this.state.otherLikedItems.map((itemInfo, index) => {
                            return (
                                <View key={index.toString()}>
                                    <ItemSmallCard
                                        itemInfo={itemInfo}
                                        onPress={() => this.setState({showDetailCard: itemInfo})}
                                    />
                                    <BloisIconButton
                                        name="plus"
                                        type="Feather"
                                        buttonStyle={{
                                            position: 'absolute',
                                            top: styleValues.mediumPadding,
                                            right: styleValues.mediumPadding,
                                            backgroundColor: colors.main,
                                            height: styleValues.iconMediumSize,
                                            borderRadius: styleValues.iconMediumSize,
                                            padding: styleValues.minorPadding
                                        }}
                                        iconStyle={{color: colors.white}}
                                        onPress={() => this.addItem(itemInfo)}
                                    />
                                </View>
                            )
                        })}
                    </>
                : undefined}
            </CustomScrollView>
        )
    }

    renderLoading() {
        if (this.state.isLoading
            || !this.state.offerInfo
            || !this.state.imagesLoaded
            || this.state.errorMessage) {
            return (
              <LoadingCover
                size={"large"}
                showError={!!this.state.errorMessage}
                errorText={this.state.errorMessage}
                onErrorRefresh={() => this.refreshData()}
            />
            );
        }
    }

    render() {
      try {
        return (
            <PageContainer
                headerText={'Send Offer'}
            >
                {this.renderUI()}
                <View style={{
                    position: 'absolute',
                    bottom: bottomInset + styleValues.mediumPadding,
                    width: '100%', 
                    flexDirection: 'row',
                    alignItems: 'center'
                }}>
                    <BloisIconButton
                        name={'close'}
                        type={'MaterialCommunityIcons'}
                        animationType={'shadowSmall'}
                        buttonStyle={{
                            ...defaultStyles.roundedBox,
                            width: styleValues.mediumHeight,
                            marginRight: styleValues.mediumPadding,
                            marginVertical: 0
                        }}
                        onPress={() => this.props.navigation.goBack()}
                    />
                    <BloisTextButton
                        text={'Send'}
                        appearance={'color'}
                        showLoading
                        wrapperStyle={{
                            flex: 1
                        }}
                        buttonStyle={{
                            height: styleValues.mediumHeight,
                            backgroundColor: this.state.offerData.deliveryAddress ? colors.main : colors.lightestGrey
                        }}
                        textStyle={{
                            fontSize: styleValues.mediumTextSize
                        }}
                        onPress={async () => {
                            if (this.state.offerData.deliveryAddress) {
                                await Offer.send(this.state.offerInfo!.offer)
                                this.props.navigation.goBack()
                            } else {
                                this.setState({validityFlag: true})
                            }
                        }}
                    />
              </View>
              <CustomModal
                    visible={!!this.state.showDetailCard}
                    onClose={() => this.setState({showDetailCard: undefined})}
                >
                    {this.state.showDetailCard ?
                    <ItemLargeCard
                        itemInfo={this.state.showDetailCard}
                        style={{
                            //width: '50%',
                            height: screenHeight*0.8
                        }}
                        hideButtons
                    />
                    : undefined}
                </CustomModal>
                {this.renderLoading()}
            </PageContainer>
        );
      } catch (e) {
        this.handleError(e);
      }
    }
}

const styles = StyleSheet.create({

})