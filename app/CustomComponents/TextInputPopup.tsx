import { BlurView } from "expo-blur";
import React from "react";
import { StyleSheet, TouchableOpacity } from "react-native";
import IconButton from "../CustomComponents/IconButton";
import TextInputBox from "../CustomComponents/TextInputBox";
import { colors, icons, screenHeight, screenWidth, styleValues } from "../HelperFiles/StyleSheet";
import CustomComponent from "./CustomComponent";

type Props = {
    initialText?: string,
    onTapAway?: () => void,
    onSaveText?: (text: string) => void,
    textInputProps?: TextInputBox['props']
}

type State = {
    currentText: string
}

export default class TextInputPopup extends CustomComponent<Props, State> {

    constructor(props: Props) {
        super(props)
        this.state = {
            currentText: props.initialText ? props.initialText : ""
        }
    }

    renderSaveButton() {
        return (
            <IconButton
                iconSource={icons.checkBox}
                buttonStyle={styles.saveButton}
                iconStyle={{tintColor: colors.white}}
                buttonFunc={() => {
                    if (this.props.onSaveText) {
                        this.props.onSaveText(this.state.currentText)
                    }
                }}
                showLoading={true}
            />
        )
    }

    render() {
        return (
            <BlurView
                style={styles.container}
                intensity={50}
            >
                <TouchableOpacity
                    style={styles.outsideTouchable}
                    onPress={this.props.onTapAway}
                >
                    <TextInputBox
                        boxStyle={{...buttonStyles.noColor, ...styles.textInput}}
                        focusOnStart={true}
                        {...this.props.textInputProps}
                        textProps={{
                            ...this.props.textInputProps?.textProps,
                            ...{
                                onChangeText: (text) => {
                                    this.setState({currentText: text})
                                    if (this.props.textInputProps?.textProps?.onChangeText) {
                                        this.props.textInputProps?.textProps?.onChangeText(text)
                                    }
                                },
                            }
                        }}
                    />
                </TouchableOpacity>
                {this.renderSaveButton()}
            </BlurView>
        )
    }
}

const styles = StyleSheet.create({
    container: {
        position: "absolute",
        width: screenWidth,
        height: screenHeight,
        padding: styleValues.mediumPadding,
        top: 0,
        left:  0,
    },
    outsideTouchable: {
        width: "100%",
        height: "100%",
        alignItems: "center",
        justifyContent: "center",
    },
    textInput: {

    },
    saveButton: {
        position: "absolute",
        top: "55%",
        right: styleValues.mediumPadding
    }
})