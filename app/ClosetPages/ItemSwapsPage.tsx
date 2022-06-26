import { RouteProp } from "@react-navigation/core";
import { CompositeNavigationProp } from "@react-navigation/native";
import { StackNavigationProp } from '@react-navigation/stack';
import React from "react";
import { ListRenderItemInfo, StyleSheet, Text } from "react-native";
import CustomComponent from "../CustomComponents/CustomComponent";
import { ItemBrowseCard, LoadingCover, MenuBar, PageContainer } from "../HelperFiles/CompIndex";
import { ItemData, UserData } from "../HelperFiles/DataTypes";
import Item from "../HelperFiles/Item";
import { ClosetStackParamList, UserMainStackParamList } from "../HelperFiles/Navigation";
import { icons, styleValues } from "../HelperFiles/StyleSheet";
import User from "../HelperFiles/User";

type ItemSwapsNavigationProp = CompositeNavigationProp<
    StackNavigationProp<ClosetStackParamList, "itemSwaps">,
    StackNavigationProp<UserMainStackParamList>
>

type ItemSwapsRouteProp = RouteProp<ClosetStackParamList, "itemSwaps">;

type ItemSwapsProps = {
    navigation: ItemSwapsNavigationProp,
    route: ItemSwapsRouteProp
}

type State = {
    userData?: UserData,
    items?: ItemData[],
    distances?: number[]
}

export default class ItemSwapsPage extends CustomComponent<ItemSwapsProps, State> {

    constructor(props: ItemSwapsProps) {
        super(props)
        this.state = {
            userData: undefined,
            items: undefined,
            distances: undefined
        }
    }

    async refreshData(num: number = 10) {
        // Get user data
        const userData = await User.get()
        // Get items from each user who has liked this item
        let promises: Promise<{item: ItemData, distance: number}[]>[] = []
        for (const userID of this.props.route.params.likedUserIDs) {
            promises.push(Item.getFromUser(userID))
        }
        const itemDatas = (await Promise.all(promises)).flat()
        this.setState({
            userData: userData,
            items: itemDatas.map(({item}) => item),
            distances: itemDatas.map(({distance}) => distance)
        })
    }

    /*async getNextItem() {
        if (this.state.items && this.state.itemIDs) {
            if (this.state.items.length !== this.state.itemIDs.length) {
                const nextItem = await Item.getFromIDs(this.state.itemIDs[this.state.items.length])
                this.setState({items: this.state.items.concat([nextItem.item])})
            }
        }
    }*/

    renderUI() {
        if (this.state.userData && this.state.items && this.state.distances) {
            return (
                <>
                <Text>Matching items for: Graphic Tee</Text>
                {/*<Carousel
                    ref={(carousel) => {this.carouselComp = carousel}}
                    data={this.state.items}
                    renderItem={(listItem: ListRenderItemInfo<ItemData> | {item: ItemData, index: number}) => {
                        return (
                            <ItemBrowseCard
                                itemData={listItem.item}
                                key={listItem.index.toString()}
                                distance={this.state.distances![listItem.index]}
                            />
                        )
                    }}
                    itemWidth={screenWidth - 2*styleValues.mediumPadding}
                    sliderWidth={screenWidth}
                />*/}
                {/*<ScrollContainer
                    snapToInterval={ItemBrowseCardStyles.cardContainer.height}
                >
                    {this.state.items.map((item, index) => {
                        return (
                            <ItemBrowseCard
                                itemData={item}
                                key={index.toString()}
                                
                            />
                        )
                    })}
                </ScrollContainer>*/}
                </>
            )
        }
    }

    renderLoading() {
        if (this.state.items === undefined) {
            return (
              <LoadingCover size={"large"}/>
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
                ]}
            
            ></MenuBar>
        </PageContainer>
    );
    }
}

const styles = StyleSheet.create({

})