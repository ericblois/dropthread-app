import React from "react";
import { Animated, TextStyle, View, ViewStyle } from "react-native";
import {
    colors,
    defaultStyles,
    fonts,
    screenWidth,
    shadowStyles,
    styleValues,
    textStyles,
} from "../HelperFiles/StyleSheet";
import CustomComponent from "../CustomComponents/CustomComponent";
import TextButton from "../CustomComponents/TextButton";
import { BloisTextButton } from "../HelperFiles/CompIndex";

import {Feather} from "@expo/vector-icons"

type BloisDropdownProps = {
    label: string;
    items: {
        text: string;
        value: any;
    }[];
    defaultValue?: any;
    style?: ViewStyle;
    containerStyle?: ViewStyle,
    textStyle?: TextStyle;
    multiselect?: boolean;
    indicatorType?: "shadowSmall" | "shadow" | "outline";
    showInitialValidity?: boolean;
    checkValidity?: (selections: { text: string; value: any }[]) => boolean;
    onSelect?: (selections: { text: string; value: any }[]) => void;
};

type State = {
    expanded: boolean;
    selections: { text: string; value: any }[];
};

export default class BloisDropdown extends CustomComponent<
    BloisDropdownProps,
    State
> {
    validity: Animated.Value;
    animationTime = 300;
    animatedStyles: { [type: string]: Animated.AnimatedProps<ViewStyle> };

    dropdownHeight = new Animated.Value(0);
    dropdownOpacity = new Animated.Value(0);
    dropdownTime = 100;

    constructor(props: BloisDropdownProps) {
        super(props);
        this.state = {
            expanded: false,
            selections: [],
        };
        // Determine initial validity
        let isValid = props.checkValidity ? (props.defaultValue ? 1 : 0) : 1;
        this.validity = new Animated.Value(
            props.showInitialValidity ? isValid : 1
        );
        // Set styles
        this.animatedStyles = {
            shadowSmall: {
                shadowOpacity: this.validity.interpolate({
                    inputRange: [0, 1],
                    outputRange: [1, shadowStyles.small.shadowOpacity],
                }),
                shadowColor: this.validity.interpolate({
                    inputRange: [0, 1],
                    outputRange: [colors.invalid, colors.black],
                }),
            },
            shadow: {
                shadowOpacity: this.validity.interpolate({
                    inputRange: [0, 1],
                    outputRange: [1, shadowStyles.medium.shadowOpacity],
                }),
                shadowColor: this.validity.interpolate({
                    inputRange: [0, 1],
                    outputRange: [colors.invalid, colors.black],
                }),
            },
            outline: {
                borderWidth: styleValues.minorBorderWidth,
                borderRadius: styleValues.mediumPadding,
                borderColor: this.validity.interpolate({
                    inputRange: [0, 1],
                    outputRange: [colors.invalid, colors.transparent],
                }),
            },
        };
    }

    componentDidMount() {
        if (this.props.defaultValue) {
            for (const item of this.props.items) {
                if (item.value == this.props.defaultValue) {
                    this.validity.setValue(1);
                    this.setState({
                        selections: [{ text: item.text, value: item.value }],
                    });
                    break;
                }
            }
        }
        super.componentDidMount();
    }

    animateValidate = () => {
        Animated.timing(this.validity, {
            toValue: 1,
            duration: this.animationTime,
            useNativeDriver: false,
        }).start();
    };

    animateInvalidate = () => {
        Animated.timing(this.validity, {
            toValue: 0,
            duration: this.animationTime,
            useNativeDriver: false,
        }).start();
    };

    expand(callback?: () => void) {
        this.setState({expanded: true}, () => {
            Animated.sequence([
                Animated.timing(this.dropdownHeight, {
                    toValue: styleValues.smallHeight*this.props.items.length,
                    duration: this.dropdownTime,
                    useNativeDriver: false,
                }),
                Animated.timing(this.dropdownOpacity, {
                    toValue: 1,
                    duration: this.dropdownTime,
                    useNativeDriver: false,
                }),
            ]).start(callback);
        })
        
    }

    collapse(callback?: () => void) {
        Animated.sequence([
            Animated.timing(this.dropdownOpacity, {
                toValue: 0,
                duration: this.dropdownTime,
                useNativeDriver: false,
            }),
            Animated.timing(this.dropdownHeight, {
                toValue: 0,
                duration: this.dropdownTime,
                useNativeDriver: false,
            }),
        ]).start(() => {
            // Check validity
            if (this.props.checkValidity) {
                if (this.props.checkValidity(this.state.selections)) {
                    this.animateValidate();
                } else {
                    this.animateInvalidate();
                }
            }
            this.setState({expanded: false})
            callback?.();
        });
    }

    handleSelect = (text: string, value: any) => {
        // Single select
        if (this.props.multiselect !== true) {
            this.setState(
                { selections: [{ text: text, value: value }] },
                () => {
                    this.collapse();
                    this.props.onSelect?.(this.state.selections);
                }
            );
        } // Multiselect
        else {
            let newSelections = this.state.selections;
            // Check if option was already selected
            const optionIndex = this.state.selections.findIndex((selection) => {
                return selection.text === text;
            });
            if (optionIndex > -1) {
                // Remove selection
                newSelections.splice(optionIndex, 1);
            } else {
                // Add selection
                newSelections.push({ text: text, value: value });
            }
            this.setState({ selections: newSelections }, () =>
                this.props.onSelect?.(this.state.selections)
            );
        }
    };

    renderItems() {
        if (this.state.expanded) {
            const selectedNames = this.state.selections.map(({ text }) => text);
            return (
                <Animated.View
                    style={{
                        ...defaultStyles.roundedBox,
                        ...shadowStyles.small,
                        padding: 0,
                        margin: 0,
                        height: this.dropdownHeight,
                        opacity: this.dropdownOpacity,
                    }}
                >
                    {this.props.items.map(({ text, value }, index) => {
                        const isSelected = selectedNames.includes(text);
                        return (
                            <BloisTextButton
                                text={text}
                                style={{
                                    borderTopWidth: index !== 0 ? styleValues.minorBorderWidth : 0,
                                    borderColor: colors.lightGrey,
                                    width: '100%',
                                    padding: styleValues.mediumPadding,
                                    justifyContent: 'space-between',
                                }}
                                textStyle={{
                                    ...textStyles.medium,
                                    fontFamily: isSelected
                                        ? fonts.medium
                                        : fonts.regular,
                                    color: isSelected
                                        ? colors.valid
                                        : colors.mediumTextColor,
                                    ...this.props.textStyle,
                                }}
                                rightChildren={(
                                    <Feather
                                        name={isSelected ? 'check-circle' : 'circle'}
                                        style={{
                                            fontSize: styleValues.largeTextSize,
                                            color: isSelected ? colors.valid : colors.lightGrey
                                        }}
                                    />
                                )}
                                animType={"opacity"}
                                onPress={() => this.handleSelect(text, value)}
                                key={index.toString()}
                            />
                        );
                    })}
                </Animated.View>
            );
        }
    }

    render() {
        let mainText =
            this.state.selections.length > 0
                ? `${this.props.label}: ${this.state.selections
                      .map((sel) => sel.text)
                      .join(", ")}`
                : this.props.label;
        // Check validity of input
        if (this.props.checkValidity && this.props.showInitialValidity) {
            if (this.props.checkValidity(this.state.selections)) {
                this.animateValidate();
            } else {
                this.animateInvalidate();
            }
        }
        return (
            <View
                style={{
                    width: "100%",
                    ...this.props.containerStyle,
                }}
            >
                <BloisTextButton
                    text={mainText}
                    style={{
                        ...defaultStyles.roundedBox,
                        height: styleValues.smallHeight,
                        justifyContent: 'space-between',
                        ...(this.props.indicatorType
                            ? this.animatedStyles[this.props.indicatorType]
                            : undefined),
                        ...this.props.style
                    }}
                    textStyle={{
                        ...textStyles.medium,
                        color:
                            this.state.selections.length > 0
                                ? colors.black
                                : colors.grey,
                        ...this.props.textStyle,
                    }}
                    rightChildren={(
                        <Animated.View
                            style={{
                                transform: [{
                                    rotate: this.dropdownOpacity.interpolate({
                                        inputRange: [0, 1],
                                        outputRange: ['0deg', '180deg'],
                                    })
                                }]
                            }}
                        >
                            <Feather
                                name={'chevron-down'}
                                style={{fontSize: styleValues.largerTextSize, color: colors.grey}}
                                
                            />
                        </Animated.View>
                    )}
                    onPress={() => {
                        if (this.state.expanded) {
                            this.collapse();
                        } else {
                            this.expand();
                        }
                    }}
                />
                {this.renderItems()}
            </View>
        );
    }
}
