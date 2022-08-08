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
    public static createData(userID: string, receivedPayment: number, givenPayment: number) {
        return {
            offerID: uuid.v4(),
            fromID: User.getCurrent().uid,
            toID: userID,
            fromPayment: givenPayment,
            toPayment: receivedPayment,
            offerTime: Date.now(),
            responseType: null,
            responseTime: null,
            counterOfferID: null,
            exchangeID: null
        } as OfferData
    }

    public static async send(offer: OfferData, fromItemIDs: string[], toItemIDs: string[]) {
        await cloudRun('POST', 'sendOffer', {
            offerData: offer,
            fromItemIDs: fromItemIDs,
            toItemIDs: toItemIDs
        })
    }

    public static accept(offerID: string) {
        
    }

    public static counter(offerID: string, receivedItems: string[], givenItems: string[], receivedPayment: number, givenPayment: number, deliveryMethod: DeliveryMethod) {
        
    }

    public static reject(offerID: string) {
        
    }
}