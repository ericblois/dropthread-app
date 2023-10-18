import React, { ReactNode } from "react";
import { Animated, GestureResponderEvent, Pressable, PressableProps, PressableStateCallbackType, StyleSheet, Text, TextStyle, View, ViewStyle } from "react-native";
import FastImage, { ImageStyle } from "react-native-fast-image";
import BloisPressable from "../BloisComponents/BloisPressable";
import { colors, defaultStyles, fonts, styleValues, textStyles } from "../HelperFiles/StyleSheet";
import CustomComponent from "./CustomComponent";
import LoadingCover from "./LoadingCover";

type Props = {
    text: string,
    textStyle?: TextStyle,
    appearance?: "light" | "color" | "no-color",
    animationType?: BloisPressable['props']['animationType'],
    subtext?: string,
    subtextStyle?: TextStyle,
    leftChildren?: ReactNode,
    rightChildren?: ReactNode,
    buttonStyle?: Animated.AnimatedProps<ViewStyle>,
    wrapperStyle?: Animated.AnimatedProps<ViewStyle>,
    onPress?: (event?: GestureResponderEvent) => void,
    textProps?: Text['props'],
    subtextProps?: Text['props'],
    touchableProps?: BloisPressable['props'],
    showLoading?: boolean,
}

type State = {
    loading: boolean
}

const AnimatedPressable = Animated.createAnimatedComponent(Pressable)

export default class TextButton extends CustomComponent<Props, State> {

    constructor(props: Props) {
        super(props)
        this.state = {
            loading: false
        }
    }

    renderSubtext() {
        if (this.props.subtext) {
            return (
                <Text style = {[styles.subtextStyle, this.props.subtextStyle]} {...this.props.subtextProps}>
                    {this.props.subtext!}
                </Text>
            )
        }
        return undefined
    }

    render() {
        let defaultButtonStyle: ViewStyle = {...defaultStyles.roundedBox, flexDirection: "row"}
        let defaultTextStyle = {...textStyles.small}
        // Color appearance
        if (this.props.appearance === "color") {
            defaultButtonStyle.backgroundColor = colors.main
            defaultTextStyle.color = colors.white
        } // Light appearance
        else if (this.props.appearance === "light") {
            defaultTextStyle.color = colors.main
            defaultTextStyle.fontFamily = fonts.medium
        }
        return (
            <BloisPressable
                animationType={this.props.animationType || 'shadowSmall'}
                onPress={async () => {
                    if (this.props.onPress) {
                    if (this.props.showLoading === true) {
                        this.setState({loading: true})
                    }
                    try {
                        await this.props.onPress()
                    } catch (e) {
                        console.error(e)
                    }
                    if (this.props.showLoading === true) {
                        this.setState({loading: false})
                    }
                    }
                }}
                {...this.props.touchableProps}
                style={this.props.wrapperStyle}
            >
                <Animated.View
                    style={{...defaultButtonStyle, ...{
                        justifyContent: this.props.leftChildren || this.props.rightChildren ? "space-between" : "center",
                    }, ...this.props.buttonStyle}}
                >
                    {!this.state.loading ?
                        <>
                            {this.props.leftChildren}
                            <View style={{alignItems: "center", justifyContent: "center"}}>
                                <Text style = {[defaultTextStyle, this.props.textStyle]} {...this.props.textProps}>
                                    {this.props.text}
                                </Text>
                                {this.renderSubtext()}
                            </View>
                            {this.props.rightChildren}
                        </> :
                        <LoadingCover
                            size={"small"}
                            style={{backgroundColor: "transparent"}}
                            indicatorProps={{
                                // Match the indicator color to the text color
                                color: this.props.textStyle?.color ? this.props.textStyle.color : defaultTextStyle.color
                            }}
                        />
                    }
                </Animated.View>
            </BloisPressable>
        )
    }
}

const styles = StyleSheet.create({
    textStyle: {
        ...textStyles.medium,
        color: colors.majorTextColor,
    },
    subtextStyle: {
        ...textStyles.small,
        color: colors.mediumTextColor
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
