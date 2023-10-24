import { RouteProp } from "@react-navigation/core";
import { StackNavigationProp } from '@react-navigation/stack';
import React from "react";
import { DeviceEventEmitter, StyleSheet } from "react-native";
import CustomComponent from "../CustomComponents/CustomComponent";
import { capitalizeWords } from "../HelperFiles/ClientFunctions";
import { CustomCurrencyInput, ImageSliderSelector, LoadingCover, BloisMenuBar, PageContainer, ScrollContainer, TagInputBox, TextDropdownAnimated, BloisTextInput, ToggleSwitch, CustomScrollView, ColorDropdown } from "../HelperFiles/CompIndex";
import { DefaultItemData, DeliveryMethods, ItemCategories, ItemConditions, ItemData, ItemFits, ItemGenders, ItemPriceData, UserData } from "../HelperFiles/DataTypes";
import Item from "../HelperFiles/Item";
import { ClosetStackParamList } from "../HelperFiles/Navigation";
import { colors, icons, screenWidth, styleValues } from "../HelperFiles/StyleSheet";
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
    // Signals that all inouts should check their validity
    validityFlag: boolean,
    isLoading: boolean,
    errorMessage?: string
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
            validityFlag: false,
            isLoading: true,
            errorMessage: undefined
        }
    }

    async refreshData() {
        this.setState({isLoading: true, errorMessage: undefined})
        try {
            const userData = await User.get()
            // Check if this is a new item or existing item
            const itemData = this.props.route.params.isNew
                ? {...DefaultItemData,
                    userID: userData.userID,
                    country: userData.country,
                    region: userData.region,
                    styles: [],
                    colors: []
                }
                : (await Item.getFromIDs([this.props.route.params.itemID]))[0].item
            this.setState({
                userData: userData,
                itemData: itemData,
                itemChanges: {
                    ...this.state.itemChanges,
                    itemID: itemData.itemID
                },
                priceChangeText: itemData.priceData.minPrice >= 0 ? itemData.priceData.minPrice.toString() : "",
            })
        } catch (e) {
            this.handleError(e)
        }
        this.setState({isLoading: false})
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
        //console.log(item)
    }
    // Try to upload this item's data to the server
    async saveItem(newItemData: ItemData) {
        this.setState({isLoading: true, errorMessage: undefined})
        try {
            // Save item
            if (this.props.route.params.isNew) {
                // Create new item
                await Item.create(newItemData)
                // Signal to previous pages in stack to refresh their data
                this.props.navigation.goBack()
            } else {
                // Send only changes if not missing any props, otherwise update all props
                await Item.update(this.state.itemChanges)
                // Signal to previous pages in stack to refresh their data
                this.props.navigation.goBack()
            }
        } catch (e) {
            this.handleError(e)
        }
        this.setState({isLoading: false})
    }
    
    renderImageSelector() {
        return (
            <ImageSliderSelector
                uris={this.state.itemData!.images}
                style={{width: screenWidth, marginLeft: -styleValues.mediumPadding}}
                minRatio={1}
                maxRatio={16/9}
                showValidSelection={true}
                ignoreInitialValidity={!this.state.validityFlag}
                maxNum={Item.maxNumImages}
                onImagesLoaded={() => {
                    this.setState({imagesLoaded: true})
                }}
                onChange={(uris) => {this.updateItem({images: uris.all})}}
            />
        )
    }

    renderNameInput() {
        return (
            <BloisTextInput
                checkValidity={(text) => Item.validateProperty('name', text)}
                indicatorType={'shadowSmall'}
                placeholder={"Name"}
                maxLength={Item.maxNameLength}
                defaultValue={this.state.itemChanges.name || this.state.itemData!.name}
                ignoreInitialValidity={!this.state.validityFlag}
                onChangeText={(text) => {this.updateItem({name: text})}}
            />
        )
    }

    renderPriceInput() {
        if (this.state.itemData) {
            return (
                <CustomCurrencyInput
                    checkValidity={() => {
                        let change = true
                        if (this.state.itemChanges.priceData) {
                            change = Item.validatePriceData(this.state.itemChanges.priceData)
                        }
                        return this.state.itemData?.priceData !== undefined
                            && Item.validatePriceData(this.state.itemData.priceData)
                            && change
                    }}
                    minValue={0}
                    maxValue={90000}
                    indicatorType={'shadowSmall'}
                    placeholder={"Minimum price"}
                    defaultValue={this.state.itemChanges.priceData?.minPrice || this.state.itemData.priceData?.minPrice > 0 ? this.state.itemData.priceData?.minPrice : undefined}
                    ignoreInitialValidity={!this.state.validityFlag}
                    onChangeValue={(value) => {
                        if (value) {
                            this.updateItem({priceData: {...DefaultItemData.priceData, ...this.state.itemData?.priceData, minPrice: value}})
                        } else {
                            this.updateItem({priceData: {...DefaultItemData.priceData, ...this.state.itemData?.priceData, minPrice: 0}})
                        }
                    }}
                />
            )
        }
    }

    renderSizeInput() {
        return (
            <BloisTextInput
                checkValidity={(text) => Item.validateProperty('size', text)}
                indicatorType={'shadowSmall'}
                placeholder={"Size"}
                maxLength={Item.maxSizeLength}
                defaultValue={capitalizeWords(this.state.itemChanges.size || this.state.itemData!.size)}
                ignoreInitialValidity={!this.state.validityFlag}
                onChangeText={(text) => {this.updateItem({size: text.toLowerCase()})}}
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
                indicatorType={'shadowSmall'}
                ignoreInitialValidity={!this.state.validityFlag}
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
                indicatorType={'shadowSmall'}
                ignoreInitialValidity={!this.state.validityFlag}
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
                indicatorType={'shadowSmall'}
                ignoreInitialValidity={!this.state.validityFlag}
                placeholderText={"Condition"}
                defaultValue={this.state.itemChanges.condition || this.state.itemData!.condition}
                onSelect={(selections) => {
                    this.updateItem({condition: selections[0].value})
                }}
            />
        )
    }

    renderColorDropdown() {
        return (
            <ColorDropdown
                showValidSelection={true}
                indicatorType={'shadowSmall'}
                ignoreInitialValidity={!this.state.validityFlag}
                defaultValues={this.state.itemChanges.colors || this.state.itemData!.colors}
                onSelect={(selections) => {
                    this.updateItem({colors: selections})
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
                indicatorType={'shadowSmall'}
                ignoreInitialValidity={!this.state.validityFlag}
                placeholderText="Fit"
                defaultValue={this.state.itemChanges.fit || this.state.itemData!.fit}
                onSelect={(selections) => {
                    this.updateItem({fit: selections[0].value})
                }}
            />
        )
    }

    renderDeliveryDropdown() {
        return (
            <TextDropdownAnimated
                items={DeliveryMethods.map((method) => {
                    let text = capitalizeWords(method)
                    return {text: text, value: method}
                })}
                showValidSelection={true}
                enableMultiple={true}
                indicatorType={'shadowSmall'}
                ignoreInitialValidity={!this.state.validityFlag}
                placeholderText="Delivery Methods"
                defaultValue={this.state.itemChanges.deliveryMethods || this.state.itemData!.deliveryMethods}
                onSelect={(selections) => {
                    this.updateItem({deliveryMethods: selections.map((sel) => sel.value)})
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
                text={"Publicly visible"}
                textStyle={{fontSize: styleValues.smallTextSize}}
                switchProps={{
                    value: this.state.itemChanges.isVisible !== undefined ? this.state.itemChanges.isVisible : this.state.itemData!.isVisible
                }}
                onToggle={(value) => {
                    this.updateItem({isVisible: value})
                }}
            />
        )
    }

    renderUI() {
        if (this.state.itemData) {
            return (
                <>
                <CustomScrollView
                    style={{
                        marginTop: - styleValues.mediumPadding,
                    }}
                    contentContainerStyle={{
                        marginBottom: styleValues.mediumHeight*2
                    }}
                    avoidKeyboard={true}
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
                    {this.renderDeliveryDropdown()}
                    {this.renderStylesInput()}
                    {this.renderVisibilitySwitch()}
                </CustomScrollView>
                </>
            )
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
            )
          }
    }

    render() {
        try {
            const currentItemData = {
                ...DefaultItemData,
                ...this.state.itemData,
                ...this.state.itemChanges
            }
            return (
                <PageContainer headerText={"Edit Item"}>
                    {this.renderUI()}
                    {this.renderLoading()}
                    <BloisMenuBar
                        buttonProps={[
                        {
                            iconSource: icons.chevron,
                            onPress: () => {this.props.navigation.goBack()}
                        },
                        {
                            iconSource: icons.checkBox,
                            iconStyle: {tintColor: this.state.itemData && Item.validate(currentItemData) ? colors.darkGrey : colors.lightestGrey},
                            onPress: async () => {
                                if (this.state.itemData && Item.validate(currentItemData)) {
                                    await this.saveItem(currentItemData)
                                } else {
                                    this.setState({validityFlag: true});
                                }
                            },
                            showLoading: true
                        },
                        ]}
                    
                    ></BloisMenuBar>
                </PageContainer>
            );
        } catch (e) {
            this.handleError(e)
        }
    }
}

const styles = StyleSheet.create({

})