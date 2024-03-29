import React from "react";
import { ActivityIndicator, Animated, GestureResponderEvent, Pressable, PressableProps, StyleSheet, Text, View, ViewStyle } from "react-native";
import FastImage, { FastImageProps, ImageStyle, Source } from "react-native-fast-image";
import { colors, defaultStyles, shadowStyles, styVals, textStyles } from "../HelperFiles/StyleSheet";
import CustomComponent from "./CustomComponent";
import BloisPressable from '../BloisComponents/BloisPressable'

type CustomImageButtonProps = {
  iconSource: Source,
  iconStyle?: ImageStyle,
  buttonStyle?: ViewStyle,
  onPress?: (event?: GestureResponderEvent) => void | Promise<void>
  buttonProps?: BloisPressable['props'],
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

export default class CustomImageButton extends CustomComponent<CustomImageButtonProps, State> {

  constructor(props: CustomImageButtonProps) {
    super(props)
    this.state = {
      showLoading: false,
      showInfo: false
    }
  }

  static createButtons(buttonData: CustomImageButtonProps[]) {
    const buttons = buttonData.map((button, index) => {
      return <CustomImageButton iconSource={button.iconSource} onPress={button.onPress} key={index}/>;
    })
    return buttons;
  }

  renderInfo() {
    if (this.props.infoProps && this.state.showInfo) {
      const posVert = this.props.infoProps.positionVertical ? this.props.infoProps.positionVertical : "above"
      const posHor = this.props.infoProps.positionHorizontal ? this.props.infoProps.positionHorizontal : "center"
      const width = this.props.infoProps.width ? this.props.infoProps.width : this.props.infoProps.text.length*styVals.mediumTextSize*0.65 + styVals.mediumPadding*2
      let left = posHor === "right" ? 0 : undefined
      let right = posHor === "left" ? 0 : undefined
      if (posVert === "beside") {
        left = posHor === "left" ? -(width + styVals.mediumPadding) : undefined
        right = posHor === "right" ? -(width + styVals.mediumPadding) : undefined
      }
      return (
        <View
          style={{
            ...defaultStyles.roundedBox,
            ...shadowStyles.small,
            position: "absolute",
            width: width,
            top: posVert === "above" ? -(styVals.smallHeight + styVals.mediumPadding) : undefined,
            bottom: posVert === "below" ? -(styVals.smallHeight + styVals.mediumPadding) : undefined,
            left: left,
            right: right,
            alignSelf: posHor === "center" ? "center" : undefined,
          }}
        >
          <Text style={{
            ...textStyles.medium,
          }}>{this.props.infoProps.text}</Text>
        </View>
      )
    }
  }

  render() {
    return (
        <BloisPressable
          style={[iconButtonStyles.defaultButton, this.props.buttonStyle]}
          onPress={async () => {
            if (this.props.onPress) {
              if (this.props.showLoading === true) {
                this.setState({showLoading: true})
              }
              try {
                await this.props.onPress()
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
                    ...defaultStyles.fill,
                    alignItems: "center",
                    justifyContent: "center",
                    borderRadius: styVals.mediumPadding,
                    backgroundColor: "transparent",
                }}
              >
                  <ActivityIndicator
                      size={"small"}
                  />
              </View>
          }
          {/* Icon Badge */}
          {this.props.showBadge === true ? 
            <View style={{
              position: "absolute",
              height: styVals.smallTextSize*4/3,
              minWidth: styVals.smallTextSize*4/3,
              borderRadius: styVals.smallTextSize*4/3,
              top: -styVals.minorPadding,
              right: -styVals.minorPadding,
              backgroundColor: colors.main,
              alignItems: "center",
              justifyContent: "center"
            }}>
              <Text style={{...textStyles.small, color: colors.white, marginHorizontal: styVals.minorPadding}}>{`${this.props.badgeNumber}`}</Text>
            </View> : undefined
          }
          {this.renderInfo()}
        </BloisPressable>
    )
  }
}

export const iconButtonStyles = StyleSheet.create({
  defaultButton: {
    alignContent: "center",
    justifyContent: "center",
    height: styVals.iconLargerSize,
    width: styVals.iconLargerSize,
    padding: undefined,
    marginBottom: undefined
  },
  defaultIcon: {
    height: "100%",
    width: "100%",
    tintColor: colors.darkGrey,
  }
})