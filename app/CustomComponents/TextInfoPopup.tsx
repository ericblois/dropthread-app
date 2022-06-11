import React from "react";
import { StyleSheet, Text, TextStyle, View, ViewStyle, TouchableOpacity } from "react-native";
import IconButton from "../CustomComponents/IconButton";
import { colors, defaults, icons, styleValues, textStyles } from "../HelperFiles/StyleSheet";
import CustomComponent from "./CustomComponent";

type Props = {
    headerText?: string,
    textStyle?: TextStyle,
    boxStyle?: ViewStyle,
    onExit?: () => void,
    textProps?: Text["props"]
}

type State = {}

export default class TextInfoPopup extends CustomComponent<Props, State> {

    constructor(props: Props) {
        super(props)
        this.state = {

        }
    }

    renderExitButton() {
        return (
            <IconButton
                iconSource={icons.cross}
                buttonStyle={styles.exitButton}
                iconStyle={{tintColor: colors.white}}
                buttonFunc={() => {
                    if (this.props.onExit) {
                        this.props.onExit()
                    }
                }}
            />
        )
    }

    render() {
        return (
            <View
                style={styles.container}
            >
                <TouchableOpacity
                    style={styles.outsideTouchable}
                    onPress={() => {
                        if (this.props.onExit) {
                            this.props.onExit()
                        }
                    }}
                />
                <View style={{
                    position: "absolute",
                    padding: styleValues.iconSmallSize,
                    paddingBottom: styleValues.iconSmallSize + styleValues.mediumHeight
                }}>
                    <View
                        style={{
                            ...defaults.inputBox,
                            height: undefined,
                            maxWidth: styleValues.winWidth*0.8,
                            padding: styleValues.mediumPadding,
                            ...this.props.boxStyle
                        }}
                    >
                        {this.props.headerText === undefined ? undefined : 
                        <Text
                            style={{
                                ...textStyles.largeHeader,
                                marginTop: 0,
                                ...this.props.textStyle
                            }}
                            {...this.props.textProps}
                        >{this.props.headerText}</Text>}
                        <Text
                            style={{
                                ...defaults.inputText,
                                ...this.props.textStyle
                            }}
                            {...this.props.textProps}
                        >{this.props.children}</Text>
                    </View>
                    {this.renderExitButton()}
                </View>
            </View>
        )
    }
}

const styles = StyleSheet.create({
    container: {
        position: "absolute",
        alignItems: "center",
        justifyContent: "center",
        width: styleValues.winWidth,
        height: styleValues.winHeight,
        padding: styleValues.mediumPadding,
        top: 0,
        bottom: 0,
        left:  0,
        right: 0,
        backgroundColor: "rgba(0,0,0,0.5)",
    },
    outsideTouchable: {
        width: "100%",
        height: "100%",
        alignItems: "center",
        justifyContent: "center",
    },
    textBox: {

    },
    exitButton: {
        position: "absolute",
        width: styleValues.iconSmallSize,
        height: styleValues.iconSmallSize,
        top: 0,
        right: 0
    }
})