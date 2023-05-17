import { DeliveryMethod, OfferData, OfferInfo } from "./DataTypes";
import uuid from 'react-native-uuid'
import User from "./User";
import { cloudRun } from "./Constants";

export default abstract class Offer {

    public static async getWithIDs(offerIDs: string[]) {
        return (await cloudRun('POST', 'getOffersWithIDs', {
            offerIDs: offerIDs
        })) as OfferInfo[]
    }
    public static async getWithItem(itemID: string) {
        return (await cloudRun('POST', 'getOffersWithItem', {
            itemID: itemID
        })) as OfferInfo[]
    }
    public static async getWithUser() {
        return (await cloudRun('POST', 'getOffersWithUser', {})) as OfferInfo[]
    }

    public static async getInfo(offerData: OfferData) {
        const coords = await User.getLocation()
        return (await cloudRun('POST', 'getOfferInfo', {offerData: offerData, coords: coords})) as OfferInfo
    }

    public static createOffer(buyerUserID: string, itemID: string) {
        return {
            offerID: uuid.v4(),
            fromUserID: User.getCurrent().uid,
            toUserID: buyerUserID,
            fromName: '',
            toName: '',
            itemIDs: [itemID],
            offerTime: Date.now(),
            responseType: null,
            responseTime: null,
            exchangeID: null
        } as OfferData
    }

    public static async send(offer: OfferData) {
        await cloudRun('POST', 'sendOffer', {offerData: offer})
    }

    public static accept(offerID: string) {
        
    }

    public static counter(offerID: string, receivedItems: string[], givenItems: string[], receivedPayment: number, givenPayment: number, deliveryMethod: DeliveryMethod) {
        
    }

    public static async reject(offerID: string) {
        await cloudRun('POST', 'rejectOffer', {offerID: offerID})
    }
}