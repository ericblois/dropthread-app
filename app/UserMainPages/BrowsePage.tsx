import { RouteProp } from "@react-navigation/core";
import { StackNavigationProp } from '@react-navigation/stack';
import React from "react";
import { FlatList, Pressable, StyleSheet, Text, View } from "react-native";
import CustomComponent from "../CustomComponents/CustomComponent";
import { FilterSearchBar, ItemLargeCard, LoadingCover, MenuBar, PageContainer } from "../HelperFiles/CompIndex";
import { extractKeywords, ItemData, ItemFilter, ItemInfo, UserData } from "../HelperFiles/DataTypes";
import Item from "../HelperFiles/Item";
import { UserMainStackParamList } from "../HelperFiles/Navigation";
import { bottomInset, colors, icons, screenWidth, styleValues, textStyles } from "../HelperFiles/StyleSheet";
import User from "../HelperFiles/User";

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
  errorDidOccur: boolean
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
          errorDidOccur: false
        }
    }

    componentDidMount() {
      this.getUserData()
      this.refreshSearchResults()
      super.componentDidMount()
    }

    componentWillUnmount(): void {
        super.componentWillUnmount()
    }
    // Retrieve this user's data
    async getUserData() {
      try {
        const userData = await User.get()
        this.setState({userData: userData})
      } catch (e) {
        this.setState({errorDidOccur: true})
      }
    }
    // Attempt to retrieve items that fit current filter
    async refreshSearchResults() {
      try {
        // Set carousel to first item
        //this.carouselComp?.snapToItem(0)
        this.setState({itemsInfo: undefined})
        const results = await Item.getFromFilter(this.state.searchFilters)
        this.setState({itemsInfo: results})
      } catch (e) {
        console.error(e)
        this.setState({errorDidOccur: true})
      }
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
              <Text style={{...textStyles.small, color: colors.grey}}>No items were found.</Text>
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
              showError={this.state.errorDidOccur}
              errorText={`An error occurred.`}
              onErrorRefresh={() => this.setState({errorDidOccur: false}, () => {
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
        this.setState({errorDidOccur: true})
      }
    }
}

const styles = StyleSheet.create({

})