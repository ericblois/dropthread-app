
import React from "react";
import { GestureResponderEvent, Pressable, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import FastImage from "react-native-fast-image";
import { currencyFormatter } from "../HelperFiles/Constants";
import { ItemInfo } from "../HelperFiles/DataTypes";
import { colors, shadowStyles, styVals, textStyles, screenUnit, screenWidth, icons, defaultStyles } from "../HelperFiles/StyleSheet";
import CustomComponent from "./CustomComponent";
import CustomImage from "./CustomImage";
import BloisPressable from "../BloisComponents/BloisPressable";
import CustomImageButton from "./CustomImageButton";
import Item from "../HelperFiles/Item";

type Props = {
    itemInfo: ItemInfo,
    onLoadEnd?: () => void,
    onPress?: (event?: GestureResponderEvent) => void,
    onPressLike?: (isLiked: boolean) => void
}

type State = {
    itemInfo: ItemInfo,
    status: "highestPrice" | "outbid" | "unliked",
    statusText: string,
    imageLoaded: boolean
}

export default class ItemLikedCard extends CustomComponent<Props, State> {

    constructor(props: Props) {
        super(props);
        this.state = {
            itemInfo: props.itemInfo,
            status: 'highestPrice',
            statusText: '',
            imageLoaded: props.itemInfo.item.images.length === 0
        }
    }
    componentDidMount(): void {
        super.componentDidMount()
        this.updateStatus()
    }

    // Update the status of the like on this item
    updateStatus = () => {
        if (!this.state.itemInfo.likePrice) {
            this.setState({status: 'unliked', statusText: 'Not liked'})
        } else if (this.state.itemInfo.likePrice >= this.state.itemInfo.item.priceData.basePrice) {
            this.setState({status: 'highestPrice', statusText: 'Most recent like'})
        } else {
            this.setState({status: 'outbid', statusText: 'Liked by other shopper'})
        }
    }

    renderUI() {
        const priceText = currencyFormatter.format(this.state.status === 'highestPrice' ? this.state.itemInfo.likePrice! : this.state.itemInfo.item.priceData.facePrice )
        const priceColor = this.state.status === 'outbid' ? colors.invalid : colors.black 
        const statusColor = this.state.status === 'highestPrice' ? colors.valid : colors.invalid
        return (
        <BloisPressable
            style={styles.cardContainer}
            animationType={"shadow"}
            onPress={this.props.onPress}
        >
            <CustomImage
                style={{
                    ...styles.productImage
                }}
                imageProps={{
                    resizeMode: "cover"
                }}
                source={{uri: this.state.itemInfo.item.images[0]}}
                onLoad={() => {
                    this.setState({imageLoaded: true}, () => {
                        if (this.props.onLoadEnd) {
                            this.props.onLoadEnd();
                        }
                    })
                }}
            />
            {/* INFO AREA */}
            <View style={{height: "100%", flex: 1}}>
                {/* HEADER */}
                <View style={{flexDirection: "row", marginBottom: styVals.minorPadding}}>
                    {/* ITEM NAME */}
                    <Text
                        style={{...styles.headerText, flex: 1, marginRight: styVals.mediumPadding}}
                        numberOfLines={1}
                    >{this.state.itemInfo.item.name}</Text>
                    {/* PRICE */}
                    <View style={{flexDirection: "row", alignItems: "center"}}>
                        {this.state.status === 'outbid' ?
                        <FastImage
                            source={icons.backArrow}
                            resizeMode={"contain"}
                            style={{
                                width: styVals.iconSmallestSize,
                                aspectRatio: 1,
                                marginRight: styVals.minorPadding,
                                transform: [{rotate: '90deg'}]
                            }}
                            tintColor={priceColor}
                        /> : undefined
                        }
                        <Text
                            style={styles.headerText}
                            numberOfLines={1}
                        >{priceText}</Text>
                    </View>
                </View>
                <View style={{flexDirection: "row", flex: 1, alignItems: "flex-end"}}>
                    {/* STATUS */}
                    <View style={{flexDirection: "row", flex: 1}}>
                        <FastImage
                            source={icons.hollowHeart}
                            resizeMode={"contain"}
                            style={{
                                width: styVals.iconSmallerSize,
                                aspectRatio: 1
                            }}
                            tintColor={statusColor}
                        />
                        <Text
                            style={{...styles.statusText, color: statusColor}}
                            numberOfLines={2}
                        >{this.state.statusText}</Text>
                    </View>
                    {/* LIKE BUTTON */}
                    <CustomImageButton
                        iconSource={icons.hollowHeart}
                        buttonStyle={styles.likeButton}
                        iconStyle={{tintColor: this.state.status === 'highestPrice' ? colors.valid : colors.grey}}
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
                                        this.setState({itemInfo: itemInfos[0]})
                                    });
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
                            this.updateStatus()
                        }}
                    />
                </View>
            </View>
        </BloisPressable>
        );
    }

    render() {
        return (
            this.renderUI()
        )
    }
}

const styles = StyleSheet.create({
    cardContainer: {
        backgroundColor: "#fff",
        borderRadius: styVals.mediumPadding,
        height: screenUnit * 5,
        width: screenWidth - styVals.mediumPadding*2,
        marginBottom: styVals.mediumPadding,
        padding: styVals.minorPadding,
        flexDirection: "row",
        alignItems: "center",
    },
    productImage: {
        height: "100%",
        aspectRatio: 1,
        borderRadius: styVals.minorPadding,
        marginRight: styVals.mediumPadding
    },
    headerText: {
        ...textStyles.large,
        textAlign: "left"
    },
    statusText: {
        ...textStyles.medium,
        textAlign: "left",
        marginHorizontal: styVals.minorPadding,
        flex: 1
    },
    likeButton: {
        ...shadowStyles.small,
        width: styVals.iconLargerSize,
        aspectRatio: 1,
        borderRadius: styVals.majorPadding
    }
})