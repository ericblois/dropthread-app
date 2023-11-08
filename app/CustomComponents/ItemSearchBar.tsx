import MultiSlider from "@ptomasroos/react-native-multi-slider";
import Slider from "@react-native-community/slider";
import { BlurView } from "expo-blur";
import React from "react";
import {
    Animated,
    Pressable,
    StyleSheet,
    Text,
    View,
    ViewStyle,
} from "react-native";
import { capitalizeWords } from "../HelperFiles/ClientFunctions";
import { simpleCurrencyFormatter } from "../HelperFiles/Constants";
import {
    countriesList,
    DefaultItemFilter,
    extractKeywords,
    ItemCategories,
    ItemCategory,
    ItemColors,
    ItemCondition,
    ItemConditions,
    ItemFilter,
    ItemGender,
    ItemGenders,
} from "../HelperFiles/DataTypes";
import {
    bottomInset,
    colors,
    defaultStyles,
    icons,
    screenWidth,
    shadowStyles,
    styVals,
    textStyles,
    topInset,
} from "../HelperFiles/StyleSheet";
import CustomComponent from "./CustomComponent";
import CustomImageButton from "./CustomImageButton";
import ScrollContainer from "./ScrollContainer";
import TextButton from "./TextButton";
import BloisTextInput from "../BloisComponents/BloisTextInput";
import BloisIconButton from "../BloisComponents/BloisIconButton";
import CustomModal from "./CustomModal";
import BloisDropdown from "../BloisComponents/BloisDropdown";
import BloisColorDropdown from "../BloisComponents/BloisColorDropdown";
import BloisCurrencyInput from "../BloisComponents/BloisCurrencyInput";
import Item from "../HelperFiles/Item";
import BloisScrollable from "../BloisComponents/BloisScrollable";
import { Ionicons } from "@expo/vector-icons";
import { BloisTextButton } from "../HelperFiles/CompIndex";
import uuid from "react-native-uuid"

type Props = {
    style?: ViewStyle;
    containerStyle?: ViewStyle;
    contentContainerStyle?: ViewStyle;
    initialFilter?: ItemFilter;
    disabled?: boolean;
    onFilterChange?: (filters: ItemFilter) => void;
    onFilterSubmit?: (filters: ItemFilter) => void;
};

type State = {
    filters: ItemFilter;
    searchValue: string
    distSliderValue: number;
    showModal: boolean;
    inputKeys: string[]
};

export default class ItemSearchBar extends CustomComponent<Props, State> {

    modalRef: CustomModal | null = null;

    constructor(props: Props) {
        super(props);
        this.state = {
            filters: { ...props.initialFilter },
            searchValue: '',
            distSliderValue: 0,
            showModal: false,
            inputKeys: Array.from({length: 8}, () => uuid.v4().toString())
        };
    }

    renderSearchButton() {
        return (
            <BloisIconButton
                icon={{
                    type: "Ionicons",
                    name: "search-sharp",
                }}
                style={{ width: styVals.iconLargeSize }}
                animType={"opacity"}
                onPress={() => this.setState({ showModal: true })}
            />
        );
    }

    renderSearchBar() {
        return (
            <BloisTextInput
                placeholder={"Search..."}
                defaultValue={this.state.searchValue}
                textInputProps={{
                    onEndEditing: (event) => {
                        const text = event.nativeEvent.text;
                        // Check if no keywords are given
                        if (text === '') {
                            if (this.state.filters.keywords) {
                                const newFilters = this.state.filters;
                                delete newFilters.keywords;
                                this.setState({ filters: newFilters });
                                return
                            }
                        }
                        // Otherwise, extract keywords
                        const keywords = extractKeywords(text);
                        const newFilters: ItemFilter = {
                            ...this.state.filters,
                            keywords: keywords,
                        };
                        this.setState({ filters: newFilters }, () =>
                            this.props.onFilterChange?.(this.state.filters)
                        );
                    },
                    returnKeyType: "search",
                }}
                key={this.state.inputKeys[0]}
            >
                <Ionicons
                    name={'search-sharp'}
                    style={{...textStyles.larger, color: colors.darkGrey, marginRight: styVals.minorPadding}}
                />
            </BloisTextInput>
        );
    }

    renderGenderSelect() {
        return (
            <BloisDropdown
                items={ItemGenders.map((gender) => {
                    let text =
                        gender === "unisex"
                            ? capitalizeWords(gender)
                            : `${capitalizeWords(gender)}'s`;
                    return { text: text, value: gender };
                })}
                label="Gender"
                defaultValue={this.state.filters.gender}
                multiselect
                onSelect={(selections) => {
                    const newGenders: ItemGender[] = selections.map(
                        ({ value }) => value
                    );
                    // Update filter
                    const newFilters: ItemFilter = {
                        ...this.state.filters,
                        gender: newGenders,
                    };
                    // Delete field if not being used
                    if (newGenders.length === 0) {
                        delete newFilters.gender;
                    }
                    this.setState({ filters: newFilters }, () =>
                        this.props.onFilterChange?.(this.state.filters)
                    );
                }}
                key={this.state.inputKeys[1]}
            />
        );
    }

    renderCategorySelect() {
        return (
            <BloisDropdown
                items={ItemCategories.map((category) => {
                    return { text: capitalizeWords(category), value: category };
                })}
                label="Category"
                defaultValue={this.state.filters.category}
                multiselect
                onSelect={(selections) => {
                    const newCategories: ItemCategory[] = selections.map(
                        ({ value }) => value
                    );
                    // Update filter
                    const newFilters: ItemFilter = {
                        ...this.state.filters,
                        category: newCategories,
                    };
                    // Delete field if not being used
                    if (newCategories.length === 0) {
                        delete newFilters.category;
                    }
                    this.setState({ filters: newFilters }, () =>
                        this.props.onFilterChange?.(this.state.filters)
                    );
                }}
                key={this.state.inputKeys[2]}
            />
        );
    }

    renderConditionSelect() {
        return (
            <BloisDropdown
                items={ItemConditions.map((condition) => ({
                    text: capitalizeWords(condition),
                    value: condition,
                }))}
                label={"Condition"}
                defaultValue={this.state.filters.condition}
                multiselect
                onSelect={(selections) => {
                    const newConditions: ItemCondition[] = selections.map(
                        ({ value }) => value
                    );
                    // Update filter
                    const newFilters: ItemFilter = {
                        ...this.state.filters,
                        condition: newConditions,
                    };
                    // Delete field if not being used
                    if (newConditions.length === 0) {
                        delete newFilters.condition;
                    }
                    this.setState({ filters: newFilters }, () =>
                        this.props.onFilterChange?.(this.state.filters)
                    );
                }}
                key={this.state.inputKeys[3]}
            />
        );
    }

    renderColorSelect() {
        return (
            <BloisColorDropdown
                defaultValues={this.state.filters.colors}
                maxNum={ItemColors.length}
                onSelect={(selections) => {
                    // Update filter
                    const newFilters: ItemFilter = {
                        ...this.state.filters,
                        colors: selections,
                    };
                    // Delete field if not being used
                    if (selections.length === 0) {
                        delete newFilters.colors;
                    }
                    this.setState({ filters: newFilters }, () =>
                        this.props.onFilterChange?.(this.state.filters)
                    );
                }}
                key={this.state.inputKeys[4]}
            />
        );
    }

    renderPriceSelect() {
        return (
            <View style={{ flexDirection: "row", gap: styVals.mediumPadding }}>
                <BloisCurrencyInput
                    placeholder={"Min price"}
                    defaultValue={this.state.filters.priceRange?.[0]}
                    onChange={(value) => {
                        let newValue = value;
                        if (value < 0) {
                            newValue = 0;
                        } else if (value > 99999) {
                            value = 99999;
                        }
                        const newPriceRange = [
                            newValue,
                            this.state.filters.priceRange?.[1] || 99999,
                        ];
                        const newFilters: ItemFilter = {
                            ...this.state.filters,
                            priceRange: newPriceRange,
                        };
                        this.setState({ filters: newFilters }, () =>
                            this.props.onFilterChange?.(this.state.filters)
                        );
                    }}
                    key={this.state.inputKeys[5]}
                />
                <BloisCurrencyInput
                    placeholder={"Min price"}
                    defaultValue={this.state.filters.priceRange?.[1]}
                    onChange={(value) => {
                        let newValue = value;
                        if (value < 0) {
                            newValue = 0;
                        } else if (value > 99999) {
                            value = 99999;
                        }
                        const newPriceRange = [
                            this.state.filters.priceRange?.[0] || 99999,
                            newValue,
                        ];
                        const newFilters: ItemFilter = {
                            ...this.state.filters,
                            priceRange: newPriceRange,
                        };
                        this.setState({ filters: newFilters }, () =>
                            this.props.onFilterChange?.(this.state.filters)
                        );
                    }}
                    key={this.state.inputKeys[6]}
                />
            </View>
        );
    }

    renderDistanceSelect() {
        const values = [1, 2, 3, 4, 5, 10, 15, 25, 50, 100];
        const initValue =
            values.findIndex(
                (val) => val === (this.state.filters.distanceInKM || 1)
            ) || 0;
        return (
            <View
                style={{
                    ...defaultStyles.roundedBox,
                    ...shadowStyles.small,
                    padding: styVals.mediumPadding,
                    paddingVertical: styVals.minorPadding,
                }}
            >
                <Text style={textStyles.medium}>{`Max distance: ${
                    this.state.filters.distanceInKM || values[initValue]
                }km`}</Text>
                <Slider
                    value={initValue}
                    style={{
                        width: "100%",
                    }}
                    minimumTrackTintColor={colors.valid}
                    maximumTrackTintColor={colors.grey}
                    step={1}
                    tapToSeek
                    minimumValue={0}
                    maximumValue={values.length - 1}
                    onValueChange={(value) => {
                        const newFilters: ItemFilter = {
                            ...this.state.filters,
                            distanceInKM: values[value],
                        };
                        this.setState(
                            { distSliderValue: value, filters: newFilters },
                            () =>
                                this.props.onFilterChange?.(this.state.filters)
                        );
                    }}
                    key={this.state.inputKeys[7]}
                ></Slider>
            </View>
            /*<MultiSlider
                containerStyle={{
                    width: "100%",
                    //marginTop: styVals.smallHeight,
                }}
                trackStyle={{
                    ...shadowStyles.small,
                    height: styVals.minorPadding,
                    borderRadius: styVals.minorPadding / 2,
                }}
                markerStyle={{
                    ...shadowStyles.small,
                    backgroundColor: colors.background,
                    borderRadius: styVals.mediumPadding,
                    height: styVals.iconMediumSize,
                    width: styVals.iconMediumSize,
                    alignSelf: "center",
                }}
                sliderLength={screenWidth - styVals.mediumPadding * 4}
                snapped={true}
                values={[1, 2, 3, 4, 5, 10, 15, 25, 50, 100]}
                enabledOne={true}
                optionsArray={[1, 2, 3, 4, 5, 10, 15, 25, 50, 100]}
                enableLabel={true}
                customLabel={(props) => {
                    return (
                        <View
                            style={{
                                ...defaultStyles.roundedBox,
                                width: undefined,
                                alignSelf: "center",
                            }}
                        >
                            <Text style={{ ...textStyles.medium }}>
                                {props.oneMarkerValue}
                            </Text>
                        </View>
                    );
                }}
                onValuesChange={(values) => {
                    // Update current filters
                    const newFilters: ItemFilter = {
                        ...this.state.filters,
                        distanceInKM: values[0],
                    };
                    this.setState({ filters: newFilters }, () =>
                        this.props.onFilterChange?.(this.state.filters)
                    );
                }}
            />*/
        );
    }

    renderFilterButtons() {
        return (
            <>
                <BloisTextButton
                    text={'Reset filters'}
                    onPress={() => {
                        const newKeys = Array.from({length: 8}, () => uuid.v4().toString())
                        this.setState({filters: {...(DefaultItemFilter)}, inputKeys: newKeys}, () => this.props.onFilterChange?.(this.state.filters))
                    }}
                />
                <BloisTextButton
                    text={'Apply filters'}
                    style={{backgroundColor: colors.valid}}
                    textStyle={{color: colors.white}}
                    onPress={() => {
                        if (this.modalRef) {
                            this.modalRef.props.onClose?.()
                        }
                    }}
                />
            </>
        )
    }

    renderModal() {
        return (
            <CustomModal
                ref={(ref) => {this.modalRef = ref}}
                visible={this.state.showModal}
                style={{ justifyContent: "flex-start" }}
                disableExitButton
                onClose={() => {
                    console.log(this.state.filters)
                    this.setState({ showModal: false }, () =>
                        this.props.onFilterSubmit?.(this.state.filters)
                    );
                }}
            >
                <BloisScrollable style={{ width: "100%" }}>
                    {this.renderSearchBar()}
                    {this.renderGenderSelect()}
                    {this.renderCategorySelect()}
                    {this.renderConditionSelect()}
                    {this.renderColorSelect()}
                    {this.renderPriceSelect()}
                    {this.renderDistanceSelect()}
                    {this.renderFilterButtons()}
                </BloisScrollable>
            </CustomModal>
        );
    }

    render() {
        return (
            <View
                style={{
                    ...defaultStyles.roundedBox,
                    ...shadowStyles.medium,
                    width: styVals.mediumHeight,
                    aspectRatio: 1,
                    position: "absolute",
                    top: topInset + styVals.mediumPadding,
                    right: styVals.mediumPadding,
                    borderRadius: styVals.mediumHeight / 2,
                    borderTopRightRadius: styVals.mediumPadding,
                }}
            >
                {this.renderSearchButton()}
                {this.renderModal()}
            </View>
        );
    }
}
