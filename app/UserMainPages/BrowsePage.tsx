import { RouteProp } from "@react-navigation/core";
import { StackNavigationProp } from "@react-navigation/stack";
import React, { useRef } from "react";
import {
    AppState,
    FlatList,
    Pressable,
    StyleSheet,
    Text,
    View,
    ViewToken,
    ViewabilityConfigCallbackPairs,
} from "react-native";
import CustomComponent from "../CustomComponents/CustomComponent";
import {
    CustomImageButton,
    FilterSearchBar,
    ItemLargeCard,
    LoadingCover,
    BloisMenuBar,
    BloisPage,
} from "../HelperFiles/CompIndex";
import {
  DefaultItemFilter,
    extractKeywords,
    ItemData,
    ItemFilter,
    ItemInfo,
    UserData,
} from "../HelperFiles/DataTypes";
import Item from "../HelperFiles/Item";
import { UserMainStackParamList } from "../HelperFiles/Navigation";
import {
    bottomInset,
    colors,
    icons,
    screenWidth,
    styVals,
    textStyles,
} from "../HelperFiles/StyleSheet";
import User from "../HelperFiles/User";
import AppUtils from "../HelperFiles/AppUtils";
import BloisIconButton from "../BloisComponents/BloisIconButton";
import ItemSearchBar from "../CustomComponents/ItemSearchBar";

type BrowseNavigationProp = StackNavigationProp<
    UserMainStackParamList,
    "browse"
>;

type BrowseRouteProp = RouteProp<UserMainStackParamList, "browse">;

type BrowseProps = {
    navigation: BrowseNavigationProp;
    route: BrowseRouteProp;
};

type State = {
    itemInfos?: ItemInfo[];
    userData?: UserData;
    searchFilters: ItemFilter;
    isLoading: boolean;
    errorMessage?: string;
};

//const AnimatedFilterScrollBar = Animated.createAnimatedComponent(FilterScrollBar);

export default class BrowsePage extends CustomComponent<BrowseProps, State> {
    flatListComp: FlatList<ItemInfo> | null = null;
    viewabilityConfigCallbackPairs: ViewabilityConfigCallbackPairs = [
        {
            viewabilityConfig: {
                itemVisiblePercentThreshold: 100,
                minimumViewTime: 500,
            },
            onViewableItemsChanged: (info) => {
                // Flag this item as being viewed, add it to views list
                for (const token of info.viewableItems) {
                    token.item.viewTime = Date.now();
                    this.viewTimes[token.item.item.itemID] =
                        token.item.viewTime;
                }
            },
        },
    ];
    viewTimes: { [itemID: string]: number };

    constructor(props: BrowseProps) {
        super(props);
        this.state = {
            itemInfos: undefined,
            userData: undefined,
            searchFilters: DefaultItemFilter,
            isLoading: true,
            errorMessage: undefined,
        };
        this.viewTimes = {};
        // Send updated view times to server when page is switched
        this.props.navigation.addListener("state", (e) => {
            if (Object.keys(this.viewTimes).length > 0) {
                Item.updateItemViewTimes(this.viewTimes);
                this.viewTimes = {};
            }
        });
        // Send updated view times to server when app is suspended / closed
        AppState.addEventListener("change", (state) => {
            if (state !== "active") {
                if (Object.keys(this.viewTimes).length > 0) {
                    Item.updateItemViewTimes(this.viewTimes);
                    this.viewTimes = {};
                }
            }
        });
    }

    async refreshData() {
        try {
            this.setState({ isLoading: true, errorMessage: undefined });
            const [userData, results] = await Promise.all([
                User.get(),
                Item.getFromFilter(this.state.searchFilters),
            ]);
            this.setState({ userData: userData, itemInfos: results });
        } catch (e) {
            this.handleError(e);
        }
        this.setState({ isLoading: false });
    }

    // Render a swipable carousel of items
    renderCarousel() {
        // Check if items list is empty
        if (this.state.itemInfos && this.state.userData) {
            if (this.state.itemInfos.length <= 0) {
                return (
                    <View
                        style={{
                            height: "100%",
                            width: "100%",
                            alignItems: "center",
                            justifyContent: "center",
                        }}
                    >
                        <Text
                            style={{
                                ...textStyles.mediumHeader,
                                color: colors.grey,
                            }}
                        >
                            No items were found. Try changing your search filters.
                        </Text>
                        <BloisIconButton
                            icon={{
                                type: "Ionicons",
                                name: "refresh",
                            }}
                            style={{ width: styVals.iconMediumSize }}
                            animType={'opacity'}
                            iconStyle={{ color: colors.lightGrey }}
                            onPress={() => this.refreshData()}
                        />
                    </View>
                );
            }
            return (
                <FlatList
                    ref={(flatList) => {
                        this.flatListComp = flatList;
                    }}
                    data={this.state.itemInfos}
                    style={{
                        width: screenWidth,
                    }}
                    contentContainerStyle={{
                        paddingVertical: styVals.mediumPadding,
                    }}
                    horizontal={true}
                    pagingEnabled={true}
                    showsHorizontalScrollIndicator={true}
                    //onViewableItemsChanged={(info) => this.onViewableItemsChanged(info)}
                    viewabilityConfigCallbackPairs={
                        this.viewabilityConfigCallbackPairs
                    }
                    renderItem={(listItem) => (
                        <Pressable
                            style={{
                                width: screenWidth,
                                paddingHorizontal: styVals.mediumPadding,
                            }}
                        >
                            <ItemLargeCard
                                itemInfo={listItem.item}
                                key={listItem.index.toString()}
                                onPressLike={() => {}}
                                navigation={this.props.navigation}
                            />
                        </Pressable>
                    )}
                />
            );
        }
    }
    // Render a loading indicator and, if need be, an error handler
    renderLoading() {
        if (
            this.state.isLoading ||
            this.state.errorMessage ||
            !this.state.itemInfos ||
            !this.state.userData
        ) {
            return (
                <LoadingCover
                    size={"large"}
                    errorText={this.state.errorMessage}
                    onErrorRefresh={() =>
                        this.setState({ errorMessage: undefined }, () => {
                            this.refreshData();
                        })
                    }
                />
            );
        }
    }

    render() {
        try {
            return (
                <BloisPage
                  style={{
                    paddingBottom: bottomInset + styVals.mediumHeight + styVals.mediumPadding
                  }}
                >
                    {this.renderCarousel()}
                    <ItemSearchBar
                        initialFilter={this.state.searchFilters}
                        onFilterSubmit={(filter) => {
                            this.setState({searchFilters: filter}, () => this.refreshData())
                        }}
                    />
                    {this.renderLoading()}
                </BloisPage>
            );
        } catch (e) {
            this.handleError(e);
        }
    }
}

const styles = StyleSheet.create({});
