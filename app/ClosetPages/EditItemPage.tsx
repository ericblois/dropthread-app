import { RouteProp } from "@react-navigation/core";
import { StackNavigationProp } from '@react-navigation/stack';
import React from "react";
import { DeviceEventEmitter, StyleSheet } from "react-native";
import CustomComponent from "../CustomComponents/CustomComponent";
import { capitalizeWords } from "../HelperFiles/ClientFunctions";
import { CurrencyInputBox, ImageSliderSelector, LoadingCover, MenuBar, PageContainer, ScrollContainer, TagInputBox, TextDropdownAnimated, TextInputBox, ToggleSwitch } from "../HelperFiles/CompIndex";
import { DefaultItemData, ItemCategories, ItemConditions, ItemData, ItemFits, ItemGenders, UserData, validateItem } from "../HelperFiles/DataTypes";
import Item from "../HelperFiles/Item";
import { ClosetStackParamList } from "../HelperFiles/Navigation";
import { colors, icons, styleValues } from "../HelperFiles/StyleSheet";
import User from "../HelperFiles/User";

type EditItemNavigationProp = StackNavigationProp<ClosetStackParamList, "editItem">

type EditItemRouteProp = RouteProp<ClosetStackParamList, "editItem">;

type EditItemProps = {
    navigation: EditItemNavigationProp,
    route: EditItemRouteProp
}

type State = {
    userData?: UserData,
    itemData?: ItemData,
    itemChanges: Partial<ItemData>,
    imagesLoaded: boolean,
    priceChangeText: string,
    saved: boolean,
    errorOccurred: boolean
}

export default class EditItemPage extends CustomComponent<EditItemProps, State> {

    constructor(props: EditItemProps) {
        super(props)
        this.state = {
            userData: undefined,
            itemData: undefined,
            itemChanges: {},
            imagesLoaded: false,
            priceChangeText: "",
            saved: true,
            errorOccurred: false
        }
    }

    async refreshData() {
        this.setState({errorOccurred: false})
        try {
            const userData = await User.get()
            // Check if this is a new item or existing item
            const itemData = this.props.route.params.isNew
                ? {...DefaultItemData,
                    userID: userData.userID,
                    country: userData.country,
                    region: userData.region
                }
                : (await Item.getFromIDs([this.props.route.params.itemID]))[0].item
            this.setState({
                userData: userData,
                itemData: itemData,
                itemChanges: {
                    ...this.state.itemChanges,
                    itemID: itemData.itemID
                },
                priceChangeText: itemData.minPrice >= 0 ? itemData.minPrice.toString() : "",
            })
        } catch {
            this.setState({errorOccurred: true})
        }
    }
        
    // Update the local version of this item in state
    updateItem(item: Partial<ItemData>, stateUpdates?: Partial<State>, callback?: () => void) {
        // Ensure user ID is not changed
        delete item.userID
        // Update state
        let stateUpdate: Partial<State> = {
            ...stateUpdates,
            itemChanges: {
                ...this.state.itemChanges,
                ...item
            },
            saved: false
        }
        this.setState(stateUpdate, callback)
        console.log(item)
    }
    // Try to upload this item's data to the server
    async saveItem() {
        // Check if the new item data is valid
        const newItemData: ItemData = {
            ...DefaultItemData,
            ...this.state.itemData,
            ...this.state.itemChanges
        }
        if (validateItem(newItemData)) {
            // Save item
            if (this.props.route.params.isNew) {
                // Create new item
                await Item.create(newItemData)
                // Signal to previous pages in stack to refresh their data
                DeviceEventEmitter.emit('refreshClosetItemData')
                this.props.navigation.goBack()
            } else {
                const wouldBeItem = {
                    ...this.state.itemData,
                    ...this.state.itemChanges
                }
                let isMissingProp = false
                // Check if item has any missing properties
                for (const key of Object.keys(DefaultItemData) as (keyof ItemData)[]) {
                    if (wouldBeItem[key] === undefined) {
                        isMissingProp = true
                        break
                    }
                }
                // Send only changes if not missing any props, otherwise update all props
                await Item.update(isMissingProp ? newItemData : this.state.itemChanges)
                // Signal to previous pages in stack to refresh their data
                DeviceEventEmitter.emit('refreshClosetItemData')
                this.props.navigation.goBack()
            }
        }
    }
    
    renderImageSelector() {
        return (
            <ImageSliderSelector
                uris={this.state.itemData!.images}
                style={{width: styleValues.winWidth}}
                placeHolderStyle={{
                    borderWidth: styleValues.minorBorderWidth,
                    borderColor: colors.invalid
                }}
                minRatio={1}
                maxRatio={16/9}
                onImagesLoaded={() => {
                    this.setState({imagesLoaded: true})
                }}
                onChange={(uris) => {this.updateItem({images: uris.all})}}
            />
        )
    }

    renderNameInput() {
        return (
            <TextInputBox
                validateFunc={(text) => (text.length > 0)}
                textProps={{
                    placeholder: "Name",
                    defaultValue: this.state.itemChanges.name || this.state.itemData!.name,
                    onChangeText: (text) => {this.updateItem({name: text})},
                }}
            />
        )
    }

    renderPriceInput() {
        if (this.state.itemData) {
            return (
                <CurrencyInputBox
                    validateFunc={(value) => value !== null && value > 0}
                    defaultValue={this.state.itemChanges.minPrice || this.state.itemData.minPrice > 0 ? this.state.itemData.minPrice : undefined}
                    onChangeValue={(value) => {
                        if (value) {
                            this.updateItem({minPrice: value})
                        } else {
                            this.updateItem({minPrice: 0})
                        }
                    }}
                    textProps={{
                        onChangeText: (text) => {this.setState({priceChangeText: text})},
                        placeholder: "Price"
                    }}
                />
            )
        }
    }

    renderSizeInput() {
        return (
            <TextInputBox
                validateFunc={(text) => (text.length > 0)}
                textProps={{
                    placeholder: "Size",
                    defaultValue: capitalizeWords(this.state.itemChanges.size || this.state.itemData!.size),
                    onChangeText: (text) => {this.updateItem({size: text.toLowerCase()})},
                }}
            />
        )
    }

    renderCategoryDropdown() {
        return (
            <TextDropdownAnimated
                items={ItemCategories.map((category) => {
                    return {text: capitalizeWords(category), value: category}
                })}
                showValidSelection={true}
                placeholderText="Category"
                defaultValue={this.state.itemChanges.category || this.state.itemData!.category}
                onSelect={(selections) => {
                    this.updateItem({category: selections[0].value})
                }}
            />
        )
    }

    renderGenderDropdown() {
        return (
            <TextDropdownAnimated
                items={ItemGenders.map((gender) => {
                    let text = gender === 'unisex' ? capitalizeWords(gender) : `${capitalizeWords(gender)}'s`
                    return {text: text, value: gender}
                })}
                showValidSelection={true}
                placeholderText="Gender"
                defaultValue={this.state.itemChanges.gender || this.state.itemData!.gender}
                onSelect={(selections) => {
                    this.updateItem({gender: selections[0].value})
                }}
            />
        )
    }

    renderConditionDropdown() {
        return (
            <TextDropdownAnimated
                items={ItemConditions.map((condition) => ({text: capitalizeWords(condition), value: condition}))}
                showValidSelection={true}
                placeholderText={"Condition"}
                defaultValue={this.state.itemChanges.condition || this.state.itemData!.condition}
                onSelect={(selections) => {
                    this.updateItem({condition: selections[0].value})
                }}
            />
        )
    }

    renderFitDropdown() {
        return (
            <TextDropdownAnimated
                items={ItemFits.map((fit) => {
                    let text = fit === 'proper' ? 'True to size' : capitalizeWords(fit)
                    return {text: text, value: fit}
                })}
                showValidSelection={true}
                placeholderText="Fit"
                defaultValue={this.state.itemChanges.fit || this.state.itemData!.fit}
                onSelect={(selections) => {
                    this.updateItem({fit: selections[0].value})
                }}
            />
        )
    }

    renderStylesInput() {
        return (
            <TagInputBox
                onChange={(tags) => this.updateItem({styles: tags})}
                defaultValue={this.state.itemChanges.styles || this.state.itemData!.styles}
                textProps={{
                    placeholder: "Styles",
                }}
            />
        )
    }

    renderVisibilitySwitch() {
        return (
            <ToggleSwitch
                text={"Hide this item"}
                textStyle={{fontSize: styleValues.smallTextSize}}
                switchProps={{
                    value: this.state.itemChanges.isVisible !== undefined ? !this.state.itemChanges.isVisible : !this.state.itemData!.isVisible
                }}
                onToggle={(value) => {
                    this.updateItem({isVisible: !value})
                }}
            />
        )
    }

    renderUI() {
        if (this.state.itemData) {
            return (
                <>
                <ScrollContainer
                    containerStyle={{marginTop: - styleValues.mediumPadding*2}}
                    avoidKeyboard={true}
                >
                    {this.renderImageSelector()}
                    {this.renderNameInput()}
                    {this.renderPriceInput()}
                    {this.renderSizeInput()}
                    {this.renderCategoryDropdown()}
                    {this.renderGenderDropdown()}
                    {this.renderConditionDropdown()}
                    {this.renderFitDropdown()}
                    {this.renderStylesInput()}
                    {this.renderVisibilitySwitch()}
                </ScrollContainer>
                </>
            )
        }
    }

    renderLoading() {
        if (!this.state.userData || !this.state.imagesLoaded) {
            return (
              <LoadingCover
                size={"large"}
                showError={this.state.errorOccurred}
                errorText={"Could not load item."}
                onErrorRefresh={() => this.refreshData()}
            />
            )
          }
    }

    render() {
        return (
            <PageContainer headerText={"Edit Item"}>
                {this.renderUI()}
                {this.renderLoading()}
                <MenuBar
                    buttonProps={[
                    {
                        iconSource: icons.chevron,
                        buttonFunc: () => {this.props.navigation.goBack()}
                    },
                    {
                        iconSource: icons.checkBox,
                        iconStyle: {tintColor: this.state.itemData && validateItem(this.state.itemData) ? colors.darkGrey : colors.lightestGrey},
                        buttonProps: {disabled: !this.state.itemData || !validateItem(this.state.itemData)},
                        buttonFunc: async () => await this.saveItem(),
                        showLoading: true
                    },
                    ]}
                
                ></MenuBar>
            </PageContainer>
        );
    }
}

const styles = StyleSheet.create({

})