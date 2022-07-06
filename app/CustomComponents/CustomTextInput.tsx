import React from "react";
import { Animated, KeyboardAvoidingView, Text, TextInput, TextInputProps, TextStyle, View, ViewStyle } from "react-native";
import { colors, defaultStyles, shadowStyles, styleValues, textStyles } from "../HelperFiles/StyleSheet";
import CustomComponent from "./CustomComponent";

const AnimatedKeyboardAvoidingView = Animated.createAnimatedComponent(KeyboardAvoidingView)

type CustomTextInputProps = TextInputProps & {
    boxStyle?: ViewStyle,
    boxProps?: KeyboardAvoidingView['props'],
    avoidKeyboard?: boolean,
    focusOnStart?: boolean,
    indicatorType?: 'shadowSmall' | 'shadow' | 'outline',
    initialValidity?: boolean,
    animationTime?: number,
    validateFunc?: (text: string) => boolean
}

type State = {
    text: string,
    shouldAvoid: boolean,
}

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
            shouldAvoid: false,
        }
        this.progress = new Animated.Value(props.initialValidity ? 
            isValid ? 1 : 0
            : 1
            )
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
        return (
            <AnimatedKeyboardAvoidingView
                {...this.props.boxProps}
                style={{
                    ...defaultStyles.roundedBox,
                    ...(this.props.indicatorType ? this.animatedStyles[this.props.indicatorType] : undefined),
                    ...this.props.boxStyle
                }}
                contentContainerStyle={{
                    width: '100%',
                    height: '100%',
                    flexDirection: 'row',
                    alignItems: 'center'
                }}
                behavior={"position"}
                enabled={this.state.shouldAvoid && this.props.avoidKeyboard}
            >
                {this.props.placeholder ?
                    <Text style={{...textStyles.smaller, color: colors.grey, marginRight: styleValues.mediumPadding}}>{this.props.placeholder}</Text>    
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
                    onFocus={(e) => {
                        this.setState({shouldAvoid: true})
                        if (this.props.onFocus) {
                            this.props.onFocus(e)
                        }
                    }}
                    onEndEditing={(e) => {
                        this.setState({shouldAvoid: false})
                        if (this.props.onEndEditing) {
                            this.props.onEndEditing(e)
                        }
                    }}
                    onChangeText={(text) => {
                        this.setState({text: text})
                        if (this.props.validateFunc) {
                            if (this.props.validateFunc(text)) {
                                this.animateValidate()
                            } else {
                                this.animateInvalidate()
                            }
                        }
                        if (this.props.onChangeText) {
                            this.props.onChangeText(text)
                        }
                    }}
                />
            </AnimatedKeyboardAvoidingView>
            )
    }
}
