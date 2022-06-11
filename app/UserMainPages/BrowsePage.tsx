import { RouteProp } from "@react-navigation/core";
import { StackNavigationProp } from '@react-navigation/stack';
import React from "react";
import { FlatList, StyleSheet, Text, View } from "react-native";
import CustomComponent from "../CustomComponents/CustomComponent";
import { FilterSearchBar, ItemScrollCard, LoadingCover, MenuBar, PageContainer } from "../HelperFiles/CompIndex";
import { extractKeywords, ItemData, ItemFilter, ItemInfo, UserData } from "../HelperFiles/DataTypes";
import Item from "../HelperFiles/Item";
import { UserMainStackParamList } from "../HelperFiles/Navigation";
import { colors, icons, styleValues, textStyles } from "../HelperFiles/StyleSheet";
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

  flatListComp: FlatList<ItemData> | null = null

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
          /*<FlatList
            style={{
              position: "absolute",
              left: styleValues.mediumPadding,
              right: 0,
              top: 0,
              bottom: 0,
              overflow: "visible"
            }}
            ref={(list) => {this.flatListComp = list}}
            nestedScrollEnabled
            //scrollEnabled={false}
            pointerEvents="box-none"
            contentContainerStyle={{paddingRight: styleValues.mediumPadding}}
            pagingEnabled
            horizontal
            data={this.state.items}
            ItemSeparatorComponent={() => (<View style={{width: styleValues.mediumPadding}}/>)}
            renderItem={(listItem: ListRenderItemInfo<ItemData> | {item: ItemData, index: number}) => (
              <ItemScrollCard
                  itemData={listItem.item}
                  distance={this.state.distances![listItem.index]}
                  isLiked={this.state.userData!.likedItemIDs.includes(listItem.item.itemID)}
                  key={listItem.index.toString()}
                  onPressLike={() => {
                      this.flatListComp?.scrollToIndex({index: listItem.index + 1})
                      this.carouselComp?.snapToNext()
                  }}
                  onUpdateLike={(isLiked) => {
                    const newUserData = this.state.userData!
                    const newLikedItems = newUserData.likedItemIDs
                    // Check if user has liked this item
                    if (isLiked && !newLikedItems.includes(listItem.item.itemID)) {
                      newLikedItems.push(listItem.item.itemID)
                    } else if (!isLiked && newLikedItems.includes(listItem.item.itemID)) {
                      newLikedItems.splice(newLikedItems.indexOf(listItem.item.itemID), 1)
                    }
                    // Update user data
                    newUserData.likedItemIDs = newLikedItems
                    this.setState({userData: newUserData})
                  }}
              />
            )}
            keyExtractor={(_, index) => (index.toString())}
          />*/
          <FlatList
                  data={this.state.itemsInfo}
                  horizontal={true}
                  pagingEnabled={true}
                  renderItem={(listItem) => (
                    <ItemScrollCard
                        itemData={listItem.item.item}
                        distance={listItem.item.distance}
                        isLiked={!!listItem.item.likeTime}
                        key={listItem.index.toString()}
                        onPressLike={() => {
                            //this.carouselComp?.snapToNext()
                        }}
                        onUpdateLike={(isLiked) => {
                          console.log("liked item. *Need to implement this function")
                        }}
                    />
                )}
          />
          /*<Carousel
              ref={(carousel) => {this.carouselComp = carousel}}
              data={this.state.items}
              containerCustomStyle={{
                paddingVertical: styleValues.mediumPadding
              }}
              nestedScrollEnabled={true}
              scrollEnabled={false}
              //scrollEnabled={false}
              renderItem={(listItem: ListRenderItemInfo<ItemData> | {item: ItemData, index: number}) => (
                    <ItemScrollCard
                        itemData={listItem.item}
                        distance={this.state.distances![listItem.index]}
                        key={listItem.index.toString()}
                        onPressLike={() => {
                            this.carouselComp?.snapToNext()
                        }}
                        onUpdateLike={(isLiked) => {
                          const newUserData = this.state.userData!
                          const newLikedItems = newUserData.likedItemIDs
                          // Check if user has liked this item
                          if (isLiked && !newLikedItems.includes(listItem.item.itemID)) {
                            newLikedItems.push(listItem.item.itemID)
                          } else if (!isLiked && newLikedItems.includes(listItem.item.itemID)) {
                            newLikedItems.splice(newLikedItems.indexOf(listItem.item.itemID), 1)
                          }
                          // Update user data
                          newUserData.likedItemIDs = newLikedItems
                          this.setState({userData: newUserData})
                        }}
                    />
                )
              }
              onSnapToItem={(index) => {
                // Update item views every time they are passed
                if (index > 0) {
                  const itemID = this.state.items![index - 1].itemID
                  if (!this.state.unupdatedViews.includes(itemID)) {
                    this.setState({unupdatedViews: this.state.unupdatedViews.concat([itemID])})
                  }
                }
              }}
              itemWidth={styleValues.winWidth - 2*styleValues.mediumPadding}
              sliderWidth={styleValues.winWidth}
            />*/
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
              errorText={`Could not find items.`}
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
              <MenuBar
                buttonProps={[
                  {
                    iconSource: icons.search,
                    buttonFunc: () => this.props.navigation.navigate("search")
                  },
                  {
                    iconSource: icons.shoppingBag,
                    iconStyle: {tintColor: colors.main},
                  },
                  {
                    iconSource: icons.closet,
                    buttonFunc: () => this.props.navigation.navigate("closet")
                  },
                  {
                    iconSource: icons.profile,
                    buttonFunc: () => this.props.navigation.navigate("account")
                  },
                ]}
              
              />
            </PageContainer>
        );
      } catch (e) {
        this.setState({errorDidOccur: true})
      }
    }
}

const styles = StyleSheet.create({

})