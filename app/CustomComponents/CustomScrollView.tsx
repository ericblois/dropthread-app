import React from "react"
import { KeyboardAvoidingView, ScrollView, ScrollViewProps, StyleSheet, View, ViewStyle } from "react-native"
import GradientView from "./GradientView"
import { defaultStyles, screenWidth, styleValues } from "../HelperFiles/StyleSheet"
import CustomComponent from "./CustomComponent"

type Props = ScrollViewProps & {
    fadeTop?: boolean,
    fadeBottom?: boolean,
    fadeStartColor?: string,
    fadeEndColor?: string,
}

type State = {}

export default class CustomScrollView extends CustomComponent<Props, State> {

    constructor(props: Props) {
        super(props)
    }

    render() {
        return (
            <View
                style={this.props.style}
                onStartShouldSetResponder={() => true}
                pointerEvents={'box-none'}
            >
                <ScrollView
                    showsVerticalScrollIndicator={false}
                    showsHorizontalScrollIndicator={false}
                    {...this.props}
                    style={defaultStyles.fill}
                    contentContainerStyle={{
                        paddingVertical: !this.props.horizontal ? styleValues.mediumPadding : undefined,
                        paddingHorizontal: this.props.horizontal ? styleValues.mediumPadding : undefined,
                    }}
                >
                    <View
                        style={this.props.contentContainerStyle}
                        onStartShouldSetResponder={() => true}
                    >
                        {this.props.children}
                    </View>
                </ScrollView>
                <GradientView
                    horizontal={this.props.horizontal === true}
                    fadeStartColor={this.props.fadeStartColor}
                    fadeEndColor={this.props.fadeEndColor}
                    fadeTop={this.props.fadeTop}
                    fadeBottom={this.props.fadeBottom}
                />
            </View>
        )
    }
}