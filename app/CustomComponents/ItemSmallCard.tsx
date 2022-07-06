
import React from "react";
import { GestureResponderEvent, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import FastImage from "react-native-fast-image";
import CustomPressable from "./CustomPressable";
import { currencyFormatter } from "../HelperFiles/Constants";
import { ItemData, ItemInfo } from "../HelperFiles/DataTypes";
import { colors, shadowStyles, styleValues, textStyles, screenUnit, screenWidth } from "../HelperFiles/StyleSheet";
import CustomComponent from "./CustomComponent";
import CustomImage from "./CustomImage";
import LoadingCover from "./LoadingCover";
import { capitalizeWords } from "../HelperFiles/ClientFunctions";
import * as Icons from "@expo/vector-icons"


type Props = {
    itemInfo: ItemInfo,
    onLoadEnd?: () => void,
    onPress?: (event?: GestureResponderEvent) => void
}

type State = {
    imageLoaded: boolean
}

export default class ItemSmallCard extends CustomComponent<Props, State> {

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
            <CustomImage
                style={styles.productImage}
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
            <View style={{flex: 1, height: '100%', justifyContent: 'space-between'}}>
                <View style={{flexDirection: 'row', alignItems: 'center'}}>
                    {/* Popular item? */}
                    {this.props.itemInfo.item.likeCount >= 0 ?
                        <Icons.MaterialCommunityIcons
                            name="fire"
                            style={{
                                fontSize: styleValues.iconSmallSize,
                                color: colors.flame,
                                //borderWidth: 1,
                                marginLeft: -styleValues.minorPadding,
                                height: styleValues.largerTextSize
                            }}
                        /> : undefined}
                    {/* Name */}
                    <Text
                        style={{...styles.majorText, flex: 1}}
                        numberOfLines={2}
                    >{this.props.itemInfo.item.name}</Text>
                    {/* Price */}
                    <Text style={{...styles.headerText, textAlign: 'right'}}
                    >{currencyFormatter.format(this.props.itemInfo.item.currentPrice)}</Text>
                </View>
                {/* Gender / category, distance */}
                <View style={{flexDirection: "row", justifyContent: 'space-between', alignItems: 'flex-end'}}>
                    <View>
                        <Text style={{...styles.minorText}}>{
                        capitalizeWords(`${this.props.itemInfo.item.gender !== 'unisex' ? this.props.itemInfo.item.gender + `'s` : ``} ${this.props.itemInfo.item.category !== 'other' ? this.props.itemInfo.item.category : ''}`)
                        }</Text>
                        <Text style={styles.minorText}>{capitalizeWords(this.props.itemInfo.item.size)}</Text>
                    </View>
                    <Text style={{...styles.minorText, textAlign: "right"}}>{`${this.props.itemInfo.distance} km`}</Text>
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
        backgroundColor: colors.background,
        borderRadius: styleValues.mediumPadding,
        height: screenUnit * 5,
        width: screenWidth - styleValues.mediumPadding*2,
        marginBottom: styleValues.mediumPadding,
        padding: styleValues.minorPadding,
        flexDirection: "row",
        alignItems: "center"
    },
    productImage: {
        height: "100%",
        aspectRatio: 1,
        borderRadius: styleValues.minorPadding,
        marginRight: styleValues.mediumPadding
    },
    productSubInfoArea: {
        width: "100%",
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "flex-end",
        position: "absolute",
        bottom: 0
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
})