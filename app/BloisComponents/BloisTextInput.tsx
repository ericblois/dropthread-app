import React from "react";
import { Animated, KeyboardAvoidingView, ScrollView, ScrollViewProps, Text, TextInput, TextInputProps, TextStyle, View, ViewStyle } from "react-native";
import { colors, defaultStyles, shadowStyles, styleValues, textStyles } from "../HelperFiles/StyleSheet";
import CustomComponent from "../CustomComponents/CustomComponent";

type BloisTextInputProps = {
    defaultValue?: string,
    label?: string,
    placeholder?: string,
    // For positioning, use containerStyle
    style?: ViewStyle,
    textStyle?: TextStyle,
    textInputProps?: TextInputProps,
    // Use this style for any positioning
    containerStyle?: ViewStyle,
    containerProps?: ScrollViewProps,
    animationTime?: number,
    prefix?: string,
    allowedCharacters?: RegExp,
    checkValidity?: (text: string) => boolean,
    indicatorType?: 'shadowSmall' | 'shadow' | 'outline',
    showInitialValidity?: boolean,
    onChangeText?: (text: string) => void,
}

type State = {
    text: string,
    isFocused: boolean
}

export const lettersRegex = /^[A-Za-z]*$/
export const wordsRegex = /^[A-Za-z\s\'\"\u2019\u0060\”\`]*$/
export const alphanumericRegex = /^[A-Za-z0-9]*$/
export const alphanumericSpecialRegex = /^[A-Za-z0-9\.\,\>\<\/\?\'\"\u2019\u0060\”\;\:\]\[\}\{\\\|\=\+\-\_\)\(\*\&\^\%\$\#\@\!\`\~]*$/
export const nameRegex = /[a-zA-Z\ \'\"\u2019\u0060\”\`]*/
export const emailRegex = /^[a-zA-Z0-9\.\!\#\$\%\&\'\*\+\/\=\?\^\_\`\{\|\}\~\-\@]*$/
export const passwordRegex = /^[A-Za-z0-9\.\,\>\<\/\?\]\[\}\{\\\|\=\+\-\_\)\(\*\&\^\%\$\#\@\!\~]*$/

export default class BloisTextInput extends CustomComponent<BloisTextInputProps, State> {

    progress: Animated.Value;
    animationTime: number;
    
    animatedStyles: {[type: string]: Animated.AnimatedProps<ViewStyle>};

    constructor(props: BloisTextInputProps) {
        super(props)
        let isValid = false
        if (props.checkValidity) {
            if (props.textInputProps?.defaultValue) {
                isValid = props.checkValidity(props.textInputProps.defaultValue)
            }
        }
        this.state = {
            text: props.defaultValue || "",
            isFocused: false
        }
        this.progress = new Animated.Value(props.showInitialValidity ? (isValid ? 1 : 0) : 1)
        this.animationTime = props.animationTime || 250
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

    animValid = (callback?: () => void) => {
        Animated.timing(this.progress, {
            toValue: 1,
            duration: this.animationTime,
            useNativeDriver: false
        }).start(callback)
    }

    animInvalid = (callback?: () => void) => {
        Animated.timing(this.progress, {
            toValue: 0,
            duration: this.animationTime,
            useNativeDriver: false
        }).start(callback)
    }
    // Process any changed text
    handleText = (text: string) => {
        let newText = text
        if (this.props.allowedCharacters) {
            const matchedChars = text.match(this.props.allowedCharacters)
            newText = matchedChars ? matchedChars.join() : ""
        }
        this.setState({text: newText})
        // Animate validation state
        if (this.props.checkValidity) {
            if (this.props.checkValidity(newText)) {
                this.animValid()
            } else {
                this.animInvalid()
            }
        }
        return newText
    }

    render() {
        // Check validity of input
        if (this.props.checkValidity && this.props.showInitialValidity) {
            if (this.props.checkValidity(this.state.text)) {
                this.animValid()
            } else {
                this.animInvalid()
            }
        }
        return (
            <ScrollView
                {...this.props.containerProps}
                style={{
                    ...this.props.containerStyle,
                    overflow: 'visible',
                    zIndex: this.state.isFocused ? 1000 : 0,
                    elevation: this.state.isFocused ? 1000 : 0,
                    flexGrow: 0,
                    width: '100%'
                }}
                scrollEnabled={false}
                automaticallyAdjustKeyboardInsets={this.state.isFocused}
            >
                <Animated.View
                    style={{
                        ...defaultStyles.roundedBox,
                        height: styleValues.smallHeight,
                        flexDirection: 'row',
                        justifyContent: 'flex-start',
                        paddingVertical: 0,
                        ...(this.animatedStyles[this.props.indicatorType || 'shadowSmall']),
                        ...this.props.style
                    }}
                >
                    {this.props.label ?
                        <Text style={{
                            ...textStyles.smaller,
                            color: colors.grey,
                            marginRight: styleValues.mediumPadding
                        }}>{this.props.label}</Text>    
                    : undefined}
                    {this.props.prefix ?
                        <Text style={{...textStyles.small, ...this.props.textStyle}}>{this.props.prefix}</Text>    
                    : undefined}
                    <TextInput
                        textAlign={"left"}
                        textAlignVertical={"center"}
                        autoCorrect={false}
                        clearButtonMode={"while-editing"}
                        {...this.props.textInputProps}
                        defaultValue={this.props.defaultValue}
                        disableFullscreenUI={true}
                        focusable={true}
                        style={{...textStyles.small, textAlign: 'left', flex: 1, ...this.props.textStyle}}
                        placeholder={this.props.placeholder}
                        value={this.state.text}
                        onChangeText={(text) => {
                            const newText = this.handleText(text)
                            this.props.onChangeText?.(newText)
                        }}
                        onFocus={() => {
                            this.setState({isFocused: true})
                        }}
                        onEndEditing={() => {
                            this.setState({isFocused: false})
                        }}
                    />
                    {this.props.children}
                </Animated.View>
            </ScrollView>
        )
    }
}
