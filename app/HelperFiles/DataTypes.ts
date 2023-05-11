import * as geofire from "geofire-common"
//import keyword_extractor from "keyword-extractor"
import * as pluralize from "pluralize"

// Extracts keywords from a string
export const extractKeywords = (text: string) => {
  // Convert the search text to lowercase, and remove any apostrophes
  let formattedSearch = text.toLowerCase().replace(/’+|'+/gi, "");
  // Seperate the search string into its individual words, based on any non-word characters (anything that isn't 0-9, a-z, A-Z, or _)
  let strings = formattedSearch.split(/\W+/g);
  // Convert plural words into their singular form
  let keywords: string[] = [];
  strings.forEach((string) => {
    let singular: string = pluralize.singular(string);
    if (!(keywords.includes(singular))) {
      keywords.push(singular);
    }
  })
  // Get significant keywords
  /*const formattedText = keywords.join(' ')
  keywords = keyword_extractor.extract(formattedText, {
    language: "english",
    remove_digits: true,
    remove_duplicates: true,
    return_changed_case: true,
  })*/
  return keywords
}

export const getItemKeywords = (item: ItemData) => {
  const fullText = [
    item.name,
    item.category,
    item.gender,
    item.country,
    item.region
  ].concat(item.styles).join(' ')
  return extractKeywords(fullText)
}

export const countriesList = ["canada", "united_states"] as const
export type Country = (typeof countriesList)[number] | ""

export const regionsList = [
  "alberta",
  "british_columbia",
  "manitoba",
  "new_brunswick",
  "newfoundland_and_labrador",
  "northwest_territories",
  "nova_scotia",
  "nunavut",
  "ontario",
  "prince_edward_island",
  "quebec",
  "saskatchewan",
  "yukon",
  "alabama",
  "alaska",
  "arizona",
  "arkansas",
  "california",
  "colorado",
  "connecticut",
  "delaware",
  "florida",
  "georgia",
  "hawaii",
  "idaho",
  "illinois",
  "indiana",
  "iowa",
  "kansas",
  "kentucky",
  "louisana",
  "maine",
  "maryland",
  "massachusetts",
  "michigan",
  "minnesota",
  "mississippi",
  "missouri",
  "montana",
  "nebraska",
  "nevada",
  "new_hampshire",
  "new_jersey",
  "new_mexico",
  "new_york",
  "north_carolina",
  "north_dakota",
  "ohio",
  "oklahoma",
  "oregon",
  "pennsylvania",
  "rhode_island",
  "south_carolina",
  "south_dakota",
  "tennessee",
  "texas",
  "utah",
  "vermont",
  "virginia",
  "washington",
  "west_virginia",
  "wisconsin",
  "wyoming"
] as const
export type Region = (typeof regionsList)[number] | ""

export type ShippingInfo = {
    name: string,
    streetAddress: string,
    city: string,
    region: string | null,
    country: string,
    postalCode: string,
    apartment: string | null,
    message: string | null,
}

export const DefaultShippingInfo: Readonly<ShippingInfo> = {
  name: "",
  streetAddress: "",
  city: "",
  region: null,
  country: "",
  postalCode: "",
  apartment: null,
  message: null,
}

export type OrderStatus = "accepted" | "cancelled" | "completed" | "received"
export type DeliveryType = "exchange" | "shipping"

export type OrderData = {
  sellerID: string,
  buyerID: string,
  orderID: string,
  subtotalPrice: number,
  totalPrice: number,
  shippingInfo?: ShippingInfo,
  deliveryMethod: DeliveryType,
  deliveryPrice: number,
  creationTime: string,
  completionTime: string | null,
  status: OrderStatus
}

export type NotificationData = {
  userID: string,
  message: string,
  imageURL?: string
}

export const UserGenders = ["female", "male", "non-binary"] as const
export type UserGender = (typeof UserGenders)[number]

export type UserData = {
  userID: string,
  name: string,
  email: string,
  gender: UserGender,
  birthDay: string,
  birthMonth: string,
  birthYear: string,
  country: Country,
  region: Region,
  lat: number,
  long: number,
  expoPushToken: string | null
}

export const DefaultUserData: Readonly<UserData> = {
  userID: "",
  name: "",
  email: "",
  gender: "male",
  birthDay: "",
  birthMonth: "",
  birthYear: "",
  country: "",
  region: "",
  lat: 0,
  long: 0,
  expoPushToken: null
}

export const validateUserData = (userData: UserData) => {
  for (const key of Object.keys(DefaultUserData) as (keyof UserData)[]) {
      if (key === "userID" || key === "region") {
        continue
      }
      if (userData[key] === undefined || userData[key] === "") {
          return false
      }
  }
  try {
      geofire.validateLocation([
          userData.lat,
          userData.long
      ])
  } catch (e) {
      return false
  }
  const date = Date.parse(`${userData.birthYear}-${userData.birthMonth}-${userData.birthDay}`)
  if (isNaN(date)) {
    return false
  }
  // Get number of days between today and birthday
  const timeDiff = ((new Date()).getTime() - date)/(86400000);
  return (
      userData.name.length > 0 &&
      /^[a-z0-9\.\_\-]+@[a-z0-9\.\-]+\.[a-z0-9]+$/m.test(userData.email.toLowerCase()) &&
      // Check if this birthday is more than 13 years old (365.24*13=4748.12)
      timeDiff >= 4748.12
  )
}

export type Coords = {
  lat: number,
  long: number
}

export const percentFee = 10
export const dollarFee = 1
export const maxFee = 10
export const percentIncrease = 5
export const dollarIncrease = 2

export type ItemPriceData = {
  minPrice: number,
  basePrice: number,
  feePrice: number,
  facePrice: number,
  lastBasePrice: number,
  lastFeePrice: number,
  lastFacePrice: number
}
export const ItemCategories = [
  "top",
  "bottom",
  "dress",
  "outerwear",
  "accessory",
  "jewelry",
  "shoes",
  "other"
] as const
export type ItemCategory = (typeof ItemCategories)[number] | ""

export const ItemGenders = ["women", "men", "unisex"] as const
export type ItemGender = (typeof ItemGenders)[number] | ""

export const ItemFits = ["small", "proper", "large"] as const
export type ItemFit = (typeof ItemFits)[number] | ""

export const ItemConditions = ["new", "good", "fair", "poor"] as const
export type ItemCondition = (typeof ItemConditions)[number] | ""

export const DeliveryMethods = ["pickup", "meetup", "dropoff"] as const
export type DeliveryMethod = (typeof DeliveryMethods)[number] | ""

export type ItemData = {
  userID: string,
  itemID: string,
  offerIDs: string[],
  name: string,
  description: string,
  priceData: ItemPriceData,
  category: ItemCategory,
  gender: ItemGender,
  size: string,
  fit: ItemFit,
  condition: ItemCondition,
  images: string[],
  country: Country,
  region: Region,
  deliveryMethods: DeliveryMethod[],
  styles: string[],
  keywords: string[],
  viewCount: number,
  likeCount: number,
  favCount: number,
  isVisible: boolean,
}

export const DefaultItemData: Readonly<ItemData> = {
  userID: "",
  itemID: "",
  offerIDs: [],
  name: "",
  description: "",
  priceData: {
    minPrice: 0,
    basePrice: 0,
    feePrice: dollarFee,
    facePrice: dollarFee,
    lastBasePrice: 0,
    lastFeePrice: dollarFee,
    lastFacePrice: dollarFee
  },
  category: "",
  gender: "",
  size: "",
  fit: "",
  condition: "",
  images: [],
  country: "",
  region: "",
  deliveryMethods: [],
  styles: [],
  keywords: [],
  viewCount: 0,
  likeCount: 0,
  favCount: 0,
  isVisible: true
}

export type ItemInfo = {
  item: ItemData,
  distance: number | null,
  viewTime: number | null,
  likeTime: number | null,
  favTime: number | null,
  likePrice: number | null
}

export type ItemFilter = {
  distanceInKM?: number,
  category?: ItemCategory[],
  size?: string[],
  condition?: ItemCondition[],
  keywords?: string[],
  gender?: ItemGender[],
  priceRange?: number[],
  country?: Country,
  region?: Region,
  deliveryMethods?: DeliveryMethod[],
  limit?: number
}

export const DefaultItemFilter: ItemFilter = {
  distanceInKM: 5,
  limit: 10
}

export type ItemFilterKey = keyof ItemFilter

export type ItemInteraction = {
  userID: string,
  itemID: string,
  distance: number,
  viewTime: number,
  likeTime: number,
  favTime: number,
  likePrice: number
}

export type OfferResponse = 'accepted' | 'rejected'

export type OfferData = {
  offerID: string,
  fromID: string,
  toID: string,
  fromName: string,
  toName: string,
  fromPayment: number,
  toPayment: number,
  offerTime: number,
  responseType: OfferResponse | null,
  responseTime: number | null,
  counterOfferID: string | null,
  exchangeID: string | null
}

export type OfferInfo = {
  offer: OfferData,
  fromItems: ItemInfo[],
  toItems: ItemInfo[]
}

export type ExchangeData = {
  exchangeID: string,
  userID1: string,
  userID2: string,
  offerID: string,
  deliveryLat: number | null,
  deliveryLong: number | null,
  deliveryAddress: string | null,
  deliveryPlannedTime: number | null,
  deliveryActualTime: number | null,
  stripePaymentID: string | null,
  cancelled: boolean
}