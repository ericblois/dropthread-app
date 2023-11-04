
import React from "react";
import { GestureResponderEvent, StyleSheet, Text, TouchableOpacity, View, ViewStyle } from "react-native";
import FastImage from "react-native-fast-image";
import BloisPressable from "../BloisComponents/BloisPressable";
import { currencyFormatter } from "../HelperFiles/Constants";
import { ItemData, ItemInfo, OfferData, OfferInfo } from "../HelperFiles/DataTypes";
import { colors, shadowStyles, styVals, textStyles, screenUnit, screenWidth } from "../HelperFiles/StyleSheet";
import CustomComponent from "./CustomComponent";
import CustomImage from "./CustomImage";
import LoadingCover from "./LoadingCover";
import { capitalizeWords } from "../HelperFiles/ClientFunctions";
import * as Icons from "@expo/vector-icons"
import BloisBadge from "../BloisComponents/BloisBadge";
import User from "../HelperFiles/User";
import { BloisTextButton } from "../HelperFiles/CompIndex";


type Props = {
    offerInfo: OfferInfo,
    style?: ViewStyle,
    badgeNumber?: number,
    onLoadEnd?: () => void,
    onPress?: (event?: GestureResponderEvent) => void
}

type State = {
    isFrom: boolean,
    willPayPrice: number,
    willReceivePrice: number
}

export default class OfferSmallCard extends CustomComponent<Props, State> {

    constructor(props: Props) {
        super(props);
        const isFrom = User.getCurrent().uid === props.offerInfo.offer.fromUserID
        this.state = {
            isFrom: isFrom,
            willPayPrice: isFrom ? props.offerInfo.fromFacePrice : props.offerInfo.toFacePrice,
            willReceivePrice: isFrom ? props.offerInfo.toBasePrice - props.offerInfo.fromFeePrice : props.offerInfo.fromBasePrice - props.offerInfo.toFeePrice
        }
    }

    renderUI() {
        return (
        <BloisPressable
            style={{...styles.cardContainer, ...this.props.style}}
            animationType={"shadowSmall"}
            onPress={this.props.onPress}
        >
            <View style={{flex: 1, height: '100%', justifyContent: 'space-between'}}>
                <View style={{flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between'}}>
                    {/* Names */}
                    <Text style={textStyles.medium}>{`From: ${this.state.isFrom ? 'You' : this.props.offerInfo.offer.fromName}`}</Text>
                    <Text style={textStyles.medium}>{`To: ${this.state.isFrom ? this.props.offerInfo.offer.toName : 'You'}`}</Text>
                </View>
                <View style={{flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between'}}>
                    {/* Items */}
                    <Text style={textStyles.medium}>
                        {`${this.props.offerInfo.fromItemInfos.length} item${this.props.offerInfo.fromItemInfos.length === 1 ? '' : 's'}`}
                    </Text>
                    <Text style={textStyles.medium}>
                        {`${this.props.offerInfo.toItemInfos.length} item${this.props.offerInfo.toItemInfos.length === 1 ? '' : 's'}`}
                    </Text>
                </View>
                <View style={{flexDirection: 'row', flex: 1, alignItems: 'flex-end', justifyContent: 'space-between'}}>
                    {/* Cash Icon */}
                    <Icons.FontAwesome5
                        name={'money-bill-wave'}
                        style={{
                            fontSize: styVals.mediumTextSize,
                            color: this.state.willPayPrice > 0 ? colors.lighterGrey : colors.main 
                        }}
                    />
                    {/* Price */}
                    <Text style={{...textStyles.medium, textAlign: 'left', marginLeft: styVals.mediumPadding, flex: 1}}
                    >{`${this.state.willPayPrice > 0 ? 'You pay: ' : 'You receive: '}${currencyFormatter.format(this.state.willPayPrice > 0 ? this.state.willPayPrice : this.state.willReceivePrice)}`}</Text>
                    {/* View offer text */}
                    <View style={{flexDirection: 'row', alignItems: 'center'}}>
                        <Text style={{...textStyles.medium, color: colors.grey}}>View offer</Text>
                        <Icons.Feather
                            name={'chevron-right'}
                            style={{
                                fontSize: styVals.largerTextSize,
                                color: colors.grey
                            }}
                        />
                    </View>
                </View>
            </View>
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
        height: screenUnit * 5,
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
    majorText: {
        ...textStyles.medium,
        textAlign: "left"
    },
    minorText: {
        ...textStyles.medium,
        color: colors.darkGrey,
        textAlign: "left"
    },
})