import { RouteProp } from "@react-navigation/core";
import { StackNavigationProp } from '@react-navigation/stack';
import React from "react";
import { FlatList, Pressable, StyleSheet, Text, View } from "react-native";
import CustomComponent from "../CustomComponents/CustomComponent";
import { CustomImageButton, FilterSearchBar, ItemLargeCard, LoadingCover, MenuBar, PageContainer } from "../HelperFiles/CompIndex";
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
  itemsInfo?: ItemInfo[],
  userData?: UserData,
  searchFilters: ItemFilter,
  shouldRefresh: boolean,
  unupdatedViews: string[],
  errorMessage?: string
}

//const AnimatedFilterScrollBar = Animated.createAnimatedComponent(FilterScrollBar);

export default class BrowsePage extends CustomComponent<BrowseProps, State> {

  flatListComp: FlatList<ItemInfo> | null = null

    constructor(props: BrowseProps) {
        super(props)
        this.state = {
          itemsInfo: undefined,
          userData: undefined,
          searchFilters: {
              country: "canada",
              distanceInKM: 10
          },
          shouldRefresh: false,
          unupdatedViews: [],
          errorMessage: undefined
        }
    }

    componentDidMount() {
      this.getUserData();
      this.refreshSearchResults()
      super.componentDidMount()
    }

    componentWillUnmount(): void {
        super.componentWillUnmount()
    }
    
    // Retrieve this user's data
    async getUserData() {
      const userData = await User.get().catch((e) => this.handleError(e))
      this.setState({userData: userData});
    }
    // Attempt to retrieve items that fit current filter
    async refreshSearchResults() {
      // Set carousel to first item
      //this.carouselComp?.snapToItem(0)
      this.setState({itemsInfo: undefined})
      const results = await Item.getFromFilter(this.state.searchFilters).catch((e) => this.handleError(e))
      this.setState({itemsInfo: results})
    }
    // Render a swipable carousel of items
    renderCarousel() {
      // Check if items list is empty
      if (this.state.itemsInfo && this.state.userData) {
        if (this.state.itemsInfo.length <= 0) {
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
                onPress={() => {
                  this.getUserData();
                  this.refreshSearchResults();
                }}
              />
            </View>
          )
        }
        return (
          <FlatList
            ref={(flatList) => {this.flatListComp = flatList}}
            data={this.state.itemsInfo}
            style={{
              width: screenWidth
            }}
            contentContainerStyle={{
              paddingVertical: styleValues.mediumPadding
            }}
            horizontal={true}
            pagingEnabled={true}
            showsHorizontalScrollIndicator={true}
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
      if (!this.state.itemsInfo || !this.state.userData) {
          return (
            <LoadingCover
              style={{top: styleValues.mediumPadding}}
              size={"large"}
              showError={this.state.errorMessage !== undefined}
              errorText={this.state.errorMessage}
              onErrorRefresh={() => this.setState({errorMessage: undefined}, () => {
                this.getUserData()
                this.refreshSearchResults()
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
                      this.refreshSearchResults()
                  })
                }}
                onFilterChange={(newFilter) => {
                    this.setState({searchFilters: newFilter, shouldRefresh: true})
                }}
                onFilterSubmit={() => {
                  if (this.state.shouldRefresh) {
                    this.refreshSearchResults()
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