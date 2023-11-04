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
} from "../HelperFiles/CompIndex";
import {
    DefaultItemData,
    DeliveryMethods,
    ItemCategories,
    ItemConditions,
    ItemData,
    ItemFits,
    ItemGenders,
    UserData,
} from "../HelperFiles/DataTypes";
import Item from "../HelperFiles/Item";
import { ClosetStackParamList } from "../HelperFiles/Navigation";
import {
    bottomInset,
    colors,
    screenWidth,
    styVals,
} from "../HelperFiles/StyleSheet";
import User from "../HelperFiles/User";
import BloisScrollable from "../BloisComponents/BloisScrollable";
import BloisCurrencyInput from "../BloisComponents/BloisCurrencyInput";

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
    priceChangeText: string;
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
            priceChangeText: "",
            validityFlag: false,
            isLoading: true,
            errorMessage: undefined,
        };
    }

    async refreshData() {
        this.setState({ isLoading: true, errorMessage: undefined });
        try {
            const userData = await User.get();
            // Check if this is a new item or existing item
            const itemData = this.props.route.params.isNew
                ? {
                      ...DefaultItemData,
                      userID: userData.userID,
                      country: userData.country,
                      region: userData.region,
                      styles: [],
                      colors: [],
                  }
                : (await Item.getFromIDs([this.props.route.params.itemID]))[0]
                      .item;
            this.setState({
                userData: userData,
                itemData: itemData,
                itemChanges: {itemID: itemData.itemID},
                priceChangeText:
                    itemData.priceData.minPrice >= 0
                        ? itemData.priceData.minPrice.toString()
                        : "",
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
            },
        };
        this.setState(stateUpdate, callback);
    }
    // Try to upload this item's data to the server
    async saveItem() {
        if (Item.validatePartial(this.state.itemChanges)) {
            try {
                // Save item
                if (this.props.route.params.isNew) {
                    const newItemData = {
                        ...DefaultItemData,
                        ...this.state.itemChanges,
                    };
                    // Create new item
                    await Item.create(newItemData);
                } else {
                    // Send only changes if not missing any props, otherwise update all props
                    await Item.update(this.state.itemChanges);
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
                    this.state.itemChanges.category ||
                    this.state.itemData!.category
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
                    this.state.itemChanges.gender || this.state.itemData!.gender
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
                    this.state.itemChanges.condition ||
                    this.state.itemData!.condition
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
                    this.state.itemChanges.fit || this.state.itemData!.fit
                }
                onSelect={(selections) => {
                    this.updateItem({ fit: selections[0].value });
                }}
            />
        );
    }

    renderDescription() {
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
                    this.state.itemChanges.fit || this.state.itemData!.fit
                }
                onSelect={(selections) => {
                    this.updateItem({ fit: selections[0].value });
                }}
            />
        );
    }

    renderVisibilitySwitch() {
        return (
            <BloisToggle
                text={"Publicly visible"}
                defaultValue={this.state.itemChanges.isVisible || this.state.itemData?.isVisible}
                info={{header: 'Public Visibility', body: 'This determines if your item can be seen by other people. Disable this if you are not ready to sell your item yet.'}}
                onToggle={(value) => {
                    this.updateItem({ isVisible: value });
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
                        {this.renderPriceInput()}
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
                                this.state.itemData &&
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
