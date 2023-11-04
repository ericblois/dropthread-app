
import React from "react";
import { ActivityIndicator, ActivityIndicatorProps, StyleSheet, Text, View, ViewStyle } from "react-native";
import { colors, defaultStyles, icons, screenWidth, styVals, textStyles } from "../HelperFiles/StyleSheet";
import CustomComponent from "./CustomComponent";
import CustomImageButton from "./CustomImageButton";
import BloisIconButton from "../BloisComponents/BloisIconButton";


type Props = {
    style?: ViewStyle,
    size?: "small" | "large",
    indicatorProps?: ActivityIndicatorProps,
    errorText?: string,
    onErrorRefresh?: () => void
}

type State = {
}

export default class LoadingCover extends CustomComponent<Props, State> {

    render() {
        return (
            <View
                style={{
                    ...defaultStyles.fill,
                    alignItems: "center",
                    justifyContent: "center",
                    borderRadius: styVals.mediumPadding,
                    backgroundColor: colors.background,
                    ...this.props.style
                }}
            >
                {this.props.errorText ? 
                <>
                    <Text
                        style={{
                            ...textStyles.medium,
                            marginBottom: styVals.mediumPadding,
                            color: colors.grey
                        }}
                    >{this.props.errorText}</Text>
                    <BloisIconButton
                        icon={{
                            type: 'Ionicons',
                            name: 'refresh'
                        }}
                        style={{
                            height: styVals.iconMediumSize,
                            width: styVals.iconMediumSize
                        }}
                        animType={'opacity'}
                        iconStyle={{color: colors.lightGrey}}
                        onPress={this.props.onErrorRefresh}
                    />
                </> :
                <ActivityIndicator
                    size={this.props.size}
                    {...this.props.indicatorProps}
                />}
            </View>
        )
    }
}

const styles = StyleSheet.create({
    cardContainer: {
        backgroundColor: "#fff",
        borderRadius: styVals.mediumPadding,
        minHeight: screenWidth * 0.25,
        width: "100%",
        padding: styVals.mediumPadding,
        marginBottom: styVals.mediumPadding,
        flexDirection: "row",
        alignItems: "center",
    },
    profileImage: {
        width: screenWidth * 0.15,
        aspectRatio: 1,
        borderRadius: styVals.minorPadding,
        marginRight: styVals.mediumPadding
    },
})