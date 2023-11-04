
import MultiSlider from '@ptomasroos/react-native-multi-slider';
import { BlurView } from "expo-blur";
import React from "react";
import { Animated, StyleSheet, Text, View, ViewStyle, TouchableWithoutFeedback } from "react-native";
import { capitalizeWords } from "../HelperFiles/ClientFunctions";
import { simpleCurrencyFormatter } from "../HelperFiles/Constants";
import { countriesList, DefaultItemFilter, ItemCategories, ItemConditions, ItemFilter, ItemGenders } from "../HelperFiles/DataTypes";
import { colors, defaultStyles, icons, screenWidth, shadowStyles, styVals, textStyles } from "../HelperFiles/StyleSheet";
import CustomComponent from "./CustomComponent";
import ScrollContainer from "./ScrollContainer";
import TextButton from "./TextButton";

type Props = {
    style?: ViewStyle,
    initialFilter?: ItemFilter,
    disabled?: boolean,
    onFilterChange?: (filters: ItemFilter) => void
}

type State = {
    filters: ItemFilter,
    prevFilterValues: ItemFilter,
    showDropdown: boolean,
    dropdownType: string
}

const AnimatedBlurView = Animated.createAnimatedComponent(BlurView);

export default class FilterScrollBar extends CustomComponent<Props, State> {

    constructor(props: Props) {
        super(props);
        this.state = {
            filters: {...props.initialFilter},
            prevFilterValues: {...props.initialFilter},
            showDropdown: false,
            dropdownType: ""
        }
    }

    fadeTime = 150
    blurIntensity = new Animated.Value(0)
    dropdownOpacity = new Animated.Value(0)

    showDropdown() {
        this.setState({showDropdown: true}, () => {
            Animated.parallel([
                Animated.timing(this.blurIntensity, {
                    toValue: 15,
                    duration: this.fadeTime,
                    useNativeDriver: false
                }),
                Animated.timing(this.dropdownOpacity, {
                    toValue: 1,
                    duration: this.fadeTime,
                    useNativeDriver: false
                })
            ]).start()
        })
    }

    hideDropdown() {
        Animated.parallel([
            Animated.timing(this.blurIntensity, {
                toValue: 0,
                duration: this.fadeTime,
                useNativeDriver: false
            }),
            Animated.timing(this.dropdownOpacity, {
                toValue: 0,
                duration: this.fadeTime,
                useNativeDriver: false
            })
        ]).start(() => {
            this.setState({showDropdown: false})
        })
    }
    // Switch to a different dropdown type while a dropdown is currently open
    switchDropdown(type: string) {
        Animated.timing(this.dropdownOpacity, {
            toValue: 0,
            duration: this.fadeTime/2,
            useNativeDriver: false
        }).start(() => {
            this.setState({dropdownType: type}, () => {
                Animated.timing(this.dropdownOpacity, {
                    toValue: 1,
                    duration: this.fadeTime/2,
                    useNativeDriver: false
                }).start()
            })
        })
    }
    // Render an individual filter button
    renderFilterButton(filterKey: keyof ItemFilter, label: string, labelPrefix?: string, labelSuffix?: string) {
        // Check for array fields, and if they contain more than one selection
        let valueText = ""
        if (this.state.filters[filterKey] !== undefined) {
            valueText = capitalizeWords((this.state.filters[filterKey]!.toString()).replaceAll('_', ' '))
            if (filterKey === "priceRange" && this.state.filters[filterKey]!.length > 1) {
                valueText = `${simpleCurrencyFormatter.format(this.state.filters[filterKey]![0])} - ${simpleCurrencyFormatter.format(this.state.filters[filterKey]![1])}`
            } else if (Array.isArray(this.state.filters[filterKey]) && (this.state.filters[filterKey] as any[]).length > 1) {
                valueText = "Multiple"
            }
        }
        // Check if this filter type has a selection, and if so, add it to the label
        let text = this.state.filters[filterKey] === undefined ? label : `${label}: ${valueText}`
        if (labelPrefix !== undefined) {
            text = labelPrefix + text
        }
        if (labelSuffix !== undefined) {
            text += labelSuffix
        }
        return (
            <TextButton
                text={`${text}`}
                appearance={this.state.filters[filterKey] !== undefined ? "color" : this.state.dropdownType === filterKey ? "light" : "no-color"}
                buttonStyle={{
                    height: styVals.smallHeight,
                    width: undefined,
                    marginRight: filterKey === "country" ? 0 : styVals.mediumPadding
                }}
                textStyle={textStyles.medium}
                touchableProps={{
                    disabled: this.props.disabled !== false ? true : false
                }}
                onPress={() => {
                    // Check if no dropdown is currently shown
                    if (!this.state.showDropdown) {
                        // Show dropdown
                        this.setState({dropdownType: filterKey}, () => this.showDropdown())
                    // If dropdown is currently shown, check if it corresponds to this filter
                    } else if (this.state.dropdownType === filterKey) {
                        // Hide dropdown
                        this.setState({dropdownType: ""}, () => this.hideDropdown())
                    } else {
                        // Switch to other dropdown
                        this.switchDropdown(filterKey)
                    }
                }}
            />
        )
    }
    // Render a dropdown of discrete options
    renderSelections(filterKey: keyof ItemFilter, labels: string[], options: any[]) {
        if (labels.length !== options.length) {
            throw Error("Received label array and value array of differing sizes.")
        }
        if (this.state.showDropdown && this.state.dropdownType === filterKey) {
            // Field parameters
            const isMultiselect = Array.isArray(DefaultItemFilter[filterKey])
            const selections = options.map(() => false)
            // Get initial multi-select selections
            if (this.state.filters[filterKey] !== undefined && isMultiselect) {
                    // For each value in this filter option, set the button state to true
                    (this.state.filters[filterKey] as any[]).forEach((filterValue) => {
                        // Find and update index
                        const valueIndex = options.indexOf(filterValue)
                        if (valueIndex > -1) {
                            selections[valueIndex] = true
                        }
                    })
            // Get initial singular selection
            } else {
                const valueIndex = options.indexOf(this.state.filters[filterKey])
                if (valueIndex > -1) {
                    selections[valueIndex] = true
                }
            }
            return (
                <Animated.View
                    style={{
                        ...styles.dropdownBackground,
                        opacity: this.dropdownOpacity
                    }}
                >
                    {labels.map((label, index) => {
                        const buttonState: boolean = selections[index]
                        return (
                            <TextButton
                                text={capitalizeWords(label.replaceAll('_', ' '))}
                                appearance={buttonState ? "color" : "no-color"}
                                buttonStyle={{height: styVals.smallHeight}}
                                textStyle={textStyles.medium}
                                onPress={() => {
                                    let newFilters = {} as ItemFilter
                                    if (isMultiselect) {
                                        // Array fields
                                        let newArrayFilter: any[] | undefined = this.state.filters[filterKey] !== undefined ? this.state.filters[filterKey] as any[] : []
                                        const valueIndex = newArrayFilter.indexOf(options[index])
                                        if (valueIndex > -1) {
                                            // Remove field from array
                                            newArrayFilter.splice(valueIndex, 1)
                                        } else {
                                            //Add field to array
                                            newArrayFilter.push(options[index])
                                        }
                                        newFilters = {
                                            ...this.state.filters,
                                            [filterKey]: newArrayFilter
                                        } as ItemFilter
                                        // Delete field if undefined (reduce amount of data to be transferred to server)
                                        if (newArrayFilter.length === 0) {
                                            delete newFilters[filterKey]
                                        }
                                    } else {
                                        // Single value fields
                                        newFilters = {
                                            ...this.state.filters,
                                            [filterKey]: buttonState ? undefined : options[index]
                                        } as ItemFilter
                                        // Delete field if undefined (reduce amount of data to be transferred to server)
                                        if (newFilters[filterKey] === undefined) {
                                            delete newFilters[filterKey]
                                        }
                                    }
                                    // Update filters
                                    this.setState({filters: newFilters}, () => {
                                        if (this.props.onFilterChange) {
                                            this.props.onFilterChange(this.state.filters)
                                        }
                                    })
                                }}
                                key={label}
                            />
                        )
                    })}
                </Animated.View>
            )
        }
    }
    // Render a slider for a continous numerical value
    renderSlider(filterKey: keyof ItemFilter, options: number[]) {
        if (this.state.showDropdown && this.state.dropdownType === filterKey) {
            // Filter field parameters
            let range: boolean = false
            let optional: boolean = false
            let defaultValues: number[] = [0,10]
            let generateLabel: (labelValues: number[]) => string = (labelValues: number[]) => `${labelValues[0]}`
            // Per-field custom parameters
            switch (filterKey) {
                case "distanceInKM":
                    defaultValues = [5]
                    generateLabel = (labelValues) => {
                        return `${labelValues[0]}km`
                    }
                    break
                case "priceRange":
                    range = true
                    optional = true
                    defaultValues = [0, 100]
                    generateLabel = (labelValues) => {
                        return `${simpleCurrencyFormatter.format(labelValues[0])} - ${simpleCurrencyFormatter.format(labelValues[1])}`
                    }
                    break
                default:
                    break
            }
            // Get values
            let values: number[] = []
            // Check if there is no current value for this filter field
            if (this.state.filters[filterKey] === undefined) {
                // Set values to last used values or defaultStyles
                if (optional && this.state.prevFilterValues[filterKey] !== undefined) {
                    values = this.state.prevFilterValues[filterKey] as number[]
                } else if (defaultValues !== undefined) {
                    values = defaultValues
                }
            // Check if this field is a single value or an array, then set values
            } else if (this.state.filters[filterKey] !== undefined && !Array.isArray(this.state.filters[filterKey])) {
                values.push(this.state.filters[filterKey] as number)
            } else {
                values = this.state.filters[filterKey] as number[]
            }
            return (
                <Animated.View
                    style={{
                        ...styles.dropdownBackground,
                        opacity: this.dropdownOpacity
                    }}
                >
                    <MultiSlider
                        containerStyle={{
                            width: "100%",
                            //marginTop: styVals.smallHeight,
                        }}
                        trackStyle={{
                            ...shadowStyles.small,
                            height: styVals.minorPadding,
                            borderRadius: styVals.minorPadding/2,
                        }}
                        markerStyle={{
                            ...shadowStyles.small,
                            backgroundColor: colors.white,
                            borderColor: colors.main,
                            borderWidth: styVals.mediumBorderWidth,
                            borderRadius: styVals.mediumPadding,
                            height: styVals.iconMediumSize,
                            width: styVals.iconMediumSize,
                            alignSelf: "center"
                        }}
                        selectedStyle={{backgroundColor: colors.main}}
                        unselectedStyle={{backgroundColor: colors.white}}
                        sliderLength={(screenWidth - styVals.mediumPadding*4)}
                        snapped={true}
                        values={values}
                        enabledOne={true}
                        enabledTwo={range}
                        isMarkersSeparated={true}
                        optionsArray={options}
                        enableLabel={true}
                        customLabel={(props) => {
                            return (
                                <View
                                    style={{
                                        alignSelf: "center",
                                        backgroundColor: colors.white,
                                        borderRadius: styVals.mediumPadding,
                                        padding: styVals.minorPadding
                                    }}
                                >
                                    <Text
                                        style={{
                                            ...textStyles.large,
                                        }}
                                    >{generateLabel([props.oneMarkerValue as number, props.twoMarkerValue as number])}</Text>
                                </View>
                            )
                        }}
                        onValuesChange={(values) => {
                            // Update current filters
                            const newFilters = {
                                ...this.state.filters,
                                [filterKey]: range ? values : values[0]
                            }
                            // Keep previous filter values (don't set any previous values to undefined)
                            const prevFilters = {
                                ...this.state.prevFilterValues,
                                [filterKey]: range ? values : values[0]
                            }
                            this.setState({filters: newFilters, prevFilterValues: prevFilters}, () => {
                                if (this.props.onFilterChange) {
                                    this.props.onFilterChange(this.state.filters)
                                }
                            })
                        }}
                    />
                    {optional ? (
                        <TextButton
                            text="Use filter"
                            appearance={this.state.filters[filterKey] === undefined ? "no-color" : "light"}
                            rightIconSource={this.state.filters[filterKey] === undefined ? icons.uncheckedBox : icons.checkBox}
                            onPress={() => {
                                let newValues = undefined
                                // Check if button is being toggled on
                                if (this.state.filters[filterKey] === undefined) {
                                    // Check for previous values
                                    if (this.state.prevFilterValues[filterKey] === undefined) {
                                        newValues = defaultValues
                                    } else {
                                        newValues = this.state.prevFilterValues[filterKey]
                                    }
                                }
                                // Update filter
                                const newFilters = {
                                    ...this.state.filters,
                                    [filterKey]: newValues
                                }
                                // Delete field if not being used
                                if (newValues === undefined) {
                                    delete newFilters[filterKey]
                                }
                                this.setState({filters: newFilters}, () => {
                                    if (this.props.onFilterChange) {
                                        this.props.onFilterChange(this.state.filters)
                                    }
                                })
                            }}
                        />
                    ) : undefined}
                </Animated.View>
            )
        }
    }
    // Render horizontally sliding filter buttons
    renderBar() {
        return (
            <ScrollContainer
                containerStyle={{
                    height: "100%",
                    width: "100%"
                }}
                horizontal={true}
            >
                {this.renderFilterButton("gender", "Gender")}
                {this.renderFilterButton("size", "Size")}
                {this.renderFilterButton("priceRange", "Price")}
                {this.renderFilterButton("category", "Article")}
                {this.renderFilterButton("condition", "Condition")}
                {this.renderFilterButton("distanceInKM", "Distance", undefined, "km")}
                {this.renderFilterButton("country", "Country")}
            </ScrollContainer>
        )
    }
    // If dropdown is being shown, blur out the background
    renderBlur() {
        if (this.state.showDropdown) {
            return (
                <AnimatedBlurView
                    style={defaultStyles.fill}
                    intensity={this.blurIntensity}
                    tint={"dark"}
                >
                    <TouchableWithoutFeedback
                        style={{
                            height: "100%",
                            width: "100%",
                        }}
                        onPress={() => {
                            if (this.state.showDropdown) {
                                this.setState({dropdownType: ""}, () => this.hideDropdown())
                            }
                        }}
                    />
                </AnimatedBlurView>
            )
        }
    }

    render() {
        return (
            <View
                style={defaultStyles.fill}
                pointerEvents={"box-none"}
            >
                {this.renderBlur()}
                <View style={{
                    ...styles.barContainer,
                    ...this.props.style
                }}>
                    {this.renderBar()}
                    {this.renderSelections('gender', ItemGenders.concat(), ItemGenders.concat())}
                    {this.renderSelections('category', ItemCategories.concat(), ItemCategories.concat())}
                    {this.renderSlider("distanceInKM", [1, 2, 3, 4, 5, 10, 15, 25, 50])}
                    {this.renderSlider("priceRange", [0,10,20,30,40,50,60,70,80,90,100,125,150,175,200,250,300,400,500,1000,2000,3000,4000,5000,10000])}
                    {this.renderSelections("condition", ItemConditions.concat(), ItemConditions.concat())}
                    {this.renderSelections('country', countriesList.concat(), countriesList.concat())}
                </View>
            </View>
        )
    }
}

const styles = StyleSheet.create({
    barContainer: {
        height: screenWidth * 0.15,
        width: screenWidth,
        zIndex: 10,
        elevation: 10
    },
    filterButton: {
        height: "100%",
        width: undefined,
        backgroundColor: colors.white,
        marginBottom: undefined,
        marginRight: styVals.mediumPadding
    },
    filterText: {
        ...textStyles.medium
    },
    dropdownBackground: {
        ...shadowStyles.small,
        position: "absolute",
        width: screenWidth - 2*styVals.mediumPadding,
        top: styVals.smallHeight + styVals.mediumPadding,
        alignSelf: "center",
        padding: styVals.mediumPadding,
        paddingBottom: 0,
    }
})