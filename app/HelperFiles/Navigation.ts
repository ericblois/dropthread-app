import { createStackNavigator } from "@react-navigation/stack";
import { ItemData } from "../HelperFiles/DataTypes";

export type RootStackParamList = {
    start: undefined,
    userMain: undefined,
    userSignup: undefined
}

export const RootStack = createStackNavigator<RootStackParamList>();

export type UserMainStackParamList = {
    search: undefined,
    browse: undefined,
    closet: undefined,
    account: undefined
}

export const UserMainStack = createStackNavigator<UserMainStackParamList>();

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