import React, { Component } from "react";
import {
    GestureResponderEvent,
    PressableProps, TextStyle, ViewStyle
} from "react-native";
import {
    colors,
    defaultStyles, styleValues
} from "../HelperFiles/StyleSheet";
import * as Icons from "@expo/vector-icons";
import { Icon, IconProps } from "@expo/vector-icons/build/createIconSet";
import BloisPressable from "./BloisPressable";

type BloisIconButtonProps = IconSelect & {
    style?: ViewStyle;
    iconStyle?: TextStyle;
    onPress?: (event: GestureResponderEvent) => void | Promise<void>;
    pressableProps?: PressableProps;
    showLoading?: boolean;
    shadow?: boolean;
    tooltip?: {
        text: string;
        posX?: "center" | "left" | "right";
        posY?: "above" | "below"
        width?: number;
    };
};

type State = {};

export default class BloisIconButton extends Component<BloisIconButtonProps, State> {

    DCIcon = Icons[this.props.type] as Icon<
        BloisIconButton['props']['name'],
        BloisIconButton['props']['type']
    >;

    render() {
        
        return (
            <BloisPressable
                style={{
                    ...(this.props.shadow !== false
                        ? defaultStyles.roundedBox
                        : undefined),
                    width: styleValues.smallHeight,
                    alignContent: "center",
                    justifyContent: "center",
                    aspectRatio: 1,
                    ...this.props.style,
                }}
                animType={this.props.shadow !== false ? 'shadowSmall' : 'opacity'}
                tooltip={this.props.tooltip}
                onPress={async (e) => {
                    if (this.props.onPress) {
                        if (this.props.showLoading) {
                            this.setState({ showLoading: true });
                        }
                        await this.props.onPress(e);
                        if (this.props.showLoading) {
                            this.setState({ showLoading: false });
                        }
                    }
                }}
                pressableProps={{
                    onLongPress: (event) => {
                        this.setState({ showInfo: true });
                        this.props.pressableProps?.onLongPress?.(event);
                    },
                    onPressOut: (event) => {
                        this.setState({ showInfo: false });
                        this.props.pressableProps?.onPressOut?.(event);
                    },
                }}
            >
                <this.DCIcon
                    adjustsFontSizeToFit
                    {...this.props.iconProps}
                    name={this.props.name}
                    type={this.props.type}
                    style={{
                        height: "100%",
                        width: "100%",
                        textAlign: "center",
                        textAlignVertical: "center",
                        color: colors.darkGrey,
                        aspectRatio: 1,
                        fontSize:
                            (this.props.style?.width as number) |
                            (this.props.style?.height as number) |
                            styleValues.smallHeight,
                        ...this.props.iconStyle,
                    }}
                />
            </BloisPressable>
        );
    }
}

export type IconSelect =
    | {
          type: "AntDesign";
          name: keyof typeof Icons.AntDesign.glyphMap;
          iconProps?: Partial<IconProps<keyof typeof Icons.AntDesign.glyphMap>>;
      }
    | {
          type: "Entypo";
          name: keyof typeof Icons.Entypo.glyphMap;
          iconProps?: Partial<IconProps<keyof typeof Icons.Entypo.glyphMap>>;
      }
    | {
          type: "EvilIcons";
          name: keyof typeof Icons.EvilIcons.glyphMap;
          iconProps?: Partial<IconProps<keyof typeof Icons.EvilIcons.glyphMap>>;
      }
    | {
          type: "Feather";
          name: keyof typeof Icons.Feather.glyphMap;
          iconProps?: Partial<IconProps<keyof typeof Icons.Feather.glyphMap>>;
      }
    | {
          type: "FontAwesome";
          name: keyof typeof Icons.FontAwesome.glyphMap;
          iconProps?: Partial<
              IconProps<keyof typeof Icons.FontAwesome.glyphMap>
          >;
      }
    | {
          type: "Fontisto";
          name: keyof typeof Icons.Fontisto.glyphMap;
          iconProps?: Partial<IconProps<keyof typeof Icons.Fontisto.glyphMap>>;
      }
    | {
          type: "Foundation";
          name: keyof typeof Icons.Foundation.glyphMap;
          iconProps?: Partial<
              IconProps<keyof typeof Icons.Foundation.glyphMap>
          >;
      }
    | {
          type: "Ionicons";
          name: keyof typeof Icons.Ionicons.glyphMap;
          iconProps?: Partial<IconProps<keyof typeof Icons.Ionicons.glyphMap>>;
      }
    | {
          type: "MaterialCommunityIcons";
          name: keyof typeof Icons.MaterialCommunityIcons.glyphMap;
          iconProps?: Partial<
              IconProps<keyof typeof Icons.MaterialCommunityIcons.glyphMap>
          >;
      }
    | {
          type: "MaterialIcons";
          name: keyof typeof Icons.MaterialIcons.glyphMap;
          iconProps?: Partial<
              IconProps<keyof typeof Icons.MaterialIcons.glyphMap>
          >;
      }
    | {
          type: "Octicons";
          name: keyof typeof Icons.Octicons.glyphMap;
          iconProps?: Partial<IconProps<keyof typeof Icons.Octicons.glyphMap>>;
      }
    | {
          type: "SimpleLineIcons";
          name: keyof typeof Icons.SimpleLineIcons.glyphMap;
          iconProps?: Partial<
              IconProps<keyof typeof Icons.SimpleLineIcons.glyphMap>
          >;
      }
    | {
          type: "Zocial";
          name: keyof typeof Icons.Zocial.glyphMap;
          iconProps?: Partial<IconProps<keyof typeof Icons.Zocial.glyphMap>>;
      };
