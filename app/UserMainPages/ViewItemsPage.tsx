import { RouteProp } from "@react-navigation/core";
import { StackNavigationProp } from '@react-navigation/stack';
import React from "react";
import { FlatList, Pressable, StyleSheet, Text, View } from "react-native";
import CustomComponent from "../CustomComponents/CustomComponent";
import { CustomModal, FilterSearchBar, ItemLargeCard, ItemSmallCard, LoadingCover, MenuBar, PageContainer } from "../HelperFiles/CompIndex";
import { extractKeywords, ItemData, ItemFilter, ItemInfo, UserData } from "../HelperFiles/DataTypes";
import Item from "../HelperFiles/Item";
import { UserMainStackParamList } from "../HelperFiles/Navigation";
import { bottomInset, colors, icons, screenHeight, screenWidth, styleValues, textStyles } from "../HelperFiles/StyleSheet";
import User from "../HelperFiles/User";

type ViewItemsNavigationProp = StackNavigationProp<UserMainStackParamList, "viewItems">;

type ViewItemsRouteProp = RouteProp<UserMainStackParamList, "viewItems">;

type ViewItemsProps = {
    navigation: ViewItemsNavigationProp,
    route: ViewItemsRouteProp
}

type State = {
    //Index of the item to show a detailed view
    showDetailCard?: ItemInfo,
    errorDidOccur: boolean
}

//const AnimatedFilterScrollBar = Animated.createAnimatedComponent(FilterScrollBar);

export default class ViewItemsPage extends CustomComponent<ViewItemsProps, State> {

  flatListComp: FlatList<ItemInfo> | null = null

    constructor(props: ViewItemsProps) {
        super(props)
        this.state = {
            showDetailCard: undefined,
            errorDidOccur: false
        }
    }

    renderUI() {
        return (
            <>
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
                        disableViewCloset
                    />
                    : undefined}
                </CustomModal>
                <FlatList
                    data={this.props.route.params.items}
                    style={{overflow: 'visible'}}
                    renderItem={({item, index}) => (
                        <ItemSmallCard
                            itemInfo={item}

                            onPress={() => this.setState({showDetailCard: item})}
                        />
                    )}
                />
            </>
        )
    }

    render() {
      try {
        return (
            <PageContainer>
              {this.renderUI()}
              <MenuBar
                buttonProps={[
                  {
                    iconSource: icons.chevron,
                    onPress: () => this.props.navigation.goBack()
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