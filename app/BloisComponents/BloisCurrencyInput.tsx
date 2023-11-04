import React from "react";
import { Animated, KeyboardAvoidingView, ScrollView, ScrollViewProps, Text, TextInput, TextInputProps, TextStyle, View, ViewStyle } from "react-native";
import { colors, defaultStyles, shadowStyles, styVals, textStyles } from "../HelperFiles/StyleSheet";
import CustomComponent from "../CustomComponents/CustomComponent";
import { currencyFormatter } from "../HelperFiles/Constants";

type BloisCurrencyInputProps = {
    defaultValue?: number,
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
    checkValidity?: (value: number) => boolean,
    indicatorType?: 'shadowSmall' | 'shadow' | 'outline',
    showInitialValidity?: boolean,
    onChange?: (value: number) => void,
}

type State = {
    text: string,
    value?: number,
    isFocused: boolean
}

export const currencyRegex = /^[0-9\.\,]*$/


export default class BloisCurrencyInput extends CustomComponent<BloisCurrencyInputProps, State> {

    progress: Animated.Value;
    animationTime: number;
    
    animatedStyles: {[type: string]: Animated.AnimatedProps<ViewStyle>};

    constructor(props: BloisCurrencyInputProps) {
        super(props)
        let isValid = false
        if (props.checkValidity) {
            if (props.textInputProps?.defaultValue) {
                isValid = props.checkValidity(props.defaultValue || 0)
            }
        }
        this.state = {
            text: props.defaultValue ? currencyFormatter.format(props.defaultValue || 0) : '',
            value: props.defaultValue,
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
                borderWidth: styVals.minorBorderWidth,
                borderRadius: styVals.mediumPadding,
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
        const matchedChars = text.match(currencyRegex)
        newText = matchedChars ? matchedChars.join() : ""
        const newValue = parseFloat(newText)
        this.setState({text: newText, value: newValue})
        // Animate validation state
        if (this.props.checkValidity) {
            if (this.props.checkValidity(newValue)) {
                this.animValid()
            } else {
                this.animInvalid()
            }
        }
        return newValue
    }

    render() {
        // Check validity of input
        if (this.props.checkValidity && this.props.showInitialValidity && this.state.value) {
            if (this.props.checkValidity(this.state.value)) {
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
                        height: styVals.smallHeight,
                        flexDirection: 'row',
                        justifyContent: 'flex-start',
                        paddingVertical: 0,
                        ...(this.animatedStyles[this.props.indicatorType || 'shadowSmall']),
                        ...this.props.style
                    }}
                >
                    {this.props.label ?
                        <Text style={{
                            ...textStyles.medium,
                            color: colors.grey,
                            marginRight: styVals.mediumPadding
                        }}>{this.props.label}</Text>    
                    : undefined}
                    <TextInput
                        textAlign={"left"}
                        textAlignVertical={"center"}
                        autoCorrect={false}
                        clearButtonMode={"while-editing"}
                        {...this.props.textInputProps}
                        defaultValue={this.props.defaultValue ? currencyFormatter.format(this.props.defaultValue) : undefined}
                        disableFullscreenUI={true}
                        focusable={true}
                        style={{...textStyles.medium, textAlign: 'left', flex: 1, ...this.props.textStyle}}
                        placeholder={this.props.placeholder}
                        value={this.state.text}
                        keyboardType={'number-pad'}
                        onChangeText={(text) => {
                            const newValue = this.handleText(text)
                            this.props.onChange?.(newValue)
                        }}
                        onFocus={(event) => {
                            const newText = this.state.value?.toString() || ''
                            this.setState({isFocused: true, text: newText})
                            this.props.textInputProps?.onFocus?.(event)
                        }}
                        onEndEditing={(event) => {
                            const newText = this.state.value ? currencyFormatter.format(this.state.value) : ''
                            this.setState({isFocused: false, text: newText})
                            this.props.textInputProps?.onEndEditing?.(event)
                        }}
                    />
                    {this.props.children}
                </Animated.View>
            </ScrollView>
        )
    }
}
