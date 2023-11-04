import { RouteProp } from "@react-navigation/core";
import { CompositeNavigationProp } from "@react-navigation/native";
import { StackNavigationProp } from "@react-navigation/stack";
import { RefreshControl, StyleSheet, Text, View } from "react-native";
import CustomComponent from "../CustomComponents/CustomComponent";
import BloisIconButton from "../BloisComponents/BloisIconButton";
import {
    ItemSmallCard,
    LoadingCover,
    BloisPage,
    ScrollContainer,
} from "../HelperFiles/CompIndex";
import { ItemInfo, UserData } from "../HelperFiles/DataTypes";
import Item from "../HelperFiles/Item";
import {
    ClosetStackParamList,
    UserMainStackParamList,
} from "../HelperFiles/Navigation";
import { bottomInset, colors, styVals, textStyles } from "../HelperFiles/StyleSheet";
import User from "../HelperFiles/User";

type ClosetMainNavigationProp = CompositeNavigationProp<
    StackNavigationProp<ClosetStackParamList, "main">,
    StackNavigationProp<UserMainStackParamList>
>;

type ClosetMainRouteProp = RouteProp<ClosetStackParamList, "main">;

type ClosetMainProps = {
    navigation: ClosetMainNavigationProp;
    route: ClosetMainRouteProp;
};

type State = {
    userData?: UserData;
    itemsInfo?: ItemInfo[];
    imagesLoaded: boolean;
    isLoading: boolean;
    errorMessage?: string;
};

export default class ClosetMainPage extends CustomComponent<
    ClosetMainProps,
    State
> {
    constructor(props: ClosetMainProps) {
        super(props);
        this.state = {
            userData: undefined,
            itemsInfo: undefined,
            imagesLoaded: true,
            isLoading: true,
            errorMessage: undefined,
        };
    }

    async refreshData() {
        try {
            this.setState({ isLoading: true, errorMessage: undefined });
            const userData = await User.get();
            const itemsInfo = await Item.getFromUser(undefined, true);
            this.setState({ userData: userData, itemsInfo: itemsInfo });
        } catch (e) {
            this.handleError(e);
        }
        this.setState({ isLoading: false });
    }

    renderAddButton() {
        return (
            <BloisIconButton
                icon={{
                    name: "tag-plus-outline",
                    type: "MaterialCommunityIcons",
                }}
                style={{
                    position: "absolute",
                    bottom:
                        bottomInset +
                        styVals.mediumHeight +
                        styVals.mediumPadding,
                    right: styVals.mediumPadding,
                    width:
                        styVals.iconLargerSize +
                        styVals.mediumPadding * 2,
                    padding: styVals.mediumPadding,
                    borderRadius: styVals.mediumPadding,
                    backgroundColor: colors.background,
                }}
                animType={'shadow'}
                onPress={() => {
                    this.props.navigation.navigate("editItem", {
                        itemID: "",
                        isNew: true,
                    });
                }}
            />
        );
    }

    renderItems() {
        if (this.state.itemsInfo?.length) {
            return (
                <ScrollContainer
                    refreshControl={
                        <RefreshControl
                            refreshing={false}
                            onRefresh={() => this.refreshData()}
                        />
                    }
                >
                    {this.state.itemsInfo.map((itemInfo, index) => {
                        return (
                            <ItemSmallCard
                                itemInfo={itemInfo}
                                onPress={() => {
                                    this.props.navigation.navigate("itemInfo", {
                                        itemID: itemInfo.item.itemID,
                                        distance: itemInfo.distance!,
                                    });
                                }}
                                key={index.toString()}
                            />
                        );
                    })}
                </ScrollContainer>
            );
        } else {
            return (
                <View style={{flex: 1, justifyContent: 'center', paddingBottom: bottomInset + styVals.mediumHeight}}>
                    <Text
                        style={{
                            ...textStyles.medium,
                            color: colors.grey,
                            alignSelf: 'center',
                        }}
                    >
                        You have no items in your closet.
                    </Text>
                </View>
            )
        }
    }

    renderUI() {
        return (
            <>
                {this.renderItems()}
                {this.renderAddButton()}
            </>
        );
    }

    renderLoading() {
        if (this.state.isLoading || this.state.errorMessage) {
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
        return (
            <BloisPage headerText={"Your Closet"}>
                {this.renderUI()}
                {this.renderLoading()}
            </BloisPage>
        );
    }
}

const styles = StyleSheet.create({});
