
import React from "react";
import { LayoutRectangle, Pressable, ScrollView, StyleSheet, Text, View, ViewStyle } from "react-native";
import { capitalizeWords } from "../HelperFiles/ClientFunctions";
import  TextButton from "./TextButton";
import { currencyFormatter } from "../HelperFiles/Constants";
import { ItemCondition, ItemData, ItemInfo } from "../HelperFiles/DataTypes";
import Item from "../HelperFiles/Item";
import { colors, defaultStyles, fonts, icons, screenUnit, screenWidth, shadowStyles, styVals, textStyles } from "../HelperFiles/StyleSheet";
import CustomComponent from "./CustomComponent";
import CustomImageButton from "./CustomImageButton";
import ImageSlider from "./ImageSlider";
import LoadingCover from "./LoadingCover";
import * as Icons from "@expo/vector-icons"
import ScrollContainer from "./ScrollContainer";
import CustomScrollView from "./CustomScrollView";
import { useNavigation } from "@react-navigation/native";
import { StackNavigationProp } from "@react-navigation/stack";
import { UserMainStackParamList } from "../HelperFiles/Navigation";
import BloisIconButton from "../BloisComponents/BloisIconButton";
import User from "../HelperFiles/User";

type Props = {
    navigation?: StackNavigationProp<UserMainStackParamList>,
    itemInfo: ItemInfo,
    style?: ViewStyle,
    onLoadEnd?: () => void,
    onPressCard?: () => void,
    onPressLike?: (isLiked: boolean) => void,
    hideButtons?: boolean
}

type State = {
    itemInfo: ItemInfo,
    imageLoaded: boolean
}

const conditionColors: Record<ItemCondition, string> = {
    '': colors.black,
    poor: colors.invalid,
    fair: colors.yellow,
    good: colors.valid,
    new: colors.valid
}

const conditionIcons: Record<ItemCondition, 'close-circle' | 'minus-circle' | 'check-circle'> = {
    '': 'minus-circle',
    poor: 'close-circle',
    fair: 'minus-circle',
    good: 'check-circle',
    new: 'check-circle'
}

export default class ItemLargeCard extends CustomComponent<Props, State> {

    styleTagsLayout: LayoutRectangle | null = null

    constructor(props: Props) {
        super(props);
        this.state = {
            itemInfo: props.itemInfo,
            imageLoaded: false
        }
    }

    renderLikeButton() {
        if (this.props.hideButtons !== true) {
            return (
                <CustomImageButton
                    iconSource={icons.hollowHeart}
                    buttonStyle={styles.likeButton}
                    iconStyle={{tintColor: this.state.itemInfo.likePrice && this.state.itemInfo.likePrice >= this.state.itemInfo.item.priceData.basePrice ? colors.valid : colors.lightGrey}}
                    onPress={() => {
                        // Unlike
                        if (this.state.itemInfo.likePrice && this.state.itemInfo.likePrice >= this.state.itemInfo.item.priceData.basePrice) {
                            const newItemInfo: ItemInfo = {
                                ...this.state.itemInfo,
                                likeTime: null,
                                likePrice: null
                            }
                            this.setState({itemInfo: newItemInfo})
                            Item.unlike(this.state.itemInfo).then(() => {
                                Item.getFromIDs([this.state.itemInfo.item.itemID], true).then((itemInfos) => {
                                    this.setState({itemInfo: itemInfos[0]}, () => {
                                        let bla = 'k'
                                    })
                                })
                            })
                            if (this.props.onPressLike) {
                                this.props.onPressLike(false)
                            }
                        } // Like
                        else {
                            const newItemInfo: ItemInfo = {
                                ...this.state.itemInfo,
                                likeTime: Date.now(),
                                likePrice: this.state.itemInfo.item.priceData.basePrice
                            }
                            this.setState({itemInfo: newItemInfo})
                            Item.like(this.state.itemInfo)
                            if (this.props.onPressLike) {
                                this.props.onPressLike(true)
                            }
                        }
                    }}
                />
            )
        }
    }

    renderUI() {
        return (
        <>
            <ImageSlider
                uris={this.state.itemInfo.item.images}
                style={{borderRadius: styVals.mediumPadding}}
                minRatio={1}
                maxRatio={1.5}
                fadeColor={colors.background}
                onImagesLoaded={() => {
                    this.setState({imageLoaded: true}, () => {
                        if (this.props.onLoadEnd) {
                            this.props.onLoadEnd();
                        }
                    })
                }}
            />
            {/*  */}
            <View
                removeClippedSubviews={true}
                style={styles.itemInfoContainer}
            >
                {/* Name, price */}
                <View style={{
                    paddingBottom: styVals.mediumPadding,
                    marginBottom: styVals.mediumPadding,
                    borderBottomWidth: styVals.minorBorderWidth,
                    borderColor: colors.darkGrey
                }}>
                    <View style={{flexDirection: "row"}}>
                        <Text
                            style={{
                                ...styles.headerText,
                                flex: 1,
                                marginRight: styVals.mediumPadding*2
                            }}
                            numberOfLines={2}
                        >{this.state.itemInfo.item.name}</Text>
                        <Text style={{
                            ...textStyles.larger,
                            textAlign: "right",
                            }}
                        >{currencyFormatter.format(
                            this.state.itemInfo.item.userID == User.getCurrent().uid ?
                            this.state.itemInfo.item.priceData.minPrice :
                            this.state.itemInfo.item.priceData.facePrice
                        )}</Text>
                    </View>
                    {/* Gender / category, distance */}
                    <View style={{flexDirection: "row", justifyContent: 'space-between'}}>
                        <Text style={{...styles.minorText}}>{
                        capitalizeWords(`${this.state.itemInfo.item.gender !== 'unisex' ? this.state.itemInfo.item.gender + `'s` : ``} ${this.state.itemInfo.item.category !== 'other' ? this.state.itemInfo.item.category : ''}`)
                        }</Text>
                        <Text style={{...styles.minorText, textAlign: "right"}}>{`within ${this.state.itemInfo.distance} km`}</Text>
                    </View>
                </View>
                {/* Popular item? */}
                {this.state.itemInfo.item.likeCount >= 0 ?
                <View style={{flexDirection: 'row', alignItems: 'center', marginBottom: styVals.minorPadding}}>
                    <Icons.MaterialCommunityIcons
                        name="fire"
                        style={{
                            fontSize: styVals.iconMediumSize,
                            color: colors.flame,
                            marginRight: styVals.minorPadding
                        }}
                    />
                    <Text style={styles.minorText}>{`This item is popular!`}</Text>
                </View> : undefined}
                {/* Condition */}
                <View style={{flexDirection: 'row', alignItems: 'center', marginBottom: styVals.minorPadding}}>
                    <Icons.MaterialCommunityIcons
                        name={'star-four-points-outline'}
                        style={{
                            fontSize: styVals.iconMediumSize,
                            color: colors.grey,
                            marginRight: styVals.minorPadding
                        }}
                    />
                    <Text style={styles.minorText}>{`${capitalizeWords(this.state.itemInfo.item.condition)} condition`}</Text>
                </View>
                {/* Size and fit */}
                <View style={{flexDirection: 'row', alignItems: 'center', marginBottom: styVals.minorPadding}}>
                    <Icons.MaterialCommunityIcons
                        name={'ruler'}
                        style={{
                            fontSize: styVals.iconMediumSize,
                            color: colors.grey,
                            marginRight: styVals.minorPadding
                        }}
                    />
                    <Text style={styles.minorText}>{`${capitalizeWords(this.state.itemInfo.item.size)}${this.state.itemInfo.item.fit !== 'proper' ? ` (Fits ${this.state.itemInfo.item.fit})` : ``}`}</Text>
                </View>
            </View>
            {/* Buttons */}
            <View style={{
                flexDirection: 'row',
                alignItems: 'flex-end',
                justifyContent: 'space-between',
                paddingHorizontal: styVals.mediumPadding
            }}>
                {this.props.hideButtons ? <View></View> :
                <CustomImageButton
                    iconSource={icons.hangers}
                    buttonStyle={{
                        ...shadowStyles.small,
                        width: styVals.iconLargestSize,
                        aspectRatio: 1,
                        marginBottom: styVals.mediumPadding,
                        padding: styVals.mediumPadding,
                        borderRadius: styVals.mediumPadding,
                        backgroundColor: colors.background,
                    }}
                    iconStyle={{tintColor: colors.grey}}
                    buttonProps={{animationType: 'shadow'}}
                    onPress={async () => {
                        const userItems = await Item.getFromUser(this.state.itemInfo.item.userID)
                        if (this.props.navigation) {
                            this.props.navigation.navigate('viewItems', {items: userItems})
                        }
                    }}
                />}
                {this.renderLikeButton()}
                
            </View>
        </>
        );
    }

    renderLoading() {
        if (this.state.itemInfo.item === undefined || !this.state.imageLoaded) {
            return (
                <LoadingCover style={{backgroundColor: colors.white}}/>
            )
        }
    }

    render() {
        return (
            <View style={{...styles.cardContainer, ...this.props.style}}
            >
                {this.renderUI()}
                {this.renderLoading()}
            </View>
        )
    }
}

export const styles = StyleSheet.create({
    cardContainer: {
        ...shadowStyles.medium,
        backgroundColor: colors.background,
        borderRadius: styVals.mediumPadding,
        height: "100%",
        width: "100%",
    },
    itemInfoContainer: {
        flex: 1,
        width: "100%",
        paddingHorizontal: styVals.mediumPadding
    },
    headerText: {
        ...textStyles.large,
        marginBottom: styVals.minorPadding,
        textAlign: "left"
    },
    majorText: {
        ...textStyles.medium,
        textAlign: "left"
    },
    minorText: {
        ...textStyles.medium,
        color: colors.darkGrey,
        textAlign: "left"
    },
    infoTextBorder: {
        borderColor: colors.black,
        borderWidth: styVals.mediumBorderWidth,
        borderRadius: styVals.minorPadding,
        padding: styVals.minorPadding/2,
    },
    likeButton: {
        ...shadowStyles.small,
        width: styVals.iconLargesterSize,
        height: styVals.iconLargesterSize,
        borderRadius: styVals.majorPadding,
        marginBottom: styVals.minorPadding
    }
})