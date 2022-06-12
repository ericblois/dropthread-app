
import React from "react";
import { GestureResponderEvent, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { currencyFormatter } from "../HelperFiles/Constants";
import { ItemData } from "../HelperFiles/DataTypes";
import { colors, shadowStyles, styleValues, textStyles } from "../HelperFiles/StyleSheet";
import CustomComponent from "./CustomComponent";
import ImageAnimated from "./ImageAnimated";
import LoadingCover from "./LoadingCover";

type Props = {
    itemData: ItemData,
    onLoadEnd?: () => void,
    onPress?: (event?: GestureResponderEvent) => void
}

type State = {
    imageLoaded: boolean
}

export default class SearchResultItem extends CustomComponent<Props, State> {

    constructor(props: Props) {
        super(props);
        this.state = {
            imageLoaded: props.itemData.images.length === 0
        }
    }

    renderUI() {
        return (
        <TouchableOpacity style={{
            flexDirection: "row",
            alignItems: "center",
            height: "100%",
            width: "100%"
        }} onPress={() => {
            if (this.props.onPress) {
                this.props.onPress();
            }
        }}>
            <ImageAnimated
                style={styles.productImage}
                source={{uri: this.props.itemData.images[0]}}
                onLoad={() => {
                    this.setState({imageLoaded: true}, () => {
                        if (this.props.onLoadEnd) {
                            this.props.onLoadEnd();
                        }
                    })
                }}
                imageProps={{
                    resizeMode: "cover"
                }}
            />
            <View style={styles.productInfoArea}>
                <Text
                    style={styles.productName}
                    numberOfLines={2}
                >{this.props.itemData.name}</Text>
                <View style={styles.productSubInfoArea}>
                    <Text style={styles.productPrice}>{this.props.itemData.minPrice >= 0 ? currencyFormatter.format(this.props.itemData.minPrice) : "$0.00"}</Text>
                </View>
            </View>
        </TouchableOpacity>
        );
    }

    renderLoading() {
        if (this.props.itemData === undefined || !this.state.imageLoaded) {
            return (
                <LoadingCover style={{backgroundColor: colors.white}}/>
            )
        }
    }

    render() {
        return (
            <View style={{
                ...styles.cardContainer,
                ...shadowStyles.small
            }}>
                {this.renderUI()}
                {this.renderLoading()}
            </View>
        )
    }
}

const styles = StyleSheet.create({
    cardContainer: {
        backgroundColor: "#fff",
        borderRadius: styleValues.mediumPadding,
        height: styleValues.winWidth * 0.3,
        width: styleValues.winWidth - styleValues.mediumPadding*2,
        marginBottom: styleValues.mediumPadding,
        padding: styleValues.mediumPadding,
        flexDirection: "row",
        alignItems: "center",
    },
    productImage: {
        height: "100%",
        aspectRatio: 1,
        borderRadius: styleValues.mediumPadding,
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