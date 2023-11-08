import {
    LayoutRectangle,
    StyleSheet,
    Text,
    View,
    ViewStyle,
} from "react-native";
import { capitalizeWords } from "../HelperFiles/ClientFunctions";
import { currencyFormatter } from "../HelperFiles/Constants";
import {
    ItemColorValues,
    ItemCondition,
    ItemInfo,
} from "../HelperFiles/DataTypes";
import Item from "../HelperFiles/Item";
import {
    colors,
    defaultStyles,
    screenUnit,
    shadowStyles,
    styVals,
    textStyles,
} from "../HelperFiles/StyleSheet";
import CustomComponent from "./CustomComponent";
import ImageSlider from "./ImageSlider";
import LoadingCover from "./LoadingCover";
import * as Icons from "@expo/vector-icons";
import { StackNavigationProp } from "@react-navigation/stack";
import { UserMainStackParamList } from "../HelperFiles/Navigation";
import BloisIconButton from "../BloisComponents/BloisIconButton";
import User from "../HelperFiles/User";
import { BloisTextButton } from "../HelperFiles/CompIndex";
import BloisScrollable from "../BloisComponents/BloisScrollable";

type Props = {
    navigation?: StackNavigationProp<UserMainStackParamList>;
    itemInfo: ItemInfo;
    style?: ViewStyle;
    onLoadEnd?: () => void;
    onPressCard?: () => void;
    onPressLike?: (isLiked: boolean) => void;
    hideButtons?: boolean;
};

type State = {
    itemInfo: ItemInfo;
    imageLoaded: boolean;
};

const conditionColors: Record<ItemCondition, string> = {
    "": colors.black,
    poor: colors.invalid,
    fair: colors.yellow,
    good: colors.valid,
    new: colors.valid,
};

const conditionIcons: Record<
    ItemCondition,
    "close-circle" | "minus-circle" | "check-circle"
> = {
    "": "minus-circle",
    poor: "close-circle",
    fair: "minus-circle",
    good: "check-circle",
    new: "check-circle",
};

export default class ItemLargeCard extends CustomComponent<Props, State> {
    styleTagsLayout: LayoutRectangle | null = null;

    constructor(props: Props) {
        super(props);
        this.state = {
            itemInfo: props.itemInfo,
            imageLoaded: false,
        };
    }

    renderClosetButton() {
        if (this.props.hideButtons !== true) {
            return (
                <BloisIconButton
                    icon={{
                        type: "MaterialCommunityIcons",
                        name: 'hanger',
                    }}
                    style={{
                        width: styVals.iconLargestSize,
                        borderRadius: styVals.iconLargestSize,
                        borderTopRightRadius: styVals.mediumPadding,
                        marginBottom: styVals.mediumPadding
                    }}
                    iconStyle={{color: colors.darkGrey}}
                    onPress={async () => {
                        if (this.props.navigation) {
                            this.props.navigation.navigate("viewItems", {
                                getItems: async () => await Item.getFromUser(this.state.itemInfo.item.userID)
                            });
                        }
                    }}
                />
            );
        }
    }

    renderLikeButton() {
        if (this.props.hideButtons !== true) {
            return (
                <BloisIconButton
                    icon={{
                        type: "FontAwesome",
                        name:
                            this.state.itemInfo.likePrice &&
                            this.state.itemInfo.likePrice >=
                                this.state.itemInfo.item.priceData.basePrice
                                ? "heart"
                                : "heart-o",
                    }}
                    style={{
                        width: styVals.mediumHeight*1.2,
                        borderRadius: styVals.mediumHeight,
                        borderBottomRightRadius: styVals.mediumPadding,
                        marginBottom: styVals.mediumPadding,
                        marginLeft: styVals.mediumPadding,
                        padding: styVals.mediumPadding*1.5,
                    }}
                    iconStyle={{
                        color:
                            this.state.itemInfo.likePrice &&
                            this.state.itemInfo.likePrice >=
                                this.state.itemInfo.item.priceData.basePrice
                                ? colors.valid
                                : colors.lightGrey,
                    }}
                    onPress={() => {
                        // Unlike
                        if (
                            this.state.itemInfo.likePrice &&
                            this.state.itemInfo.likePrice >=
                                this.state.itemInfo.item.priceData.basePrice
                        ) {
                            const newItemInfo: ItemInfo = {
                                ...this.state.itemInfo,
                                likeTime: null,
                                likePrice: null,
                            };
                            this.setState({ itemInfo: newItemInfo });
                            Item.unlike(this.state.itemInfo).then(() => {
                                Item.getFromIDs(
                                    [this.state.itemInfo.item.itemID],
                                    true
                                ).then((itemInfos) => {
                                    this.setState(
                                        { itemInfo: itemInfos[0] },
                                        () => {
                                            let bla = "k";
                                        }
                                    );
                                });
                            });
                            if (this.props.onPressLike) {
                                this.props.onPressLike(false);
                            }
                        } // Like
                        else {
                            const newItemInfo: ItemInfo = {
                                ...this.state.itemInfo,
                                likeTime: Date.now(),
                                likePrice:
                                    this.state.itemInfo.item.priceData
                                        .basePrice,
                            };
                            this.setState({ itemInfo: newItemInfo });
                            Item.like(this.state.itemInfo);
                            if (this.props.onPressLike) {
                                this.props.onPressLike(true);
                            }
                        }
                    }}
                />
            );
        }
    }

    renderHeaderInfo() {
        return (
            <View>
                {/* Name, price */}
                <View
                    style={{
                        paddingBottom: styVals.mediumPadding,
                        marginBottom: styVals.mediumPadding,
                        borderBottomWidth: screenUnit * 0.05,
                        borderColor: colors.lightGrey,
                    }}
                >
                    <View style={{ flexDirection: "row" }}>
                        <Text
                            style={{
                                ...styles.headerText,
                                flex: 1,
                                marginRight: styVals.mediumPadding * 2,
                            }}
                            numberOfLines={2}
                        >
                            {this.state.itemInfo.item.name}
                        </Text>
                        <Text
                            style={{
                                ...textStyles.larger,
                                textAlign: "right",
                            }}
                        >
                            {currencyFormatter.format(
                                this.state.itemInfo.item.userID ==
                                    User.getCurrent().uid
                                    ? this.state.itemInfo.item.priceData
                                          .basePrice
                                    : this.state.itemInfo.item.priceData
                                          .facePrice
                            )}
                        </Text>
                    </View>
                    {/* Gender / category, distance */}
                    <View
                        style={{
                            flexDirection: "row",
                            justifyContent: "space-between",
                        }}
                    >
                        <Text style={{ ...styles.minorText }}>
                            {capitalizeWords(
                                `${
                                    this.state.itemInfo.item.gender !== "unisex"
                                        ? this.state.itemInfo.item.gender + `'s`
                                        : ``
                                } ${
                                    this.state.itemInfo.item.category !==
                                    "other"
                                        ? this.state.itemInfo.item.category
                                        : ""
                                }`
                            )}
                        </Text>
                        <Text
                            style={{
                                ...styles.minorText,
                                textAlign: "right",
                            }}
                        >{`within ${this.state.itemInfo.distance} km`}</Text>
                    </View>
                </View>
            </View>
        );
    }

    renderLowerBox() {
        return (
            <View style={{ flexDirection: "row", flex: 1 }}>
                {/* Info area */}
                <View style={{ flex: 1 }}>
                    <View style={{ flexDirection: "row" }}>
                        {/* Size and fit */}
                        <View
                            style={{
                                flexDirection: "row",
                                alignItems: "center",
                                marginBottom: styVals.mediumPadding,
                                marginRight: styVals.mediumPadding,
                            }}
                        >
                            <Icons.MaterialCommunityIcons
                                name={"ruler"}
                                style={{
                                    fontSize: styVals.iconSmallSize,
                                    color: colors.grey,
                                    marginRight: styVals.minorPadding,
                                }}
                            />
                            <Text style={styles.minorText}>{`${capitalizeWords(
                                this.state.itemInfo.item.size
                            )}${
                                this.state.itemInfo.item.fit !== "proper"
                                    ? ` (Fits ${this.state.itemInfo.item.fit})`
                                    : ``
                            }`}</Text>
                        </View>
                        {/* Condition */}
                        <View
                            style={{
                                flexDirection: "row",
                                alignItems: "center",
                                marginBottom: styVals.minorPadding,
                            }}
                        >
                            <Icons.AntDesign
                                name={"tago"}
                                style={{
                                    fontSize: styVals.iconSmallSize,
                                    color: colors.grey,
                                    marginRight: styVals.minorPadding,
                                }}
                            />
                            <Text style={styles.minorText}>{`${capitalizeWords(
                                this.state.itemInfo.item.condition
                            )} condition`}</Text>
                        </View>
                        <Icons.MaterialCommunityIcons
                            name="fire"
                            style={{
                                fontSize: styVals.iconMediumSize,
                                color: colors.flame,
                                marginRight: styVals.minorPadding,
                            }}
                        />
                    </View>
                    {/* Description */}
                    <BloisScrollable
                        style={{
                            flex: 1,
                            marginBottom: styVals.mediumPadding,
                            overflow: 'hidden'
                        }}
                    >
                        <Text>{this.state.itemInfo.item.description}</Text>
                    </BloisScrollable>
                </View>
                {/* Like button */}
                <View style={{ justifyContent: "space-between", alignItems: 'flex-end' }}>
                    {this.renderClosetButton()}
                    {this.renderLikeButton()}
                </View>
            </View>
        );
    }

    renderUI() {
        return (
            <>
                <ImageSlider
                    uris={this.state.itemInfo.item.images}
                    style={{ borderRadius: styVals.mediumPadding }}
                    minRatio={1}
                    maxRatio={1.5}
                    fadeColor={colors.background}
                    onImagesLoaded={() => {
                        this.setState({ imageLoaded: true }, () => {
                            if (this.props.onLoadEnd) {
                                this.props.onLoadEnd();
                            }
                        });
                    }}
                />
                {/*  */}
                <View
                    removeClippedSubviews={true}
                    style={styles.itemInfoContainer}
                >
                    {this.renderHeaderInfo()}
                    {this.renderLowerBox()}
                </View>
            </>
        );
    }

    renderLoading() {
        if (this.state.itemInfo.item === undefined || !this.state.imageLoaded) {
            return <LoadingCover style={{ backgroundColor: colors.white }} />;
        }
    }

    render() {
        return (
            <View style={{ ...styles.cardContainer, ...this.props.style }}>
                {this.renderUI()}
                {this.renderLoading()}
            </View>
        );
    }
}

export const styles = StyleSheet.create({
    cardContainer: {
        ...shadowStyles.small,
        backgroundColor: colors.background,
        borderRadius: styVals.mediumPadding,
        height: "100%",
        width: "100%",
    },
    itemInfoContainer: {
        flex: 1,
        width: "100%",
        paddingHorizontal: styVals.mediumPadding,
    },
    headerText: {
        ...textStyles.large,
        marginBottom: styVals.minorPadding,
        textAlign: "left",
    },
    majorText: {
        ...textStyles.medium,
        textAlign: "left",
    },
    minorText: {
        ...textStyles.medium,
        color: colors.darkGrey,
        textAlign: "left",
    },
    infoTextBorder: {
        borderColor: colors.black,
        borderWidth: styVals.mediumBorderWidth,
        borderRadius: styVals.minorPadding,
        padding: styVals.minorPadding / 2,
    },
    likeButton: {
        ...shadowStyles.small,
        width: styVals.iconLargesterSize,
        height: styVals.iconLargesterSize,
        borderRadius: styVals.majorPadding,
        marginBottom: styVals.minorPadding,
    },
});
