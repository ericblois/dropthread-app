
import React from "react";
import { GestureResponderEvent, Pressable, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import FastImage from "react-native-fast-image";
import { currencyFormatter } from "../HelperFiles/Constants";
import { ItemInfo } from "../HelperFiles/DataTypes";
import { colors, shadowStyles, styleValues, textStyles, screenUnit, screenWidth, icons, defaultStyles } from "../HelperFiles/StyleSheet";
import CustomComponent from "./CustomComponent";
import CustomImage from "./CustomImage";
import CustomPressable from "./CustomPressable";
import CustomImageButton from "./CustomImageButton";
import Item from "../HelperFiles/Item";

type Props = {
    itemInfo: ItemInfo,
    onLoadEnd?: () => void,
    onPress?: (event?: GestureResponderEvent) => void,
    onPressLike?: (isLiked: boolean) => void
}

type State = {
    status: "highestPrice" | "outbid" | "unliked",
    statusText: string,
    imageLoaded: boolean
}

export default class ItemLikedCard extends CustomComponent<Props, State> {

    constructor(props: Props) {
        super(props);
        this.state = {
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
        if (!this.props.itemInfo.likePrice) {
            this.setState({status: 'unliked', statusText: 'Not liked'})
        } else if (this.props.itemInfo.likePrice >= this.props.itemInfo.item.lastPrice) {
            this.setState({status: 'highestPrice', statusText: 'Most recent like'})
        } else {
            this.setState({status: 'outbid', statusText: 'Liked by other shopper'})
        }
    }

    renderUI() {
        const priceText = currencyFormatter.format(this.state.status === 'highestPrice' ? this.props.itemInfo.likePrice! : this.props.itemInfo.item.currentPrice )
        const priceColor = this.state.status === 'outbid' ? colors.invalid : colors.black 
        const statusColor = this.state.status === 'highestPrice' ? colors.valid : colors.invalid
        return (
        <CustomPressable
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
                source={{uri: this.props.itemInfo.item.images[0]}}
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
                <View style={{flexDirection: "row", marginBottom: styleValues.minorPadding}}>
                    {/* ITEM NAME */}
                    <Text
                        style={{...styles.headerText, flex: 1, marginRight: styleValues.mediumPadding}}
                        numberOfLines={1}
                    >{this.props.itemInfo.item.name}</Text>
                    {/* PRICE */}
                    <View style={{flexDirection: "row", alignItems: "center"}}>
                        {this.state.status === 'outbid' ?
                        <FastImage
                            source={icons.backArrow}
                            resizeMode={"contain"}
                            style={{
                                width: styleValues.iconSmallestSize,
                                aspectRatio: 1,
                                marginRight: styleValues.minorPadding,
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
                                width: styleValues.iconSmallerSize,
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
                            if (this.props.itemInfo.likePrice && this.props.itemInfo.likePrice >= this.props.itemInfo.item.lastPrice) {
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
                            this.updateStatus()
                        }}
                    />
                </View>
            </View>
        </CustomPressable>
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
        borderRadius: styleValues.mediumPadding,
        height: screenUnit * 5,
        width: screenWidth - styleValues.mediumPadding*2,
        marginBottom: styleValues.mediumPadding,
        padding: styleValues.minorPadding,
        flexDirection: "row",
        alignItems: "center",
    },
    productImage: {
        height: "100%",
        aspectRatio: 1,
        borderRadius: styleValues.minorPadding,
        marginRight: styleValues.mediumPadding
    },
    headerText: {
        ...textStyles.medium,
        textAlign: "left"
    },
    statusText: {
        ...textStyles.small,
        textAlign: "left",
        marginHorizontal: styleValues.minorPadding,
        flex: 1
    },
    likeButton: {
        ...shadowStyles.small,
        width: styleValues.iconLargerSize,
        aspectRatio: 1,
        borderRadius: styleValues.majorPadding
    }
})