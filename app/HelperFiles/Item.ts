import { httpsCallable } from "firebase/functions"
import { ItemData, ItemFilter, ItemInfo } from "../HelperFiles/DataTypes"
import { cloudRun, functions } from "./Constants"
import { LocalCache } from "./LocalCache"
import User from "./User"

export default abstract class Item {

    // Retrieve items by their ID
    public static async getFromIDs(itemIDs: string[], withDistance = false) {
        // Determine which item IDs should be refresh vs retrieved from cache
        const cacheResult = LocalCache.getItems(itemIDs)
        // Get items that need to be refreshed
        let coords: object | undefined = undefined
        if (withDistance) {
            const userData = await User.get()
            coords = {lat: userData.lat, long: userData.long}
        }
        /* 
            If there are no valid items returned,
            this is an initial refresh and should
            use itemIDs, otherwise just use refreshIDs
        */
        const result: ItemInfo[] = cacheResult.refreshIDs.length > 0 || cacheResult.validItems.length === 0 ? (await cloudRun('POST', "getItems", {
            userID: User.getCurrent().uid,
            itemIDs: cacheResult.validItems.length === 0 ? itemIDs : cacheResult.refreshIDs,
            coords: coords
        })) : []
        // Cache refreshed items
        if (result.length > 0) {
            LocalCache.saveItems(itemIDs, result)
        }
        // Return valid items and refreshed items together
        return result.concat(cacheResult.validItems)
    }
    // Retrieve all items from a specific user
    public static async getFromUser(userID?: string, withDistance = false) {
        const id = userID ? userID : User.getCurrent().uid
        // Determine which item IDs should be refresh vs retrieved from cache
        const cacheResult = LocalCache.getItems(id)
        let coords: object | undefined = undefined
        if (withDistance) {
            const userData = await User.get()
            coords = {lat: userData.lat, long: userData.long}
        }
        const result: ItemInfo[] = cacheResult.refreshIDs.length > 0 || cacheResult.validItems.length === 0 ? (await cloudRun('POST', "getUserItems", {
            requestingUserID: User.getCurrent().uid,
            targetUserID: id,
            coords: coords
        })) : []
        // Cache refreshed items
        if (result.length > 0) {
            LocalCache.saveItems(id, result)
        }
        // Return valid items and refreshed items together
        return result.concat(cacheResult.validItems)
    }
    // Get items using a filter
    public static async getFromFilter(filters: ItemFilter) {
        // Determine which item IDs should be refresh vs retrieved from cache
        const cacheResult = LocalCache.getItems(filters)
        const userData = await User.get()
        const coords = {lat: userData.lat, long: userData.long}
        const result: ItemInfo[] = cacheResult.refreshIDs.length > 0 || cacheResult.validItems.length === 0 ? (await cloudRun('POST', "getFilteredItems", {
            userID: userData.userID,
            filters: filters,
            coords: coords
        })) : []
        // Cache refreshed items
        if (result.length > 0) {
            LocalCache.saveItems(filters, result)
        }
        // Return valid items and refreshed items together
        return result.concat(cacheResult.validItems)
    }
    // Create a new item
    public static async create(itemData: ItemData) {
        // Create item
        if (itemData.userID !== User.getCurrent().uid) {
            throw new Error("User not permitted to create this item")
        }
        // Upload item data
        const newItemID = (await cloudRun('POST', "createItem", {
            userID: itemData.userID,
            itemData: itemData
        })) as string
        // Upload images after item ID is generated
        if (itemData.images.length > 0) {
            const newItemData: ItemData = {...itemData, itemID: newItemID}
            // Upload images (server will update item data)
            await User.uploadItemImages(newItemID, itemData.images)
        }
        return newItemID
    }
    // Update an item's information
    public static async update(itemData: Partial<ItemData>) {
        if (!itemData.itemID) {
            throw new Error('No item ID in updated item data')
        }
        if (itemData.images) {
            // Get old item data
            const oldItemData = (await Item.getFromIDs([itemData.itemID]))[0].item
            // Update images
            const newImages: string[] = []
            const deletedImages: string[] = []
            for (const imgURL of itemData.images) {
                // Check for new image
                if (!oldItemData.images.includes(imgURL)) {
                    newImages.push(imgURL)
                }
            }
            for (const imgURL of oldItemData.images) {
                // Check for deleted image
                if (!itemData.images.includes(imgURL)) {
                    deletedImages.push(imgURL)
                }
            }
            // Upload new images
            const newDownloadURLs = (await Promise.all([
                User.uploadItemImages(itemData.itemID, newImages),
                User.deleteImages(deletedImages)
            ]))[0]
            // Replace the local paths of new images with their download URLs
            newImages.forEach((localURL, newURLIndex) => {
                // Get index of url in itemData's images list
                const itemIndex = itemData.images!.indexOf(localURL)
                // Replace the local URI with the download URL
                itemData.images![itemIndex] = newDownloadURLs[newURLIndex]
            })
            // Reload this item in cache
            LocalCache.forceReloadItem(itemData.itemID)
        }
        // Update item
        await cloudRun('POST', "updateItem", {
            userID: itemData.userID,
            itemData: itemData
        })
    }
    // Delete an item
    public static async delete(itemData: ItemData) {
        if (itemData.userID !== User.getCurrent().uid) {
            throw new Error("User not permitted to delete this item")
        }
        // Delete item
        await cloudRun('POST', "deleteItem", {
            userID: itemData.userID,
            itemData: itemData
        })
        //Delete images
        await User.deleteImages(itemData.images)
        // Reload this item in cache
        LocalCache.forceReloadItem(itemData.itemID)
    }
    // Like an item
    public static async like(itemID: string) {
        await cloudRun('POST', "likeItem", {
            userID: User.getCurrent().uid,
            itemID: itemID
        })
    }
    // Unlike an item
    public static async unlike(itemID: string) {
        await cloudRun('POST', "unlikeItem", {
            userID: User.getCurrent().uid,
            itemID: itemID
        })
    }
}