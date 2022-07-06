
import React from "react";
import { GestureResponderEvent, Modal, Pressable, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import FastImage from "react-native-fast-image";
import CustomPressable from "./CustomPressable";
import { currencyFormatter } from "../HelperFiles/Constants";
import { ItemData, ItemInfo } from "../HelperFiles/DataTypes";
import { colors, shadowStyles, styleValues, textStyles, screenUnit, screenWidth, defaultStyles } from "../HelperFiles/StyleSheet";
import CustomComponent from "./CustomComponent";
import CustomImage from "./CustomImage";
import LoadingCover from "./LoadingCover";
import { BlurView } from "expo-blur";
import CustomIconButton from "./CustomIconButton";

type Props = {
    visible: boolean,
    disableExitButton?: boolean,
    onClose?: (event: GestureResponderEvent) => void,
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
                    paddingHorizontal: styleValues.mediumPadding,
                    alignItems: 'center',
                    justifyContent: 'center'
                }}
                    onStartShouldSetResponder={() => true}
                >
                    <BlurView
                        style={defaultStyles.fill}
                    />
                    <Pressable
                        style={defaultStyles.fill}
                        onPress={this.props.onClose}
                    />
                    {this.props.children}
                    <CustomIconButton
                        name="close"
                        type="AntDesign"
                        buttonStyle={{
                            height: styleValues.iconLargestSize,
                            width: styleValues.iconLargestSize,
                            marginTop: styleValues.mediumPadding
                        }}
                        onPress={(e) => {
                            if (this.props.onClose) {
                                this.props.onClose(e!)
                            }
                        }}
                    />
                </View>
            </Modal>
        )
    }
}

const styles = StyleSheet.create({
    
})