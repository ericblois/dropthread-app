import { FontAwesome5, MaterialCommunityIcons, Octicons } from "@expo/vector-icons";
import { RouteProp } from "@react-navigation/core";
import { StackNavigationProp } from '@react-navigation/stack';
import React from "react";
import { FlatList, Pressable, StyleSheet, Text, View } from "react-native";
import CustomComponent from "../CustomComponents/CustomComponent";
import CustomIconButton from "../CustomComponents/CustomIconButton";
import { CustomCurrencyInput, CustomModal, CustomScrollView, CustomTextButton, FilterSearchBar, ItemLargeCard, ItemSmallCard, LoadingCover, MenuBar, PageContainer, TextButton } from "../HelperFiles/CompIndex";
import { currencyFormatter } from "../HelperFiles/Constants";
import { extractKeywords, ItemData, ItemFilter, ItemInfo, OfferData, UserData } from "../HelperFiles/DataTypes";
import Item from "../HelperFiles/Item";
import { UserMainStackParamList } from "../HelperFiles/Navigation";
import Offer from "../HelperFiles/Offer";
import { bottomInset, colors, defaultStyles, fonts, icons, screenHeight, screenUnit, screenWidth, shadowStyles, styleValues, textStyles } from "../HelperFiles/StyleSheet";
import User from "../HelperFiles/User";

type EditOfferNavigationProp = StackNavigationProp<UserMainStackParamList, "editOffer">;

type EditOfferRouteProp = RouteProp<UserMainStackParamList, "editOffer">;

type EditOfferProps = {
    navigation: EditOfferNavigationProp,
    route: EditOfferRouteProp
}

type State = {
    offerData: OfferData,
    fromItems: ItemInfo[],
    toItems: ItemInfo[],
    fromPayment: number | null,
    toPayment: number | null,
    showDetailCard?: ItemInfo,
    didLoad: boolean,
    errorDidOccur: boolean
}

//const AnimatedFilterScrollBar = Animated.createAnimatedComponent(FilterScrollBar);

export default class EditOfferPage extends CustomComponent<EditOfferProps, State> {

  flatListComp: FlatList<ItemInfo> | null = null

    constructor(props: EditOfferProps) {
        super(props)
        this.state = {
            offerData: Offer.createData(
                User.getCurrent().uid,
                props.route.params.interaction.likePrice,
                0
            ),
            fromItems: [],
            toItems: [],
            toPayment: props.route.params.interaction.likePrice,
            fromPayment: 0,
            didLoad: false,
            errorDidOccur: false
        }
    }
    // Refresh data, only used for initial load
    async refreshData() {
        this.setState({didLoad: false})
        let fromItems = await Item.getFromIDs([this.props.route.params.interaction.itemID])
        //let toPayment = fromItems.map(({item}) => (item.lastPrice)).reduce((prev, current) => (prev + current))
        this.setState({fromItems: fromItems})
    }

    validateOfferData() {
        const offer = this.state.offerData
        //if (offer.)
    }

    renderReceived() {
        if (this.state.toItems) {
            const totalPrice = this.state.toPayment || 0
            const feeAmount = Math.min(Math.max(1, totalPrice*0.08), 10)
            const subtotalPrice = totalPrice - feeAmount
            return (
                <>
                    <Text
                        style={textStyles.mediumHeader}
                    >You receive:</Text>
                    {this.state.toPayment ? 
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
                    {this.state.toItems.map((itemInfo, index) => {
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
    }

    renderGiven() {
        if (this.state.fromItems) {
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
                    {this.state.fromPayment ? 
                    <View style={defaultStyles.roundedBox}>
                        <Text>{this.state.fromPayment}</Text>
                    </View> : undefined}
                    {this.state.fromItems.map((itemInfo, index) => {
                        return (
                            <ItemSmallCard
                                itemInfo={itemInfo}
                                style={{...shadowStyles.small, width: '100%'}}
                                showCustomPrice={itemInfo.item.priceData.lastFacePrice}
                                onPress={() => this.setState({showDetailCard: itemInfo})}
                                key={index.toString()}
                            />
                        )
                    })}
                </>
            )
        }
    }

    renderUI() {
        return (
            <CustomScrollView>
                <View
                    style={{
                        ...shadowStyles.small,
                        ...defaultStyles.roundedBox,
                    }}
                >
                    {this.renderReceived()}
                    {this.renderGiven()}
                </View>
            </CustomScrollView>
        )
    }

    render() {
      try {
        return (
            <PageContainer
                headerText={'Send Offer'}
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
                        disableViewCloset
                    />
                    : undefined}
                </CustomModal>
              {this.renderUI()}
              <View style={{
                position: 'absolute',
                bottom: bottomInset + styleValues.mediumPadding,
                width: '100%', 
                flexDirection: 'row',
                alignItems: 'center'
              }}>
                <CustomIconButton
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
                <CustomTextButton
                    text={'Send'}
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
                    onPress={async () => {
                        
                        await Offer.send(
                            this.state.offerData,
                            this.state.fromItems.map(({item}) => (item.itemID)),
                            this.state.toItems.map(({item}) => (item.itemID))
                        )
                        this.props.navigation.goBack()
                    }}
                />
              </View>
            </PageContainer>
        );
      } catch (e) {
        this.setState({errorDidOccur: true})
      }
    }
}

const styles = StyleSheet.create({

})