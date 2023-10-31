import React from "react";
import {
    StyleSheet,
    Text,
    TextStyle,
    View,
    ViewStyle,
    Switch,
    TextProps,
    SwitchProps,
} from "react-native";
import {
    colors,
    defaultStyles,
    screenWidth,
    shadowStyles,
    styleValues,
    textStyles,
} from "../HelperFiles/StyleSheet";
import CustomComponent from "../CustomComponents/CustomComponent";
import CustomModal from "../CustomComponents/CustomModal";
import BloisIconButton from "./BloisIconButton";

type ToggleSwitchProps = {
    text: string;
    defaultValue?: boolean;
    style?: ViewStyle;
    textStyle?: TextStyle;
    textProps?: TextProps;
    switchStyle?: ViewStyle;
    switchProps?: SwitchProps;
    shadow?: boolean;
    info?: {
        header: string;
        body: string;
    };
    onToggle?: (value: boolean) => void;
};

type State = {
    switchValue: boolean;
    switchHeight: number;
    infoActive: boolean;
};

export default class BloisToggle extends CustomComponent<
    ToggleSwitchProps,
    State
> {
    constructor(props: ToggleSwitchProps) {
        super(props);
        this.state = {
            switchValue: props.defaultValue || false,
            switchHeight: -1,
            infoActive: false,
        };
    }

    renderInfo() {
        if (this.props.info) {
            return (
                <BloisIconButton
                    icon={{
                        type: "Ionicons",
                        name: "information-circle-outline",
                    }}
                    animType={"opacity"}
                    style={{
                        width: styleValues.iconMediumSize,
                        marginRight: styleValues.minorPadding,
                    }}
                    onPress={() => this.setState({ infoActive: true })}
                />
            );
        }
    }

    render() {
        let switchScale = 0.75;
        if (this.state.switchHeight > 0) {
            switchScale =
                (styleValues.smallHeight - styleValues.minorPadding * 2.5) /
                this.state.switchHeight;
        }
        return (
            <View
                style={{
                    ...defaultStyles.roundedBox,
                    ...(this.props.shadow !== false
                        ? shadowStyles.small
                        : undefined),
                    height: styleValues.smallHeight,
                    flexDirection: "row",
                    justifyContent: "space-between",
                    ...this.props.style,
                }}
            >
                <View style={{ flexDirection: "row", alignItems: "center" }}>
                    {this.renderInfo()}
                    <Text
                        style={{
                            ...textStyles.medium,
                            ...this.props.textStyle,
                        }}
                    >
                        {this.props.text}
                    </Text>
                </View>
                {this.props.children}
                <Switch
                    trackColor={{
                        true: colors.valid,
                        false: colors.darkGrey,
                    }}
                    {...this.props.switchProps}
                    style={{
                        transform: [{ scale: switchScale }],
                        marginRight: -styleValues.minorPadding,
                        ...this.props.switchStyle,
                    }}
                    value={this.state.switchValue}
                    onValueChange={(value) => {
                        this.setState({ switchValue: value });
                        this.props.onToggle?.(value);
                    }}
                    onLayout={(event) => {
                        this.setState({
                            switchHeight: event.nativeEvent.layout.height,
                        });
                    }}
                />
                {this.props.info ? (
                    <CustomModal
                        visible={this.state.infoActive}
                        onClose={() => this.setState({ infoActive: false })}
                    >
                        <View style={{...defaultStyles.roundedBox, ...shadowStyles.small, paddingBottom: styleValues.mediumPadding*2}}>
                            <Text style={textStyles.largeHeader}>
                                {this.props.info.header}
                            </Text>
                            <Text style={textStyles.medium}>
                                {this.props.info.body}
                            </Text>
                        </View>
                    </CustomModal>
                ) : undefined}
            </View>
        );
    }
}
