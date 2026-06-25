import React, { useCallback, useMemo } from 'react';
import { FlatList, Platform } from 'react-native';

/**
 * OptimizedList
 * A highly optimized wrapper around React Native's FlatList for rendering 
 * large datasets (10k+ items) smoothly without dropping frames.
 */
const OptimizedList = ({
  data,
  renderItem,
  keyExtractor,
  itemHeight, // Optional: if provided, we use getItemLayout for max performance
  ListEmptyComponent,
  ListHeaderComponent,
  ListFooterComponent,
  onEndReached,
  onEndReachedThreshold = 0.5,
  refreshControl,
  contentContainerStyle,
  ...props
}) => {
  // Default key extractor using id or index
  const defaultKeyExtractor = useCallback(
    (item, index) => (item?.id ? String(item.id) : String(index)),
    []
  );

  // If itemHeight is provided, we can skip measuring layouts entirely
  const getItemLayout = useMemo(() => {
    if (!itemHeight) return undefined;
    return (data, index) => ({
      length: itemHeight,
      offset: itemHeight * index,
      index,
    });
  }, [itemHeight]);

  return (
    <FlatList
      data={data}
      renderItem={renderItem}
      keyExtractor={keyExtractor || defaultKeyExtractor}
      getItemLayout={getItemLayout}
      ListEmptyComponent={ListEmptyComponent}
      ListHeaderComponent={ListHeaderComponent}
      ListFooterComponent={ListFooterComponent}
      onEndReached={onEndReached}
      onEndReachedThreshold={onEndReachedThreshold}
      refreshControl={refreshControl}
      contentContainerStyle={contentContainerStyle}
      // Critical Performance Props:
      removeClippedSubviews={Platform.OS === 'android'} // Frees memory for off-screen items on Android
      maxToRenderPerBatch={10} // Render 10 items per batch
      windowSize={5} // How many screen-heights of items to retain in memory (default 21 is too high)
      initialNumToRender={6} // Render fewer items initially to speed up first paint
      updateCellsBatchingPeriod={50} // 50ms batching period for smoother scrolling
      showsVerticalScrollIndicator={false}
      {...props}
    />
  );
};

export default React.memo(OptimizedList);
