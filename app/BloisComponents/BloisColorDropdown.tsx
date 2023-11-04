import React from "react";
import { Animated, TextStyle, View, ViewStyle } from "react-native";
import {
    colors,
    defaultStyles,
    fonts,
    screenWidth,
    shadowStyles,
    styVals,
    textStyles,
} from "../HelperFiles/StyleSheet";
import CustomComponent from "../CustomComponents/CustomComponent";
import TextButton from "../CustomComponents/TextButton";
import { BloisPressable, BloisTextButton } from "../HelperFiles/CompIndex";
import {
    ItemColor,
    ItemColorValues,
    ItemColors,
} from "../HelperFiles/DataTypes";
import Item from "../HelperFiles/Item";
import { Feather } from '@expo/vector-icons'

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

export default class BloisColorDropdown extends CustomComponent<
    ColorDropdownProps,
    State
> {
    validity: Animated.Value;
    animationTime = 300;
    animatedStyles: { [type: string]: Animated.AnimatedProps<ViewStyle> };

    maxDropdownHeight = (screenWidth - 2 * styVals.mediumPadding) * 0.4;

    dropdownHeight = new Animated.Value(0);
    dropdownOpacity = new Animated.Value(0);
    dropdownTime = 100;

    constructor(props: ColorDropdownProps) {
        super(props);
        this.state = {
            expanded: false,
            maxNum: props.maxNum || Item.maxNumColors,
            selections: props.defaultValues || [],
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
                borderWidth: styVals.minorBorderWidth,
                borderRadius: styVals.mediumPadding,
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

    animValid = () => {
        Animated.timing(this.validity, {
            toValue: 1,
            duration: this.animationTime,
            useNativeDriver: false,
        }).start();
    };

    animInvalid = () => {
        Animated.timing(this.validity, {
            toValue: 0,
            duration: this.animationTime,
            useNativeDriver: false,
        }).start();
    };

    expand(callback?: () => void) {
        this.setState({ expanded: true }, () => {
            Animated.sequence([
                Animated.timing(this.dropdownHeight, {
                    toValue: this.maxDropdownHeight,
                    duration: this.dropdownTime,
                    useNativeDriver: false,
                }),
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
            Animated.timing(this.dropdownHeight, {
                toValue: 0,
                duration: this.dropdownTime,
                useNativeDriver: false,
            })
        ]).start(() => {
            this.setState({ expanded: false }, () => {
                // Check validity
                if (this.props.checkValidity) {
                    if (this.props.checkValidity(this.state.selections)) {
                        this.animValid();
                    } else {
                        this.animInvalid();
                    }
                }
            });
            callback?.();
        });
    }

    handleSelect = (color: ItemColor) => {
        // Multiselect
        if (this.props.multiselect !== false) {
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
                if (this.state.selections.length >= this.state.maxNum) {
                    return;
                }
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
                            this.animValid();
                        } else {
                            this.animInvalid();
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
        if (this.state.expanded) {
            const colorRows = [0, 1, 2, 3].map((val) => {
                return ItemColors.slice(val*5, val*5 + 5)
            })
            return (
                <Animated.View
                    style={{
                        ...defaultStyles.roundedBox,
                        ...shadowStyles.small,
                        paddingHorizontal: 0,
                        height: this.dropdownHeight,
                        opacity: this.dropdownOpacity
                    }}
                >
                    {colorRows.map((row, i) => {
                        return (
                            <View style={{
                                flexDirection: 'row',
                                justifyContent: 'space-between',
                                width: '100%',
                                height: '25%'
                            }} key={i.toString()}>
                                {row.map((color, index) => (
                                    <BloisPressable
                                        style={{
                                            width: '20%',
                                            height: '100%',
                                            alignItems: 'center',
                                            justifyContent: 'center'
                                        }}
                                        animType={'shadowSmall'}
                                        key={index.toString()}
                                        onPress={() => this.handleSelect(color)}
                                    >
                                        <View
                                            style={{
                                                borderColor: colors.darkGrey,
                                                borderWidth: this.state.selections.includes(
                                                    color
                                                )
                                                    ? styVals.mediumBorderWidth
                                                    : undefined,
                                                backgroundColor: colors.transparent,
                                                borderRadius: styVals.minorPadding*1.5,
                                                padding: styVals.minorPadding / 2,
                                            }}
                                        >
                                            <View
                                                style={{
                                                    height: styVals.smallHeight/2,
                                                    aspectRatio: 1,
                                                    backgroundColor: ItemColorValues[color],
                                                    borderRadius: styVals.minorPadding,
                                                }}
                                            ></View>
                                        </View>
                                    </BloisPressable>
                                ))}
                            </View>
                        )
                    })}
                </Animated.View>
            );
        }
    }

    render() {
        // Check validity of input
        if (
            this.props.checkValidity &&
            this.props.showInitialValidity
        ) {
            if (this.props.checkValidity(this.state.selections)) {
                this.animValid();
            } else {
                this.animInvalid();
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
                        text={'Color'}
                        style={{
                            ...defaultStyles.roundedBox,
                            height: styVals.smallHeight,
                            justifyContent: 'space-between',
                            ...this.animatedStyles[this.props.indicatorType || 'shadowSmall'],
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
                                    style={{fontSize: styVals.largerTextSize, color: colors.grey}}
                                    
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
                    >
                        <View style={{
                            flex: 1,
                            flexDirection: 'row',
                            paddingHorizontal: styVals.mediumPadding,
                            gap: styVals.mediumPadding
                        }}>
                            {this.state.selections.map((color) => (
                                <View
                                    style={{
                                        ...shadowStyles.small,
                                        height: styVals.smallHeight/2,
                                        aspectRatio: 1,
                                        backgroundColor: ItemColorValues[color],
                                        borderRadius: styVals.minorPadding,
                                    }}
                                    key={color}
                                ></View>
                            ))}
                        </View>
                    </BloisTextButton>
                    {this.renderItems()}
                </View>
            </>
        );
    }
}
