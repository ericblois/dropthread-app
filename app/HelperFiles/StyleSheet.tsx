import { Dimensions, StyleSheet } from "react-native";
import { initialWindowMetrics } from "react-native-safe-area-context";

const displayWidth = initialWindowMetrics
  ? initialWindowMetrics.frame.width
  : Dimensions.get("window").width;
const displayHeight = initialWindowMetrics
  ? initialWindowMetrics.frame.height
  : Dimensions.get("window").height;

const winWidth = initialWindowMetrics
  ? displayWidth - initialWindowMetrics.insets.left - initialWindowMetrics.insets.right
  : displayWidth;
const winHeight = initialWindowMetrics
  ? displayHeight - initialWindowMetrics.insets.bottom - initialWindowMetrics.insets.top
  : displayHeight;

export const topInset = initialWindowMetrics?.insets.top ? initialWindowMetrics!.insets.top : 0
export const bottomInset = initialWindowMetrics?.insets.bottom ? initialWindowMetrics!.insets.bottom : 0

//Calculate standard unit of screen size
const winRatio = winWidth / (winHeight - topInset - bottomInset)
const screenUnit = winRatio > 9/16 ? ((9/16)/winRatio) * winWidth / 20 : winWidth / 10

// --- Load fonts ---

export const fonts = {
  regular: "MontserratRegular",
  medium: "MontserratMedium",
  italic: "RubikItalic",
  bold: "RubikBold",
}

export const colors = {
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
  background: "#eee",
  majorTextColor: "#000",
  mediumTextColor: "#555",
  minorTextColor: "#777",
}

export const styleValues = {
  winHeight: winHeight,
  winWidth: winWidth,
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
  largestTextSize: screenUnit*5/3,
  largerTextSize: screenUnit*5/4,
  largeTextSize: screenUnit*9/8,
  mediumTextSize: screenUnit,
  smallTextSize: screenUnit*5/6,
  smallerTextSize: screenUnit*5/7,
  smallestTextSize: screenUnit*5/8,
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
    width: styleValues.winWidth - styleValues.mediumPadding*2,
    height: styleValues.mediumHeight,
    position: "absolute",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    alignSelf: "center",
    borderRadius: styleValues.mediumPadding,
    padding: styleValues.mediumPadding,
    backgroundColor: colors.white,
    bottom: bottomInset + styleValues.mediumPadding,
  }
})

export const textStyles = StyleSheet.create({
  smaller: {
    ...defaultTemplates.text,
    fontSize: styleValues.smallerTextSize,
  },
  small: {
    ...defaultTemplates.text,
    fontSize: styleValues.smallTextSize,
  },
  medium: {
    ...defaultTemplates.text,
    fontSize: styleValues.mediumTextSize,
  },
  large: {
    ...defaultTemplates.text,
    fontSize: styleValues.largeTextSize,
  },
  larger: {
    ...defaultTemplates.text,
    fontSize: styleValues.largerTextSize,
  },
  largest: {
    ...defaultTemplates.text,
    fontSize: styleValues.largestTextSize,
  },
  smallerHeader: {
    ...defaultTemplates.text,
    fontSize: styleValues.smallerTextSize,
    marginVertical: styleValues.mediumPadding
  },
  smallHeader: {
    ...defaultTemplates.text,
    fontSize: styleValues.smallTextSize,
    marginVertical: styleValues.mediumPadding
  },
  mediumHeader: {
    ...defaultTemplates.text,
    fontSize: styleValues.mediumTextSize,
    marginVertical: styleValues.mediumPadding
  },
  largeHeader: {
    ...defaultTemplates.text,
    fontSize: styleValues.largeTextSize,
    marginVertical: styleValues.mediumPadding
  },
  largerHeader: {
    ...defaultTemplates.text,
    fontSize: styleValues.largerTextSize,
    marginVertical: styleValues.mediumPadding
  },
  largestHeader: {
    ...defaultTemplates.text,
    fontSize: styleValues.largestTextSize,
    marginVertical: styleValues.mediumPadding
  },
})

export const menuBarStyles = StyleSheet.create({
  lightBox: {
    ...defaultTemplates.menuBar,
    width: styleValues.winWidth,
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
    shadowRadius: styleValues.minorPadding,
    elevation: 5,
  },
  medium: {
    shadowColor: colors.black,
    shadowOffset: {
      width: 0,
      height: 0,
    },
    shadowOpacity: 0.5,
    shadowRadius: styleValues.minorPadding,
    elevation: 10,
  },
  large: {
    shadowColor: colors.black,
    shadowOffset: {
      width: 0,
      height: 0,
    },
    shadowOpacity: 0.75,
    shadowRadius: styleValues.minorPadding,
    elevation: 15,
  },
})

export const defaults = StyleSheet.create({
  pageContainer: {
    alignItems: "center",
    justifyContent: "flex-start",
    alignSelf: "center",
    width: displayWidth,
    height: displayHeight,
    top: 0,
    left: 0,
    paddingTop: topInset + styleValues.mediumPadding,
    paddingBottom: bottomInset + styleValues.mediumPadding,
    paddingHorizontal: styleValues.mediumPadding,
    backgroundColor: colors.background,
  },
  headerBox: {
    ...shadowStyles.small,
    height: topInset + styleValues.mediumPadding*2 + styleValues.largeTextSize*4/3,
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    alignItems: "center",
    backgroundColor: colors.background,
    padding: styleValues.mediumPadding,
    paddingTop: topInset + styleValues.mediumPadding,
    zIndex: 100,
    elevation: 100
  },
  roundedBox: {
    width: "100%",
    height: styleValues.smallHeight,
    borderRadius: styleValues.mediumPadding,
    backgroundColor: colors.white,
    padding: styleValues.mediumPadding,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: styleValues.mediumPadding
  },
  inputBox: {
    width: "100%",
    height: screenUnit*2,
    backgroundColor: colors.white,
    borderWidth: styleValues.mediumBorderWidth,
    borderRadius: styleValues.mediumPadding,
    borderColor: colors.lighterGrey,
    marginBottom: styleValues.mediumPadding,
    padding: styleValues.minorPadding,
    paddingLeft: styleValues.mediumPadding,
    alignItems: "center",
    justifyContent: "center",
  },
  inputText: {
    ...textStyles.small,
    flex: 1,
    width: "100%",
    height: "100%",
    backgroundColor: colors.white,
    borderRadius: styleValues.mediumPadding,
    color: colors.majorTextColor,
  },
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
  refresh: require("../../assets/refreshIcon.png")
}
