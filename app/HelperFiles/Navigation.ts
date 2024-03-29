import { createStackNavigator } from "@react-navigation/stack";
import { ExchangeData, ItemData, ItemInfo, ItemInteraction, OfferData, OfferInfo } from "../HelperFiles/DataTypes";

export type RootStackParamList = {
    entry: undefined,
    start: undefined,
    userMain: undefined,
    userDetail: any,
    userSignup: undefined,
    geoPerm: undefined,
    notifPerm: undefined,
    camPerm: undefined,
    photoPerm: undefined,
}

export const RootStack = createStackNavigator<RootStackParamList>();

export type UserMainStackParamList = {
    browse: undefined,
    exchanges: undefined,
    closet: undefined,
    account: undefined,
    viewItems: {
        getItems: () => Promise<ItemInfo[]>,
        addItem?: (item: ItemInfo) => void,
        addedItems?: string[],
        header?: string,
        description?: string,
    },
    createOffer: {
        offer: OfferData
    },
    editOffer: {
        offerInfo: OfferInfo
    }
}

export type UserMainStackOptions = {
    viewItemsGetItems: () => Promise<ItemInfo[]>,
    viewItemsAddItem?: (item: ItemInfo) => void,
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