import { ItemData, ItemFilter, ItemInfo, UserData } from './DataTypes'

type UserCache = {
    userData: UserData,
    loadTime: number
}

type ItemCache = {
    itemInfo: ItemInfo,
    loadTime: number
}

export abstract class LocalCache {

    // Threshold to reload an item or user, in seconds
    private static userReloadTime = 300
    private static itemReloadTime = 300

    private static Users: {[userID: string]: UserCache} = {}

    public static getUser = (userID: string, reloadThreshold?: number) => {
        if (this.Users.hasOwnProperty(userID)) {
            const userCache = this.Users[userID]
            // Check last load time
            if (Date.now() - userCache.loadTime < (reloadThreshold || this.userReloadTime)*1000) {
                return userCache.userData
            }
        }
        return undefined
    }

    public static saveUser(userID: string, userData: UserData) {
        this.Users[userID] = {
            userData: userData,
            loadTime: Date.now()
        }
    }

    public static forceReloadUser(userID: string) {
        delete this.Users[userID]
    }

    private static ItemsByID: {[itemID: string]: ItemCache} = {}

    private static ItemsByUser: {[userID: string]: string[]} = {}

    private static ItemsByFilter: {[filterString: string]: string[]} = {}

    // Refresh timeout is in seconds
    public static getItems(keyItem: string[] | string | ItemFilter, reloadThreshold?: number) {
        let itemIDs: string[] = []
        let refreshIDs: string[] = []
        let validItems: ItemInfo[] = []
        // Get by item IDs
        if (Array.isArray(keyItem)) {
            itemIDs = keyItem
        } // Get by user ID
        else if (typeof keyItem === 'string' || keyItem instanceof String) {
            // Check if this filter search has been cached
            if (this.ItemsByUser.hasOwnProperty(keyItem as string)) {
                itemIDs = this.ItemsByUser[keyItem as string]
            }
        } // Get by filter
        else {
            const searchKey = JSON.stringify(keyItem)
            // Check if this filter search has been cached
            if (this.ItemsByFilter.hasOwnProperty(searchKey)) {
                itemIDs = this.ItemsByFilter[searchKey]
            }
        }
        for (const itemID of itemIDs) {
            // Get items
            if (this.ItemsByID.hasOwnProperty(itemID)) {
                const itemCache = this.ItemsByID[itemID]
                // Check if this item was cached in the last minute
                if (Date.now() - itemCache.loadTime < (reloadThreshold || this.itemReloadTime)*1000) {
                    validItems.push(itemCache.itemInfo)
                    continue
                }
            }
            refreshIDs.push(itemID)
        }
        console.log({validItems: validItems.length, refreshIDs: refreshIDs.length})
        return {validItems: validItems, refreshIDs: refreshIDs}
    }
    public static saveItems(keyItem: string[] | string | ItemFilter, items: ItemInfo[]) {
        // Get item IDs
        const itemIDs = items.map(({item}) => (item.itemID))
        // Skip item IDs
        if (!Array.isArray(keyItem)) {
            // Save user ID
            if (typeof keyItem === 'string' || keyItem instanceof String) {
                this.ItemsByUser[keyItem as string] = itemIDs
            } // Save filter
            else {
                const searchKey = JSON.stringify(keyItem)
                this.ItemsByFilter[searchKey] = itemIDs
            }
        }
        const currentTime = Date.now()
        // Save items
        for (const itemInfo of items) {
            this.ItemsByID[itemInfo.item.itemID] = {
                itemInfo: itemInfo,
                loadTime: currentTime
            }
        }
    }

    public static forceReloadItem(itemID: string) {
        delete this.ItemsByID[itemID]
    }

}