import { Entypo, Feather, FontAwesome5, MaterialCommunityIcons, Octicons } from "@expo/vector-icons";
import { RouteProp } from "@react-navigation/core";
import { StackNavigationProp } from '@react-navigation/stack';
import React from "react";
import { FlatList, Pressable, StyleSheet, Text, View } from "react-native";
import CustomComponent from "../CustomComponents/CustomComponent";
import BloisIconButton from "../BloisComponents/BloisIconButton";
import { ConfirmationPopup, CustomImage, CustomModal, CustomScrollView, BloisTextButton, FilterSearchBar, ItemLargeCard, ItemSmallCard, LoadingCover, BloisMenuBar, PageContainer, TextButton } from "../HelperFiles/CompIndex";
import { currencyFormatter } from "../HelperFiles/Constants";
import { extractKeywords, ItemData, ItemFilter, ItemInfo, ItemPriceData, OfferData, OfferInfo, UserData } from "../HelperFiles/DataTypes";
import Item from "../HelperFiles/Item";
import { UserMainStackParamList } from "../HelperFiles/Navigation";
import Offer from "../HelperFiles/Offer";
import { bottomInset, colors, defaultStyles, fonts, icons, screenHeight, screenUnit, screenWidth, shadowStyles, styleValues, textStyles } from "../HelperFiles/StyleSheet";
import User from "../HelperFiles/User";
import OfferLargeCard from "../CustomComponents/OfferLargeCard";

type EditOfferNavigationProp = StackNavigationProp<UserMainStackParamList, "editOffer">;

type EditOfferRouteProp = RouteProp<UserMainStackParamList, "editOffer">;

type EditOfferProps = {
    navigation: EditOfferNavigationProp,
    route: EditOfferRouteProp
}

type State = {
    offerInfo: OfferInfo,
    originalItemIDs: string[],
    showDetailCard?: ItemInfo,
    otherLikedItems?: ItemInfo[],
    isFrom: boolean,
    hasChanged: boolean,
    showAcceptPopup: boolean,
    showRejectPopup: boolean,
    isLoading: boolean,
    imagesLoaded: boolean,
    errorMessage?: string
}

//const AnimatedFilterScrollBar = Animated.createAnimatedComponent(FilterScrollBar);

export default class EditOfferPage extends CustomComponent<EditOfferProps, State> {

  flatListComp: FlatList<ItemInfo> | null = null

    constructor(props: EditOfferProps) {
        super(props)
        this.state = {
            offerInfo: props.route.params.offerInfo,
            originalItemIDs: props.route.params.offerInfo.offer.itemIDs.sort(),
            showDetailCard: undefined,
            otherLikedItems: undefined,
            isFrom: props.route.params.offerInfo.offer.fromUserID === User.getCurrent().uid,
            hasChanged: false,
            showAcceptPopup: false,
            showRejectPopup: false,
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
                Offer.getInfo(this.state.offerInfo?.offer),
                Item.getLiked(this.state.isFrom ? this.state.offerInfo?.offer.toUserID : this.state.offerInfo?.offer.fromUserID)
            ]);
            otherLikedItems = otherLikedItems.filter((itemInfo) => !offerInfo.offer.itemIDs.includes(itemInfo.item.itemID))
            this.setState({offerInfo: offerInfo, otherLikedItems: otherLikedItems, offerData: offerInfo.offer})
        } catch (e) {
            this.handleError(e)
        }
        this.setState({isLoading: false})
    }

    isSameAsOriginal(newItemIDs: string[]) {
        return newItemIDs.sort().join(',') === this.state.originalItemIDs.join(',')
    }

    addItem(itemInfo: ItemInfo) {
        const newOfferInfo: OfferInfo = {
            ...this.state.offerInfo,
            offer: {
                ...this.state.offerInfo.offer,
                itemIDs: this.state.offerInfo?.offer.itemIDs.concat([itemInfo.item.itemID])
            }
        }

        this.setState({
            offerInfo: newOfferInfo,
            hasChanged: !this.isSameAsOriginal(newOfferInfo.offer.itemIDs)
        }, () => {
            this.refreshData()
        })
    }

    removeItem(itemInfo: ItemInfo) {
        const newOfferInfo: OfferInfo = this.state.offerInfo
        const itemIndex = newOfferInfo.offer.itemIDs.indexOf(itemInfo.item.itemID)
        if (itemIndex !== -1) {
            newOfferInfo.offer.itemIDs.splice(itemIndex, 1)
        }
        this.setState({
            offerInfo: newOfferInfo,
            hasChanged: !this.isSameAsOriginal(newOfferInfo.offer.itemIDs)
        }, () => {
            this.refreshData()
        })
    }

    renderUI() {
        return (
            <CustomScrollView
                contentContainerStyle={{paddingBottom: styleValues.mediumHeight + styleValues.mediumPadding}}
            >
                    <BloisTextButton
                        text={`Browse ${this.state.isFrom ? this.state.offerInfo?.offer.toName : this.state.offerInfo?.offer.fromName}'s items`}
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
                                getItems: () => Item.getFromUser(this.state.isFrom ? this.state.offerInfo.offer.toUserID : this.state.offerInfo.offer.fromUserID),
                                addItem: !this.state.isFrom ? 
                                async (itemInfo: ItemInfo) => {
                                    await Item.like(itemInfo);
                                    this.addItem(itemInfo);
                                } : undefined,
                                addedItems: !this.state.isFrom ? this.state.offerInfo?.offer.itemIDs : undefined,
                                header: !this.state.isFrom ? 'Add Items to Offer' : `${this.state.isFrom ? this.state.offerInfo.offer.toName : this.state.offerInfo.offer.fromName}'s Items`
                            })
                        }}
                    />
                <OfferLargeCard
                    offerInfo={this.state.offerInfo!}
                    onPressItem={(itemInfo) => this.setState({showDetailCard: itemInfo})}
                    onLoadEnd={() => this.setState({imagesLoaded: true})}
                    removeItem={!this.state.isFrom ? (itemInfo) => this.removeItem(itemInfo) : undefined}
                />
                {/* Other liked items */}
                {!this.state.isFrom && this.state.otherLikedItems && this.state.otherLikedItems.length > 0 ?
                    <>
                        <Text style={{...textStyles.smallHeader, color: colors.grey}}>{`${this.state.isFrom ? this.state.offerInfo?.offer.toName : this.state.offerInfo?.offer.fromName} has also liked:`}</Text>
                        {this.state.otherLikedItems.map((itemInfo, index) => {
                            return (
                                <View key={index.toString()}>
                                    <ItemSmallCard
                                        itemInfo={itemInfo}
                                        showCustomPrice={itemInfo.likePrice!}
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
                headerText={'Edit Offer'}
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
                        name={'chevron-thin-left'}
                        type={'Entypo'}
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
                            text={this.state.isFrom ? 'Cancel' : 'Reject'}
                            appearance={'color'}
                            showLoading
                            wrapperStyle={{flex: 1}}
                            buttonStyle={{
                                height: styleValues.mediumHeight,
                                backgroundColor: this.state.isFrom ? colors.background : colors.invalid,
                                marginRight: styleValues.mediumPadding
                            }}
                            textStyle={{fontSize: styleValues.mediumTextSize, color: this.state.isFrom ? colors.invalid : colors.white}}
                            onPress={async () => this.setState({showRejectPopup: true})}
                        />
                    {!this.state.isFrom ?
                        <BloisTextButton
                            text={this.state.hasChanged ? 'Send' : 'Accept'}
                            appearance={'color'}
                            showLoading
                            wrapperStyle={{
                                flex: 1
                            }}
                            buttonStyle={{
                                height: styleValues.mediumHeight
                            }}
                            textStyle={{
                                fontSize: styleValues.mediumTextSize
                            }}
                            onPress={async () => this.setState({showAcceptPopup: true})}
                        />
                    : undefined}
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
                <ConfirmationPopup
                    visible={this.state.showRejectPopup}
                    headerText={`${this.state.isFrom ? 'Cancel' : 'Reject'} Offer`}
                    infoText={`Are you sure you would like to ${this.state.isFrom ? 'cancel' : 'reject'} this offer?`}
                    confirmText={this.state.isFrom ? 'Cancel' : 'Reject'}
                    confirmButtonStyle={{backgroundColor: colors.invalid}}
                    confirmTextStyle={{color: colors.white}}
                    onConfirm={async () => {
                        await Offer.reject(this.state.offerInfo.offer.offerID);
                        this.props.navigation.goBack()
                    }}
                    onDeny={() => this.setState({showRejectPopup: false})}
                />
                <ConfirmationPopup
                    visible={this.state.showAcceptPopup}
                    headerText={this.state.hasChanged ? 'Send Offer' : 'Accept Offer'}
                    infoText={`Are you sure you would like to ${this.state.hasChanged ? 'send' : 'accept'} this offer?`}
                    confirmText={this.state.hasChanged ? 'Send' : 'Accept'}
                    confirmButtonStyle={{backgroundColor: colors.main}}
                    confirmTextStyle={{color: colors.white}}
                    onConfirm={async () => {
                        if (this.state.hasChanged) {
                            await Offer.send(this.state.offerInfo!.offer)
                        } else {
                            await Offer.accept(this.state.offerInfo.offer.offerID);
                        }
                        this.props.navigation.goBack()
                    }}
                    onDeny={() => this.setState({showAcceptPopup: false})}
                />
                {this.renderLoading()}
            </PageContainer>
        );
      } catch (e) {
        this.handleError(e);
      }
    }
}