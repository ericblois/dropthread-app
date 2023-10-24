import { RouteProp } from "@react-navigation/core";
import { StackNavigationProp } from '@react-navigation/stack';
import React, { useRef } from "react";
import { AppState, FlatList, Pressable, StyleSheet, Text, View, ViewToken, ViewabilityConfigCallbackPairs } from "react-native";
import CustomComponent from "../CustomComponents/CustomComponent";
import { CustomImageButton, FilterSearchBar, ItemLargeCard, LoadingCover, BloisMenuBar, PageContainer } from "../HelperFiles/CompIndex";
import { extractKeywords, ItemData, ItemFilter, ItemInfo, UserData } from "../HelperFiles/DataTypes";
import Item from "../HelperFiles/Item";
import { UserMainStackParamList } from "../HelperFiles/Navigation";
import { bottomInset, colors, icons, screenWidth, styleValues, textStyles } from "../HelperFiles/StyleSheet";
import User from "../HelperFiles/User";
import AppUtils from "../HelperFiles/AppUtils";

type BrowseNavigationProp = StackNavigationProp<UserMainStackParamList, "browse">;

type BrowseRouteProp = RouteProp<UserMainStackParamList, "browse">;

type BrowseProps = {
    navigation: BrowseNavigationProp,
    route: BrowseRouteProp
}

type State = {
  itemInfos?: ItemInfo[],
  userData?: UserData,
  searchFilters: ItemFilter,
  shouldRefresh: boolean,
  isLoading: boolean,
  errorMessage?: string
}

//const AnimatedFilterScrollBar = Animated.createAnimatedComponent(FilterScrollBar);

export default class BrowsePage extends CustomComponent<BrowseProps, State> {

    flatListComp: FlatList<ItemInfo> | null = null
    viewabilityConfigCallbackPairs: ViewabilityConfigCallbackPairs = [{
      viewabilityConfig: {
        itemVisiblePercentThreshold: 100,
        minimumViewTime: 500
      },
      onViewableItemsChanged: (info) => {
        // Flag this item as being viewed, add it to views list
        for (const token of info.viewableItems) {
          token.item.viewTime = Date.now();
          this.viewTimes[token.item.item.itemID] = token.item.viewTime;
        }
      }
    }];
    viewTimes: {[itemID: string]: number};

    constructor(props: BrowseProps) {
        super(props)
        this.state = {
          itemInfos: undefined,
          userData: undefined,
          searchFilters: {
              country: "canada",
              distanceInKM: 10
          },
          shouldRefresh: false,
          isLoading: true,
          errorMessage: undefined
        }
        this.viewTimes = {};
        // Send updated view times to server when page is switched
        this.props.navigation.addListener('state', (e) => {
          if (Object.keys(this.viewTimes).length > 0) {
            Item.updateItemViewTimes(this.viewTimes);
            this.viewTimes = {}
          }
        })
        // Send updated view times to server when app is suspened / closed
        AppState.addEventListener('change', (state) => {
          if (state !== 'active') {
            if (Object.keys(this.viewTimes).length > 0) {
              Item.updateItemViewTimes(this.viewTimes);
              this.viewTimes = {}
            }
          }
        })
    }

    componentWillUnmount(): void {
        console.log('unmounted')
        super.componentWillUnmount()
    }

    async refreshData() {
      try {
        this.setState({isLoading: true, errorMessage: undefined})
        const [userData, results] = await Promise.all([
          User.get(),
          Item.getFromFilter(this.state.searchFilters)
        ])
        this.setState({userData: userData, itemInfos: results})
      } catch(e) {
        this.handleError(e)
      }
      this.setState({isLoading: false})
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
                justifyContent: "center"
              }}
            >
              <Text style={{...textStyles.smallHeader, color: colors.grey}}>No items were found.</Text>
              <CustomImageButton
                iconSource={icons.refresh}
                buttonStyle={{
                    height: styleValues.iconMediumSize,
                    width: styleValues.iconMediumSize
                }}
                iconStyle={{tintColor: colors.lightGrey}}
                onPress={() => this.refreshData()}
              />
            </View>
          )
        }
        return (
          <FlatList
            ref={(flatList) => {this.flatListComp = flatList}}
            data={this.state.itemInfos}
            style={{
              width: screenWidth
            }}
            contentContainerStyle={{
              paddingVertical: styleValues.mediumPadding
            }}
            horizontal={true}
            pagingEnabled={true}
            showsHorizontalScrollIndicator={true}
            //onViewableItemsChanged={(info) => this.onViewableItemsChanged(info)}
            viewabilityConfigCallbackPairs={this.viewabilityConfigCallbackPairs}
            renderItem={(listItem) => (
              <Pressable
                style={{
                    width: screenWidth,
                    paddingHorizontal: styleValues.mediumPadding,
                }}
              >
                <ItemLargeCard
                    itemInfo={listItem.item}
                    key={listItem.index.toString()}
                    onPressLike={() => {
                        
                    }}
                    navigation={this.props.navigation}
                />
              </Pressable>
            )}
          />
        )
      }
    }
    // Render a loading indicator and, if need be, an error handler
    renderLoading() {
      if (
        this.state.isLoading
        || this.state.errorMessage
        || !this.state.itemInfos
        || !this.state.userData) {
          return (
            <LoadingCover
              style={{top: styleValues.mediumPadding}}
              size={"large"}
              
              errorText={this.state.errorMessage}
              onErrorRefresh={() => this.setState({errorMessage: undefined}, () => {
                this.refreshData()
              })}
            />
          )
        }
    }

    render() {
      try {
        return (
            <PageContainer>
              <FilterSearchBar
                initialFilter={this.state.searchFilters}
                contentContainerStyle={{bottom: bottomInset + styleValues.mediumHeight + styleValues.mediumPadding*2}}
                onSearchSubmit={(text) => {
                  // Check if no keywords are given
                  if (text == "" && this.state.searchFilters.keywords === undefined) {
                    return
                  }
                  const keywords = extractKeywords(text)
                  keywords.sort()
                  // Check if new keywords and current keywords are the same
                  if (keywords.length === this.state.searchFilters.keywords?.length) {
                    let isEqual = true
                    for (let i = 0; i < keywords.length; i++) {
                      if (keywords[i] != this.state.searchFilters.keywords![i]) {
                        isEqual = false
                        break
                      }
                    }
                    if (isEqual) {
                      return
                    }
                  }
                  const newSearchFilter = {
                      ...this.state.searchFilters,
                      keywords: keywords
                  } as ItemFilter
                  // Delete keywords field if empty
                  if (text == "" || keywords.length === 0) {
                    delete newSearchFilter.keywords
                  }
                  this.setState({searchFilters: newSearchFilter}, () => {
                      this.refreshData()
                  })
                }}
                onFilterChange={(newFilter) => {
                    this.setState({searchFilters: newFilter, shouldRefresh: true})
                }}
                onFilterSubmit={() => {
                  if (this.state.shouldRefresh) {
                    this.refreshData()
                    this.setState({shouldRefresh: false})
                  }
                }}
              >
                {this.renderCarousel()}
                {this.renderLoading()}
              </FilterSearchBar>
            </PageContainer>
        );
      } catch (e) {
        this.handleError(e)
      }
    }
}

const styles = StyleSheet.create({

})