/**
 * Wedring Matrimony — PhotoGallery Component
 * Horizontal slider and full-screen preview interface for profile photos
 */
import React, { useState, useMemo } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, Dimensions } from 'react-native';
import { Image } from 'expo-image';
import { colors } from '../../theme';
import { borderRadius } from '../../theme/spacing';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

const PhotoGallery = ({ photos = [], isPremiumUser = false, onPhotoPress }) => {
  const [activeIdx, setActiveIdx] = useState(0);

  const sortedPhotos = useMemo(() => {
    return [...photos].sort((a, b) => {
      if (a.is_primary) return -1;
      if (b.is_primary) return 1;
      return (a.display_order || 0) - (b.display_order || 0);
    });
  }, [photos]);

  const handleScroll = (event) => {
    const slideSize = event.nativeEvent.layoutMeasurement.width;
    const index = event.nativeEvent.contentOffset.x / slideSize;
    const roundIndex = Math.round(index);
    if (roundIndex !== activeIdx) {
      setActiveIdx(roundIndex);
    }
  };

  if (!sortedPhotos || sortedPhotos.length === 0) {
    return (
      <View style={styles.noPhotoContainer}>
        <Text style={styles.noPhotoIcon}>👤</Text>
        <Text style={styles.noPhotoText}>No photos uploaded</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Main Image Slider */}
      <FlatList
        data={sortedPhotos}
        keyExtractor={(item) => item.id}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onScroll={handleScroll}
        scrollEventThrottle={16}
        renderItem={({ item }) => {
          const isBlurred = item.is_private && !isPremiumUser;

          return (
            <TouchableOpacity
              activeOpacity={0.9}
              onPress={() => onPhotoPress?.(item, sortedPhotos)}
              style={styles.slide}
            >
              <Image
                source={{ uri: item.storage_path }}
                style={styles.image}
                contentFit="cover"
                transition={300}
                blurRadius={isBlurred ? 40 : 0}
              />
              {isBlurred && (
                <View style={styles.blurOverlay}>
                  <Text style={styles.lockIcon}>🔒</Text>
                  <Text style={styles.blurText}>Private Photo</Text>
                  <Text style={styles.blurSubtext}>Upgrade to Premium to view</Text>
                </View>
              )}
            </TouchableOpacity>
          );
        }}
      />

      {/* Slide Indicators */}
      {sortedPhotos.length > 1 && (
        <View style={styles.indicatorContainer}>
          {sortedPhotos.map((_, index) => (
            <View
              key={index}
              style={[
                styles.indicator,
                activeIdx === index ? styles.indicatorActive : styles.indicatorInactive
              ]}
            />
          ))}
        </View>
      )}

      {/* Thumbnail Bar */}
      {sortedPhotos.length > 1 && (
        <View style={styles.thumbnailContainer}>
          <FlatList
            data={sortedPhotos}
            keyExtractor={(item) => `thumb-${item.id}`}
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.thumbnailList}
            renderItem={({ item, index }) => (
              <TouchableOpacity
                onPress={() => onPhotoPress?.(item, sortedPhotos)}
                style={[
                  styles.thumbnailWrapper,
                  activeIdx === index && styles.thumbnailWrapperActive
                ]}
              >
                <Image
                  source={{ uri: item.thumbnail_path || item.storage_path }}
                  style={styles.thumbnail}
                  contentFit="cover"
                  blurRadius={item.is_private && !isPremiumUser ? 10 : 0}
                />
              </TouchableOpacity>
            )}
          />
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: '100%',
    backgroundColor: '#000000',
  },
  slide: {
    width: SCREEN_WIDTH,
    height: 380,
    justifyContent: 'center',
    alignItems: 'center',
  },
  image: {
    width: '100%',
    height: '100%',
  },
  noPhotoContainer: {
    width: '100%',
    height: 280,
    backgroundColor: colors.surface,
    justifyContent: 'center',
    alignItems: 'center',
  },
  noPhotoIcon: {
    fontSize: 60,
  },
  noPhotoText: {
    color: colors.textSecondary,
    marginTop: 10,
    fontSize: 14,
    fontWeight: '600',
  },
  indicatorContainer: {
    position: 'absolute',
    bottom: 90,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 6,
  },
  indicator: {
    height: 6,
    borderRadius: 3,
  },
  indicatorActive: {
    width: 18,
    backgroundColor: colors.primary,
  },
  indicatorInactive: {
    width: 6,
    backgroundColor: 'rgba(255, 255, 255, 0.5)',
  },
  blurOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.65)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  lockIcon: {
    fontSize: 32,
    marginBottom: 8,
  },
  blurText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
  },
  blurSubtext: {
    color: 'rgba(255, 255, 255, 0.7)',
    fontSize: 12,
    marginTop: 4,
  },
  thumbnailContainer: {
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    paddingVertical: 12,
  },
  thumbnailList: {
    paddingHorizontal: 16,
    gap: 8,
  },
  thumbnailWrapper: {
    borderWidth: 2,
    borderColor: 'transparent',
    borderRadius: borderRadius.sm,
    overflow: 'hidden',
  },
  thumbnailWrapperActive: {
    borderColor: colors.primary,
  },
  thumbnail: {
    width: 50,
    height: 50,
  },
});

export default PhotoGallery;
