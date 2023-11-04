import { Dimensions, StyleSheet } from "react-native";
import { initialWindowMetrics } from "react-native-safe-area-context";

export const displayWidth = initialWindowMetrics
  ? initialWindowMetrics.frame.width
  : Dimensions.get("window").width;
export const displayHeight = initialWindowMetrics
  ? initialWindowMetrics.frame.height
  : Dimensions.get("window").height;

export const screenWidth = initialWindowMetrics
  ? displayWidth - initialWindowMetrics.insets.left - initialWindowMetrics.insets.right
  : displayWidth;
export const screenHeight = initialWindowMetrics
  ? displayHeight - initialWindowMetrics.insets.bottom - initialWindowMetrics.insets.top
  : displayHeight;

export const topInset = initialWindowMetrics?.insets.top ? initialWindowMetrics!.insets.top : 0
export const bottomInset = initialWindowMetrics?.insets.bottom ? initialWindowMetrics!.insets.bottom : 0

//Calculate standard unit of screen size
export const winRatio = screenWidth / (screenHeight - topInset - bottomInset)
export const screenUnit = winRatio > 9/16 ? ((9/16)/winRatio) * screenWidth / 20 : screenWidth / 10

// --- Load fonts ---

export const fonts = {
  regular: "PoppinsRegular",
  medium: "PoppinsMedium",
  italic: "PoppinsItalic",
  bold: "PoppinsBold",
}

export const colors = {
  transparent: "rgba(255,255,255,0)",
  lightestMain: "#e3fff1",
  lightMain: "#8ee6a6",
  main: "#61c97d",
  darkMain: "#449e5c",
  white: "#fff",
  lightestGrey: "#ddd",
  lighterGrey: "#bbb",
  lightGrey: "#999",
  grey: "#777",
  darkGrey: "#555",
  darkerGrey: "#333",
  black: "#000",
  valid: "#2CB557",
  invalid: "#DD404B",
  yellow: "#FFCF56",
  flame: '#FF6933',
  altBlue: '#306bf0',
  markerBlue: 'rgba(0,0,255,0.5)',
  background: "#eee",
  majorTextColor: "#000",
  mediumTextColor: "#555",
  minorTextColor: "#777",
}

export const styVals = {
  screenHeight: screenHeight,
  screenWidth: screenWidth,
  smallestHeight: screenUnit/2,
  smallerHeight: screenUnit,
  smallHeight: screenUnit*2,
  mediumHeight: screenUnit*3,
  largeHeight: screenUnit*4,
  largerHeight: screenUnit*5,
  largestHeight: screenUnit*6,
  majorPadding: screenUnit,
  mediumPadding: screenUnit/2,
  minorPadding: screenUnit/4,
  minorBorderWidth: screenUnit/20,
  mediumBorderWidth: screenUnit/10,
  majorBorderWidth: screenUnit*1.4/10,
  iconSmallestSize: screenUnit*0.8,
  iconSmallerSize: screenUnit,
  iconSmallSize: screenUnit*1.2,
  iconMediumSize: screenUnit*1.5,
  iconLargeSize: screenUnit*1.8,
  iconLargerSize: screenUnit*2,
  iconLargestSize: screenUnit*5/2,
  iconLargesterSize: screenUnit*3,
  largestTextSize: screenUnit*10/8,
  largerTextSize: screenUnit*9/8,
  largeTextSize: screenUnit*7/8,
  mediumTextSize: screenUnit*6/8,
  smallTextSize: screenUnit*5/8,
  smallerTextSize: screenUnit*4/8,
  smallestTextSize: screenUnit*3/8,
};
// A Text's height will be 1.333x its font size

const defaultTemplates = StyleSheet.create({
  text: {
    fontFamily: fonts.regular,
    textAlign: "center",
    textAlignVertical: "center",
    color: colors.majorTextColor
  },
  menuBar: {
    width: screenWidth - styVals.mediumPadding*2,
    height: styVals.mediumHeight,
    position: "absolute",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    alignSelf: "center",
    borderRadius: styVals.mediumPadding,
    padding: styVals.mediumPadding,
    backgroundColor: colors.background,
    bottom: bottomInset + styVals.mediumPadding,
  }
})

export const textStyles = StyleSheet.create({
  smaller: {
    ...defaultTemplates.text,
    fontSize: styVals.smallerTextSize,
  },
  small: {
    ...defaultTemplates.text,
    fontSize: styVals.smallTextSize,
  },
  medium: {
    ...defaultTemplates.text,
    fontSize: styVals.mediumTextSize,
  },
  large: {
    ...defaultTemplates.text,
    fontSize: styVals.largeTextSize,
  },
  larger: {
    ...defaultTemplates.text,
    fontSize: styVals.largerTextSize,
  },
  largest: {
    ...defaultTemplates.text,
    fontSize: styVals.largestTextSize,
  },
  smallerHeader: {
    ...defaultTemplates.text,
    fontSize: styVals.smallerTextSize,
    marginVertical: styVals.mediumPadding
  },
  smallHeader: {
    ...defaultTemplates.text,
    fontSize: styVals.smallTextSize,
    marginVertical: styVals.mediumPadding
  },
  mediumHeader: {
    ...defaultTemplates.text,
    fontSize: styVals.mediumTextSize,
    marginVertical: styVals.mediumPadding
  },
  largeHeader: {
    ...defaultTemplates.text,
    fontSize: styVals.largeTextSize,
    marginVertical: styVals.mediumPadding
  },
  largerHeader: {
    ...defaultTemplates.text,
    fontSize: styVals.largerTextSize,
    marginVertical: styVals.mediumPadding
  },
  largestHeader: {
    ...defaultTemplates.text,
    fontSize: styVals.largestTextSize,
    marginVertical: styVals.mediumPadding
  },
})

export const menuBarStyles = StyleSheet.create({
  lightBox: {
    ...defaultTemplates.menuBar,
    width: screenWidth,
    borderRadius: 0,
    bottom: 0,
  },
  lightHover: {
    ...defaultTemplates.menuBar,
  }
})

export const shadowStyles = StyleSheet.create({
  small: {
    shadowColor: colors.black,
    shadowOffset: {
      width: 0,
      height: 0,
    },
    shadowOpacity: 0.3,
    shadowRadius: styVals.minorPadding,
    elevation: 5,
  },
  medium: {
    shadowColor: colors.black,
    shadowOffset: {
      width: 0,
      height: 0,
    },
    shadowOpacity: 0.5,
    shadowRadius: styVals.minorPadding,
    elevation: 10,
  },
  large: {
    shadowColor: colors.black,
    shadowOffset: {
      width: 0,
      height: 0,
    },
    shadowOpacity: 0.8,
    shadowRadius: styVals.minorPadding,
    elevation: 15,
  },
})

export const defaultStyles = StyleSheet.create({
  pageContainer: {
    alignItems: "center",
    justifyContent: "flex-start",
    alignSelf: "center",
    position: "absolute",
    top: 0,
    bottom: 0,
    right: 0,
    left: 0,
    paddingTop: topInset + styVals.mediumPadding,
    paddingBottom: bottomInset + styVals.mediumPadding,
    paddingHorizontal: styVals.mediumPadding,
    backgroundColor: colors.background,
  },
  headerBox: {
    ...shadowStyles.medium,
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    alignItems: "center",
    backgroundColor: colors.background,
    padding: styVals.minorPadding,
    paddingTop: topInset + styVals.minorPadding,
    zIndex: 1000,
    elevation: 1000
  },
  roundedBox: {
    width: "100%",
    borderRadius: styVals.mediumPadding,
    backgroundColor: colors.background,
    padding: styVals.mediumPadding,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: styVals.mediumPadding
  },
  inputBox: {
    width: "100%",
    height: screenUnit*2,
    backgroundColor: colors.white,
    borderWidth: styVals.mediumBorderWidth,
    borderRadius: styVals.mediumPadding,
    borderColor: colors.lighterGrey,
    marginBottom: styVals.mediumPadding,
    padding: styVals.minorPadding,
    paddingLeft: styVals.mediumPadding,
    alignItems: "center",
    justifyContent: "center",
  },
  inputText: {
    ...textStyles.medium,
    flex: 1,
    width: "100%",
    height: "100%",
    backgroundColor: colors.background,
    borderRadius: styVals.mediumPadding,
    color: colors.majorTextColor,
  },
  fill: {
    position: "absolute",
    top: 0,
    bottom: 0,
    right: 0,
    left: 0
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center'
  }
});

export const icons = {
  blank: require("../../assets/blankIcon.png"),
  backArrow: require("../../assets/backArrowIcon.png"),
  star: require("../../assets/starIcon.png"),
  hollowStar: require("../../assets/starHollowIcon.png"),
  search: require("../../assets/searchIcon.png"),
  lines: require("../../assets/linesIcon.png"),
  profile: require("../../assets/profileIcon.png"),
  shoppingCart: require("../../assets/shoppingCartIcon.png"),
  document: require("../../assets/documentIcon.png"),
  message: require("../../assets/messageIcon.png"),
  enter: require("../../assets/enterIcon.png"),
  chevron: require("../../assets/leftChevron.png"),
  store: require("../../assets/storeIcon.png"),
  checkBox: require("../../assets/checkBoxIcon.png"),
  uncheckedBox: require("../../assets/uncheckedBoxIcon.png"),
  plus: require("../../assets/plusIcon.png"),
  minus: require("../../assets/minusIcon.png"),
  edit: require("../../assets/editIcon.png"),
  location: require("../../assets/locationIcon.png"),
  crosshair: require("../../assets/crosshairIcon.png"),
  image: require("../../assets/imageIcon.png"),
  trash: require("../../assets/trashIcon.png"),
  info: require("../../assets/infoIcon.png"),
  cross: require("../../assets/crossIcon.png"),
  exclamation: require("../../assets/exclamationIcon.png"),
  shoppingBag: require("../../assets/shoppingBagIcon.png"),
  closet: require("../../assets/closetIcon.png"),
  hollowHeart: require("../../assets/hollowHeartIcon.png"),
  refresh: require("../../assets/refreshIcon.png"),
  hangers: require("../../assets/hangersIcon.png")

}
