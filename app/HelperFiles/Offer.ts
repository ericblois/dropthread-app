import { Coords, DeliveryMethod, OfferData, OfferInfo } from "./DataTypes";
import uuid from 'react-native-uuid'
import User from "./User";
import { sendRequest } from "./Constants";

export default abstract class Offer {

    public static async getWithIDs(offerIDs: string[]) {
        return (await sendRequest('POST', 'getOffersWithIDs', {
            offerIDs: offerIDs
        })) as OfferInfo[]
    }
    public static async getWithItem(itemID: string) {
        return (await sendRequest('POST', 'getOffersWithItem', {
            itemID: itemID
        })) as OfferInfo[]
    }
    public static async getWithUser() {
        return (await sendRequest('POST', 'getOffersWithUser', {})) as OfferInfo[]
    }

    public static async getInfo(offerData: OfferData) {
        const coords = await User.getLocation()
        return (await sendRequest('POST', 'getOfferInfo', {offerData: offerData, coords: coords})) as OfferInfo
    }

    public static async getMeetupLocation(offerData: OfferData) {
        return await sendRequest('POST', 'getOfferMeetupLocation', {offerData: offerData}) as Coords
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
        await sendRequest('POST', 'sendOffer', {offerData: offer})
    }

    public static async accept(offerID: string) {
        await sendRequest('POST', 'acceptOffer', {offerID: offerID})
    }

    public static async reject(offerID: string) {
        await sendRequest('POST', 'rejectOffer', {offerID: offerID})
    }
}