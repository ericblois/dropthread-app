
import MultiSlider from '@ptomasroos/react-native-multi-slider';
import { BlurView } from "expo-blur";
import React from "react";
import { Animated, Pressable, StyleSheet, Text, View, ViewStyle } from "react-native";
import { capitalizeWords } from "../HelperFiles/ClientFunctions";
import { simpleCurrencyFormatter } from "../HelperFiles/Constants";
import { countriesList, DefaultItemFilter, ItemCategories, ItemConditions, ItemFilter, ItemGenders } from "../HelperFiles/DataTypes";
import { bottomInset, colors, defaultStyles, icons, screenWidth, shadowStyles, styVals, textStyles, topInset } from "../HelperFiles/StyleSheet";
import CustomComponent from "./CustomComponent";
import CustomImageButton from "./CustomImageButton";
import ScrollContainer from "./ScrollContainer";
import TextButton from "./TextButton";
import BloisTextInput from "../BloisComponents/BloisTextInput";

type Props = {
    style?: ViewStyle,
    containerStyle?: ViewStyle,
    contentContainerStyle?: ViewStyle,
    initialFilter?: ItemFilter,
    disabled?: boolean,
    onSearchSubmit?: (text: string) => void,
    onSearchToggle?: (willShowSearch: boolean) => void,
    onFilterChange?: (filters: ItemFilter) => void,
    onFilterSubmit?: (filters: ItemFilter) => void
}

type State = {
    filters: ItemFilter,
    prevFilterValues: ItemFilter,
    showSearchBar: boolean,
    showDropdown: boolean,
    dropdownType: string
}

const AnimatedBlurView = Animated.createAnimatedComponent(BlurView);

export default class FilterSearchBar extends CustomComponent<Props, State> {

    constructor(props: Props) {
        super(props);
        this.state = {
            filters: {...props.initialFilter},
            prevFilterValues: {...props.initialFilter},
            showSearchBar: false,
            showDropdown: false,
            dropdownType: ""
        }
    }

    dropdownFadeTime = 150
    blurIntensity = new Animated.Value(0)
    dropdownOpacity = new Animated.Value(0)

    searchFadeTime = 250
    searchBarFlex = new Animated.Value(0)
    searchBarOpacity = new Animated.Value(0)
    filterOpacity = new Animated.Value(0)
    contentTopPos = new Animated.Value(topInset + styVals.smallHeight + styVals.mediumPadding)

    showSearchBar() {
      this.setState({showSearchBar: true}, () => {
        Animated.parallel([
            Animated.timing(this.searchBarFlex, {
                toValue: 1,
                duration: this.searchFadeTime,
                useNativeDriver: false
            }),
            Animated.timing(this.searchBarOpacity, {
                toValue: 1,
                duration: this.searchFadeTime,
                useNativeDriver: false
            }),
            Animated.sequence([
              Animated.timing(this.contentTopPos, {
                toValue: topInset + styVals.smallHeight*2 + styVals.mediumPadding*2,
                duration: this.searchFadeTime/2,
                useNativeDriver: false
              }),
              Animated.timing(this.filterOpacity, {
                  toValue: 1,
                  duration: this.searchFadeTime/2,
                  useNativeDriver: false
              })
            ])
        ]).start()
    })
    }

    hideSearchBar() {
        Animated.sequence([
            // If dropdown is currently shown, hide it first and then hide search bar
            this.state.showDropdown ?
            Animated.parallel([
                Animated.timing(this.blurIntensity, {
                    toValue: 0,
                    duration: this.dropdownFadeTime,
                    useNativeDriver: false
                }),
                Animated.timing(this.dropdownOpacity, {
                    toValue: 0,
                    duration: this.dropdownFadeTime,
                    useNativeDriver: false
                })
            ])
            : Animated.delay(0),
            Animated.parallel([
                Animated.timing(this.searchBarFlex, {
                    toValue: 0,
                    duration: this.searchFadeTime,
                    useNativeDriver: false
                }),
                Animated.timing(this.searchBarOpacity, {
                    toValue: 0,
                    duration: this.searchFadeTime,
                    useNativeDriver: false
                }),
                Animated.sequence([
                  Animated.timing(this.filterOpacity, {
                    toValue: 0,
                    duration: this.searchFadeTime/2,
                    useNativeDriver: false
                  }),
                  Animated.timing(this.contentTopPos, {
                    toValue: topInset + styVals.smallHeight + styVals.mediumPadding,
                    duration: this.searchFadeTime/2,
                    useNativeDriver: false
                  })
                ])
            ])
        ]).start(() => {
            if (this.state.showDropdown && this.props.onFilterSubmit) {
                this.props.onFilterSubmit(this.state.filters)
            }
            this.setState({showSearchBar: false, showDropdown: false, dropdownType: ""})
        })
    }

    showDropdown() {
        this.setState({showDropdown: true}, () => {
            Animated.parallel([
                Animated.timing(this.blurIntensity, {
                    toValue: 15,
                    duration: this.dropdownFadeTime,
                    useNativeDriver: false
                }),
                Animated.timing(this.dropdownOpacity, {
                    toValue: 1,
                    duration: this.dropdownFadeTime,
                    useNativeDriver: false
                })
            ]).start()
        })
    }

    hideDropdown() {
        Animated.parallel([
            Animated.timing(this.blurIntensity, {
                toValue: 0,
                duration: this.dropdownFadeTime,
                useNativeDriver: false
            }),
            Animated.timing(this.dropdownOpacity, {
                toValue: 0,
                duration: this.dropdownFadeTime,
                useNativeDriver: false
            })
        ]).start(() => {
            if (this.state.showDropdown && this.props.onFilterSubmit) {
                this.props.onFilterSubmit(this.state.filters)
            }
            this.setState({showDropdown: false, dropdownType: ""})
        })
    }
    // Switch to a different dropdown type while a dropdown is currently open
    switchDropdown(type: string) {
        Animated.timing(this.dropdownOpacity, {
            toValue: 0,
            duration: this.dropdownFadeTime/2,
            useNativeDriver: false
        }).start(() => {
            this.setState({dropdownType: type}, () => {
                Animated.timing(this.dropdownOpacity, {
                    toValue: 1,
                    duration: this.dropdownFadeTime/2,
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
                    marginRight: filterKey === "country" ? 0 : styVals.mediumPadding,
                    marginBottom: undefined
                }}
                textStyle={textStyles.medium}
                touchableProps={{
                    disabled: !this.state.showSearchBar
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
        if (this.state.showSearchBar && this.state.showDropdown && this.state.dropdownType === filterKey) {
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
        if (this.state.showSearchBar && this.state.showDropdown && this.state.dropdownType === filterKey) {
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
        if (this.state.showSearchBar) {
            return (
                <ScrollContainer
                    containerStyle={{
                        width: "100%",
                        height: styVals.smallHeight + styVals.mediumPadding*2,
                        flex: undefined,
                    }}
                    contentContainerStyle={{height: styVals.smallHeight + styVals.mediumPadding*2}}
                    horizontal={true}
                >
                    <Animated.View
                        style={{
                            flexDirection: "row",
                            opacity: this.filterOpacity
                        }}
                    >
                        {this.renderFilterButton("gender", "Gender")}
                        {this.renderFilterButton("priceRange", "Price")}
                        {this.renderFilterButton("category", "Article")}
                        {this.renderFilterButton("condition", "Condition")}
                        {this.renderFilterButton("distanceInKM", "Distance", undefined, "km")}
                        {this.renderFilterButton("country", "Country")}
                    </Animated.View>
                </ScrollContainer>
            )
        }
    }
    // If dropdown is being shown, blur out the background
    renderBlur() {
        if (this.state.showSearchBar && this.state.showDropdown) {
            return (
                <AnimatedBlurView
                    style={defaultStyles.fill}
                    intensity={this.blurIntensity}
                    tint={"default"}
                />
            )
        }
    }
    // Render all of the interactable elements
    renderUI() {
        return (
            /* Container */
            <Pressable
                style={{
                    ...styles.elementContainer,
                    ...defaultStyles.fill,
                    elevation: this.state.showDropdown ? 100 : 0,
                    zIndex: this.state.showDropdown ? 100 : 0,
                    ...this.props.containerStyle
                }}
                onPress={() => {
                    if (this.state.showDropdown) {
                        this.hideDropdown()
                    }
                }}
            >
                {/* Search button and text input */}
                <View style={{
                    width: "100%",
                    paddingHorizontal: styVals.mediumPadding,
                    alignSelf: "center",
                    flexDirection: "row",
                    alignItems: "center"
                }}>
                    <CustomImageButton
                    iconSource={icons.search}
                    buttonStyle={{
                        height: styVals.iconLargeSize,
                        width: styVals.iconLargeSize,
                        marginRight: styVals.mediumPadding,
                    }}
                    iconStyle={{tintColor: colors.darkGrey}}
                    onPress={() => {
                        if (this.state.showSearchBar) {
                            if (this.props.onSearchToggle) {
                                this.props.onSearchToggle(false)
                            }
                            this.hideSearchBar()
                        } else {
                            if (this.props.onSearchToggle) {
                                this.props.onSearchToggle(true)
                            }
                            this.showSearchBar()
                        }
                    }}
                    />
                    <Animated.View
                        style={{
                            flex: this.searchBarFlex,
                            opacity: this.searchBarOpacity
                    }}>
                        <BloisTextInput
                            boxStyle={{marginBottom: undefined}}
                            textProps={{
                                 
                            }}
                        />
                    </Animated.View>
                </View>
                {/* Filter buttons */}
                {this.renderBar()}
                {/* Filter editors */}
                {this.renderSelections('gender', ItemGenders.concat(), ItemGenders.concat())}
                {this.renderSelections('category', ItemCategories.concat(), ItemCategories.concat())}
                {this.renderSlider("distanceInKM", [1, 2, 3, 4, 5, 10, 15, 25, 50])}
                {this.renderSlider("priceRange", [0,10,20,30,40,50,60,70,80,90,100,125,150,175,200,250,300,400,500,1000,2000,3000,4000,5000,10000])}
                {this.renderSelections("condition", ItemConditions.concat(), ItemConditions.concat())}
                {this.renderSelections('country', countriesList.concat(), countriesList.concat())}
            </Pressable>
        )
    }

    render() {
        return (
            <View
                style={{
                    ...defaultStyles.fill,
                    zIndex: this.state.showDropdown ? 90 : 0,
                    elevation: this.state.showDropdown ? 90 : 0
                }}
            >   
                {this.renderUI()}
                {/* Content container */}
                <Animated.View
                    style={{
                        position: "absolute",
                        top: this.contentTopPos,
                        bottom: 0,
                        left: 0,
                        right: 0,
                        ...this.props.contentContainerStyle
                    }}
                    pointerEvents={"box-none"}
                >
                    {this.props.children}
                </Animated.View>
                {this.renderBlur()}
            </View>
        )
    }
}

const styles = StyleSheet.create({
    elementContainer: {
        flexDirection: "column",
        paddingTop: topInset + styVals.mediumPadding,
        width: "100%"
    },
    dropdownBackground: {
        ...shadowStyles.small,
        width: screenWidth - 2*styVals.mediumPadding,
        alignSelf: "center",
        alignItems: "center",
    }
})