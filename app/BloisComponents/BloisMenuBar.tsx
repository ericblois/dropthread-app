import React from "react";
import { StyleSheet, TextStyle, View, ViewStyle } from "react-native";
import { colors, menuBarStyles, shadowStyles } from "../HelperFiles/StyleSheet";
import CustomComponent from "../CustomComponents/CustomComponent";
import CustomImageButton from "../CustomComponents/CustomImageButton";
import BloisIconButton, { IconSelect } from "./BloisIconButton";

type Props = {
  buttons: {
    icon: IconSelect,
    onPress: () => void,
    iconStyle?: TextStyle
  }[]
  menuBarStyle?: ViewStyle,
  buttonStyle?: ViewStyle,
  shadow?: boolean
}

type State = {}

export default class BloisMenuBar extends CustomComponent<Props, State> {

  styles: {
    menuBarStyle: ViewStyle;
    buttonStyle: ViewStyle;
  }

  constructor(props: Props) {
    super(props);
    this.styles = StyleSheet.create({
      menuBarStyle: this.props.menuBarStyle ? this.props.menuBarStyle! : {},
      buttonStyle: this.props.buttonStyle ? this.props.buttonStyle! : {}
    })
  }

  render() {
    return (
      <View style={{
          ...menuBarStyles.lightHover,
          ...shadowStyles.medium,
          ...this.styles.menuBarStyle
        }}
      >
        {
          this.props.buttons.map((buttonData, index) => (
            <BloisIconButton
              icon={buttonData.icon}
              iconStyle={{color: colors.darkGrey, ...buttonData.iconStyle}}
              shadow={false}
              onPress={buttonData.onPress}
            />
          ))
        }
        {this.props.children}
      </View>
    )
  }
}