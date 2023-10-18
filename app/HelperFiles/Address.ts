import { sendRequest } from './Constants'
import { AddressData } from './DataTypes'

export default abstract class Address {

    // Get the data of the current user
    static async getAddresses() {
        return await sendRequest('POST', "getUserAddresses", {}) as AddressData[]
    }

    // Get the data of the current user
    static async create(address: AddressData) {
        return await sendRequest('POST', "createUserAddress", {
            address: address
        }) as void
    }

    public static maxNameLength = 50
    public static maxValueLength = 100

    public static validateProperty(key: keyof AddressData, value: any) {
        switch (key) {
            case "name":
                if (!value || value === "" || (value as string).length > Address.maxNameLength) return false
                break
            case "streetAddress":
                return !!value && value.length > 0 && value.length <= Address.maxValueLength
            case "city":
                return !!value && value.length > 0 && value.length <= Address.maxValueLength
            case "country":
                return !!value && value.length > 0 && value.length <= Address.maxValueLength
            case "postalCode":
                return !!value && value.length > 0 && value.length <= Address.maxValueLength
            case "lat":
                return value !== undefined && value !== null && value !== 0
            case "long":
                return value !== undefined && value !== null && value !== 0
            case "userID":
                return !!value && value.length > 0
            default:
                break
        }
        return true
    }

    public static validate(item: AddressData) {
        for (const key of Object.keys(item)) {
            if (!Address.validateProperty(key as keyof AddressData, item[key as keyof AddressData])) {
                return false
            }
        }
        return true
    }

    public static validatePartial(item: Partial<AddressData>) {
        for (const key of Object.keys(item)) {
            if (!Address.validateProperty(key as keyof AddressData, item[key as keyof AddressData])) {
                return false
            }
        }
        return true
    }

}
