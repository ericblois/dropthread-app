import { createStackNavigator } from "@react-navigation/stack";
import { ItemData, ItemInfo } from "../HelperFiles/DataTypes";

export type RootStackParamList = {
    start: undefined,
    userMain: undefined,
    userSignup: undefined
}

export const RootStack = createStackNavigator<RootStackParamList>();

export type UserMainStackParamList = {
    browse: undefined,
    likes: undefined,
    closet: undefined,
    account: undefined,
    viewItems: {
        items: ItemInfo[],
        header?: string
    }
}

export const UserMainStack = createStackNavigator<UserMainStackParamList>();

export type LikesStackParamList = {
    main: undefined
}

export const LikesStack = createStackNavigator<LikesStackParamList>();

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