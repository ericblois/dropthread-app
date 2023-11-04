import React from "react";
import { StyleSheet, Text, TextStyle, View, ViewStyle, TouchableOpacity } from "react-native";
import CustomImageButton from "../CustomComponents/CustomImageButton";
import { colors, defaultStyles, icons, screenHeight, screenWidth, styVals, textStyles } from "../HelperFiles/StyleSheet";
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
            <CustomImageButton
                iconSource={icons.cross}
                buttonStyle={styles.exitButton}
                iconStyle={{tintColor: colors.white}}
                onPress={() => {
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
                    padding: styVals.iconSmallSize,
                    paddingBottom: styVals.iconSmallSize + styVals.mediumHeight
                }}>
                    <View
                        style={{
                            ...defaultStyles.inputBox,
                            height: undefined,
                            maxWidth: screenWidth*0.8,
                            padding: styVals.mediumPadding,
                            ...this.props.boxStyle
                        }}
                    >
                        {this.props.headerText === undefined ? undefined : 
                        <Text
                            style={{
                                ...textStyles.largerHeader,
                                marginTop: 0,
                                ...this.props.textStyle
                            }}
                            {...this.props.textProps}
                        >{this.props.headerText}</Text>}
                        <Text
                            style={{
                                ...defaultStyles.inputText,
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
        ...defaultStyles.fill,
        alignItems: "center",
        justifyContent: "center",
        width: screenWidth,
        height: screenHeight,
        padding: styVals.mediumPadding,
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
        width: styVals.iconSmallSize,
        height: styVals.iconSmallSize,
        top: 0,
        right: 0
    }
})