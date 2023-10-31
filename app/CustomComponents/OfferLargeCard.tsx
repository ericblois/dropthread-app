
import React from "react";
import { Text, View, ViewStyle } from "react-native";
import { currencyFormatter } from "../HelperFiles/Constants";
import { ItemInfo, OfferInfo } from "../HelperFiles/DataTypes";
import { colors, shadowStyles, styleValues, textStyles, defaultStyles } from "../HelperFiles/StyleSheet";
import CustomComponent from "./CustomComponent";
import * as Icons from "@expo/vector-icons"
import User from "../HelperFiles/User";
import ItemSmallCard from "./ItemSmallCard";
import BloisIconButton from "../BloisComponents/BloisIconButton";


type Props = {
    offerInfo: OfferInfo,
    style?: ViewStyle,
    badgeNumber?: number,
    onPressItem?: (itemInfo: ItemInfo) => void,
    onLoadEnd?: () => void,
    removeItem?: (itemInfo: ItemInfo) => void
}

type State = {
    isFrom: boolean,
    imagesLoaded: number
}

export default class OfferLargeCard extends CustomComponent<Props, State> {

    constructor(props: Props) {
        super(props);
        this.state = {
            isFrom: props.offerInfo.offer.fromUserID === User.getCurrent().uid,
            imagesLoaded: 0
        }
    }


    renderReceived() {
        if (this.props.offerInfo) {
            const basePrice = this.state.isFrom ? this.props.offerInfo.toBasePrice : this.props.offerInfo.fromBasePrice;
            const receivedItems = this.state.isFrom ? this.props.offerInfo.toItemInfos : this.props.offerInfo.fromItemInfos;
            return (
                <>
                    <Text
                        style={textStyles.largeHeader}
                    >You receive:</Text>
                    {basePrice > 0 ? 
                    <View style={{...shadowStyles.small, ...defaultStyles.roundedBox, alignItems: 'flex-start', justifyContent: 'flex-start'}}>
                        <Text style={{...textStyles.medium, textAlign: 'left', color: colors.darkGrey}}>{`Base: ${currencyFormatter.format(basePrice)}`}</Text>
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
                            <Text style={{...textStyles.medium, textAlign: 'left'}}>{`Payment of ${currencyFormatter.format(basePrice)}`}</Text>
                            <Icons.FontAwesome5
                                name={'money-bill-wave'}
                                style={{
                                    fontSize: styleValues.mediumTextSize,
                                    color: colors.main
                                }}
                            />
                        </View>
                    </View> : undefined}
                    {receivedItems.map((itemInfo, index) => {
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
                                {this.props.offerInfo?.offer.itemIDs.length > 1 && this.props.removeItem ?
                                <BloisIconButton
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
                                            this.props.removeItem!(itemInfo)
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
            const basePrice = this.state.isFrom ? this.props.offerInfo.fromBasePrice : this.props.offerInfo.toBasePrice;
            const feePrice = this.state.isFrom ? this.props.offerInfo.fromFeePrice : this.props.offerInfo.toFeePrice;
            const facePrice = this.state.isFrom ? this.props.offerInfo.fromFacePrice : this.props.offerInfo.toFacePrice;
            const givenItems = this.state.isFrom ? this.props.offerInfo.fromItemInfos : this.props.offerInfo.toItemInfos;
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
                    {facePrice > 0 ?
                        <>
                        <Text style={textStyles.largeHeader}>You pay:</Text>
                        <View style={{...shadowStyles.small, ...defaultStyles.roundedBox, alignItems: 'flex-start', justifyContent: 'flex-start'}}>
                            {basePrice > 0 ? 
                                <Text style={{...textStyles.medium, textAlign: 'left', color: colors.darkGrey}}>{`Base: ${currencyFormatter.format(basePrice)}`}</Text>
                            : undefined}
                            {feePrice > 0 ? 
                                <Text style={{...textStyles.medium, textAlign: 'left', color: colors.darkGrey}}>{`Fee: ${currencyFormatter.format(feePrice)}`}</Text>
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
                                <Text style={{...textStyles.medium, textAlign: 'left'}}>{`Payment of ${currencyFormatter.format(feePrice)}`}</Text>
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
                    {givenItems.length > 0 ?
                        <Text style={textStyles.largeHeader}>Your items:</Text>
                    : undefined}
                    {givenItems.map((itemInfo, index) => {
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
                                {this.props.offerInfo?.offer.itemIDs.length > 1 && this.props.removeItem ?
                                <BloisIconButton
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
                                            this.props.removeItem!(itemInfo)
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