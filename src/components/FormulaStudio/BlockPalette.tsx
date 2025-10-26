import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  Modal,
  FlatList,
} from 'react-native';
import { indicatorCatalog, getCategories } from '../../data/indicatorCatalog';

interface BlockPaletteProps {
  isVisible: boolean;
  onClose: () => void;
  onAddBlock: (blockType: string, indicatorId?: string) => void;
}

export const BlockPalette: React.FC<BlockPaletteProps> = ({
  isVisible,
  onClose,
  onAddBlock,
}) => {
  const categories = getCategories();

  const renderIndicator = ({ item }: { item: any }) => (
    <TouchableOpacity
      style={styles.indicatorItem}
      onPress={() => onAddBlock('indicator', item.id)}
    >
      <Text style={styles.indicatorIcon}>{item.icon}</Text>
      <View style={styles.indicatorInfo}>
        <Text style={styles.indicatorName}>{item.name}</Text>
        <Text style={styles.indicatorDescription} numberOfLines={2}>
          {item.description}
        </Text>
      </View>
    </TouchableOpacity>
  );

  const renderCategory = ({ item: category }: { item: string }) => {
    const indicators = indicatorCatalog.filter(ind => ind.category === category);
    
    return (
      <View style={styles.categorySection}>
        <Text style={styles.categoryTitle}>{category}</Text>
        <FlatList
          data={indicators}
          renderItem={renderIndicator}
          keyExtractor={(item) => item.id}
          scrollEnabled={false}
        />
      </View>
    );
  };

  const renderBlockType = (type: string, title: string, description: string, icon: string) => (
    <TouchableOpacity
      key={type}
      style={styles.blockTypeItem}
      onPress={() => onAddBlock(type)}
    >
      <Text style={styles.blockTypeIcon}>{icon}</Text>
      <View style={styles.blockTypeInfo}>
        <Text style={styles.blockTypeName}>{title}</Text>
        <Text style={styles.blockTypeDescription}>{description}</Text>
      </View>
    </TouchableOpacity>
  );

  return (
    <Modal
      visible={isVisible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={onClose}
    >
      <View style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={onClose} style={styles.closeButton}>
            <Text style={styles.closeText}>Done</Text>
          </TouchableOpacity>
          <Text style={styles.title}>Add Block</Text>
          <View style={styles.placeholder} />
        </View>

        <ScrollView style={styles.content}>
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Block Types</Text>
            {renderBlockType('signal', 'Signal', 'Generate buy/sell signals', '⚡')}
            {renderBlockType('condition', 'Condition', 'Logical conditions (AND/OR)', '🔗')}
            {renderBlockType('action', 'Action', 'Execute trading actions', '🎯')}
            {renderBlockType('group', 'Group', 'Group related blocks', '📁')}
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Technical Indicators</Text>
            <FlatList
              data={categories}
              renderItem={renderCategory}
              keyExtractor={(item) => item}
              scrollEnabled={false}
            />
          </View>
        </ScrollView>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F2F2F7',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E5EA',
  },
  closeButton: {
    paddingVertical: 8,
    paddingHorizontal: 12,
  },
  closeText: {
    fontSize: 17,
    color: '#007AFF',
    fontWeight: '600',
  },
  title: {
    fontSize: 17,
    fontWeight: '600',
    color: '#1C1C1E',
  },
  placeholder: {
    width: 60,
  },
  content: {
    flex: 1,
    padding: 16,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#1C1C1E',
    marginBottom: 12,
  },
  blockTypeItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  blockTypeIcon: {
    fontSize: 24,
    marginRight: 16,
  },
  blockTypeInfo: {
    flex: 1,
  },
  blockTypeName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1C1C1E',
    marginBottom: 4,
  },
  blockTypeDescription: {
    fontSize: 14,
    color: '#8E8E93',
    lineHeight: 18,
  },
  categorySection: {
    marginBottom: 16,
  },
  categoryTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1C1C1E',
    marginBottom: 8,
    marginTop: 8,
  },
  indicatorItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    padding: 12,
    marginBottom: 6,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 1,
    elevation: 1,
  },
  indicatorIcon: {
    fontSize: 20,
    marginRight: 12,
  },
  indicatorInfo: {
    flex: 1,
  },
  indicatorName: {
    fontSize: 14,
    fontWeight: '500',
    color: '#1C1C1E',
    marginBottom: 2,
  },
  indicatorDescription: {
    fontSize: 12,
    color: '#8E8E93',
    lineHeight: 16,
  },
});