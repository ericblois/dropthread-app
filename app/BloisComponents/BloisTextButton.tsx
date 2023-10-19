import React, { Component, ReactNode } from "react";
import {
    Animated,
    GestureResponderEvent,
    Pressable,
    TextProps,
    StyleSheet,
    Text,
    TextStyle,
    View,
    ViewStyle,
    PressableProps,
} from "react-native";
import FastImage, { ImageStyle } from "react-native-fast-image";
import BloisPressable from "./BloisPressable";
import {
    colors,
    defaultStyles,
    fonts,
    styleValues,
    textStyles,
} from "../HelperFiles/StyleSheet";
import CustomComponent from "../CustomComponents/CustomComponent";
import LoadingCover from "../CustomComponents/LoadingCover";

type Props = {
    text: string;
    style?: Animated.AnimatedProps<ViewStyle>;
    textStyle?: TextStyle;
    animType?: "opacity" | "shadowSmall" | "shadow" | "outline";
    subtext?: string;
    subtextStyle?: TextStyle;
    shadow?: boolean;
    tooltip?: {
        text: string;
        posX?: "center" | "left" | "right";
        posY?: "above" | "below";
        width?: number;
    };
    onPress?: (event?: GestureResponderEvent) => void;
    textProps?: TextProps;
    subtextProps?: TextProps;
    pressableProps?: PressableProps;
    leftChildren?: ReactNode;
    rightChildren?: ReactNode;
    children?: ReactNode;
};

type State = {};

export default class TextButton extends Component<Props, State> {
    constructor(props: Props) {
        super(props);
        this.state = {};
    }

    renderSubtext() {
        if (this.props.subtext) {
            return (
                <Text
                    {...this.props.subtextProps}
                    style={{
                        ...textStyles.smaller,
                        color: colors.mediumTextColor,
                        ...this.props.subtextStyle,
                    }}
                    
                >
                    {this.props.subtext}
                </Text>
            );
        }
    }

    render() {
        return (
            <BloisPressable
                {...this.props.pressableProps}
                style={{
                    ...(this.props.shadow !== false
                        ? defaultStyles.roundedBox
                        : undefined),
                    ...defaultStyles.row,
                    width: undefined,
                    paddingVertical: styleValues.minorPadding,
                    minHeight: styleValues.smallHeight,
                    alignContent: "center",
                    justifyContent: "center",
                    ...this.props.style,
                }}
                animType={
                    this.props.shadow !== false ? "shadowSmall" : "opacity"
                }
                tooltip={this.props.tooltip}
                onPress={this.props.onPress}
            >
                {this.props.leftChildren}
                <View style={{ flexDirection: "column" }}>
                    <Text
                        {...this.props.textProps}
                        style={{
                            ...textStyles.small,
                            color: colors.majorTextColor,
                            ...this.props.textStyle,
                        }}
                    >
                        {this.props.text}
                    </Text>
                    {this.renderSubtext()}
                </View>
                {this.props.rightChildren}
                {this.props.children}
            </BloisPressable>
        );
    }
}

const styles = StyleSheet.create({
    textStyle: {
        ...textStyles.medium,
        color: colors.majorTextColor,
    },
    subtextStyle: {
        ...textStyles.small,
        color: colors.mediumTextColor,
    },
    iconStyle: {
        aspectRatio: 1,
        width: styleValues.iconSmallSize,
        height: styleValues.iconSmallSize,
        tintColor: colors.grey,
        alignSelf: "center",
        flexWrap: "wrap",
    },
});
