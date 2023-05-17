
import React from "react";
import { GestureResponderEvent, StyleSheet, Text, TouchableOpacity, View, ViewStyle } from "react-native";
import FastImage from "react-native-fast-image";
import CustomPressable from "./CustomPressable";
import { currencyFormatter } from "../HelperFiles/Constants";
import { ItemData, ItemInfo, OfferData, OfferInfo } from "../HelperFiles/DataTypes";
import { colors, shadowStyles, styleValues, textStyles, screenUnit, screenWidth, defaultStyles } from "../HelperFiles/StyleSheet";
import CustomComponent from "./CustomComponent";
import CustomImage from "./CustomImage";
import LoadingCover from "./LoadingCover";
import { capitalizeWords } from "../HelperFiles/ClientFunctions";
import * as Icons from "@expo/vector-icons"
import CustomBadge from "./CustomBadge";
import User from "../HelperFiles/User";
import ItemSmallCard from "./ItemSmallCard";
import CustomIconButton from "./CustomIconButton";


type Props = {
    offerInfo: OfferInfo,
    style?: ViewStyle,
    badgeNumber?: number,
    onPressItem?: (itemInfo: ItemInfo) => void,
    onLoadEnd?: () => void,
    removeItem?: (itemInfo: ItemInfo) => void
}

type State = {
    imagesLoaded: number
}

export default class OfferLargeCard extends CustomComponent<Props, State> {

    constructor(props: Props) {
        super(props);
        this.state = {
            imagesLoaded: 0
        }
    }


    renderReceived() {
        if (this.props.offerInfo) {
            return (
                <>
                    <Text
                        style={textStyles.mediumHeader}
                    >You receive:</Text>
                    {this.props.offerInfo.toBasePrice > 0 ? 
                    <View style={{...shadowStyles.small, ...defaultStyles.roundedBox, alignItems: 'flex-start', justifyContent: 'flex-start'}}>
                        <Text style={{...textStyles.small, textAlign: 'left', color: colors.darkGrey}}>{`Base: ${currencyFormatter.format(this.props.offerInfo.toBasePrice)}`}</Text>
                        <View
                            style={{
                                flexDirection: 'row',
                                justifyContent: 'space-between',
                                alignItems: 'center',
                                width: '100%',
                                borderTopWidth: styleValues.minorBorderWidth,
                                borderColor: colors.grey,
                                paddingTop: styleValues.mediumPadding,
                                marginTop: styleValues.mediumPadding
                            }}
                        >
                            <Text style={{...textStyles.small, textAlign: 'left'}}>{`Payment of ${currencyFormatter.format(this.props.offerInfo.toBasePrice)}`}</Text>
                            <Icons.FontAwesome5
                                name={'money-bill-wave'}
                                style={{
                                    fontSize: styleValues.mediumTextSize,
                                    color: colors.main
                                }}
                            />
                        </View>
                    </View> : undefined}
                    {this.props.offerInfo.toItemInfos.map((itemInfo, index) => {
                        return (
                            <View key={index.toString()}>
                                <ItemSmallCard
                                    itemInfo={itemInfo}
                                    style={{...shadowStyles.small, width: '100%'}}
                                    hidePrice
                                    onPress={() => {
                                        if (this.props.onPressItem) {
                                            this.props.onPressItem(itemInfo);
                                        }
                                    }}
                                    onLoadEnd={() => this.setState({imagesLoaded: this.state.imagesLoaded + 1}, () => {
                                        if (this.props.onLoadEnd && this.state.imagesLoaded >= this.props.offerInfo.offer.itemIDs.length) {
                                            this.props.onLoadEnd();
                                        }
                                    })}
                                />
                                {this.props.offerInfo!.offer.itemIDs.length > 1 ?
                                <CustomIconButton
                                        name="close"
                                        type="AntDesign"
                                        buttonStyle={{
                                            position: 'absolute',
                                            top: styleValues.mediumPadding,
                                            right: styleValues.mediumPadding,
                                            backgroundColor: colors.invalid,
                                            height: styleValues.iconSmallSize,
                                            borderRadius: styleValues.iconMediumSize,
                                            padding: styleValues.minorPadding
                                        }}
                                        iconStyle={{color: colors.white}}
                                        onPress={() => {
                                            if (this.props.removeItem) {
                                                this.props.removeItem(itemInfo)
                                            }
                                        }}
                                    />
                                : undefined}
                            </View>
                        )
                    })}
                </>
            )
        }
    }

    renderGiven() {
        if (this.props.offerInfo) {
            return (
                <>
                    <View
                        style={{
                            width: '100%',
                            alignItems: 'center',
                            justifyContent: 'center',
                            marginTop: styleValues.mediumPadding
                        }}
                    >
                        <Icons.Octicons
                            name={"arrow-switch"}
                            style={{
                                fontSize: styleValues.largeTextSize,
                                color: colors.darkerGrey,
                                transform: [{rotate: '90deg'}]
                            }}
                        />
                    </View>
                    {this.props.offerInfo.fromFacePrice > 0 ?
                        <>
                        <Text style={textStyles.mediumHeader}>You pay:</Text>
                        <View style={{...shadowStyles.small, ...defaultStyles.roundedBox, alignItems: 'flex-start', justifyContent: 'flex-start'}}>
                            {this.props.offerInfo.fromBasePrice > 0 ? 
                                <Text style={{...textStyles.small, textAlign: 'left', color: colors.darkGrey}}>{`Base: ${currencyFormatter.format(this.props.offerInfo.fromBasePrice)}`}</Text>
                            : undefined}
                            {this.props.offerInfo.fromFeePrice > 0 ? 
                                <Text style={{...textStyles.small, textAlign: 'left', color: colors.darkGrey}}>{`Fee: ${currencyFormatter.format(this.props.offerInfo.fromFeePrice)}`}</Text>
                            : undefined}
                            <View
                                style={{
                                    flexDirection: 'row',
                                    justifyContent: 'space-between',
                                    alignItems: 'center',
                                    width: '100%',
                                    borderTopWidth: styleValues.minorBorderWidth,
                                    borderColor: colors.grey,
                                    paddingTop: styleValues.mediumPadding,
                                    marginTop: styleValues.mediumPadding
                                }}
                            >
                                <Text style={{...textStyles.small, textAlign: 'left'}}>{`Payment of ${currencyFormatter.format(this.props.offerInfo.fromFacePrice)}`}</Text>
                                <Icons.FontAwesome5
                                    name={'money-bill-wave'}
                                    style={{
                                        fontSize: styleValues.mediumTextSize,
                                        color: colors.main
                                    }}
                                />
                            </View>
                        </View>
                        </>
                    : undefined}
                    {this.props.offerInfo.fromItemInfos.length > 0 ?
                        <Text style={textStyles.mediumHeader}>Your items:</Text>
                    : undefined}
                    {this.props.offerInfo.fromItemInfos.map((itemInfo, index) => {
                        return (
                            <View key={index.toString()}>
                                <ItemSmallCard
                                    itemInfo={itemInfo}
                                    style={{...shadowStyles.small, width: '100%'}}
                                    hidePrice
                                    onPress={() => {
                                        if (this.props.onPressItem) {
                                            this.props.onPressItem(itemInfo);
                                        }
                                    }}
                                    onLoadEnd={() => this.setState({imagesLoaded: this.state.imagesLoaded + 1}, () => {
                                        if (this.props.onLoadEnd && this.state.imagesLoaded >= this.props.offerInfo.offer.itemIDs.length) {
                                            this.props.onLoadEnd();
                                        }
                                    })}
                                />
                                {this.props.offerInfo!.offer.itemIDs.length > 1 ?
                                <CustomIconButton
                                        name="close"
                                        type="AntDesign"
                                        buttonStyle={{
                                            position: 'absolute',
                                            top: styleValues.mediumPadding,
                                            right: styleValues.mediumPadding,
                                            backgroundColor: colors.invalid,
                                            height: styleValues.iconSmallSize,
                                            borderRadius: styleValues.iconMediumSize,
                                            padding: styleValues.minorPadding
                                        }}
                                        iconStyle={{color: colors.white}}
                                        onPress={() => {
                                            if (this.props.removeItem) {
                                                this.props.removeItem(itemInfo)
                                            }
                                        }}
                                    />
                                : undefined}
                            </View>
                        )
                    })}
                </>
            )
        }
    }

    render() {
        return (
            <View
                style={{
                    ...shadowStyles.large,
                    ...defaultStyles.roundedBox,
                    paddingTop: 0
                }}
            >
                {this.renderReceived()}
                {this.renderGiven()}
            </View>
        )
    }
}