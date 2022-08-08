
import React from "react";
import { GestureResponderEvent, StyleSheet, Text, TouchableOpacity, View, ViewStyle } from "react-native";
import FastImage from "react-native-fast-image";
import CustomPressable from "./CustomPressable";
import { currencyFormatter } from "../HelperFiles/Constants";
import { ItemData, ItemInfo, OfferData, OfferInfo } from "../HelperFiles/DataTypes";
import { colors, shadowStyles, styleValues, textStyles, screenUnit, screenWidth } from "../HelperFiles/StyleSheet";
import CustomComponent from "./CustomComponent";
import CustomImage from "./CustomImage";
import LoadingCover from "./LoadingCover";
import { capitalizeWords } from "../HelperFiles/ClientFunctions";
import * as Icons from "@expo/vector-icons"
import CustomBadge from "./CustomBadge";
import User from "../HelperFiles/User";
import { CustomTextButton } from "../HelperFiles/CompIndex";


type Props = {
    offerInfo: OfferInfo,
    style?: ViewStyle,
    badgeNumber?: number,
    showCustomPrice?: number,
    onLoadEnd?: () => void,
    onPress?: (event?: GestureResponderEvent) => void
}

type State = {
    wasSent: boolean,
    willPay: boolean,
    price: number
}

export default class ItemSmallCard extends CustomComponent<Props, State> {

    constructor(props: Props) {
        super(props);
        // Determine if this offer was sent by this user
        let wasSent = User.getCurrent().uid === props.offerInfo.offer.fromID ? true : false
        // Determine if this user will pay
        let willPay = false
        if (wasSent && props.offerInfo.offer.fromPayment) {
            willPay = true
        } else if (!wasSent && props.offerInfo.offer.toPayment) {
            willPay = true
        }
        // Determine the display price
        let price = props.offerInfo.offer.toPayment || props.offerInfo.offer.fromPayment
        this.state = {
            wasSent: wasSent,
            willPay: willPay,
            price: price!
        }
    }

    renderUI() {
        return (
        <CustomPressable
            style={{...styles.cardContainer, ...this.props.style}}
            animationType={"shadow"}
            onPress={this.props.onPress}
        >
            <View style={{flex: 1, height: '100%', justifyContent: 'space-between'}}>
                <View style={{flexDirection: 'row', alignItems: 'center'}}>
                    {/* Cash Icon */}
                    <Icons.FontAwesome5
                        name={'money-bill-wave'}
                        style={{
                            fontSize: styleValues.mediumTextSize,
                            color: this.state.willPay ? colors.darkGrey : colors.main 
                        }}
                    />
                    {/* Price */}
                    <Text style={{...textStyles.medium, textAlign: 'left', marginLeft: styleValues.mediumPadding, flex: 1}}
                    >{currencyFormatter.format(this.state.price)}</Text>
                    {/* Name */}
                    <Text numberOfLines={1} style={{...textStyles.medium, textAlign: 'right', marginRight: styleValues.minorPadding, maxWidth: '50%'}}>
                        {this.state.wasSent
                            ? capitalizeWords(this.props.offerInfo.offer.toName)
                            : capitalizeWords(this.props.offerInfo.offer.fromName)
                        }
                    </Text>
                </View>
                <View style={{flexDirection: 'row', alignItems: 'flex-end', justifyContent: 'space-between'}}>
                    {/* Items */}
                    <View style={{alignItems: 'flex-start'}}>
                        <Text style={textStyles.small}>
                            {`Your items: ${this.state.wasSent
                                ? this.props.offerInfo.fromItems.length
                                : this.props.offerInfo.toItems.length
                            }`}
                        </Text>
                        <Text style={textStyles.small}>
                            {`Their items: ${!this.state.wasSent
                                ? this.props.offerInfo.fromItems.length
                                : this.props.offerInfo.toItems.length
                            }`}
                        </Text>
                    </View>
                    {/* View offer text */}
                    <View style={{flexDirection: 'row', alignItems: 'center'}}>
                        <Text style={{...textStyles.small, color: colors.grey}}>View offer</Text>
                        <Icons.Feather
                            name={'chevron-right'}
                            style={{
                                fontSize: styleValues.largerTextSize,
                                color: colors.grey
                            }}
                        />
                    </View>
                </View>
            </View>
            {this.props.badgeNumber ?
            <CustomBadge number={this.props.badgeNumber}/>
            : undefined}
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
        paddingLeft: styleValues.mediumPadding,
        flexDirection: "row",
        alignItems: "center"
    },
    productImage: {
        height: "100%",
        aspectRatio: 1,
        borderRadius: styleValues.minorPadding,
        marginLeft: styleValues.mediumPadding
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
        ...textStyles.small,
        textAlign: "left"
    },
    minorText: {
        ...textStyles.small,
        color: colors.darkGrey,
        textAlign: "left"
    },
})