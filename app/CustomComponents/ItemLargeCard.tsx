
import React from "react";
import { LayoutRectangle, Pressable, ScrollView, StyleSheet, Text, View, ViewStyle } from "react-native";
import { capitalizeWords } from "../HelperFiles/ClientFunctions";
import  TextButton from "./TextButton";
import { currencyFormatter } from "../HelperFiles/Constants";
import { ItemCondition, ItemData, ItemInfo } from "../HelperFiles/DataTypes";
import Item from "../HelperFiles/Item";
import { colors, defaultStyles, fonts, icons, screenUnit, screenWidth, shadowStyles, styleValues, textStyles } from "../HelperFiles/StyleSheet";
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
import CustomIconButton from "./CustomIconButton";

type Props = {
    navigation?: StackNavigationProp<UserMainStackParamList>,
    itemInfo: ItemInfo,
    style?: ViewStyle,
    onLoadEnd?: () => void,
    onPressCard?: () => void,
    onPressLike?: (isLiked: boolean) => void,
    disableViewCloset?: boolean
}

type State = {
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
            imageLoaded: false
        }
    }

    renderLikeButton() {
        return (
            <CustomImageButton
                iconSource={icons.hollowHeart}
                buttonStyle={styles.likeButton}
                iconStyle={{tintColor: this.props.itemInfo.likePrice ? colors.valid : colors.lightGrey}}
                onPress={() => {
                    // Unlike
                    if (this.props.itemInfo.likePrice && this.props.itemInfo.likePrice >= this.props.itemInfo.item.priceData.lastFacePrice) {
                        Item.unlike(this.props.itemInfo)
                        if (this.props.onPressLike) {
                            this.props.onPressLike(false)
                        }
                    } // Like
                    else {
                        Item.like(this.props.itemInfo)
                        if (this.props.onPressLike) {
                            this.props.onPressLike(true)
                        }
                    }
                    console.log(this.props.itemInfo)
                    this.forceUpdate()
                }}
            />
        )
    }

    renderUI() {
        return (
        <>
            <ImageSlider
                uris={this.props.itemInfo.item.images}
                style={{borderRadius: styleValues.mediumPadding}}
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
                    paddingBottom: styleValues.mediumPadding,
                    marginBottom: styleValues.mediumPadding,
                    borderBottomWidth: styleValues.minorBorderWidth,
                    borderColor: colors.darkGrey
                }}>
                    <View style={{flexDirection: "row"}}>
                        <Text
                            style={{
                                ...styles.headerText,
                                flex: 1,
                                marginRight: styleValues.mediumPadding*2
                            }}
                            numberOfLines={2}
                        >{this.props.itemInfo.item.name}</Text>
                        <Text style={{
                            ...textStyles.large,
                            textAlign: "right",
                            }}
                        >{currencyFormatter.format(this.props.itemInfo.item.priceData.facePrice)}</Text>
                    </View>
                    {/* Gender / category, distance */}
                    <View style={{flexDirection: "row", justifyContent: 'space-between'}}>
                        <Text style={{...styles.minorText}}>{
                        capitalizeWords(`${this.props.itemInfo.item.gender !== 'unisex' ? this.props.itemInfo.item.gender + `'s` : ``} ${this.props.itemInfo.item.category !== 'other' ? this.props.itemInfo.item.category : ''}`)
                        }</Text>
                        <Text style={{...styles.minorText, textAlign: "right"}}>{`within ${this.props.itemInfo.distance} km`}</Text>
                    </View>
                </View>
                {/* Popular item? */}
                {this.props.itemInfo.item.likeCount >= 0 ?
                <View style={{flexDirection: 'row', alignItems: 'center', marginBottom: styleValues.minorPadding}}>
                    <Icons.MaterialCommunityIcons
                        name="fire"
                        style={{
                            fontSize: styleValues.iconMediumSize,
                            color: colors.flame,
                            marginRight: styleValues.minorPadding
                        }}
                    />
                    <Text style={styles.minorText}>{`This item is popular!`}</Text>
                </View> : undefined}
                {/* Condition */}
                <View style={{flexDirection: 'row', alignItems: 'center', marginBottom: styleValues.minorPadding}}>
                    <Icons.MaterialCommunityIcons
                        name={'star-four-points-outline'}
                        style={{
                            fontSize: styleValues.iconMediumSize,
                            color: colors.grey,
                            marginRight: styleValues.minorPadding
                        }}
                    />
                    <Text style={styles.minorText}>{`${capitalizeWords(this.props.itemInfo.item.condition)} condition`}</Text>
                </View>
                {/* Size and fit */}
                <View style={{flexDirection: 'row', alignItems: 'center', marginBottom: styleValues.minorPadding}}>
                    <Icons.MaterialCommunityIcons
                        name={'ruler'}
                        style={{
                            fontSize: styleValues.iconMediumSize,
                            color: colors.grey,
                            marginRight: styleValues.minorPadding
                        }}
                    />
                    <Text style={styles.minorText}>{`${capitalizeWords(this.props.itemInfo.item.size)}${this.props.itemInfo.item.fit !== 'proper' ? ` (Fits ${this.props.itemInfo.item.fit})` : ``}`}</Text>
                </View>
            </View>
            {/* Buttons */}
            <View style={{
                flexDirection: 'row',
                alignItems: 'flex-end',
                justifyContent: 'space-between',
                paddingHorizontal: styleValues.mediumPadding
            }}>
                {this.props.disableViewCloset ? <View></View> :
                <CustomImageButton
                    iconSource={icons.hangers}
                    buttonStyle={{
                        ...shadowStyles.small,
                        width: styleValues.iconLargestSize,
                        aspectRatio: 1,
                        marginBottom: styleValues.mediumPadding,
                        padding: styleValues.mediumPadding,
                        borderRadius: styleValues.mediumPadding,
                        backgroundColor: colors.background,
                    }}
                    iconStyle={{tintColor: colors.grey}}
                    buttonProps={{animationType: 'shadow'}}
                    onPress={async () => {
                        const userItems = await Item.getFromUser(this.props.itemInfo.item.userID)
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
        if (this.props.itemInfo.item === undefined || !this.state.imageLoaded) {
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
        borderRadius: styleValues.mediumPadding,
        height: "100%",
        width: "100%",
    },
    itemInfoContainer: {
        flex: 1,
        width: "100%",
        paddingHorizontal: styleValues.mediumPadding
    },
    headerText: {
        ...textStyles.medium,
        marginBottom: styleValues.minorPadding,
        textAlign: "left"
    },
    majorText: {
        ...textStyles.small,
        textAlign: "left"
    },
    minorText: {
        ...textStyles.small,
        color: colors.darkGrey,
        textAlign: "left"
    },
    infoTextBorder: {
        borderColor: colors.black,
        borderWidth: styleValues.mediumBorderWidth,
        borderRadius: styleValues.minorPadding,
        padding: styleValues.minorPadding/2,
    },
    likeButton: {
        ...shadowStyles.small,
        width: styleValues.iconLargesterSize,
        height: styleValues.iconLargesterSize,
        borderRadius: styleValues.majorPadding,
        marginBottom: styleValues.minorPadding
    }
})