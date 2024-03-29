import { AntDesign, Ionicons, Octicons, SimpleLineIcons } from "@expo/vector-icons";
import { RouteProp } from "@react-navigation/core";
import { CompositeNavigationProp } from "@react-navigation/native";
import { StackNavigationProp } from '@react-navigation/stack';
import React from "react";
import { DeviceEventEmitter, Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import CustomComponent from "../CustomComponents/CustomComponent";
import { capitalizeWords } from "../HelperFiles/ClientFunctions";
import { ConfirmationPopup, CustomScrollView, BloisTextButton, ImageSlider, LoadingCover, BloisMenuBar, OfferSmallCard, BloisPage, ScrollContainer, TextButton } from "../HelperFiles/CompIndex";
import { currencyFormatter } from "../HelperFiles/Constants";
import { ItemData, ItemInfo, ItemInteraction, OfferData, OfferInfo } from "../HelperFiles/DataTypes";
import Item from "../HelperFiles/Item";
import { ClosetStackParamList, UserMainStackParamList } from "../HelperFiles/Navigation";
import Offer from "../HelperFiles/Offer";
import { colors, defaultStyles, displayWidth, icons, menuBarStyles, screenUnit, screenWidth, shadowStyles, styVals, textStyles } from "../HelperFiles/StyleSheet";
import User from "../HelperFiles/User";
import { ConfirmationPopupConfig } from "../CustomComponents/ConfirmationPopup";

type ItemInfoNavigationProp = CompositeNavigationProp<
    StackNavigationProp<ClosetStackParamList, "itemInfo">,
    StackNavigationProp<UserMainStackParamList>
>

type ItemInfoRouteProp = RouteProp<ClosetStackParamList, "itemInfo">;

type ItemInfoProps = {
    navigation: ItemInfoNavigationProp,
    route: ItemInfoRouteProp
}

type State = {
    itemInfo?: ItemInfo,
    itemLikes?: ItemInteraction[],
    itemOffers?: OfferInfo[],
    showDeletePopup: boolean,
    imagesLoaded: boolean,
    isLoading: boolean,
    errorMessage?: string
}

export default class ClosetItemInfoPage extends CustomComponent<ItemInfoProps, State> {

    constructor(props: ItemInfoProps) {
        super(props)
        const initialState: State = {
            itemInfo: undefined,
            itemLikes: undefined,
            itemOffers: undefined,
            showDeletePopup: false,
            imagesLoaded: false,
            isLoading: false,
            errorMessage: undefined
        }
        this.state = initialState
    }

    async refreshData() {
        try {
            this.setState({isLoading: true, imagesLoaded: false, errorMessage: undefined})
            // Get data
            let [itemsInfo, itemLikes, itemOffers] = await Promise.all([
                Item.getFromIDs([this.props.route.params.itemID]),
                Item.getLikes(this.props.route.params.itemID),
                Offer.getWithItem(this.props.route.params.itemID)
            ])
            // Get all user IDs involved in offers (that aren't current user)
            const offerUserIDs = itemOffers.map((offerInfo) => {
                if (offerInfo.offer.fromUserID === User.getCurrent().uid) {
                    return offerInfo.offer.toUserID
                } else {
                    return offerInfo.offer.fromUserID
                }
            })
            // Filter out users' likes who are involved in an open offer with this item
            itemLikes = itemLikes.filter((interaction) => !offerUserIDs.includes(interaction.userID))
            this.setState({
                itemInfo: itemsInfo[0],
                itemLikes: itemLikes,
                itemOffers: itemOffers
            });
        } catch(e) {
            this.handleError(e)
        }
        this.setState({isLoading: false})
    }

    async deleteItem() {
        try {
            this.setState({isLoading: true, errorMessage: undefined})
            await Item.delete(this.state.itemInfo!.item)
            this.props.navigation.goBack()
        } catch (e) {
            this.handleError(e)
            this.props.navigation.goBack()
        }
        this.setState({isLoading: false})
    }

    renderInfo() {
        if (this.state.itemInfo) {
            return (
                <View style={{width: "100%", flexDirection: 'row'}}>
                    <View style={{flex: 1, marginRight: styVals.minorPadding}}>
                        {/* Name */}
                        <Text
                            style={{...textStyles.larger, textAlign: "left"}}
                            numberOfLines={4}
                        >{this.state.itemInfo.item.name}</Text>
                        {/* Gender / category */}
                        <Text
                            style={{
                                ...textStyles.large,
                                textAlign: "left",
                                color: colors.grey
                            }}
                        >{capitalizeWords(`${this.state.itemInfo.item.gender !== 'unisex' ? this.state.itemInfo.item.gender + `'s ` : ``}${this.state.itemInfo.item.category !== 'other' ? this.state.itemInfo.item.category : ''}`)}</Text>
                        {/* Size */}
                        <Text
                            style={{...textStyles.large, textAlign: "left", color: colors.grey}}
                            numberOfLines={1}
                        >Size: {capitalizeWords(this.state.itemInfo.item.size)}</Text>
                        {/* Distance */}
                        {this.state.itemInfo.distance! > 0 ? 
                            <Text style={{...textStyles.large, textAlign: "left", color: colors.grey}}>{`within ${this.state.itemInfo.distance} km`}</Text>
                        : undefined}
                    </View>
                    <View>
                        {/* Minimum price */}
                        <Text style={{
                                ...textStyles.larger,
                                textAlign: 'right',
                            }}
                            numberOfLines={1}
                        >{currencyFormatter.format(this.state.itemInfo.item.priceData.minPrice).substring(0, 9)}</Text>
                    </View>
                </View>
            )
        }
    }

    renderLikes() {
        if (this.state.itemInfo && this.state.itemLikes) {
            return (
                <View>
                    {/* Views / likes */}
                    <View
                        style={{
                            flexDirection: 'row',
                            justifyContent: 'space-between',
                            alignItems: 'flex-start',
                            marginBottom: styVals.mediumPadding
                        }}
                    >
                        <View style={{flexDirection: 'row'}}>
                            <Ionicons
                                name="eye-outline"
                                style={{fontSize: styVals.iconMediumSize, textAlignVertical: 'center', marginRight: styVals.minorPadding, marginTop: -screenUnit*0.15}}
                            />
                            <Text style={{...textStyles.large}}>{this.state.itemInfo.item.viewCount.toString()}</Text>
                        </View>
                        <Text style={{...textStyles.largeHeader, marginVertical: undefined}}>Likes</Text>
                        <View style={{flexDirection: 'row'}}>
                            <Text style={{...textStyles.large}}>{this.state.itemInfo.item.likeCount.toString()}</Text>
                            <AntDesign
                                name="hearto"
                                style={{fontSize: styVals.iconSmallSize, textAlignVertical: 'center', marginLeft: styVals.minorPadding, marginTop: screenUnit*0.1}}
                            />
                        </View>
                    </View>
                    {this.state.itemLikes.length === 0
                    ? <Text style={{...textStyles.medium, color: colors.grey, marginBottom: styVals.mediumPadding}}>No likes yet.</Text>    
                    : this.state.itemLikes.map((interaction, index) => {
                        const secondsAgo = (Date.now() - interaction.likeTime)/1000
                        let timeText = secondsAgo < 60 ? `${Math.floor(secondsAgo)}s ago`
                        : secondsAgo < 3600 ? `${Math.floor(secondsAgo/60)}m ago`
                        : secondsAgo < 86400 ? `${Math.floor(secondsAgo/3600)}h ago`
                        : `${Math.floor(secondsAgo/86400)}d ago`
                        return (
                            <View
                                style={{
                                    ...shadowStyles.small,
                                    ...defaultStyles.roundedBox,
                                    flexDirection: 'row',
                                    justifyContent: 'flex-start'
                                }}
                                key={index.toString()}
                            >
                                <SimpleLineIcons
                                    name="heart"
                                    style={{
                                        height: styVals.largerTextSize,
                                        fontSize: styVals.largerTextSize,
                                        color: colors.main,
                                        marginRight: styVals.mediumPadding
                                    }}
                                />
                                <View style={{flex: 1, justifyContent: 'space-between'}}>
                                    <Text style={{...textStyles.large, textAlign: 'left'}}>{currencyFormatter.format(interaction.likePrice)}</Text>
                                    <Text style={{...textStyles.medium, textAlign: 'left'}}>{`within ${interaction.distance} km`}</Text>
                                    <Text style={{...textStyles.small, textAlign: 'left', color: colors.grey}}>{timeText}</Text>
                                </View>
                                <BloisTextButton
                                    text={'Send offer'}
                                    style={{
                                        marginBottom: undefined,
                                        flex: 1,
                                        alignSelf: 'flex-end',
                                        width: '30%'
                                    }}
                                    textStyle={{
                                        marginRight: styVals.mediumPadding
                                    }}
                                    rightChildren={
                                        <Octicons
                                            name={"arrow-switch"}
                                            style={{
                                                fontSize: styVals.largeTextSize,
                                                color: colors.main
                                            }}
                                        />
                                    }
                                    onPress={() => {
                                        this.props.navigation.navigate('createOffer', {
                                            offer: Offer.createOffer(interaction.userID, interaction.itemID)
                                        })
                                    }}
                                />
                            </View>
                        )
                    })}
                </View>
            )
        }
    }

    renderOffers() {
        if (this.state.itemInfo && this.state.itemOffers && this.state.itemOffers.length > 0) {
            return (
                <View style={{marginBottom: styVals.mediumPadding}}>
                    {/* Views / likes */}
                    <Text style={{...textStyles.largeHeader, marginTop: 0}}>Active Offers</Text>
                    {this.state.itemOffers.map((offerInfo, index) => {
                        return (
                            <OfferSmallCard
                                offerInfo={offerInfo}
                                onPress={() => this.props.navigation.navigate('editOffer', {offerInfo: offerInfo})}
                                key={index.toString()}
                            />
                        )
                    })}
                </View>
            )
        }
    }

    renderUI() {
        if (this.state.itemInfo && this.state.itemLikes) {
            return (
                <>
                <CustomScrollView
                    style={{
                        marginTop: - styVals.mediumPadding,
                    }}
                    contentContainerStyle={{
                        marginHorizontal: -styVals.mediumPadding,
                        paddingHorizontal: styVals.mediumPadding,
                        marginBottom: styVals.mediumHeight*2,
                        overflow: 'hidden'
                    }}
                    avoidKeyboard={true}
                >
                    <View
                        style={{
                            ...shadowStyles.medium,
                            backgroundColor: colors.background,
                            marginHorizontal: -styVals.mediumPadding,
                            paddingHorizontal: styVals.mediumPadding,
                            paddingBottom: styVals.mediumPadding,
                            marginBottom: styVals.mediumPadding
                        }}
                    >
                        <ImageSlider
                            uris={this.state.itemInfo.item.images}
                            style={{width: screenWidth, marginHorizontal: -styVals.mediumPadding}}
                            minRatio={1}
                            maxRatio={2}
                            onImagesLoaded={() => this.setState({imagesLoaded: true})}
                        ></ImageSlider>
                        {this.renderInfo()}
                    </View>
                    {/* Buttons */}
                    <TextButton
                        text={"View matches"}
                        rightIconSource={icons.chevron}
                        rightIconStyle={{transform: [{scaleX: -1}]}}
                        onPress={() => {this.props.navigation.navigate("itemSwaps", {likedUserIDs: ["B9m6149WWAZoaVOpomSgcy2riyD3"]})}}
                    />
                    {/* Views / likes */}
                    {this.renderLikes()}
                    {/* Offers */}
                    {this.renderOffers()}
                    {/* Delete button */}
                    <TextButton
                        text={`Delete item${this.state.itemOffers!.length > 0 ? ' (item is in an offer)' : ''}`}
                        //subtext={this.state.itemOffers!.length > 0 ? `Can't delete item that is in an offer.` : ''}
                        touchableProps={{disabled: this.state.itemOffers!.length > 0}}
                        textStyle={{color: this.state.itemOffers!.length > 0 ? colors.lightGrey : colors.invalid}}
                        subtextStyle={{color: colors.lightGrey}}
                        showLoading={true}
                        onPress={() => this.setState({showDeletePopup: true})}
                    />
                </CustomScrollView>
                </>
            )
        }
    }

    renderLoading() {
        if (this.state.isLoading || !this.state.imagesLoaded || this.state.errorMessage) {
            return (
              <LoadingCover
                size={"large"}
                
                errorText={this.state.errorMessage}
                onErrorRefresh={() => this.refreshData()}
            />
            )
          }
    }

    render() {
    return (
        <BloisPage
            headerText={'Item Info'}
        >
            {this.renderUI()}
            {this.renderLoading()}
            <BloisMenuBar
                buttons={[
                    {
                        icon: {
                            type: "Entypo",
                            name: "chevron-small-left",
                        },
                        onPress: () => this.props.navigation.goBack()
                    },
                    {
                        icon: {
                            type: 'Feather',
                            name: 'edit'
                        },
                        iconStyle: {color: this.state.itemInfo === undefined ? colors.lighterGrey : colors.darkGrey},
                        pressableProps: {disabled: this.state.itemInfo === undefined},
                        onPress: () => this.props.navigation.navigate("editItem", {
                            itemID: this.state.itemInfo!.item.itemID,
                            isNew: false
                        })
                    }
                ]}
            
            ></BloisMenuBar>
            <ConfirmationPopup
                visible={this.state.showDeletePopup}
                headerText={"Delete Item"}
                infoText={"Are you sure you want to delete this item? Views, likes, and images associated with this item will also be deleted."}
                confirmText="Delete"
                confirmButtonStyle={{backgroundColor: colors.invalid}}
                confirmTextStyle={{color: colors.white}}
                onConfirm={() => this.deleteItem()}
                onDeny={() => this.setState({showDeletePopup: false})}
            />
        </BloisPage>
    );
    }
}

const styles = StyleSheet.create({

})