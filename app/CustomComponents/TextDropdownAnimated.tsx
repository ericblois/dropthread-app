import React from "react";
import { Animated, TextStyle, View, ViewStyle } from "react-native";
import { colors, defaultStyles, fonts, screenWidth, shadowStyles, styleValues, textStyles } from "../HelperFiles/StyleSheet";
import CustomComponent from "./CustomComponent";
import TextButton from "./TextButton";
import { CustomTextButton } from "../HelperFiles/CompIndex";

type TextDropdownAnimatedProps = {
    placeholderText: string,
    items: {
        text: string,
        value: any
    }[],
    showValidSelection?: boolean,
    indicatorType?: 'shadowSmall' | 'shadow' | 'outline',
    ignoreInitialValidity?: boolean
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

const AnimatedTextButton = Animated.createAnimatedComponent(TextButton);

export default class TextDropdownAnimated extends CustomComponent<TextDropdownAnimatedProps, State> {

    validity: Animated.Value;
    animationTime = 300;
    animatedStyles: {[type: string]: Animated.AnimatedProps<ViewStyle>};

    dropdownHeight = new Animated.Value(0);
    dropdownOpacity = new Animated.Value(0);
    dropdownTime = 100;

    constructor(props: TextDropdownAnimatedProps) {
        super(props)
        this.state = {
            expanded: false,
            selections: []
        }
        let isValid = props.showValidSelection ? (props.defaultValue ? 1 : 0) : 1;
        this.validity = new Animated.Value(props.ignoreInitialValidity !== false ? 1 : isValid);
        this.animatedStyles = {
            shadowSmall: {
                shadowOpacity: this.validity.interpolate({
                    inputRange: [0, 1],
                    outputRange: [1, shadowStyles.small.shadowOpacity]
                }),
                shadowColor: this.validity.interpolate({
                    inputRange: [0, 1],
                    outputRange: [colors.invalid, colors.black]
                })
            },
            shadow: {
                shadowOpacity: this.validity.interpolate({
                    inputRange: [0, 1],
                    outputRange: [1, shadowStyles.medium.shadowOpacity]
                }),
                shadowColor: this.validity.interpolate({
                    inputRange: [0, 1],
                    outputRange: [colors.invalid, colors.black]
                })
            },
            outline: {
                borderWidth: styleValues.minorBorderWidth,
                borderRadius: styleValues.mediumPadding,
                borderColor: this.validity.interpolate({
                    inputRange: [0, 1],
                    outputRange: [colors.invalid, colors.transparent]
                })
            }
        }
        let b = 3;
    }

    componentDidMount() {
        if (this.props.defaultValue) {
            for (const item of this.props.items) {
                if (item.value == this.props.defaultValue) {
                    this.validity.setValue(1);
                    this.setState({selections: [{text: item.text, value: item.value}]})
                    break
                }
            }
        }
        super.componentDidMount()
    }

    animateValidate = () => {
        Animated.timing(this.validity, {
            toValue: 1,
            duration: this.animationTime,
            useNativeDriver: false
        }).start()
    }

    animateInvalidate = () => {
        Animated.timing(this.validity, {
            toValue: 0,
            duration: this.animationTime,
            useNativeDriver: false
        }).start()
    }

    expand() {
        Animated.sequence([
            Animated.timing(this.dropdownHeight, {
                toValue: screenWidth*0.1,
                duration: this.dropdownTime,
                useNativeDriver: false
            }),
            Animated.timing(this.dropdownOpacity, {
                toValue: 1,
                duration: this.dropdownTime,
                useNativeDriver: false
            })
        ]).start()
    }

    collapse() {
        Animated.sequence([
            Animated.timing(this.dropdownOpacity, {
                toValue: 0,
                duration: this.dropdownTime,
                useNativeDriver: false
            }),
            Animated.timing(this.dropdownHeight, {
                toValue: 0,
                duration: this.dropdownTime,
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
                            appearance={'no-color'}
                            buttonStyle={{
                                ...defaultStyles.roundedBox,
                                shadowColor: selectedNames.includes(text) ? colors.valid : colors.black,
                                shadowOpacity: selectedNames.includes(text) ? 1 : shadowStyles.small.shadowOpacity,
                                marginBottom: styleValues.minorPadding,
                                padding: styleValues.minorPadding
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
                                    if (this.props.showValidSelection) {
                                        this.animateValidate()
                                    }
                                } else {
                                    let newSelections = this.state.selections
                                    // Check if option was already selected
                                    const optionIndex = this.state.selections.findIndex((selection) => {
                                        return selection.text === text
                                    })
                                    if (optionIndex > -1) {
                                        // Remove selection
                                        newSelections.splice(optionIndex, 1)
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
                                        // Check validity
                                        if (this.props.showValidSelection) {
                                            if (this.state.selections.length > 0) {
                                                this.animateValidate()
                                            } else {
                                                this.animateInvalidate()
                                            }
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
        let mainText = this.state.selections.length > 0
            ? `${this.props.placeholderText}: ${this.state.selections.map((sel) => sel.text).join(', ')}`
            : this.props.placeholderText
        // Check validity of input
        if (this.props.showValidSelection && this.props.ignoreInitialValidity === false) {
            if (this.state.selections.length > 0) {
                this.animateValidate()
            } else {
                this.animateInvalidate()
            }
        }
        return (
            <>
            <View style={{
                width: "100%",
                ...this.props.style
            }}>
                <CustomTextButton
                    text={mainText}
                    buttonStyle={{
                        ...defaultStyles.roundedBox,
                        padding: styleValues.minorPadding,
                        height: styleValues.smallHeight,
                    }}
                    wrapperStyle={this.props.indicatorType ? this.animatedStyles[this.props.indicatorType] : undefined}
                    textStyle={{
                        ...(this.state.selections.length > 0 ? textStyles.small : textStyles.smaller),
                        color: this.state.selections.length > 0 ? colors.black : colors.grey,
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
