import React from "react";
import { ActivityIndicator, Animated, GestureResponderEvent, Pressable, PressableProps, StyleSheet, Text, View, ViewStyle } from "react-native";
import FastImage, { FastImageProps, ImageStyle, Source } from "react-native-fast-image";
import { colors, defaults, shadowStyles, styleValues, textStyles } from "../HelperFiles/StyleSheet";
import CustomComponent from "./CustomComponent";

type IconButtonProps = {
  iconSource: Source,
  iconStyle?: ImageStyle,
  buttonStyle?: ViewStyle,
  buttonFunc?: (event?: GestureResponderEvent) => void | Promise<void>
  buttonProps?: PressableProps,
  iconProps?: Partial<FastImageProps>,
  showLoading?: boolean,
  showBadge?: boolean,
  badgeNumber?: number,
  infoProps?: {
    text: string,
    positionHorizontal?: "center" | "left" | "right",
    positionVertical?: "above" | "below" | "beside",
    width?: number
  }
}

type State = {
  showLoading: boolean,
  showInfo: boolean
}

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

export default class IconButton extends CustomComponent<IconButtonProps, State> {

  constructor(props: IconButtonProps) {
    super(props)
    this.state = {
      showLoading: false,
      showInfo: false
    }
  }

  static createButtons(buttonData: IconButtonProps[]) {
    const buttons = buttonData.map((button, index) => {
      return <IconButton iconSource={button.iconSource} buttonFunc={button.buttonFunc} key={index}/>;
    })
    return buttons;
  }

  renderInfo() {
    if (this.props.infoProps && this.state.showInfo) {
      const posVert = this.props.infoProps.positionVertical ? this.props.infoProps.positionVertical : "above"
      const posHor = this.props.infoProps.positionHorizontal ? this.props.infoProps.positionHorizontal : "center"
      const width = this.props.infoProps.width ? this.props.infoProps.width : this.props.infoProps.text.length*styleValues.mediumTextSize*0.65 + styleValues.mediumPadding*2
      let left = posHor === "right" ? 0 : undefined
      let right = posHor === "left" ? 0 : undefined
      if (posVert === "beside") {
        left = posHor === "left" ? -(width + styleValues.mediumPadding) : undefined
        right = posHor === "right" ? -(width + styleValues.mediumPadding) : undefined
      }
      return (
        <View
          style={{
            ...defaults.roundedBox,
            ...shadowStyles.small,
            position: "absolute",
            width: width,
            top: posVert === "above" ? -(styleValues.smallHeight + styleValues.mediumPadding) : undefined,
            bottom: posVert === "below" ? -(styleValues.smallHeight + styleValues.mediumPadding) : undefined,
            left: left,
            right: right,
            alignSelf: posHor === "center" ? "center" : undefined,
          }}
        >
          <Text style={{
            ...textStyles.small,
          }}>{this.props.infoProps.text}</Text>
        </View>
      )
    }
  }

  render() {
    return (
      <View style={[iconButtonStyles.defaultButton, this.props.buttonStyle]}>
        <Pressable
          onPress={async () => {
            if (this.props.buttonFunc) {
              if (this.props.showLoading === true) {
                this.setState({showLoading: true})
              }
              try {
                await this.props.buttonFunc()
              } catch (e) {
                console.error(e)
              }
              if (this.props.showLoading === true) {
                this.setState({showLoading: false})
              }
            }
          }}
          onLongPress={() => this.setState({showInfo: true})}
          onPressOut={() => this.setState({showInfo: false})}
          style={({pressed}) => ({
            opacity: pressed ? 0.5 : 1
          })}
          {...this.props.buttonProps}
        >
          {!this.state.showLoading ? 
            <FastImage
              style={{
                ...iconButtonStyles.defaultIcon,
                ...this.props.iconStyle
              }}
              tintColor={this.props.iconStyle?.tintColor || colors.darkGrey}
              resizeMode={"contain"}
              source={this.props.iconSource}
              {...this.props.iconProps}
            /> :
            <View
                style={{
                    position: "absolute",
                    top: 0,
                    bottom: 0,
                    left: 0,
                    right: 0,
                    alignItems: "center",
                    justifyContent: "center",
                    borderRadius: styleValues.mediumPadding,
                    backgroundColor: "transparent",
                }}
              >
                  <ActivityIndicator
                      size={"small"}
                  />
              </View>
          }
        </Pressable>
        {/* Icon Badge */}
        {this.props.showBadge === true ? 
          <View style={{
            position: "absolute",
            height: styleValues.smallTextSize*4/3,
            minWidth: styleValues.smallTextSize*4/3,
            borderRadius: styleValues.smallTextSize*4/3,
            top: -styleValues.minorPadding,
            right: -styleValues.minorPadding,
            backgroundColor: colors.main,
            alignItems: "center",
            justifyContent: "center"
          }}>
            <Text style={{...textStyles.smaller, color: colors.white, marginHorizontal: styleValues.minorPadding}}>{`${this.props.badgeNumber}`}</Text>
          </View> : undefined
        }
        {this.renderInfo()}
      </View>
    )
  }
}

export const iconButtonStyles = StyleSheet.create({
  defaultButton: {
    alignContent: "center",
    justifyContent: "center",
    height: styleValues.iconLargerSize,
    width: styleValues.iconLargerSize,
  },
  defaultIcon: {
    height: "100%",
    width: "100%",
    tintColor: colors.darkGrey,
  }
})