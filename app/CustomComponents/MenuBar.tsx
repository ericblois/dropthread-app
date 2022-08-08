import React from "react";
import { StyleSheet, View, ViewStyle } from "react-native";
import { colors, menuBarStyles, shadowStyles } from "../HelperFiles/StyleSheet";
import CustomComponent from "./CustomComponent";
import CustomImageButton from "./CustomImageButton";

type Props = {
  buttonProps: CustomImageButton['props'][],
  menuBarStyle?: ViewStyle,
  buttonStyle?: ViewStyle,
  shadow?: boolean
}

type State = {}

export default class MenuBar extends CustomComponent<Props, State> {

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
          this.props.buttonProps.map((props, index) => {
            return <CustomImageButton iconStyle={{tintColor: colors.darkGrey}} {...props} key={index}/>;
          })
        }
        {this.props.children}
      </View>
    )
  }
}
