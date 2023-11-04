import React from "react";
import { Modal, StyleSheet, Text, TextStyle, View, ViewStyle } from "react-native";
import { colors, defaultStyles, fonts, icons, screenHeight, screenWidth, shadowStyles, styVals, textStyles } from "../HelperFiles/StyleSheet";
import CustomComponent from "./CustomComponent";
import CustomImageButton from "./CustomImageButton";
import TextButton from "./TextButton";
import { BlurView } from "expo-blur";

export type ConfirmationPopupConfig = {
    
}

type Props = {
    visible: boolean,
    headerText?: string,
    infoText: string,
    confirmText?: string,
    denyText?: string,
    confirmButtonStyle?: ViewStyle,
    denyButtonStyle?: ViewStyle,
    confirmTextStyle?: TextStyle,
    denyTextStyle?: TextStyle,
    onConfirm?: () => void,
    onDeny?: () => void
}

type State = {}

export default class ConfirmationPopup extends CustomComponent<Props, State> {

    constructor(props: Props) {
        super(props)
        this.state = {
        }
    }

    renderConfirmButton() {
        return (
            <TextButton
                text={this.props.confirmText || 'Confirm'}
                buttonStyle={{
                    flex: 1,
                    height: styVals.smallHeight,
                    padding: styVals.minorPadding,
                    ...this.props.confirmButtonStyle
                }}
                textStyle={{
                    ...textStyles.medium,
                    ...this.props.confirmTextStyle
                }}
                onPress={async () =>  await this.props.onConfirm?.()}
                showLoading
            />
        )
    }

    renderDenyButton() {
        return (
            <TextButton
                text={this.props.denyText || 'Cancel'}
                textStyle={{
                    ...textStyles.medium,
                    ...this.props.denyTextStyle
                }}
                buttonStyle={{
                    flex: 1,
                    height: styVals.smallHeight,
                    padding: styVals.minorPadding,
                    ...this.props.denyButtonStyle
                }}
                onPress={async () => await this.props.onDeny?.()}
                showLoading
            />
        )
    }

    render() {
        return (
            <Modal
                animationType={"fade"}
                transparent={true}
                visible={this.props.visible}
            >
                <View style={{
                    ...defaultStyles.fill,
                    paddingHorizontal: styVals.mediumPadding,
                    alignItems: 'center',
                    justifyContent: 'center'
                }}
                    onStartShouldSetResponder={() => true}
                >
                    <BlurView
                        style={{
                            ...defaultStyles.fill,
                        }}
                        tint={'default'}
                        intensity={15}
                    />
                    <View style={{
                        ...shadowStyles.medium,
                        ...defaultStyles.roundedBox,
                        paddingBottom: 0,
                        position: "absolute",
                        maxWidth: screenWidth*0.8
                    }}>
                        {/* Header */}
                        {this.props.headerText ?
                            <Text style={textStyles.large}>
                                {this.props.headerText}
                            </Text>
                        : undefined}
                        {/* Info / description */}
                        <Text style={{...textStyles.medium, textAlign: 'left', marginBottom: styVals.mediumPadding}}>
                            {this.props.infoText}
                        </Text>
                        {/* Buttons */}
                        <View 
                            style={{
                                flexDirection: "row",
                                alignItems: "center",
                                justifyContent: "space-between",
                                width: "100%"
                            }}
                        >
                            {this.renderDenyButton()}
                            <View style={{width: styVals.mediumPadding}}/>
                            {this.renderConfirmButton()}
                        </View>
                    </View>
                </View>
            </Modal>
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
    button: {
        width: styVals.iconSmallSize,
        height: styVals.iconSmallSize,
        top: 0,
        right: 0
    },
    exitButton: {
        position: "absolute",
        width: styVals.iconSmallSize,
        height: styVals.iconSmallSize,
        top: 0,
        right: 0
    }
})