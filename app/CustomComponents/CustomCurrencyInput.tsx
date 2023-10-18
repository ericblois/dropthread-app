import React from "react";
import { Animated, KeyboardAvoidingView, Text, TextInput, TextInputProps, TextStyle, View, ViewStyle } from "react-native";
import { currencyFormatter, simpleCurrencyFormatter } from "../HelperFiles/Constants";
import { colors, defaultStyles, shadowStyles, styleValues, textStyles } from "../HelperFiles/StyleSheet";
import CustomComponent from "./CustomComponent";

type CustomCurrencyInputProps = Omit<TextInputProps, 'defaultValue'> & {
    boxStyle?: ViewStyle,
    boxProps?: KeyboardAvoidingView['props'],
    focusOnStart?: boolean,
    animationTime?: number,
    prefix?: string,
    defaultValue?: number | null,
    minValue?: number,
    maxValue?: number,
    onChangeValue?: (value: number | null) => void,
    checkValidity?: (value: number | null) => boolean,
    indicatorType?: 'shadowSmall' | 'shadow' | 'outline',
    ignoreInitialValidity?: boolean
}

type State = {
    value: number | null,
}

export default class CustomCurrencyInput extends CustomComponent<CustomCurrencyInputProps, State> {

    progress: Animated.Value;
    animationTime: number;
    
    animatedStyles: {[type: string]: Animated.AnimatedProps<ViewStyle>};

    textInput: TextInput | null = null

    constructor(props: CustomCurrencyInputProps) {
        super(props)
        let isValid = false
        if (props.checkValidity) {
            if (props.defaultValue) {
                isValid = props.checkValidity(props.defaultValue)
            }
        }
        this.state = {
            value: props.defaultValue || null
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
        if (this.props.checkValidity && !this.props.ignoreInitialValidity) {
            if (this.props.checkValidity(this.state.value)) {
                this.animateValidate();
            } else {
                this.animateInvalidate();
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
                    <Text style={[textStyles.small, this.props.style, {marginRight: 0}]}>{this.props.prefix}</Text>
                : undefined}
                {this.state.value ?
                    <Text style={[textStyles.small, this.props.style]}>$</Text>
                : undefined}
                <TextInput
                    style={[textStyles.small, {flex: 1}, this.props.style]}
                    disableFullscreenUI={true}
                    focusable={true}
                    textAlign={"left"}
                    textAlignVertical={"center"}
                    autoCorrect={false}
                    clearButtonMode={"while-editing"}
                    maxLength={5}
                    ref={(textInput) => {this.textInput = textInput}}
                    onLayout={() => {
                        if (this.props.focusOnStart === true && this.textInput !== null) {
                            this.textInput.focus()
                        }
                    }}
                    {...this.props}
                    defaultValue={undefined}
                    placeholder={'$0'}
                    keyboardType={'number-pad'}
                    value={this.state.value?.toString()}
                    onFocus={(e) => {
                        this.setState({shouldAvoid: true})
                        if (this.props.onFocus) {
                            this.props.onFocus(e)
                        }
                    }}
                    onEndEditing={(e) => {
                        this.setState({text: this.state.value !== null ? this.state.value : ''})
                        if (this.props.onEndEditing) {
                            this.props.onEndEditing(e)
                        }
                    }}
                    onChangeText={(text) => {
                        let parsedText = text.replaceAll(/[^0-9|.]/g, '')
                        let parsedValue: number | null = parseFloat(parsedText)
                        if (isNaN(parsedValue) || parsedValue < 0) {
                            parsedValue = null
                            parsedText = ''
                        } else if (this.props.minValue !== undefined && parsedValue < this.props.minValue) {
                            parsedValue = this.props.minValue
                            parsedText = parsedValue.toString()
                        } else if (this.props.maxValue !== undefined && parsedValue > this.props.maxValue) {
                            parsedValue = this.props.maxValue
                            parsedText = parsedValue.toString()
                        } else {
                            parsedValue = Math.round(parsedValue * 100) / 100
                            // Remove potential second period
                            if (parsedText.indexOf('.') !== parsedText.lastIndexOf('.')) {
                                parsedText = parsedText.substring(0, parsedText.lastIndexOf('.'))
                            }
                        }
                        if (this.props.checkValidity) {
                            if (this.props.checkValidity(parsedValue)) {
                                this.animateValidate()
                            } else {
                                this.animateInvalidate()
                            }
                        }
                        this.setState({text: parsedText, value: parsedValue})
                        if (this.props.onChangeText) {
                            this.props.onChangeText(text)
                        }
                        if (this.props.onChangeValue) {
                            this.props.onChangeValue(parsedValue)
                        }
                    }}
                />
            </Animated.View>
            )
    }
}