import PropTypes from 'prop-types';
import React from "react";
import { Image, ImageStyle, StyleSheet } from "react-native";
import { colors } from "../HelperFiles/StyleSheet";
import CustomComponent from "./CustomComponent";

type Props = {
  iconSource: number,
  iconStyle?: ImageStyle,
  options?: {
      focused: boolean,
      color: string
  }
}

type State = {}

export default class TabIcon extends CustomComponent<Props, State> {

  iconStyle: ImageStyle

  constructor(props: Props) {
    super(props);
    this.iconStyle = this.props.iconStyle ? this.props.iconStyle! : {}
  }

  static propTypes = {
    iconSource: PropTypes.number.isRequired,
    iconStyle: PropTypes.object,
    options: PropTypes.shape({
        focused: PropTypes.bool,
        color: PropTypes.string
    })
}

  render() {
    return (
        <Image
          style={[styles.iconStyle, this.iconStyle, {tintColor: this.props.options?.color}]}
          resizeMethod={"scale"}
          resizeMode={"contain"}
          source={this.props.iconSource}
        />
    )
  }
}

const styles = StyleSheet.create({
  iconStyle: {
    height: "100%",
    aspectRatio: 1,
    tintColor: colors.darkGrey,
  },
});
