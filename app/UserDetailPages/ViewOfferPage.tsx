import { FontAwesome5, MaterialCommunityIcons, Octicons } from "@expo/vector-icons";
import { RouteProp } from "@react-navigation/core";
import { StackNavigationProp } from '@react-navigation/stack';
import React from "react";
import { FlatList, Pressable, StyleSheet, Text, View } from "react-native";
import CustomComponent from "../CustomComponents/CustomComponent";
import BloisIconButton from "../BloisComponents/BloisIconButton";
import { CustomCurrencyInput, CustomModal, CustomScrollView, CustomTextButton, FilterSearchBar, ItemLargeCard, ItemSmallCard, LoadingCover, MenuBar, PageContainer, TextButton } from "../HelperFiles/CompIndex";
import { currencyFormatter } from "../HelperFiles/Constants";
import { extractKeywords, ItemData, ItemFilter, ItemInfo, OfferData, UserData } from "../HelperFiles/DataTypes";
import Item from "../HelperFiles/Item";
import { UserDetailStackParamList } from "../HelperFiles/Navigation";
import Offer from "../HelperFiles/Offer";
import { bottomInset, colors, defaultStyles, fonts, icons, screenHeight, screenUnit, screenWidth, shadowStyles, styleValues, textStyles } from "../HelperFiles/StyleSheet";
import User from "../HelperFiles/User";

type ViewOfferNavigationProp = StackNavigationProp<UserDetailStackParamList, "viewOffer">;

type ViewOfferRouteProp = RouteProp<UserDetailStackParamList, "viewOffer">;

type ViewOfferProps = {
    navigation: ViewOfferNavigationProp,
    route: ViewOfferRouteProp
}

type State = {
    wasSent: boolean,
    offerData: OfferData,
    fromItems: ItemInfo[],
    toItems: ItemInfo[],
    fromPayment: number,
    toPayment: number,
    showDetailCard?: ItemInfo,
    didLoad: boolean,
    errorDidOccur: boolean
}

//const AnimatedFilterScrollBar = Animated.createAnimatedComponent(FilterScrollBar);

export default class ViewOfferPage extends CustomComponent<ViewOfferProps, State> {

  flatListComp: FlatList<ItemInfo> | null = null

    constructor(props: ViewOfferProps) {
        super(props)
        this.state = {
            wasSent: props.route.params.offerInfo.offer.fromUserID === User.getCurrent().uid,
            offerData: props.route.params.offerInfo.offer,
            fromItems: props.route.params.offerInfo.fromItems,
            toItems: props.route.params.offerInfo.toItems,
            toPayment: 0,
            fromPayment: 0,
            didLoad: false,
            errorDidOccur: false
        }
    }
    // Refresh data, only used for initial load
    async refreshData() {
        /*this.setState({didLoad: false})
        let fromItems = await Item.getFromIDs([this.props.route.params.interaction.itemID])
        //let toPayment = fromItems.map(({item}) => (item.lastPrice)).reduce((prev, current) => (prev + current))
        this.setState({fromItems: fromItems})*/
    }

    validateOfferData() {
        const offer = this.state.offerData
        //if (offer.)
    }

    renderReceived() {
        const totalPrice = this.state.wasSent ? this.state.toPayment : this.state.fromPayment
        const feeAmount = Math.min(Math.max(1, totalPrice*0.08), 10)
        const subtotalPrice = totalPrice - feeAmount
        return (
            <>
                <Text
                    style={textStyles.mediumHeader}
                >You receive:</Text>
                {(this.state.wasSent ? this.state.toPayment : this.state.fromPayment) ? 
                <View style={{...shadowStyles.small, ...defaultStyles.roundedBox, alignItems: 'flex-start', justifyContent: 'flex-start'}}>
                    <Text style={{...textStyles.small, textAlign: 'left', color: colors.darkGrey}}>{`Total: ${currencyFormatter.format(totalPrice)}`}</Text>
                    <Text style={{...textStyles.small, textAlign: 'left', color: colors.darkGrey}}>{`Fee: ${currencyFormatter.format(feeAmount)}`}</Text>
                    <View
                        style={{
                            flexDirection: 'row',
                            justifyContent: 'space-between',
                            alignItems: 'center',
                            width: '100%',
                            borderTopWidth: styleValues.minorBorderWidth,
                            borderColor: colors.grey,
                            paddingTop: styleValues.mediumPadding,
                            marginTop: styleValues.mediumPadding
                        }}
                    >
                        <Text style={{...textStyles.small, textAlign: 'left'}}>{`Payment of ${currencyFormatter.format(subtotalPrice)}`}</Text>
                        <FontAwesome5
                            name={'money-bill-wave'}
                            style={{
                                fontSize: styleValues.mediumTextSize,
                                color: colors.main
                            }}
                        />
                    </View>
                </View> : undefined}
                {(this.state.wasSent ? this.state.toItems : this.state.fromItems).map((itemInfo, index) => {
                    return (
                        <ItemSmallCard
                            itemInfo={itemInfo}
                            style={{...shadowStyles.small, width: '100%'}}
                            key={index.toString()}
                        />
                    )
                })}
            </>
        )
    }

    renderGiven() {
        const totalPrice = !this.state.wasSent ? this.state.toPayment : this.state.fromPayment
        const feeAmount = Math.min(Math.max(1, totalPrice*0.08), 10)
        const subtotalPrice = totalPrice - feeAmount
        return (
            <>
                <View
                    style={{
                        flexDirection: 'row',
                        width: '100%',
                        alignItems: 'center',
                        justifyContent: 'center'
                    }}
                >
                    <Octicons
                        name={"arrow-switch"}
                        style={{
                            fontSize: styleValues.largeTextSize,
                            color: colors.darkerGrey,
                            marginRight: styleValues.mediumPadding,
                            transform: [{rotate: '90deg'}]
                        }}
                    />
                    <Text
                        style={textStyles.mediumHeader}
                    >For:</Text>
                </View>
                {(!this.state.wasSent ? this.state.toPayment : this.state.fromPayment) ? 
                <View style={{...shadowStyles.small, ...defaultStyles.roundedBox, alignItems: 'flex-start', justifyContent: 'flex-start'}}>
                    <Text style={{...textStyles.small, textAlign: 'left', color: colors.darkGrey}}>{`Total: ${currencyFormatter.format(totalPrice)}`}</Text>
                    <Text style={{...textStyles.small, textAlign: 'left', color: colors.darkGrey}}>{`Fee: ${currencyFormatter.format(feeAmount)}`}</Text>
                    <View
                        style={{
                            flexDirection: 'row',
                            justifyContent: 'space-between',
                            alignItems: 'center',
                            width: '100%',
                            borderTopWidth: styleValues.minorBorderWidth,
                            borderColor: colors.grey,
                            paddingTop: styleValues.mediumPadding,
                            marginTop: styleValues.mediumPadding
                        }}
                    >
                        <Text style={{...textStyles.small, textAlign: 'left'}}>{`Payment of ${currencyFormatter.format(subtotalPrice)}`}</Text>
                        <FontAwesome5
                            name={'money-bill-wave'}
                            style={{
                                fontSize: styleValues.mediumTextSize,
                                color: colors.main
                            }}
                        />
                    </View>
                </View> : undefined}
                {(!this.state.wasSent ? this.state.toItems : this.state.fromItems).map((itemInfo, index) => {
                    return (
                        <ItemSmallCard
                            itemInfo={itemInfo}
                            style={{...shadowStyles.small, width: '100%'}}
                            onPress={() => this.setState({showDetailCard: itemInfo})}
                            key={index.toString()}
                        />
                    )
                })}
            </>
        )
    }

    renderActions() {
        return (
            <View style={{
                position: 'absolute',
                bottom: bottomInset + styleValues.mediumPadding,
                width: '100%',
                height: styleValues.mediumHeight,
                flexDirection: 'row',
                alignItems: 'center'
            }}>
                <BloisIconButton
                    name={'arrow-u-left-bottom'}
                    type={'MaterialCommunityIcons'}
                    animationType={'shadowSmall'}
                    buttonStyle={{
                        ...defaultStyles.roundedBox,
                        width: styleValues.mediumHeight,
                        height: styleValues.mediumHeight,
                        marginRight: styleValues.mediumPadding,
                        marginBottom: undefined
                    }}
                    onPress={() => this.props.navigation.goBack()}
                />
                {this.state.wasSent ?
                <>
                    <BloisIconButton
                        name={'close'}
                        type={'MaterialCommunityIcons'}
                        animationType={'shadowSmall'}
                        buttonStyle={{
                            ...defaultStyles.roundedBox,
                            width: styleValues.mediumHeight,
                            height: styleValues.mediumHeight,
                            marginRight: styleValues.mediumPadding,
                            marginBottom: undefined
                        }}
                        iconStyle={{
                            color: colors.invalid
                        }}
                        onPress={() => this.props.navigation.goBack()}
                    />
                    <BloisIconButton
                        name={'arrow-switch'}
                        type={'Octicons'}
                        animationType={'shadowSmall'}
                        buttonStyle={{
                            ...defaultStyles.roundedBox,
                            width: styleValues.mediumHeight,
                            height: styleValues.mediumHeight,
                            marginRight: styleValues.mediumPadding,
                            marginBottom: undefined
                        }}
                        iconStyle={{
                            color: colors.altBlue,
                            fontSize: styleValues.largestTextSize,
                            textAlignVertical: 'center',
                            height: styleValues.largestTextSize
                        }}
                        onPress={() => this.props.navigation.goBack()}
                    />
                    <BloisIconButton
                        name={'check'}
                        type={'Octicons'}
                        animationType={'shadowSmall'}
                        buttonStyle={{
                            ...defaultStyles.roundedBox,
                            width: undefined,
                            aspectRatio: undefined,
                            flex: 1,
                            height: styleValues.mediumHeight,
                            marginBottom: undefined
                        }}
                        iconStyle={{
                            color: colors.valid
                        }}
                        onPress={() => this.props.navigation.goBack()}
                    />
                </>
                : undefined}
            </View>
        )
    }

    renderUI() {
        return (
            <CustomScrollView>
                {this.renderReceived()}
                {this.renderGiven()}
            </CustomScrollView>
        )
    }

    render() {
      try {
        return (
            <PageContainer
                headerText={`Offer ${this.state.wasSent
                    ? `to ${this.state.offerData.toName}`
                    : `from ${this.state.offerData.fromName}`
                }`}
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
                        hideButtons
                    />
                    : undefined}
                </CustomModal>
              {this.renderUI()}
              {this.renderActions()}
            </PageContainer>
        );
      } catch (e) {
        this.setState({errorDidOccur: true})
      }
    }
}

const styles = StyleSheet.create({

})