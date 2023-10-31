import { RouteProp } from "@react-navigation/core";
import { StackNavigationProp } from '@react-navigation/stack';
import React from "react";
import { FlatList, Pressable, StyleSheet, Text, View } from "react-native";
import CustomComponent from "../CustomComponents/CustomComponent";
import { CustomModal, FilterSearchBar, ItemLargeCard, ItemSmallCard, LoadingCover, BloisMenuBar, BloisPage } from "../HelperFiles/CompIndex";
import { extractKeywords, ItemData, ItemFilter, ItemInfo, UserData } from "../HelperFiles/DataTypes";
import Item from "../HelperFiles/Item";
import { UserMainStackParamList } from "../HelperFiles/Navigation";
import { bottomInset, colors, icons, screenHeight, screenWidth, styleValues, textStyles } from "../HelperFiles/StyleSheet";
import User from "../HelperFiles/User";
import BloisIconButton from "../BloisComponents/BloisIconButton";

type ViewItemsNavigationProp = StackNavigationProp<UserMainStackParamList, "viewItems">;

type ViewItemsRouteProp = RouteProp<UserMainStackParamList, "viewItems">;

type ViewItemsProps = {
    navigation: ViewItemsNavigationProp,
    route: ViewItemsRouteProp
}

type State = {
    //Index of the item to show a detailed view
    items?: ItemInfo[],
    addedItems: string[],
    showDetailCard?: ItemInfo,
    isLoading: boolean,
    imagesLoaded: number,
    errorMessage?: string
}

//const AnimatedFilterScrollBar = Animated.createAnimatedComponent(FilterScrollBar);

export default class ViewItemsPage extends CustomComponent<ViewItemsProps, State> {

  flatListComp: FlatList<ItemInfo> | null = null

    constructor(props: ViewItemsProps) {
        super(props)
        this.state = {
            items: undefined,
            addedItems: props.route.params.addedItems || [],
            showDetailCard: undefined,
            isLoading: true,
            imagesLoaded: 0,
            errorMessage: undefined
        }
        this.props.navigation.addListener('state', (e) => {
          const routes = e.data.state.routes;
          if (routes[routes.length - 1].name === 'viewItems') {
            this.refreshData()
          }
        })
    }

    async refreshData() {
      try {
        this.setState({isLoading: true, errorMessage: undefined});
        const itemInfos = await this.props.route.params.getItems()
        this.setState({items: itemInfos})
      } catch (e) {
        this.handleError(e)
      }
      this.setState({isLoading: false})
    }

    renderUI() {
        if (this.state.items && this.state.items.length > 0) {
            return (
                <FlatList
                    data={this.state.items}
                    style={{overflow: 'visible', marginTop: styleValues.mediumPadding}}
                    renderItem={({item, index}) => (
                        <View>
                            <ItemSmallCard
                                itemInfo={item}
                                onPress={() => this.setState({showDetailCard: item})}
                                onLoadEnd={() => this.setState({imagesLoaded: this.state.imagesLoaded + 1})}
                            />
                            {this.props.route.params.addItem && !this.state.addedItems.includes(item.item.itemID) ?
                            <BloisIconButton
                                name="plus"
                                type="Feather"
                                buttonStyle={{
                                    position: 'absolute',
                                    top: styleValues.mediumPadding,
                                    right: styleValues.mediumPadding,
                                    backgroundColor: colors.main,
                                    height: styleValues.iconMediumSize,
                                    borderRadius: styleValues.iconMediumSize,
                                    padding: styleValues.minorPadding
                                }}
                                iconStyle={{color: colors.white}}
                                onPress={async () => {
                                  await this.props.route.params.addItem!(item)
                                  this.setState({addedItems: this.state.addedItems.concat(item.item.itemID)})
                                }}
                            />  
                          : undefined}
                          </View>
                    )}
                />
            )
        } else if (this.state.items && this.state.items.length === 0) {
          return (
            <Text style={{...textStyles.large, alignSelf: 'center'}}>No items found.</Text>
          )
        }
    }
    renderLoading() {
      if (
        this.state.isLoading
        || !this.state.items
        || this.state.imagesLoaded < this.state.items.length
        || this.state.errorMessage
        ) {
          return (
            <LoadingCover
              size={"large"}
              
              errorText={this.state.errorMessage}
              onErrorRefresh={() => this.refreshData()}
          />
          );
        }
    }

    render() {
      try {
        return (
            <BloisPage
              headerText={this.props.route.params.header}
            >
              {this.renderUI()}
              <CustomModal
                  visible={!!this.state.showDetailCard}
                  onClose={() => this.setState({showDetailCard: undefined})}
              >
                  {this.state.showDetailCard ?
                  <ItemLargeCard
                      itemInfo={this.state.showDetailCard}
                      style={{
                          //width: '50%',
                          height: screenHeight*0.7
                      }}
                      hideButtons
                  />
                  : undefined}
              </CustomModal>
              {this.renderLoading()}
              <BloisMenuBar
                buttonProps={[
                  {
                    iconSource: icons.chevron,
                    onPress: () => this.props.navigation.goBack()
                  },
                ]}
              
              />
            </BloisPage>
        );
      } catch (e) {
        this.setState({errorDidOccur: true})
      }
    }
}

const styles = StyleSheet.create({

})