import { RouteProp } from "@react-navigation/core";
import { CompositeNavigationProp } from "@react-navigation/native";
import { StackNavigationProp } from '@react-navigation/stack';
import React from "react";
import { DeviceEventEmitter, StyleSheet, Text, View } from "react-native";
import CustomComponent from "../CustomComponents/CustomComponent";
import { capitalizeWords } from "../HelperFiles/ClientFunctions";
import { ImageSlider, LoadingCover, MenuBar, PageContainer, ScrollContainer, TextButton } from "../HelperFiles/CompIndex";
import { currencyFormatter } from "../HelperFiles/Constants";
import { ItemData } from "../HelperFiles/DataTypes";
import Item from "../HelperFiles/Item";
import { ClosetStackParamList, UserMainStackParamList } from "../HelperFiles/Navigation";
import { colors, icons, styleValues, textStyles } from "../HelperFiles/StyleSheet";

type ItemInfoNavigationProp = CompositeNavigationProp<
    StackNavigationProp<ClosetStackParamList, "itemInfo">,
    StackNavigationProp<UserMainStackParamList>
>

type ItemInfoRouteProp = RouteProp<ClosetStackParamList, "itemInfo">;

type ItemInfoProps = {
    navigation: ItemInfoNavigationProp,
    route: ItemInfoRouteProp
}

type State = {
    itemData?: ItemData,
    distance?: number,
    imagesLoaded: boolean,
    ratiosLoaded: boolean,
    errorOccurred: boolean
}

export default class ClosetItemInfoPage extends CustomComponent<ItemInfoProps, State> {

    constructor(props: ItemInfoProps) {
        super(props)
        const initialState: State = {
            itemData: undefined,
            distance: undefined,
            imagesLoaded: false,
            ratiosLoaded: false,
            errorOccurred: false
        }
        this.state = initialState
        DeviceEventEmitter.addListener('refreshClosetItemData', () => {
            this.setState(initialState, () => {
                this.refreshData()
            })
        })
    }

    async refreshData() {
        try {
            this.setState({errorOccurred: false})
            // Get data
            const itemInfo = (await Item.getFromIDs([this.props.route.params.itemID], true))[0]
            this.setState({
                itemData: itemInfo.item,
                distance: itemInfo.distance,
                imagesLoaded: itemInfo.item.images.length === 0,
                ratiosLoaded: itemInfo.item.images.length === 0
            })
        } catch {
            this.setState({errorOccurred: true})
        }
    }

    renderInfo() {
        if (this.state.itemData) {
            return (
                <View
                    style={{
                        width: "100%",
                        flexDirection: "row"
                    }}
                >
                    <View style={{flex: 1}}>
                        <Text
                            style={{...textStyles.larger, textAlign: "left"}}
                            numberOfLines={4}
                        >{this.state.itemData.name}</Text>
                        <Text style={{...textStyles.large, textAlign: "left", color: colors.grey}}>{capitalizeWords(this.state.itemData.category)}</Text>
                    </View>
                    <View style={{alignItems: "flex-end", marginLeft: styleValues.mediumPadding}}>
                        <Text style={{...textStyles.larger, textAlign: "right"}}>{currencyFormatter.format(this.state.itemData.minPrice)}</Text>
                        {this.state.distance && this.state.distance > 0 ? 
                            <Text style={{...textStyles.large, textAlign: "right", color: colors.grey}}>{`${this.state.distance}km`}</Text>
                        : undefined}
                    </View>
                </View>
            )
        }
    }

    renderUI() {
        if (this.state.itemData) {
            return (
                <>
                {this.renderInfo()}
                <ScrollContainer>
                    <ImageSlider
                        uris={this.state.itemData.images}
                        style={{width: styleValues.winWidth}}
                        minRatio={1}
                        maxRatio={2}
                        onImagesLoaded={() => {
                            this.setState({imagesLoaded: true})
                        }}
                        onRatiosLoaded={() => {
                            this.setState({ratiosLoaded: true})
                        }}
                    ></ImageSlider>
                    <Text style={{...textStyles.medium, alignSelf: "flex-start"}}>{"Views: ".concat(this.state.itemData.viewCount.toString())}</Text>
                    <Text style={{...textStyles.mediumHeader, alignSelf: "flex-start"}}>{"Likes: ".concat(this.state.itemData.likeCount.toString())}</Text>
                    <TextButton
                        text={"View matches"}
                        rightIconSource={icons.chevron}
                        rightIconStyle={{transform: [{scaleX: -1}]}}
                        buttonFunc={() => {this.props.navigation.navigate("itemSwaps", {likedUserIDs: ["B9m6149WWAZoaVOpomSgcy2riyD3"]})}}
                    />
                    <TextButton
                        text={"Update location"}
                        rightIconSource={icons.crosshair}
                        buttonFunc={() => {}}
                    />
                    <TextButton
                        text={"Delete item"}
                        textStyle={{color: colors.invalid}}
                        showLoading={true}
                        buttonFunc={async () => {await Item.delete(this.state.itemData!)}}
                    />
                </ScrollContainer>
                </>
            )
        }
    }

    renderLoading() {
        if (!this.state.ratiosLoaded || !this.state.imagesLoaded) {
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
        <PageContainer>
            {this.renderUI()}
            {this.renderLoading()}
            <MenuBar
                buttonProps={[
                    {
                        iconSource: icons.chevron,
                        buttonFunc: () => this.props.navigation.goBack()
                    },
                    {
                        iconSource: icons.edit,
                        iconStyle: {
                            tintColor: this.state.itemData === undefined ? colors.lighterGrey : colors.darkGrey
                        },
                        buttonProps: {
                            disabled: this.state.itemData === undefined
                        },
                        buttonFunc: () => this.props.navigation.navigate("editItem", {
                            itemID: this.state.itemData!.itemID,
                            isNew: false
                        })
                    },
                ]}
            
            ></MenuBar>
        </PageContainer>
    );
    }
}

const styles = StyleSheet.create({

})