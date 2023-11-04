
import React from "react";
import { GestureResponderEvent, StyleSheet, Text, TouchableOpacity, View, ViewStyle } from "react-native";
import FastImage from "react-native-fast-image";
import BloisPressable from "../BloisComponents/BloisPressable";
import { currencyFormatter } from "../HelperFiles/Constants";
import { ItemData, ItemInfo } from "../HelperFiles/DataTypes";
import { colors, shadowStyles, styVals, textStyles, screenUnit, screenWidth } from "../HelperFiles/StyleSheet";
import CustomComponent from "./CustomComponent";
import CustomImage from "./CustomImage";
import LoadingCover from "./LoadingCover";
import { capitalizeWords } from "../HelperFiles/ClientFunctions";
import * as Icons from "@expo/vector-icons"
import BloisBadge from "../BloisComponents/BloisBadge";
import User from "../HelperFiles/User";


type Props = {
    itemInfo: ItemInfo,
    style?: ViewStyle,
    badgeNumber?: number,
    hidePrice?: boolean,
    showCustomPrice?: number,
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
        <BloisPressable
            style={{...styles.cardContainer, ...this.props.style}}
            onPress={this.props.onPress}
        >
            <View style={{flex: 1, height: '100%', justifyContent: 'space-between'}}>
                <View style={{flexDirection: 'row', alignItems: 'flex-start'}}>
                    {/* Popular item? */}
                    {this.props.itemInfo.item.likeCount >= 0 ?
                        <Icons.MaterialCommunityIcons
                            name="fire"
                            style={{
                                fontSize: styVals.iconSmallSize,
                                color: colors.flame,
                                marginLeft: -styVals.minorPadding,
                                height: styVals.largerTextSize
                            }}
                        /> : undefined}
                    {/* Name */}
                    <Text
                        style={{...styles.majorText, flex: 1}}
                        numberOfLines={1}
                    >{this.props.itemInfo.item.name}</Text>
                </View>
                {/* Gender / category, distance */}
                <View style={{flexDirection: "row", justifyContent: 'space-between', alignItems: 'flex-end'}}>
                    <View style={{flex: 1}}>
                        <Text style={{...styles.minorText}}>{
                        capitalizeWords(`${this.props.itemInfo.item.gender !== 'unisex' ? this.props.itemInfo.item.gender + `'s ` : ``}${this.props.itemInfo.item.category !== 'other' ? this.props.itemInfo.item.category : ''}`)
                        }</Text>
                        <Text
                            style={styles.minorText}
                            numberOfLines={1}
                        >Size: {capitalizeWords(this.props.itemInfo.item.size)}</Text>
                        <Text style={{...styles.minorText}}>{`within ${this.props.itemInfo.distance} km`}</Text>
                    </View>
                    {/* Price */}
                    {this.props.hidePrice !== true ?
                        <Text style={{
                            ...styles.headerText,
                            textAlign: 'right',
                        }}
                        numberOfLines={1}
                        >{currencyFormatter.format(this.props.showCustomPrice !== undefined
                            ? this.props.showCustomPrice
                            : (this.props.itemInfo.item.userID === User.getCurrent().uid
                                ? this.props.itemInfo.item.priceData.minPrice
                                : this.props.itemInfo.item.priceData.facePrice
                            ))
                            .substring(0, 9)}
                        </Text>
                    : undefined}
                    
                </View>
            </View>
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
            {this.props.badgeNumber ?
            <BloisBadge number={this.props.badgeNumber}/>
            : undefined}
            
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
        backgroundColor: colors.background,
        borderRadius: styVals.mediumPadding,
        height: screenUnit * 6,
        width: screenWidth - styVals.mediumPadding*2,
        marginBottom: styVals.mediumPadding,
        padding: styVals.minorPadding,
        paddingLeft: styVals.mediumPadding,
        flexDirection: "row",
        alignItems: "center"
    },
    productImage: {
        height: "100%",
        aspectRatio: 1,
        borderRadius: styVals.minorPadding,
        marginLeft: styVals.mediumPadding
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
        ...textStyles.large,
        textAlign: "left"
    },
    majorText: {
        ...textStyles.medium,
        textAlign: "left"
    },
    minorText: {
        ...textStyles.medium,
        color: colors.darkGrey,
        textAlign: "left",
    },
})