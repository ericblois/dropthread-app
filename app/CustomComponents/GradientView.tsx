import { LinearGradient } from "expo-linear-gradient";
import React from "react";
import { View, ViewStyle } from "react-native";
import { hexToRGBA } from "../HelperFiles/ClientFunctions";
import { colors, defaultStyles, styVals } from "../HelperFiles/StyleSheet";
import CustomComponent from "./CustomComponent";

type GradientViewProps = {
    style?: ViewStyle,
    fadeTop?: boolean,
    fadeBottom?: boolean,
    fadeStartColor?: string,
    backgroundStartColor?: string,
    fadeEndColor?: string,
    backgroundEndColor?: string,
    fadeLength?: number,
    horizontal?: boolean
}

type State = {}

export default class GradientView extends CustomComponent<GradientViewProps, State> {

    fadeLength: number

    constructor(props: GradientViewProps) {
        super(props)
        this.fadeLength = props.fadeLength ? props.fadeLength : styVals.mediumPadding
    }

    renderTopFade(startColor: string, startBackground: string) {
        if (this.props.fadeTop !== false) {
            return (
                <LinearGradient
                    colors={[startColor, startBackground]}
                    locations={[0.2, 1]}
                    start={this.props.horizontal === true ? {x: 0, y: 0.5} : undefined}
                    end={this.props.horizontal === true ? {x: 1, y: 0.5} : undefined}
                    style={{
                        width: this.props.horizontal === true ? this.fadeLength : "100%",
                        height: this.props.horizontal === true ? "100%" : this.fadeLength
                    }}
                />
            )
        }
    }

    renderBottomFade(endColor: string, endBackground: string) {
        if (this.props.fadeBottom !== false) {
            return (
                <LinearGradient
                    colors={[endBackground, endColor]}
                    locations={[0, 0.8]}
                    start={this.props.horizontal === true ? {x: 0, y: 0.5} : undefined}
                    end={this.props.horizontal === true ? {x: 1, y: 0.5} : undefined}
                    style={{
                        width: this.props.horizontal === true ? this.fadeLength : "100%",
                        height: this.props.horizontal === true ? "100%" : this.fadeLength
                    }}
                />
            )
        }
    }

    render() {
        const startColor = this.props.fadeStartColor ? this.props.fadeStartColor : colors.background
        const startBackground = this.props.backgroundStartColor ? hexToRGBA(this.props.backgroundStartColor, 0) : hexToRGBA(colors.background, 0)
        const endColor = this.props.fadeEndColor ? this.props.fadeEndColor : colors.background
        const endBackground = this.props.backgroundEndColor ? hexToRGBA(this.props.backgroundEndColor, 0) : hexToRGBA(colors.background, 0)
        return (
            <View
                style={{
                    ...defaultStyles.fill,
                    flexDirection: this.props.horizontal === true ? "row" : "column",
                    justifyContent: "space-between",
                    borderRightColor: endColor,
                    borderLeftColor: startColor,
                    borderTopColor: startColor,
                    borderBottomColor: endColor,
                    ...this.props.style
                }}
                onStartShouldSetResponder={() => (false)}
                pointerEvents={"none"}
            >
                {this.renderTopFade(startColor, startBackground)}
                <View/>
                {this.renderBottomFade(endColor, endBackground)}
            </View>
        )
    }
}
