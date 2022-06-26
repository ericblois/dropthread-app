import React from "react";
import { KeyboardAvoidingView, Text, TextInput, TextStyle, View, ViewStyle } from "react-native";
import { colors, defaultStyles, icons, shadowStyles, styleValues, textStyles } from "../HelperFiles/StyleSheet";
import CustomComponent from "./CustomComponent";
import IconButton from "./IconButton";
import ScrollContainer from "./ScrollContainer";

type TagInputBoxProps = {
    boxStyle?: ViewStyle,
    textStyle?: TextStyle,
    boxProps?: KeyboardAvoidingView['props'],
    textProps?: TextInput['props'],
    defaultValue?: string[],
    avoidKeyboard?: boolean,
    focusOnStart?: boolean,
    shadow?: boolean,
    onChange?: (tags: string[]) => void,
    validateFunc?: (tags: string[]) => boolean
}

type State = {
    text: string,
    tags: string[],
    shouldAvoid: boolean,
}

export default class TagInputBox extends CustomComponent<TagInputBoxProps, State> {

    textInput: TextInput | null = null

    constructor(props: TagInputBoxProps) {
        super(props)
        this.state = {
            text: "",
            tags: props.defaultValue ? props.defaultValue : [],
            shouldAvoid: false,
        }
    }
    
    renderTag(text: string) {
        return (
            <View
                style={{
                    flexDirection: "row",
                    alignItems: "center",
                    borderRadius: styleValues.minorPadding,
                    padding: styleValues.minorPadding,
                    marginHorizontal: styleValues.minorPadding,
                    backgroundColor: colors.lightestGrey
                }}
                key={text}
            >
                <Text
                    style={{
                        ...textStyles.small,
                        marginHorizontal: styleValues.minorPadding,
                        ...this.props.textStyle
                    }}
                >{text}</Text>
                <IconButton
                    iconSource={icons.cross}
                    buttonStyle={{
                        width: styleValues.iconSmallestSize,
                        height: styleValues.iconSmallestSize,
                        marginHorizontal: styleValues.minorPadding
                    }}
                    buttonFunc={() => this.removeTag(text)}
                />
            </View>
        )
    }

    addTag(text: string) {
        if (this.state.tags.includes(text) || this.state.tags.length >= 10) {
            return
        } else {
            const newTags = this.state.tags
            newTags.push(text)
            this.setState({tags: newTags})
        }
    }

    removeTag(text: string) {
        const tagIndex = this.state.tags.indexOf(text)
        if (tagIndex > -1) {
            const newTags = this.state.tags
            newTags.splice(tagIndex, 1)
            this.setState({tags: newTags})
        }
    }

    render() {
        return (
            <KeyboardAvoidingView
                {...this.props.boxProps}
                style={{width: "100%"}}
                contentContainerStyle={{
                    ...defaultStyles.roundedBox,
                    height: undefined,
                    ...(this.props.shadow !== false ? shadowStyles.small : undefined),
                    borderColor: this.props.validateFunc ? (this.props.validateFunc(this.state.tags) ? colors.valid : colors.invalid) : colors.lighterGrey,
                    borderWidth: styleValues.minorBorderWidth,
                    ...this.props.boxStyle
                }}
                behavior={"position"}
                enabled={this.state.shouldAvoid && this.props.avoidKeyboard === true}
            >
                {this.state.tags.length > 0 ? 
                    <ScrollContainer
                        containerStyle={{
                            width: "100%",
                            height: styleValues.smallHeight,
                            margin: styleValues.minorPadding
                        }}
                        contentContainerStyle={{padding: 0, paddingHorizontal: styleValues.minorPadding}}
                        fadeStartColor={colors.white}
                        fadeEndColor={colors.white}
                        horizontal
                    >
                        {this.state.tags.map((tag) => this.renderTag(tag))}
                    </ScrollContainer>
                : undefined}
                <TextInput
                    style={[defaultStyles.inputText, this.props.textStyle]}
                    disableFullscreenUI={true}
                    focusable={true}
                    textAlign={"center"}
                    textAlignVertical={"center"}
                    autoCorrect={false}
                    clearButtonMode={"while-editing"}
                    ref={(textInput) => {this.textInput = textInput}}
                    onLayout={() => {
                        if (this.props.focusOnStart === true && this.textInput !== null) {
                            this.textInput.focus()
                        }
                    }}
                    {...this.props.textProps}
                    value={this.state.text}
                    onFocus={(e) => {
                        this.setState({shouldAvoid: true})
                        if (this.props.textProps?.onFocus) {
                            this.props.textProps.onFocus(e)
                        }
                    }}
                    onEndEditing={(e) => {
                        this.setState({shouldAvoid: false})
                        if (this.props.textProps?.onEndEditing) {
                            this.props.textProps.onEndEditing(e)
                        }
                    }}
                    onChangeText={(text) => {
                        if (text.includes(' ') || text.includes('\n') || text.includes('\t')) {
                            let newText = text.split(' ')[0]
                            newText = newText.split('\n')[0]
                            newText = newText.split('\t')[0]
                            newText = newText.replaceAll(/[^a-zA-Z]/g, '').toLowerCase()
                            if (newText.length > 0) {
                                this.addTag(newText)
                                this.setState({text: ''})
                            }
                        } else {
                            this.setState({text: text})
                        }
                        if (this.props.textProps?.onChangeText) {
                            this.props.textProps.onChangeText(text)
                        }
                    }}
                >
                    {this.props.children}
                </TextInput>
            </KeyboardAvoidingView>
            )
    }
}
