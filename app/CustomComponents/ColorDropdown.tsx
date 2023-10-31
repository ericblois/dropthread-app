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
import CustomComponent from "./CustomComponent";
import TextButton from "./TextButton";
import { BloisPressable, BloisTextButton } from "../HelperFiles/CompIndex";
import {
    ItemColor,
    ItemColorValues,
    ItemColors,
} from "../HelperFiles/DataTypes";
import Item from "../HelperFiles/Item";

type ColorDropdownProps = {
    defaultValues?: ItemColor[];
    style?: ViewStyle;
    textStyle?: TextStyle;
    multiselect?: boolean;
    maxNum?: number;
    indicatorType?: "shadowSmall" | "shadow" | "outline";
    showInitialValidity?: boolean;
    checkValidity?: (selections: ItemColor[]) => boolean;
    onSelect?: (selections: ItemColor[]) => void;
};

type State = {
    expanded: boolean;
    maxNum: number;
    selections: ItemColor[];
};

export default class ColorDropdown extends CustomComponent<
    ColorDropdownProps,
    State
> {
    validity: Animated.Value;
    animationTime = 300;
    animatedStyles: { [type: string]: Animated.AnimatedProps<ViewStyle> };

    maxDropdownHeight = (screenWidth - 2 * styleValues.mediumPadding) * 0.4;
    dropdownPadding = new Animated.Value(0);
    dropdownHeight = new Animated.Value(0);
    dropdownOpacity = new Animated.Value(0);
    dropdownTime = 100;

    constructor(props: ColorDropdownProps) {
        super(props);
        this.state = {
            expanded: false,
            maxNum: props.maxNum || Item.maxNumColors,
            selections: [],
        };
        let isValid = props.checkValidity
            ? props.defaultValues && props.checkValidity(props.defaultValues)
                ? 1
                : 0
            : 1;
        this.validity = new Animated.Value(
            props.showInitialValidity === false ? isValid : 1
        );
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
        if (this.props.defaultValues) {
            this.validity.setValue(1);
            this.setState({ selections: this.props.defaultValues });
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
        this.setState({ expanded: true }, () => {
            Animated.sequence([
                Animated.parallel([
                    Animated.timing(this.dropdownHeight, {
                        toValue: this.maxDropdownHeight,
                        duration: this.dropdownTime,
                        useNativeDriver: false,
                    }),
                    Animated.timing(this.dropdownPadding, {
                        toValue: styleValues.minorPadding,
                        duration: this.dropdownTime,
                        useNativeDriver: false,
                    }),
                ]),
                Animated.timing(this.dropdownOpacity, {
                    toValue: 1,
                    duration: this.dropdownTime,
                    useNativeDriver: false,
                }),
            ]).start(callback);
        });
    }

    collapse(callback?: () => void) {
        Animated.sequence([
            Animated.timing(this.dropdownOpacity, {
                toValue: 0,
                duration: this.dropdownTime,
                useNativeDriver: false,
            }),
            Animated.parallel([
                Animated.timing(this.dropdownHeight, {
                    toValue: 0,
                    duration: this.dropdownTime,
                    useNativeDriver: false,
                }),
                Animated.timing(this.dropdownPadding, {
                    toValue: 0,
                    duration: this.dropdownTime,
                    useNativeDriver: false,
                }),
            ]),
        ]).start(() => {
            this.setState({ expanded: false }, () => {
                // Check validity
                if (this.props.checkValidity) {
                    if (this.props.checkValidity(this.state.selections)) {
                        this.animateValidate();
                    } else {
                        this.animateInvalidate();
                    }
                }
            });
            callback?.();
        });
    }

    handleSelect = (color: ItemColor) => {
        // Single select
        if (this.props.multiselect !== false) {
            if (this.state.selections.length >= this.state.maxNum) {
                return;
            }
            let newSelections = this.state.selections;
            // Check if option was already selected
            const optionIndex = this.state.selections.findIndex(
                (selection) => color == selection
            );
            if (optionIndex > -1) {
                // Remove selection
                newSelections.splice(optionIndex, 1);
            } else {
                // Add selection
                newSelections.push(color);
            }
            this.setState(
                {
                    selections: newSelections,
                },
                () => {
                    this.props.onSelect?.(this.state.selections);
                    // Check validity
                    if (this.props.checkValidity) {
                        if (this.props.checkValidity(this.state.selections)) {
                            this.animateValidate();
                        } else {
                            this.animateInvalidate();
                        }
                    }
                }
            );
        } // Single select
        else {
            this.setState({ selections: [color] }, () => {
                this.collapse()
                this.props.onSelect?.(this.state.selections)
            });
        }
    };

    renderItems() {
        return (
            <Animated.View
                style={{
                    ...defaultStyles.roundedBox,
                    height: this.dropdownHeight,
                    opacity: this.dropdownOpacity,
                    flexDirection: "row",
                    flexWrap: "wrap",
                    paddingVertical: this.dropdownPadding,
                }}
            >
                {ItemColors.map((value, index) => {
                    return (
                        <BloisPressable
                            style={{
                                width: "20%",
                                height: "25%",
                                paddingBottom: styleValues.mediumPadding,
                            }}
                            key={index.toString()}
                            onPress={() => this.handleSelect(value)}
                        >
                            <View
                                style={{
                                    borderColor: colors.black,
                                    borderWidth: this.state.selections.includes(
                                        value
                                    )
                                        ? styleValues.mediumBorderWidth
                                        : undefined,
                                    height: "100%",
                                    aspectRatio: 1,
                                    backgroundColor: colors.transparent,
                                    borderRadius: styleValues.minorPadding,
                                    padding: styleValues.minorPadding / 2,
                                }}
                            >
                                <View
                                    style={{
                                        ...shadowStyles.small,
                                        height: "100%",
                                        width: "100%",
                                        backgroundColor: ItemColorValues[value],
                                        borderRadius: styleValues.minorPadding,
                                    }}
                                ></View>
                            </View>
                        </BloisPressable>
                    );
                })}
            </Animated.View>
        );
    }

    render() {
        // Check validity of input
        if (
            this.props.checkValidity &&
            this.props.ignoreInitialValidity === false
        ) {
            if (this.props.checkValidity(this.state.selections)) {
                this.animateValidate();
            } else {
                this.animateInvalidate();
            }
        }
        return (
            <>
                <View
                    style={{
                        width: "100%",
                        ...this.props.style,
                    }}
                >
                    <BloisTextButton
                        text={`Colors${
                            this.state.selections.length > 0 ? ": " : ""
                        }`}
                        style={{
                            ...defaultStyles.roundedBox,
                            padding: styleValues.minorPadding,
                            height: styleValues.smallHeight,
                            ...(this.props.indicatorType
                                ? this.animatedStyles[this.props.indicatorType]
                                : undefined),
                        }}
                        textStyle={{
                            ...(this.state.selections.length > 0
                                ? textStyles.medium
                                : textStyles.small),
                            color:
                                this.state.selections.length > 0
                                    ? colors.black
                                    : colors.grey,
                            ...this.props.textStyle,
                        }}
                        rightChildren={
                            <View
                                style={{
                                    flexDirection: "row",
                                    alignItems: "center",
                                }}
                            >
                                {this.state.selections.map((value, index) => {
                                    return (
                                        <View
                                            style={{
                                                ...shadowStyles.small,
                                                height: styleValues.iconSmallSize,
                                                width: styleValues.iconSmallSize,
                                                backgroundColor:
                                                    ItemColorValues[value],
                                                borderRadius:
                                                    styleValues.minorPadding,
                                                marginLeft:
                                                    styleValues.minorPadding,
                                            }}
                                            key={index.toString()}
                                        ></View>
                                    );
                                })}
                            </View>
                        }
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
            </>
        );
    }
}
