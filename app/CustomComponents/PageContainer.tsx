import React from "react"
import { Keyboard, Text, TouchableWithoutFeedback, View, ViewStyle } from "react-native"
import { defaultStyles, styleValues, textStyles, topInset } from "../HelperFiles/StyleSheet"
import CustomComponent from "./CustomComponent"

type Props = {
    style?: ViewStyle,
    headerText?: string
}

type State = {
    headerHeight: number
}

export default class PageContainer extends CustomComponent<Props, State> {

    constructor(props: Props) {
        super(props)
        this.state = {
            headerHeight: 0
        }
    }

    render() {
        return (
            <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
                <View
                    style={{
                        ...defaultStyles.pageContainer,
                        paddingTop: this.props.headerText ? this.state.headerHeight : defaultStyles.pageContainer.paddingTop,
                        ...this.props.style
                    }}
                    onStartShouldSetResponder={() => (true)}
                >
                    {this.props.children}
                    {this.props.headerText ?
                        <View
                            style={defaultStyles.headerBox}
                            onLayout={(e) => {
                                // Capture the height of the header to use as padding
                                if (this.state.headerHeight == 0) {
                                    this.setState({headerHeight: e.nativeEvent.layout.height})
                                }
                            }}
                        >
                            <Text style={textStyles.large} numberOfLines={1}>{this.props.headerText}</Text>
                        </View>
                    : undefined}
                </View>
            </TouchableWithoutFeedback>
        )
    }
}