import { RouteProp } from "@react-navigation/core";
import { StackNavigationProp } from '@react-navigation/stack';
import React from "react";
import { StyleSheet } from "react-native";
import CustomComponent from "../CustomComponents/CustomComponent";
import { FilterScrollBar, MenuBar, PageContainer, SearchBar, SearchResultItem } from "../HelperFiles/CompIndex";
import { extractKeywords, ItemData, ItemFilter, UserData } from "../HelperFiles/DataTypes";
import Item from "../HelperFiles/Item";
import { UserMainStackParamList } from "../HelperFiles/Navigation";
import { colors, icons, styleValues, topInset } from "../HelperFiles/StyleSheet";
import User from "../HelperFiles/User";

type SearchNavigationProp = StackNavigationProp<UserMainStackParamList, "search">;

type SearchRouteProp = RouteProp<UserMainStackParamList, "search">;

type SearchProps = {
    navigation: SearchNavigationProp,
    route: SearchRouteProp
}

type State = {
  items?: ItemData[],
  distances?: number[],
  userData?: UserData,
  searchFilter: ItemFilter,
  unupdatedViews: string[]
}

export default class SearchPage extends CustomComponent<SearchProps, State> {

    constructor(props: SearchProps) {
        super(props)
        this.state = {
          items: undefined,
          distances: undefined,
          userData: undefined,
          searchFilter: {
              country: "canada",
              distanceInKM: 5
          },
          unupdatedViews: []
        }
    }

    componentDidMount() {
      this.getUserData()
      super.componentDidMount()
    }

    componentWillUnmount(): void {
        super.componentWillUnmount()
    }

    async getUserData() {
      const userData = await User.get()
      this.setState({userData: userData})
    }

    async refreshSearchResults() {
        const results = await Item.getFromFilter(this.state.searchFilter)
        const items = results.map(({item}) => item)
        const distances = results.map(({distance}) => distance)
        this.setState({items: items, distances: distances})
    }

    renderSearchBar() {
        return (
            <SearchBar
                barStyle={styles.searchBar}
                textProps={{
                    onSubmitEditing: (e) => {
                        const searchText = e.nativeEvent.text
                        const newSearchFilter = {
                            ...this.state.searchFilter,
                            keywords: extractKeywords(searchText)
                        } as ItemFilter
                        this.setState({searchFilter: newSearchFilter}, () => {
                            this.refreshSearchResults()
                        })
                    }
                }}
            />
        )
    }
    
    renderSearchResults() {
        if (this.state.items && this.state.distances) {
            return this.state.items.map((item, index) => {
                return (
                    <SearchResultItem
                        itemData={item}
                        key={item.itemID}
                    />
                )
            })
        }
    }

    renderUI() {
        if (this.state.userData) {
            return (
                <>
                    {this.renderSearchBar()}
                    {this.renderSearchResults()}
                </>
            )
        }
    }

    render() {
        return (
            <PageContainer
                style={{paddingTop: styleValues.smallHeight*2 + topInset + styleValues.mediumPadding*3}}
            >
                {this.renderUI()}
                <MenuBar
                    buttonProps={[
                        {
                            iconSource: icons.search,
                            iconStyle: {tintColor: colors.main},
                        }, {
                            iconSource: icons.shoppingBag,
                            buttonFunc: () => this.props.navigation.navigate("browse")
                        }, {
                            iconSource: icons.closet,
                            buttonFunc: () => this.props.navigation.navigate("closet")
                        }, {
                            iconSource: icons.profile,
                            buttonFunc: () => this.props.navigation.navigate("account")
                        },
                    ]}
                />
                <FilterScrollBar
                    style={{
                        top: styleValues.smallHeight
                         + styleValues.mediumPadding
                         + topInset
                    }}
                    initialFilter={{
                        country: "canada",
                        distanceInKM: 5
                    }}
                    onFilterChange={(newFilter) => {
                        this.setState({searchFilter: newFilter})
                    }}
                />
            </PageContainer>
        );
    }
}

const styles = StyleSheet.create({
    searchBar: {
        top: topInset + styleValues.mediumPadding
    }
})