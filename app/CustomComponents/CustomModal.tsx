
import React from "react";
import { GestureResponderEvent, Keyboard, Modal, Pressable, StyleSheet, Text, TouchableOpacity, View, ViewStyle } from "react-native";
import FastImage from "react-native-fast-image";
import BloisPressable from "../BloisComponents/BloisPressable";
import { currencyFormatter } from "../HelperFiles/Constants";
import { ItemData, ItemInfo } from "../HelperFiles/DataTypes";
import { colors, shadowStyles, styVals, textStyles, screenUnit, screenWidth, defaultStyles, topInset, bottomInset } from "../HelperFiles/StyleSheet";
import CustomComponent from "./CustomComponent";
import CustomImage from "./CustomImage";
import LoadingCover from "./LoadingCover";
import { BlurView, BlurViewProps } from "expo-blur";
import BloisIconButton from "../BloisComponents/BloisIconButton";

type Props = {
    visible: boolean,
    style?: ViewStyle,
    disableExitButton?: boolean,
    disableBackgroundDismiss?: boolean,
    blurProps?: BlurViewProps,
    onClose?: () => void,
}

type State = {
}

export default class CustomModal extends CustomComponent<Props, State> {

    constructor(props: Props) {
        super(props);
        this.state = {
        }
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
                    paddingTop: topInset + styVals.mediumPadding,
                    paddingBottom: bottomInset + styVals.mediumPadding,
                    alignItems: 'center',
                    justifyContent: 'center',
                    ...this.props.style,
                }}
                    onStartShouldSetResponder={() => true}
                >
                    <BlurView
                        style={{
                            ...defaultStyles.fill,
                        }}
                        tint={'default'}
                        intensity={15}
                        {...this.props.blurProps}
                    />
                    {!this.props.disableBackgroundDismiss ? 
                        <Pressable
                            style={defaultStyles.fill}
                            onPress={() => {
                                if (Keyboard.isVisible()) {
                                    Keyboard.dismiss()
                                } else {
                                    this.props.onClose?.()
                                }
                            }}
                        />
                    : undefined }
                    {this.props.children}
                    {!this.props.disableExitButton ? 
                        <BloisIconButton
                            icon={{
                                type: 'AntDesign',
                                name: 'close'
                            }}
                            style={{
                                height: styVals.iconLargestSize,
                                width: styVals.iconLargestSize,
                                marginTop: styVals.mediumPadding
                            }}
                            onPress={() => {
                                this.props.onClose?.()
                            }}
                        />
                    : undefined }
                </View>
            </Modal>
        )
    }
}

const styles = StyleSheet.create({
    
})