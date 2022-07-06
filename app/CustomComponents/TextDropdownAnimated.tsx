import React from "react";
import { Animated, TextStyle, View, ViewStyle } from "react-native";
import { colors, defaultStyles, fonts, screenWidth, styleValues, textStyles } from "../HelperFiles/StyleSheet";
import CustomComponent from "./CustomComponent";
import TextButton from "./TextButton";

type TextDropdownAnimatedProps = {
    placeholderText: string,
    items: {
        text: string,
        value: any
    }[],
    showValidSelection?: boolean,
    enableMultiple?: boolean,
    defaultValue?: any,
    onSelect?: (selections: {text: string, value: any}[]) => void,
    style?: ViewStyle,
    textStyle?: TextStyle,
}

type State = {
    expanded: boolean,
    selections: {text: string, value: any}[]
}

export default class TextDropdownAnimated extends CustomComponent<TextDropdownAnimatedProps, State> {

    constructor(props: TextDropdownAnimatedProps) {
        super(props)
        this.state = {
            expanded: false,
            selections: []
        }
    }

    componentDidMount() {
        if (this.props.defaultValue) {
            for (const item of this.props.items) {
                if (item.value == this.props.defaultValue) {
                    this.setState({selections: [{text: item.text, value: item.value}]})
                    break
                }
            }
        }
        super.componentDidMount()
    }

    dropdownHeight = new Animated.Value(0)
    dropdownOpacity = new Animated.Value(0)

    expand() {
        Animated.sequence([
            Animated.timing(this.dropdownHeight, {
                toValue: screenWidth*0.1,
                duration: 100,
                useNativeDriver: false
            }),
            Animated.timing(this.dropdownOpacity, {
                toValue: 1,
                duration: 100,
                useNativeDriver: false
            })
        ]).start()
    }

    collapse() {
        Animated.sequence([
            Animated.timing(this.dropdownOpacity, {
                toValue: 0,
                duration: 100,
                useNativeDriver: false
            }),
            Animated.timing(this.dropdownHeight, {
                toValue: 0,
                duration: 100,
                useNativeDriver: false
            })
        ]).start()
    }

    renderItems() {
        const selectedNames = this.state.selections.map(({text}) => text)
        return (
            this.props.items.map(({text, value}, index) => {
                return (
                    <Animated.View
                        style={{
                            height: this.dropdownHeight,
                            opacity: this.dropdownOpacity,
                        }}
                        key={index.toString()}
                    >
                        <TextButton
                            text={text}
                            appearance={selectedNames.includes(text) ? "light" : "no-color"}
                            buttonStyle={{
                                height: undefined,
                                paddingVertical: 0,
                                flex: 1,
                                marginTop: styleValues.minorPadding,
                                marginBottom: 0,
                                borderColor: colors.main,
                                borderWidth: selectedNames.includes(text) ? styleValues.minorBorderWidth : 0
                            }}
                            textStyle={{
                                ...textStyles.smaller,
                                fontFamily: selectedNames.includes(text) ? fonts.medium : fonts.regular,
                                ...this.props.textStyle
                            }}
                            onPress={() => {
                                if (this.props.enableMultiple !== true) {
                                    this.collapse()
                                    this.setState({
                                        selections: [{text: text, value: value}],
                                        expanded: false
                                    }, () => {
                                        if (this.props.onSelect) {
                                            this.props.onSelect(this.state.selections)
                                        }
                                    })
                                } else {
                                    let newSelections = this.state.selections
                                    // Check if option was already selected
                                    const optionIndex = this.state.selections.findIndex((selection) => {
                                        return selection.text === text
                                    })
                                    if (optionIndex > -1) {
                                        // Remove selection
                                        newSelections.splice(optionIndex)
                                    } else {
                                        // Add selection
                                        newSelections.push({text: text, value: value})
                                    }
                                    this.setState({
                                        selections: newSelections
                                    }, () => {
                                        if (this.props.onSelect) {
                                            this.props.onSelect(this.state.selections)
                                        }
                                    })
                                }
                                
                            }}
                        />
                    </Animated.View>
                )
            })
        )
    }

    render() {
        let mainText = this.state.selections.length > 0 ? `${this.props.placeholderText}: ${this.state.selections[0].text}` : this.props.placeholderText
        return (
            <>
            <View style={{
                width: "100%",
                marginBottom: styleValues.mediumPadding,
                ...this.props.style
            }}>
                <TextButton
                    text={mainText}
                    buttonStyle={{
                        ...defaultStyles.inputBox,
                        marginBottom: 0,
                        borderWidth: this.props.showValidSelection === true ? styleValues.minorBorderWidth : undefined,
                        borderColor: this.state.selections.length > 0 ? colors.valid : colors.invalid,
                    }}
                    textStyle={{
                        ...textStyles.small,
                        ...this.props.textStyle,
                    }}
                    onPress={() => {
                        if (this.state.expanded) {
                            this.collapse()
                        } else {
                            this.expand()
                        }
                        this.setState({expanded: !this.state.expanded})
                    }}
                />
                {this.renderItems()}
            </View>
            </>
        )
    }
}
