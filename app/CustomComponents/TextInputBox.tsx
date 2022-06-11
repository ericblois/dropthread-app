import React from "react";
import { KeyboardAvoidingView, TextInput, TextStyle, ViewStyle } from "react-native";
import { colors, defaults, shadowStyles, styleValues } from "../HelperFiles/StyleSheet";
import CustomComponent from "./CustomComponent";

type TextInputBoxProps = {
    boxStyle?: ViewStyle,
    textStyle?: TextStyle,
    boxProps?: KeyboardAvoidingView['props'],
    textProps?: TextInput['props'],
    avoidKeyboard?: boolean,
    focusOnStart?: boolean,
    shadow?: boolean,
    validateFunc?: (text: string) => boolean
}

type State = {
    text: string,
    shouldAvoid: boolean,
}

export default class TextInputBox extends CustomComponent<TextInputBoxProps, State> {

    textInput: TextInput | null = null

    constructor(props: TextInputBoxProps) {
        super(props)
        let isValid = false
        if (props.validateFunc) {
            if (props.textProps?.defaultValue) {
                isValid = props.validateFunc(props.textProps?.defaultValue)
            }
        }
        this.state = {
            text: props.textProps?.defaultValue !== undefined ? props.textProps.defaultValue : "",
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
                    borderColor: this.props.validateFunc ? (this.props.validateFunc(this.state.text) ? colors.valid : colors.invalid) : colors.lighterGrey,
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
                    value={this.state.text}
                    onFocus={(e) => {
                        this.setState({shouldAvoid: true})
                        if (this.props.textProps?.onFocus) {
                            this.props.textProps.onFocus(e)
                        }
                    }}
                    onEndEditing={(e) => {
                        this.setState({shouldAvoid: false})
                        if (this.props.textProps?.onEndEditing) {
                            this.props.textProps.onEndEditing(e)
                        }
                    }}
                    onChangeText={(text) => {
                        this.setState({text: text})
                        if (this.props.textProps?.onChangeText) {
                            this.props.textProps.onChangeText(text)
                        }
                    }}
                >
                    {this.props.children}
                </TextInput>
            </KeyboardAvoidingView>
            )
    }
}
