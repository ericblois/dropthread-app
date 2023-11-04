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
  ].join(' ')
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

export type AddressData = {
    userID: string | null,
    name: string | null,
    streetAddress: string | null,
    city: string | null,
    region: string | null,
    country: string | null,
    postalCode: string | null,
    apartment: string | null,
    message: string | null,
    lat: number,
    long: number
}

export const DefaultAddressData: Readonly<AddressData> = {
  userID: null,
  name: null,
  streetAddress: null,
  city: null,
  region: null,
  country: null,
  postalCode: null,
  apartment: null,
  message: null,
  lat: 0,
  long: 0
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
export const dollarFee = 2
export const percentIncrease = 5
export const dollarIncrease = 2

export type ItemPriceData = {
  minPrice: number,
  basePrice: number,
  feePrice: number,
  facePrice: number
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

export const ItemColors = [
  "black", "darkGray", "gray", "lightGray", "white",
  "burgundy", "darkBrown", "brown", "beige", "cream",
  "purple", "red", "orange", "yellow", "green",
  "lavender", "pink", "lightBlue", "blue", "navy"
  ] as const
export type ItemColor = (typeof ItemColors)[number]

export const ItemColorValues = {
  black: "#000000",
  darkGray: "#666666",
  gray: "#A0A0A0",
  lightGray: "#e8e8e8",
  white: "#ffffff",
  burgundy: "#900020",
  darkBrown: "#7B3F00",
  beige: "#d2b48c",
  brown: "#B87333",
  cream: "#F3F0DA",
  purple: "#800080",
  red: "#ff0000",
  orange: "#ff8000",
  yellow: "#FFEA00",
  green: "#228B22",
  lavender: "#CF9FFF",
  pink: "#FF69B4",
  lightBlue: "#E0EEFF",
  blue: "#0F52BA",
  navy: "#000080"
}

export const ItemFits = ["small", "proper", "large"] as const
export type ItemFit = (typeof ItemFits)[number] | ""

export const ItemConditions = ["new", "good", "fair", "poor"] as const
export type ItemCondition = (typeof ItemConditions)[number] | ""

export const DeliveryMethods = ["pickup", "meetup", "dropoff"] as const
export type DeliveryMethod = (typeof DeliveryMethods)[number] | ""

export type ItemData = {
  userID: string,
  itemID: string,
  name: string,
  description: string,
  priceData: ItemPriceData,
  category: ItemCategory,
  gender: ItemGender,
  size: string,
  colors: ItemColor[],
  fit: ItemFit,
  condition: ItemCondition,
  images: string[],
  country: Country,
  region: Region,
  keywords: string[],
  viewCount: number,
  likeCount: number,
  favCount: number,
  isVisible: boolean,
}

export const DefaultItemData: Readonly<ItemData> = {
  userID: "",
  itemID: "",
  name: "",
  description: "",
  priceData: {
    minPrice: 0,
    basePrice: 0,
    feePrice: dollarFee,
    facePrice: dollarFee
  },
  category: "",
  gender: "",
  size: "",
  colors: [],
  fit: "proper",
  condition: "",
  images: [],
  country: "",
  region: "",
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
  likePrice: number | null,
  loadTime: number
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

export type ItemPriceHistory = {
  changeID: number,
  itemID: string,
  minPrice: number,
  basePrice: number,
  feePrice: number,
  facePrice: number,
  timestamp: number,
  likeUserID: string | null
}

export type OfferResponse = 'accepted' | 'rejected' | 'cancelled' | 'countered'

export type OfferData = {
  offerID: string,
  fromUserID: string,
  toUserID: string,
  fromName: string,
  toName: string,
  // All items involved in the offer (pricing can be figured out from itemIDs)
  itemIDs: string[],
  offerTime: number,
  responseType: OfferResponse | null,
  responseTime: number | null,
  deliveryMethod: DeliveryMethod,
  deliveryAddress: AddressData | null,
  exchangeID: string | null
}

export type OfferInfo = {
  offer: OfferData,
  fromItemInfos: ItemInfo[],
  toItemInfos: ItemInfo[],
  fromBasePrice: number,
  toBasePrice: number,
  fromFeePrice: number,
  toFeePrice: number,
  fromFacePrice: number,
  toFacePrice: number
}

export type ExchangeData = {
  exchangeID: string,
  offerID: string,
  status: 'pending' | 'cancelled' | 'completed',
  plannedDeliveryTime: number | null,
  completionTime: number | null,
  completionImage: string | null
}