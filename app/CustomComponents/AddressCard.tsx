
import React from "react";
import { GestureResponderEvent, Linking, Platform, StyleSheet, Text, TouchableOpacity, View, ViewStyle } from "react-native";
import FastImage from "react-native-fast-image";
import BloisPressable from "../BloisComponents/BloisPressable";
import { currencyFormatter } from "../HelperFiles/Constants";
import { AddressData, ItemData, ItemInfo } from "../HelperFiles/DataTypes";
import { colors, shadowStyles, styleValues, textStyles, screenUnit, screenWidth, defaultStyles } from "../HelperFiles/StyleSheet";
import CustomComponent from "./CustomComponent";
import CustomImage from "./CustomImage";
import LoadingCover from "./LoadingCover";
import { capitalizeWords } from "../HelperFiles/ClientFunctions";
import * as Icons from "@expo/vector-icons"
import CustomBadge from "./CustomBadge";
import User from "../HelperFiles/User";
import BloisIconButton from "../BloisComponents/BloisIconButton";


type Props = {
    addressData: AddressData,
    style?: ViewStyle,
    showDirections?: boolean,
    onPress?: () => void
}

type State = {
    
}

export default class AddressCard extends CustomComponent<Props, State> {

    constructor(props: Props) {
        super(props);
        this.state = {
            
        }
    }

    render() {
        return (
        <BloisPressable
            style={{
                ...defaultStyles.roundedBox,
                ...shadowStyles.small,
                flexDirection: 'row',
                justifyContent: 'space-between',
                ...this.props.style
            }}
            animationType={"shadowSmall"}
            onPress={this.props.onPress}
        >
            <View
                style={{
                    alignItems: 'flex-start',
                    justifyContent: 'space-around'
                }}
            >
                <Text
                    style={{
                        ...textStyles.small,
                        textAlign: 'left'
                    }}
                    numberOfLines={1}
                >{this.props.addressData.name}</Text>
                <Text style={{
                    ...textStyles.smaller,
                    textAlign: 'left',
                    color: colors.grey
                }}>
                    {`${this.props.addressData.streetAddress}, ${this.props.addressData.apartment ? `Unit ${this.props.addressData.apartment}, ` : ''}${this.props.addressData.postalCode}`}
                </Text>
                <Text
                    style={{
                        ...textStyles.smaller,
                        textAlign: 'left',
                        color: colors.grey
                    }}
                    numberOfLines={1}
                >
                    {`${this.props.addressData.city}, ${this.props.addressData.region ? `${this.props.addressData.region}, ` : ''}${this.props.addressData.country}`}
                </Text>
            </View>
            {this.props.showDirections ? 
            <BloisIconButton
                name="directions"
                type="FontAwesome5"
                buttonStyle={{
                    ...defaultStyles.roundedBox,
                    ...shadowStyles.small,
                    width: styleValues.mediumHeight,
                    marginBottom: 0,
                    justifyContent: 'center',
                    aspectRatio: 1
                }}
                iconStyle={{
                    color: colors.main,
                    fontSize: styleValues.largestTextSize,
                    paddingTop: styleValues.minorPadding/2,
                }}
                onPress={() => {
                    // Get platform-specific map URL
                    const scheme = Platform.select({ ios: 'maps://0,0?q=', android: 'geo:0,0?q='})!;
                    const latLng = `${this.props.addressData.lat},${this.props.addressData.long}`;
                    const label = this.props.addressData.name;
                    const url = Platform.select({
                        ios: `${scheme}${label}@${latLng}`,
                        android: `${scheme}${latLng}(${label})`
                    })!;
                    // Open the map URL
                    Linking.openURL(url);
                }}
            />
            : undefined}
        </BloisPressable>
        );
    }
}