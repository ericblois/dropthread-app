
import React from "react";
import { GestureResponderEvent, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import FastImage from "react-native-fast-image";
import CustomPressable from "./CustomPressable";
import { currencyFormatter } from "../HelperFiles/Constants";
import { ItemData, ItemInfo } from "../HelperFiles/DataTypes";
import { colors, shadowStyles, styleValues, textStyles, screenUnit, screenWidth } from "../HelperFiles/StyleSheet";
import CustomComponent from "./CustomComponent";
import ImageAnimated from "./ImageAnimated";
import LoadingCover from "./LoadingCover";

type Props = {
    itemInfo: ItemInfo,
    onLoadEnd?: () => void,
    onPress?: (event?: GestureResponderEvent) => void
}

type State = {
    imageLoaded: boolean
}

export default class ItemClosetCard extends CustomComponent<Props, State> {

    constructor(props: Props) {
        super(props);
        this.state = {
            imageLoaded: props.itemInfo.item.images.length === 0
        }
    }

    renderUI() {
        return (
        <CustomPressable
            style={styles.cardContainer}
            animationType={"shadow"}
            onPress={this.props.onPress}
        >
            <ImageAnimated
                style={{
                    ...styles.productImage,
                    borderTopEndRadius: 5
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
            <View style={styles.productInfoArea}>
                <Text
                    style={styles.productName}
                    numberOfLines={2}
                >{this.props.itemInfo.item.name}</Text>
                <View style={styles.productSubInfoArea}>
                    <Text style={styles.productPrice}>{this.props.itemInfo.item.minPrice >= 0 ? currencyFormatter.format(this.props.itemInfo.item.minPrice) : "$0.00"}</Text>
                </View>
            </View>
        </CustomPressable>
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
            this.renderUI()
        )
    }
}

const styles = StyleSheet.create({
    cardContainer: {
        backgroundColor: "#fff",
        borderRadius: styleValues.mediumPadding,
        height: screenUnit * 6,
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
    productInfoArea: {
        height: "100%",
        flex: 1,
    },
    productName: {
        ...textStyles.medium,
        textAlign: "left"
    },
    productDescription: {
        ...textStyles.smaller,
        textAlign: "left",
        color: colors.minorTextColor,
    },
    productPrice: {
        ...textStyles.medium
    },
    productSubInfoArea: {
        width: "100%",
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "flex-end",
        position: "absolute",
        bottom: 0
    }
})