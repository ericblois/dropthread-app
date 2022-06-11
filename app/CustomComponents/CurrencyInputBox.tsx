import React from "react";
import { KeyboardAvoidingView, TextInput, TextStyle, ViewStyle } from "react-native";
import { currencyFormatter } from "../HelperFiles/Constants";
import { colors, defaults, shadowStyles, styleValues } from "../HelperFiles/StyleSheet";
import CustomComponent from "./CustomComponent";

type CurrencyInputBoxProps = {
    boxStyle?: ViewStyle,
    textStyle?: TextStyle,
    boxProps?: KeyboardAvoidingView['props'],
    textProps?: TextInput['props'],
    defaultValue?: number,
    avoidKeyboard?: boolean,
    focusOnStart?: boolean,
    shadow?: boolean,
    onChangeValue?: (value: number | null) => void,
    validateFunc?: (value: number | null) => boolean
}

type State = {
    text: string,
    value: number | null,
    shouldAvoid: boolean,
}

export default class CurrencyInputBox extends CustomComponent<CurrencyInputBoxProps, State> {

    textInput: TextInput | null = null

    constructor(props: CurrencyInputBoxProps) {
        super(props)
        this.state = {
            text: this.props.defaultValue ? currencyFormatter.format(this.props.defaultValue).substring(1) : '',
            value: this.props.defaultValue ? this.props.defaultValue : null,
            shouldAvoid: false,
        }
    }

    render() {
        return (
            <KeyboardAvoidingView
                {...this.props.boxProps}
                style={{width: "100%"}}
                contentContainerStyle={{
                    ...defaults.roundedBox,
                    ...(this.props.shadow !== false ? shadowStyles.small : undefined),
                    borderColor: this.props.validateFunc ? (this.props.validateFunc(this.state.value) ? colors.valid : colors.invalid) : colors.lighterGrey,
                    borderWidth: styleValues.minorBorderWidth,
                    ...this.props.boxStyle
                }}
                behavior={"position"}
                enabled={this.state.shouldAvoid && this.props.avoidKeyboard === true}
            >
                <TextInput
                    style={[defaults.inputText, this.props.textStyle]}
                    disableFullscreenUI={true}
                    focusable={true}
                    keyboardType={"numeric"}
                    textAlign={"center"}
                    textAlignVertical={"center"}
                    autoCorrect={false}
                    clearButtonMode={"while-editing"}
                    ref={(textInput) => {this.textInput = textInput}}
                    onLayout={() => {
                        if (this.props.focusOnStart === true && this.textInput !== null) {
                            this.textInput.focus()
                        }
                    }}
                    {...this.props.textProps}
                    value={this.state.value !== null ? `$${this.state.text}` : ''}
                    onFocus={(e) => {
                        this.setState({shouldAvoid: true})
                        if (this.props.textProps?.onFocus) {
                            this.props.textProps.onFocus(e)
                        }
                    }}
                    onEndEditing={(e) => {
                        this.setState({shouldAvoid: false, text: this.state.value !== null ? currencyFormatter.format(this.state.value).substring(1) : ''})
                        if (this.props.textProps?.onEndEditing) {
                            this.props.textProps.onEndEditing(e)
                        }
                    }}
                    onChangeText={(text) => {
                        let parsedText = text.replaceAll(/[^0-9|.]/g, '')
                        let parsedValue: number | null = parseFloat(parsedText)
                        if (isNaN(parsedValue) || parsedValue < 0) {
                            parsedValue = null
                            parsedText = ''
                        } else {
                            parsedValue = Math.round(parsedValue * 100) / 100
                            // Remove potential second period
                            if (parsedText.indexOf('.') !== parsedText.lastIndexOf('.')) {
                                parsedText = parsedText.substring(0, parsedText.lastIndexOf('.'))
                            }
                        }
                        this.setState({text: parsedText, value: parsedValue})
                        if (this.props.textProps?.onChangeText) {
                            this.props.textProps.onChangeText(text)
                        }
                        if (this.props.onChangeValue) {
                            this.props.onChangeValue(parsedValue)
                        }
                    }}
                >
                    {this.props.children}
                </TextInput>
            </KeyboardAvoidingView>
            )
    }
}
