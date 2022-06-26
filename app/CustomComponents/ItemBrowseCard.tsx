
import React from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { capitalizeWords } from "../HelperFiles/ClientFunctions";
import { currencyFormatter } from "../HelperFiles/Constants";
import { ItemData, ItemInfo } from "../HelperFiles/DataTypes";
import Item from "../HelperFiles/Item";
import { colors, icons, screenWidth, shadowStyles, styleValues, textStyles } from "../HelperFiles/StyleSheet";
import CustomComponent from "./CustomComponent";
import IconButton from "./IconButton";
import ImageSlider from "./ImageSlider";
import LoadingCover from "./LoadingCover";

type Props = {
    itemInfo: ItemInfo,
    onLoadEnd?: () => void,
    onPressCard?: () => void,
    onPressLike?: (isLiked: boolean) => void
}

type State = {
    imageLoaded: boolean
}

export default class ItemBrowseCard extends CustomComponent<Props, State> {

    constructor(props: Props) {
        super(props);
        this.state = {
            imageLoaded: false
        }
    }

    renderLikeButton() {
        return (
            <IconButton
                iconSource={icons.hollowHeart}
                buttonStyle={styles.likeButton}
                iconStyle={{tintColor: this.props.itemInfo.likePrice ? colors.valid : colors.lightGrey}}
                buttonFunc={() => {
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
                    console.log(this.props.itemInfo)
                    this.forceUpdate()
                }}
            />
        )
    }

    renderUI() {
        return (
        <View
            style={{
                flexDirection: "column",
                alignItems: "center",
                height: "100%",
                width: "100%"
            }}
        >
            <ImageSlider
                uris={this.props.itemInfo.item.images}
                minRatio={1}
                maxRatio={1.5}
                fadeColor={colors.white}
                onImagesLoaded={() => {
                    this.setState({imageLoaded: true}, () => {
                        if (this.props.onLoadEnd) {
                            this.props.onLoadEnd();
                        }
                    })
                }}
            />
            {/*  */}
            <View style={styles.itemInfoContainer}>
                {/* Name, price, distance */}
                <View
                    style={{flexDirection: "row"}}
                >
                    {/* Name */}
                    <Text
                        style={{...styles.headerText, flex: 2/3}}
                        numberOfLines={2}
                    >{this.props.itemInfo.item.name}</Text>
                    {/* Price, distance */}
                    <View style={{flexDirection: "column", flex: 1/3}}>
                        <Text style={{...styles.headerText, textAlign: "right"}}>{currencyFormatter.format(this.props.itemInfo.item.currentPrice)}</Text>
                        <Text style={{...styles.minorText, textAlign: "right"}}>{`within ${this.props.itemInfo.distance}km`}</Text>
                    </View>
                </View>
                <Text style={styles.headerText}>Information:</Text>
                {/* Article */}
                {this.props.itemInfo.item.category ? 
                <Text style={styles.majorText}>{`Article: ${capitalizeWords(this.props.itemInfo.item.category)}`}</Text>
                : undefined}
                {/* Condition */}
                {this.props.itemInfo.item.condition ? 
                <Text style={styles.majorText}>{`Condition: ${capitalizeWords(this.props.itemInfo.item.condition)}`}</Text>
                : undefined}
                {/* Fit */}
                {this.props.itemInfo.item.fit ? 
                <Text style={styles.majorText}>{`Fit: ${capitalizeWords(this.props.itemInfo.item.fit)}`}</Text>
                : undefined}
            </View>
            {this.renderLikeButton()}
        </View>
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
            <View
                style={{
                    width: screenWidth,
                    paddingHorizontal: styleValues.mediumPadding
                }}
            >
                <Pressable style={({pressed}) => ({
                    ...styles.cardContainer,
                    ...(pressed ? shadowStyles.medium : shadowStyles.small),
                })}
                    onPress={this.props.onPressCard}
                    pointerEvents={"box-none"}
                >
                    {this.renderUI()}
                    {this.renderLoading()}
                </Pressable>
            </View>
        )
    }
}

export const styles = StyleSheet.create({
    cardContainer: {
        backgroundColor: "#fff",
        borderRadius: styleValues.mediumPadding,
        height: "100%",
        width: "100%",
        overflow: "hidden"
    },
    itemInfoContainer: {
        flex: 1,
        width: "100%",
        padding: styleValues.mediumPadding,
        paddingTop: 0,
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
        color: colors.grey,
        textAlign: "left"
    },
    likeButton: {
        ...shadowStyles.small,
        position: "absolute",
        bottom: styleValues.mediumPadding*2,
        right: styleValues.mediumPadding*2,
        width: styleValues.iconLargesterSize,
        height: styleValues.iconLargesterSize,
        borderRadius: styleValues.majorPadding
    }
})