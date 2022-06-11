import React from "react";
import { Animated, GestureResponderEvent, Image, ImageStyle, Pressable, PressableProps, StyleSheet, Text, TextStyle, View, ViewStyle } from "react-native";
import { colors, defaults, fonts, shadowStyles, styleValues, textStyles } from "../HelperFiles/StyleSheet";
import CustomComponent from "./CustomComponent";
import LoadingCover from "./LoadingCover";

type Props = {
    text: string,
    textStyle?: TextStyle,
    appearance?: "light" | "color" | "no-color",
    shadow?: boolean,
    subtext?: string,
    subtextStyle?: TextStyle,
    leftIconSource?: number,
    leftIconStyle?: ImageStyle,
    rightIconSource?: number,
    rightIconStyle?: ImageStyle,
    buttonStyle?: ViewStyle,
    buttonFunc?: (event?: GestureResponderEvent) => void,
    textProps?: Text['props'],
    subtextProps?: Text['props'],
    touchableProps?: PressableProps,
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

    renderLeftIcon() {
        let defaultIconStyle = {...styles.iconStyle}
        // Update default icon style
        if (this.props.appearance === "light") {
            defaultIconStyle.tintColor = colors.main
        } else if (this.props.appearance === "color") {
            defaultIconStyle.tintColor = colors.white
        }
        if (this.props.leftIconSource) {
            return (
                <Image
                    source={this.props.leftIconSource}
                    style = {{
                        ...defaultIconStyle,
                        ...(this.props.textStyle?.color ? {tintColor: this.props.textStyle?.color} : undefined),
                        ...this.props.leftIconStyle,
                    }}
                    resizeMethod={"scale"}
                    resizeMode={"contain"}
                />
            )
        }
        return undefined
    }

    renderRightIcon() {
        let defaultIconStyle = {...styles.iconStyle}
        // Update default icon style
        if (this.props.appearance === "light") {
            defaultIconStyle.tintColor = colors.main
        } else if (this.props.appearance === "color") {
            defaultIconStyle.tintColor = colors.white
        }
        if (this.props.rightIconSource) {
            return (
                <Image
                    source={this.props.rightIconSource}
                    style = {{
                        ...defaultIconStyle,
                        ...(this.props.textStyle?.color ? {tintColor: this.props.textStyle?.color} : undefined),
                        ...this.props.rightIconStyle,
                    }}
                    resizeMethod={"scale"}
                    resizeMode={"contain"}
                />
            )
        }
        return undefined
    }

    render() {
        let defaultButtonStyle: ViewStyle = {...defaults.roundedBox, flexDirection: "row"}
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
        // Add a shadow
        if (this.props.shadow !== false) {
            defaultButtonStyle = {
                ...defaultButtonStyle,
                ...shadowStyles.small
            }
        }
        return (
            <Pressable
            style={({pressed}) => ({...defaultButtonStyle, ...this.props.buttonStyle, ...{
                justifyContent: this.props.leftIconSource != undefined || this.props.rightIconSource != undefined ? "space-between" : "center",
                opacity: pressed ? 0.5 : 1
            }})}
            onPress={async () => {
                if (this.props.buttonFunc) {
                  if (this.props.showLoading === true) {
                    this.setState({loading: true})
                  }
                  try {
                    await this.props.buttonFunc()
                  } catch (e) {
                      console.error(e)
                  }
                  if (this.props.showLoading === true) {
                    this.setState({loading: false})
                  }
                }
              }}
            {...this.props.touchableProps}
            >
                {!this.state.loading ?
                    <>
                        {this.renderLeftIcon()}
                        <View style={{alignItems: "center", justifyContent: "center"}}>
                            <Text style = {[defaultTextStyle, this.props.textStyle]} {...this.props.textProps}>
                                {this.props.text}
                            </Text>
                            {this.renderSubtext()}
                        </View>
                        {this.renderRightIcon()}
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
            </Pressable>
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
