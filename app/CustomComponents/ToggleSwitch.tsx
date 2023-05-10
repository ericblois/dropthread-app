import React from "react";
import { StyleSheet, Text, TextStyle, View, ViewStyle, Switch } from "react-native";
import { colors, defaultStyles, screenWidth, shadowStyles, styleValues, textStyles } from "../HelperFiles/StyleSheet";
import CustomComponent from "./CustomComponent";

type ToggleSwitchProps = {
    style?: ViewStyle,
    text?: string,
    textStyle?: TextStyle,
    textProps?: Text["props"],
    switchStyle?: ViewStyle,
    switchProps?: Switch['props'],
    shadow?: boolean,
    onToggle?: (value: boolean) => void
}

type State = {
    switchValue: boolean
}

export default class ToggleSwitch extends CustomComponent<ToggleSwitchProps, State> {

    constructor(props: ToggleSwitchProps) {
        super(props)
        this.state = {
            switchValue: false
        }
    }

    renderText() {
        if (this.props.text) {
            return (
                <Text
                    style={{...textStyles.medium, ...this.props.textStyle}}
                >
                    {this.props.text}
                </Text>
            )
        }
    }

  render() {
    return (
        <View
            style={{
                ...defaultStyles.roundedBox,
                ...styles.container,
                ...(this.props.shadow !== false ? shadowStyles.small : undefined),
                ...this.props.style
            }}
        >
            {this.props.children}
            {this.renderText()}
            <Switch
                style={{...styles.switch, ...this.props.switchStyle}}
                value={this.state.switchValue}
                trackColor={{
                    true: colors.main,
                    false: colors.darkGrey
                }}
                onValueChange={(value) => {
                    this.setState({switchValue: value})
                    if (this.props.onToggle) {
                        this.props.onToggle(value)
                    }
                }}
                {...this.props.switchProps}
            />
        </View>
    )
  }
}

const styles = StyleSheet.create({
    container: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        width: "100%",
        height: screenWidth*0.125,
        padding: styleValues.minorPadding,
        paddingHorizontal: styleValues.mediumPadding,
        borderRadius: styleValues.mediumPadding
    },
    switch: {

    },
})
