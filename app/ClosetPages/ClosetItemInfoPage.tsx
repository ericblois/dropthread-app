import { Octicons, SimpleLineIcons } from "@expo/vector-icons";
import { RouteProp } from "@react-navigation/core";
import { CompositeNavigationProp } from "@react-navigation/native";
import { StackNavigationProp } from '@react-navigation/stack';
import React from "react";
import { DeviceEventEmitter, StyleSheet, Text, View } from "react-native";
import CustomComponent from "../CustomComponents/CustomComponent";
import { capitalizeWords } from "../HelperFiles/ClientFunctions";
import { CustomTextButton, ImageSlider, LoadingCover, MenuBar, PageContainer, ScrollContainer, TextButton } from "../HelperFiles/CompIndex";
import { currencyFormatter } from "../HelperFiles/Constants";
import { ItemData, ItemInfo, ItemInteraction, OfferData, OfferInfo } from "../HelperFiles/DataTypes";
import Item from "../HelperFiles/Item";
import { ClosetStackParamList, UserMainStackParamList } from "../HelperFiles/Navigation";
import Offer from "../HelperFiles/Offer";
import { colors, defaultStyles, icons, screenWidth, shadowStyles, styleValues, textStyles } from "../HelperFiles/StyleSheet";
import User from "../HelperFiles/User";

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
    // Maps a user ID (like) to the index of an offer
    offerMap?: {[userID: string]: number},
    errorOccurred: boolean
}

export default class ClosetItemInfoPage extends CustomComponent<ItemInfoProps, State> {

    constructor(props: ItemInfoProps) {
        super(props)
        const initialState: State = {
            itemInfo: undefined,
            itemLikes: undefined,
            itemOffers: undefined,
            offerMap: undefined,
            errorOccurred: false
        }
        this.state = initialState
        DeviceEventEmitter.addListener('refreshClosetItemData', () => {
            this.setState(initialState, () => {
                this.refreshData()
            })
        })
    }

    async refreshData() {
        try {
            this.setState({errorOccurred: false})
            // Get data
            const [itemsInfo, itemLikes] = await Promise.all([
                Item.getFromIDs([this.props.route.params.itemID]),
                Item.getLikes(this.props.route.params.itemID)
            ])
            const itemOffers = await Offer.getWithItem(this.props.route.params.itemID)
            const offerMap: {[userID: string]: number} = {}
            // Get all user IDs involved in offers (that aren't current user)
            const offerUserIDs = itemOffers.map((offerInfo) => {
                if (offerInfo.offer.fromID === User.getCurrent().uid) {
                    return offerInfo.offer.toID
                } else {
                    return offerInfo.offer.fromID
                }
            })
            // Check which users (who have liked) are also in an offer
            itemLikes.forEach((intx) => {
                const index = offerUserIDs.indexOf(intx.userID)
                if (index > -1) {
                    // Add to offer map
                    offerMap[intx.userID] = index
                }
            })
            this.setState({
                itemInfo: itemsInfo[0],
                itemLikes: itemLikes,
                itemOffers: itemOffers,
                offerMap: offerMap
            })
        } catch {
            this.setState({errorOccurred: true})
        }
    }

    renderInfo() {
        if (this.state.itemInfo) {
            return (
                <View
                    style={{
                        width: "100%",
                        flexDirection: "row"
                    }}
                >
                    <View style={{flex: 1}}>
                        <Text
                            style={{...textStyles.larger, textAlign: "left"}}
                            numberOfLines={4}
                        >{this.state.itemInfo.item.name}</Text>
                        <Text style={{...textStyles.large, textAlign: "left", color: colors.grey}}>{capitalizeWords(this.state.itemInfo.item.category)}</Text>
                    </View>
                    <View style={{alignItems: "flex-end", marginLeft: styleValues.mediumPadding}}>
                        <Text style={{...textStyles.larger, textAlign: "right"}}>{currencyFormatter.format(this.state.itemInfo.item.minPrice)}</Text>
                        {this.state.itemInfo.distance! > 0 ? 
                            <Text style={{...textStyles.large, textAlign: "right", color: colors.grey}}>{`${this.state.itemInfo.distance}km`}</Text>
                        : undefined}
                    </View>
                </View>
            )
        }
    }

    renderUI() {
        if (this.state.itemInfo && this.state.itemLikes) {
            return (
                <>
                <ScrollContainer>
                    <ImageSlider
                        uris={this.state.itemInfo.item.images}
                        style={{width: screenWidth}}
                        minRatio={1}
                        maxRatio={2}
                    ></ImageSlider>
                    {this.renderInfo()}
                    <Text style={{...textStyles.medium, alignSelf: "flex-start"}}>{"Views: ".concat(this.state.itemInfo.item.viewCount.toString())}</Text>
                    <Text style={{...textStyles.mediumHeader, alignSelf: "flex-start"}}>{"Likes: ".concat(this.state.itemInfo.item.likeCount.toString())}</Text>
                    <TextButton
                        text={"View matches"}
                        rightIconSource={icons.chevron}
                        rightIconStyle={{transform: [{scaleX: -1}]}}
                        onPress={() => {this.props.navigation.navigate("itemSwaps", {likedUserIDs: ["B9m6149WWAZoaVOpomSgcy2riyD3"]})}}
                    />
                    <TextButton
                        text={"Update location"}
                        rightIconSource={icons.crosshair}
                        onPress={() => {}}
                    />
                    <Text style={textStyles.mediumHeader}>Likes</Text>
                    {this.state.itemLikes.map((interaction, index) => {
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
                                        height: styleValues.largerTextSize,
                                        fontSize: styleValues.largerTextSize,
                                        color: colors.main,
                                        marginRight: styleValues.mediumPadding
                                    }}
                                />
                                <View style={{flex: 1, justifyContent: 'space-between'}}>
                                    <View style={{flexDirection: 'row', alignItems: 'center', marginBottom: styleValues.minorPadding}}>
                                        <Text style={{...textStyles.medium, marginRight: styleValues.mediumPadding}}>{currencyFormatter.format(interaction.likePrice)}</Text>
                                        
                                    </View>
                                    <View style={{flexDirection: 'row', alignItems: 'flex-end'}}>
                                        <Text style={{...textStyles.small, textAlign: 'left', marginRight: styleValues.mediumPadding}}>{`${interaction.distance} km`}</Text>
                                        <Text style={{...textStyles.smaller, textAlign: 'left', color: colors.grey}}>{timeText}</Text>
                                    </View>
                                </View>
                                <View>
                                    <CustomTextButton
                                        text={'Accept'}
                                        buttonStyle={{
                                            marginBottom: undefined,
                                            width: undefined,
                                            alignSelf: 'flex-end'
                                        }}
                                        textStyle={{
                                            marginRight: styleValues.mediumPadding
                                        }}
                                        rightChildren={
                                            <Octicons
                                                name={"arrow-switch"}
                                                style={{
                                                    fontSize: styleValues.largeTextSize,
                                                    color: colors.main
                                                }}
                                            />
                                        }
                                        onPress={() => this.props.navigation.navigate('editOffer', {interaction: interaction})}
                                    />
                                </View>
                            </View>
                        )
                    })}
                    <TextButton
                        text={"Delete item"}
                        textStyle={{color: colors.invalid}}
                        showLoading={true}
                        onPress={async () => {await Item.delete(this.state.itemInfo!.item)}}
                    />
                </ScrollContainer>
                </>
            )
        }
    }

    renderLoading() {
        if (!this.state.itemInfo || !this.state.itemLikes) {
            return (
              <LoadingCover
                size={"large"}
                showError={this.state.errorOccurred}
                errorText={"Could not load item."}
                onErrorRefresh={() => this.refreshData()}
            />
            )
          }
    }

    render() {
    return (
        <PageContainer>
            {this.renderUI()}
            {this.renderLoading()}
            <MenuBar
                buttonProps={[
                    {
                        iconSource: icons.chevron,
                        onPress: () => this.props.navigation.goBack()
                    },
                    {
                        iconSource: icons.edit,
                        iconStyle: {
                            tintColor: this.state.itemInfo === undefined ? colors.lighterGrey : colors.darkGrey
                        },
                        buttonProps: {
                            disabled: this.state.itemInfo === undefined
                        },
                        onPress: () => this.props.navigation.navigate("editItem", {
                            itemID: this.state.itemInfo!.item.itemID,
                            isNew: false
                        })
                    },
                ]}
            
            ></MenuBar>
        </PageContainer>
    );
    }
}

const styles = StyleSheet.create({

})