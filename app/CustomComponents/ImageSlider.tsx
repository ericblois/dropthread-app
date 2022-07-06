import React from "react";
import { Image, ImageStyle, ScrollView, StyleSheet, View, ViewStyle } from "react-native";
import { defaultStyles, shadowStyles, styleValues } from "../HelperFiles/StyleSheet";
import CustomComponent from "./CustomComponent";
import GradientView from "./GradientView";
import CustomImage from "./CustomImage";

type ImageInfo = {
    uri: string,
    ratio: number
}

export type ImageSliderProps = {
    uris: string[],
    style?: ViewStyle,
    imageStyle?: ImageStyle,
    minRatio?: number,
    maxRatio?: number,
    fadeColor?: string,
    onImagesLoaded?: () => void,
    onRatiosLoaded?: () => void
}

export type ImageSliderState = {
    showGalleryIcon: boolean,
    images: ImageInfo[],
    galleryWidth?: number,
    galleryHeight?: number
}

export default class ImageSlider extends CustomComponent<ImageSliderProps, ImageSliderState> {

    loadCount: number
    ratioCount: number

    constructor(props: ImageSliderProps) {
        super(props)
        this.state = {
            showGalleryIcon: true,
            images: props.uris.map((uri) => ({uri: uri, ratio: -1})),
            galleryWidth: undefined,
            galleryHeight: undefined
        }
        this.loadCount = 0
        this.ratioCount = 0
    }
    componentDidMount() {
        if (this.props.uris.length === 0) {
            if (this.props.onRatiosLoaded) {
                this.props.onRatiosLoaded()
            }
            if (this.props.onImagesLoaded) {
                this.props.onImagesLoaded()
            }
        }
        this.getImageRatios()
        super.componentDidMount()
    }
    // On mount, get the aspect ratio of each image in the slider
    getImageRatios() {
        this.props.uris.forEach((uri, index) => {
            Image.getSize(uri, (width, height) => {
                // --- IMPORTANT: iOS gives width as height and vice versa ---
                const stateUpdate = this.state.images
                stateUpdate[index] = {uri: uri, ratio: width / height}

                this.setState({images: stateUpdate}, () => {
                    // Check if gallery height still needs to be set
                    if (index === 0 && this.state.galleryWidth && this.state.galleryHeight === undefined) {
                        this.setGalleryHeight()
                    }
                    this.ratioCount += 1
                    if (this.ratioCount === this.props.uris.length && this.props.onRatiosLoaded) {
                        this.props.onRatiosLoaded()
                    }
                })
            }, (e) => {
                this.ratioCount += 1
                if (this.ratioCount === this.props.uris.length && this.props.onRatiosLoaded) {
                    this.props.onRatiosLoaded()
                }
                console.error(e)
            })
            
        })
    }
    // Format the gallery height to match the aspect ratio of the first gallery image
    setGalleryHeight() {
        
        // Check for gallery width
        if (this.state.galleryWidth === undefined) {
            return
        }
        // Get ratio of first image
        let ratio = this.state.images.length > 0 ? this.state.images[0].ratio : -1
        if (ratio === -1) {
            return
        }
        
        // Set the gallery height
        if (this.props.maxRatio && ratio > this.props.maxRatio) {
            ratio = this.props.maxRatio
        } else if (this.props.minRatio && ratio < this.props.minRatio) {
            ratio = this.props.minRatio
        }
        let galleryHeight = ((this.state.galleryWidth - 2*styleValues.mediumPadding) / ratio) + styleValues.mediumPadding*2
        this.setState({galleryHeight: galleryHeight})
    }

    renderImage(item: ImageInfo, index: number) {
        if (item.uri !== "" && this.state.galleryWidth && this.state.galleryHeight) {
            let ratio = item.ratio
            // Ensure that first image fills gallery
            if (index === 0) {
                ratio = (this.state.galleryWidth - styleValues.mediumPadding*2) / (this.state.galleryHeight - styleValues.mediumPadding*2)
            }
            return (
                <CustomImage
                    source={{uri: item.uri, priority: index === 0 ? 'high' : 'normal'}}
                    style={{
                        ...shadowStyles.small,
                        width: ratio * (this.state.galleryHeight - styleValues.mediumPadding*2),
                        height: this.state.galleryHeight - styleValues.mediumPadding*2,
                        borderRadius: styleValues.mediumPadding,
                        marginHorizontal: styleValues.minorPadding,
                    }}
                    imageStyle={{
                        borderRadius: styleValues.mediumPadding,
                    }}
                    onLoad={() => {
                        if (this.props.onImagesLoaded) {
                            this.loadCount += 1
                            if (this.loadCount === this.state.images.length) {
                                this.props.onImagesLoaded()
                                this.loadCount = 0
                            }
                        }
                    }}
                    imageProps={{
                        onError: () => {
                            // Remove this uri
                            const stateUpdate = this.state.images
                            stateUpdate[index] = {uri: "", ratio: this.state.images[index].ratio}
                            this.setState({images: stateUpdate})
                            // Send load update anyway
                            if (this.props.onImagesLoaded) {
                                this.loadCount += 1
                                if (this.loadCount === this.state.images.length) {
                                    this.props.onImagesLoaded()
                                    this.loadCount = 0
                                }
                            }
                        }
                    }}
                    key={index.toString()}
                />
            )
        } else {
            return (<View key={index.toString()}/>)
        }
    }

    render() {
        if (this.props.uris.length > 0) {
            return (
                <View
                    style={{
                        ...styles.gallery,
                        width: "100%",
                        height: this.state.galleryHeight,
                        overflow: "hidden",
                        ...this.props.style
                    }}
                    onLayout={(e) => {
                        if (this.state.galleryWidth === undefined) {
                            this.setState({galleryWidth: e.nativeEvent.layout.width}, () => {
                                if (this.state.galleryHeight === undefined) {
                                    this.setGalleryHeight()
                                }
                            })
                        }
                    }}
                >
                <ScrollView
                    style={defaultStyles.fill}
                    contentContainerStyle={{
                        paddingVertical: styleValues.mediumPadding,
                        paddingHorizontal: styleValues.mediumPadding/2,
                        alignItems: "center",
                        justifyContent: "center",
                    }}
                    showsHorizontalScrollIndicator={false}
                    showsVerticalScrollIndicator={false}
                    horizontal={true}
                    /* THIS SHOULD BE SET TO > 1 */
                    scrollEnabled={this.state.images.length > 1}
                >
                    {this.state.images.map((item, index) => this.renderImage(item, index))}
                </ScrollView>
                <GradientView
                    fadeStartColor={this.props.fadeColor}
                    fadeEndColor={this.props.fadeColor}
                    backgroundStartColor={this.props.fadeColor}
                    backgroundEndColor={this.props.fadeColor}
                    horizontal
                />
                </View>
            );
        } else {
            return null
        }
    }
}

const styles = StyleSheet.create({
    gallery: {
        width: "100%",
        overflow: "hidden"
    },
});