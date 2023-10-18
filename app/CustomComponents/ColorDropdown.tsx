import React from "react";
import { Animated, TextStyle, View, ViewStyle } from "react-native";
import { colors, defaultStyles, fonts, screenWidth, shadowStyles, styleValues, textStyles } from "../HelperFiles/StyleSheet";
import CustomComponent from "./CustomComponent";
import TextButton from "./TextButton";
import { BloisPressable, CustomTextButton } from "../HelperFiles/CompIndex";
import { ItemColor, ItemColorValues, ItemColors } from "../HelperFiles/DataTypes";
import Item from "../HelperFiles/Item";

type ColorDropdownProps = {
    showValidSelection?: boolean,
    indicatorType?: 'shadowSmall' | 'shadow' | 'outline',
    ignoreInitialValidity?: boolean,
    enableMultiple?: boolean,
    defaultValues?: ItemColor[],
    maxNum?: number,
    onSelect?: (selections: ItemColor[]) => void,
    style?: ViewStyle,
    textStyle?: TextStyle,
}

type State = {
    expanded: boolean,
    maxNum: number,
    selections: ItemColor[]
}

const AnimatedTextButton = Animated.createAnimatedComponent(TextButton);

export default class ColorDropdown extends CustomComponent<ColorDropdownProps, State> {

    validity: Animated.Value;
    animationTime = 300;
    animatedStyles: {[type: string]: Animated.AnimatedProps<ViewStyle>};

    maxDropdownHeight = (screenWidth - 2*styleValues.mediumPadding)*0.4
    dropdownPadding = new Animated.Value(0);
    dropdownHeight = new Animated.Value(0);
    dropdownOpacity = new Animated.Value(0);
    dropdownTime = 100;

    constructor(props: ColorDropdownProps) {
        super(props)
        this.state = {
            expanded: false,
            maxNum: props.maxNum || Item.maxNumColors,
            selections: []
        }
        let isValid = props.showValidSelection ? (props.defaultValues ? 1 : 0) : 1;
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
        if (this.props.defaultValues) {
            this.validity.setValue(1);
            this.setState({selections: this.props.defaultValues});
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
            Animated.parallel([
                Animated.timing(this.dropdownHeight, {
                    toValue: this.maxDropdownHeight,
                    duration: this.dropdownTime,
                    useNativeDriver: false
                }),
                Animated.timing(this.dropdownPadding, {
                    toValue: styleValues.minorPadding,
                    duration: this.dropdownTime,
                    useNativeDriver: false
                })
            ]),
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
            Animated.parallel([
                Animated.timing(this.dropdownHeight, {
                    toValue: 0,
                    duration: this.dropdownTime,
                    useNativeDriver: false
                }),
                Animated.timing(this.dropdownPadding, {
                    toValue: 0,
                    duration: this.dropdownTime,
                    useNativeDriver: false
                })
            ]),
        ]).start()
    }

    renderItems() {
        return (
            <Animated.View
                        style={{
                            height: this.dropdownHeight,
                            opacity: this.dropdownOpacity,
                            flexDirection: 'row',
                            flexWrap: 'wrap',
                            paddingVertical: this.dropdownPadding
                        }}
                    >
                {ItemColors.map((value, index) => {
                    return (<BloisPressable
                        style={{
                            width: '20%',
                            height: '25%',
                            paddingBottom: styleValues.mediumPadding
                        }}
                        key={index.toString()}
                        onPress={() => {
                            if (this.props.enableMultiple !== false) {
                                let newSelections = this.state.selections
                                // Check if option was already selected
                                const optionIndex = this.state.selections.findIndex((selection) => (value == selection))
                                if (optionIndex > -1) {
                                    // Remove selection
                                    newSelections.splice(optionIndex, 1);
                                } else {
                                    if (this.state.selections.length >= this.state.maxNum) {
                                        return;
                                    }
                                    // Add selection
                                    newSelections.push(value)
                                }
                                this.setState({
                                    selections: newSelections
                                }, () => {
                                    this.props.onSelect?.(this.state.selections);
                                    // Check validity
                                    if (this.props.showValidSelection) {
                                        if (this.state.selections.length > 0) {
                                            this.animateValidate()
                                        } else {
                                            this.animateInvalidate();
                                        }
                                    }
                                })
                            } else {
                                this.collapse()
                                this.setState({
                                    selections: [value],
                                    expanded: false
                                }, () => this.props.onSelect?.(this.state.selections))
                                if (this.props.showValidSelection) {
                                    this.animateValidate()
                                }
                            }
                            
                        }}
                    >
                        <View
                            style={{
                                borderColor: colors.black,
                                borderWidth: this.state.selections.includes(value) ? styleValues.mediumBorderWidth : undefined,
                                height: '100%',
                                aspectRatio: 1,
                                backgroundColor: colors.transparent,
                                borderRadius: styleValues.minorPadding,
                                padding: styleValues.minorPadding/2
                            }}
                        >
                            <View
                                style={{
                                    ...shadowStyles.small,
                                    height: '100%',
                                    width: '100%',
                                    backgroundColor: ItemColorValues[value],
                                    borderRadius: styleValues.minorPadding,
                                }}
                            ></View>
                        </View>
                        
                    </BloisPressable>)
                })}
            </Animated.View>
        )
    }

    render() {
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
                    text={`Colors${this.state.selections.length > 0 ? ': ' : ''}`}
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
                    rightChildren={
                        <View style={{flexDirection: 'row', alignItems: 'center'}}>
                            {this.state.selections.map((value, index) => {
                                return (<View
                                    style={{
                                        ...shadowStyles.small,
                                        height: styleValues.iconSmallSize,
                                        width: styleValues.iconSmallSize,
                                        backgroundColor: ItemColorValues[value],
                                        borderRadius: styleValues.minorPadding,
                                        marginLeft: styleValues.minorPadding
                                    }}
                                    key={index.toString()}
                                ></View>)
                            })}
                        </View>
                    }
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
