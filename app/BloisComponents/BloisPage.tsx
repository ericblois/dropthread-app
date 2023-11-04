import React from "react"
import { Keyboard, Text, TouchableWithoutFeedback, View, ViewStyle } from "react-native"
import { defaultStyles, styVals, textStyles, topInset } from "../HelperFiles/StyleSheet"
import CustomComponent from "../CustomComponents/CustomComponent"

type Props = {
    style?: ViewStyle,
    headerText?: string
}

type State = {
    headerHeight: number
}

export default class BloisPage extends CustomComponent<Props, State> {

    constructor(props: Props) {
        super(props)
        this.state = {
            headerHeight: 0
        }
    }

    render() {
        return (
            <TouchableWithoutFeedback
            style={defaultStyles.fill}
            onPress={Keyboard.dismiss}>
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
                                if (this.state.headerHeight === 0) {
                                    this.setState({headerHeight: e.nativeEvent.layout.height})
                                }
                            }}
                        >
                            <Text style={textStyles.larger} numberOfLines={1}>{this.props.headerText}</Text>
                        </View>
                    : undefined}
                </View>
            </TouchableWithoutFeedback>
        )
    }
}