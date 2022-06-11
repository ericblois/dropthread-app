import React from "react";
import { StyleSheet, Text, TextStyle, View, ViewStyle } from "react-native";
import { colors, defaults, fonts, icons, styleValues, textStyles } from "../HelperFiles/StyleSheet";
import CustomComponent from "./CustomComponent";
import IconButton from "./IconButton";
import TextButton from "./TextButton";

type Props = {
    type: "save" | "delete",
    showConfirmLoading?: boolean,
    showDenyLoading?: boolean,
    onConfirm?: () => void,
    onDeny?: () => void,
    onExit?: () => void
}

type State = {}

export default class ConfirmationPopup extends CustomComponent<Props, State> {

    headerText: string
    descriptionText: string
    denyText: string
    confirmText: string
    denyButtonStyle: ViewStyle
    denyTextStyle: TextStyle
    confirmButtonStyle: ViewStyle
    confirmTextStyle: TextStyle

    constructor(props: Props) {
        super(props)
        this.state = {

        }
        // Set save text
        if (props.type === "save") {
            this.headerText = "Unsaved changes"
            this.descriptionText = "You have unsaved changes. Would you like to save before continuing?"
            this.denyText = "Don't save"
            this.confirmText = "Save"
            this.denyButtonStyle = {...defaults.roundedBox}
            this.denyTextStyle = {color: colors.invalid}
            this.confirmButtonStyle = {...defaults.roundedBox, backgroundColor: colors.main}
            this.confirmTextStyle = {
                color: colors.white,
                fontFamily: fonts.medium
            }
        } else {
            this.headerText = "Delete"
            this.descriptionText = "Are you sure you would like to delete?"
            this.denyText = "Cancel"
            this.confirmText = "Delete"
            this.denyButtonStyle = {...defaults.roundedBox}
            this.denyTextStyle = {color: colors.black}
            this.confirmButtonStyle = {...defaults.roundedBox}
            this.confirmTextStyle = {
                color: colors.invalid,
                fontFamily: fonts.medium
            }
        }
    }

    renderConfirmButton() {
        return (
            <TextButton
                text={this.confirmText}
                buttonStyle={{
                    flex: 1,
                    ...this.confirmButtonStyle
                }}
                textStyle={{
                    ...textStyles.medium,
                    ...this.confirmTextStyle
                }}
                buttonFunc={async () => {
                    if (this.props.onConfirm) {
                        await this.props.onConfirm()
                    }
                }}
                showLoading={this.props.showConfirmLoading ? this.props.showConfirmLoading : true}
            />
        )
    }

    renderDenyButton() {
        return (
            <TextButton
                text={this.denyText}
                textStyle={{
                    ...textStyles.medium,
                    ...this.denyTextStyle
                }}
                buttonStyle={{
                    flex: 1,
                    ...this.denyButtonStyle
                }}
                buttonFunc={async () => {
                    if (this.props.onDeny) {
                        await this.props.onDeny()
                    }
                }}
                showLoading={this.props.showDenyLoading ? this.props.showDenyLoading : true}
            />
        )
    }

    renderExitButton() {
        if (this.props.onExit) {
            return (
                <IconButton
                    iconSource={icons.cross}
                    buttonStyle={styles.exitButton}
                    iconStyle={{tintColor: colors.white}}
                    buttonFunc={() => this.props.onExit!()}
                />
            )
        }
    }

    render() {
        return (
            <View
                style={styles.container}
            >
                <View
                    style={styles.outsideTouchable}
                />
                <View style={{
                    position: "absolute",
                    padding: styleValues.iconSmallSize,
                    paddingBottom: styleValues.iconSmallSize + styleValues.mediumHeight,
                    maxWidth: styleValues.winWidth*0.8
                }}>
                    <View
                        style={{
                            ...defaults.inputBox,
                            height: undefined,
                            width: "100%",
                            padding: styleValues.mediumPadding,
                        }}
                    >
                        <Text
                            style={{
                                ...textStyles.largeHeader,
                                marginTop: 0,
                            }}
                        >{this.headerText}</Text>
                        <Text
                            style={{
                                ...defaults.inputText,
                            }}
                        >{this.descriptionText}</Text>
                    </View>
                    <View 
                        style={{
                            flexDirection: "row",
                            alignItems: "center",
                            justifyContent: "space-between",
                            width: "100%"
                        }}
                    >
                        {this.renderDenyButton()}
                        <View style={{width: styleValues.mediumPadding}}/>
                        {this.renderConfirmButton()}
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
    button: {
        width: styleValues.iconSmallSize,
        height: styleValues.iconSmallSize,
        top: 0,
        right: 0
    },
    exitButton: {
        position: "absolute",
        width: styleValues.iconSmallSize,
        height: styleValues.iconSmallSize,
        top: 0,
        right: 0
    }
})