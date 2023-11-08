import { RouteProp } from "@react-navigation/core";
import { StackNavigationProp } from "@react-navigation/stack";
import CustomComponent from "../CustomComponents/CustomComponent";
import { capitalizeWords } from "../HelperFiles/ClientFunctions";
import {
    ImageSliderSelector,
    LoadingCover,
    BloisMenuBar,
    BloisPage,
    TagInputBox,
    BloisDropdown,
    BloisTextInput,
    BloisToggle,
    BloisColorDropdown,
    BloisTextButton,
} from "../HelperFiles/CompIndex";
import {
    Coords,
    Country,
    DefaultItemData,
    DeliveryMethods,
    ItemCategories,
    ItemConditions,
    ItemData,
    ItemFits,
    ItemGenders,
    Region,
    UserData,
} from "../HelperFiles/DataTypes";
import Item from "../HelperFiles/Item";
import { ClosetStackParamList } from "../HelperFiles/Navigation";
import {
    bottomInset,
    colors,
    screenWidth,
    styVals,
    textStyles,
} from "../HelperFiles/StyleSheet";
import User from "../HelperFiles/User";
import BloisScrollable from "../BloisComponents/BloisScrollable";
import BloisCurrencyInput from "../BloisComponents/BloisCurrencyInput";
import BloisTextBox from "../BloisComponents/BloisTextBox";
import { Entypo } from "@expo/vector-icons";
import { Text } from "react-native";
import BloisLocationSelector from "../BloisComponents/BloisLocationSelector";

type EditItemNavigationProp = StackNavigationProp<
    ClosetStackParamList,
    "editItem"
>;

type EditItemRouteProp = RouteProp<ClosetStackParamList, "editItem">;

type EditItemProps = {
    navigation: EditItemNavigationProp;
    route: EditItemRouteProp;
};

type State = {
    userData?: UserData;
    itemData?: ItemData;
    itemChanges: Partial<ItemData>;
    imagesLoaded: boolean;
    coords?: Coords,
    address?: string,
    // Signals that all inputs should check their validity
    validityFlag: boolean;
    isLoading: boolean;
    errorMessage?: string;
};

export default class EditItemPage extends CustomComponent<
    EditItemProps,
    State
> {
    constructor(props: EditItemProps) {
        super(props);
        this.state = {
            userData: undefined,
            itemData: undefined,
            itemChanges: {},
            imagesLoaded: false,
            validityFlag: false,
            isLoading: true,
            errorMessage: undefined,
        };
    }

    async refreshData() {
        this.setState({ isLoading: true, errorMessage: undefined });
        try {
            const userData = await User.get();
            let itemData;
            let coords = undefined
            let address = undefined
            if (this.props.route.params.isNew) {
                itemData = {
                    ...DefaultItemData,
                    userID: userData.userID,
                    country: userData.country,
                    region: userData.region,
                    colors: [],
                }
            } else {
                const itemInfo = await Item.getFromIDs([this.props.route.params.itemID])
                itemData = itemInfo[0].item
                coords = itemInfo[0].coords
                address = itemInfo[0].address
            }
            this.setState({
                userData: userData,
                itemData: itemData,
                itemChanges: {itemID: itemData.itemID},
                coords: coords,
                address: address
            });
        } catch (e) {
            this.handleError(e);
        }
        this.setState({ isLoading: false });
    }

    // Update the local version of this item in state
    updateItem(
        item: Partial<ItemData>,
        stateUpdates?: Partial<State>,
        callback?: () => void
    ) {
        // Ensure user ID is not changed
        delete item.userID;
        // Update state
        let stateUpdate: Partial<State> = {
            ...stateUpdates,
            itemChanges: {
                ...this.state.itemChanges,
                ...item,
            }
        };
        this.setState(stateUpdate, callback);
    }
    // Try to upload this item's data to the server
    async saveItem() {
        const itemData = {
            ...DefaultItemData,
            ...this.state.itemData,
            ...this.state.itemChanges
        }
        if (Item.validate(itemData)) {
            try {
                // Save item
                if (this.props.route.params.isNew && this.state.coords) {
                    // Create new item
                    await Item.create(itemData, this.state.coords);
                } else {
                    // Send only changes if not missing any props, otherwise update all props
                    await Item.update(this.state.itemChanges, this.state.coords);
                }
                // Signal to previous pages in stack to refresh their data
                this.props.navigation.goBack();
            } catch (e) {
                this.handleError(e);
            }
        }
    }

    renderImageSelector() {
        return (
            <ImageSliderSelector
                uris={this.state.itemData!.images}
                style={{
                    width: screenWidth,
                    marginLeft: -styVals.mediumPadding,
                }}
                minRatio={1}
                maxRatio={16 / 9}
                showValidSelection={true}
                showInitialValidity={this.state.validityFlag}
                maxNum={Item.maxNumImages}
                onImagesLoaded={() => {
                    this.setState({ imagesLoaded: true });
                }}
                onChange={(uris) => {
                    this.updateItem({ images: uris.all });
                }}
            />
        );
    }

    renderNameInput() {
        return (
            <BloisTextInput
                label={"Name"}
                defaultValue={
                    this.state.itemChanges.name || this.state.itemData?.name
                }
                textInputProps={{ maxLength: Item.maxNameLength }}
                showInitialValidity={this.state.validityFlag}
                checkValidity={(text) => Item.validateProperty("name", text)}
                onChangeText={(text) => {
                    this.updateItem({ name: text });
                }}
            />
        );
    }

    renderPriceInput() {
        if (this.state.itemData) {
            return (
                <BloisCurrencyInput
                    checkValidity={(value) => {
                        let change = true;
                        if (this.state.itemChanges.priceData) {
                            change = Item.validatePriceData(
                                this.state.itemChanges.priceData
                            );
                        }
                        return (
                            this.state.itemData?.priceData !== undefined &&
                            Item.validatePriceData(
                                this.state.itemData.priceData
                            ) &&
                            change
                        );
                    }}
                    placeholder={"$0.00"}
                    label={"Minimum price"}
                    defaultValue={
                        this.state.itemChanges.priceData?.minPrice ||
                        this.state.itemData.priceData?.minPrice ||
                        undefined
                    }
                    showInitialValidity={this.state.validityFlag}
                    onChange={(value) => {
                        if (value) {
                            this.updateItem({
                                priceData: {
                                    ...DefaultItemData.priceData,
                                    ...this.state.itemData?.priceData,
                                    minPrice: value,
                                },
                            });
                        } else {
                            this.updateItem({
                                priceData: {
                                    ...DefaultItemData.priceData,
                                    ...this.state.itemData?.priceData,
                                    minPrice: 0,
                                },
                            });
                        }
                    }}
                />
            );
        }
    }

    renderSizeInput() {
        return (
            <BloisTextInput
                label={"Size"}
                defaultValue={capitalizeWords(
                    this.state.itemChanges.size ||
                        this.state.itemData?.size ||
                        ""
                )}
                textInputProps={{ maxLength: Item.maxSizeLength }}
                showInitialValidity={this.state.validityFlag}
                checkValidity={(text) => Item.validateProperty("size", text)}
                onChangeText={(text) => {
                    this.updateItem({ size: text.toLowerCase() });
                }}
            />
        );
    }

    renderCategoryDropdown() {
        return (
            <BloisDropdown
                items={ItemCategories.map((category) => {
                    return { text: capitalizeWords(category), value: category };
                })}
                checkValidity={(selections) => selections.length > 0}
                showInitialValidity={this.state.validityFlag}
                label="Category"
                defaultValue={
                    [this.state.itemChanges.category ||
                    this.state.itemData!.category]
                }
                onSelect={(selections) => this.updateItem({ category: selections[0].value })}
            />
        );
    }

    renderGenderDropdown() {
        return (
            <BloisDropdown
                items={ItemGenders.map((gender) => {
                    let text =
                        gender === "unisex"
                            ? capitalizeWords(gender)
                            : `${capitalizeWords(gender)}'s`;
                    return { text: text, value: gender };
                })}
                checkValidity={(selections) => selections.length > 0}
                showInitialValidity={this.state.validityFlag}
                label="Gender"
                defaultValue={
                    [this.state.itemChanges.gender || this.state.itemData!.gender]
                }
                onSelect={(selections) => {
                    this.updateItem({ gender: selections[0].value });
                }}
            />
        );
    }

    renderConditionDropdown() {
        return (
            <BloisDropdown
                items={ItemConditions.map((condition) => ({
                    text: capitalizeWords(condition),
                    value: condition,
                }))}
                checkValidity={(selections) => selections.length > 0}
                showInitialValidity={this.state.validityFlag}
                label={"Condition"}
                defaultValue={
                    [this.state.itemChanges.condition ||
                    this.state.itemData!.condition]
                }
                onSelect={(selections) => {
                    this.updateItem({ condition: selections[0].value });
                }}
            />
        );
    }

    renderColorDropdown() {
        return (
            <BloisColorDropdown
                defaultValues={
                    this.state.itemChanges.colors || this.state.itemData!.colors
                }
                showInitialValidity={this.state.validityFlag}
                checkValidity={(selections) => selections.length > 0 && selections.length < 6}
                onSelect={(selections) => {
                    this.updateItem({ colors: selections });
                }}
            />
        );
    }

    renderFitDropdown() {
        return (
            <BloisDropdown
                items={ItemFits.map((fit) => {
                    let text =
                        fit === "proper"
                            ? "True to size"
                            : `Fits ${fit}`;
                    return { text: text, value: fit };
                })}
                checkValidity={(selections) => selections.length > 0}
                showInitialValidity={this.state.validityFlag}
                label="Fit"
                defaultValue={
                    [this.state.itemChanges.fit || this.state.itemData!.fit]
                }
                onSelect={(selections) => {
                    this.updateItem({ fit: selections[0].value });
                }}
            />
        );
    }

    renderDescription() {
        return (
            <BloisTextBox
                label={"Description"}
                defaultValue={
                    this.state.itemChanges.description || this.state.itemData?.description
                }
                textInputProps={{ maxLength: Item.maxDescriptionLength }}
                onChangeText={(text) => {
                    this.updateItem({ description: text });
                }}
            />
        );
    }

    renderVisibilitySwitch() {
        return (
            <BloisToggle
                text={"Hide item"}
                defaultValue={this.state.itemChanges.isVisible !== undefined ? !this.state.itemChanges.isVisible : !this.state.itemData?.isVisible}
                info={{header: 'Hide Item', body: 'This determines if your item can be seen by other people. Enable this if you are not ready to sell your item yet.'}}
                onToggle={(value) => {
                    this.updateItem({ isVisible: value });
                }}
            />
        );
    }

    renderLocationButton() {
        return (
            <BloisLocationSelector
                defaultLocation={this.state.coords && this.state.address ? {
                    coords: this.state.coords,
                    address: this.state.address
                } : undefined}
                disclaimer={`The address shown above is approximate. This item's location will not be visible to others.`}
                showInitialValidity={this.state.validityFlag}
                onChangeLocation={(coords, geocodeResult) => {
                    this.updateItem({
                        country: geocodeResult?.address.countryName.toLowerCase().split(' ').join('_') as Country,
                        region: geocodeResult?.address.state.toLowerCase().split(' ').join('_') as Region
                    }, {
                        coords: coords
                    })
                }}
            />
        );
    }

    renderUI() {
        if (this.state.itemData) {
            return (
                <>
                    <BloisScrollable
                        style={{
                            width: "100%",
                            marginBottom: styVals.mediumHeight
                        }}
                    >
                        {this.renderImageSelector()}
                        {this.renderNameInput()}
                        {this.renderSizeInput()}
                        {this.renderGenderDropdown()}
                        {this.renderCategoryDropdown()}
                        {this.renderConditionDropdown()}
                        {this.renderColorDropdown()}
                        {this.renderFitDropdown()}
                        {this.renderDescription()}
                        {this.renderPriceInput()}
                        {this.renderLocationButton()}
                        {this.renderVisibilitySwitch()}
                    </BloisScrollable>
                </>
            );
        }
    }

    renderLoading() {
        if (this.state.isLoading || this.state.errorMessage) {
            return (
                <LoadingCover
                    size={"large"}
                    errorText={this.state.errorMessage}
                    onErrorRefresh={() => this.refreshData()}
                />
            );
        }
    }

    renderMenu() {
        const currentItemData = {
            ...DefaultItemData,
            ...this.state.itemData,
            ...this.state.itemChanges,
        };
        return (
            <BloisMenuBar
                buttons={[
                    {
                        icon: {
                            type: "Entypo",
                            name: "chevron-small-left",
                        },
                        onPress: () => {
                            this.props.navigation.goBack();
                        },
                    },
                    {
                        icon: {
                            type: "Feather",
                            name: "check-square",
                        },
                        iconStyle: {
                            color:
                                Item.validate(currentItemData)
                                    ? colors.darkGrey
                                    : colors.lightestGrey,
                        },
                        onPress: async () => {
                            await this.saveItem();
                            this.setState({ validityFlag: true });
                        },
                    },
                ]}
            ></BloisMenuBar>
        );
    }

    render() {
        try {
            return (
                <BloisPage headerText={"Edit Item"}>
                    {this.renderUI()}
                    {this.renderLoading()}
                    {this.renderMenu()}
                </BloisPage>
            );
        } catch (e) {
            this.handleError(e);
        }
    }
}
