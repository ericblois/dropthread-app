import { httpsCallable } from "firebase/functions"
import { ItemData, dollarIncrease, ItemFilter, ItemInfo, ItemInteraction, percentIncrease, ItemCategories, ItemGenders, ItemFits, ItemConditions, countriesList, DefaultItemData, ItemPriceData } from "../HelperFiles/DataTypes"
import { cloudRun, functions } from "./Constants"
import { LocalCache } from "./LocalCache"
import User from "./User"

export default abstract class Item {

    // Retrieve items by their ID
    public static async getFromIDs(itemIDs: string[]) {
        if (itemIDs.length === 0) {
            return []
        }
        // Determine which item IDs should be refresh vs retrieved from cache
        const cacheResult = LocalCache.getItems(itemIDs)
        // Get items that need to be refreshed
        const coords = await User.getLocation()
        /* 
            If there are no valid items returned,
            this is an initial refresh and should
            use itemIDs, otherwise just use refreshIDs
        */
        const result: ItemInfo[] = cacheResult.refreshIDs.length > 0 || cacheResult.validItems.length === 0 ? (await cloudRun('POST', "getItemsFromIDs", {
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
    public static async getFromUser(userID?: string, forceRefresh?: boolean) {
        const id = userID ? userID : User.getCurrent().uid
        // Determine which item IDs should be refresh vs retrieved from cache
        const cacheResult = LocalCache.getItems(id)
        const coords = await User.getLocation()
        const result: ItemInfo[] = cacheResult.refreshIDs.length > 0 || cacheResult.validItems.length === 0 || forceRefresh ? (await cloudRun('POST', "getUserItems", {
            requestingUserID: User.getCurrent().uid,
            targetUserID: id,
            coords: coords
        })) : []
        // Cache refreshed items
        if (result.length > 0) {
            LocalCache.saveItems(id, result)
            return result
        }
        // Return valid items and refreshed items together
        return result.concat(cacheResult.validItems)
    }
    // Retrieve all items from a specific user
    public static async getLiked() {
        // Determine which item IDs should be refresh vs retrieved from cache
        /* 
            IMPLEMENT CACHE GET
        */
        const coords = await User.getLocation()
        const result: ItemInfo[] = await cloudRun('POST', "getLikedItems", {
            coords: coords
        })
        /*
            IMPLEMENT CACHE SAVE
        */
        return result
    }
    // Get items using a filter
    public static async getFromFilter(filters: ItemFilter) {
        // Determine which item IDs should be refresh vs retrieved from cache
        const cacheResult = LocalCache.getItems(filters)
        const coords = await User.getLocation()
        const result: ItemInfo[] = cacheResult.refreshIDs.length > 0 || cacheResult.validItems.length === 0 ? (await cloudRun('POST', "getFilteredItems", {
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
        let u = User.getCurrent()
        if (itemData.userID !== User.getCurrent().uid) {
            throw new Error("User not permitted to create this item")
        }
        // Upload item data
        const newItemID = (await cloudRun('POST', "createItem", {
            itemData: itemData
        })) as string
        // Upload images after item ID is generated
        if (itemData.images.length > 0) {
            // Upload images (server will update item data)
            const imgURLs = await User.uploadItemImages(newItemID, itemData.images)
            await Item.update({itemID: newItemID, images: imgURLs})
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
        }
        // Update item
        await cloudRun('POST', "updateItem", {
            itemData: itemData
        })
        // Reload this item in cache
        LocalCache.forceReloadItem(itemData.itemID)
    }
    // Delete an item
    public static async delete(itemData: ItemData) {
        if (itemData.userID !== User.getCurrent().uid) {
            throw new Error("User not permitted to delete this item")
        }
        // Delete item
        await cloudRun('POST', "deleteItem", {
            itemData: itemData
        })
        //Delete images
        await User.deleteImages(itemData.images)
        // Reload this item in cache
        LocalCache.forceReloadItem(itemData.itemID)
    }
    // Like an item, return like time, update local version and server version
    public static like(itemInfo: ItemInfo) {
        // Send like to server
        cloudRun('POST', "likeItem", {
            itemID: itemInfo.item.itemID
        }).then((likeTime) => {
            itemInfo.likeTime = likeTime as number
        })
        // Return updated local version
        itemInfo.likeTime = Date.now()
        itemInfo.likePrice = itemInfo.item.priceData.basePrice
        itemInfo.item.priceData.lastBasePrice = itemInfo.item.priceData.basePrice
        itemInfo.item.priceData.basePrice = Math.max(itemInfo.item.priceData.basePrice*(1 + percentIncrease/100), itemInfo.item.priceData.basePrice + dollarIncrease)
        itemInfo.item.likeCount += 1
    }
    // Unlike an item, update local version and server version
    public static unlike(itemInfo: ItemInfo) {
        // Send like to server
        cloudRun('POST', "unlikeItem", {
            itemID: itemInfo.item.itemID
        })
        // Update local version
        itemInfo.likeTime = null
        itemInfo.likePrice = null
        itemInfo.item.priceData.basePrice = itemInfo.item.priceData.lastBasePrice
        // Revert lastPrice
        if (itemInfo.item.priceData.lastBasePrice*(1/(1 + percentIncrease/100)) >= dollarIncrease) {
            itemInfo.item.priceData.lastBasePrice *= 1/(1 + percentIncrease/100)
        } else {
            itemInfo.item.priceData.lastBasePrice -= 2.5
        }
        // Check if last price is now lower than the minimum prcie
        if (itemInfo.item.priceData.lastBasePrice < itemInfo.item.priceData.minPrice) {
            itemInfo.item.priceData.lastBasePrice = itemInfo.item.priceData.minPrice
        }
        itemInfo.item.likeCount -= 1
    }
    public static async getLikes(itemID: string) {
        // Get likes from server
        return (await cloudRun('POST', "getItemLikes", {
            itemID: itemID
        })) as ItemInteraction[]
    }

    public static validatePriceData(priceData: ItemPriceData) {
        return (
            priceData.minPrice !== undefined
         && priceData.minPrice >= 0
         && priceData.minPrice < 90000
         && priceData.basePrice !== undefined
         && priceData.basePrice >= 0
         && priceData.basePrice < 90000
         && priceData.feePrice !== undefined
         && priceData.feePrice >= 0
         && priceData.feePrice < 90000
         && priceData.facePrice !== undefined
         && priceData.facePrice >= 0
         && priceData.facePrice < 100000
         && priceData.lastBasePrice !== undefined
         && priceData.lastBasePrice >= 0
         && priceData.lastBasePrice < 90000
         && priceData.lastFeePrice !== undefined
         && priceData.lastFeePrice >= 0
         && priceData.lastFeePrice < 90000
         && priceData.lastFacePrice !== undefined
         && priceData.lastFacePrice >= 0
         && priceData.lastFacePrice < 100000
        )
    }

    public static validateProperty(key: keyof ItemData, value: any) {
        /* 
        --- [IN FUTURE] Need to add delivery methods ---
        */
        switch (key) {
            case "name":
                if (!value || value === "") return false
                break
            case "category":
                if (!value || value === "" || !ItemCategories.includes(value)) return false
                break
            case "gender":
                if (!value || value === "" || !ItemGenders.includes(value)) return false
                break
            case "size":
                if (!value || value === "") return false
                break
            case "fit":
                if (!value || value === "" || !ItemFits.includes(value)) return false
                break
            case "condition":
                if (!value || value === "" || !ItemConditions.includes(value)) return false
                break
            case "images":
                if ((value as string[]).length <= 0) return false
                break
            case "priceData":
                if (!Item.validatePriceData(value)) return false
                break
            case "styles":
                if ((value as string[]).length > 10) return false
                break
            case "country":
                if (!value || value === "" || !countriesList.includes(value)) return false
                break
            case "userID":
                if (!value || value === "") return false
                break
            default:
                break
        }
        return true
    }

    public static validate(item: ItemData) {
        for (const key of Object.keys(item)) {
            if (!Item.validateProperty(key as keyof ItemData, item[key as keyof ItemData])) {
                return false
            }
        }
        return true
    }

    public static validatePartial(item: Partial<ItemData>) {
        for (const key of Object.keys(item)) {
            if (!Item.validateProperty(key as keyof ItemData, item[key as keyof ItemData])) {
                return false
            }
        }
        return true
    }
}