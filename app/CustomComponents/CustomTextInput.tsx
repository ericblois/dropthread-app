import React from "react";
import { Animated, KeyboardAvoidingView, Text, TextInput, TextInputProps, TextStyle, View, ViewStyle } from "react-native";
import { colors, defaultStyles, shadowStyles, styleValues, textStyles } from "../HelperFiles/StyleSheet";
import CustomComponent from "./CustomComponent";

type CustomTextInputProps = TextInputProps & {
    boxStyle?: ViewStyle,
    boxProps?: KeyboardAvoidingView['props'],
    focusOnStart?: boolean,
    animationTime?: number,
    prefix?: string,
    allowedCharacters?: RegExp,
    validateFunc?: (text: string) => boolean,
    indicatorType?: 'shadowSmall' | 'shadow' | 'outline',
    ignoreInitialValidity?: boolean,
}

type State = {
    text: string,
}

export const lettersRegex = /^[A-Za-z]*$/
export const wordsRegex = /^[A-Za-z\s\'\"\u2019\u0060\”\`]*$/
export const alphanumericRegex = /^[A-Za-z0-9]*$/
export const alphanumericSpecialRegex = /^[A-Za-z0-9\.\,\>\<\/\?\'\"\u2019\u0060\”\;\:\]\[\}\{\\\|\=\+\-\_\)\(\*\&\^\%\$\#\@\!\`\~]*$/
export const nameRegex = /[a-zA-Z\ \'\"\u2019\u0060\”\`]*/
export const emailRegex = /^[a-zA-Z0-9\.\!\#\$\%\&\'\*\+\/\=\?\^\_\`\{\|\}\~\-\@]*$/
export const passwordRegex = /^[A-Za-z0-9\.\,\>\<\/\?\]\[\}\{\\\|\=\+\-\_\)\(\*\&\^\%\$\#\@\!\~]*$/

export default class CustomTextInput extends CustomComponent<CustomTextInputProps, State> {

    progress: Animated.Value;
    animationTime: number;
    
    animatedStyles: {[type: string]: Animated.AnimatedProps<ViewStyle>};

    textInput: TextInput | null = null

    constructor(props: CustomTextInputProps) {
        super(props)
        let isValid = false
        if (props.validateFunc) {
            if (props.defaultValue) {
                isValid = props.validateFunc(props.defaultValue)
            }
        }
        this.state = {
            text: props.defaultValue !== undefined ? props.defaultValue : "",
        }
        this.progress = new Animated.Value(props.ignoreInitialValidity !== false ? 1 : (isValid ? 1 : 0))
        this.animationTime = props.animationTime || 300
        this.animatedStyles = {
            shadowSmall: {
                ...shadowStyles.small,
                shadowOpacity: this.progress.interpolate({
                    inputRange: [0, 1],
                    outputRange: [1, shadowStyles.small.shadowOpacity]
                }),
                shadowColor: this.progress.interpolate({
                    inputRange: [0, 1],
                    outputRange: [colors.invalid, colors.black]
                })
            },
            shadow: {
                ...shadowStyles.medium,
                shadowOpacity: this.progress.interpolate({
                    inputRange: [0, 1],
                    outputRange: [1, shadowStyles.medium.shadowOpacity]
                }),
                shadowColor: this.progress.interpolate({
                    inputRange: [0, 1],
                    outputRange: [colors.invalid, colors.black]
                })
            },
            outline: {
                borderWidth: styleValues.minorBorderWidth,
                borderRadius: styleValues.mediumPadding,
                borderColor: this.progress.interpolate({
                    inputRange: [0, 1],
                    outputRange: [colors.invalid, colors.transparent]
                })
            }
        }
    }

    animateValidate = () => {
        Animated.timing(this.progress, {
            toValue: 1,
            duration: this.animationTime,
            useNativeDriver: false
        }).start()
    }

    animateInvalidate = () => {
        Animated.timing(this.progress, {
            toValue: 0,
            duration: this.animationTime,
            useNativeDriver: false
        }).start()
    }

    render() {
        // Check validity of input
        if (this.props.validateFunc && this.props.ignoreInitialValidity === false) {
            if (this.props.validateFunc(this.state.text)) {
                this.animateValidate()
            } else {
                this.animateInvalidate()
            }
        }
        return (
            <Animated.View
                {...this.props.boxProps}
                style={{
                    ...defaultStyles.roundedBox,
                    height: styleValues.smallHeight,
                    flexDirection: 'row',
                    ...(this.props.indicatorType ? this.animatedStyles[this.props.indicatorType] : undefined),
                    ...this.props.boxStyle
                }}
            >
                {this.props.placeholder ?
                    <Text style={{...textStyles.smaller, color: colors.grey, marginRight: styleValues.mediumPadding}}>{this.props.placeholder}</Text>    
                : undefined}
                {this.props.prefix ?
                    <Text style={[textStyles.small, this.props.style]}>{this.props.prefix}</Text>    
                : undefined}
                <TextInput
                    style={[textStyles.small, {flex: 1}, this.props.style]}
                    disableFullscreenUI={true}
                    focusable={true}
                    textAlign={"left"}
                    textAlignVertical={"center"}
                    autoCorrect={false}
                    clearButtonMode={"while-editing"}
                    ref={(textInput) => {this.textInput = textInput}}
                    onLayout={() => {
                        if (this.props.focusOnStart === true && this.textInput !== null) {
                            this.textInput.focus()
                        }
                    }}
                    {...this.props}
                    placeholder={undefined}
                    value={this.state.text}
                    onChangeText={(text) => {
                        let newText = text
                        if (this.props.allowedCharacters) {
                            const matchedChars = text.match(this.props.allowedCharacters)
                            newText = matchedChars ? matchedChars.join() : ""
                        }
                        this.setState({text: newText})
                        if (this.props.validateFunc) {
                            if (this.props.validateFunc(newText)) {
                                this.animateValidate()
                            } else {
                                this.animateInvalidate()
                            }
                        }
                        if (this.props.onChangeText) {
                            this.props.onChangeText(newText)
                        }
                    }}
                />
            </Animated.View>
            )
    }
}
