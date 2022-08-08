import { createStackNavigator } from "@react-navigation/stack";
import { ExchangeData, ItemData, ItemInfo, ItemInteraction, OfferData, OfferInfo } from "../HelperFiles/DataTypes";

export type RootStackParamList = {
    start: undefined,
    userMain: undefined,
    userDetail: any,
    userSignup: undefined
}

export const RootStack = createStackNavigator<RootStackParamList>();

export type UserMainStackParamList = {
    browse: undefined,
    exchanges: undefined,
    closet: undefined,
    account: undefined,
    viewItems: {
        items: ItemInfo[],
        header?: string
    }
    editOffer: {
        interaction: ItemInteraction
    }
}

export const UserMainStack = createStackNavigator<UserMainStackParamList>();

export type UserDetailStackParamList = {
    viewOffer: {
        offerInfo: OfferInfo
    }
}

export const UserDetailStack = createStackNavigator<UserDetailStackParamList>();

export type ExchangesStackParamList = {
    main: undefined,
    likes: undefined,
}

export const ExchangesStack = createStackNavigator<ExchangesStackParamList>();

export type ClosetStackParamList = {
    main: undefined,
    editItem: {
        itemID: string,
        isNew: boolean
    },
    itemInfo: {
        itemID: string,
        distance?: number
    },
    itemSwaps: {
        likedUserIDs: string[]
    }
}

export const ClosetStack = createStackNavigator<ClosetStackParamList>();

export type AccountStackParamList = {
    main: undefined
}

export const AccountStack = createStackNavigator<AccountStackParamList>();