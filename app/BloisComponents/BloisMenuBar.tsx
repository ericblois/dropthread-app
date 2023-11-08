import React from "react";
import { PressableProps, StyleSheet, TextStyle, View, ViewStyle } from "react-native";
import { colors, menuBarStyles, shadowStyles } from "../HelperFiles/StyleSheet";
import CustomComponent from "../CustomComponents/CustomComponent";
import CustomImageButton from "../CustomComponents/CustomImageButton";
import BloisIconButton, { IconSelect } from "./BloisIconButton";

type Props = {
  buttons: {
    icon: IconSelect,
    onPress: () => void,
    iconStyle?: TextStyle,
    pressableProps?: PressableProps
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
              key={index.toString()}
              icon={buttonData.icon}
              iconStyle={{color: colors.darkGrey, ...buttonData.iconStyle}}
              animType={'opacity'}
              onPress={buttonData.onPress}
              pressableProps={buttonData.pressableProps}
            />
          ))
        }
        {this.props.children}
      </View>
    )
  }
}
