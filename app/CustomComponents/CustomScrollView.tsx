import React from "react"
import { EmitterSubscription, KeyboardAvoidingView, ScrollView, ScrollViewProps, StyleSheet, View, ViewStyle } from "react-native"
import GradientView from "./GradientView"
import { defaultStyles, screenWidth, styleValues } from "../HelperFiles/StyleSheet"
import CustomComponent from "./CustomComponent"
import { LayoutRectangle } from "react-native"
import { Keyboard } from "react-native"

type Props = ScrollViewProps & {
    fadeTop?: boolean,
    fadeBottom?: boolean,
    fadeStartColor?: string,
    fadeEndColor?: string,
    avoidKeyboard?: boolean,
    keyboardThreshold?: number
}

type State = {
    keyboardEnabled: boolean,
    keyboardShown: boolean
}

export default class CustomScrollView extends CustomComponent<Props, State> {

    contentOffset = 0
    keyboardShouldMove = false
    layout: LayoutRectangle | null = null
    

    constructor(props: Props) {
        super(props)
        this.state = {
            keyboardEnabled: false,
            keyboardShown: false
        }
    }
    showListener: EmitterSubscription | null = null
    hideListener: EmitterSubscription | null = null
    // Keep track of when keyboard is open
    componentDidMount() {
        this.showListener = Keyboard.addListener('keyboardWillShow', (e) => {
            this.setState({keyboardShown: true})
        })
        this.hideListener = Keyboard.addListener('keyboardWillHide', (e) => {
            this.setState({keyboardShown: false})
        })
        super.componentDidMount()
    }
    componentWillUnmount() {
        if (this.showListener) {
            this.showListener.remove()
        }
        if (this.hideListener) {
            this.hideListener.remove()
        }
        super.componentWillUnmount()
    }

    render() {
        return (
            <View
                style={[{
                    flex: 1,
                    width: "100%",
                    overflow: 'visible'
                    },
                    this.props.style
                ]}
                onStartShouldSetResponder={() => true}
                pointerEvents={'box-none'}
                onLayout={(e) => {
                    this.layout = e.nativeEvent.layout
                }}
            >
                <ScrollView
                    showsVerticalScrollIndicator={false}
                    showsHorizontalScrollIndicator={false}
                    {...this.props}
                    style={{...defaultStyles.fill, overflow: 'visible'}}
                    contentContainerStyle={{
                        paddingVertical: !this.props.horizontal ? styleValues.mediumPadding : undefined,
                        paddingHorizontal: this.props.horizontal ? styleValues.mediumPadding : undefined,
                    }}
                    onScroll={(e) => {
                        this.contentOffset = this.props.horizontal ? e.nativeEvent.contentOffset.x : e.nativeEvent.contentOffset.y
                    }}
                    scrollEventThrottle={50}
                >
                    <KeyboardAvoidingView
                        style={this.props.contentContainerStyle}
                        onTouchStart={(e) => {
                            if (this.layout) {
                                // Don't make any changes when keyboard is open
                                if (!this.state.keyboardShown) {
                                    // Check if touch is below halfway point of container (or whatever threshold is)
                                    const threshold = this.props.keyboardThreshold || 0.5
                                    const relativeY = e.nativeEvent.pageY - this.layout.y
                                    // Disable / enable movement
                                    if (relativeY > this.layout.height*threshold) {
                                        this.setState({keyboardEnabled: true})
                                    } else {
                                        this.setState({keyboardEnabled: false})
                                    }
                                }
                            }
                        }}
                        onStartShouldSetResponder={() => true}
                        behavior={'position'}
                        enabled={this.props.avoidKeyboard && this.state.keyboardEnabled}
                    >
                        {this.props.children}
                    </KeyboardAvoidingView>
                </ScrollView>
            </View>
        )
    }
}