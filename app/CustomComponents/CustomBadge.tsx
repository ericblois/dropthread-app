import React from "react";
import { Animated, GestureResponderEvent, LayoutRectangle, Pressable, PressableProps, StyleSheet, Text, View, ViewStyle } from "react-native";
import FastImage, { FastImageProps, ImageStyle, Source } from "react-native-fast-image";
import { colors, defaultStyles, icons, styleValues, textStyles } from "../HelperFiles/StyleSheet";
import CustomComponent from "./CustomComponent";

type CustomBadgeProps = {
  number: number,
  style?: ViewStyle
}

type State = {

}

const AnimatedFastImage = Animated.createAnimatedComponent(FastImage);

export default class CustomBadge extends CustomComponent<CustomBadgeProps, State> {

    layout: LayoutRectangle | null = null

  constructor(props: CustomBadgeProps) {
    super(props)
    this.state = {

    }
  }

  render() {
    const text = this.props.number < 100 ? this.props.number.toString() : '99+'
    return (
        <View
            style={{
                position: 'absolute',
                top: -styleValues.minorPadding,
                right: -styleValues.minorPadding,
                backgroundColor: colors.invalid,
                alignItems: 'center',
                justifyContent: 'center',
                paddingHorizontal: styleValues.minorPadding*1.5,
                paddingVertical: styleValues.minorPadding/2,
                minWidth: this.layout ? this.layout.height : undefined,
                borderRadius: this.layout ? this.layout.height/2 : styleValues.mediumPadding,
                overflow: 'hidden'
            }}
            onLayout={(e) => {this.layout = e.nativeEvent.layout}}
        >
            <Text
                style={{
                    ...textStyles.smaller,
                    color: colors.white,
                }}
            >
                {text}
            </Text>
        </View>
    )
  }
}

export const imageAnimatedStyles = StyleSheet.create({

})