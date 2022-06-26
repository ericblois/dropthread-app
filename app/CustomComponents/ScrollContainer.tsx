import React from "react"
import { KeyboardAvoidingView, ScrollView, ScrollViewProps, StyleSheet, View, ViewStyle } from "react-native"
import GradientView from "../CustomComponents/GradientView"
import { defaultStyles, screenWidth, styleValues } from "../HelperFiles/StyleSheet"
import CustomComponent from "./CustomComponent"

type Props = ScrollViewProps & {
    containerStyle?: ViewStyle,
    avoidKeyboard?: boolean,
    fadeTop?: boolean,
    fadeBottom?: boolean,
    fadeStartColor?: string,
    fadeEndColor?: string,
}

type State = {}

export default class ScrollContainer extends CustomComponent<Props, State> {

    public scrollView: ScrollView | null = null

    constructor(props: Props) {
        super(props)
    }

    render() {
        return (
            <View style={{flex: 1, width: screenWidth, ...this.props.containerStyle}}>
                <KeyboardAvoidingView
                    style={{
                        ...defaultStyles.fill,
                        overflow: "hidden"
                    }}
                    behavior={"position"}
                    enabled={this.props.avoidKeyboard === true}
                >
                    <ScrollView
                        showsVerticalScrollIndicator={false}
                        showsHorizontalScrollIndicator={false}
                        ref={(scrollView) => {this.scrollView = scrollView as ScrollView | null}}
                        {...this.props}
                        style={StyleSheet.compose(
                            {
                                width: "100%",
                                height: "100%",
                            },
                            this.props.style
                        )}
                        contentContainerStyle={StyleSheet.compose({
                                padding: styleValues.mediumPadding,
                                paddingBottom: !this.props.horizontal ? styleValues.mediumHeight + styleValues.mediumPadding*2 : undefined,
                            },
                            this.props.contentContainerStyle
                        )}
                    >
                        <View
                            style={defaultStyles.fill}
                            onStartShouldSetResponder={() => (true)}
                        />
                        <View
                            onStartShouldSetResponder={() => (true)}
                            style={{
                                height: "100%",
                                width: "100%",
                                alignItems: "center",
                                flexDirection: this.props.horizontal ? "row" : "column"
                            }}
                        >
                            {this.props.children}
                        </View>
                    </ScrollView>
                </KeyboardAvoidingView> 
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