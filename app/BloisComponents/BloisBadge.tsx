import { Component } from "react";
import { LayoutRectangle, Text, View, ViewStyle } from "react-native";
import { colors, styVals, textStyles } from "../HelperFiles/StyleSheet";

type BloisBadgeProps = {
    number: number;
    posY?: "right" | "left";
    style?: ViewStyle;
};

type State = {};

export default class BloisBadge extends Component<BloisBadgeProps, State> {
    layout: LayoutRectangle | null = null;

    render() {
        const text =
            this.props.number < 100 ? this.props.number.toString() : "99+";
        const posY = this.props.posY || "right";
        return (
            <View
                style={{
                    position: "absolute",
                    top: -styVals.mediumPadding,
                    left:
                        posY === "left"
                            ? -styVals.mediumPadding
                            : undefined,
                    right:
                        posY === "right"
                            ? -styVals.mediumPadding
                            : undefined,
                    overflow: "visible",
                }}
            >
                <View
                    style={{
                        backgroundColor: colors.invalid,
                        alignItems: "center",
                        justifyContent: "center",
                        paddingHorizontal: styVals.minorPadding * 1.5,
                        paddingVertical: styVals.minorPadding / 2,
                        minWidth: this.layout
                            ? this.layout.height
                            : styVals.smallHeight * 0.65,
                        borderRadius: this.layout
                            ? this.layout.height / 2
                            : 300,
                        overflow: "hidden",
                    }}
                    onLayout={(e) => {
                        this.layout = e.nativeEvent.layout;
                        this.setState({});
                    }}
                >
                    <Text
                        style={{
                            ...textStyles.small,
                            color: colors.white,
                            width: "100%",
                        }}
                    >
                        {text}
                    </Text>
                </View>
            </View>
        );
    }
}
