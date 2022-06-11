import React from "react"
import { Keyboard, Text, TouchableWithoutFeedback, View, ViewStyle } from "react-native"
import { defaults, styleValues, textStyles, topInset } from "../HelperFiles/StyleSheet"
import CustomComponent from "./CustomComponent"

type Props = {
    style?: ViewStyle,
    headerText?: string
}

type State = {}

export default class PageContainer extends CustomComponent<Props, State> {

    render() {
        return (
            <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
                <View
                    style={{
                        ...defaults.pageContainer,
                        paddingTop: this.props.headerText ? defaults.headerBox.height + styleValues.mediumPadding : topInset + styleValues.mediumPadding,
                        ...this.props.style
                    }}
                    onStartShouldSetResponder={() => (true)}
                >
                    {this.props.children}
                    {this.props.headerText ?
                        <View style={defaults.headerBox}>
                            <Text style={textStyles.large}>{this.props.headerText}</Text>
                        </View>
                    : undefined}
                </View>
            </TouchableWithoutFeedback>
        )
    }
}