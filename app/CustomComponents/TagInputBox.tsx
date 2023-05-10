import React from "react";
import { FlatList, KeyboardAvoidingView, NativeSyntheticEvent, Pressable, ScrollView, Text, TextInput, TextInputSubmitEditingEventData, TextStyle, View, ViewStyle } from "react-native";
import { colors, defaultStyles, icons, shadowStyles, styleValues, textStyles } from "../HelperFiles/StyleSheet";
import CustomComponent from "./CustomComponent";
import CustomImageButton from "./CustomImageButton";
import ScrollContainer from "./ScrollContainer";
import CustomIconButton from "./CustomIconButton";

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
    onSubmit?: (e: NativeSyntheticEvent<TextInputSubmitEditingEventData>) => void
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
                    marginHorizontal: styleValues.minorPadding,
                    ...defaultStyles.roundedBox,
                    ...shadowStyles.small,
                    padding: styleValues.minorPadding,
                    width: undefined,
                    height: styleValues.smallHeight
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
                <CustomIconButton
                    name="close"
                    type="MaterialIcons"
                    buttonStyle={{
                        width: styleValues.iconSmallSize,
                        height: styleValues.iconSmallSize,
                        marginHorizontal: styleValues.minorPadding
                    }}
                    animationType="opacity"
                    onPress={() => this.removeTag(text)}
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
            <Pressable
                onPress={() => {
                    if (this.textInput !== null) {
                        this.textInput?.focus()
                    }
                }}
            >
                <KeyboardAvoidingView
                    {...this.props.boxProps}
                    style={{width: "100%", ...(this.props.shadow !== false ? shadowStyles.small : undefined)}}
                    contentContainerStyle={{
                        ...defaultStyles.roundedBox,
                        padding: styleValues.minorPadding,
                        paddingBottom: styleValues.mediumPadding,
                        height: undefined,
                        overflow: 'hidden',
                        ...this.props.boxStyle
                    }}
                    behavior={"position"}
                    enabled={this.state.shouldAvoid && this.props.avoidKeyboard === true}
                >
                    {this.state.tags.length > 0 ? 
                        <ScrollView
                            style={{
                                width: "100%",
                                height: styleValues.smallHeight,
                                margin: styleValues.minorPadding,
                                overflow: 'visible',marginBottom: styleValues.mediumPadding
                            }}
                            contentContainerStyle={{
                                padding: 0,
                                //paddingHorizontal: styleValues.minorPadding,
                                overflow: 'visible'
                            }}
                            showsHorizontalScrollIndicator={false}
                            showsVerticalScrollIndicator={false}
                            horizontal
                        >
                            <Pressable style={{flexDirection: 'row'}}>
                                {this.state.tags.map((tag) => this.renderTag(tag))}
                            </Pressable>
                        </ScrollView>
                    : undefined}
                    <TextInput
                        style={[defaultStyles.inputText, {marginTop: styleValues.minorPadding}, this.props.textStyle]}
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
                        maxLength={20}
                        value={this.state.text}
                        onFocus={(e) => {
                            this.setState({shouldAvoid: true})
                            if (this.props.textProps?.onFocus) {
                                this.props.textProps.onFocus(e)
                            }
                        }}
                        onEndEditing={(e) => {
                            if (e.nativeEvent.text.length > 0) {
                                let newText = e.nativeEvent.text.split(' ')[0]
                                newText = newText.split('\n')[0]
                                newText = newText.split('\t')[0]
                                newText = newText.replaceAll(/[^a-zA-Z]/g, '').toLowerCase()
                                if (newText.length > 0) {
                                    this.addTag(newText)
                                    this.setState({text: ''})
                                }
                            }
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
            </Pressable>
            )
    }
}
